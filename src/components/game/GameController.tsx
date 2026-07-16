"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { OnboardingForm } from "@/components/onboarding/OnboardingForm";
import { ScenarioRecommendation } from "@/components/onboarding/ScenarioRecommendation";
import { PhoneFrameShell } from "@/components/phone/PhoneFrameShell";
import { HomeScreen } from "@/components/phone/HomeScreen";
import { ScenarioAppRenderer } from "@/components/phone/ScenarioAppRenderer";
import { HomeAppShell } from "@/components/phone/HomeAppShell";
import { EndingReport } from "@/components/game/EndingReport";
import { AppTransitionConfirm } from "@/components/phone/AppTransitionConfirm";
import {
  appTransitionPromptMap,
  defaultAppTransitionPrompt,
  outboundDialTransitionPrompt,
  outboundRedialTransitionPrompt,
} from "@/lib/phone/app-transition-prompt";
import {
  buildHangUpFollowUpMessage,
  isMessageAppType,
  resolvePriorMessageChannel,
  shouldPromptOutboundRedial,
  type PriorMessageChannel,
} from "@/lib/phone/call-hang-up-follow-up";
import { isAwaitingOutboundDial, nextNodeRequiresOutboundDial } from "@/lib/phone/dial-number";
import { resolveStatusBarContentStyle } from "@/lib/phone/app-display";
import { StatusBarOverrideProvider } from "@/lib/phone/status-bar-override";
import { useGameStore } from "@/lib/stores/game-store";
import { consumeAdvanceStream } from "@/lib/client/advance-stream";
import { SentenceTtsQueue } from "@/lib/client/tts-queue";
import { resolveInputTutorialMode } from "@/lib/scenario/input-tutorial";
import type { PublicNodeView } from "@/lib/scenario/public-node";
import type {
  AppType,
  NodeOption,
  RiskFlag,
  ScenarioId,
} from "@/lib/scenario/types";

/**
 * 게임 오케스트레이터 — 온보딩 → 홈(알림) → 시나리오 플레이 → 엔딩 리포트.
 * 노드 진입 시 advance(SSE)로 대사를 스트리밍하고,
 * 사용자 응답은 judge로 판정해 그래프를 따라 이동한다.
 */
export function GameController() {
  const gamePhase = useGameStore((storeState) => storeState.gamePhase);
  const userProfile = useGameStore((storeState) => storeState.userProfile);
  const activeScenarioId = useGameStore(
    (storeState) => storeState.activeScenarioId,
  );
  const scenarioTitle = useGameStore((storeState) => storeState.scenarioTitle);
  const scenarioVoiceEnabled = useGameStore(
    (storeState) => storeState.scenarioVoiceEnabled,
  );
  const currentNode = useGameStore((storeState) => storeState.currentNode);
  const chatHistory = useGameStore((storeState) => storeState.chatHistory);
  const riskSignalRecords = useGameStore(
    (storeState) => storeState.riskSignalRecords,
  );
  const endingType = useGameStore((storeState) => storeState.endingType);

  const setUserProfile = useGameStore(
    (storeState) => storeState.setUserProfile,
  );
  const startScenario = useGameStore((storeState) => storeState.startScenario);
  const enterCurrentApp = useGameStore(
    (storeState) => storeState.enterCurrentApp,
  );
  const exitToHome = useGameStore((storeState) => storeState.exitToHome);
  const appendChatEntry = useGameStore(
    (storeState) => storeState.appendChatEntry,
  );
  const advanceToNode = useGameStore((storeState) => storeState.advanceToNode);
  const resetGame = useGameStore((storeState) => storeState.resetGame);
  const isCallConnected = useGameStore((storeState) => storeState.isCallConnected);
  const outboundDialDraft = useGameStore(
    (storeState) => storeState.outboundDialDraft,
  );
  const setCallConnected = useGameStore(
    (storeState) => storeState.setCallConnected,
  );
  const setOutboundDialDraft = useGameStore(
    (storeState) => storeState.setOutboundDialDraft,
  );

  const [streamingMessage, setStreamingMessage] = useState("");
  // 스트리밍 payload로 도착한 선택지 (노드 ID와 함께 보관해 노드 전환 시 자동 무효화)
  const [payloadOptionsEntry, setPayloadOptionsEntry] = useState<{
    nodeId: string;
    options: NodeOption[];
  } | null>(null);
  const [isAwaitingResponse, setIsAwaitingResponse] = useState(false);
  const [isStartingScenario, setIsStartingScenario] = useState(false);
  const [isEditingOnboardingProfile, setIsEditingOnboardingProfile] =
    useState(false);
  const [isInputTutorialVisible, setIsInputTutorialVisible] = useState(true);
  const [hasOpenedCurrentApp, setHasOpenedCurrentApp] = useState(false);
  const [appPlayMode, setAppPlayMode] = useState<"scenario" | "shell">(
    "scenario",
  );
  const [shellAppType, setShellAppType] = useState<AppType | null>(null);
  const [pendingAppTransition, setPendingAppTransition] = useState<{
    targetAppType: AppType;
    promptText: string;
  } | null>(null);
  const [shouldRevealNotificationOnHome, setShouldRevealNotificationOnHome] =
    useState(false);
  const [hasCompletedOutboundDial, setHasCompletedOutboundDial] =
    useState(true);
  const [homeNotificationOverride, setHomeNotificationOverride] = useState<{
    appType: AppType;
    senderName: string;
  } | null>(null);

  const lastAdvancedNodeIdRef = useRef<string | null>(null);
  const lastMessageContactRef = useRef<PriorMessageChannel | null>(null);
  const ttsQueueRef = useRef<SentenceTtsQueue | null>(null);
  const scenarioSelectGenerationRef = useRef(0);

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
        scenarioVoiceEnabled &&
        targetNode.voice_enabled &&
        targetNode.app_type === "call";
      // 생성 중에는 대기 인디케이터가 떠 있으므로 Typecast를 호출하지 않고,
      // 문장을 모아뒀다가 생성 완료(payload) 후 한 번에 큐로 넘긴다 (429 버스트 방지)
      const collectedSentences: {
        sentenceText: string;
        previousSentence: string;
      }[] = [];

      // 직전 플레이어 응답에 대한 judge 판정 — 대사가 플레이어 태도에 반응하도록 전달
      const priorRiskRecords = useGameStore.getState().riskSignalRecords;
      const lastPlayerRiskFlag =
        priorRiskRecords.length > 0
          ? priorRiskRecords[priorRiskRecords.length - 1].userRiskFlag
          : undefined;

      await consumeAdvanceStream(
        {
          scenarioId: activeScenarioId,
          nodeId: targetNode.node_id,
          chatHistory: useGameStore.getState().chatHistory,
          userProfile,
          lastPlayerRiskFlag,
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
              elapsedDays: targetNode.elapsed_days ?? undefined,
              appType: targetNode.app_type,
            });
            setStreamingMessage("");
            setPayloadOptionsEntry({
              nodeId: targetNode.node_id,
              options:
                finalPayload.options.length > 0
                  ? finalPayload.options
                  : targetNode.options,
            });
            setIsAwaitingResponse(false);
          },
          onStreamError: (errorMessage) => {
            appendChatEntry({
              speaker: "system",
              messageText: errorMessage,
              nodeId: targetNode.node_id,
              elapsedDays: targetNode.elapsed_days ?? undefined,
              appType: targetNode.app_type,
            });
            setStreamingMessage("");
            setPayloadOptionsEntry({
              nodeId: targetNode.node_id,
              options: targetNode.options,
            });
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
        entryItem.nodeId === currentNode.node_id &&
        entryItem.speaker === "scammer",
    );

  // 화면에 선택 가능한 답안 — payload 도착분 우선, 복원된 노드는 그래프 정의 사용 (표시는 ResponseComposer 토글)
  const availableOptions: NodeOption[] = useMemo(() => {
    if (!currentNode || isAwaitingResponse || streamingMessage) return [];
    if (payloadOptionsEntry?.nodeId === currentNode.node_id) {
      return payloadOptionsEntry.options;
    }
    return isNodeMessageGenerated ? currentNode.options : [];
  }, [
    currentNode,
    isAwaitingResponse,
    streamingMessage,
    payloadOptionsEntry,
    isNodeMessageGenerated,
  ]);

  const inputTutorialMode = useMemo(() => {
    if (!currentNode) return null;
    return resolveInputTutorialMode(
      currentNode.app_type,
      scenarioVoiceEnabled && currentNode.voice_enabled,
    );
  }, [currentNode, scenarioVoiceEnabled]);

  const hasPlayerResponse = chatHistory.some(
    (entryItem) => entryItem.speaker === "player",
  );

  const awaitingOutboundDial = isAwaitingOutboundDial(
    currentNode,
    hasCompletedOutboundDial,
  );

  const pendingOutboundDialNumber = awaitingOutboundDial
    ? (currentNode?.outbound_dial_number ?? null)
    : null;

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
    if (
      gamePhase !== "playing" ||
      appPlayMode !== "scenario" ||
      !currentNode ||
      currentNode.is_ending
    ) {
      return;
    }
    if (lastAdvancedNodeIdRef.current === currentNode.node_id) return;

    lastAdvancedNodeIdRef.current = currentNode.node_id;
    if (isNodeMessageGenerated) return;

    const advanceTimerId = setTimeout(
      () => void runAdvanceForNode(currentNode),
      0,
    );
    return () => clearTimeout(advanceTimerId);
  }, [
    gamePhase,
    appPlayMode,
    currentNode,
    isNodeMessageGenerated,
    runAdvanceForNode,
  ]);

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
      const selectGeneration = ++scenarioSelectGenerationRef.current;
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
        if (selectGeneration !== scenarioSelectGenerationRef.current) return;

        lastAdvancedNodeIdRef.current = null;
        setIsInputTutorialVisible(true);
        setHasOpenedCurrentApp(false);
        setPendingAppTransition(null);
        setShouldRevealNotificationOnHome(false);
        setHasCompletedOutboundDial(!entryData.entryNode.outbound_dial_number);
        lastMessageContactRef.current = isMessageAppType(entryData.entryNode.app_type)
          ? {
              appType: entryData.entryNode.app_type,
              nodeId: entryData.entryNode.node_id,
              senderName: entryData.entryNode.sender_name,
            }
          : null;
        setHomeNotificationOverride(null);
        setAppPlayMode("scenario");
        setShellAppType(null);
        startScenario(entryData);
      } catch {
        if (selectGeneration !== scenarioSelectGenerationRef.current) return;
        setIsStartingScenario(false);
        return;
      }
      if (selectGeneration === scenarioSelectGenerationRef.current) {
        setIsStartingScenario(false);
      }
    },
    [startScenario],
  );

  const stopActiveCall = useCallback(() => {
    ttsQueueRef.current?.dispose();
    ttsQueueRef.current = null;
    setCallConnected(false);
  }, [setCallConnected]);

  const beginOutboundDialPrompt = useCallback(
    (promptText?: string) => {
      setPendingAppTransition({
        targetAppType: "call",
        promptText: promptText ?? outboundDialTransitionPrompt,
      });
      setShouldRevealNotificationOnHome(false);
      setHasOpenedCurrentApp(false);
      setAppPlayMode("scenario");
      setShellAppType(null);
      exitToHome();
    },
    [exitToHome],
  );

  const handleUserResponse = useCallback(
    async (responseText: string) => {
      if (!activeScenarioId || !currentNode || isAwaitingResponse) return;

      appendChatEntry({
        speaker: "player",
        messageText: responseText,
        nodeId: currentNode.node_id,
        elapsedDays: currentNode.elapsed_days ?? undefined,
        appType: currentNode.app_type,
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
        const previousAppType = currentNode.app_type;
        const nextNode = judgeData.nextNode;
        advanceToNode(nextNode, judgeData.riskFlag);
        setHasCompletedOutboundDial(!nextNode.outbound_dial_number);

        if (isMessageAppType(previousAppType)) {
          lastMessageContactRef.current = {
            appType: previousAppType,
            nodeId: currentNode.node_id,
            senderName: currentNode.sender_name,
          };
        }

        const nextRequiresOutboundDial =
          !nextNode.is_ending && nextNodeRequiresOutboundDial(nextNode);

        if (previousAppType === "call") {
          const leavingCallApp =
            nextNode.is_ending || nextNode.app_type !== "call";
          if (leavingCallApp || nextRequiresOutboundDial) {
            stopActiveCall();
          }
        }

        if (nextRequiresOutboundDial) {
          beginOutboundDialPrompt();
          return;
        }

        if (
          !nextNode.is_ending &&
          nextNode.app_type !== previousAppType
        ) {
          setPendingAppTransition({
            targetAppType: nextNode.app_type,
            promptText:
              appTransitionPromptMap[nextNode.app_type] ??
              defaultAppTransitionPrompt,
          });
          setShouldRevealNotificationOnHome(true);
          setHasOpenedCurrentApp(false);
          setAppPlayMode("scenario");
          setShellAppType(null);
          exitToHome();
        }
      } catch {
        appendChatEntry({
          speaker: "system",
          messageText: "연결이 불안정합니다. 다시 응답해주세요.",
          nodeId: currentNode.node_id,
          elapsedDays: currentNode.elapsed_days ?? undefined,
          appType: currentNode.app_type,
        });
        setPayloadOptionsEntry({
          nodeId: currentNode.node_id,
          options: currentNode.options,
        });
      } finally {
        setIsAwaitingResponse(false);
      }
    },
    [
      activeScenarioId,
      currentNode,
      isAwaitingResponse,
      appendChatEntry,
      advanceToNode,
      exitToHome,
      stopActiveCall,
      beginOutboundDialPrompt,
    ],
  );

  // 타이머 만료 → 머뭇거린 것으로 간주 (caution 선택지를 자동 선택, 없으면 첫 선택지)
  const handleTimerExpire = useCallback(() => {
    const expireOptions =
      availableOptions.length > 0
        ? availableOptions
        : (currentNode?.options ?? []);
    const cautionOption =
      expireOptions.find((optionItem) => optionItem.risk_flag === "caution") ??
      expireOptions[0];
    if (cautionOption) void handleUserResponse(cautionOption.label);
  }, [availableOptions, currentNode, handleUserResponse]);

  const handleDismissInputTutorial = useCallback(() => {
    setIsInputTutorialVisible(false);
  }, []);

  const openOutboundDialShell = useCallback(() => {
    if (isCallConnected) return;

    setPendingAppTransition(null);
    setShouldRevealNotificationOnHome(false);
    setAppPlayMode("shell");
    setShellAppType("call");
    enterCurrentApp();
  }, [isCallConnected, enterCurrentApp]);

  const handleAppOpen = useCallback(
    (selectedAppType: AppType) => {
      setHomeNotificationOverride(null);

      if (selectedAppType === "call" && isCallConnected) {
        setPendingAppTransition(null);
        setShouldRevealNotificationOnHome(false);
        setAppPlayMode("scenario");
        setShellAppType(null);
        enterCurrentApp();
        return;
      }

      if (
        selectedAppType === "call" &&
        isAwaitingOutboundDial(currentNode, hasCompletedOutboundDial)
      ) {
        openOutboundDialShell();
        return;
      }

      if (selectedAppType === currentNode?.app_type) {
        setPendingAppTransition(null);
        setShouldRevealNotificationOnHome(false);
        setAppPlayMode("scenario");
        setShellAppType(null);
        setHasOpenedCurrentApp(true);
        if (selectedAppType === "call") {
          setCallConnected(true);
        }
        enterCurrentApp();
        return;
      }

      setAppPlayMode("shell");
      setShellAppType(selectedAppType);
      enterCurrentApp();
    },
    [
      currentNode,
      hasCompletedOutboundDial,
      isCallConnected,
      openOutboundDialShell,
      setCallConnected,
      enterCurrentApp,
    ],
  );

  const handleConfirmAppTransition = useCallback(() => {
    if (!pendingAppTransition) return;

    if (
      pendingAppTransition.targetAppType === "call" &&
      isAwaitingOutboundDial(currentNode, hasCompletedOutboundDial)
    ) {
      openOutboundDialShell();
      return;
    }

    setPendingAppTransition(null);
    setShouldRevealNotificationOnHome(false);
    setAppPlayMode("scenario");
    setShellAppType(null);
    setHasOpenedCurrentApp(true);
    if (pendingAppTransition.targetAppType === "call") {
      setCallConnected(true);
    }
    enterCurrentApp();
  }, [
    pendingAppTransition,
    currentNode,
    hasCompletedOutboundDial,
    openOutboundDialShell,
    setCallConnected,
    enterCurrentApp,
  ]);

  const handleOutboundDialConnect = useCallback(() => {
    setHasCompletedOutboundDial(true);
    setCallConnected(true);
    setOutboundDialDraft("");
    setAppPlayMode("scenario");
    setShellAppType(null);
    setHasOpenedCurrentApp(true);
  }, [setCallConnected, setOutboundDialDraft]);

  const handleHangUpCall = useCallback(() => {
    if (!currentNode || currentNode.app_type !== "call" || currentNode.is_ending) {
      stopActiveCall();
      setStreamingMessage("");
      setAppPlayMode("scenario");
      setShellAppType(null);
      exitToHome();
      return;
    }

    stopActiveCall();
    setStreamingMessage("");
    setIsAwaitingResponse(false);
    setPendingAppTransition(null);

    if (shouldPromptOutboundRedial(currentNode)) {
      const priorMessageChannel = resolvePriorMessageChannel(
        lastMessageContactRef.current,
        chatHistory,
        currentNode.sender_name,
      );

      if (priorMessageChannel) {
        appendChatEntry({
          speaker: "scammer",
          messageText: buildHangUpFollowUpMessage(currentNode),
          nodeId: priorMessageChannel.nodeId,
          appType: priorMessageChannel.appType,
        });
        setHasCompletedOutboundDial(false);
        setHomeNotificationOverride({
          appType: priorMessageChannel.appType,
          senderName: priorMessageChannel.senderName,
        });
        setHasOpenedCurrentApp(false);
        setShouldRevealNotificationOnHome(true);
        setAppPlayMode("scenario");
        setShellAppType(null);
        exitToHome();
        return;
      }

      setHasCompletedOutboundDial(false);
      beginOutboundDialPrompt(outboundRedialTransitionPrompt);
      return;
    }

    setHasOpenedCurrentApp(false);
    setShouldRevealNotificationOnHome(true);
    setHomeNotificationOverride(null);
    setAppPlayMode("scenario");
    setShellAppType(null);
    exitToHome();
  }, [
    currentNode,
    chatHistory,
    stopActiveCall,
    appendChatEntry,
    beginOutboundDialPrompt,
    exitToHome,
  ]);

  const handleDismissAppTransition = useCallback(() => {
    setPendingAppTransition(null);
  }, []);

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
    setPendingAppTransition(null);
    setShouldRevealNotificationOnHome(false);
    setHasCompletedOutboundDial(true);
    setHomeNotificationOverride(null);
    lastMessageContactRef.current = null;
    setAppPlayMode("scenario");
    setShellAppType(null);
    setIsEditingOnboardingProfile(false);
    resetGame();
  }, [resetGame]);

  const handleProfileSubmit = useCallback(
    (profileValue: NonNullable<typeof userProfile>) => {
      setUserProfile(profileValue);
      setIsEditingOnboardingProfile(false);
    },
    [setUserProfile],
  );

  const handleEditOnboardingProfile = useCallback(() => {
    scenarioSelectGenerationRef.current += 1;
    setIsStartingScenario(false);
    setIsEditingOnboardingProfile(true);
  }, []);

  const activeAppTypeForStatusBar = useMemo((): AppType | null => {
    if (gamePhase !== "playing") return null;
    if (appPlayMode === "shell") return shellAppType;
    return currentNode?.app_type ?? null;
  }, [gamePhase, appPlayMode, shellAppType, currentNode?.app_type]);

  const statusBarContentStyle = useMemo(
    () =>
      resolveStatusBarContentStyle(
        gamePhase,
        activeAppTypeForStatusBar,
        appPlayMode,
      ),
    [gamePhase, activeAppTypeForStatusBar, appPlayMode],
  );

  if (!isHydrated) {
    return <div className="h-dvh w-full max-w-[430px]" aria-hidden />;
  }

  // ── 온보딩 (폰 프레임 밖) ──
  if (gamePhase === "onboarding") {
    const shouldShowScenarioRecommendation =
      userProfile && !isEditingOnboardingProfile;

    return shouldShowScenarioRecommendation ? (
      <ScenarioRecommendation
        userProfile={userProfile}
        onScenarioSelect={handleScenarioSelect}
        onEditProfile={handleEditOnboardingProfile}
        isStarting={isStartingScenario}
      />
    ) : (
      <OnboardingForm
        initialProfile={userProfile ?? undefined}
        onProfileSubmit={handleProfileSubmit}
      />
    );
  }

  return (
    <StatusBarOverrideProvider>
      <PhoneFrameShell statusBarContentStyle={statusBarContentStyle}>
      {gamePhase === "home" && currentNode && (
        <div className="relative h-full">
          <HomeScreen
            notificationAppType={
              homeNotificationOverride?.appType ?? currentNode.app_type
            }
            notificationSenderName={
              homeNotificationOverride?.senderName ?? currentNode.sender_name
            }
            onAppOpen={handleAppOpen}
            showNotificationWithoutDelay={
              !!homeNotificationOverride ||
              ((hasOpenedCurrentApp || shouldRevealNotificationOnHome) &&
                !awaitingOutboundDial)
            }
            suppressIncomingCallAlert={
              hasOpenedCurrentApp || awaitingOutboundDial
            }
          />
          {pendingAppTransition && !isCallConnected && (
            <AppTransitionConfirm
              targetAppType={pendingAppTransition.targetAppType}
              promptText={pendingAppTransition.promptText}
              onConfirmOpen={handleConfirmAppTransition}
              onDismiss={handleDismissAppTransition}
            />
          )}
        </div>
      )}

      {gamePhase === "playing" && appPlayMode === "shell" && shellAppType && (
        <div className="h-full">
          <HomeAppShell
            appType={shellAppType}
            onExitToHome={handleExitToHome}
            chatHistory={chatHistory}
            scenarioSenderName={
              homeNotificationOverride?.senderName ??
              currentNode?.sender_name ??
              null
            }
            pendingOutboundDialNumber={pendingOutboundDialNumber}
            onOutboundDialConnect={handleOutboundDialConnect}
            outboundDialDraft={outboundDialDraft}
            onOutboundDialDraftChange={setOutboundDialDraft}
          />
        </div>
      )}

      {gamePhase === "playing" &&
        appPlayMode === "scenario" &&
        currentNode && (
          <div className="h-full">
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
              onHangUpCall={handleHangUpCall}
              onTimerExpire={handleTimerExpire}
            />
          </div>
        )}

      {gamePhase === "ending" && endingType && (
        <div className="h-full">
          <EndingReport
            endingType={endingType}
            scenarioTitle={scenarioTitle}
            endingConsequence={currentNode?.ending_consequence ?? null}
            riskSignalRecords={riskSignalRecords}
            onRestartGame={handleRestartGame}
          />
        </div>
      )}
      </PhoneFrameShell>
    </StatusBarOverrideProvider>
  );
}
