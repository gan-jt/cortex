"use client";

import {
    useCallback,
    useEffect,
    useState,
} from "react";

import {
    clearApprovalHistory as clearStoredApprovalHistory,
    loadApprovalHistory,
    saveApprovalRecord as persistApprovalRecord,
} from "@/lib/approval-history-storage";

import type {
    ApprovalDecisionResponse,
    ApprovalDecisionStatus,
    ApprovalPreview,
    ApprovalRecord,
} from "@/types/approval";

interface ApprovalDecisionInput {
    preview: ApprovalPreview;
    decision: ApprovalDecisionStatus;
    note?: string;
}

interface ErrorResponse {
    error?: string;
}

export function useApprovalDecision() {
    const [approvalRecord, setApprovalRecord] =
        useState<ApprovalRecord | null>(null);

    const [history, setHistory] = useState<
        ApprovalRecord[]
    >([]);

    const [isHistoryLoaded, setIsHistoryLoaded] =
        useState(false);

    const [isSubmitting, setIsSubmitting] =
        useState(false);

    const [error, setError] = useState<string | null>(
        null,
    );

    useEffect(() => {
        const timeoutId = window.setTimeout(() => {
            setHistory(loadApprovalHistory());
            setIsHistoryLoaded(true);
        }, 0);

        return () => {
            window.clearTimeout(timeoutId);
        };
    }, []);

    const submitDecision = useCallback(
        async ({
            preview,
            decision,
            note = "",
        }: ApprovalDecisionInput): Promise<ApprovalRecord | null> => {
            setIsSubmitting(true);
            setError(null);

            try {
                const response = await fetch(
                    "/api/approval-decision",
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                            previewId: preview.id,
                            taskDescription:
                                preview.taskDescription,
                            canApprove: preview.canApprove,
                            missingInformation:
                                preview.missingInformation,
                            decision,
                            note,
                        }),
                    },
                );

                const result = (await response.json()) as
                    | ApprovalDecisionResponse
                    | ErrorResponse;

                if (!response.ok) {
                    const message =
                        "error" in result && result.error
                            ? result.error
                            : "Cortex could not record the approval decision.";

                    throw new Error(message);
                }

                const record = (
                    result as ApprovalDecisionResponse
                ).approvalRecord;

                setApprovalRecord(record);
                setHistory(persistApprovalRecord(record));
                return record;
            } catch (requestError) {
                const message =
                    requestError instanceof Error
                        ? requestError.message
                        : "Cortex could not record the approval decision.";

                setError(message);
                return null;
            } finally {
                setIsSubmitting(false);
            }
        },
        [],
    );

    const clearDecision = useCallback(() => {
        setApprovalRecord(null);
        setError(null);
    }, []);

    const clearHistory = useCallback(() => {
        clearStoredApprovalHistory();
        setHistory([]);
    }, []);

    return {
        approvalRecord,
        history,
        isHistoryLoaded,
        isSubmitting,
        error,

        submitDecision,
        clearDecision,
        clearHistory,
    };
}