"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { PublicNodeView } from "@/lib/scenario/public-node";
import type {
  ChatHistoryEntry,
  EndingType,
  RiskFlag,
  RiskSignalRecord,
  ScenarioId,
  UserProfile,
} from "@/lib/scenario/types";

/**
 * 게임 전역 상태 (Zustand + localStorage persist).
 * 진행 상태를 localStorage에 저장해 새로고침해도 이어서 플레이 가능.
 * 선택자 기반 구독으로 불필요한 리렌더를 방지한다.
 */

export type GamePhase = "onboarding" | "home" | "playing" | "ending";

interface GameStoreState {
  gamePhase: GamePhase;
  userProfile: UserProfile | null;
  activeScenarioId: ScenarioId | null;
  scenarioTitle: string;
  scenarioVoiceEnabled: boolean;
  currentNode: PublicNodeView | null;
  chatHistory: ChatHistoryEntry[];
  riskSignalRecords: RiskSignalRecord[];
  endingType: EndingType | null;

  setUserProfile: (profileValue: UserProfile) => void;
  startScenario: (payload: {
    scenarioId: ScenarioId;
    scenarioTitle: string;
    voiceEnabled: boolean;
    entryNode: PublicNodeView;
  }) => void;
  enterCurrentApp: () => void;
  exitToHome: () => void;
  appendChatEntry: (entryValue: ChatHistoryEntry) => void;
  advanceToNode: (nextNode: PublicNodeView, judgedFlag: RiskFlag) => void;
  resetGame: () => void;
}

export const useGameStore = create<GameStoreState>()(
  persist(
    (setState, getState) => ({
      gamePhase: "onboarding",
      userProfile: null,
      activeScenarioId: null,
      scenarioTitle: "",
      scenarioVoiceEnabled: false,
      currentNode: null,
      chatHistory: [],
      riskSignalRecords: [],
      endingType: null,

      setUserProfile: (profileValue) => setState({ userProfile: profileValue }),

      startScenario: ({ scenarioId, scenarioTitle, voiceEnabled, entryNode }) =>
        setState({
          gamePhase: "home",
          activeScenarioId: scenarioId,
          scenarioTitle,
          scenarioVoiceEnabled: voiceEnabled,
          currentNode: entryNode,
          chatHistory: [],
          riskSignalRecords: [],
          endingType: null,
        }),

      enterCurrentApp: () => setState({ gamePhase: "playing" }),

      exitToHome: () => setState({ gamePhase: "home" }),

      appendChatEntry: (entryValue) =>
        setState({ chatHistory: [...getState().chatHistory, entryValue] }),

      advanceToNode: (nextNode, judgedFlag) => {
        const { currentNode, riskSignalRecords } = getState();
        const newRecord: RiskSignalRecord | null = currentNode
          ? {
              nodeId: currentNode.node_id,
              requiredRiskSignal: currentNode.required_risk_signal,
              userRiskFlag: judgedFlag,
            }
          : null;

        setState({
          currentNode: nextNode,
          riskSignalRecords: newRecord
            ? [...riskSignalRecords, newRecord]
            : riskSignalRecords,
          ...(nextNode.is_ending
            ? { gamePhase: "ending" as GamePhase, endingType: nextNode.ending_type }
            : {}),
        });
      },

      resetGame: () =>
        setState({
          gamePhase: "onboarding",
          activeScenarioId: null,
          scenarioTitle: "",
          scenarioVoiceEnabled: false,
          currentNode: null,
          chatHistory: [],
          riskSignalRecords: [],
          endingType: null,
        }),
    }),
    { name: "trust-or-trap-progress" },
  ),
);
