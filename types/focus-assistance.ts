export type FocusStepOwner =
  | "USER"
  | "CORTEX"
  | "TOGETHER";

export type FocusAssistanceKind =
  | "COACHING"
  | "DRAFT"
  | "COLLABORATION";

export interface FocusAssistanceStep {
  order: number;
  title: string;
  owner: FocusStepOwner;
  instruction: string;
  cortexSupport: string | null;
  doneWhen: string;
}

export interface FocusAssistanceRequest {
  sessionId: string;
  taskDescription: string;
  objective: string;
  step: FocusAssistanceStep;
  userContext?: string;
}

export interface FocusAssistanceContent {
  kind: FocusAssistanceKind;
  summary: string;
  suggestedOutput: string | null;
  guidanceQuestions: string[];
  assumptions: string[];
  nextActions: string[];
  verificationChecklist: string[];
  requiresUserReview: boolean;
}

export interface FocusAssistance {
  id: string;
  sessionId: string;
  stepOrder: number;
  content: FocusAssistanceContent;
  generatedAt: number;
}

export interface FocusAssistanceResponse {
  status: "COMPLETED";
  assistance: FocusAssistance;
}