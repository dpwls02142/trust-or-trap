import type { PersonaCode, ScenarioId, UserProfile } from "./types";

const DEFAULT_SCENARIO_MAP: Record<PersonaCode, ScenarioId> = {
  "teen-female": "teen-female-grooming",
  "teen-male": "teen-male-game-scam",
  "twenties-female": "twenties-female-romance",
  "twenties-male": "twenties-male-voice-phishing",
  midlife: "midlife-investment-scam",
  fifties: "fifties-loan-phishing",
  senior: "senior-institution-phishing",
};

/** Always available as alternate scenario */
export const ALTERNATE_SCENARIOS: ScenarioId[] = [
  "midlife-investment-scam",
];

export function resolvePersonaCode(age: number, gender: "female" | "male"): PersonaCode {
  if (age < 20) return gender === "female" ? "teen-female" : "teen-male";
  if (age < 30) return gender === "female" ? "twenties-female" : "twenties-male";
  if (age < 50) return "midlife";
  if (age < 60) return "fifties";
  return "senior";
}

export function matchDefaultScenario(profile: UserProfile): ScenarioId {
  return DEFAULT_SCENARIO_MAP[profile.ageGroup];
}

export function getAlternateScenarios(
  defaultScenario: ScenarioId
): ScenarioId[] {
  return ALTERNATE_SCENARIOS.filter((id) => id !== defaultScenario);
}
