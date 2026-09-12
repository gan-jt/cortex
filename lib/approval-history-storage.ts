import type { ApprovalRecord } from "@/types/approval";

const STORAGE_KEY = "cortex.approval-history";
const STORAGE_VERSION = 1;
const MAX_RECORDS = 50;

interface StoredApprovalHistory {
  version: number;
  records: ApprovalRecord[];
}

function isApprovalRecord(
  value: unknown,
): value is ApprovalRecord {
  if (
    typeof value !== "object" ||
    value === null ||
    Array.isArray(value)
  ) {
    return false;
  }

  const record = value as Record<string, unknown>;

  return (
    typeof record.id === "string" &&
    typeof record.previewId === "string" &&
    typeof record.taskDescription === "string" &&
    (record.decision === "APPROVED" ||
      record.decision === "REJECTED") &&
    (record.executionStatus === "SIMULATED" ||
      record.executionStatus === "NOT_EXECUTED") &&
    typeof record.resultMessage === "string" &&
    (record.note === null ||
      typeof record.note === "string") &&
    typeof record.decidedAt === "number"
  );
}

export function loadApprovalHistory(): ApprovalRecord[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const storedValue =
      window.localStorage.getItem(STORAGE_KEY);

    if (!storedValue) {
      return [];
    }

    const parsed = JSON.parse(
      storedValue,
    ) as Partial<StoredApprovalHistory>;

    if (
      parsed.version !== STORAGE_VERSION ||
      !Array.isArray(parsed.records)
    ) {
      return [];
    }

    return parsed.records
      .filter(isApprovalRecord)
      .slice(0, MAX_RECORDS);
  } catch {
    return [];
  }
}

export function saveApprovalRecord(
  approvalRecord: ApprovalRecord,
): ApprovalRecord[] {
  if (typeof window === "undefined") {
    return [approvalRecord];
  }

  const currentHistory = loadApprovalHistory();

  const nextHistory = [
    approvalRecord,
    ...currentHistory.filter(
      (record) =>
        record.previewId !==
        approvalRecord.previewId,
    ),
  ].slice(0, MAX_RECORDS);

  const storedHistory: StoredApprovalHistory = {
    version: STORAGE_VERSION,
    records: nextHistory,
  };

  try {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(storedHistory),
    );
  } catch {
    // Approval can continue without local history.
  }

  return nextHistory;
}

export function clearApprovalHistory(): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // In-memory history can still be cleared.
  }
}