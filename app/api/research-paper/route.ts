import { NextResponse } from "next/server";

import { analyzeResearchPaperWithAI } from "@/lib/research-paper";

export const runtime = "nodejs";

const MAX_FILE_SIZE_BYTES = 15 * 1024 * 1024;
const MAX_QUESTION_LENGTH = 2000;

export async function POST(request: Request) {
  let formData: FormData;

  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json(
      {
        error:
          "The request must contain valid form data.",
      },
      { status: 400 },
    );
  }

  const fileValue = formData.get("file");
  const questionValue = formData.get("question");

  if (!(fileValue instanceof File)) {
    return NextResponse.json(
      { error: "A PDF file is required." },
      { status: 400 },
    );
  }

  const question =
    typeof questionValue === "string"
      ? questionValue.trim()
      : "";

  if (!question) {
    return NextResponse.json(
      {
        error: "A research question is required.",
      },
      { status: 400 },
    );
  }

  if (question.length > MAX_QUESTION_LENGTH) {
    return NextResponse.json(
      {
        error:
          "The research question must be 2,000 characters or fewer.",
      },
      { status: 400 },
    );
  }

  const isPdf =
    fileValue.type === "application/pdf" ||
    fileValue.name.toLowerCase().endsWith(".pdf");

  if (!isPdf) {
    return NextResponse.json(
      {
        error: "Only PDF files are supported.",
      },
      { status: 400 },
    );
  }

  if (fileValue.size === 0) {
    return NextResponse.json(
      {
        error: "The uploaded PDF is empty.",
      },
      { status: 400 },
    );
  }

  if (fileValue.size > MAX_FILE_SIZE_BYTES) {
    return NextResponse.json(
      {
        error:
          "The PDF must be 15 MB or smaller.",
      },
      { status: 413 },
    );
  }

  try {
    const fileBuffer = Buffer.from(
      await fileValue.arrayBuffer(),
    );

    const report = await analyzeResearchPaperWithAI({
      filename: fileValue.name,
      fileBase64: fileBuffer.toString("base64"),
      userQuestion: question,
    });

    return NextResponse.json({
      status: "COMPLETED",
      report,
    });
  } catch (error) {
    console.error(
      "Research paper analysis failed:",
      error,
    );

    return NextResponse.json(
      {
        error:
          "Cortex could not analyze the research paper.",
      },
      { status: 502 },
    );
  }
}