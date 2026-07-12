import type { ScenarioId } from "./types";

/**
 * 시나리오·발신자별 프로필 이미지 경로 (public/ 정적 에셋).
 * 그래프의 sender_name과 1:1로 매핑해 앱 헤더 아바타에 사용한다.
 */
const senderAvatarByScenario: Record<ScenarioId, Record<string, string>> = {
  "teen-female-grooming": {
    hyun_98: "/teen_male.jpg",
    현오빠: "/teen_male.jpg",
  },
  "teen-male-gameitem": {
    아이템창고: "/teen_game_male.jpg",
  },
  "twenties-female-romance": {
    도현: "/twenties_male.jpg",
  },
  "twenties-male-voicephishing": {
    "김상담 대리": "/leading.jpg",
    한빛캐피탈: "/leading.jpg",
  },
  "middle-invest-scam": {
    VIP투자연구소: "/leading.jpg",
  },
  "fifties-loan-scam": {
    박주임: "/leading.jpg",
    서민금융지원: "/leading.jpg",
  },
  "senior-authority-scam": {
    김수사관: "/leading.jpg",
    딸: "/twenties_female.jpg",
  },
};

export function resolveSenderAvatarPath(
  scenarioId: ScenarioId | null,
  senderName: string,
): string | null {
  if (!scenarioId) return null;
  return senderAvatarByScenario[scenarioId][senderName] ?? null;
}
