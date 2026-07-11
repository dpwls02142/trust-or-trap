import "server-only";

/**
 * 경량 인메모리 슬라이딩 윈도우 rate limiter (서버리스 인스턴스 단위 best-effort).
 * 외부 저장소 없이 O(1) 카운터로 동작해 지연이 없다.
 * 한계: 인스턴스가 여러 개면 인스턴스별로 카운트된다 → 완전한 방어는
 * Vercel WAF/Firewall Rate Limiting을 함께 켜는 것을 전제로 한 1차 방어선이다.
 */

interface RateWindowEntry {
  windowStartMs: number;
  requestCount: number;
}

const rateWindowMap = new Map<string, RateWindowEntry>();
const WINDOW_DURATION_MS = 60_000;
const MAX_TRACKED_KEYS = 10_000;

export function isRateLimited(
  clientKey: string,
  maxRequestsPerMinute: number,
): boolean {
  const currentTimeMs = Date.now();
  const existingEntry = rateWindowMap.get(clientKey);

  if (!existingEntry || currentTimeMs - existingEntry.windowStartMs > WINDOW_DURATION_MS) {
    // 맵 무한 성장 방지 — 상한 도달 시 만료 항목 정리
    if (rateWindowMap.size >= MAX_TRACKED_KEYS) {
      for (const [trackedKey, trackedEntry] of rateWindowMap) {
        if (currentTimeMs - trackedEntry.windowStartMs > WINDOW_DURATION_MS) {
          rateWindowMap.delete(trackedKey);
        }
      }
    }
    rateWindowMap.set(clientKey, { windowStartMs: currentTimeMs, requestCount: 1 });
    return false;
  }

  existingEntry.requestCount += 1;
  return existingEntry.requestCount > maxRequestsPerMinute;
}

export function resolveClientKey(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  return forwardedFor?.split(",")[0]?.trim() ?? "unknown-client";
}
