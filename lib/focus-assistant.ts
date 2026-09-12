import { zodTextFormat } from "openai/helpers/zod";
import { z } from "zod";

import { getOpenAIClient } from "@/lib/openai";
import type {
  FocusAssistance,
  FocusAssistanceContent,
  FocusAssistanceKind,
  FocusAssistanceRequest,
  FocusStepOwner,
} from "@/types/focus-assistance";

const FocusAssistanceContentSchema = z.object({
  kind: z.enum([
    "COACHING",
    "DRAFT",
    "COLLABORATION",
  ]),
  summary: z.string().min(1),
  suggestedOutput: z.string().nullable(),
  guidanceQuestions: z.array(z.string()).max(5),
  assumptions: z.array(z.string()).max(5),
  nextActions: z.array(z.string()).min(1).max(5),
  verificationChecklist: z
    .array(z.string())
    .min(1)
    .max(6),
  requiresUserReview: z.boolean(),
});

const ASSISTANCE_KIND_BY_OWNER: Record<
  FocusStepOwner,
  FocusAssistanceKind
> = {
  USER: "COACHING",
  CORTEX: "DRAFT",
  TOGETHER: "COLLABORATION",
};

function normalizeList(items: string[]) {
  return items
    .map((item) => item.trim())
    .filter(Boolean);
}

export async function generateFocusAssistance(
  input: FocusAssistanceRequest,
): Promise<FocusAssistance> {
  const taskDescription =
    input.taskDescription.trim();
  const objective = input.objective.trim();
  const stepTitle = input.step.title.trim();
  const stepInstruction =
    input.step.instruction.trim();
  const doneWhen = input.step.doneWhen.trim();
  const userContext =
    input.userContext?.trim() || null;

  if (
    !input.sessionId.trim() ||
    !taskDescription ||
    !objective ||
    !stepTitle ||
    !stepInstruction ||
    !doneWhen
  ) {
    throw new Error(
      "Focus Assistant received incomplete step context.",
    );
  }

  const expectedKind =
    ASSISTANCE_KIND_BY_OWNER[input.step.owner];

  const openai = getOpenAIClient();

  const response = await openai.responses.parse({
    model: "gpt-5.6-luna",
    input: [
      {
        role: "system",
        content: `
You are Cortex Focus Assistant. Help a user complete exactly one
step of an existing Focus Session.

The step owner determines your behavior:

USER -> COACHING
Ask focused questions and provide a decision framework. Do not make
the user's important judgment for them. suggestedOutput must be null.

CORTEX -> DRAFT
Produce a concrete, usable draft, analysis, table, outline, or other
artifact that advances the step. suggestedOutput must contain the
actual draft.

TOGETHER -> COLLABORATION
Produce a useful starting draft and ask focused questions that let the
user confirm or improve it. suggestedOutput must contain the draft.

Rules:
- The kind must match the owner mapping above.
- Focus only on the supplied step.
- Use the task description, objective, completion condition, and user
  context provided.
- Make reasonable assumptions when necessary and list them explicitly.
- Never claim that an email was sent, content was published, money was
  spent, data was deleted, or any external action was completed.
- Outputs are drafts and recommendations only.
- Keep the summary concise.
- nextActions must be concrete and ordered.
- verificationChecklist must reflect the supplied doneWhen condition.
- Avoid generic encouragement and produce practical support.
- All AI-generated drafts require user review.
        `.trim(),
      },
      {
        role: "user",
        content: JSON.stringify({
          taskDescription,
          objective,
          step: {
            order: input.step.order,
            title: stepTitle,
            owner: input.step.owner,
            instruction: stepInstruction,
            cortexSupport:
              input.step.cortexSupport,
            doneWhen,
          },
          userContext,
          expectedKind,
        }),
      },
    ],
    text: {
      format: zodTextFormat(
        FocusAssistanceContentSchema,
        "focus_assistance",
      ),
    },
  });

  const generatedContent =
    response.output_parsed;

  if (!generatedContent) {
    throw new Error(
      "Cortex could not generate step assistance.",
    );
  }

  const suggestedOutput =
    expectedKind === "COACHING"
      ? null
      : generatedContent.suggestedOutput?.trim() ||
        generatedContent.summary.trim();

  const guidanceQuestions =
    normalizeList(
      generatedContent.guidanceQuestions,
    );

  const content: FocusAssistanceContent = {
    kind: expectedKind,
    summary: generatedContent.summary.trim(),
    suggestedOutput,
    guidanceQuestions:
      expectedKind === "COACHING" &&
      guidanceQuestions.length === 0
        ? [
            "What result would make this step complete?",
          ]
        : guidanceQuestions,
    assumptions: normalizeList(
      generatedContent.assumptions,
    ),
    nextActions: normalizeList(
      generatedContent.nextActions,
    ),
    verificationChecklist: normalizeList(
      generatedContent.verificationChecklist,
    ),
    requiresUserReview: true,
  };

  return {
    id: crypto.randomUUID(),
    sessionId: input.sessionId.trim(),
    stepOrder: input.step.order,
    content,
    generatedAt: Date.now(),
  };
}