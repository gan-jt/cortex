import { NextResponse } from "next/server";
import { z } from "zod";

import type { ApprovalRecord } from "@/types/approval";

const ApprovalDecisionRequestSchema = z.object({
  previewId: z.string().uuid(),
  taskDescription: z
    .string()
    .trim()
    .min(1)
    .max(10000),
  canApprove: z.boolean(),
  missingInformation: z
    .array(z.string())
    .max(5),
  decision: z.enum(["APPROVED", "REJECTED"]),
  note: z
    .string()
    .trim()
    .max(1000)
    .nullable()
    .optional(),
});

export async function POST(request: Request) {
  let requestBody: unknown;

  try {
    requestBody = await request.json();
  } catch {
    return NextResponse.json(
      {
        error:
          "The request body must be valid JSON.",
      },
      { status: 400 },
    );
  }

  const parsed =
    ApprovalDecisionRequestSchema.safeParse(
      requestBody,
    );

  if (!parsed.success) {
    return NextResponse.json(
      {
        error:
          "The approval decision is invalid.",
        details: parsed.error.flatten(),
      },
      { status: 400 },
    );
  }

  const {
    previewId,
    taskDescription,
    canApprove,
    missingInformation,
    decision,
    note,
  } = parsed.data;

  if (
    decision === "APPROVED" &&
    (!canApprove || missingInformation.length > 0)
  ) {
    return NextResponse.json(
      {
        error:
          "This action cannot be approved until all required information is provided.",
        missingInformation,
      },
      { status: 409 },
    );
  }

  const isApproved = decision === "APPROVED";

  const approvalRecord: ApprovalRecord = {
    id: crypto.randomUUID(),
    previewId,
    taskDescription,
    decision,
    executionStatus: isApproved
      ? "SIMULATED"
      : "NOT_EXECUTED",
    resultMessage: isApproved
      ? "Job Executed!"
      : "The action was rejected and was not executed.",
    note: note?.trim() || null,
    decidedAt: Date.now(),
  };

  return NextResponse.json({
    status: decision,
    approvalRecord,
  });
}