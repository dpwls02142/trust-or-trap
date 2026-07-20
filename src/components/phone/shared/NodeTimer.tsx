"use client";

import { useEffect, useState } from "react";
import { RiTimerLine } from "@remixicon/react";
import { motion } from "framer-motion";

interface NodeTimerProps {
  timerSeconds: number;
  /** 시간 초과 시 호출 — 보수적으로 caution 응답 처리 등에 사용 */
  onTimerExpire: () => void;
  isTimerActive: boolean;
}

/**
 * 시간 압박 타이머 — 남은 시간이 30% 이하면 붉게 점멸해 압박을 준다.
 */
export function NodeTimer({ timerSeconds, onTimerExpire, isTimerActive }: NodeTimerProps) {
  const [remainingSeconds, setRemainingSeconds] = useState(timerSeconds);

  // 노드가 바뀌어 timerSeconds가 달라지면 렌더 중에 리셋 (effect 없이 처리하는 React 권장 패턴)
  const [trackedTimerSeconds, setTrackedTimerSeconds] = useState(timerSeconds);
  if (trackedTimerSeconds !== timerSeconds) {
    setTrackedTimerSeconds(timerSeconds);
    setRemainingSeconds(timerSeconds);
  }

  useEffect(() => {
    if (!isTimerActive) return;
    const tickInterval = setInterval(() => {
      setRemainingSeconds((previousValue) => {
        if (previousValue <= 1) {
          clearInterval(tickInterval);
          onTimerExpire();
          return 0;
        }
        return previousValue - 1;
      });
    }, 1000);
    return () => clearInterval(tickInterval);
  }, [isTimerActive, onTimerExpire]);

  const isUrgent = remainingSeconds <= timerSeconds * 0.3;

  return (
    <motion.div
      animate={isUrgent ? { scale: [1, 1.06, 1] } : {}}
      transition={{ repeat: Infinity, duration: 0.8 }}
      className={`mx-auto flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${
        isUrgent ? "bg-red-500/90 text-white" : "bg-black/50 text-white/90"
      }`}
      role="timer"
      aria-label={`남은 시간 ${remainingSeconds}초`}
    >
      <RiTimerLine size={14} aria-hidden />
      {remainingSeconds}초
    </motion.div>
  );
}
