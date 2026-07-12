"use client";

import { motion } from "framer-motion";

interface TypingIndicatorProps {
  /** 점 색상 클래스 — 말풍선 배경과 대비되게 앱별로 지정 */
  dotColorClass?: string;
}

/**
 * 대사 생성 대기 인디케이터 — 메신저 "입력 중..." 스타일의 점 3개 애니메이션.
 * LLM 첫 토큰이 도착하기 전(thinking 구간)에도 진행 중임을 보여준다.
 */
export function TypingIndicator({ dotColorClass = "bg-black/40" }: TypingIndicatorProps) {
  return (
    <span
      className="inline-flex items-center gap-1 py-1"
      role="status"
      aria-label="상대방이 입력하는 중"
    >
      {[0, 1, 2].map((dotIndex) => (
        <motion.span
          key={dotIndex}
          animate={{ opacity: [0.25, 1, 0.25], y: [0, -2.5, 0] }}
          transition={{ repeat: Infinity, duration: 1.1, delay: dotIndex * 0.18 }}
          className={`h-1.5 w-1.5 rounded-full ${dotColorClass}`}
          aria-hidden
        />
      ))}
    </span>
  );
}
