"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { AppBackButton } from "@/components/phone/shared/AppBackButton";
import { matchPersonaScenario } from "@/lib/scenario/persona-matching";
import { scenarioCatalog } from "@/lib/scenario/scenario-catalog";
import { resolveSimulationIntroLine } from "@/lib/scenario/scenario-context-setup";
import type { ScenarioId, UserProfile } from "@/lib/scenario/types";
import { OnboardingCopyright } from "@/components/onboarding/OnboardingCopyright";

interface ScenarioRecommendationProps {
  userProfile: UserProfile;
  onScenarioSelect: (scenarioId: ScenarioId) => void;
  onEditProfile: () => void;
  isStarting: boolean;
}

export function ScenarioRecommendation({
  userProfile,
  onScenarioSelect,
  onEditProfile,
  isStarting,
}: ScenarioRecommendationProps) {
  const [showAlternatives, setShowAlternatives] = useState(false);

  const matchResult = useMemo(
    () => matchPersonaScenario(userProfile.userAge, userProfile.gender),
    [userProfile],
  );
  const primaryEntry = scenarioCatalog[matchResult.primaryScenarioId];
  const primaryIntroLine = resolveSimulationIntroLine(
    matchResult.primaryScenarioId,
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="relative h-dvh w-full max-w-[430px] overflow-hidden"
    >
      <header className="absolute inset-x-0 top-0 z-10 flex items-center px-6 pt-4">
        <AppBackButton
          onBack={onEditProfile}
          tone="dark"
          ariaLabel="내 정보 수정으로 돌아가기"
        />
      </header>

      <div className="phone-scroll flex h-full flex-col overflow-y-auto px-6 pb-8 pt-14">
        <div className="m-auto flex w-full max-w-sm flex-col gap-5 py-4">
          <div className="text-center">
            <p className="text-sm text-white/60">
              {userProfile.displayName}님, 최근 당신 또래·성별에서 가장 많은
              사건은
            </p>
            <h2 className="mt-1 text-xl font-bold text-sky-300">
              {primaryEntry.crimeLabel}
            </h2>
            <p className="text-sm text-white/60">입니다.</p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <p className="text-xs font-medium uppercase tracking-wide text-sky-300/80">
              시뮬레이션 미리보기
            </p>
            <p className="mt-2 text-sm leading-relaxed text-white/80">
              {primaryIntroLine}
            </p>
            {!primaryEntry.voiceEnabled && (
              <p className="mt-3 text-xs text-emerald-300/80">
                이 시나리오는 텍스트/이미지 채팅으로만 진행됩니다 (음성 미사용).
              </p>
            )}
            <p className="mt-3 text-xs text-white/45">
              시작하면 폰 잠금화면·과거 대화·알림을 통해 상황을 직접 확인하게
              됩니다.
            </p>
          </div>

          <button
            onClick={() => onScenarioSelect(matchResult.primaryScenarioId)}
            disabled={isStarting}
            className="rounded-xl bg-sky-500 py-3.5 text-base font-semibold transition hover:bg-sky-400 disabled:opacity-50"
          >
            {isStarting ? "준비 중..." : "시뮬레이션 시작"}
          </button>

          <button
            onClick={() =>
              setShowAlternatives((previousValue) => !previousValue)
            }
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
                      <span className="mt-2 block text-xs leading-relaxed text-white/45">
                        {resolveSimulationIntroLine(alternativeId)}
                      </span>
                    </button>
                  </li>
                );
              })}
            </motion.ul>
          )}

          <div className="flex justify-center pt-2">
            <OnboardingCopyright />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
