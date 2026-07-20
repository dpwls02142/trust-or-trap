import type { AppType, ChatHistoryEntry, ScenarioId } from "./types";

/** 프롤로그·과거 대화 연출용 고정 nodeId — LLM advance/judge 대상 아님 */
export const scenarioPrologueNodeId = "scenario-prologue";

/** 잠금 해제 후 홈 탐색 시간(ms) — 이후 메인 알림·배지 표시 */
export const homeExplorationDelayMs = 8000;

export interface LockScreenNotificationSpec {
  appType: Exclude<AppType, "home">;
  senderName: string;
  /** 메시지·통화 내용 미리보기 — '새 메시지' 같은 메타 문구 없이 대사만 */
  previewText: string;
  relativeTimeLabel?: string;
}

export interface PrologueThreadSpec {
  appType: Exclude<AppType, "home">;
  contactName: string;
}

interface PrologueMessageTemplate {
  speaker: ChatHistoryEntry["speaker"];
  messageText: string;
  elapsedDays?: number;
}

interface ScenarioContextSetupEntry {
  /** 온보딩 — 시놉시스 대신 짧은 몰입 안내 */
  simulationIntroLine: string;
  lockScreenNotifications: LockScreenNotificationSpec[];
  prologueThread: PrologueThreadSpec;
  prologueMessages: PrologueMessageTemplate[];
}

const scenarioContextSetupMap: Record<ScenarioId, ScenarioContextSetupEntry> = {
  "teen-female-grooming": {
    simulationIntroLine:
      "며칠 전 포토그램 DM으로 말 걸어 온 낯선 계정과 연락을 이어오고 있습니다.",
    lockScreenNotifications: [
      {
        appType: "insta",
        senderName: "hyun_98",
        previewText: "오늘도 수업 힘들었겠다 ㅠㅠ 푹 쉬어",
        relativeTimeLabel: "1시간 전",
      },
      {
        appType: "insta",
        senderName: "hyun_98",
        previewText: "요즘 고민 있으면 언제든 말해",
        relativeTimeLabel: "방금",
      },
    ],
    prologueThread: { appType: "insta", contactName: "hyun_98" },
    prologueMessages: [
      {
        speaker: "scammer",
        messageText: "우연히 프로필 봤는데 그림 잘 그리네!",
        elapsedDays: 3,
      },
      {
        speaker: "player",
        messageText: "고마워 ㅎㅎ",
        elapsedDays: 3,
      },
      {
        speaker: "scammer",
        messageText: "요즘 학교 생활 어때? 힘들면 말해도 돼",
        elapsedDays: 8,
      },
      {
        speaker: "player",
        messageText: "그냥 그래... 시험 기간이라 좀 지쳐",
        elapsedDays: 8,
      },
      {
        speaker: "scammer",
        messageText: "많이 힘들겠다. 나한테는 편하게 말해도 돼",
        elapsedDays: 14,
      },
    ],
  },
  "teen-male-gameitem": {
    simulationIntroLine:
      "게임 커뮤니티에서 아이템 거래 글을 올린 뒤, 낯선 판매자에게 연락이 왔습니다.",
    lockScreenNotifications: [
      {
        appType: "chat",
        senderName: "아이템창고",
        previewText: "레전드템 반값에 팝니다 — 선입금 후 즉시 전달",
        relativeTimeLabel: "방금",
      },
    ],
    prologueThread: { appType: "chat", contactName: "아이템창고" },
    prologueMessages: [
      {
        speaker: "player",
        messageText: "던전 클리어 팀원 구합니다 ㅠㅠ",
      },
      {
        speaker: "scammer",
        messageText: "형 여기서 거래 많이 해. 레전드템 있는데 관심 있어?",
      },
      {
        speaker: "player",
        messageText: "얼마예요? 시세보다 싸면 생각해볼게요",
      },
    ],
  },
  "twenties-female-romance": {
    simulationIntroLine:
      "2주 전 데이팅앱에서 매칭된 상대와 매일 밤까지 연락해 왔습니다.",
    lockScreenNotifications: [
      {
        appType: "chat",
        senderName: "도현",
        previewText: "오늘 하루도 수고했어 😊 내일도 연락하자",
        relativeTimeLabel: "30분 전",
      },
      {
        appType: "chat",
        senderName: "도현",
        previewText: "갑자기 연락해서 미안한데, 오늘 네 생각 많이 났어",
        relativeTimeLabel: "방금",
      },
    ],
    prologueThread: { appType: "chat", contactName: "도현" },
    prologueMessages: [
      {
        speaker: "scammer",
        messageText: "매칭됐다! 프로필 되게 따뜻해 보여서 먼저 인사할게",
        elapsedDays: 1,
      },
      {
        speaker: "player",
        messageText: "안녕~ 나도 프로필 보고 좋았어",
        elapsedDays: 1,
      },
      {
        speaker: "scammer",
        messageText: "요즘 일 바빠서 연락 못 한 날도 있는데 이해해줘서 고마워",
        elapsedDays: 7,
      },
      {
        speaker: "player",
        messageText: "괜찮아 ㅎㅎ 바쁘면 바쁜 거지",
        elapsedDays: 7,
      },
      {
        speaker: "scammer",
        messageText: "맨날 밤에 {displayName} 얘기만 하다 자 ㅎㅎ",
        elapsedDays: 14,
      },
    ],
  },
  "twenties-male-voicephishing": {
    simulationIntroLine:
      "대출 상환일이 다가오던 어느 날, 폰에 모르는 번호에서 문자가 왔습니다.",
    lockScreenNotifications: [
      {
        appType: "sms",
        senderName: "한빛은행",
        previewText: "이번 달 대출 이자 납부일은 25일입니다",
        relativeTimeLabel: "1시간 전",
      },
      {
        appType: "sms",
        senderName: "한빛캐피탈",
        previewText: "[Web발신] 정부지원 저금리 대환대출 안내 — 상담 1588-1588",
        relativeTimeLabel: "방금",
      },
    ],
    prologueThread: { appType: "sms", contactName: "베프" },
    prologueMessages: [
      {
        speaker: "scammer",
        messageText: "{displayName}야 대출 갚기 빡세지 ㅠㅠ 괜찮아?",
      },
      {
        speaker: "player",
        messageText: "응 좀 빡세긴 해... 이번 달도 빠듯해",
      },
    ],
  },
  "middle-invest-scam": {
    simulationIntroLine:
      "지난주 친구가 투자 오픈채팅방 링크를 보내 왔고, 오늘 또 연락이 왔습니다.",
    lockScreenNotifications: [
      {
        appType: "chat",
        senderName: "김민수",
        previewText: "형 진짜 이 방 수익 미쳤어 ㄷㄷ 한번만 봐봐",
        relativeTimeLabel: "10분 전",
      },
      {
        appType: "sms",
        senderName: "VIP투자연구소",
        previewText: "[Web발신] 수익률 300% 무료 VIP 리딩방 초대",
        relativeTimeLabel: "방금",
      },
    ],
    prologueThread: { appType: "chat", contactName: "김민수" },
    prologueMessages: [
      {
        speaker: "scammer",
        messageText: "형! 요즘 주식 안 해? 친구가 VIP 리딩방 알려줬는데 대박이야",
      },
      {
        speaker: "player",
        messageText: "리딩방? 요즘 사기 많다던데...",
      },
      {
        speaker: "scammer",
        messageText: "나도 처음엔 반신반의했는데 무료라 구경만 해봤어. 수익 인증 미쳤음",
      },
      {
        speaker: "player",
        messageText: "그래? 링크 한번 보내봐",
      },
    ],
  },
  "fifties-loan-scam": {
    simulationIntroLine:
      "대출 이자 부담이 커지던 시기, 정책자금 안내 문자가 도착했습니다.",
    lockScreenNotifications: [
      {
        appType: "sms",
        senderName: "서민금융지원",
        previewText: "[Web발신] 정부 정책자금 특별 대환대출 대상자로 선정되셨습니다",
        relativeTimeLabel: "방금",
      },
    ],
    prologueThread: { appType: "sms", contactName: "딸" },
    prologueMessages: [
      {
        speaker: "scammer",
        messageText: "아빠 이번 달 이자 부담 너무 크지 않아요? 걱정돼요",
      },
      {
        speaker: "player",
        messageText: "괜찮아. 아빠가 알아서 할게.",
      },
      {
        speaker: "scammer",
        messageText: "무리하지 마세요. 필요하면 같이 은행 가요.",
      },
    ],
  },
  "senior-authority-scam": {
    simulationIntroLine:
      "평범한 오후, 딸에게 문자를 받은 직후 모르는 번호에서 전화가 왔습니다.",
    lockScreenNotifications: [
      {
        appType: "sms",
        senderName: "딸",
        previewText: "아빠 오늘 병원 예약 확인했어요. 저녁에 전화할게요",
        relativeTimeLabel: "20분 전",
      },
      {
        appType: "call",
        senderName: "김수사관",
        previewText: "지금 전화 꼭 받으셔야 합니다. 계좌 조사 관련 긴급 안내입니다",
        relativeTimeLabel: "방금",
      },
    ],
    prologueThread: { appType: "sms", contactName: "딸" },
    prologueMessages: [
      {
        speaker: "scammer",
        messageText: "아빠 오늘 병원 예약 확인했어요. 저녁에 전화할게요",
      },
      {
        speaker: "player",
        messageText: "알았어. 다녀와서 연락해.",
      },
    ],
  },
};

function applyDisplayNameTemplate(
  templateText: string,
  displayName: string,
): string {
  return templateText.replaceAll("{displayName}", displayName);
}

export function resolveScenarioContextSetup(
  scenarioId: ScenarioId,
): ScenarioContextSetupEntry {
  return scenarioContextSetupMap[scenarioId];
}

export function buildScenarioPrologueEntries(
  scenarioId: ScenarioId,
  displayName: string,
): ChatHistoryEntry[] {
  const contextSetup = resolveScenarioContextSetup(scenarioId);
  const { prologueThread, prologueMessages } = contextSetup;

  return prologueMessages.map((messageTemplate) => ({
    speaker: messageTemplate.speaker,
    messageText: applyDisplayNameTemplate(
      messageTemplate.messageText,
      displayName,
    ),
    nodeId: scenarioPrologueNodeId,
    elapsedDays: messageTemplate.elapsedDays,
    appType: prologueThread.appType,
    contactName: prologueThread.contactName,
  }));
}

export function resolvePrologueThreadSpec(
  scenarioId: ScenarioId,
): PrologueThreadSpec {
  return resolveScenarioContextSetup(scenarioId).prologueThread;
}

export function resolveLockScreenNotifications(
  scenarioId: ScenarioId,
): LockScreenNotificationSpec[] {
  return resolveScenarioContextSetup(scenarioId).lockScreenNotifications;
}

export function resolveSimulationIntroLine(scenarioId: ScenarioId): string {
  return resolveScenarioContextSetup(scenarioId).simulationIntroLine;
}

/** 시나리오 앱 뷰에서 같은 연락처 프롤로그를 이어 보여줄지 */
export function shouldShowPrologueInScenarioView(
  entryItem: ChatHistoryEntry,
  currentSenderName: string,
  currentAppType: AppType,
): boolean {
  if (entryItem.nodeId !== scenarioPrologueNodeId) return true;

  return (
    entryItem.appType === currentAppType &&
    (entryItem.contactName === currentSenderName ||
      entryItem.contactName === undefined)
  );
}
