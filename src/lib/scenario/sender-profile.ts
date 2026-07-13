import { resolveSenderAvatarPath } from "@/lib/scenario/sender-avatar";
import type { ScenarioId } from "@/lib/scenario/types";

export interface SenderFeedPost {
  postId: string;
  captionText: string;
  likeCount: number;
}

export interface SenderProfileView {
  displayName: string;
  handleName: string;
  bioText: string;
  statusMessage: string;
  followerCount: number;
  followingCount: number;
  postCount: number;
  avatarPath: string | null;
  feedPosts: SenderFeedPost[];
}

function hashSenderSeed(senderName: string): number {
  let seedValue = 0;
  for (let charIndex = 0; charIndex < senderName.length; charIndex += 1) {
    seedValue = (seedValue * 31 + senderName.charCodeAt(charIndex)) >>> 0;
  }
  return seedValue;
}

function pickBioText(scenarioId: ScenarioId | null, senderName: string): string {
  const bioByScenario: Partial<Record<ScenarioId, string>> = {
    "teen-female-grooming": "일상 · 음악 · 카페 ☕ DM 환영",
    "teen-male-gameitem": "게임 아이템 · 거래 · DM 주세요",
    "twenties-female-romance": "여행 · 사진 · 좋은 사람 만나고 싶어요 ✈️",
    "twenties-male-voicephishing": "금융 · 상담 · 빠른 처리",
    "middle-invest-scam": "VIP 투자 리서치 · 수익 인증",
    "fifties-loan-scam": "서민 금융 · 대출 상담 · 당일 승인",
    "senior-authority-scam": "공공기관 · 안내 · 긴급 연락",
  };

  if (scenarioId && bioByScenario[scenarioId]) {
    return bioByScenario[scenarioId]!;
  }

  return `${senderName} · 프로필`;
}

const feedCaptionPool = [
  "오늘도 좋은 하루 ☀️",
  "새로 올린 사진 📷",
  "주말 기록",
  "맛있는 거 먹었어요",
  "오랜만에 업데이트",
  "일상 스냅",
  "기분 좋은 날",
  "DM 주세요",
  "감사합니다 🙏",
];

/**
 * 발신자 이름·시나리오로 SNS/메신저 프로필 화면용 목 데이터를 만든다.
 * 그래프 JSON에 필드를 추가하지 않고 UI 탐색용 정적 연출만 제공한다.
 */
export function buildSenderProfileView(
  scenarioId: ScenarioId | null,
  senderName: string,
): SenderProfileView {
  const seedValue = hashSenderSeed(senderName);
  const followerCount = 120 + (seedValue % 900);
  const followingCount = 80 + ((seedValue >> 4) % 1200);
  const postCount = 6 + (seedValue % 24);
  const handleName = senderName.includes(" ") ? senderName.replace(/\s+/g, "_").toLowerCase() : senderName;

  const feedPosts: SenderFeedPost[] = Array.from({ length: 9 }, (_, postIndex) => ({
    postId: `${handleName}-post-${postIndex}`,
    captionText: feedCaptionPool[(seedValue + postIndex) % feedCaptionPool.length]!,
    likeCount: 12 + ((seedValue + postIndex * 7) % 480),
  }));

  return {
    displayName: senderName,
    handleName,
    bioText: pickBioText(scenarioId, senderName),
    statusMessage: pickBioText(scenarioId, senderName),
    followerCount,
    followingCount,
    postCount,
    avatarPath: resolveSenderAvatarPath(scenarioId, senderName),
    feedPosts,
  };
}
