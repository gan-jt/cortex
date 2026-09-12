import { zodTextFormat } from "openai/helpers/zod";
import { z } from "zod";

import { getOpenAIClient } from "@/lib/openai";
import type { RouteDecision } from "@/types/task";

const RouteDecisionSchema = z.object({
  mode: z.enum(["AUTO", "APPROVAL", "FOCUS"]),
  confidence: z.number().min(0).max(1),
  complexity: z.number().int().min(1).max(5),
  riskLevel: z.enum(["LOW", "MEDIUM", "HIGH"]),
  verifiable: z.boolean(),
  reason: z.string(),
  missingInformation: z.array(z.string()),
  suggestedDurationMinutes: z.number().int().min(5).max(180).nullable(),
});

const highRiskKeywords = [
  "send",
  "delete",
  "publish",
  "submit",
  "purchase",
  "buy",
  "pay",
  "transfer",
  "book",
  "post publicly",
];

function containsHighRiskAction(description: string): boolean {
  return highRiskKeywords.some((keyword) => description.includes(keyword));
}

export async function routeTaskWithAI(
  description: string,
): Promise<RouteDecision> {
  const normalizedDescription = description.trim().toLowerCase();

  if (!normalizedDescription) {
    throw new Error("Task description cannot be empty.");
  }

  // Safety guard: external or irreversible actions always require approval.
  if (containsHighRiskAction(normalizedDescription)) {
    return {
      mode: "APPROVAL",
      confidence: 0.99,
      complexity: 2,
      riskLevel: "HIGH",
      verifiable: true,
      reason:
        "This task may create an external or irreversible effect and requires approval before execution.",
      missingInformation: [],
      suggestedDurationMinutes: null,
    };
  }

  const openai = getOpenAIClient();

  const response = await openai.responses.parse({
    model: "gpt-5.6-luna",
    input: [
      {
        role: "system",
        content: `
You are the task-routing engine for Cortex, a productivity agent.

Classify each task into exactly one mode:

AUTO:
The task is clear, low-risk, reversible, and its result can be verified.
Cortex should be able to complete it automatically.

APPROVAL:
Cortex can prepare or perform the task, but the final action affects
another person, an external system, money, published content, or data.
Human approval is required before the final action.

FOCUS:
The task requires substantial judgment, creativity, strategy, research,
missing information, or sustained human attention.

Rules:
- Never classify a high-risk task as AUTO.
- Complexity must be an integer from 1 to 5.
- Confidence must be between 0 and 1.
- Risk measures consequences, not difficulty.
- Use suggestedDurationMinutes only for FOCUS tasks.
- For AUTO and APPROVAL, suggestedDurationMinutes must be null.
- List concrete missing information when necessary.
- Keep the reason concise and write it in English.
        `.trim(),
      },
      {
        role: "user",
        content: description.trim(),
      },
    ],
    text: {
      format: zodTextFormat(RouteDecisionSchema, "route_decision"),
    },
  });

  const decision = response.output_parsed;

  if (!decision) {
    throw new Error("Cortex could not produce a routing decision.");
  }

  // Final safety check independent of the model.
  if (decision.riskLevel === "HIGH" && decision.mode === "AUTO") {
    return {
      ...decision,
      mode: "APPROVAL",
      reason: `${decision.reason} Human approval is required before execution.`,
    };
  }

  return decision;
}