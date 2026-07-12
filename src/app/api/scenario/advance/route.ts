import { NextRequest } from "next/server";
import { findScenarioNode } from "@/lib/scenario/graph-loader";
import { advancePayloadSchema, advanceRequestSchema } from "@/lib/scenario/schemas";
import { applySafetyFilter, detectTeenUnsafeContent } from "@/lib/scenario/safety-filter";
import {
  buildAdvanceSystemPrompt,
  buildAdvanceUserPrompt,
  getGeminiClient,
  isQuotaOrOverloadError,
  resolveGeminiFallbackModel,
  resolveGeminiModel,
  resolveThinkingConfig,
} from "@/lib/server/gemini-client";
import { isRateLimited, resolveClientKey } from "@/lib/server/rate-limiter";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
// Vercel 서버리스 함수 실행 상한 — SSE 스트리밍이 끊기지 않도록 확보
export const maxDuration = 60;

/**
 * POST /api/scenario/advance — 현재 노드의 대사를 Gemini로 생성해 SSE로 스트리밍.
 *
 * SSE 이벤트 프로토콜:
 *  - event: delta   → data: {"text": "..."}  (message의 증분 텍스트, 문장 단위 안전필터 통과분)
 *  - event: payload → data: AdvancePayload    (검증·안전필터 통과한 최종 구조화 JSON)
 *  - event: error   → data: {"errorMessage": "..."}
 *
 * 성능: Gemini 토큰 스트림에서 "message" 문자열 값만 증분 추출하고,
 * 문장이 완성되는 즉시 안전 필터를 거쳐 전달한다(첫 문장 지연 최소화 + 필터 우회 방지).
 * responseMimeType: "application/json" + thinking 비활성화로 첫 토큰 지연을 줄이고,
 * 최종 payload는 전체 JSON 누적 후 Zod 검증 + 안전 필터를 거쳐 1회 전송한다.
 */
export async function POST(request: NextRequest) {
  if (isRateLimited(`advance:${resolveClientKey(request)}`, 20)) {
    return Response.json({ errorMessage: "요청이 너무 많습니다" }, { status: 429 });
  }

  const parsedBody = advanceRequestSchema.safeParse(await request.json().catch(() => null));
  if (!parsedBody.success) {
    return Response.json(
      { errorMessage: "잘못된 요청 형식", issues: parsedBody.error.issues },
      { status: 400 },
    );
  }

  const { scenarioId, nodeId, chatHistory, userProfile } = parsedBody.data;

  let currentNode;
  try {
    currentNode = findScenarioNode(scenarioId, nodeId);
  } catch {
    return Response.json({ errorMessage: "존재하지 않는 시나리오/노드" }, { status: 404 });
  }

  const geminiClient = getGeminiClient();
  const textEncoder = new TextEncoder();
  const isTeenScenario = scenarioId.startsWith("teen-");
  const sentenceBoundaryRegex = /[.!?。…]["')\]]?(\s|$)|\n/;

  const sseStream = new ReadableStream<Uint8Array>({
    async start(streamController) {
      const emitEvent = (eventName: string, dataValue: unknown) => {
        streamController.enqueue(
          textEncoder.encode(`event: ${eventName}\ndata: ${JSON.stringify(dataValue)}\n\n`),
        );
      };

      try {
        // thinking 토큰이 maxOutputTokens에 포함되므로 여유 있게 확보 (부족 시 JSON이 잘림)
        const requestStreamWithModel = (modelName: string) =>
          geminiClient.models.generateContentStream({
            model: modelName,
            contents: buildAdvanceUserPrompt(chatHistory, userProfile),
            config: {
              systemInstruction: buildAdvanceSystemPrompt(currentNode, userProfile),
              maxOutputTokens: 2048,
              responseMimeType: "application/json",
              thinkingConfig: resolveThinkingConfig(modelName),
            },
          });

        let responseStream;
        try {
          responseStream = await requestStreamWithModel(resolveGeminiModel());
        } catch (primaryModelError) {
          // 무료 티어 쿼터(429)/일시 과부하(503) → 쿼터가 모델별로 분리된 대체 모델로 재시도
          if (!isQuotaOrOverloadError(primaryModelError)) throw primaryModelError;
          console.warn(
            `[advance] 기본 모델 쿼터/과부하 — ${resolveGeminiFallbackModel()}로 폴백`,
          );
          responseStream = await requestStreamWithModel(resolveGeminiFallbackModel());
        }

        // "message" 문자열 값만 증분 추출하는 경량 상태 추적기.
        // 전체 JSON 파싱을 매 토큰마다 하지 않으므로 토큰당 O(토큰 길이).
        let accumulatedRawText = "";
        let insideMessageValue = false;
        let messageValueDone = false;
        let escapeNext = false;
        // delta는 문장 단위로 안전 필터를 거친 뒤 내보낸다 (필터 우회 방지)
        let pendingSentenceBuffer = "";
        let unsafeContentDetected = false;

        const emitFilteredSentence = (sentenceText: string) => {
          if (unsafeContentDetected || !sentenceText) return;
          if (isTeenScenario && detectTeenUnsafeContent(sentenceText)) {
            unsafeContentDetected = true;
            return;
          }
          emitEvent("delta", { text: applySafetyFilter(sentenceText) });
        };

        const flushCompleteSentences = () => {
          let boundaryMatch = pendingSentenceBuffer.match(sentenceBoundaryRegex);
          while (boundaryMatch && boundaryMatch.index !== undefined) {
            const boundaryEnd = boundaryMatch.index + boundaryMatch[0].length;
            emitFilteredSentence(pendingSentenceBuffer.slice(0, boundaryEnd));
            pendingSentenceBuffer = pendingSentenceBuffer.slice(boundaryEnd);
            boundaryMatch = pendingSentenceBuffer.match(sentenceBoundaryRegex);
          }
        };

        const consumeTextDelta = (textDelta: string) => {
          accumulatedRawText += textDelta;

          if (messageValueDone) return;

          if (!insideMessageValue) {
            const messageKeyMatch = accumulatedRawText.match(/"message"\s*:\s*"/);
            if (!messageKeyMatch) return;
            insideMessageValue = true;
            // 키 이후에 이미 도착해 있는 값 부분부터 처리
            textDelta = accumulatedRawText.slice(
              (messageKeyMatch.index ?? 0) + messageKeyMatch[0].length,
            );
          }

          for (const currentChar of textDelta) {
            if (escapeNext) {
              pendingSentenceBuffer +=
                currentChar === "n" ? "\n" : currentChar === "t" ? "\t" : currentChar;
              escapeNext = false;
              continue;
            }
            if (currentChar === "\\") {
              escapeNext = true;
              continue;
            }
            if (currentChar === '"') {
              messageValueDone = true;
              break;
            }
            pendingSentenceBuffer += currentChar;
          }
          flushCompleteSentences();
        };

        for await (const streamChunk of responseStream) {
          const chunkText = streamChunk.text;
          if (chunkText) consumeTextDelta(chunkText);
        }
        emitFilteredSentence(pendingSentenceBuffer);
        pendingSentenceBuffer = "";

        // 최종 구조화 JSON 검증 (혹시 모를 코드펜스 제거 후 파싱)
        const cleanedJsonText = accumulatedRawText
          .replace(/^```(?:json)?\s*/i, "")
          .replace(/\s*```\s*$/, "")
          .trim();
        const parsedPayload = advancePayloadSchema.parse(JSON.parse(cleanedJsonText));

        if (isTeenScenario && detectTeenUnsafeContent(parsedPayload.message)) {
          unsafeContentDetected = true;
        }
        if (unsafeContentDetected) {
          emitEvent("error", {
            errorMessage: "안전 기준에 맞지 않는 응답이 감지되어 중단했습니다. 다시 시도해주세요.",
          });
          return;
        }

        emitEvent("payload", {
          ...parsedPayload,
          message: applySafetyFilter(parsedPayload.message),
          sender: currentNode.sender_name,
        });
      } catch (streamError) {
        console.error("[advance] 스트리밍 실패:", streamError);
        emitEvent("error", { errorMessage: "대사 생성에 실패했습니다. 다시 시도해주세요." });
      } finally {
        streamController.close();
      }
    },
  });

  return new Response(sseStream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
