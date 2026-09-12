"use client";

import { useRouter } from "next/navigation";
import {
  useCallback,
  useState,
} from "react";

import type { ApprovalPreview } from "@/types/approval";
import { saveFocusHandoff } from "@/lib/focus-handoff";
import type { FocusPlan } from "@/types/focus";
import type { RouteDecision } from "@/types/task";

export type CortexTaskStatus =
  | "COMPLETED"
  | "WAITING_APPROVAL"
  | "NEEDS_CLARIFICATION"
  | "FOCUS_READY";

export interface CortexExecutionResult {
  title: string;
  summary: string;
  output: string;
  outputFormat: string;
  verificationChecklist: string[];
}

export interface CortexTaskResponse {
  task: {
    description: string;
  };
  decision: RouteDecision;
  routingSource: "ai-router" | "rules-fallback";
  status: CortexTaskStatus;
  execution?: CortexExecutionResult | null;
  focusPlan?: FocusPlan | null;
  clarificationQuestions?: string[];
  approvalPreview?: ApprovalPreview | null;
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

function isCortexTaskResponse(
  value: unknown,
): value is CortexTaskResponse {
  if (!isRecord(value) || !isRecord(value.task)) {
    return false;
  }

  const validStatuses: CortexTaskStatus[] = [
    "COMPLETED",
    "WAITING_APPROVAL",
    "NEEDS_CLARIFICATION",
    "FOCUS_READY",
  ];

  return (
    typeof value.task.description === "string" &&
    typeof value.status === "string" &&
    validStatuses.includes(
      value.status as CortexTaskStatus,
    ) &&
    isRecord(value.decision) &&
    typeof value.routingSource === "string"
  );
}

function getResponseError(value: unknown) {
  if (
    isRecord(value) &&
    typeof value.error === "string"
  ) {
    return value.error;
  }

  return "Cortex could not process the task.";
}

export function useTaskSubmission() {
  const router = useRouter();

  const [result, setResult] =
    useState<CortexTaskResponse | null>(null);
  const [error, setError] =
    useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const submitTask = useCallback(
    async (description: string) => {
      const normalizedDescription =
        description.trim();

      if (!normalizedDescription) {
        const message =
          "Enter a task description.";

        setError(message);
        throw new Error(message);
      }

      setIsSubmitting(true);
      setError(null);
      setResult(null);

      try {
        const response = await fetch(
          "/api/execute-task",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              description:
                normalizedDescription,
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
          !isCortexTaskResponse(responseBody)
        ) {
          throw new Error(
            "Cortex returned an invalid task response.",
          );
        }

        setResult(responseBody);

        if (
          responseBody.status === "FOCUS_READY"
        ) {
          if (!responseBody.focusPlan) {
            throw new Error(
              "Cortex did not return a Focus Plan.",
            );
          }

          saveFocusHandoff({
            taskDescription:
              responseBody.task.description,
            plan: responseBody.focusPlan,
          });

          router.push("/focus");
        }

        return responseBody;
      } catch (caughtError) {
        const message =
          caughtError instanceof Error
            ? caughtError.message
            : "An unexpected error occurred.";

        setError(message);
        throw caughtError;
      } finally {
        setIsSubmitting(false);
      }
    },
    [router],
  );

  const clearResult = useCallback(() => {
    setResult(null);
    setError(null);
  }, []);

  return {
    result,
    error,
    isSubmitting,
    submitTask,
    clearResult,
  };
}