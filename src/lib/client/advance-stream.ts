"use client";

import type {
  AdvancePayload,
  ChatHistoryEntry,
  RiskFlag,
  ScenarioId,
  UserProfile,
} from "@/lib/scenario/types";

/**
 * /api/scenario/advance SSE 소비 유틸.
 * fetch + ReadableStream 수동 파싱을 쓰는 이유: EventSource는 POST body를 지원하지 않는다.
 * 성능: 청크 단위 파싱(O(수신 바이트))이며, delta 이벤트마다 콜백만 호출해 리렌더 비용은 호출부가 제어.
 */

interface AdvanceStreamCallbacks {
  onDeltaText: (deltaText: string) => void;
  /** 문장이 완성될 때마다 호출 — TTS 큐 연결 지점 */
  onSentenceComplete: (sentenceText: string, previousSentence: string) => void;
  onFinalPayload: (finalPayload: AdvancePayload) => void;
  onStreamError: (errorMessage: string) => void;
}

const sentenceBoundaryRegex = /[.!?。…]["')\]]?\s|[\n]/;

export async function consumeAdvanceStream(
  requestBody: {
    scenarioId: ScenarioId;
    nodeId: string;
    chatHistory: ChatHistoryEntry[];
    userProfile: UserProfile;
    lastPlayerRiskFlag?: RiskFlag;
  },
  streamCallbacks: AdvanceStreamCallbacks,
): Promise<void> {
  const advanceResponse = await fetch("/api/scenario/advance", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(requestBody),
  });

  if (!advanceResponse.ok || !advanceResponse.body) {
    streamCallbacks.onStreamError("대사 생성 요청에 실패했습니다.");
    return;
  }

  const streamReader = advanceResponse.body.getReader();
  const textDecoder = new TextDecoder();
  let eventBuffer = "";
  let sentenceBuffer = "";
  let previousSentence = "";

  const flushSentences = (isFinalFlush: boolean) => {
    let boundaryMatch = sentenceBuffer.match(sentenceBoundaryRegex);
    while (boundaryMatch && boundaryMatch.index !== undefined) {
      const boundaryEnd = boundaryMatch.index + boundaryMatch[0].length;
      const completedSentence = sentenceBuffer.slice(0, boundaryEnd).trim();
      sentenceBuffer = sentenceBuffer.slice(boundaryEnd);
      if (completedSentence) {
        streamCallbacks.onSentenceComplete(completedSentence, previousSentence);
        previousSentence = completedSentence;
      }
      boundaryMatch = sentenceBuffer.match(sentenceBoundaryRegex);
    }
    if (isFinalFlush && sentenceBuffer.trim()) {
      streamCallbacks.onSentenceComplete(sentenceBuffer.trim(), previousSentence);
      sentenceBuffer = "";
    }
  };

  const handleSseEvent = (eventName: string, dataText: string) => {
    if (eventName === "delta") {
      const { text } = JSON.parse(dataText) as { text: string };
      streamCallbacks.onDeltaText(text);
      sentenceBuffer += text;
      flushSentences(false);
    } else if (eventName === "payload") {
      flushSentences(true);
      streamCallbacks.onFinalPayload(JSON.parse(dataText) as AdvancePayload);
    } else if (eventName === "error") {
      const { errorMessage } = JSON.parse(dataText) as { errorMessage: string };
      streamCallbacks.onStreamError(errorMessage);
    }
  };

  while (true) {
    const { done, value } = await streamReader.read();
    if (done) break;
    eventBuffer += textDecoder.decode(value, { stream: true });

    let separatorIndex = eventBuffer.indexOf("\n\n");
    while (separatorIndex !== -1) {
      const rawEventBlock = eventBuffer.slice(0, separatorIndex);
      eventBuffer = eventBuffer.slice(separatorIndex + 2);

      let eventName = "message";
      let dataText = "";
      for (const eventLine of rawEventBlock.split("\n")) {
        if (eventLine.startsWith("event: ")) eventName = eventLine.slice(7).trim();
        else if (eventLine.startsWith("data: ")) dataText += eventLine.slice(6);
      }
      if (dataText) handleSseEvent(eventName, dataText);

      separatorIndex = eventBuffer.indexOf("\n\n");
    }
  }
}
