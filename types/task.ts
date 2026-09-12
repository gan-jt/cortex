export type TaskMode = "AUTO" | "APPROVAL" | "FOCUS";

export type TaskStatus =
  | "INBOX"
  | "ANALYZING"
  | "WORKING"
  | "WAITING_APPROVAL"
  | "NEEDS_FOCUS"
  | "FOCUS_ACTIVE"
  | "COMPLETED"
  | "FAILED";

export type RiskLevel = "LOW" | "MEDIUM" | "HIGH";

export interface RouteDecision {
  mode: TaskMode;
  confidence: number;
  complexity: number;
  riskLevel: RiskLevel;
  verifiable: boolean;
  reason: string;
  missingInformation: string[];
  suggestedDurationMinutes: number | null;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  decision?: RouteDecision;
  deadline?: string;
  attachments: string[];
  createdAt: string;
  updatedAt: string;
}