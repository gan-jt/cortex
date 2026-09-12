import { NextResponse } from "next/server";

import { routeTask } from "@/lib/task-router";

export async function POST(request: Request) {
  try {
    const body: unknown = await request.json();

    const description =
      typeof body === "object" && body !== null && "description" in body
        ? body.description
        : undefined;

    if (typeof description !== "string" || description.trim().length === 0) {
      return NextResponse.json(
        {
          error: "A non-empty task description is required.",
        },
        {
          status: 400,
        },
      );
    }

    const decision = routeTask(description);

    return NextResponse.json({
      task: {
        description: description.trim(),
      },
      decision,
    });
  } catch {
    return NextResponse.json(
      {
        error: "The request body must be valid JSON.",
      },
      {
        status: 400,
      },
    );
  }
}