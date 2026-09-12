import { NextResponse } from "next/server";

import { routeTaskWithAI } from "@/lib/ai-task-router";
import { routeTask } from "@/lib/task-router";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const description =
      typeof body.description === "string" ? body.description.trim() : "";

    if (!description) {
      return NextResponse.json(
        { error: "A task description is required." },
        { status: 400 },
      );
    }

    try {
      const decision = await routeTaskWithAI(description);

      return NextResponse.json({
        task: { description },
        decision,
        source: "ai-router",
      });
    } catch (error) {
      console.error("AI routing failed. Using rules fallback:", error);

      const decision = routeTask(description);

      return NextResponse.json({
        task: { description },
        decision,
        source: "rules-fallback",
      });
    }
  } catch {
    return NextResponse.json(
      { error: "The request body must be valid JSON." },
      { status: 400 },
    );
  }
}