import type { GamePhase } from "@/lib/stores/game-store";
import type { PublicNodeView } from "@/lib/scenario/public-node";
import type { ScenarioId } from "@/lib/scenario/types";

interface CallSessionStateSlice {
  gamePhase: GamePhase;
  activeScenarioId: ScenarioId | null;
  currentNode: PublicNodeView | null;
  isCallConnected: boolean;
}

/**
 * CallScreen에 실제 연결된 뒤에만 통화 세션을 활성화한다.
 * call 노드이지만 키패드 발신 대기 중이면 표시하지 않는다.
 */
export function resolveIsCallSessionActive({
  gamePhase,
  activeScenarioId,
  currentNode,
  isCallConnected,
}: CallSessionStateSlice): boolean {
  return (
    gamePhase !== "onboarding" &&
    gamePhase !== "ending" &&
    activeScenarioId != null &&
    currentNode != null &&
    currentNode.app_type === "call" &&
    !currentNode.is_ending &&
    isCallConnected
  );
}
