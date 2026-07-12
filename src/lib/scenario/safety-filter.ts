import "server-only";

/**
 * LLM 응답 후처리 안전 필터 — 프롬프트 안전장치와 별도의 독립 레이어.
 * 개인정보 패턴(전화번호/주민번호/계좌번호 추정)과 실존 기관명을 마스킹한다.
 * 성능: 정규식 선형 스캔이라 메시지 길이에 비례(O(n)), 스트리밍 후 문장 단위 적용에 부담 없음.
 */

const personalInfoPatternList: { patternRegex: RegExp; maskLabel: string }[] = [
  // 주민등록번호 형태
  { patternRegex: /\d{6}[-\s]?[1-4]\d{6}/g, maskLabel: "[개인정보 마스킹]" },
  // 휴대폰 번호 형태
  { patternRegex: /01[016789][-\s]?\d{3,4}[-\s]?\d{4}/g, maskLabel: "[전화번호 마스킹]" },
  // 계좌번호로 추정되는 10자리 이상 연속 숫자(하이픈 포함)
  { patternRegex: /\d{2,6}[-]\d{2,6}[-]\d{2,8}/g, maskLabel: "[계좌번호 마스킹]" },
];

/** 실존 기관/기업 실명 → 가상 명칭 치환 (사칭 대사 생성 금지 원칙) */
const realEntityReplacementList: { entityRegex: RegExp; virtualName: string }[] = [
  { entityRegex: /카카오톡|카카오뱅크/g, virtualName: "메신저앱" },
  { entityRegex: /국민은행|신한은행|우리은행|하나은행/g, virtualName: "한빛은행" },
  { entityRegex: /서울중앙지검|서울중앙지방검찰청/g, virtualName: "중앙지방검찰청" },
];

export function applySafetyFilter(rawMessageText: string): string {
  let filteredText = rawMessageText;

  for (const { patternRegex, maskLabel } of personalInfoPatternList) {
    filteredText = filteredText.replace(patternRegex, maskLabel);
  }
  for (const { entityRegex, virtualName } of realEntityReplacementList) {
    filteredText = filteredText.replace(entityRegex, virtualName);
  }

  return filteredText;
}

/**
 * teen 시나리오 강화 검사 — 프롬프트 안전장치가 뚫려도(주입/모델 오류)
 * 노골적 표현이 화면에 나가기 전에 차단하는 독립 레이어.
 * 그루밍 "구조" 학습에 필요한 중립 표현(사진, 영상통화 등)은 차단하지 않는다.
 */
const teenUnsafePatternList: RegExp[] = [
  /야한|음란|알몸|나체|노출\s*사진|속옷\s*(사진|차림)/,
  /벗(어|은|고)\s*(사진|모습|몸)/,
  /성적|성관계|음경|가슴\s*(사진|보여)/,
  /자위|섹스|섹시한\s*(사진|모습)/,
];

export function detectTeenUnsafeContent(messageText: string): boolean {
  return teenUnsafePatternList.some((unsafePattern) => unsafePattern.test(messageText));
}

/** 카톡 단답형 상한 — LLM이 장문을 내도 화면에는 짧게 잘라 표시 */
const dialogueMaxChars = 60;
const optionLabelMaxChars = 28;

export function capDialogueLength(rawMessageText: string): string {
  const trimmedText = rawMessageText.trim();
  if (trimmedText.length <= dialogueMaxChars) return trimmedText;
  return `${trimmedText.slice(0, dialogueMaxChars - 1)}…`;
}

export function capOptionLabelLength(rawLabelText: string): string {
  const trimmedLabel = rawLabelText.trim();
  if (trimmedLabel.length <= optionLabelMaxChars) return trimmedLabel;
  return `${trimmedLabel.slice(0, optionLabelMaxChars - 1)}…`;
}
