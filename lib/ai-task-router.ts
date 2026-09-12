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

const highRiskActions = [
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
  const instruction = description
    .split(/[:\n]/, 1)[0]
    .trim()
    .replace(
      /^(?:please\s+|kindly\s+)?(?:(?:can|could|would)\s+you\s+)?(?:please\s+)?/,
      "",
    );

  return highRiskActions.some(
    (action) =>
      instruction === action || instruction.startsWith(`${action} `),
  );
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
The task is clear, low-risk, reversible, and has a concrete result
that Cortex can produce and verify automatically.

APPROVAL:
Cortex can prepare the work, but completing the final action affects
another person, an external system, money, published content, or data.
Human approval is required before the final action.

FOCUS:
The task requires substantial human judgment, creativity, strategy,
research, planning, or sustained attention. A FOCUS task can still be
ready to begin even when some details will be resolved during the
session.

Missing-information policy:
- missingInformation must contain only blocking unknowns.
- Information is blocking only when Cortex cannot produce a safe,
  useful first step or a meaningful plan without it.
- Use an empty array when reasonable assumptions can be made.
- Do not treat preferences, optimization details, baseline metrics,
  existing assets, channel history, or other helpful context as
  blocking unless the requested work is impossible without them.
- For strategy, planning, creative, and research tasks, use reasonable
  labeled assumptions and leave non-blocking questions for the later
  Focus Plan.
- A clear objective, audience, deliverable, time constraint, or budget
  is generally enough to begin a Focus Plan.
- If the user explicitly allows reasonable assumptions, do not request
  non-safety-critical clarification.
- Do not use missingInformation merely because more context could
  improve the result.

Examples:

Task:
"Create a 45-minute launch strategy for a college productivity app.
Recruit 50 beta users in two weeks using campus clubs and Instagram
with a $200 budget. Include priorities, messages, and success metrics."

Decision:
FOCUS with missingInformation set to [].
Unknown follower counts, club relationships, differentiators, and
existing assets are non-blocking and can be handled as assumptions or
questions inside the Focus Plan.

Task:
"Do it."

Decision:
FOCUS with missingInformation listing the task to perform, the desired
outcome, and relevant constraints. No meaningful work can begin.

Task:
"Compare these two meeting summaries and identify the three most
important action items," when the summaries were not supplied.

Decision:
FOCUS with missingInformation listing the two missing summaries,
because the requested comparison cannot begin without them.

Task:
"Summarize this supplied paragraph in one sentence."

Decision:
AUTO with missingInformation set to [].

Rules:
- Never classify a high-risk task as AUTO.
- Complexity must be an integer from 1 to 5.
- Confidence must be between 0 and 1.
- Risk measures consequences, not difficulty.
- Use suggestedDurationMinutes only for FOCUS tasks.
- If the user supplies a Focus duration, preserve it.
- Otherwise, estimate an appropriate duration from 5 to 180 minutes.
- For AUTO and APPROVAL, suggestedDurationMinutes must be null.
- Keep the reason concise and write it in English.
- Default missingInformation to [] unless an unknown genuinely blocks
  safe and meaningful progress.
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