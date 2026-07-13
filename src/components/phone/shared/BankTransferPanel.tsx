"use client";

import { motion } from "framer-motion";
import type { NodeOption } from "@/lib/scenario/types";

interface BankTransferPanelProps {
  recipientName: string;
  transferMemoText: string;
  isAwaitingResponse: boolean;
  availableOptions: NodeOption[];
  isAwaitingOptionChoice: boolean;
  onSelectTransferAction: (optionLabel: string) => void;
}

function buildFakeAccountNumber(recipientName: string): string {
  let seedValue = 0;
  for (let charIndex = 0; charIndex < recipientName.length; charIndex += 1) {
    seedValue = (seedValue * 31 + recipientName.charCodeAt(charIndex)) >>> 0;
  }
  const accountSuffix = String(1000000000 + (seedValue % 900000000)).slice(1);
  return `110-***-${accountSuffix.slice(0, 4)}-${accountSuffix.slice(4)}`;
}

/**
 * bank 앱 전용 송금 화면 — 채팅 말풍선 없이 이체 폼과 행동 버튼만 제공한다.
 * 상대 요청 문구는 적요 필드에 자동 입력되는 형태로만 노출한다.
 */
export function BankTransferPanel({
  recipientName,
  availableOptions,
  isAwaitingOptionChoice,
  onSelectTransferAction,
}: BankTransferPanelProps) {
  const fakeAccountNumber = buildFakeAccountNumber(recipientName);

  return (
    <div className="phone-scroll flex-1 overflow-y-auto bg-neutral-100">
      <div className="border-b border-amber-200 bg-amber-50 px-4 py-2.5 text-[11px] leading-relaxed text-amber-900">
        최근 전화·메시지로 송금을 요청받은 상황입니다. 은행 앱에서 직접 이체
        여부를 결정하세요.
      </div>

      <div className="mx-4 mt-4 rounded-2xl bg-white p-4 shadow-sm">
        <p className="text-xs font-semibold text-black/45">받는 분</p>
        <p className="mt-1 text-base font-bold text-black">{recipientName}</p>
        <p className="mt-3 text-xs font-semibold text-black/45">계좌번호</p>
        <p className="mt-1 font-mono text-sm text-black">{fakeAccountNumber}</p>

        <label
          className="mt-4 block text-xs font-semibold text-black/45"
          htmlFor="transfer-amount"
        >
          이체 금액
        </label>
        <input
          id="transfer-amount"
          readOnly
          value=""
          placeholder="상대방이 안내한 금액"
          className="mt-1 w-full rounded-xl border border-black/10 bg-neutral-50 px-3 py-2.5 text-sm text-black/70 outline-none"
        />
      </div>

      {availableOptions.length > 0 && (
        <div className="mx-4 mt-5 space-y-2.5 pb-6">
          <p className="text-xs font-semibold text-black/45">이체 결정</p>
          {availableOptions.map((optionItem, optionIndex) => (
            <motion.button
              key={`${optionItem.label}-${optionIndex}`}
              type="button"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: optionIndex * 0.06 }}
              disabled={isAwaitingOptionChoice}
              onClick={() => onSelectTransferAction(optionItem.label)}
              className={`w-full rounded-2xl px-4 py-3.5 text-left text-sm font-medium transition disabled:opacity-40 ${
                optionItem.risk_flag === "safe"
                  ? "border border-emerald-200 bg-emerald-50 text-emerald-900"
                  : optionItem.risk_flag === "risky"
                    ? "border border-red-200 bg-red-50 text-red-900"
                    : "border border-black/10 bg-white text-black"
              }`}
            >
              {optionItem.label}
            </motion.button>
          ))}
        </div>
      )}
    </div>
  );
}
