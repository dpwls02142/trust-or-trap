const messageLinkPattern =
  /(?:https?:\/\/)?(?:[a-z0-9-]+\.)+[a-z]{2,}(?:\/[^\s]*)?/i;

/** SMS 등에서 대사 본문과 URL을 분리해 링크 전용 말풍선으로 렌더링한다. */
export function splitMessageBodyAndLink(messageText: string): {
  bodyText: string;
  linkUrl: string | null;
} {
  const linkMatch = messageText.match(messageLinkPattern);
  if (!linkMatch) {
    return { bodyText: messageText, linkUrl: null };
  }

  const linkUrl = linkMatch[0];
  const bodyText = messageText
    .replace(linkMatch[0], "")
    .replace(/\s+/g, " ")
    .trim();

  return { bodyText, linkUrl };
}
