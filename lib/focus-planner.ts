import { zodTextFormat } from "openai/helpers/zod";
import { z } from "zod";

import { getOpenAIClient } from "@/lib/openai";
import type { FocusPlan } from "@/types/focus";

const FocusStepSchema = z.object({
  order: z.number().int().min(1),
  title: z.string(),
  owner: z.enum(["USER", "CORTEX", "TOGETHER"]),
  instruction: z.string(),
  cortexSupport: z.string().nullable(),
  estimatedMinutes: z.number().int().min(1).max(60),
  doneWhen: z.string(),
});

const FocusPlanSchema = z.object({
  objective: z.string(),
  durationMinutes: z.number().int().min(15).max(120),
  firstAction: z.string(),
  steps: z.array(FocusStepSchema).min(2).max(6),
  questionsToResolve: z.array(z.string()).max(5),
  completionCriteria: z.array(z.string()).min(1).max(5),
});

interface CreateFocusPlanInput {
  description: string;
  suggestedDurationMinutes: number | null;
  missingInformation: string[];
}

export async function createFocusPlanWithAI({
  description,
  suggestedDurationMinutes,
  missingInformation,
}: CreateFocusPlanInput): Promise<FocusPlan> {
  const normalizedDescription = description.trim();

  if (!normalizedDescription) {
    throw new Error("Task description cannot be empty.");
  }

  const openai = getOpenAIClient();

  const response = await openai.responses.parse({
    model: "gpt-5.6-luna",
    input: [
      {
        role: "system",
        content: `
You are the focus-planning engine for Cortex.

Convert a complex task into a focused human-agent work session.

Step owners:
- USER: requires human judgment, creativity, or a final decision.
- CORTEX: safe text-based work Cortex can assist with using provided information.
- TOGETHER: Cortex prepares material and the user reviews or decides.

Rules:
- Do not pretend to complete the task.
- Create 2 to 6 sequential, concrete steps.
- Never assign external actions or final decisions to CORTEX.
- Cortex cannot browse websites, access accounts, or operate external apps.
- The first action must be possible to start immediately.
- Every step must have an observable definition of done.
- Include cortexSupport for CORTEX and TOGETHER steps.
- Use null for cortexSupport when Cortex assistance is not useful.
- Keep the session between 15 and 120 minutes.
- Use the suggested duration when reasonable.
- Convert missing information into concise questions.
- Use the same language as the user's task.
- Use plain ASCII punctuation instead of curly quotes or long dashes.
        `.trim(),
      },
      {
        role: "user",
        content: JSON.stringify({
          task: normalizedDescription,
          suggestedDurationMinutes,
          missingInformation,
        }),
      },
    ],
    text: {
      format: zodTextFormat(FocusPlanSchema, "focus_plan"),
    },
  });

  const focusPlan = response.output_parsed;

  if (!focusPlan) {
    throw new Error("Cortex could not produce a focus plan.");
  }

  return focusPlan;
}