"use client";

import { motion } from "framer-motion";
import type { EndingType, RiskSignalRecord } from "@/lib/scenario/types";

interface EndingReportProps {
  endingType: EndingType;
  scenarioTitle: string;
  riskSignalRecords: RiskSignalRecord[];
  onRestartGame: () => void;
}

const endingPresentationMap: Record<
  EndingType,
  { endingEmoji: string; endingTitle: string; endingDescription: string; accentClass: string }
> = {
  safe: {
    endingEmoji: "✅",
    endingTitle: "안전하게 빠져나왔습니다",
    endingDescription: "위험 신호를 식별하고 회피/신고까지 해냈어요. 실제 상황에서도 이 감각을 기억하세요.",
    accentClass: "text-emerald-400",
  },
  warning: {
    endingEmoji: "⚠️",
    endingTitle: "피해를 인지하고 멈췄습니다",
    endingDescription:
      "일부 피해가 있었지만 늦지 않게 알아챘어요. 실제라면 지금이 지급정지·신고의 골든타임입니다. (경찰 112 / 금융감독원 1332)",
    accentClass: "text-amber-400",
  },
  harm: {
    endingEmoji: "🚨",
    endingTitle: "피해가 깊어졌습니다",
    endingDescription:
      "요구에 응할수록 피해가 커지는 구조를 체험했어요. 피해자는 잘못이 없으며, 실제 상황에서는 즉시 112·1332로 도움을 요청하세요.",
    accentClass: "text-red-400",
  },
};

const riskFlagLabelMap = {
  safe: { flagLabel: "잘 대응함", flagClass: "bg-emerald-500/20 text-emerald-300" },
  caution: { flagLabel: "아슬아슬", flagClass: "bg-amber-500/20 text-amber-300" },
  risky: { flagLabel: "놓침", flagClass: "bg-red-500/20 text-red-300" },
} as const;

/**
 * 엔딩 리포트 — 결말 + "놓친 위험 신호" 리플레이.
 */
export function EndingReport({
  endingType,
  scenarioTitle,
  riskSignalRecords,
  onRestartGame,
}: EndingReportProps) {
  const endingPresentation = endingPresentationMap[endingType];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="phone-scroll flex h-full flex-col gap-5 overflow-y-auto bg-[#0a0a0f] px-5 pb-8 pt-14 text-white"
    >
      <div className="text-center">
        <span className="text-4xl">{endingPresentation.endingEmoji}</span>
        <h2 className={`mt-2 text-xl font-bold ${endingPresentation.accentClass}`}>
          {endingPresentation.endingTitle}
        </h2>
        <p className="mt-1 text-xs text-white/50">{scenarioTitle}</p>
        <p className="mt-3 text-sm leading-relaxed text-white/75">
          {endingPresentation.endingDescription}
        </p>
      </div>

      <section>
        <h3 className="mb-2 text-sm font-semibold text-white/80">
          위험 신호 리플레이 — 각 순간, 무엇이 신호였나
        </h3>
        <ol className="flex flex-col gap-2.5">
          {riskSignalRecords.map((recordItem, recordIndex) => {
            const flagPresentation = riskFlagLabelMap[recordItem.userRiskFlag];
            return (
              <li
                key={`${recordItem.nodeId}-${recordIndex}`}
                className="rounded-xl border border-white/10 bg-white/5 p-3.5"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] text-white/40">단계 {recordIndex + 1}</span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${flagPresentation.flagClass}`}
                  >
                    {flagPresentation.flagLabel}
                  </span>
                </div>
                <p className="mt-1.5 text-sm leading-relaxed text-white/85">
                  {recordItem.requiredRiskSignal}
                </p>
              </li>
            );
          })}
        </ol>
      </section>

      <button
        onClick={onRestartGame}
        className="mt-auto rounded-xl bg-sky-500 py-3.5 text-base font-semibold transition hover:bg-sky-400"
      >
        처음부터 다시 하기
      </button>
    </motion.div>
  );
}
