import type { PublicNodeView } from "@/lib/scenario/public-node";
import type { ChatHistoryEntry, NodeOption } from "@/lib/scenario/types";

/**
 * 모든 폰 앱 컴포넌트(범용 렌더러)가 공유하는 props.
 * 페르소나별 분기는 데이터(currentNode)로만 처리하고 컴포넌트 분기는 만들지 않는다.
 */
export interface PhoneAppSharedProps {
  currentNode: PublicNodeView;
  chatHistory: ChatHistoryEntry[];
  /** LLM이 스트리밍 중인 텍스트 (타이핑 효과) */
  streamingMessage: string;
  /** 스트리밍 완료 후 표시할 선택지 (payload 기반) */
  activeOptions: NodeOption[];
  isAwaitingResponse: boolean;
  onSelectOption: (optionLabel: string) => void;
  onSubmitFreeInput: (inputText: string) => void;
}
