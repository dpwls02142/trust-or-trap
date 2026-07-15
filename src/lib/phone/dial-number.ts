import type { PublicNodeView } from "@/lib/scenario/public-node";

/** 키패드 입력·그래프 번호 비교용 — 숫자만 남긴다. */
export function normalizeDialDigits(rawDigits: string): string {
  return rawDigits.replace(/\D/g, "");
}

export function dialNumbersMatch(
  dialedRawDigits: string,
  targetRawDigits: string,
): boolean {
  return (
    normalizeDialDigits(dialedRawDigits) === normalizeDialDigits(targetRawDigits)
  );
}

/** call 노드에서 플레이어가 직접 번호를 눌러 연결해야 하는지 */
export function isAwaitingOutboundDial(
  currentNode: PublicNodeView | null,
  hasCompletedOutboundDial: boolean,
): boolean {
  return (
    !!currentNode?.outbound_dial_number &&
    currentNode.app_type === "call" &&
    !hasCompletedOutboundDial
  );
}
