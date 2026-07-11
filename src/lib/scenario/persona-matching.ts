import type {
  AgeBand,
  GenderValue,
  PersonaCode,
  PersonaMatchResult,
  ScenarioId,
} from "./types";

/**
 * 온보딩 입력 → 페르소나 코드 → 기본 시나리오 + 대체 선택지 매칭.
 * 순수 함수로만 구성 (docs/product-planning.md §6, glossary §1).
 */

export function resolveAgeBand(userAge: number): AgeBand {
  if (userAge <= 19) return "teen";
  if (userAge <= 29) return "twenties";
  if (userAge <= 49) return "middle";
  if (userAge <= 59) return "fifties";
  return "senior";
}

export function buildPersonaCode(userAge: number, gender: GenderValue): PersonaCode {
  return `${resolveAgeBand(userAge)}-${gender}`;
}

interface ScenarioMatchEntry {
  primaryScenarioId: ScenarioId;
  alternativeScenarioIds: ScenarioId[];
}

const personaScenarioTable: Record<PersonaCode, ScenarioMatchEntry> = {
  "teen-female": {
    primaryScenarioId: "teen-female-grooming",
    alternativeScenarioIds: ["teen-male-gameitem"],
  },
  "teen-male": {
    primaryScenarioId: "teen-male-gameitem",
    alternativeScenarioIds: ["teen-female-grooming"],
  },
  "twenties-female": {
    primaryScenarioId: "twenties-female-romance",
    alternativeScenarioIds: ["twenties-male-voicephishing", "middle-invest-scam"],
  },
  "twenties-male": {
    primaryScenarioId: "twenties-male-voicephishing",
    alternativeScenarioIds: ["middle-invest-scam"],
  },
  "middle-female": {
    primaryScenarioId: "middle-invest-scam",
    alternativeScenarioIds: ["twenties-female-romance"],
  },
  "middle-male": {
    primaryScenarioId: "middle-invest-scam",
    alternativeScenarioIds: ["fifties-loan-scam"],
  },
  "fifties-female": {
    primaryScenarioId: "fifties-loan-scam",
    alternativeScenarioIds: ["middle-invest-scam"],
  },
  "fifties-male": {
    primaryScenarioId: "fifties-loan-scam",
    alternativeScenarioIds: ["middle-invest-scam"],
  },
  "senior-female": {
    primaryScenarioId: "senior-authority-scam",
    alternativeScenarioIds: ["twenties-female-romance", "middle-invest-scam"],
  },
  "senior-male": {
    primaryScenarioId: "senior-authority-scam",
    alternativeScenarioIds: ["middle-invest-scam"],
  },
};

export function matchPersonaScenario(
  userAge: number,
  gender: GenderValue,
): PersonaMatchResult {
  const personaCode = buildPersonaCode(userAge, gender);
  const matchEntry = personaScenarioTable[personaCode];

  // 투자리딩방은 전 연령·성별 대상 → 성인 페르소나 대체 선택지에 항상 포함.
  // 단, teen 페르소나는 teen 전용 시나리오만 노출한다(콘텐츠 안전).
  const isTeenPersona = personaCode.startsWith("teen-");
  const shouldAppendInvestScam =
    !isTeenPersona &&
    matchEntry.primaryScenarioId !== "middle-invest-scam" &&
    !matchEntry.alternativeScenarioIds.includes("middle-invest-scam");

  const alternativeScenarioIds = shouldAppendInvestScam
    ? [...matchEntry.alternativeScenarioIds, "middle-invest-scam" as ScenarioId]
    : matchEntry.alternativeScenarioIds;

  return {
    personaCode,
    primaryScenarioId: matchEntry.primaryScenarioId,
    alternativeScenarioIds,
  };
}
