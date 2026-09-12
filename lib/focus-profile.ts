import type {
  FocusProfile,
  FocusProgress,
  FocusRewardReceipt,
  FocusPetStage,
} from "@/types/focus-profile";
import type { FocusReward } from "@/types/focus-session";

export const XP_PER_LEVEL = 25;

const MAX_REWARDED_SESSION_IDS = 100;
const DAY_IN_MILLISECONDS = 24 * 60 * 60 * 1000;

interface AwardFocusRewardInput {
  sessionId: string;
  reward: FocusReward;
  completedAt?: number;
}

export interface AwardFocusRewardResult {
  profile: FocusProfile;
  progress: FocusProgress;
  receipt: FocusRewardReceipt;
}

export function getFocusLevel(totalXp: number) {
  const safeXp = Math.max(0, Math.floor(totalXp));

  return Math.floor(safeXp / XP_PER_LEVEL) + 1;
}

export function getFocusPetStage(
  totalXp: number,
): FocusPetStage {
  if (totalXp >= 250) {
    return "GUARDIAN";
  }

  if (totalXp >= 100) {
    return "COMPANION";
  }

  if (totalXp >= 25) {
    return "SPROUT";
  }

  return "SEED";
}

export function getFocusProgress(
  totalXp: number,
): FocusProgress {
  const safeXp = Math.max(0, Math.floor(totalXp));
  const xpIntoLevel = safeXp % XP_PER_LEVEL;

  return {
    level: getFocusLevel(safeXp),
    xpIntoLevel,
    xpForNextLevel: XP_PER_LEVEL,
    levelProgressPercent:
      (xpIntoLevel / XP_PER_LEVEL) * 100,
    petStage: getFocusPetStage(safeXp),
  };
}

export function createFocusProfile(
  now = Date.now(),
): FocusProfile {
  return {
    version: 1,
    totalXp: 0,
    completedSessions: 0,
    totalFocusMinutes: 0,
    totalCompletedSteps: 0,
    currentStreakDays: 0,
    longestStreakDays: 0,
    lastCompletedDate: null,
    rewardedSessionIds: [],
    createdAt: now,
    updatedAt: now,
  };
}

function getLocalDateKey(timestamp: number) {
  const date = new Date(timestamp);
  const year = date.getFullYear();
  const month = String(
    date.getMonth() + 1,
  ).padStart(2, "0");
  const day = String(date.getDate()).padStart(
    2,
    "0",
  );

  return `${year}-${month}-${day}`;
}

function getCalendarDayDifference(
  previousDateKey: string,
  currentDateKey: string,
) {
  const [previousYear, previousMonth, previousDay] =
    previousDateKey.split("-").map(Number);

  const [currentYear, currentMonth, currentDay] =
    currentDateKey.split("-").map(Number);

  const previousDate = Date.UTC(
    previousYear,
    previousMonth - 1,
    previousDay,
  );

  const currentDate = Date.UTC(
    currentYear,
    currentMonth - 1,
    currentDay,
  );

  return Math.round(
    (currentDate - previousDate) /
      DAY_IN_MILLISECONDS,
  );
}

function calculateNextStreak(
  profile: FocusProfile,
  completionDate: string,
) {
  if (!profile.lastCompletedDate) {
    return 1;
  }

  const dayDifference =
    getCalendarDayDifference(
      profile.lastCompletedDate,
      completionDate,
    );

  if (dayDifference <= 0) {
    return profile.currentStreakDays;
  }

  if (dayDifference === 1) {
    return profile.currentStreakDays + 1;
  }

  return 1;
}

export function awardFocusReward(
  profile: FocusProfile,
  {
    sessionId,
    reward,
    completedAt = Date.now(),
  }: AwardFocusRewardInput,
): AwardFocusRewardResult {
  const normalizedSessionId = sessionId.trim();
  const previousProgress = getFocusProgress(
    profile.totalXp,
  );

  if (!normalizedSessionId) {
    throw new Error(
      "A session ID is required to award Focus XP.",
    );
  }

  if (
    profile.rewardedSessionIds.includes(
      normalizedSessionId,
    )
  ) {
    return {
      profile,
      progress: previousProgress,
      receipt: {
        awarded: false,
        xpAwarded: 0,
        previousLevel: previousProgress.level,
        currentLevel: previousProgress.level,
        previousPetStage:
          previousProgress.petStage,
        currentPetStage:
          previousProgress.petStage,
        levelUp: false,
        petStageChanged: false,
      },
    };
  }

  const xpAwarded = Math.max(
    0,
    Math.round(reward.xpEarned),
  );

  const completionDate =
    getLocalDateKey(completedAt);

  const currentStreakDays =
    calculateNextStreak(
      profile,
      completionDate,
    );

  const nextProfile: FocusProfile = {
    ...profile,
    totalXp: profile.totalXp + xpAwarded,
    completedSessions:
      profile.completedSessions + 1,
    totalFocusMinutes:
      profile.totalFocusMinutes +
      Math.max(
        0,
        Math.round(reward.focusMinutes),
      ),
    totalCompletedSteps:
      profile.totalCompletedSteps +
      Math.max(
        0,
        Math.round(reward.completedSteps),
      ),
    currentStreakDays,
    longestStreakDays: Math.max(
      profile.longestStreakDays,
      currentStreakDays,
    ),
    lastCompletedDate: completionDate,
    rewardedSessionIds: [
      ...profile.rewardedSessionIds,
      normalizedSessionId,
    ].slice(-MAX_REWARDED_SESSION_IDS),
    updatedAt: completedAt,
  };

  const nextProgress = getFocusProgress(
    nextProfile.totalXp,
  );

  return {
    profile: nextProfile,
    progress: nextProgress,
    receipt: {
      awarded: true,
      xpAwarded,
      previousLevel: previousProgress.level,
      currentLevel: nextProgress.level,
      previousPetStage:
        previousProgress.petStage,
      currentPetStage: nextProgress.petStage,
      levelUp:
        nextProgress.level >
        previousProgress.level,
      petStageChanged:
        nextProgress.petStage !==
        previousProgress.petStage,
    },
  };
}