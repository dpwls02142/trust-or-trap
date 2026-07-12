"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { OnboardingForm } from "@/components/onboarding/OnboardingForm";
import { ScenarioRecommendation } from "@/components/onboarding/ScenarioRecommendation";
import { PhoneFrame } from "@/components/phone/PhoneFrame";
import { HomeScreen } from "@/components/phone/HomeScreen";
import { ScenarioAppRenderer } from "@/components/phone/ScenarioAppRenderer";
import { EndingReport } from "@/components/game/EndingReport";
import { useGameStore } from "@/lib/stores/game-store";
import { consumeAdvanceStream } from "@/lib/client/advance-stream";
import { SentenceTtsQueue } from "@/lib/client/tts-queue";
import type { PublicNodeView } from "@/lib/scenario/public-node";
import type { NodeOption, RiskFlag, ScenarioId } from "@/lib/scenario/types";

/**
 * 게임 오케스트레이터 — 온보딩 → 홈(알림) → 시나리오 플레이 → 엔딩 리포트.
 * 노드 진입 시 advance(SSE)로 대사를 스트리밍하고,
 * 사용자 응답은 judge로 판정해 그래프를 따라 이동한다.
 */
export function GameController() {
  const gamePhase = useGameStore((storeState) => storeState.gamePhase);
  const userProfile = useGameStore((storeState) => storeState.userProfile);
  const activeScenarioId = useGameStore((storeState) => storeState.activeScenarioId);
  const scenarioTitle = useGameStore((storeState) => storeState.scenarioTitle);
  const scenarioVoiceEnabled = useGameStore((storeState) => storeState.scenarioVoiceEnabled);
  const currentNode = useGameStore((storeState) => storeState.currentNode);
  const chatHistory = useGameStore((storeState) => storeState.chatHistory);
  const riskSignalRecords = useGameStore((storeState) => storeState.riskSignalRecords);
  const endingType = useGameStore((storeState) => storeState.endingType);

  const setUserProfile = useGameStore((storeState) => storeState.setUserProfile);
  const startScenario = useGameStore((storeState) => storeState.startScenario);
  const enterCurrentApp = useGameStore((storeState) => storeState.enterCurrentApp);
  const appendChatEntry = useGameStore((storeState) => storeState.appendChatEntry);
  const advanceToNode = useGameStore((storeState) => storeState.advanceToNode);
  const resetGame = useGameStore((storeState) => storeState.resetGame);

  const [streamingMessage, setStreamingMessage] = useState("");
  // 스트리밍 payload로 도착한 선택지 (노드 ID와 함께 보관해 노드 전환 시 자동 무효화)
  const [payloadOptionsEntry, setPayloadOptionsEntry] = useState<{
    nodeId: string;
    options: NodeOption[];
  } | null>(null);
  const [isAwaitingResponse, setIsAwaitingResponse] = useState(false);
  const [isStartingScenario, setIsStartingScenario] = useState(false);

  const lastAdvancedNodeIdRef = useRef<string | null>(null);
  const ttsQueueRef = useRef<SentenceTtsQueue | null>(null);

  // SSR/hydration 안전 가드 — persist 복원 전 첫 렌더 불일치 방지
  // (서버 스냅샷 false, 클라이언트 true → effect 없이 하이드레이션 여부 구독)
  const hydrationSubscribe = useMemo(() => () => () => {}, []);
  const isHydrated = useSyncExternalStore(
    hydrationSubscribe,
    () => true,
    () => false,
  );

  const runAdvanceForNode = useCallback(
    async (targetNode: PublicNodeView) => {
      if (!activeScenarioId || !userProfile) return;
      lastAdvancedNodeIdRef.current = targetNode.node_id;

      setStreamingMessage("");
      setPayloadOptionsEntry(null);
      setIsAwaitingResponse(true);

      // TTS는 통화(call) 앱에서만 사용 — 메시지형 앱은 텍스트만으로 충분
      const useTtsForNode =
        scenarioVoiceEnabled && targetNode.voice_enabled && targetNode.app_type === "call";
      // 생성 중에는 대기 인디케이터가 떠 있으므로 Typecast를 호출하지 않고,
      // 문장을 모아뒀다가 생성 완료(payload) 후 한 번에 큐로 넘긴다 (429 버스트 방지)
      const collectedSentences: { sentenceText: string; previousSentence: string }[] = [];

      await consumeAdvanceStream(
        {
          scenarioId: activeScenarioId,
          nodeId: targetNode.node_id,
          chatHistory: useGameStore.getState().chatHistory,
          userProfile,
        },
        {
          onDeltaText: (deltaText) =>
            setStreamingMessage((previousText) => previousText + deltaText),
          onSentenceComplete: (sentenceText, previousSentence) => {
            if (useTtsForNode) {
              collectedSentences.push({ sentenceText, previousSentence });
            }
          },
          onFinalPayload: (finalPayload) => {
            for (const sentenceItem of collectedSentences) {
              ttsQueueRef.current?.enqueueSentence(
                sentenceItem.sentenceText,
                sentenceItem.previousSentence,
              );
            }
            appendChatEntry({
              speaker: "scammer",
              messageText: finalPayload.message,
              nodeId: targetNode.node_id,
            });
            setStreamingMessage("");
            setPayloadOptionsEntry({
              nodeId: targetNode.node_id,
              options:
                finalPayload.options.length > 0 ? finalPayload.options : targetNode.options,
            });
            setIsAwaitingResponse(false);
          },
          onStreamError: (errorMessage) => {
            appendChatEntry({
              speaker: "system",
              messageText: errorMessage,
              nodeId: targetNode.node_id,
            });
            setStreamingMessage("");
            setPayloadOptionsEntry({ nodeId: targetNode.node_id, options: targetNode.options });
            setIsAwaitingResponse(false);
          },
        },
      );
    },
    [activeScenarioId, userProfile, scenarioVoiceEnabled, appendChatEntry],
  );

  // 현재 노드의 대사가 이미 생성돼 있는지 (새로고침 복원 시 재생성 방지)
  const isNodeMessageGenerated =
    !!currentNode &&
    chatHistory.some(
      (entryItem) =>
        entryItem.nodeId === currentNode.node_id && entryItem.speaker === "scammer",
    );

  // 화면에 보여줄 선택지 — payload 도착분 우선, 복원된 노드는 그래프 정의 선택지 사용 (파생값, effect 불필요)
  const activeOptions: NodeOption[] = useMemo(() => {
    if (!currentNode || isAwaitingResponse || streamingMessage) return [];
    if (payloadOptionsEntry?.nodeId === currentNode.node_id) {
      return payloadOptionsEntry.options;
    }
    return isNodeMessageGenerated ? currentNode.options : [];
  }, [currentNode, isAwaitingResponse, streamingMessage, payloadOptionsEntry, isNodeMessageGenerated]);

  // 플레이 중 새 노드 진입 시 대사 생성 (마이크로태스크로 미뤄 렌더 사이클과 분리)
  useEffect(() => {
    if (gamePhase !== "playing" || !currentNode || currentNode.is_ending) return;
    if (lastAdvancedNodeIdRef.current === currentNode.node_id) return;

    lastAdvancedNodeIdRef.current = currentNode.node_id;
    if (isNodeMessageGenerated) return;

    const advanceTimerId = setTimeout(() => void runAdvanceForNode(currentNode), 0);
    return () => clearTimeout(advanceTimerId);
  }, [gamePhase, currentNode, isNodeMessageGenerated, runAdvanceForNode]);

  // TTS 큐 수명 관리
  useEffect(() => {
    if (gamePhase === "playing" && activeScenarioId && scenarioVoiceEnabled) {
      ttsQueueRef.current = new SentenceTtsQueue(activeScenarioId);
      return () => {
        ttsQueueRef.current?.dispose();
        ttsQueueRef.current = null;
      };
    }
  }, [gamePhase, activeScenarioId, scenarioVoiceEnabled]);

  const handleScenarioSelect = useCallback(
    async (selectedScenarioId: ScenarioId) => {
      setIsStartingScenario(true);
      try {
        const entryResponse = await fetch("/api/scenario/entry", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ scenarioId: selectedScenarioId }),
        });
        if (!entryResponse.ok) throw new Error("entry 실패");
        const entryData = (await entryResponse.json()) as {
          scenarioId: ScenarioId;
          scenarioTitle: string;
          voiceEnabled: boolean;
          entryNode: PublicNodeView;
        };
        lastAdvancedNodeIdRef.current = null;
        startScenario(entryData);
      } catch {
        setIsStartingScenario(false);
      }
      setIsStartingScenario(false);
    },
    [startScenario],
  );

  const handleUserResponse = useCallback(
    async (responseText: string) => {
      if (!activeScenarioId || !currentNode || isAwaitingResponse) return;

      appendChatEntry({
        speaker: "player",
        messageText: responseText,
        nodeId: currentNode.node_id,
      });
      setPayloadOptionsEntry(null);
      setIsAwaitingResponse(true);

      try {
        const judgeResponse = await fetch("/api/scenario/judge", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            scenarioId: activeScenarioId,
            nodeId: currentNode.node_id,
            userResponseText: responseText,
          }),
        });
        if (!judgeResponse.ok) throw new Error("judge 실패");
        const judgeData = (await judgeResponse.json()) as {
          riskFlag: RiskFlag;
          nextNode: PublicNodeView;
        };
        advanceToNode(judgeData.nextNode, judgeData.riskFlag);
      } catch {
        appendChatEntry({
          speaker: "system",
          messageText: "연결이 불안정합니다. 다시 응답해주세요.",
          nodeId: currentNode.node_id,
        });
        setPayloadOptionsEntry({
          nodeId: currentNode.node_id,
          options: currentNode.options,
        });
      } finally {
        setIsAwaitingResponse(false);
      }
    },
    [activeScenarioId, currentNode, isAwaitingResponse, appendChatEntry, advanceToNode],
  );

  // 타이머 만료 → 머뭇거린 것으로 간주 (caution 선택지를 자동 선택, 없으면 첫 선택지)
  const handleTimerExpire = useCallback(() => {
    const expireOptions = activeOptions.length > 0 ? activeOptions : currentNode?.options ?? [];
    const cautionOption =
      expireOptions.find((optionItem) => optionItem.risk_flag === "caution") ??
      expireOptions[0];
    if (cautionOption) void handleUserResponse(cautionOption.label);
  }, [activeOptions, currentNode, handleUserResponse]);

  const handleRestartGame = useCallback(() => {
    lastAdvancedNodeIdRef.current = null;
    setStreamingMessage("");
    setPayloadOptionsEntry(null);
    setIsAwaitingResponse(false);
    resetGame();
  }, [resetGame]);

  if (!isHydrated) {
    return <div className="h-dvh w-full max-w-[430px]" aria-hidden />;
  }

  // ── 온보딩 (폰 프레임 밖) ──
  if (gamePhase === "onboarding") {
    return userProfile ? (
      <ScenarioRecommendation
        userProfile={userProfile}
        onScenarioSelect={handleScenarioSelect}
        isStarting={isStartingScenario}
      />
    ) : (
      <OnboardingForm onProfileSubmit={setUserProfile} />
    );
  }

  // ── "폰 속의 폰" ──
  return (
    <PhoneFrame>
      {gamePhase === "home" && currentNode && (
        <HomeScreen
          notificationAppType={currentNode.app_type}
          notificationSenderName={currentNode.sender_name}
          onNotificationOpen={enterCurrentApp}
        />
      )}

      {gamePhase === "playing" && currentNode && (
        <ScenarioAppRenderer
          currentNode={currentNode}
          chatHistory={chatHistory}
          streamingMessage={streamingMessage}
          activeOptions={activeOptions}
          isAwaitingResponse={isAwaitingResponse}
          onSelectOption={handleUserResponse}
          onSubmitFreeInput={handleUserResponse}
          onTimerExpire={handleTimerExpire}
        />
      )}

      {gamePhase === "ending" && endingType && (
        <EndingReport
          endingType={endingType}
          scenarioTitle={scenarioTitle}
          riskSignalRecords={riskSignalRecords}
          onRestartGame={handleRestartGame}
        />
      )}
    </PhoneFrame>
  );
}
