"use client";

import {
  formatTransferAmountInputValue,
  formatTransferAmountWon,
  parseTransferAmountWon,
  sanitizeTransferAmountInput,
  transferAmountUnitList,
} from "@/lib/phone/bank-app-view";

interface BankTransferPanelProps {
  recipientName: string;
  initialTransferAmountHint: string;
  isDecisionLocked: boolean;
  transferAmountText: string;
  transferMemoText: string;
  onTransferAmountChange: (nextValue: string) => void;
  onTransferMemoChange: (nextValue: string) => void;
  onAddAmountUnit: (unitWonValue: number) => void;
}

/** bank 앱 송금 폼 본문 — 하단 이체·자막은 BankApp footer에서 렌더 */
export function BankTransferPanel({
  recipientName,
  initialTransferAmountHint,
  isDecisionLocked,
  transferAmountText,
  transferMemoText,
  onTransferAmountChange,
  onTransferMemoChange,
  onAddAmountUnit,
}: BankTransferPanelProps) {
  const transferAmountWon = parseTransferAmountWon(transferAmountText);

  return (
    <div className="phone-scroll flex-1 overflow-y-auto pb-4">
      <div className="mx-4 mt-4 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/5">
        <p className="text-xs font-semibold text-black/45">받는 분</p>

        <div className="flex items-center justify-between gap-3 py-3">
          <span className="text-sm text-black/45">예금주</span>
          <span className="text-sm font-semibold text-black">
            {recipientName}
          </span>
        </div>
      </div>

      <div className="mx-4 mt-3 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/5">
        <label
          className="block text-xs font-semibold text-black/45"
          htmlFor="transfer-amount"
        >
          보낼 금액
        </label>
        <div className="mt-2 flex items-baseline gap-1 border-b-2 border-blue-600 pb-2">
          <input
            id="transfer-amount"
            inputMode="numeric"
            value={transferAmountText}
            onChange={(changeEvent) =>
              onTransferAmountChange(
                sanitizeTransferAmountInput(changeEvent.target.value),
              )
            }
            placeholder={
              initialTransferAmountHint
                ? formatTransferAmountInputValue(initialTransferAmountHint)
                : "0"
            }
            disabled={isDecisionLocked}
            aria-label="보낼 금액"
            className="min-w-0 flex-1 bg-transparent text-3xl font-bold tracking-tight text-black outline-none placeholder:text-black/20 disabled:opacity-50"
          />
          <span className="text-lg font-semibold text-black/70">원</span>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          {transferAmountUnitList.map((unitItem) => (
            <button
              key={unitItem.unitLabel}
              type="button"
              disabled={isDecisionLocked}
              onClick={() => onAddAmountUnit(unitItem.unitWonValue)}
              className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 transition hover:bg-blue-100 disabled:opacity-40"
            >
              +{unitItem.unitLabel}
            </button>
          ))}
        </div>

        {transferAmountWon > 0 && (
          <p className="mt-2 text-[11px] text-black/45">
            {formatTransferAmountWon(transferAmountWon)}원 이체 예정
          </p>
        )}
      </div>

      <div className="mx-4 mt-3 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/5">
        <label
          className="block text-xs font-semibold text-black/45"
          htmlFor="transfer-memo"
        >
          받는 분에게 표시
        </label>
        <input
          id="transfer-memo"
          value={transferMemoText}
          onChange={(changeEvent) =>
            onTransferMemoChange(changeEvent.target.value)
          }
          disabled={isDecisionLocked}
          aria-label="받는 분에게 표시할 적요"
          className="mt-2 w-full rounded-xl border border-black/10 bg-neutral-50 px-3 py-2.5 text-sm text-black outline-none placeholder:text-black/30 disabled:opacity-50"
        />
      </div>
    </div>
  );
}
