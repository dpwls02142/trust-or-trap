import type { AppType } from "@/lib/scenario/types";

/** browser 노드별 페이지 연출 유형 */
export type BrowserPageVariant =
  | "reverse_image_search"
  | "fake_government_portal"
  | "fake_hts_portal"
  | "generic_fake_site";

export interface BrowserPageConfig {
  pageVariant: BrowserPageVariant;
  /** 앱 진입 전 홈 컨펌 — 주인공 1인칭 */
  transitionPrompt: string;
  /** 브라우저 앱 상단 상황 설명 배너 */
  entryContextText: string;
  actionPanelTitle: string;
  actionPanelHint: string;
}

const browserPageConfigMap: Record<string, BrowserPageConfig> = {
  "branch-verify-identity": {
    pageVariant: "reverse_image_search",
    transitionPrompt: "의심이 들어서 프로필 사진을 역이미지 검색해볼까?",
    entryContextText:
      "메신저에서 받은 프로필 사진이 마음에 걸려, 역이미지 검색을 해봤다.",
    actionPanelTitle: "검색 결과를 보고 다음 행동을 선택하세요",
    actionPanelHint:
      "같은 사진이 여러 곳에 올라와 있으면 도용일 수 있습니다.",
  },
  "risk-fake-site": {
    pageVariant: "fake_government_portal",
    transitionPrompt: "문자로 온 사건 조회 링크를 열어볼까?",
    entryContextText:
      "수사관과 통화한 뒤, 문자로 온 '사건 조회' 링크를 눌러 들어왔다.",
    actionPanelTitle: "사이트를 확인하고 다음 행동을 선택하세요",
    actionPanelHint:
      "주소창 도메인과 요구하는 개인정보를 꼼꼼히 살펴보세요.",
  },
  "risk-fake-hts": {
    pageVariant: "fake_hts_portal",
    transitionPrompt: "보내준 전용 앱 설치 링크를 열어볼까?",
    entryContextText:
      "상담 채팅에서 받은 '전용 HTS' 설치 링크를 눌러 들어왔다.",
    actionPanelTitle: "화면을 확인하고 다음 행동을 선택하세요",
    actionPanelHint:
      "공식 앱스토어가 아닌 링크·수익 화면은 의심해보세요.",
  },
};

const defaultBrowserPageConfig: BrowserPageConfig = {
  pageVariant: "generic_fake_site",
  transitionPrompt: "받은 링크를 열어볼까?",
  entryContextText: "문자·채팅으로 받은 링크를 눌러 들어왔다.",
  actionPanelTitle: "페이지를 확인하고 다음 행동을 선택하세요",
  actionPanelHint: "주소·도메인·요구 정보를 꼼꼼히 살펴보세요.",
};

export function resolveBrowserPageConfig(nodeId: string): BrowserPageConfig {
  return browserPageConfigMap[nodeId] ?? defaultBrowserPageConfig;
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

/** browser 노드에서 LLM message를 페이지에 표시할지 여부 */
export function shouldShowBrowserPageNotice(pageVariant: BrowserPageVariant): boolean {
  return pageVariant !== "reverse_image_search";
}
