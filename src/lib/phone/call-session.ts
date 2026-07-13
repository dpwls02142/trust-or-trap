import type { GamePhase } from "@/lib/stores/game-store";
import type { PublicNodeView } from "@/lib/scenario/public-node";
import type { ScenarioId } from "@/lib/scenario/types";

interface CallSessionStateSlice {
  gamePhase: GamePhase;
  activeScenarioId: ScenarioId | null;
  currentNode: PublicNodeView | null;
}

/**
 * 시나리오 그래프의 call 노드가 활성인 동안 통화 세션을 유지한다.
 * 홈·다른 앱 셸로 나가도 currentNode는 그대로이므로 상태바 표시가 유지된다.
 */
export function resolveIsCallSessionActive({
  gamePhase,
  activeScenarioId,
  currentNode,
}: CallSessionStateSlice): boolean {
  return (
    gamePhase !== "onboarding" &&
    gamePhase !== "ending" &&
    activeScenarioId != null &&
    currentNode != null &&
    currentNode.app_type === "call" &&
    !currentNode.is_ending
  );
}
