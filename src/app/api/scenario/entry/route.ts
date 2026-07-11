import { NextRequest } from "next/server";
import { z } from "zod";
import { findScenarioNode, loadScenarioGraph } from "@/lib/scenario/graph-loader";
import { scenarioIdSchema } from "@/lib/scenario/schemas";
import { toPublicNodeView } from "@/lib/scenario/public-node";

export const runtime = "nodejs";

const entryRequestSchema = z.object({ scenarioId: scenarioIdSchema });

/**
 * POST /api/scenario/entry — 시나리오 시작 노드(공개 뷰)와 메타 반환.
 */
export async function POST(request: NextRequest) {
  const parsedBody = entryRequestSchema.safeParse(await request.json().catch(() => null));
  if (!parsedBody.success) {
    return Response.json({ errorMessage: "잘못된 요청 형식" }, { status: 400 });
  }

  const scenarioGraph = loadScenarioGraph(parsedBody.data.scenarioId);
  const entryNode = findScenarioNode(scenarioGraph.scenario_id, scenarioGraph.entry_node_id);

  return Response.json({
    scenarioId: scenarioGraph.scenario_id,
    scenarioTitle: scenarioGraph.title,
    voiceEnabled: scenarioGraph.voice_enabled,
    entryNode: toPublicNodeView(entryNode),
  });
}
