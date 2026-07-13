"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { OnboardingForm } from "@/components/onboarding/OnboardingForm";
import { ScenarioRecommendation } from "@/components/onboarding/ScenarioRecommendation";
import { PhoneFrame } from "@/components/phone/PhoneFrame";
import { HomeScreen } from "@/components/phone/HomeScreen";
import { ScenarioAppRenderer } from "@/components/phone/ScenarioAppRenderer";
import { HomeAppShell } from "@/components/phone/HomeAppShell";
import { EndingReport } from "@/components/game/EndingReport";
import { useGameStore } from "@/lib/stores/game-store";
import {
  phoneScreenMotionTransition,
  phoneScreenMotionVariants,
} from "@/components/phone/shared/phone-app-transition";
import { consumeAdvanceStream } from "@/lib/client/advance-stream";
import { SentenceTtsQueue } from "@/lib/client/tts-queue";
import { resolveInputTutorialMode } from "@/lib/scenario/input-tutorial";
import type { PublicNodeView } from "@/lib/scenario/public-node";
import type { AppType, NodeOption, RiskFlag, ScenarioId } from "@/lib/scenario/types";

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
  const exitToHome = useGameStore((storeState) => storeState.exitToHome);
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
  const [isInputTutorialVisible, setIsInputTutorialVisible] = useState(true);
  const [hasOpenedCurrentApp, setHasOpenedCurrentApp] = useState(false);
  const [appPlayMode, setAppPlayMode] = useState<"scenario" | "shell">("scenario");
  const [shellAppType, setShellAppType] = useState<AppType | null>(null);

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
            if (useTtsForNode && ttsQueueRef.current) {
              collectedSentences.push({ sentenceText, previousSentence });
            }
          },
          onFinalPayload: (finalPayload) => {
            if (useTtsForNode && ttsQueueRef.current) {
              for (const sentenceItem of collectedSentences) {
                ttsQueueRef.current.enqueueSentence(
                  sentenceItem.sentenceText,
                  sentenceItem.previousSentence,
                );
              }
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

  // 화면에 선택 가능한 답안 — payload 도착분 우선, 복원된 노드는 그래프 정의 사용 (표시는 ResponseComposer 토글)
  const availableOptions: NodeOption[] = useMemo(() => {
    if (!currentNode || isAwaitingResponse || streamingMessage) return [];
    if (payloadOptionsEntry?.nodeId === currentNode.node_id) {
      return payloadOptionsEntry.options;
    }
    return isNodeMessageGenerated ? currentNode.options : [];
  }, [currentNode, isAwaitingResponse, streamingMessage, payloadOptionsEntry, isNodeMessageGenerated]);

  const inputTutorialMode = useMemo(() => {
    if (!currentNode) return null;
    return resolveInputTutorialMode(
      currentNode.app_type,
      scenarioVoiceEnabled && currentNode.voice_enabled,
    );
  }, [currentNode, scenarioVoiceEnabled]);

  const hasPlayerResponse = chatHistory.some((entryItem) => entryItem.speaker === "player");

  const shouldShowInputTutorial =
    isInputTutorialVisible &&
    !hasPlayerResponse &&
    !!currentNode?.allow_free_input &&
    !currentNode.is_ending &&
    !isAwaitingResponse &&
    !streamingMessage &&
    inputTutorialMode !== null;

  // 플레이 중 새 노드 진입 시 대사 생성 (마이크로태스크로 미뤄 렌더 사이클과 분리)
  useEffect(() => {
    if (gamePhase !== "playing" || appPlayMode !== "scenario" || !currentNode || currentNode.is_ending) {
      return;
    }
    if (lastAdvancedNodeIdRef.current === currentNode.node_id) return;

    lastAdvancedNodeIdRef.current = currentNode.node_id;
    if (isNodeMessageGenerated) return;

    const advanceTimerId = setTimeout(() => void runAdvanceForNode(currentNode), 0);
    return () => clearTimeout(advanceTimerId);
  }, [gamePhase, appPlayMode, currentNode, isNodeMessageGenerated, runAdvanceForNode]);

  // TTS 큐 — 홈↔앱 왕복 중에도 진행 중인 통화 대사가 끊기지 않도록 home 단계에서 유지
  useEffect(() => {
    const isScenarioActive =
      !!activeScenarioId &&
      scenarioVoiceEnabled &&
      (gamePhase === "playing" || gamePhase === "home");

    if (isScenarioActive) {
      if (!ttsQueueRef.current) {
        ttsQueueRef.current = new SentenceTtsQueue(activeScenarioId!);
      }
      return;
    }

    ttsQueueRef.current?.dispose();
    ttsQueueRef.current = null;
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
        setIsInputTutorialVisible(true);
        setHasOpenedCurrentApp(false);
        setAppPlayMode("scenario");
        setShellAppType(null);
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
      setIsInputTutorialVisible(false);
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
    const expireOptions =
      availableOptions.length > 0 ? availableOptions : currentNode?.options ?? [];
    const cautionOption =
      expireOptions.find((optionItem) => optionItem.risk_flag === "caution") ??
      expireOptions[0];
    if (cautionOption) void handleUserResponse(cautionOption.label);
  }, [availableOptions, currentNode, handleUserResponse]);

  const handleDismissInputTutorial = useCallback(() => {
    setIsInputTutorialVisible(false);
  }, []);

  const handleAppOpen = useCallback(
    (selectedAppType: AppType) => {
      if (selectedAppType === currentNode?.app_type) {
        setAppPlayMode("scenario");
        setShellAppType(null);
        setHasOpenedCurrentApp(true);
        enterCurrentApp();
        return;
      }

      setAppPlayMode("shell");
      setShellAppType(selectedAppType);
      enterCurrentApp();
    },
    [currentNode, enterCurrentApp],
  );

  const handleExitToHome = useCallback(() => {
    lastAdvancedNodeIdRef.current = null;
    setStreamingMessage("");
    setAppPlayMode("scenario");
    setShellAppType(null);
    exitToHome();
  }, [exitToHome]);

  const handleRestartGame = useCallback(() => {
    lastAdvancedNodeIdRef.current = null;
    setStreamingMessage("");
    setPayloadOptionsEntry(null);
    setIsAwaitingResponse(false);
    setIsInputTutorialVisible(true);
    setHasOpenedCurrentApp(false);
    setAppPlayMode("scenario");
    setShellAppType(null);
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
      <AnimatePresence mode="wait" initial={false}>
        {gamePhase === "home" && currentNode && (
          <motion.div
            key="home-screen"
            className="h-full"
            variants={phoneScreenMotionVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={phoneScreenMotionTransition}
          >
            <HomeScreen
              notificationAppType={currentNode.app_type}
              notificationSenderName={currentNode.sender_name}
              onAppOpen={handleAppOpen}
              showNotificationImmediately={hasOpenedCurrentApp}
            />
          </motion.div>
        )}

        {gamePhase === "playing" && appPlayMode === "shell" && shellAppType && (
          <motion.div
            key="shell-screen"
            className="h-full"
            variants={phoneScreenMotionVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={phoneScreenMotionTransition}
          >
            <HomeAppShell appType={shellAppType} onExitToHome={handleExitToHome} />
          </motion.div>
        )}

        {gamePhase === "playing" && appPlayMode === "scenario" && currentNode && (
          <motion.div
            key="playing-screen"
            className="h-full"
            variants={phoneScreenMotionVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={phoneScreenMotionTransition}
          >
            <ScenarioAppRenderer
              activeScenarioId={activeScenarioId}
              currentNode={currentNode}
              chatHistory={chatHistory}
              streamingMessage={streamingMessage}
              availableOptions={availableOptions}
              inputTutorialMode={inputTutorialMode}
              isInputTutorialVisible={shouldShowInputTutorial}
              onDismissInputTutorial={handleDismissInputTutorial}
              isAwaitingResponse={isAwaitingResponse}
              onSelectOption={handleUserResponse}
              onSubmitFreeInput={handleUserResponse}
              onExitToHome={handleExitToHome}
              onTimerExpire={handleTimerExpire}
            />
          </motion.div>
        )}

        {gamePhase === "ending" && endingType && (
          <motion.div
            key="ending-screen"
            className="h-full"
            variants={phoneScreenMotionVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={phoneScreenMotionTransition}
          >
            <EndingReport
              endingType={endingType}
              scenarioTitle={scenarioTitle}
              riskSignalRecords={riskSignalRecords}
              onRestartGame={handleRestartGame}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </PhoneFrame>
  );
}
