"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  clearFocusAssistanceWorkspace,
  loadFocusAssistanceWorkspace,
  saveFocusAssistanceWorkspace,
} from "@/lib/focus-assistance-storage";
import type {
  FocusAssistance,
  FocusAssistanceRequest,
  FocusAssistanceResponse,
} from "@/types/focus-assistance";

interface ErrorResponse {
  error?: string;
}

export function useFocusAssistant(
  sessionId: string | null,
) {
  const [assistanceByStep, setAssistanceByStep] =
    useState<Record<number, FocusAssistance>>({});

  const [stepContexts, setStepContexts] =
    useState<Record<number, string>>({});

  const [loadingStepOrder, setLoadingStepOrder] =
    useState<number | null>(null);

  const [error, setError] = useState<string | null>(
    null,
  );

  const [loadedSessionId, setLoadedSessionId] =
    useState<string | null | undefined>(undefined);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      const workspace = sessionId
        ? loadFocusAssistanceWorkspace(sessionId)
        : {
          assistanceByStep: {},
          stepContexts: {},
        };

      setAssistanceByStep(
        workspace.assistanceByStep,
      );
      setStepContexts(workspace.stepContexts);
      setLoadingStepOrder(null);
      setError(null);

      setLoadedSessionId(sessionId);
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [sessionId]);

  useEffect(() => {
    if (
      !sessionId ||
      loadedSessionId !== sessionId
    ) {
      return;
    }

    saveFocusAssistanceWorkspace(sessionId, {
      assistanceByStep,
      stepContexts,
    });
  }, [
    assistanceByStep,
    loadedSessionId,
    sessionId,
    stepContexts,
  ]);

  const requestAssistance = useCallback(
    async (
      input: FocusAssistanceRequest,
    ): Promise<FocusAssistance | null> => {
      setLoadingStepOrder(input.step.order);
      setError(null);

      try {
        const response = await fetch(
          "/api/focus-assist",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(input),
          },
        );

        const result = (await response.json()) as
          | FocusAssistanceResponse
          | ErrorResponse;

        if (!response.ok) {
          const message =
            "error" in result && result.error
              ? result.error
              : "Cortex could not generate assistance.";

          throw new Error(message);
        }

        const assistance = (
          result as FocusAssistanceResponse
        ).assistance;

        setAssistanceByStep((current) => ({
          ...current,
          [input.step.order]: assistance,
        }));

        return assistance;
      } catch (requestError) {
        const message =
          requestError instanceof Error
            ? requestError.message
            : "Cortex could not generate assistance.";

        setError(message);
        return null;
      } finally {
        setLoadingStepOrder(null);
      }
    },
    [],
  );

  const setStepContext = useCallback(
    (stepOrder: number, value: string) => {
      setStepContexts((current) => {
        const next = { ...current };

        if (value) {
          next[stepOrder] = value;
        } else {
          delete next[stepOrder];
        }

        return next;
      });
    },
    [],
  );

  const clearStepAssistance = useCallback(
    (stepOrder: number) => {
      setAssistanceByStep((current) => {
        const next = { ...current };
        delete next[stepOrder];
        return next;
      });
    },
    [],
  );

  const clearAllAssistance = useCallback(() => {
    if (sessionId) {
      clearFocusAssistanceWorkspace(sessionId);
    }

    setAssistanceByStep({});
    setStepContexts({});
    setLoadingStepOrder(null);
    setError(null);
  }, [sessionId]);

  return {
    assistanceByStep,
    stepContexts,
    loadingStepOrder,
    error,
    isLoaded: loadedSessionId === sessionId,

    requestAssistance,
    setStepContext,
    clearStepAssistance,
    clearAllAssistance,
  };
}