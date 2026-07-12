"use client";

import { motion } from "framer-motion";

export type InputTutorialMode = "messenger" | "call";

interface InputTutorialBannerProps {
  tutorialMode: InputTutorialMode;
  composerTheme?: "dark" | "light";
  onDismissTutorial: () => void;
}

const tutorialCopy: Record<
  InputTutorialMode,
  { title: string; body: string; actionLabel: string }
> = {
  messenger: {
    title: "직접 메시지를 보내보세요",
    body: "실제 메신저처럼 아래 입력창에 답을 적고 보내기(➤)를 눌러보세요. 막막하면 나중에 예시 답변을 열 수 있어요.",
    actionLabel: "알겠어요",
  },
  call: {
    title: "음성으로 답할 수 있어요",
    body: "마이크 버튼(🎤)을 눌러 말해보세요. 브라우저에서 마이크 접근을 허용해 주세요. 마이크를 쓸 수 없으면 텍스트로 답해도 됩니다.",
    actionLabel: "마이크 준비됐어요",
  },
};

/** 첫 플레이 턴 — 자유 입력(텍스트/음성) 사용법을 안내하는 코치마크 */
export function InputTutorialBanner({
  tutorialMode,
  composerTheme = "dark",
  onDismissTutorial,
}: InputTutorialBannerProps) {
  const copyItem = tutorialCopy[tutorialMode];
  const isDarkTheme = composerTheme === "dark";

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-2xl border px-4 py-3 ${
        isDarkTheme
          ? "border-sky-400/30 bg-sky-500/15 text-white"
          : "border-sky-200 bg-sky-50 text-slate-900"
      }`}
      role="status"
    >
      <p className="text-sm font-semibold">{copyItem.title}</p>
      <p className={`mt-1 text-xs leading-relaxed ${isDarkTheme ? "text-white/75" : "text-slate-600"}`}>
        {copyItem.body}
      </p>
      <button
        type="button"
        onClick={onDismissTutorial}
        className={`mt-2 rounded-full px-3 py-1 text-xs font-medium transition ${
          isDarkTheme
            ? "bg-white/15 text-white hover:bg-white/25"
            : "bg-sky-500 text-white hover:bg-sky-600"
        }`}
      >
        {copyItem.actionLabel}
      </button>
    </motion.div>
  );
}
