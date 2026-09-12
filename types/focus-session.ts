import type { FocusPlan } from "@/types/focus";

export type FocusSessionStatus =
  | "READY"
  | "ACTIVE"
  | "PAUSED"
  | "COMPLETED"
  | "CANCELLED";

export interface BlockedAttempt {
  hostname: string;
  attemptedAt: number;
}

export interface FocusSession {
  id: string;
  taskDescription: string;
  plan: FocusPlan;
  status: FocusSessionStatus;

  durationSeconds: number;
  elapsedSeconds: number;

  startedAt: number | null;
  activeSince: number | null;
  expectedEndAt: number | null;
  pausedAt: number | null;
  completedAt: number | null;

  completedStepOrders: number[];

  blockedDomains: string[];
  blockedAttempts: BlockedAttempt[];

  createdAt: number;
  updatedAt: number;
}

export interface FocusReward {
  focusMinutes: number;
  completedSteps: number;
  totalSteps: number;
  completionRate: number;
  xpEarned: number;
}