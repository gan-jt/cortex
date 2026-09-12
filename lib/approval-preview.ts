import { zodTextFormat } from "openai/helpers/zod";
import { z } from "zod";

import { getOpenAIClient } from "@/lib/openai";
import type {
  ApprovalPreview,
  ApprovalPreviewContent,
} from "@/types/approval";

const ApprovalPreviewContentSchema = z.object({
  actionType: z.enum([
    "MESSAGE",
    "PUBLICATION",
    "PURCHASE",
    "TRANSFER",
    "BOOKING",
    "DATA_CHANGE",
    "OTHER",
  ]),
  title: z.string(),
  summary: z.string(),
  proposedAction: z.string(),
  target: z.string().nullable(),
  draftOutput: z.string().nullable(),
  externalEffects: z.array(z.string()).min(1).max(5),
  assumptions: z.array(z.string()).max(5),
  missingInformation: z.array(z.string()).max(5),
  verificationChecklist: z
    .array(z.string())
    .min(1)
    .max(5),
});

export async function createApprovalPreviewWithAI(
  description: string,
): Promise<ApprovalPreview> {
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
You are the approval-preview engine for Cortex, a productivity agent.

Prepare a clear preview of the external or consequential action the
user requested. Do not perform the action.

Rules:
- Never claim that a message was sent, content was published, money was
  spent or transferred, a booking was made, or data was changed.
- proposedAction must describe exactly what would happen after approval.
- For messages and publications, draftOutput should contain a usable
  draft that the user can review.
- For other actions, use draftOutput only when a textual artifact is
  useful; otherwise return null.
- Identify the target, such as a recipient, account, platform, vendor,
  record, or audience. Return null if it is unknown.
- Do not invent recipients, addresses, prices, account details, dates,
  quantities, or other consequential facts.
- Put every required unknown in missingInformation.
- List the real external effects that approval would authorize.
- Keep the summary concise.
- Provide short checks the user should complete before approving.
        `.trim(),
      },
      {
        role: "user",
        content: normalizedDescription,
      },
    ],
    text: {
      format: zodTextFormat(
        ApprovalPreviewContentSchema,
        "approval_preview",
      ),
    },
  });

  const content =
    response.output_parsed as ApprovalPreviewContent | null;

  if (!content) {
    throw new Error(
      "Cortex could not produce an approval preview.",
    );
  }

  return {
    id: crypto.randomUUID(),
    taskDescription: normalizedDescription,
    ...content,
    canApprove: content.missingInformation.length === 0,
    createdAt: Date.now(),
  };
}