export type ApprovalActionType =
  | "MESSAGE"
  | "PUBLICATION"
  | "PURCHASE"
  | "TRANSFER"
  | "BOOKING"
  | "DATA_CHANGE"
  | "OTHER";

export interface ApprovalPreviewContent {
  actionType: ApprovalActionType;
  title: string;
  summary: string;
  proposedAction: string;
  target: string | null;
  draftOutput: string | null;
  externalEffects: string[];
  assumptions: string[];
  missingInformation: string[];
  verificationChecklist: string[];
}

export interface ApprovalPreview
  extends ApprovalPreviewContent {
  id: string;
  taskDescription: string;
  canApprove: boolean;
  createdAt: number;
}

export type ApprovalDecisionStatus =
  | "APPROVED"
  | "REJECTED";

export interface ApprovalRecord {
  id: string;
  previewId: string;
  taskDescription: string;
  decision: ApprovalDecisionStatus;
  executionStatus: ApprovalExecutionStatus;
  resultMessage: string;
  note: string | null;
  decidedAt: number;
}

export interface ApprovalPreviewResponse {
  status: "WAITING_APPROVAL";
  approvalPreview: ApprovalPreview;
}

export interface ApprovalDecisionResponse {
  status: ApprovalDecisionStatus;
  approvalRecord: ApprovalRecord;
}

export type ApprovalExecutionStatus =
  | "SIMULATED"
  | "EXECUTED"
  | "NOT_EXECUTED";