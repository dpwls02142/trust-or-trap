import type { GenderValue } from "./types";

/** 온보딩 성별에 따라 치환되는 플레이어 호칭 세트 */
export interface PlayerHonorificSet {
  /** 동년배·친구·커뮤니티 상대 → 형 / 언니 */
  peerHonorific: string;
  /** 감탄 호칭 — 형! / 언니! */
  peerHonorificExclaim: string;
  /** 자녀→부모 호칭 — 아빠 / 엄마 */
  parentHonorific: string;
  /** 플레이어 1인칭 — 아빠가 / 엄마가 */
  parentSelfReference: string;
  /** 이름 뒤 붙는 구어 호칭 — 야 / 아 */
  casualNameSuffix: string;
}

export function resolvePlayerHonorifics(
  genderValue: GenderValue,
): PlayerHonorificSet {
  if (genderValue === "male") {
    return {
      peerHonorific: "형",
      peerHonorificExclaim: "형!",
      parentHonorific: "아빠",
      parentSelfReference: "아빠가",
      casualNameSuffix: "야",
    };
  }

  return {
    peerHonorific: "언니",
    peerHonorificExclaim: "언니!",
    parentHonorific: "엄마",
    parentSelfReference: "엄마가",
    casualNameSuffix: "아",
  };
}

/**
 * 프롤로그·잠금화면 템플릿 치환.
 * {displayName}, {displayNameCasual}, {peerHonorific}, {peerHonorificExclaim},
 * {parentHonorific}, {parentSelfReference}
 */
export function applyPlayerProfileTemplate(
  templateText: string,
  displayName: string,
  honorificSet: PlayerHonorificSet,
): string {
  return templateText
    .replaceAll("{displayName}", displayName)
    .replaceAll(
      "{displayNameCasual}",
      `${displayName}${honorificSet.casualNameSuffix}`,
    )
    .replaceAll("{peerHonorific}", honorificSet.peerHonorific)
    .replaceAll("{peerHonorificExclaim}", honorificSet.peerHonorificExclaim)
    .replaceAll("{parentHonorific}", honorificSet.parentHonorific)
    .replaceAll("{parentSelfReference}", honorificSet.parentSelfReference);
}

/** LLM few-shot 예시용 */
export function resolvePeerHonorificExample(
  genderValue: GenderValue,
): string {
  const honorificSet = resolvePlayerHonorifics(genderValue);
  return `${honorificSet.peerHonorificExclaim} 잠깐만 전화 받아봐`;
}

/** LLM advance 프롬프트용 호칭 가이드 */
export function buildPlayerHonorificGuide(
  displayName: string,
  genderValue: GenderValue,
): string {
  const honorificSet = resolvePlayerHonorifics(genderValue);
  const genderLabel = genderValue === "male" ? "남성" : "여성";

  return [
    "## 플레이어 호칭 (필수)",
    `- 플레이어: ${displayName} (${genderLabel})`,
    `- 동년배·친구·커뮤니티 상대가 부를 때: "${honorificSet.peerHonorific}" (예: "${honorificSet.peerHonorificExclaim} 잠깐만")`,
    `- 자녀→부모 맥락(해당 시): "${honorificSet.parentHonorific}"`,
    `- 이름+구어 호칭: "${displayName}${honorificSet.casualNameSuffix}"`,
    genderValue === "male"
      ? '- 플레이어가 남성이므로 "언니·누나·엄마(자녀→부모)" 등 여성/모성 호칭으로 부르지 않는다.'
      : '- 플레이어가 여성이므로 "형·오빠·아빠(자녀→부모)" 등 남성/부성 호칭으로 부르지 않는다.',
  ].join("\n");
}
