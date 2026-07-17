import type { InputTutorialMode } from "@/components/phone/shared/InputTutorialBanner";
import type { PublicNodeView } from "@/lib/scenario/public-node";
import type { ChatHistoryEntry, NodeOption, ScenarioId } from "@/lib/scenario/types";

/**
 * 모든 폰 앱 컴포넌트(범용 렌더러)가 공유하는 props.
 * 페르소나별 분기는 데이터(currentNode)로만 처리하고 컴포넌트 분기는 만들지 않는다.
 */
export interface PhoneAppSharedProps {
  activeScenarioId: ScenarioId | null;
  currentNode: PublicNodeView;
  chatHistory: ChatHistoryEntry[];
  /** LLM이 스트리밍 중인 텍스트 (타이핑 효과) */
  streamingMessage: string;
  /** 현재 노드에서 선택 가능한 답안 (예시 패널 토글로 공개) */
  availableOptions: NodeOption[];
  /** 첫 턴 입력 튜토리얼 모드 (메신저 vs 통화) */
  inputTutorialMode: InputTutorialMode | null;
  isInputTutorialVisible: boolean;
  onDismissInputTutorial: () => void;
  isAwaitingResponse: boolean;
  onSelectOption: (optionLabel: string) => void;
  onSubmitFreeInput: (inputText: string) => void;
  /** 사진 요구 노드 — 갤러리 선택 후 judge 제출 */
  onPhotoSendSubmit: (imagePath: string, optionLabel: string) => void;
  /** 홈 화면으로 복귀 (뒤로가기) */
  onExitToHome: () => void;
  /** 통화 종료 — 연결을 끊고 홈으로 */
  onHangUpCall: () => void;
}
