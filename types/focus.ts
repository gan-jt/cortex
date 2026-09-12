export type FocusStepOwner = "USER" | "CORTEX" | "TOGETHER";

export interface FocusStep {
  order: number;
  title: string;
  owner: FocusStepOwner;
  instruction: string;
  cortexSupport: string | null;
  estimatedMinutes: number;
  doneWhen: string;
}

export interface FocusPlan {
  objective: string;
  durationMinutes: number;
  firstAction: string;
  steps: FocusStep[];
  questionsToResolve: string[];
  completionCriteria: string[];
}