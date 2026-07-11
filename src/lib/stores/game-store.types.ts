import type {
  ChatMessage,
  RiskFlag,
  ScenarioId,
  ScenarioNode,
  UserProfile,
} from "@/lib/scenario/types";

interface GameState {
  userProfile: UserProfile | null;
  scenarioId: ScenarioId | null;
  currentNodeId: string | null;
  currentNode: ScenarioNode | null;
  messageHistory: ChatMessage[];
  accumulatedRiskFlags: RiskFlag[];
  isStreaming: boolean;
}

interface GameActions {
  setUserProfile: (profile: UserProfile) => void;
  startScenario: (scenarioId: ScenarioId, startNodeId: string) => void;
  setCurrentNode: (node: ScenarioNode) => void;
  appendMessage: (message: ChatMessage) => void;
  addRiskFlag: (flag: RiskFlag) => void;
  setIsStreaming: (streaming: boolean) => void;
  resetSession: () => void;
}

export type GameStore = GameState & GameActions;

export const initialGameState: GameState = {
  userProfile: null,
  scenarioId: null,
  currentNodeId: null,
  currentNode: null,
  messageHistory: [],
  accumulatedRiskFlags: [],
  isStreaming: false,
};
