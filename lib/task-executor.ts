import { zodTextFormat } from "openai/helpers/zod";
import { z } from "zod";

import { getOpenAIClient } from "@/lib/openai";
import type { ExecutionResult } from "@/types/execution";

const ExecutionResultSchema = z.object({
  title: z.string(),
  summary: z.string(),
  output: z.string(),
  outputFormat: z.enum(["MARKDOWN", "PLAIN_TEXT"]),
  verificationChecklist: z.array(z.string()).min(1).max(5),
});

export async function executeTaskWithAI(
  description: string,
): Promise<ExecutionResult> {
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
You are the execution engine for Cortex, a productivity agent.

Complete the user's task now and return the finished deliverable.

Rules:
- Produce a usable final result, not merely instructions or a plan.
- Only perform text-based work using information in the task.
- Do not claim that you sent messages, changed files, published content,
  accessed accounts, or performed any external action.
- Do not invent missing facts.
- Keep the summary to one concise sentence.
- Put the complete deliverable in output.
- Use MARKDOWN when headings, lists, or structured formatting are useful.
- Provide 1 to 5 short checks that a user can use to verify the result.
        `.trim(),
      },
      {
        role: "user",
        content: normalizedDescription,
      },
    ],
    text: {
      format: zodTextFormat(
        ExecutionResultSchema,
        "execution_result",
      ),
    },
  });

  const result = response.output_parsed;

  if (!result) {
    throw new Error("Cortex could not produce an execution result.");
  }

  return result;
}