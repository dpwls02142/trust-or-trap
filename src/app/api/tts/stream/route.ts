import { NextRequest } from "next/server";
import { ttsStreamRequestSchema } from "@/lib/scenario/schemas";
import {
  isVoiceEnabledScenario,
  resolveScenarioVoice,
} from "@/lib/scenario/voice-mapping";
import { isRateLimited, resolveClientKey } from "@/lib/server/rate-limiter";
import {
  isSpeakableTtsText,
  prepareSentenceTextForTts,
} from "@/lib/tts/tts-speech-text";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

const typecastStreamEndpoint = "https://api.typecast.ai/v1/text-to-speech/stream";

/**
 * POST /api/tts/stream — 문장 단위 텍스트를 Typecast 스트리밍 TTS로 프록시.
 * 오디오 청크를 도착 즉시 흘려보낸다(통 재생 금지 → 첫 소리 지연 최소화).
 * teen 시나리오 요청은 정책상 무조건 거부한다(미성년자 음성 미적용 불변 원칙).
 */
export async function POST(request: NextRequest) {
  if (isRateLimited(`tts:${resolveClientKey(request)}`, 60)) {
    return Response.json({ errorMessage: "요청이 너무 많습니다" }, { status: 429 });
  }

  const parsedBody = ttsStreamRequestSchema.safeParse(await request.json().catch(() => null));
  if (!parsedBody.success) {
    return Response.json(
      { errorMessage: "잘못된 요청 형식", issues: parsedBody.error.issues },
      { status: 400 },
    );
  }

  const { scenarioId, sentenceText, previousText } = parsedBody.data;

  const preparedSentenceText = prepareSentenceTextForTts(sentenceText);
  if (!isSpeakableTtsText(preparedSentenceText)) {
    return Response.json(
      { errorMessage: "읽을 수 있는 문장이 없습니다" },
      { status: 400 },
    );
  }
  const preparedPreviousText = prepareSentenceTextForTts(previousText ?? "");

  if (!isVoiceEnabledScenario(scenarioId)) {
    return Response.json(
      { errorMessage: "teen 시나리오는 음성을 지원하지 않습니다" },
      { status: 403 },
    );
  }

  const typecastApiKey = process.env.TYPECAST_API_KEY;
  const defaultVoiceId = process.env.TYPECAST_DEFAULT_VOICE_ID;
  if (!typecastApiKey || !defaultVoiceId) {
    return Response.json({ errorMessage: "TTS 설정이 없습니다" }, { status: 503 });
  }

  const voicePreset = resolveScenarioVoice(scenarioId);

  const typecastResponse = await fetch(typecastStreamEndpoint, {
    method: "POST",
    headers: {
      "X-API-KEY": typecastApiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      text: preparedSentenceText,
      model: "ssfm-v30",
      voice_id: voicePreset?.voiceId ?? defaultVoiceId,
      prompt: {
        emotion_type: voicePreset?.emotionPreset ?? "smart",
        previous_text: preparedPreviousText,
        next_text: "",
      },
      output: { audio_format: "mp3", target_lufs: -14.0 },
    }),
  });

  if (!typecastResponse.ok || !typecastResponse.body) {
    console.error("[tts] Typecast 응답 실패:", typecastResponse.status);
    return Response.json({ errorMessage: "TTS 생성에 실패했습니다" }, { status: 502 });
  }

  // Typecast 오디오 스트림을 그대로 통과시킨다 (버퍼링 없음)
  return new Response(typecastResponse.body, {
    headers: {
      "Content-Type": "audio/mpeg",
      "Cache-Control": "no-store",
    },
  });
}
