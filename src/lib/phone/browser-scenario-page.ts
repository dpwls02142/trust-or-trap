import { resolveSenderAvatarPath } from "@/lib/scenario/sender-avatar";
import type { AppType, ScenarioId } from "@/lib/scenario/types";

export interface ReverseImageSearchProfile {
  profileImagePath: string | null;
  profileDisplayName: string;
}

/** browser 노드별 페이지 연출 유형 */
export type BrowserPageVariant =
  | "reverse_image_search"
  | "fake_government_portal"
  | "fake_hts_portal"
  | "open_chat_invite"
  | "generic_fake_site";

/** 가짜 페이지 — 플레이어 주 행동 전·로딩·결과 공개 */
export type BrowserPageRevealPhase = "awaiting_action" | "loading" | "revealed";

export interface BrowserPageConfig {
  pageVariant: BrowserPageVariant;
  /** 앱 진입 전 홈 컨펌 — 주인공 1인칭 */
  transitionPrompt: string;
  /** 브라우저 앱 상단 상황 설명 배너 */
  entryContextText: string;
  /** 페이지 안에서 결과를 열어보는 주 행동 버튼 */
  primaryActionLabel: string;
  /** 주 행동 전 페이지 안내 */
  preRevealHint: string;
  /** 주 행동 후 로딩 연출 문구 */
  loadingLabel: string;
  /** 인페이지 탐색 전 하단 행동 패널 제목 */
  preRevealActionPanelTitle: string;
  actionPanelTitle: string;
  actionPanelHint: string;
}

const browserPageConfigMap: Record<string, BrowserPageConfig> = {
  "approach-openchat-link": {
    pageVariant: "open_chat_invite",
    transitionPrompt: "문자로 온 초대 링크를 열어볼까?",
    entryContextText:
      "문자에 적힌 '무료 VIP 리딩방' 초대 주소를 눌러 들어왔다.",
    primaryActionLabel: "채팅방 입장",
    preRevealHint: "입장 버튼을 누르면 토크 앱 오픈채팅방으로 연결됩니다.",
    loadingLabel: "채팅방에 연결하는 중...",
    preRevealActionPanelTitle: "먼저 입장 버튼을 눌러 연결을 확인하세요",
    actionPanelTitle: "채팅방에 들어간 뒤 다음 행동을 선택하세요",
    actionPanelHint: "단체방 분위기와 수익 인증이 과장돼 있지 않은지 살펴보세요.",
  },
  "branch-verify-identity": {
    pageVariant: "reverse_image_search",
    transitionPrompt: "의심이 드는데 프로필 사진을 검색해볼까?",
    entryContextText:
      "메신저에서 받은 프로필 사진이 유명인 얼굴과 비슷해 보여 이미지 검색 사이트를 열었다.",
    primaryActionLabel: "이미지 검색",
    preRevealHint: "의심되는 프로필 사진을 올리고 검색을 시작하세요.",
    loadingLabel: "유사 이미지를 찾는 중...",
    preRevealActionPanelTitle: "먼저 사진을 검색해 결과를 확인하세요",
    actionPanelTitle: "검색 결과를 보고 다음 행동을 선택하세요",
    actionPanelHint: "같은 사진이 여러 곳에 올라와 있으면 도용일 수 있습니다.",
  },
  "risk-fake-site": {
    pageVariant: "fake_government_portal",
    transitionPrompt: "문자로 온 사건 조회 링크를 열어볼까?",
    entryContextText:
      "수사관과 통화한 뒤, 문자로 온 '사건 조회' 링크를 눌러 들어왔다.",
    primaryActionLabel: "조회하기",
    preRevealHint: "요구하는 정보와 주소창 도메인을 먼저 살펴보세요.",
    loadingLabel: "사건 정보를 조회하는 중...",
    preRevealActionPanelTitle: "먼저 조회 버튼을 눌러 페이지를 확인하세요",
    actionPanelTitle: "사이트를 확인하고 다음 행동을 선택하세요",
    actionPanelHint: "주소창 도메인과 요구하는 개인정보를 꼼꼼히 살펴보세요.",
  },
  "risk-fake-hts-browser": {
    pageVariant: "fake_hts_portal",
    transitionPrompt: "보내준 전용 앱 설치 링크를 열어볼까?",
    entryContextText:
      "토크방에서 받은 '전용 HTS' 설치 링크를 눌러 들어왔다.",
    primaryActionLabel: "체험 화면 불러오기",
    preRevealHint: "설치·수익 안내가 어떻게 보이는지 직접 열어보세요.",
    loadingLabel: "체험 계좌 정보를 불러오는 중...",
    preRevealActionPanelTitle: "먼저 페이지를 열어 화면을 확인하세요",
    actionPanelTitle: "화면을 확인하고 다음 행동을 선택하세요",
    actionPanelHint: "공식 앱스토어가 아닌 링크·수익 화면은 의심해보세요.",
  },
};

const defaultBrowserPageConfig: BrowserPageConfig = {
  pageVariant: "generic_fake_site",
  transitionPrompt: "받은 링크를 열어볼까?",
  entryContextText: "문자·채팅으로 받은 링크를 눌러 들어왔다.",
  primaryActionLabel: "본인 확인 진행",
  preRevealHint: "페이지가 무엇을 요구하는지 직접 열어보세요.",
  loadingLabel: "페이지를 불러오는 중...",
  preRevealActionPanelTitle: "먼저 페이지 내용을 확인하세요",
  actionPanelTitle: "페이지를 확인하고 다음 행동을 선택하세요",
  actionPanelHint: "주소·도메인·요구 정보를 꼼꼼히 살펴보세요.",
};

export function resolveBrowserPageConfig(nodeId: string): BrowserPageConfig {
  return browserPageConfigMap[nodeId] ?? defaultBrowserPageConfig;
}

/** 역이미지 검색 연출 — 메신저와 동일한 발신자 아바타 경로를 재사용한다. */
export function resolveReverseImageSearchProfile(
  scenarioId: ScenarioId | null,
  senderName: string,
): ReverseImageSearchProfile {
  return {
    profileImagePath: resolveSenderAvatarPath(scenarioId, senderName),
    profileDisplayName: senderName,
  };
}

interface AppTransitionContext {
  nodeId: string;
  appType: AppType;
  requiredRiskSignal: string;
  previousAppType?: AppType;
}

/**
 * 앱 전환 컨펌 문구 — browser는 노드별 맥락, 그 외는 앱 타입 기본값.
 */
export function resolveAppTransitionPrompt(
  context: AppTransitionContext,
  fallbackPromptMap: Partial<Record<AppType, string>>,
  defaultPrompt: string,
): string {
  if (context.appType === "browser") {
    return resolveBrowserPageConfig(context.nodeId).transitionPrompt;
  }

  return fallbackPromptMap[context.appType] ?? defaultPrompt;
}

/** browser 노드별 주소창 기본 URL */
export function resolveBrowserDefaultAddress(nodeId: string): string {
  if (nodeId === "approach-openchat-link") {
    return "http://open-room.vip-invest.link/join";
  }
  return "http://secure-check.info-portal.xyz";
}

/** browser 노드에서 LLM message를 페이지에 표시할지 여부 */
export function shouldShowBrowserPageNotice(
  pageVariant: BrowserPageVariant,
): boolean {
  return pageVariant !== "reverse_image_search";
}
