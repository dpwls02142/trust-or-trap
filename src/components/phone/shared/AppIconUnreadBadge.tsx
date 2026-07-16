"use client";

interface AppIconUnreadBadgeProps {
  count?: number;
}

/** 홈 그리드·독 등 앱 아이콘 우상단 미읽음 배지 */
export function AppIconUnreadBadge({ count = 1 }: AppIconUnreadBadgeProps) {
  return (
    <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
      {count}
    </span>
  );
}
