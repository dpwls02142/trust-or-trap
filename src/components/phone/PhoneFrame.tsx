"use client";

import { useEffect, useState } from "react";

interface PhoneFrameProps {
  children: React.ReactNode;
}

/**
 * 기기 프레임 — 베젤, 노치, 상태바(시계·배터리).
 * 뷰포트 390×844 기준. 내부 콘텐츠만 스크롤한다.
 */
export function PhoneFrame({ children }: PhoneFrameProps) {
  const [clockText, setClockText] = useState("");

  useEffect(() => {
    const updateClock = () => {
      const currentTime = new Date();
      setClockText(
        `${String(currentTime.getHours()).padStart(2, "0")}:${String(currentTime.getMinutes()).padStart(2, "0")}`,
      );
    };
    updateClock();
    const clockInterval = setInterval(updateClock, 10_000);
    return () => clearInterval(clockInterval);
  }, []);

  return (
    <div className="relative h-dvh w-full max-w-[430px] overflow-hidden bg-black sm:h-[844px] sm:max-h-[92dvh] sm:w-[390px] sm:rounded-[3rem] sm:border-[6px] sm:border-neutral-800 sm:shadow-2xl">
      {/* 상태바 */}
      <div className="absolute inset-x-0 top-0 z-40 flex items-center justify-between px-7 pt-3 text-xs font-semibold text-white">
        <span suppressHydrationWarning>{clockText}</span>
        <span aria-hidden className="hidden sm:block h-6 w-28 rounded-full bg-black" />
        <span className="flex items-center gap-1">
          <span aria-label="신호 세기">▂▄▆</span>
          <span aria-label="배터리">▮ 87%</span>
        </span>
      </div>

      <div className="h-full w-full">{children}</div>
    </div>
  );
}
