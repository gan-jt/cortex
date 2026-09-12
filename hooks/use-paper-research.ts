"use client";

import { useRouter } from "next/navigation";
import {
  useCallback,
  useState,
} from "react";

import { saveFocusHandoff } from "@/lib/focus-handoff";
import type { FocusPlan } from "@/types/focus";
import type {
  ResearchPaperResponse,
  ResearchReport,
} from "@/types/research";

const MAX_FILE_SIZE_BYTES = 15 * 1024 * 1024;

interface ResearchFocusResponse {
  status: "FOCUS_READY";
  taskDescription: string;
  focusPlan: FocusPlan;
}

function isRecord(
  value: unknown,
): value is Record<string, unknown> {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value)
  );
}

function isResearchPaperResponse(
  value: unknown,
): value is ResearchPaperResponse {
  return (
    isRecord(value) &&
    value.status === "COMPLETED" &&
    isRecord(value.report) &&
    typeof value.report.id === "string" &&
    typeof value.report.filename === "string" &&
    typeof value.report.plainLanguageSummary ===
      "string" &&
    Array.isArray(value.report.keyFindings)
  );
}

function isResearchFocusResponse(
  value: unknown,
): value is ResearchFocusResponse {
  return (
    isRecord(value) &&
    value.status === "FOCUS_READY" &&
    typeof value.taskDescription === "string" &&
    isRecord(value.focusPlan) &&
    typeof value.focusPlan.objective ===
      "string" &&
    typeof value.focusPlan.firstAction ===
      "string" &&
    Array.isArray(value.focusPlan.steps)
  );
}

function getResponseError(value: unknown): string {
  if (
    isRecord(value) &&
    typeof value.error === "string"
  ) {
    return value.error;
  }

  return "Cortex could not process the research request.";
}

export function usePaperResearch() {
  const router = useRouter();

  const [report, setReport] =
    useState<ResearchReport | null>(null);

  const [error, setError] =
    useState<string | null>(null);

  const [focusError, setFocusError] =
    useState<string | null>(null);

  const [isAnalyzing, setIsAnalyzing] =
    useState(false);

  const [
    isCreatingFocus,
    setIsCreatingFocus,
  ] = useState(false);

  const analyzePaper = useCallback(
    async (
      file: File,
      userQuestion: string,
    ): Promise<ResearchReport> => {
      const normalizedQuestion =
        userQuestion.trim();

      if (!file) {
        const message = "Select a PDF file.";

        setError(message);
        throw new Error(message);
      }

      const isPdf =
        file.type === "application/pdf" ||
        file.name.toLowerCase().endsWith(".pdf");

      if (!isPdf) {
        const message =
          "The selected file must be a PDF.";

        setError(message);
        throw new Error(message);
      }

      if (file.size === 0) {
        const message =
          "The selected PDF is empty.";

        setError(message);
        throw new Error(message);
      }

      if (file.size > MAX_FILE_SIZE_BYTES) {
        const message =
          "The PDF must be 15 MB or smaller.";

        setError(message);
        throw new Error(message);
      }

      if (!normalizedQuestion) {
        const message =
          "Enter a research question.";

        setError(message);
        throw new Error(message);
      }

      setIsAnalyzing(true);
      setError(null);
      setFocusError(null);
      setReport(null);

      try {
        const formData = new FormData();

        formData.append("file", file);
        formData.append(
          "question",
          normalizedQuestion,
        );

        const response = await fetch(
          "/api/research-paper",
          {
            method: "POST",
            body: formData,
          },
        );

        const responseBody: unknown =
          await response.json();

        if (!response.ok) {
          throw new Error(
            getResponseError(responseBody),
          );
        }

        if (
          !isResearchPaperResponse(responseBody)
        ) {
          throw new Error(
            "Cortex returned an invalid research report.",
          );
        }

        setReport(responseBody.report);

        return responseBody.report;
      } catch (caughtError) {
        const message =
          caughtError instanceof Error
            ? caughtError.message
            : "An unexpected error occurred.";

        setError(message);
        throw new Error(message);
      } finally {
        setIsAnalyzing(false);
      }
    },
    [],
  );

  const startFocusFromReport = useCallback(
    async (
      researchReport: ResearchReport,
    ): Promise<void> => {
      setIsCreatingFocus(true);
      setFocusError(null);

      try {
        const response = await fetch(
          "/api/research-focus",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              report: researchReport,
            }),
          },
        );

        const responseBody: unknown =
          await response.json();

        if (!response.ok) {
          throw new Error(
            getResponseError(responseBody),
          );
        }

        if (
          !isResearchFocusResponse(responseBody)
        ) {
          throw new Error(
            "Cortex returned an invalid Focus Plan.",
          );
        }

        saveFocusHandoff({
          taskDescription:
            responseBody.taskDescription,
          plan: responseBody.focusPlan,
        });

        router.push("/focus");
      } catch (caughtError) {
        const message =
          caughtError instanceof Error
            ? caughtError.message
            : "An unexpected error occurred.";

        setFocusError(message);
        throw new Error(message);
      } finally {
        setIsCreatingFocus(false);
      }
    },
    [router],
  );

  const clearReport = useCallback(() => {
    setReport(null);
    setError(null);
    setFocusError(null);
  }, []);

  return {
    report,
    error,
    focusError,
    isAnalyzing,
    isCreatingFocus,
    analyzePaper,
    startFocusFromReport,
    clearReport,
  };
}