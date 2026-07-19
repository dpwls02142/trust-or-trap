import type { ChatHistoryEntry, NodeOption, RiskFlag } from "@/lib/scenario/types";

const fakeBankNameList = [
  "국민은행",
  "신한은행",
  "우리은행",
  "하나은행",
  "NH농협은행",
  "카카오뱅크",
  "토스뱅크",
] as const;

export const defaultBankAccountBalanceLabel = "3,481,200원";
export const defaultBankAccountNumberLabel = "110-234-***802";
export const defaultBankBrandName = "한빛은행";

export const transferAmountUnitList = [
  { unitLabel: "1만", unitWonValue: 10_000 },
  { unitLabel: "10만", unitWonValue: 100_000 },
  { unitLabel: "100만", unitWonValue: 1_000_000 },
] as const;

export function resolveBankOptionLabel(
  optionList: NodeOption[],
  riskFlag: RiskFlag,
): string | null {
  return optionList.find((optionItem) => optionItem.risk_flag === riskFlag)?.label ?? null;
}

/** 이체 확인 시 금액 규모에 따라 caution/risky 선택지를 고른다. */
export function resolveTransferSubmitOptionLabel(
  optionList: NodeOption[],
  transferWon: number,
  requestedWonHint: number,
): string | null {
  const riskyLabel = resolveBankOptionLabel(optionList, "risky");
  const cautionLabel = resolveBankOptionLabel(optionList, "caution");
  if (!riskyLabel && !cautionLabel) return null;

  const referenceWon = requestedWonHint > 0 ? requestedWonHint : 1_000_000;
  if (transferWon >= referenceWon * 0.8 && riskyLabel) {
    return riskyLabel;
  }
  return cautionLabel ?? riskyLabel;
}

function hashRecipientSeed(recipientName: string): number {
  let seedValue = 0;
  for (let charIndex = 0; charIndex < recipientName.length; charIndex += 1) {
    seedValue = (seedValue * 31 + recipientName.charCodeAt(charIndex)) >>> 0;
  }
  return seedValue;
}

export function buildFakeRecipientBankName(recipientName: string): string {
  const seedValue = hashRecipientSeed(recipientName);
  return fakeBankNameList[seedValue % fakeBankNameList.length];
}

export function buildFakeRecipientAccountNumber(recipientName: string): string {
  const seedValue = hashRecipientSeed(recipientName);
  const accountSuffix = String(1000000000 + (seedValue % 900000000)).slice(1);
  return `${accountSuffix.slice(0, 3)}-${accountSuffix.slice(3, 5)}-${accountSuffix.slice(5, 9)}-${accountSuffix.slice(9)}`;
}

/** 스캠 대사에서 금액 힌트를 추출해 이체 금액 필드에 표시한다. */
export function extractTransferAmountHint(memoText: string): string {
  const trimmedMemo = memoText.trim();
  if (!trimmedMemo) return "";

  const wonMatchList = [...trimmedMemo.matchAll(/(\d{1,3}(?:,\d{3})+|\d+)\s*원/g)];
  if (wonMatchList.length > 0) {
    const lastWonMatch = wonMatchList[wonMatchList.length - 1][1];
    const numericValue = Number(lastWonMatch.replace(/,/g, ""));
    if (Number.isFinite(numericValue) && numericValue > 0) {
      return `${numericValue.toLocaleString()}원`;
    }
  }

  const manMatch = trimmedMemo.match(/(\d+(?:\.\d+)?)\s*만(?:\s*원)?/);
  if (manMatch) {
    const manValue = Number(manMatch[1]);
    if (Number.isFinite(manValue) && manValue > 0) {
      return `${Math.round(manValue * 10000).toLocaleString()}원`;
    }
  }

  return "";
}

/** 토크·통화 등 이전 채널 대사에서 송금 금액 힌트를 찾는다. */
export function extractTransferAmountFromChatHistory(
  chatHistory: ChatHistoryEntry[],
): string {
  for (let entryIndex = chatHistory.length - 1; entryIndex >= 0; entryIndex -= 1) {
    const entryItem = chatHistory[entryIndex]!;
    if (entryItem.speaker !== "scammer" || entryItem.appType === "bank") continue;
    const amountHint = extractTransferAmountHint(entryItem.messageText);
    if (amountHint) return amountHint;
  }
  return "";
}

export function formatTransferAmountInputValue(amountHint: string): string {
  return amountHint.replace(/원$/, "").trim();
}

export function sanitizeTransferAmountInput(rawValue: string): string {
  const trimmedValue = rawValue.trim();
  const manMatch = trimmedValue.match(/^(\d+(?:\.\d+)?)\s*만$/);
  if (manMatch) return `${manMatch[1]}만`;

  const digitOnly = trimmedValue.replace(/[^\d,]/g, "");
  if (!digitOnly) return "";
  const numericValue = Number(digitOnly.replace(/,/g, ""));
  if (!Number.isFinite(numericValue) || numericValue <= 0) return digitOnly;
  return numericValue.toLocaleString();
}

export function parseTransferAmountWon(rawValue: string): number {
  const trimmedValue = rawValue.trim();
  if (!trimmedValue) return 0;

  const manMatch = trimmedValue.match(/^(\d+(?:\.\d+)?)\s*만$/);
  if (manMatch) {
    const manValue = Number(manMatch[1]);
    return Number.isFinite(manValue) ? Math.round(manValue * 10_000) : 0;
  }

  const numericValue = Number(trimmedValue.replace(/,/g, ""));
  return Number.isFinite(numericValue) && numericValue > 0 ? numericValue : 0;
}

export function formatTransferAmountWon(wonValue: number): string {
  if (wonValue <= 0) return "";
  return wonValue.toLocaleString();
}

export function addTransferAmountUnit(currentRawValue: string, unitWonValue: number): string {
  const nextWonValue = parseTransferAmountWon(currentRawValue) + unitWonValue;
  return formatTransferAmountWon(nextWonValue);
}
