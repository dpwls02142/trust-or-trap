import type { Transition, Variants } from "framer-motion";

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
