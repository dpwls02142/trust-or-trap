/**
 * Trust or Trap — core domain types
 * @see docs/technical-architecture.md
 * @see docs/domain-glossary.md
 */

export type RiskFlag = "safe" | "warn" | "danger" | "neutral";

export type EndingType = "safe" | "warn" | "danger";

export type AppType =
  | "chat"
  | "sms"
  | "call"
  | "bank"
  | "instagram"
  | "dating";

export type PersonaCode =
  | "teen-female"
  | "teen-male"
  | "twenties-female"
  | "twenties-male"
  | "midlife"
  | "fifties"
  | "senior";

export type ScenarioId =
  | "teen-female-grooming"
  | "teen-male-game-scam"
  | "twenties-female-romance"
  | "twenties-male-voice-phishing"
  | "midlife-investment-scam"
  | "fifties-loan-phishing"
  | "senior-institution-phishing";

export interface UserProfile {
  displayName: string;
  ageGroup: PersonaCode;
  gender: "female" | "male";
}

export interface ScenarioNode {
  node_id: string;
  app_type: AppType;
  required_risk_signal: string;
  forbidden_content: string[];
  next_node_map: Partial<Record<RiskFlag, string>>;
  timer_seconds?: number;
  voice_enabled?: boolean;
  ending_type?: EndingType;
  report_signals?: string[];
}

export interface ScenarioGraph {
  scenario_id: ScenarioId;
  title: string;
  persona: PersonaCode;
  crime_category: string;
  start_node_id: string;
  nodes: ScenarioNode[];
}

export interface LlmMessagePayload {
  message: string;
  sender: string;
  options: Array<{ id: string; label: string }>;
  risk_flags: RiskFlag[];
}

export interface JudgeResult {
  riskFlag: RiskFlag;
  nextNodeId: string;
}

export interface ChatMessage {
  id: string;
  sender: string;
  text: string;
  timestamp: number;
}
