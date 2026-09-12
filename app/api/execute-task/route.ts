import { NextResponse } from "next/server";

import { routeTaskWithAI } from "@/lib/ai-task-router";
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

  if (decision.mode !== "AUTO") {
    return NextResponse.json({
      task: { description },
      decision,
      routingSource,
      status:
        decision.mode === "APPROVAL"
          ? "WAITING_APPROVAL"
          : "NEEDS_FOCUS",
      execution: null,
    });
  }

  try {
    const execution = await executeTaskWithAI(description);

    return NextResponse.json({
      task: { description },
      decision,
      routingSource,
      status: "COMPLETED",
      execution,
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