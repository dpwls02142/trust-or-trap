import type { AppType } from "@/lib/scenario/types";
import type { InputTutorialMode } from "@/components/phone/shared/InputTutorialBanner";

/** 노드 앱 타입·음성 설정에 맞는 입력 튜토리얼 모드 (없으면 null) */
export function resolveInputTutorialMode(
  appType: AppType,
  voiceEnabled: boolean,
): InputTutorialMode | null {
  if (appType === "call" && voiceEnabled) return "call";
  if (appType !== "call" && appType !== "home") return "messenger";
  return null;
}
