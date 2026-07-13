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
      initial={{ y: "100%" }}
      animate={{ y: 0 }}
      exit={{ y: "100%" }}
      transition={{ type: "spring", damping: 28, stiffness: 320 }}
      className="absolute inset-0 z-20 flex flex-col bg-[#bacee0] pt-10"
    >
      <header className="flex items-center border-b border-black/10 bg-[#bacee0] px-3 py-2.5">
        <AppBackButton onBack={onCloseProfile} />
        <h2 className="flex-1 text-center text-sm font-semibold text-black">
          프로필
        </h2>
        <span className="w-8" aria-hidden />
      </header>

      <div className="phone-scroll flex-1 overflow-y-auto">
        <div className="bg-gradient-to-b from-[#9eb6cf] to-[#bacee0] px-6 pb-8 pt-6 text-center">
          {profileView.avatarPath ? (
            <img
              src={profileView.avatarPath}
              alt={`${profileView.displayName} 프로필`}
              className="mx-auto h-24 w-24 rounded-3xl object-cover shadow-md"
            />
          ) : (
            <span className="mx-auto flex h-24 w-24 items-center justify-center rounded-3xl bg-white text-4xl shadow-md">
              👤
            </span>
          )}
          <h3 className="mt-4 text-lg font-bold text-black">
            {profileView.displayName}
          </h3>
          <p className="mt-1 text-sm text-black/60">
            {profileView.statusMessage}
          </p>
        </div>

        <div className="mx-4 mt-2 overflow-hidden rounded-2xl bg-white shadow-sm">
          {[
            { label: "친구 이름", value: profileView.displayName },
            { label: "상태 메시지", value: profileView.statusMessage },
          ].map((rowItem, rowIndex) => (
            <div
              key={rowItem.label}
              className={`flex items-center justify-between px-4 py-3.5 text-sm ${
                rowIndex > 0 ? "border-t border-black/5" : ""
              }`}
            >
              <span className="text-black/50">{rowItem.label}</span>
              <span className="max-w-[55%] truncate font-medium text-black">
                {rowItem.value}
              </span>
            </div>
          ))}
        </div>

        <div className="mx-4 mt-4 overflow-hidden rounded-2xl bg-white shadow-sm">
          {["즐겨찾기", "대화방 서랍", "알림 설정"].map(
            (menuLabel, menuIndex) => (
              <button
                key={menuLabel}
                type="button"
                className={`block w-full px-4 py-3.5 text-left text-sm text-black/80 hover:bg-neutral-50 ${
                  menuIndex > 0 ? "border-t border-black/5" : ""
                }`}
              >
                {menuLabel}
              </button>
            ),
          )}
        </div>
      </div>
    </motion.div>
  );
}
