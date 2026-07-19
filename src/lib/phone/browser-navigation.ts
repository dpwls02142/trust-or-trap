const HAS_PROTOCOL_PATTERN = /^https?:\/\//i;
const DOMAIN_LIKE_PATTERN = /^([\da-z-]+\.)+[a-z]{2,}(:\d+)?(\/[^\s]*)?$/i;
const IPV4_PATTERN = /^\d{1,3}(\.\d{1,3}){3}(:\d+)?(\/[^\s]*)?$/;

/** 시나리오 browser 노드 기본 가짜 피싱 URL */
export const SCENARIO_FAKE_SITE_URL = "http://secure-check.info-portal.xyz";

/**
 * 주소창 입력을 iframe에 로드할 URL로 변환한다.
 * URL 형태면 https를 보완하고, 그 외는 Google 검색으로 연결한다.
 */
export function resolveBrowserNavigationUrl(rawInput: string): string | null {
  const trimmedInput = rawInput.trim();
  if (!trimmedInput) {
    return null;
  }

  if (HAS_PROTOCOL_PATTERN.test(trimmedInput)) {
    return trimmedInput;
  }

  if (
    DOMAIN_LIKE_PATTERN.test(trimmedInput) ||
    IPV4_PATTERN.test(trimmedInput) ||
    trimmedInput.startsWith("localhost")
  ) {
    return `https://${trimmedInput}`;
  }

  return `https://www.google.com/search?q=${encodeURIComponent(trimmedInput)}`;
}

export function isSecureBrowserUrl(url: string): boolean {
  return url.startsWith("https://");
}

/** iframe 삽입을 막는 대형 사이트(클릭재킹 방지 정책) */
const IFRAME_BLOCKED_HOST_PATTERNS = [
  /(^|\.)google\./i,
  /(^|\.)youtube\.com$/i,
  /(^|\.)youtu\.be$/i,
  /(^|\.)naver\.com$/i,
  /(^|\.)daum\.net$/i,
  /(^|\.)kakao\.com$/i,
  /(^|\.)facebook\.com$/i,
  /(^|\.)instagram\.com$/i,
  /(^|\.)twitter\.com$/i,
  /(^|\.)x\.com$/i,
  /(^|\.)tiktok\.com$/i,
  /(^|\.)github\.com$/i,
  /(^|\.)microsoft\.com$/i,
  /(^|\.)apple\.com$/i,
  /(^|\.)amazon\./i,
  /(^|\.)netflix\.com$/i,
];

/**
 * X-Frame-Options / CSP frame-ancestors로 iframe 삽입이 거의 확실한 URL인지 판별한다.
 * 브라우저 보안 정책은 클라이언트에서 우회할 수 없으므로, 외부 탭으로 여는 UX에 사용한다.
 */
export function isLikelyIframeBlockedUrl(url: string): boolean {
  try {
    const parsedUrl = new URL(url);
    return IFRAME_BLOCKED_HOST_PATTERNS.some((hostPattern) =>
      hostPattern.test(parsedUrl.hostname),
    );
  } catch {
    return true;
  }
}

export function openExternalBrowserPage(pageUrl: string): void {
  window.open(pageUrl, "_blank", "noopener,noreferrer");
}

export function getHttpSecurityWarning(url: string): string | null {
  if (url.startsWith("http://")) {
    return "이 사이트는 보안 연결(HTTPS)이 아닙니다";
  }

  return null;
}

/** 시나리오 browser 앱 — 공식 도메인·HTTPS 위험 신호 배너 */
export function getScenarioSiteSecurityWarning(url: string): string | null {
  const httpWarning = getHttpSecurityWarning(url);
  const isOfficialDomain = /\.go\.kr(\/|$|:)/i.test(url);

  if (httpWarning && !isOfficialDomain) {
    return `${httpWarning}, 공식 도메인(go.kr)이 아닙니다`;
  }

  if (httpWarning) {
    return httpWarning;
  }

  if (!isOfficialDomain && /secure-check|info-portal/i.test(url)) {
    return "공식 도메인(go.kr)이 아닙니다";
  }

  return null;
}
