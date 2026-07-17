import type { PhotogramPost } from "@/lib/phone/photogram-post";
import { buildPhotogramImagePath } from "@/lib/phone/photogram-post";
import type { ScenarioId } from "@/lib/scenario/types";

/** teen-female-grooming 발신자 hyun_98 프로필 피드 */
export const hyun98PhotogramFeed: PhotogramPost[] = [
  {
    postId: "hyun_98-post-autumn-walk",
    imagePath: buildPhotogramImagePath("hyun.png"),
    captionText: "가을 산책 🍂🐕 동네 한바퀴 돌기 좋은 날씨",
    likeCount: 143,
    postedAtLabel: "2주 전",
    authorHandle: "hyun_98",
    comments: [
      {
        commentId: "hyun-c1",
        authorHandle: "shiba.daily.log",
        commentText: "시바견 뒷모습이 너무 귀여워여 ㅠㅠ",
      },
      {
        commentId: "hyun-c2",
        authorHandle: "autumn.street.pic",
        commentText: "단풍 진짜 예쁘다",
      },
    ],
  },
];

const senderFeedByScenario: Partial<
  Record<ScenarioId, Record<string, PhotogramPost[]>>
> = {
  "teen-female-grooming": {
    hyun_98: hyun98PhotogramFeed,
  },
};

export function resolveSenderPhotogramFeed(
  scenarioId: ScenarioId | null,
  senderName: string,
): PhotogramPost[] | null {
  if (!scenarioId) return null;
  return senderFeedByScenario[scenarioId]?.[senderName] ?? null;
}
