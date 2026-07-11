import { z } from "zod";

/**
 * Zod ??? ? ???? ???? ?? ???? ?? ???.
 * ??? JSON / API ?? body / LLM ??? ?? ???? ??? ? ????.
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
  sender_name: z.string().min(1),
  elapsed_days: z.number().int().nonnegative().optional(),
  timer_seconds: z.number().int().positive().optional(),
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
    const nodeIdSet = new Set(graphValue.nodes.map((nodeItem) => nodeItem.node_id));

    if (!nodeIdSet.has(graphValue.entry_node_id)) {
      refineContext.addIssue({
        code: "custom",
        message: `entry_node_id "${graphValue.entry_node_id}" ??? ???? ??`,
      });
    }

    for (const nodeItem of graphValue.nodes) {
      // teen ???? ?? ??: ?? ?? ???
      if (graphValue.scenario_id.startsWith("teen-") && nodeItem.voice_enabled) {
        refineContext.addIssue({
          code: "custom",
          message: `teen ???? ?? "${nodeItem.node_id}"? voice_enabled=false?? ?`,
        });
      }

      if (nodeItem.is_ending) {
        if (!nodeItem.ending_type) {
          refineContext.addIssue({
            code: "custom",
            message: `?? ?? "${nodeItem.node_id}"? ending_type ??`,
          });
        }
      } else {
        if (!nodeItem.next_node_map) {
          refineContext.addIssue({
            code: "custom",
            message: `??? ?? "${nodeItem.node_id}"? next_node_map ?? (??? ??)`,
          });
        } else {
          for (const nextNodeId of Object.values(nodeItem.next_node_map)) {
            if (!nodeIdSet.has(nextNodeId)) {
              refineContext.addIssue({
                code: "custom",
                message: `?? "${nodeItem.node_id}"? next_node_map? ???? ?? "${nextNodeId}" ??`,
              });
            }
          }
        }
      }
    }
  });

/** LLM ?? ?? ?? ? ??? JSON ?? */
export const advancePayloadSchema = z.object({
  message: z.string().min(1),
  sender: z.string().min(1),
  options: z.array(nodeOptionSchema),
  risk_flags: z.array(z.string()),
});

/** LLM risk_flag ?? ?? */
export const judgeVerdictSchema = z.object({
  risk_flag: riskFlagSchema,
  reason: z.string(),
});

// ?? API ?? body ??? ??????????????????????????????

export const chatHistoryEntrySchema = z.object({
  speaker: z.enum(["scammer", "player", "system"]),
  messageText: z.string().max(1000),
  nodeId: z.string().max(100),
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
