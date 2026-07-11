import "server-only";

import { scenarioGraphSchema } from "./schemas";
import type { ScenarioGraph, ScenarioId, ScenarioNode } from "./types";

import teenFemaleGroomingGraph from "@/scenarios/graphs/teen-female-grooming.json";
import teenMaleGameitemGraph from "@/scenarios/graphs/teen-male-gameitem.json";
import twentiesFemaleRomanceGraph from "@/scenarios/graphs/twenties-female-romance.json";
import twentiesMaleVoicephishingGraph from "@/scenarios/graphs/twenties-male-voicephishing.json";
import middleInvestScamGraph from "@/scenarios/graphs/middle-invest-scam.json";
import fiftiesLoanScamGraph from "@/scenarios/graphs/fifties-loan-scam.json";
import seniorAuthorityScamGraph from "@/scenarios/graphs/senior-authority-scam.json";

/**
 * 시나리오 그래프 로더 (서버 전용).
 * 정적 import → 빌드 시 번들에 포함되고, 첫 접근 때 Zod 검증 후 메모리 캐시.
 * 그래프는 노드 스펙(위험 신호·금지 콘텐츠)을 포함하므로 클라이언트로 전체를 내보내지 않는다.
 */

const rawGraphSourceMap: Record<ScenarioId, unknown> = {
  "teen-female-grooming": teenFemaleGroomingGraph,
  "teen-male-gameitem": teenMaleGameitemGraph,
  "twenties-female-romance": twentiesFemaleRomanceGraph,
  "twenties-male-voicephishing": twentiesMaleVoicephishingGraph,
  "middle-invest-scam": middleInvestScamGraph,
  "fifties-loan-scam": fiftiesLoanScamGraph,
  "senior-authority-scam": seniorAuthorityScamGraph,
};

const validatedGraphCache = new Map<ScenarioId, ScenarioGraph>();

export function loadScenarioGraph(scenarioId: ScenarioId): ScenarioGraph {
  const cachedGraph = validatedGraphCache.get(scenarioId);
  if (cachedGraph) return cachedGraph;

  const parsedGraph = scenarioGraphSchema.parse(rawGraphSourceMap[scenarioId]);
  if (parsedGraph.scenario_id !== scenarioId) {
    throw new Error(
      `그래프 파일 불일치: 요청 "${scenarioId}" ≠ 파일 내부 "${parsedGraph.scenario_id}"`,
    );
  }

  validatedGraphCache.set(scenarioId, parsedGraph as ScenarioGraph);
  return parsedGraph as ScenarioGraph;
}

export function findScenarioNode(
  scenarioId: ScenarioId,
  nodeId: string,
): ScenarioNode {
  const scenarioGraph = loadScenarioGraph(scenarioId);
  const foundNode = scenarioGraph.nodes.find(
    (nodeItem) => nodeItem.node_id === nodeId,
  );
  if (!foundNode) {
    throw new Error(`시나리오 "${scenarioId}"에 노드 "${nodeId}" 없음`);
  }
  return foundNode;
}
