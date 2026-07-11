import type { ScenarioId } from "./types";

/**
 * 페르소나별 Typecast 보이스 매핑 (docs/technical-architecture.md §6).
 * voice_id는 Typecast /v2/voices에서 성별/연령대/사용사례로 필터링해 지정한다.
 * 미지정 시 TYPECAST_DEFAULT_VOICE_ID 환경변수로 폴백.
 * teen 시나리오는 음성 미적용이므로 이 매핑에 존재하지 않는다.
 */

interface VoicePresetEntry {
  /** Typecast voice_id — 비워두면 TYPECAST_DEFAULT_VOICE_ID 사용 */
  voiceId: string | null;
  /** 기본 감정 프리셋. "smart" = 문맥 기반 자동 조절 */
  emotionPreset: string;
}

const scenarioVoiceTable: Partial<Record<ScenarioId, VoicePresetEntry>> = {
  "twenties-female-romance": { voiceId: null, emotionPreset: "smart" },
  "twenties-male-voicephishing": { voiceId: null, emotionPreset: "smart" },
  "middle-invest-scam": { voiceId: null, emotionPreset: "smart" },
  "fifties-loan-scam": { voiceId: null, emotionPreset: "smart" },
  "senior-authority-scam": { voiceId: null, emotionPreset: "smart" },
};

export function resolveScenarioVoice(scenarioId: ScenarioId): VoicePresetEntry | null {
  return scenarioVoiceTable[scenarioId] ?? null;
}

export function isVoiceEnabledScenario(scenarioId: ScenarioId): boolean {
  return !scenarioId.startsWith("teen-");
}
