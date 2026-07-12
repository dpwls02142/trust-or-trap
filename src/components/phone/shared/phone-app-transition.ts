import type { Transition, Variants } from "framer-motion";

/** 홈 ↔ 앱 진입·퇴장 (iOS 앱 열기/닫기 느낌) */
export const phoneScreenMotionVariants: Variants = {
  initial: { opacity: 0, scale: 0.88, y: 24 },
  animate: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 0.88, y: 24 },
};

export const phoneScreenMotionTransition: Transition = {
  type: "spring",
  damping: 28,
  stiffness: 340,
};

/** 앱 A → 앱 B 전환 (새 앱이 오른쪽에서 슬라이드 인) */
export const appSwapMotionVariants: Variants = {
  initial: { opacity: 0, x: "100%" },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: "-28%" },
};

export const appSwapMotionTransition: Transition = {
  type: "spring",
  damping: 30,
  stiffness: 360,
};
