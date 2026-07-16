"use client";

import { motion } from "framer-motion";
import type { EndingConsequence, EndingType, RiskSignalRecord } from "@/lib/scenario/types";

interface EndingReportProps {
  endingType: EndingType;
  scenarioTitle: string;
  endingConsequence: EndingConsequence | null;
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

const consequenceThemeMap: Record<
  EndingType,
  { cardClass: string; amountClass: string; markerClass: string }
> = {
  safe: {
    cardClass: "border-emerald-500/30 bg-emerald-500/10",
    amountClass: "text-emerald-300",
    markerClass: "text-emerald-400",
  },
  warning: {
    cardClass: "border-amber-500/30 bg-amber-500/10",
    amountClass: "text-amber-300",
    markerClass: "text-amber-400",
  },
  harm: {
    cardClass: "border-red-500/40 bg-red-500/10",
    amountClass: "text-red-300",
    markerClass: "text-red-400",
  },
};

const riskFlagLabelMap = {
  safe: { flagLabel: "잘 대응함", flagClass: "bg-emerald-500/20 text-emerald-300" },
  caution: { flagLabel: "아슬아슬", flagClass: "bg-amber-500/20 text-amber-300" },
  risky: { flagLabel: "놓침", flagClass: "bg-red-500/20 text-red-300" },
} as const;

const koreanWonFormatter = new Intl.NumberFormat("ko-KR");

/**
 * 엔딩 리포트 — "무엇을 했더니 무슨 일이 벌어졌는가"를 먼저 충격적으로 보여주고,
 * 그다음 위험 신호 리플레이를 제공한다.
 */
export function EndingReport({
  endingType,
  scenarioTitle,
  endingConsequence,
  riskSignalRecords,
  onRestartGame,
}: EndingReportProps) {
  const endingPresentation = endingPresentationMap[endingType];
  const consequenceTheme = consequenceThemeMap[endingType];
  const hasLostAmount =
    !!endingConsequence &&
    typeof endingConsequence.lost_amount_krw === "number" &&
    endingConsequence.lost_amount_krw > 0;

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
      </div>

      {endingConsequence && (
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className={`rounded-2xl border p-4 ${consequenceTheme.cardClass}`}
        >
          {hasLostAmount && (
            <div className="mb-3 text-center">
              <p className="text-[11px] uppercase tracking-wide text-white/50">
                {endingConsequence.lost_amount_label ?? "잃은 돈"}
              </p>
              <p className={`mt-0.5 text-3xl font-extrabold ${consequenceTheme.amountClass}`}>
                {koreanWonFormatter.format(endingConsequence.lost_amount_krw!)}원
              </p>
            </div>
          )}
          <p className="text-[15px] font-bold leading-snug text-white">
            {endingConsequence.consequence_headline}
          </p>
          <ul className="mt-2.5 flex flex-col gap-1.5">
            {endingConsequence.consequence_details.map((detailText, detailIndex) => (
              <li
                key={detailIndex}
                className="flex gap-2 text-[13px] leading-relaxed text-white/80"
              >
                <span className={consequenceTheme.markerClass}>•</span>
                <span>{detailText}</span>
              </li>
            ))}
          </ul>
        </motion.section>
      )}

      <p className="text-sm leading-relaxed text-white/70">
        {endingPresentation.endingDescription}
      </p>

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
