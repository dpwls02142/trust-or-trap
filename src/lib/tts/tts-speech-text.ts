/**
 * TTS용 문장 정제 — 자막(화면) 텍스트와 분리한다.
 * ㅎㅎ·ㅠㅠ 같은 채팅식 감정 표현과 의성어는 읽지 않는다.
 *
 * 성능: 정규식 선형 스캔(O(n))이라 문장 단위 호출에 부담 없음.
 */

/** 채팅에서 반복되는 자모 감정 표현 (ㅎㅎ, ㅋㅋ, ㅠㅠ …) */
const chatExpressionJamoPattern = /[ㅎㅋㅠㅜㅇㅍㅂㄷㄱㅅㅈㅁㄴㄹㅏㅑㅓㅕㅗㅛㅡㅣ]{2,}/g;

/** ASCII 이모티콘 조각 (^^, ^_^ 등) */
const asciiEmoticonPattern = /\^[_^.-]{0,4}\^|\^+\^|T_T|OTL|orz/gi;

/** 한글 의성·감탄사 — 앞뒤가 다른 한글 음절이 아닐 때만 제거 */
const standaloneOnomatopoeiaPattern =
  /(?<![가-힣])(?:하하+|히히+|헤헤+|후후+|후훗+|키키+|크크+|쿠쿠+|푸핫+|푸하하+|꺄악+|윽+|헉+|엥+|에엣+|흠+|음+(?:\.{2,3})?)(?![가-힣])/g;

/** 이모지 — TTS가 이름을 읽는 경우 방지 */
const emojiPattern = /\p{Extended_Pictographic}/gu;

const whitespaceCollapsePattern = /\s{2,}/g;

export function prepareSentenceTextForTts(rawSentenceText: string): string {
  let speechText = rawSentenceText;

  speechText = speechText.replace(chatExpressionJamoPattern, " ");
  speechText = speechText.replace(asciiEmoticonPattern, " ");
  speechText = speechText.replace(standaloneOnomatopoeiaPattern, " ");
  speechText = speechText.replace(emojiPattern, " ");
  speechText = speechText.replace(whitespaceCollapsePattern, " ").trim();

  return speechText;
}

/** 남은 내용이 실제로 읽을 만한지(구두점·공백만 남지 않았는지) */
export function isSpeakableTtsText(speechText: string): boolean {
  return speechText.replace(/[\s,.!?…:;'"()[\]-]/g, "").length > 0;
}
