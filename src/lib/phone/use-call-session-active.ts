"use client";

import { useGameStore } from "@/lib/stores/game-store";
import { resolveIsCallSessionActive } from "@/lib/phone/call-session";

/** 전역 통화 세션 여부 — PhoneFrame 등 어디서든 동일하게 구독 */
export function useCallSessionActive(): boolean {
  return useGameStore((storeState) =>
    resolveIsCallSessionActive({
      gamePhase: storeState.gamePhase,
      activeScenarioId: storeState.activeScenarioId,
      currentNode: storeState.currentNode,
    }),
  );
}
