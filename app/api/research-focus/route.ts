import { NextResponse } from "next/server";
import { z } from "zod";

import { createFocusPlanWithAI } from "@/lib/focus-planner";

const ResearchFocusRequestSchema = z.object({
  report: z.object({
    paper: z.object({
      title: z.string().min(1),
    }),
    researchQuestion: z.string().min(1),
    plainLanguageSummary: z.string().min(1),
    keyFindings: z.array(z.string()).min(1),
    methodology: z.object({
      studyDesign: z.string(),
      sampleOrData: z.string(),
      procedure: z.string(),
      analysisMethod: z.string(),
    }),
    evidenceMap: z.array(
      z.object({
        claim: z.string(),
        evidence: z.string(),
        pageReferences: z.array(z.string()),
        strength: z.enum([
          "STRONG",
          "MODERATE",
          "LIMITED",
        ]),
      }),
    ),
    limitations: z.array(z.string()),
    suggestedFocusTask: z.string().min(1),
  }),
});

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
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
    ResearchFocusRequestSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      {
        error:
          "A valid research report is required.",
      },
      { status: 400 },
    );
  }

  const { report } = parsed.data;

  const focusDescription = [
    "Research-based focus task:",
    report.suggestedFocusTask,
    "",
    `Source paper: ${report.paper.title}`,
    "",
    "Research question:",
    report.researchQuestion,
    "",
    "Analyzed paper summary:",
    report.plainLanguageSummary,
    "",
    "Key findings:",
    ...report.keyFindings.map(
      (finding, index) =>
        `${index + 1}. ${finding}`,
    ),
    "",
    "Methodology:",
    `Study design: ${report.methodology.studyDesign}`,
    `Sample or data: ${report.methodology.sampleOrData}`,
    `Procedure: ${report.methodology.procedure}`,
    `Analysis method: ${report.methodology.analysisMethod}`,
    "",
    "Evidence extracted from the paper:",
    ...report.evidenceMap.flatMap(
      (item, index) => [
        `${index + 1}. Claim: ${item.claim}`,
        `Evidence: ${item.evidence}`,
        `Strength: ${item.strength}`,
        item.pageReferences.length > 0
          ? `Pages: ${item.pageReferences.join(", ")}`
          : "Pages: Not reliably identified",
      ],
    ),
    "",
    "Known limitations:",
    ...report.limitations.map(
      (limitation, index) =>
        `${index + 1}. ${limitation}`,
    ),
    "",
    "The paper has already been uploaded and analyzed.",
    "Use the supplied research report as the working context.",
    "Do not request the PDF or citation again.",
  ].join("\n");

  try {
    const focusPlan =
      await createFocusPlanWithAI({
        description: focusDescription,
        suggestedDurationMinutes: 45,
        missingInformation: [],
      });

    return NextResponse.json({
      status: "FOCUS_READY",
      taskDescription: focusDescription,
      focusPlan,
    });
  } catch (error) {
    console.error(
      "Research focus planning failed:",
      error,
    );

    return NextResponse.json(
      {
        error:
          "Cortex could not create a research Focus Plan.",
      },
      { status: 502 },
    );
  }
}