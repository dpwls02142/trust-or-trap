import type {
  AppType,
  EndingType,
  NodeOption,
  ScenarioNode,
  StageValue,
} from "./types";

/**
 * 클라이언트로 내려보내는 노드 공개 뷰.
 * forbidden_content(LLM 내부 정책)와 next_node_map(분기 스포일러)은 제외한다.
 * required_risk_signal은 리플레이 리포트("놓친 위험 신호")에 필요해 포함.
 */
export interface PublicNodeView {
  node_id: string;
  stage: StageValue;
  app_type: AppType;
  required_risk_signal: string;
  options: NodeOption[];
  allow_free_input: boolean;
  voice_enabled: boolean;
  is_ending: boolean;
  ending_type: EndingType | null;
  sender_name: string;
  elapsed_days: number | null;
  timer_seconds: number | null;
  outbound_dial_number: string | null;
}

export function toPublicNodeView(scenarioNode: ScenarioNode): PublicNodeView {
  return {
    node_id: scenarioNode.node_id,
    stage: scenarioNode.stage,
    app_type: scenarioNode.app_type,
    required_risk_signal: scenarioNode.required_risk_signal,
    options: scenarioNode.options,
    allow_free_input: scenarioNode.allow_free_input,
    voice_enabled: scenarioNode.voice_enabled,
    is_ending: scenarioNode.is_ending,
    ending_type: scenarioNode.ending_type,
    sender_name: scenarioNode.sender_name,
    elapsed_days: scenarioNode.elapsed_days ?? null,
    timer_seconds: scenarioNode.timer_seconds ?? null,
    outbound_dial_number: scenarioNode.outbound_dial_number ?? null,
  };
}
