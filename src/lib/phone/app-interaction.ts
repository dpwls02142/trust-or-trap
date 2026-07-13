import type { AppType } from "@/lib/scenario/types";

const messagingAppTypeList: AppType[] = ["chat", "sms", "insta"];

/** 메시지 앱 — 대화 입력·말풍선 스레드가 자연스러운 앱 */
export function isMessagingAppType(appType: AppType): boolean {
  return messagingAppTypeList.includes(appType);
}

/** 시나리오 응답 UI가 채팅 입력이 아닌 앱 (브라우저·은행 등) */
export function isContextActionAppType(appType: AppType): boolean {
  return appType === "browser" || appType === "bank";
}
