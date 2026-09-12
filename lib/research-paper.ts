import { zodTextFormat } from "openai/helpers/zod";
import { z } from "zod";

import { getOpenAIClient } from "@/lib/openai";
import type {
  ResearchReport,
  ResearchReportContent,
} from "@/types/research";

const ResearchReportContentSchema = z.object({
  paper: z.object({
    title: z.string(),
    authors: z.array(z.string()).max(50),
    publication: z.string().nullable(),
    publicationYear: z
      .number()
      .int()
      .min(1500)
      .max(2100)
      .nullable(),
    doi: z.string().nullable(),
  }),
  researchQuestion: z.string(),
  plainLanguageSummary: z.string(),
  keyFindings: z.array(z.string()).min(1).max(8),
  methodology: z.object({
    studyDesign: z.string(),
    sampleOrData: z.string(),
    procedure: z.string(),
    analysisMethod: z.string(),
  }),
  evidenceMap: z
    .array(
      z.object({
        claim: z.string(),
        evidence: z.string(),
        pageReferences: z
          .array(z.string())
          .max(10),
        strength: z.enum([
          "STRONG",
          "MODERATE",
          "LIMITED",
        ]),
      }),
    )
    .min(1)
    .max(8),
  limitations: z.array(z.string()).max(8),
  importantTerms: z
    .array(
      z.object({
        term: z.string(),
        definition: z.string(),
      }),
    )
    .max(12),
  furtherQuestions: z.array(z.string()).max(8),
  suggestedFocusTask: z.string(),
});

interface AnalyzeResearchPaperInput {
  filename: string;
  fileBase64: string;
  userQuestion: string;
}

export async function analyzeResearchPaperWithAI({
  filename,
  fileBase64,
  userQuestion,
}: AnalyzeResearchPaperInput): Promise<ResearchReport> {
  const normalizedFilename = filename.trim();
  const normalizedQuestion = userQuestion.trim();

  if (!normalizedFilename) {
    throw new Error("A PDF filename is required.");
  }

  if (!fileBase64) {
    throw new Error("PDF data is required.");
  }

  if (!normalizedQuestion) {
    throw new Error(
      "A research question is required.",
    );
  }

  const openai = getOpenAIClient();

  const response = await openai.responses.parse({
    model: "gpt-5.6-luna",
    input: [
      {
        role: "system",
        content: `
You are the paper-research engine for Cortex.

Analyze only the provided paper and answer the user's research question.

Rules:
- Do not invent facts, metadata, methods, findings, statistics, or citations.
- Use null or an empty array when metadata cannot be identified.
- Explain the paper in clear language without removing important nuance.
- Distinguish the authors' claims from the evidence presented.
- Evaluate evidence strength conservatively.
- Include PDF page references only when they can be identified reliably.
- If page references cannot be identified, return an empty array.
- Describe methodological limitations and uncertainty explicitly.
- Keep key findings concise and evidence-based.
- Define technical terms for a college-level reader.
- suggestedFocusTask must be a self-contained task for a deeper Cortex Focus Session.
        `.trim(),
      },
      {
        role: "user",
        content: [
          {
            type: "input_file",
            filename: normalizedFilename,
            file_data: `data:application/pdf;base64,${fileBase64}`,
            detail: "auto",
          },
          {
            type: "input_text",
            text: `Research question: ${normalizedQuestion}`,
          },
        ],
      },
    ],
    text: {
      format: zodTextFormat(
        ResearchReportContentSchema,
        "research_report",
      ),
    },
  });

  const content =
    response.output_parsed as ResearchReportContent | null;

  if (!content) {
    throw new Error(
      "Cortex could not produce a research report.",
    );
  }

  return {
    id: crypto.randomUUID(),
    filename: normalizedFilename,
    userQuestion: normalizedQuestion,
    ...content,
    generatedAt: Date.now(),
  };
}