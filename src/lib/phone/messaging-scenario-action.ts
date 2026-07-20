/**
 * 메시징 앱(chat/sms/insta) 노드별 특수 인터랙션 — 사진 요구·링크 탭 등.
 * browser-scenario-page.ts와 동일하게 node_id 기준으로 연출을 매핑한다.
 */

export interface PhotoSendActionConfig {
  actionVariant: "photo_send_prompt";
  /** 주인공 1인칭 컨펌 — "사진 보낼까?" */
  transitionPrompt: string;
  contextHint?: string;
  /** 네 선택 시 전송할 고정 이미지 (public/ 기준 경로) */
  attachmentImagePath: string;
  /** 사진 전송 시 judge에 넘길 risky 선택지 label (그래프 options와 일치) */
  sendOptionLabel: string;
}

export interface MessageLinkActionConfig {
  actionVariant: "open_chat_invite";
  /** 링크 탭 시 주인공 1인칭 컨펌 */
  transitionPrompt: string;
  /** judge API에 넘길 플레이어 응답 (그래프 options와 의미 일치) */
  submitResponseText: string;
}

const photoSendActionConfigMap: Record<string, PhotoSendActionConfig> = {
  "demand-photo": {
    actionVariant: "photo_send_prompt",
    transitionPrompt: "사진 보낼까?",
    contextHint: "상대가 사진을 요청했습니다.",
    attachmentImagePath: "/teen_message.png",
    sendOptionLabel: "친하니까 괜찮을 것 같아 사진을 보낸다",
  },
};

const messageLinkActionConfigMap: Record<string, MessageLinkActionConfig> = {
  "approach-invite-sms": {
    actionVariant: "open_chat_invite",
    transitionPrompt: "채팅방에 접속할까?",
    submitResponseText: "무료라니 기대하며 바로 링크를 누른다",
  },
};

export function resolvePhotoSendActionConfig(
  nodeId: string,
): PhotoSendActionConfig | null {
  return photoSendActionConfigMap[nodeId] ?? null;
}

export function resolveMessageLinkActionConfig(
  nodeId: string,
): MessageLinkActionConfig | null {
  return messageLinkActionConfigMap[nodeId] ?? null;
}
