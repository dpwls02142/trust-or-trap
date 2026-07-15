import type { PublicNodeView } from "@/lib/scenario/public-node";

/** 키패드 입력·그래프 번호 비교용 — 숫자만 남긴다. */
export function normalizeDialDigits(rawDigits: string): string {
  return rawDigits.replace(/\D/g, "");
}

type DialDisplayFormat = "seoul" | "mobile" | "short";

/** 입력 초반 숫자로 표시·입력 한도 형식을 결정한다. */
export function resolveDialDisplayFormat(digitOnly: string): DialDisplayFormat {
  if (digitOnly.startsWith("02")) return "seoul";
  if (digitOnly.startsWith("01")) return "mobile";
  return "short";
}

/** 형식별 최대 숫자 자릿수 — short(1588-1688)는 8자리, 그 외는 11자리 */
export function resolveDialDigitLimit(digitOnly: string): number {
  return resolveDialDisplayFormat(digitOnly) === "short" ? 8 : 11;
}

/**
 * 키패드 표시용 번호 포맷.
 * - mobile(010 등): 010-1234-1234
 * - short(1588 등): 1588-1688
 * - seoul(02): 02-123-4567 / 02-1234-5678
 */
export function formatDialDisplayNumber(rawDigits: string): string {
  const digitOnly = normalizeDialDigits(rawDigits);
  if (digitOnly.length === 0) return "";

  const displayFormat = resolveDialDisplayFormat(digitOnly);

  if (displayFormat === "seoul") {
    if (digitOnly.length <= 2) return digitOnly;
    if (digitOnly.length <= 5) {
      return `${digitOnly.slice(0, 2)}-${digitOnly.slice(2)}`;
    }
    if (digitOnly.length <= 9) {
      return `${digitOnly.slice(0, 2)}-${digitOnly.slice(2, 5)}-${digitOnly.slice(5)}`;
    }
    return `${digitOnly.slice(0, 2)}-${digitOnly.slice(2, 6)}-${digitOnly.slice(6, 10)}`;
  }

  if (displayFormat === "mobile") {
    if (digitOnly.length <= 3) return digitOnly;
    if (digitOnly.length <= 7) {
      return `${digitOnly.slice(0, 3)}-${digitOnly.slice(3)}`;
    }
    return `${digitOnly.slice(0, 3)}-${digitOnly.slice(3, 7)}-${digitOnly.slice(7, 11)}`;
  }

  if (digitOnly.length <= 4) return digitOnly;
  return `${digitOnly.slice(0, 4)}-${digitOnly.slice(4, 8)}`;
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

/** 다음 call 노드가 키패드 발신을 요구하는지 */
export function nextNodeRequiresOutboundDial(node: PublicNodeView): boolean {
  return node.app_type === "call" && !!node.outbound_dial_number;
}
