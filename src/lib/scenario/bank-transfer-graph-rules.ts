import type { RiskFlag, ScenarioNode } from "./types";

/**
 * 비엔딩 은행 노드에서 caution/risky가 또 다른 비엔딩 은행 노드로
 * 이어지면 이체 UI를 두 번 거쳐야 엔딩에 도달한다.
 */
export function findBankToBankProgressionIssues(
  nodeList: ScenarioNode[],
): string[] {
  const nodeMap = new Map(nodeList.map((nodeItem) => [nodeItem.node_id, nodeItem]));
  const issueList: string[] = [];
  const transferRiskFlagList: RiskFlag[] = ["caution", "risky"];

  for (const nodeItem of nodeList) {
    if (nodeItem.is_ending || nodeItem.app_type !== "bank" || !nodeItem.next_node_map) {
      continue;
    }

    for (const riskFlag of transferRiskFlagList) {
      const nextNodeId = nodeItem.next_node_map[riskFlag];
      const nextNode = nodeMap.get(nextNodeId);

      if (nextNode && !nextNode.is_ending && nextNode.app_type === "bank") {
        issueList.push(
          `은행 노드 "${nodeItem.node_id}"의 ${riskFlag} 분기가 비엔딩 은행 노드 "${nextNodeId}"로 연결됨 — 이체 2회 필요`,
        );
      }
    }
  }

  return issueList;
}
