"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ChatApp } from "./ChatApp";
import { SMSApp } from "./SMSApp";
import { CallScreen } from "./CallScreen";
import { InstaApp } from "./InstaApp";
import { BankApp } from "./BankApp";
import { BrowserApp } from "./BrowserApp";
import { NodeTimer } from "./shared/NodeTimer";
import {
  appSwapMotionTransition,
  appSwapMotionVariants,
} from "./shared/phone-app-transition";
import type { PhoneAppSharedProps } from "./shared/phone-app-props";
import type { AppType } from "@/lib/scenario/types";

interface ScenarioAppRendererProps extends PhoneAppSharedProps {
  onTimerExpire: () => void;
}

const appComponentMap: Record<
  Exclude<AppType, "home">,
  (sharedProps: PhoneAppSharedProps) => React.ReactNode
> = {
  chat: ChatApp,
  sms: SMSApp,
  call: CallScreen,
  insta: InstaApp,
  bank: BankApp,
  browser: BrowserApp,
};

/**
 * 노드의 app_type → 앱 컴포넌트 매핑 렌더러 + 타이머 오버레이.
 * 앱 간 전환 시 슬라이드 모션을 적용한다.
 */
export function ScenarioAppRenderer({ onTimerExpire, ...sharedProps }: ScenarioAppRendererProps) {
  const { currentNode, isAwaitingResponse, streamingMessage } = sharedProps;
  const appType = currentNode.app_type === "home" ? "chat" : currentNode.app_type;
  const ActiveAppComponent = appComponentMap[appType];

  const shouldShowTimer =
    typeof currentNode.timer_seconds === "number" &&
    currentNode.timer_seconds > 0 &&
    !currentNode.is_ending &&
    !streamingMessage &&
    !isAwaitingResponse;

  return (
    <div className="relative h-full overflow-hidden">
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={appType}
          className="absolute inset-0"
          variants={appSwapMotionVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={appSwapMotionTransition}
        >
          <ActiveAppComponent {...sharedProps} />
        </motion.div>
      </AnimatePresence>
      {shouldShowTimer && (
        <div className="pointer-events-none absolute inset-x-0 top-12 z-30">
          <NodeTimer
            timerSeconds={currentNode.timer_seconds!}
            isTimerActive={shouldShowTimer}
            onTimerExpire={onTimerExpire}
          />
        </div>
      )}
    </div>
  );
}
