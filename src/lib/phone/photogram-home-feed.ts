import type { PhotogramPost } from "@/lib/phone/photogram-post";
import { buildPhotogramImagePath } from "@/lib/phone/photogram-post";

export type PhotogramHomePost = PhotogramPost;

/** 홈 인스타(포토그램) 탐색 — 플레이어 본인 프로필 그리드 게시물 */
export const photogramHomeFeed: PhotogramHomePost[] = [
  {
    postId: "home-post-01",
    imagePath: buildPhotogramImagePath("home (1).png"),
    captionText: "카페에서 공부 중 ☕ 타로 밀크티랑 말차 롤케이크까지 #카공 #일상",
    likeCount: 214,
    postedAtLabel: "3일 전",
    authorHandle: "mint.latte.study",
    comments: [
      {
        commentId: "c1-1",
        authorHandle: "matcha.hunter_7",
        commentText: "말차 케이크 어디야? 나도 가고 싶다",
      },
      {
        commentId: "c1-2",
        authorHandle: "cafegram.min",
        commentText: "오늘도 카공 인증 👏",
      },
    ],
  },
  {
    postId: "home-post-02",
    imagePath: buildPhotogramImagePath("home (2).png"),
    captionText: "오늘의 디저트는 곰돌이 케이크 🐻💚 라떼아트도 예쁘다",
    likeCount: 387,
    postedAtLabel: "5일 전",
    authorHandle: "bear.cake.diary",
    comments: [
      {
        commentId: "c2-1",
        authorHandle: "dessert.pick.me",
        commentText: "곰돌이 너무 귀여워 ㅠㅠ",
      },
      {
        commentId: "c2-2",
        authorHandle: "weekend.cafe.j",
        commentText: "다음에 나도 데려가",
      },
    ],
  },
  {
    postId: "home-post-03",
    imagePath: buildPhotogramImagePath("home (3).png"),
    captionText: "집에서 본 노을이 최고 🌇 고양이도 푹 자는 중",
    likeCount: 512,
    postedAtLabel: "1주 전",
    authorHandle: "sunset.room.view",
    comments: [
      {
        commentId: "c3-1",
        authorHandle: "skyline.jealous",
        commentText: "뷰 미쳤다... 부럽",
      },
      {
        commentId: "c3-2",
        authorHandle: "catnap.healing",
        commentText: "고양이 자는 거 보고 힐링됨",
      },
    ],
  },
  {
    postId: "home-post-04",
    imagePath: buildPhotogramImagePath("home (4).png"),
    captionText: "우리 고양이 낮잠 타임 🐱 담요 위가 제일 좋아하는 자리",
    likeCount: 298,
    postedAtLabel: "1주 전",
    authorHandle: "tabby.nap.time",
    comments: [
      {
        commentId: "c4-1",
        authorHandle: "peaceful.paws_",
        commentText: "냥이 너무 평화로워",
      },
    ],
  },
  {
    postId: "home-post-05",
    imagePath: buildPhotogramImagePath("home (5).png"),
    captionText: "한강고 축제! 팔찌 너무 예뻐 ✨ 공연 몇 시부터였더라",
    likeCount: 641,
    postedAtLabel: "2주 전",
    authorHandle: "hanriver.fest23",
    comments: [
      {
        commentId: "c5-1",
        authorHandle: "band.schedule.k",
        commentText: "밴드부 공연 2시부터!",
      },
      {
        commentId: "c5-2",
        authorHandle: "wristband.twin",
        commentText: "우리 팔찌 색 똑같다 ㅋㅋ 이따 사진 찍자",
      },
    ],
  },
  {
    postId: "home-post-06",
    imagePath: buildPhotogramImagePath("home (6).png"),
    captionText: "네일아트 새로 했어요 🌸 데이지랑 금박 포인트",
    likeCount: 176,
    postedAtLabel: "2주 전",
    authorHandle: "daisy.nail.art",
    comments: [
      {
        commentId: "c6-1",
        authorHandle: "nail.color.daily",
        commentText: "색감 너무 예뻐요 💅",
      },
    ],
  },
  {
    postId: "home-post-07",
    imagePath: buildPhotogramImagePath("home (7).png"),
    captionText: "엄마가 해준 떡볶이 최고 🌶️ 집 떡볶이는 진짜 다른 맛",
    likeCount: 423,
    postedAtLabel: "3주 전",
    authorHandle: "home.tteokbokki",
    comments: [
      {
        commentId: "c7-1",
        authorHandle: "getting.hungry.now",
        commentText: "배고파진다...",
      },
      {
        commentId: "c7-2",
        authorHandle: "one.bite.please",
        commentText: "나도 한 입만",
      },
    ],
  },
  {
    postId: "home-post-08",
    imagePath: buildPhotogramImagePath("home (8).png"),
    captionText: "편의점 앞에서 친구들이랑 밤 산책 🌙 시험 끝나서 다들 해방",
    likeCount: 267,
    postedAtLabel: "3주 전",
    authorHandle: "night.cu.squad",
    comments: [
      {
        commentId: "c8-1",
        authorHandle: "exam.over.finally",
        commentText: "그때 진짜 재밌었음 ㅋㅋ",
      },
    ],
  },
  {
    postId: "home-post-09",
    imagePath: buildPhotogramImagePath("home (9).png"),
    captionText: "포카 정리의 밤... 이게 행복 🫶 바인더 또 살까 고민 중",
    likeCount: 534,
    postedAtLabel: "1개월 전",
    authorHandle: "pc.binder.night",
    comments: [
      {
        commentId: "c9-1",
        authorHandle: "collection.shock",
        commentText: "양 미쳤다 ㄷㄷ 부럽",
      },
      {
        commentId: "c9-2",
        authorHandle: "show.me.later",
        commentText: "나중에 나도 보여줘!",
      },
    ],
  },
  {
    postId: "home-post-10",
    imagePath: buildPhotogramImagePath("home (10).png"),
    captionText: "주말 카공 세팅 완료 📚 토트백이랑 펜 세트 새로 샀어",
    likeCount: 189,
    postedAtLabel: "1개월 전",
    authorHandle: "weekend.study.set",
    comments: [
      {
        commentId: "c10-1",
        authorHandle: "setup.so.clean",
        commentText: "세팅 너무 깔끔하다",
      },
    ],
  },
  {
    postId: "home-post-11",
    imagePath: buildPhotogramImagePath("home (11).png"),
    captionText: "옥상에서 본 서울 석양 🌆 생각 정리하기 좋은 곳",
    likeCount: 478,
    postedAtLabel: "1개월 전",
    authorHandle: "rooftop.seoul.view",
    comments: [
      {
        commentId: "c11-1",
        authorHandle: "golden.hour.pic",
        commentText: "사진 분위기 너무 좋다",
      },
      {
        commentId: "c11-2",
        authorHandle: "lets.go.rooftop",
        commentText: "다음에 같이 가자",
      },
    ],
  },
  {
    postId: "home-post-12",
    imagePath: buildPhotogramImagePath("home (12).png"),
    captionText: "오늘 OOTD 🤍 후드티랑 데님 편하게",
    likeCount: 312,
    postedAtLabel: "1개월 전",
    authorHandle: "cozy.hoodie.ootd",
    comments: [
      {
        commentId: "c12-1",
        authorHandle: "clean.fit.fire",
        commentText: "깔끔하다 🔥",
      },
    ],
  },
];

export function findPhotogramHomePost(
  postId: string | null,
): PhotogramHomePost | null {
  if (!postId) return null;
  return photogramHomeFeed.find((postItem) => postItem.postId === postId) ?? null;
}
