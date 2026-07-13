"use client";

interface AppBackButtonProps {
  onBack: () => void;
  /** 헤더 배경이 어두우면 dark, 밝으면 light */
  tone?: "light" | "dark";
  /** 스크린리더용 라벨 (기본: 홈으로 돌아가기) */
  ariaLabel?: string;
}

/**
 * 앱 헤더 공통 뒤로가기 — 홈 화면으로 복귀.
 */
export function AppBackButton({
  onBack,
  tone = "light",
  ariaLabel = "홈으로 돌아가기",
}: AppBackButtonProps) {
  const toneClassName =
    tone === "dark"
      ? "text-white/90 hover:bg-white/10 active:bg-white/15"
      : "text-black/70 hover:bg-black/5 active:bg-black/10";

  return (
    <button
      type="button"
      onClick={onBack}
      aria-label={ariaLabel}
      className={`flex shrink-0 items-center gap-0.5 rounded-lg px-1 py-1 transition-colors ${toneClassName}`}
    >
      <svg
        aria-hidden
        viewBox="0 0 24 24"
        className="h-5 w-5"
        fill="none"
        stroke="currentColor"
        strokeWidth={2.2}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M15 18l-6-6 6-6" />
      </svg>
    </button>
  );
}
