import { NextResponse } from "next/server";

import { routeTaskWithAI } from "@/lib/ai-task-router";
import { createFocusPlanWithAI } from "@/lib/focus-planner";
import { executeTaskWithAI } from "@/lib/task-executor";
import { routeTask } from "@/lib/task-router";
import type { RouteDecision } from "@/types/task";

export async function POST(request: Request) {
  let body: { description?: unknown };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "The request body must be valid JSON." },
      { status: 400 },
    );
  }

  const description =
    typeof body.description === "string" ? body.description.trim() : "";

  if (!description) {
    return NextResponse.json(
      { error: "A task description is required." },
      { status: 400 },
    );
  }

  let decision: RouteDecision;
  let routingSource: "ai-router" | "rules-fallback";

  try {
    decision = await routeTaskWithAI(description);
    routingSource = "ai-router";
  } catch (error) {
    console.error("AI routing failed. Using rules fallback:", error);

    decision = routeTask(description);
    routingSource = "rules-fallback";
  }

  if (decision.mode === "APPROVAL") {
    return NextResponse.json({
      task: { description },
      decision,
      routingSource,
      status: "WAITING_APPROVAL",
      execution: null,
      focusPlan: null,
    });
  }

  if (decision.mode === "FOCUS") {
    const needsClarification =
      decision.missingInformation.length > 0;

    if (needsClarification) {
      return NextResponse.json({
        task: { description },
        decision,
        routingSource,
        status: "NEEDS_CLARIFICATION",
        clarificationQuestions: decision.missingInformation,
        execution: null,
        focusPlan: null,
      });
    }

    try {
      const focusPlan = await createFocusPlanWithAI({
        description,
        suggestedDurationMinutes:
          decision.suggestedDurationMinutes,
        missingInformation: decision.missingInformation,
      });

      return NextResponse.json({
        task: { description },
        decision,
        routingSource,
        status: "FOCUS_READY",
        execution: null,
        focusPlan,
      });
    } catch (error) {
      console.error("Focus planning failed:", error);

      return NextResponse.json(
        {
          error: "Cortex could not create a focus plan.",
          task: { description },
          decision,
          routingSource,
          status: "FAILED",
        },
        { status: 502 },
      );
    }
  }

  try {
    const execution = await executeTaskWithAI(description);

    return NextResponse.json({
      task: { description },
      decision,
      routingSource,
      status: "COMPLETED",
      execution,
      focusPlan: null,
    });
  } catch (error) {
    console.error("Task execution failed:", error);

    return NextResponse.json(
      {
        error: "Cortex could not complete the task.",
        task: { description },
        decision,
        routingSource,
        status: "FAILED",
      },
      { status: 502 },
    );
  }
}