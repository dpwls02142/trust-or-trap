import type { AppType, ScenarioId } from "./types";

/**
 * 온보딩 추천 화면용 시나리오 메타 카탈로그 (클라이언트 안전 — 비밀 없음).
 * 제목/시놉시스는 그래프 JSON과 동일하게 유지한다.
 */

export interface ScenarioCatalogEntry {
  scenarioId: ScenarioId;
  scenarioTitle: string;
  scenarioSynopsis: string;
  crimeLabel: string;
  voiceEnabled: boolean;
  /** 홈 화면에서 알림이 도착하는 앱 */
  entryAppType: AppType;
}

export const scenarioCatalog: Record<ScenarioId, ScenarioCatalogEntry> = {
  "teen-female-grooming": {
    scenarioId: "teen-female-grooming",
    scenarioTitle: "낯선 DM에서 시작된 대화",
    scenarioSynopsis:
      "SNS DM으로 다가와 고민을 들어주던 사람이 조금씩 이상한 요구를 하기 시작한다.",
    crimeLabel: "디지털 성범죄(온라인 그루밍)",
    voiceEnabled: false,
    entryAppType: "insta",
  },
  "teen-male-gameitem": {
    scenarioId: "teen-male-gameitem",
    scenarioTitle: "반값 아이템의 함정",
    scenarioSynopsis:
      "게임 커뮤니티에서 만난 판매자가 시세 반값에 희귀 아이템을 넘기겠다고 한다.",
    crimeLabel: "게임 아이템 사기 / 몸캠피싱",
    voiceEnabled: false,
    entryAppType: "chat",
  },
  "twenties-female-romance": {
    scenarioId: "twenties-female-romance",
    scenarioTitle: "완벽한 그 사람의 부탁",
    scenarioSynopsis:
      "데이팅앱에서 만난 다정한 사람이 몇 주 뒤 곤란한 사정을 이야기하며 도움을 청한다.",
    crimeLabel: "로맨스 스캠",
    voiceEnabled: true,
    entryAppType: "chat",
  },
  "twenties-male-voicephishing": {
    scenarioId: "twenties-male-voicephishing",
    scenarioTitle: "저금리 대환대출의 조건",
    scenarioSynopsis:
      "저금리 대환대출 문자를 받고 상담을 시작하자, 상담원이 앱 설치와 선상환을 요구한다.",
    crimeLabel: "알바위장 대출빙자형 보이스피싱",
    voiceEnabled: true,
    entryAppType: "sms",
  },
  "middle-invest-scam": {
    scenarioId: "middle-invest-scam",
    scenarioTitle: "수익 인증이 넘치는 리딩방",
    scenarioSynopsis:
      "지인 추천으로 들어간 오픈채팅방에서 '전문가'가 종목을 찍어주고, 다들 수익 인증을 올린다.",
    crimeLabel: "투자리딩방",
    voiceEnabled: true,
    entryAppType: "chat",
  },
  "fifties-loan-scam": {
    scenarioId: "fifties-loan-scam",
    scenarioTitle: "정책자금 대환대출 안내 전화",
    scenarioSynopsis: "정부 정책자금으로 이자를 낮춰준다는 친절한 안내 전화가 걸려온다.",
    crimeLabel: "대환대출·정책자금 빙자형 보이스피싱",
    voiceEnabled: true,
    entryAppType: "sms",
  },
  "senior-authority-scam": {
    scenarioId: "senior-authority-scam",
    scenarioTitle: "검찰청에서 온 전화",
    scenarioSynopsis:
      "수사관을 자칭하는 사람이 '당신 계좌가 범죄에 연루됐다'며 다급하게 전화를 걸어온다.",
    crimeLabel: "기관사칭형 보이스피싱",
    voiceEnabled: true,
    entryAppType: "call",
  },
};
