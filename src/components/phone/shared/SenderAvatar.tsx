import { RiUserFill } from "@remixicon/react";
import { resolveSenderAvatarPath } from "@/lib/scenario/sender-avatar";
import type { ScenarioId } from "@/lib/scenario/types";

interface SenderAvatarProps {
  scenarioId: ScenarioId | null;
  senderName: string;
  sizeClass?: string;
  fallbackSurfaceClass?: string;
}

/** 채팅·통화 헤더용 발신자 프로필 이미지 */
export function SenderAvatar({
  scenarioId,
  senderName,
  sizeClass = "h-9 w-9",
  fallbackSurfaceClass = "bg-white text-lg",
}: SenderAvatarProps) {
  const avatarPath = resolveSenderAvatarPath(scenarioId, senderName);

  if (!avatarPath) {
    return (
      <span
        className={`flex ${sizeClass} items-center justify-center rounded-full ${fallbackSurfaceClass}`}
        aria-hidden
      >
        <RiUserFill size={20} className="opacity-60" aria-hidden />
      </span>
    );
  }

  return (
    <img
      src={avatarPath}
      alt={`${senderName} 프로필`}
      className={`${sizeClass} rounded-full bg-white object-cover`}
    />
  );
}
