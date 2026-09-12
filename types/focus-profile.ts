export type FocusPetStage =
  | "SEED"
  | "SPROUT"
  | "COMPANION"
  | "GUARDIAN";

export interface FocusProfile {
  version: 1;
  totalXp: number;
  completedSessions: number;
  totalFocusMinutes: number;
  totalCompletedSteps: number;
  currentStreakDays: number;
  longestStreakDays: number;
  lastCompletedDate: string | null;
  rewardedSessionIds: string[];
  createdAt: number;
  updatedAt: number;
}

export interface FocusProgress {
  level: number;
  xpIntoLevel: number;
  xpForNextLevel: number;
  levelProgressPercent: number;
  petStage: FocusPetStage;
}

export interface FocusRewardReceipt {
  awarded: boolean;
  xpAwarded: number;
  previousLevel: number;
  currentLevel: number;
  previousPetStage: FocusPetStage;
  currentPetStage: FocusPetStage;
  levelUp: boolean;
  petStageChanged: boolean;
}