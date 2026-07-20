import { z } from "zod";
import { findBankToBankProgressionIssues } from "./bank-transfer-graph-rules";

/**
 * Zod 스키마 — 외부에서 들어오는 모든 데이터의 검증 레이어.
 * 그래프 JSON / API 요청 body / LLM 응답을 여기 스키마로 파싱한 뒤 사용한다.
 */

export const riskFlagSchema = z.enum(["safe", "caution", "risky"]);

export const endingTypeSchema = z.enum(["safe", "warning", "harm"]);

export const stageValueSchema = z.enum([
  "approach",
  "trust_building",
  "risk_signal",
  "demand",
  "branch",
  "ending",
]);

export const appTypeSchema = z.enum([
  "chat",
  "sms",
  "call",
  "insta",
  "bank",
  "browser",
  "home",
]);

export const scenarioIdSchema = z.enum([
  "teen-female-grooming",
  "teen-male-gameitem",
  "twenties-female-romance",
  "twenties-male-voicephishing",
  "middle-invest-scam",
  "fifties-loan-scam",
  "senior-authority-scam",
]);

export const crimeCategorySchema = z.enum([
  "grooming",
  "gameitem_scam",
  "romance_scam",
  "loan_voicephishing",
  "invest_scam",
  "authority_voicephishing",
]);

export const chatRoomKindSchema = z.enum(["direct", "open_group"]);

export const speakerToneSchema = z.enum([
  "professional_agent",
  "confident_expert",
  "intimate_partner",
  "community_peer",
  "family_casual",
]);

export const endingConsequenceSchema = z.object({
  consequence_headline: z.string().min(1),
  consequence_details: z.array(z.string().min(1)).min(1),
});

export const nodeOptionSchema = z.object({
  label: z.string().min(1),
  risk_flag: riskFlagSchema,
});

export const scenarioNodeSchema = z.object({
  node_id: z.string().min(1),
  stage: stageValueSchema,
  app_type: appTypeSchema,
  required_risk_signal: z.string().min(1),
  forbidden_content: z.array(z.string()),
  options: z.array(nodeOptionSchema),
  allow_free_input: z.boolean(),
  next_node_map: z
    .object({
      safe: z.string(),
      caution: z.string(),
      risky: z.string(),
    })
    .nullable(),
  voice_enabled: z.boolean(),
  is_ending: z.boolean(),
  ending_type: endingTypeSchema.nullable(),
  ending_consequence: endingConsequenceSchema.optional(),
  speaker_tone: speakerToneSchema.optional(),
  sender_name: z.string().min(1),
  elapsed_days: z.number().int().nonnegative().optional(),
  timer_seconds: z.number().int().positive().optional(),
  outbound_dial_number: z
    .string()
    .regex(/^[\d-]+$/, "outbound_dial_number는 숫자와 하이픈만 허용")
    .optional(),
  chat_room_kind: chatRoomKindSchema.optional(),
});

export const scenarioGraphSchema = z
  .object({
    scenario_id: scenarioIdSchema,
    crime_category: crimeCategorySchema,
    title: z.string().min(1),
    synopsis: z.string().min(1),
    voice_enabled: z.boolean(),
    entry_node_id: z.string().min(1),
    nodes: z.array(scenarioNodeSchema).min(1),
  })
  .superRefine((graphValue, refineContext) => {
    const nodeIdSet = new Set(
      graphValue.nodes.map((nodeItem) => nodeItem.node_id),
    );

    if (!nodeIdSet.has(graphValue.entry_node_id)) {
      refineContext.addIssue({
        code: "custom",
        message: `entry_node_id "${graphValue.entry_node_id}" 노드가 존재하지 않음`,
      });
    }

    for (const nodeItem of graphValue.nodes) {
      // teen 시나리오 안전 불변: 음성 절대 미적용
      if (
        graphValue.scenario_id.startsWith("teen-") &&
        nodeItem.voice_enabled
      ) {
        refineContext.addIssue({
          code: "custom",
          message: `teen 시나리오 노드 "${nodeItem.node_id}"는 voice_enabled=false여야 함`,
        });
      }

      if (nodeItem.is_ending) {
        if (!nodeItem.ending_type) {
          refineContext.addIssue({
            code: "custom",
            message: `엔딩 노드 "${nodeItem.node_id}"에 ending_type 누락`,
          });
        }
        if (!nodeItem.ending_consequence) {
          refineContext.addIssue({
            code: "custom",
            message: `엔딩 노드 "${nodeItem.node_id}"에 ending_consequence 누락 (행동→결과 필수)`,
          });
        }
      } else {
        if (!nodeItem.next_node_map) {
          refineContext.addIssue({
            code: "custom",
            message: `비엔딩 노드 "${nodeItem.node_id}"에 next_node_map 누락 (막다른 노드)`,
          });
        } else {
          for (const nextNodeId of Object.values(nodeItem.next_node_map)) {
            if (!nodeIdSet.has(nextNodeId)) {
              refineContext.addIssue({
                code: "custom",
                message: `노드 "${nodeItem.node_id}"의 next_node_map이 존재하지 않는 "${nextNodeId}" 참조`,
              });
            }
          }
        }
      }
    }

    for (const issueMessage of findBankToBankProgressionIssues(graphValue.nodes)) {
      refineContext.addIssue({
        code: "custom",
        message: issueMessage,
      });
    }
  });

/** LLM 대사 생성 응답 — 구조화 JSON 강제 */
export const advancePayloadSchema = z.object({
  message: z.string().min(1),
  sender: z.string().min(1),
  options: z.array(nodeOptionSchema),
  risk_flags: z.array(z.string()),
});

/** LLM risk_flag 판정 응답 */
export const judgeVerdictSchema = z.object({
  risk_flag: riskFlagSchema,
  reason: z.string(),
});

// ── API 요청 body 스키마 ──────────────────────────────

export const chatHistoryEntrySchema = z.object({
  speaker: z.enum(["scammer", "player", "system"]),
  messageText: z.string().max(1000),
  nodeId: z.string().max(100),
  elapsedDays: z.number().int().nonnegative().optional(),
  appType: appTypeSchema.optional(),
  contactName: z.string().max(40).optional(),
});

export const userProfileSchema = z.object({
  displayName: z.string().min(1).max(20),
  userAge: z.number().int().min(10).max(120),
  gender: z.enum(["female", "male"]),
});

export const advanceRequestSchema = z.object({
  scenarioId: scenarioIdSchema,
  nodeId: z.string().min(1),
  chatHistory: z.array(chatHistoryEntrySchema).max(60),
  userProfile: userProfileSchema,
  /** 직전 플레이어 응답에 대한 judge 판정 — 대사가 플레이어 태도에 반응하도록 프롬프트에 주입 */
  lastPlayerRiskFlag: riskFlagSchema.optional(),
});

export const judgeRequestSchema = z.object({
  scenarioId: scenarioIdSchema,
  nodeId: z.string().min(1),
  userResponseText: z.string().min(1).max(500),
});

export const ttsStreamRequestSchema = z.object({
  scenarioId: scenarioIdSchema,
  sentenceText: z.string().min(1).max(500),
  previousText: z.string().max(500).optional(),
});
