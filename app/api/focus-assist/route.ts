import { NextResponse } from "next/server";
import { z } from "zod";

import { generateFocusAssistance } from "@/lib/focus-assistant";
import type { FocusAssistanceResponse } from "@/types/focus-assistance";

const FocusAssistanceRequestSchema = z.object({
  sessionId: z.string().trim().min(1).max(200),

  taskDescription: z
    .string()
    .trim()
    .min(1)
    .max(10_000),

  objective: z
    .string()
    .trim()
    .min(1)
    .max(5_000),

  step: z.object({
    order: z.number().int().positive().max(100),

    title: z
      .string()
      .trim()
      .min(1)
      .max(500),

    owner: z.enum([
      "USER",
      "CORTEX",
      "TOGETHER",
    ]),

    instruction: z
      .string()
      .trim()
      .min(1)
      .max(5_000),

    cortexSupport: z
      .string()
      .trim()
      .max(5_000)
      .nullable(),

    doneWhen: z
      .string()
      .trim()
      .min(1)
      .max(2_000),
  }),

  userContext: z
    .string()
    .trim()
    .max(10_000)
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
          "The request body must contain valid JSON.",
      },
      {
        status: 400,
      },
    );
  }

  const validationResult =
    FocusAssistanceRequestSchema.safeParse(
      requestBody,
    );

  if (!validationResult.success) {
    return NextResponse.json(
      {
        error:
          "The Focus Assistant request is invalid.",
        details:
          validationResult.error.issues.map(
            (issue) => ({
              path: issue.path.join("."),
              message: issue.message,
            }),
          ),
      },
      {
        status: 400,
      },
    );
  }

  try {
    const assistance =
      await generateFocusAssistance(
        validationResult.data,
      );

    const responseBody: FocusAssistanceResponse = {
      status: "COMPLETED",
      assistance,
    };

    return NextResponse.json(responseBody);
  } catch (error) {
    console.error(
      "Focus Assistant failed:",
      error instanceof Error
        ? error.message
        : "Unknown error",
    );

    return NextResponse.json(
      {
        error:
          "Cortex could not generate assistance for this step.",
      },
      {
        status: 500,
      },
    );
  }
}