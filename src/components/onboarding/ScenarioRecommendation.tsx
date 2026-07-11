"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { matchPersonaScenario } from "@/lib/scenario/persona-matching";
import { scenarioCatalog } from "@/lib/scenario/scenario-catalog";
import type { ScenarioId, UserProfile } from "@/lib/scenario/types";

interface ScenarioRecommendationProps {
  userProfile: UserProfile;
  onScenarioSelect: (scenarioId: ScenarioId) => void;
  isStarting: boolean;
}

export function ScenarioRecommendation({
  userProfile,
  onScenarioSelect,
  isStarting,
}: ScenarioRecommendationProps) {
  const [showAlternatives, setShowAlternatives] = useState(false);

  const matchResult = useMemo(
    () => matchPersonaScenario(userProfile.userAge, userProfile.gender),
    [userProfile],
  );
  const primaryEntry = scenarioCatalog[matchResult.primaryScenarioId];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex w-full max-w-sm flex-col gap-5 px-6"
    >
      <div className="text-center">
        <p className="text-sm text-white/60">
          {userProfile.displayName}님, 최근 당신 또래·성별에서 가장 많은 사건은
        </p>
        <h2 className="mt-1 text-xl font-bold text-sky-300">{primaryEntry.crimeLabel}</h2>
        <p className="text-sm text-white/60">입니다.</p>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
        <h3 className="text-lg font-semibold">{primaryEntry.scenarioTitle}</h3>
        <p className="mt-2 text-sm leading-relaxed text-white/70">
          {primaryEntry.scenarioSynopsis}
        </p>
        {!primaryEntry.voiceEnabled && (
          <p className="mt-3 text-xs text-emerald-300/80">
            이 시나리오는 텍스트/이미지 채팅으로만 진행됩니다 (음성 미사용).
          </p>
        )}
      </div>

      <button
        onClick={() => onScenarioSelect(matchResult.primaryScenarioId)}
        disabled={isStarting}
        className="rounded-xl bg-sky-500 py-3.5 text-base font-semibold transition hover:bg-sky-400 disabled:opacity-50"
      >
        {isStarting ? "준비 중..." : "이 이야기로 바로 시작"}
      </button>

      <button
        onClick={() => setShowAlternatives((previousValue) => !previousValue)}
        className="text-sm text-white/50 underline underline-offset-4"
      >
        다른 사건 선택하기
      </button>

      {showAlternatives && (
        <motion.ul
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col gap-3"
        >
          {matchResult.alternativeScenarioIds.map((alternativeId) => {
            const alternativeEntry = scenarioCatalog[alternativeId];
            return (
              <li key={alternativeId}>
                <button
                  onClick={() => onScenarioSelect(alternativeId)}
                  disabled={isStarting}
                  className="w-full rounded-xl border border-white/10 bg-white/5 p-4 text-left transition hover:border-sky-400/50 disabled:opacity-50"
                >
                  <span className="block text-sm font-semibold">
                    {alternativeEntry.scenarioTitle}
                  </span>
                  <span className="mt-1 block text-xs text-white/60">
                    {alternativeEntry.crimeLabel}
                  </span>
                </button>
              </li>
            );
          })}
        </motion.ul>
      )}
    </motion.div>
  );
}
