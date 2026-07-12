import { NextRequest } from "next/server";
import { findScenarioNode } from "@/lib/scenario/graph-loader";
import { judgeRequestSchema, judgeVerdictSchema } from "@/lib/scenario/schemas";
import {
  buildJudgeSystemPrompt,
  getGeminiClient,
  isQuotaOrOverloadError,
  resolveGeminiFallbackModel,
  resolveGeminiModel,
  resolveThinkingConfig,
} from "@/lib/server/gemini-client";
import { toPublicNodeView } from "@/lib/scenario/public-node";
import { isRateLimited, resolveClientKey } from "@/lib/server/rate-limiter";
import type { ScenarioNode } from "@/lib/scenario/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

/**
 * POST /api/scenario/judge — 사용자 응답의 risk_flag를 판정하고
 * 그래프 next_node_map으로 다음 노드를 결정해 반환한다.
 *
 * 선택지 클릭(risk_flag가 그래프에 이미 정의됨)도 자유 입력도 모두 이 엔드포인트를 쓰되,
 * 자유 입력만 Gemini 판정을 거친다 — 불필요한 LLM 호출을 줄여 지연/비용 최소화.
 */
export async function POST(request: NextRequest) {
  if (isRateLimited(`judge:${resolveClientKey(request)}`, 30)) {
    return Response.json({ errorMessage: "요청이 너무 많습니다" }, { status: 429 });
  }

  const parsedBody = judgeRequestSchema.safeParse(await request.json().catch(() => null));
  if (!parsedBody.success) {
    return Response.json(
      { errorMessage: "잘못된 요청 형식", issues: parsedBody.error.issues },
      { status: 400 },
    );
  }

  const { scenarioId, nodeId, userResponseText } = parsedBody.data;

  let currentNode: ScenarioNode;
  try {
    currentNode = findScenarioNode(scenarioId, nodeId);
  } catch {
    return Response.json({ errorMessage: "존재하지 않는 시나리오/노드" }, { status: 404 });
  }

  if (currentNode.is_ending || !currentNode.next_node_map) {
    return Response.json({ errorMessage: "엔딩 노드에서는 판정할 수 없음" }, { status: 400 });
  }

  // 1) 노드에 정의된 선택지와 정확히 일치하면 그래프의 risk_flag를 그대로 사용 (LLM 호출 생략)
  const matchedOption = currentNode.options.find(
    (optionItem) => optionItem.label === userResponseText,
  );

  let riskFlag: "safe" | "caution" | "risky";
  let judgeReason: string;

  if (matchedOption) {
    riskFlag = matchedOption.risk_flag;
    judgeReason = "노드에 정의된 선택지";
  } else {
    // 2) 자유 입력(텍스트/STT) → Gemini 판정
    try {
      const geminiClient = getGeminiClient();
      // thinking 토큰이 maxOutputTokens에 포함되므로 여유 있게 확보 (부족 시 JSON이 잘림)
      const requestJudgeWithModel = (modelName: string) =>
        geminiClient.models.generateContent({
          model: modelName,
          contents: `사용자 응답: "${userResponseText}"`,
          config: {
            systemInstruction: buildJudgeSystemPrompt(currentNode),
            maxOutputTokens: 256,
            responseMimeType: "application/json",
            thinkingConfig: resolveThinkingConfig(modelName),
          },
        });

      let judgeResponse;
      try {
        judgeResponse = await requestJudgeWithModel(resolveGeminiModel());
      } catch (primaryModelError) {
        // 무료 티어 쿼터(429)/일시 과부하(503) → 쿼터가 모델별로 분리된 대체 모델로 재시도
        if (!isQuotaOrOverloadError(primaryModelError)) throw primaryModelError;
        console.warn(`[judge] 기본 모델 쿼터/과부하 — ${resolveGeminiFallbackModel()}로 폴백`);
        judgeResponse = await requestJudgeWithModel(resolveGeminiFallbackModel());
      }

      const responseText = (judgeResponse.text ?? "")
        .replace(/^```(?:json)?\s*/i, "")
        .replace(/\s*```\s*$/, "")
        .trim();

      const parsedVerdict = judgeVerdictSchema.parse(JSON.parse(responseText));
      riskFlag = parsedVerdict.risk_flag;
      judgeReason = parsedVerdict.reason;
    } catch (judgeError) {
      console.error("[judge] 판정 실패:", judgeError);
      // 판정 실패 시 보수적으로 caution 처리해 시뮬레이션이 끊기지 않게 한다
      riskFlag = "caution";
      judgeReason = "판정 실패 — 보수적 기본값";
    }
  }

  const nextNodeId = currentNode.next_node_map[riskFlag];
  const nextNode = findScenarioNode(scenarioId, nextNodeId);

  return Response.json({
    riskFlag,
    judgeReason,
    nextNodeId,
    nextNode: toPublicNodeView(nextNode),
  });
}
