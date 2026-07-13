"use client";

import { motion } from "framer-motion";
import type { SenderProfileView } from "@/lib/scenario/sender-profile";
import { AppBackButton } from "./AppBackButton";

interface ChatProfileDetailProps {
  profileView: SenderProfileView;
  onCloseProfile: () => void;
}

/**
 * 카카오톡 스타일 프로필 상세 화면.
 * 채팅방 헤더의 프로필 영역을 탭하면 표시된다.
 */
export function ChatProfileDetail({
  profileView,
  onCloseProfile,
}: ChatProfileDetailProps) {
  return (
    <motion.div
      initial={{ x: "100%", opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: "100%", opacity: 0 }}
      transition={{ duration: 0.28, ease: [0.32, 0.72, 0, 1] }}
      className="absolute inset-0 z-20 flex flex-col bg-[#bacee0]"
    >
      <section className="relative flex min-h-full shrink-0 flex-col bg-black">
        {profileView.avatarPath ? (
          <img
            src={profileView.avatarPath}
            alt=""
            aria-hidden
            className="absolute inset-0 h-full w-full object-cover opacity-15 blur-2xl"
          />
        ) : null}

        <header className="relative z-10 flex items-center px-3 pb-2.5 pt-10">
          <AppBackButton
            onBack={onCloseProfile}
            tone="dark"
            ariaLabel="프로필 닫기"
          />
          <h2 className="flex-1 text-center text-sm font-semibold text-white">
            프로필
          </h2>
          <span className="w-8" aria-hidden />
        </header>
        <div className="relative z-10 mt-auto w-full px-4 pb-8">
          <div className="flex flex-col items-start gap-3">
            {profileView.avatarPath ? (
              <img
                src={profileView.avatarPath}
                alt={`${profileView.displayName} 프로필`}
                className="h-24 w-24 shrink-0 rounded-full object-cover"
              />
            ) : (
              <span className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full bg-neutral-800 text-4xl">
                👤
              </span>
            )}
            <div className="min-w-0 w-full">
              <h3 className="truncate text-base font-bold text-white">
                {profileView.displayName}
              </h3>
              <p className="mt-0.5 truncate text-xs text-white/70">
                {profileView.statusMessage}
              </p>
            </div>
          </div>
        </div>
      </section>
    </motion.div>
  );
}
