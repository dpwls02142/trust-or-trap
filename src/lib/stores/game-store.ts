"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { GameStore } from "./game-store.types";
import { initialGameState } from "./game-store.types";

export const useGameStore = create<GameStore>()(
  persist(
    (set) => ({
      ...initialGameState,
      setUserProfile: (profile) => set({ userProfile: profile }),
      startScenario: (scenarioId, startNodeId) =>
        set({
          scenarioId,
          currentNodeId: startNodeId,
          messageHistory: [],
          accumulatedRiskFlags: [],
        }),
      setCurrentNode: (node) =>
        set({ currentNode: node, currentNodeId: node.node_id }),
      appendMessage: (message) =>
        set((state) => ({
          messageHistory: [...state.messageHistory, message],
        })),
      addRiskFlag: (flag) =>
        set((state) => ({
          accumulatedRiskFlags: [...state.accumulatedRiskFlags, flag],
        })),
      setIsStreaming: (streaming) => set({ isStreaming: streaming }),
      resetSession: () => set(initialGameState),
    }),
    { name: "trust-or-trap-session" }
  )
);
