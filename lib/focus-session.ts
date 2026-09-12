import type { FocusPlan } from "@/types/focus";
import type {
  FocusReward,
  FocusSession,
} from "@/types/focus-session";

export const DEFAULT_BLOCKED_DOMAINS = [
  "youtube.com",
  "instagram.com",
  "steamcommunity.com",
  "store.steampowered.com",
];

interface CreateFocusSessionInput {
  taskDescription: string;
  plan: FocusPlan;
  blockedDomains?: string[];
  now?: number;
}

function normalizeHostname(value: string): string {
  const trimmedValue = value.trim().toLowerCase();

  if (!trimmedValue) {
    return "";
  }

  try {
    const url = new URL(
      trimmedValue.includes("://")
        ? trimmedValue
        : `https://${trimmedValue}`,
    );

    return url.hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

function normalizeDomains(domains: string[]): string[] {
  return [
    ...new Set(
      domains
        .map(normalizeHostname)
        .filter((domain) => domain.length > 0),
    ),
  ];
}

export function createFocusSession({
  taskDescription,
  plan,
  blockedDomains = DEFAULT_BLOCKED_DOMAINS,
  now = Date.now(),
}: CreateFocusSessionInput): FocusSession {
  return {
    id: crypto.randomUUID(),
    taskDescription: taskDescription.trim(),
    plan,
    status: "READY",

    durationSeconds: plan.durationMinutes * 60,
    elapsedSeconds: 0,

    startedAt: null,
    activeSince: null,
    expectedEndAt: null,
    pausedAt: null,
    completedAt: null,

    completedStepOrders: [],

    blockedDomains: normalizeDomains(blockedDomains),
    blockedAttempts: [],

    createdAt: now,
    updatedAt: now,
  };
}

export function getElapsedSeconds(
  session: FocusSession,
  now = Date.now(),
): number {
  if (
    session.status !== "ACTIVE" ||
    session.activeSince === null
  ) {
    return Math.min(
      session.durationSeconds,
      session.elapsedSeconds,
    );
  }

  const currentIntervalSeconds = Math.max(
    0,
    Math.floor((now - session.activeSince) / 1000),
  );

  return Math.min(
    session.durationSeconds,
    session.elapsedSeconds + currentIntervalSeconds,
  );
}

export function getRemainingSeconds(
  session: FocusSession,
  now = Date.now(),
): number {
  return Math.max(
    0,
    session.durationSeconds - getElapsedSeconds(session, now),
  );
}

export function startFocusSession(
  session: FocusSession,
  now = Date.now(),
): FocusSession {
  if (session.status !== "READY") {
    throw new Error("Only a ready focus session can be started.");
  }

  return {
    ...session,
    status: "ACTIVE",
    startedAt: now,
    activeSince: now,
    expectedEndAt: now + session.durationSeconds * 1000,
    pausedAt: null,
    updatedAt: now,
  };
}

export function pauseFocusSession(
  session: FocusSession,
  now = Date.now(),
): FocusSession {
  if (session.status !== "ACTIVE") {
    throw new Error("Only an active focus session can be paused.");
  }

  const elapsedSeconds = getElapsedSeconds(session, now);

  if (elapsedSeconds >= session.durationSeconds) {
    return completeFocusSession(session, now);
  }

  return {
    ...session,
    status: "PAUSED",
    elapsedSeconds,
    activeSince: null,
    expectedEndAt: null,
    pausedAt: now,
    updatedAt: now,
  };
}

export function resumeFocusSession(
  session: FocusSession,
  now = Date.now(),
): FocusSession {
  if (session.status !== "PAUSED") {
    throw new Error("Only a paused focus session can be resumed.");
  }

  const remainingSeconds = getRemainingSeconds(session, now);

  if (remainingSeconds === 0) {
    return completeFocusSession(session, now);
  }

  return {
    ...session,
    status: "ACTIVE",
    activeSince: now,
    expectedEndAt: now + remainingSeconds * 1000,
    pausedAt: null,
    updatedAt: now,
  };
}

export function toggleFocusStep(
  session: FocusSession,
  stepOrder: number,
  now = Date.now(),
): FocusSession {
  if (
    session.status === "COMPLETED" ||
    session.status === "CANCELLED"
  ) {
    throw new Error("A finished focus session cannot be changed.");
  }

  const stepExists = session.plan.steps.some(
    (step) => step.order === stepOrder,
  );

  if (!stepExists) {
    throw new Error("The requested focus step does not exist.");
  }

  const isCompleted =
    session.completedStepOrders.includes(stepOrder);

  const completedStepOrders = isCompleted
    ? session.completedStepOrders.filter(
        (order) => order !== stepOrder,
      )
    : [...session.completedStepOrders, stepOrder].sort(
        (first, second) => first - second,
      );

  return {
    ...session,
    completedStepOrders,
    updatedAt: now,
  };
}

export function recordBlockedAttempt(
  session: FocusSession,
  hostname: string,
  now = Date.now(),
): FocusSession {
  if (session.status !== "ACTIVE") {
    throw new Error(
      "Blocked attempts can only be recorded during an active session.",
    );
  }

  const normalizedHostname = normalizeHostname(hostname);

  if (!normalizedHostname) {
    throw new Error("A valid hostname is required.");
  }

  return {
    ...session,
    blockedAttempts: [
      ...session.blockedAttempts,
      {
        hostname: normalizedHostname,
        attemptedAt: now,
      },
    ],
    updatedAt: now,
  };
}

export function completeFocusSession(
  session: FocusSession,
  now = Date.now(),
): FocusSession {
  if (session.status === "COMPLETED") {
    return session;
  }

  if (session.status === "CANCELLED") {
    throw new Error("A cancelled focus session cannot be completed.");
  }

  return {
    ...session,
    status: "COMPLETED",
    elapsedSeconds: getElapsedSeconds(session, now),
    activeSince: null,
    expectedEndAt: null,
    pausedAt: null,
    completedAt: now,
    updatedAt: now,
  };
}

export function cancelFocusSession(
  session: FocusSession,
  now = Date.now(),
): FocusSession {
  if (session.status === "CANCELLED") {
    return session;
  }

  if (session.status === "COMPLETED") {
    throw new Error("A completed focus session cannot be cancelled.");
  }

  return {
    ...session,
    status: "CANCELLED",
    elapsedSeconds: getElapsedSeconds(session, now),
    activeSince: null,
    expectedEndAt: null,
    pausedAt: null,
    updatedAt: now,
  };
}

export function synchronizeFocusSession(
  session: FocusSession,
  now = Date.now(),
): FocusSession {
  if (
    session.status === "ACTIVE" &&
    getRemainingSeconds(session, now) === 0
  ) {
    return completeFocusSession(session, now);
  }

  return session;
}

export function calculateFocusReward(
  session: FocusSession,
  now = Date.now(),
): FocusReward {
  const focusMinutes = Math.floor(
    getElapsedSeconds(session, now) / 60,
  );

  const completedSteps = session.completedStepOrders.length;
  const totalSteps = session.plan.steps.length;

  const completionRate =
    totalSteps === 0
      ? 0
      : Number((completedSteps / totalSteps).toFixed(2));

  return {
    focusMinutes,
    completedSteps,
    totalSteps,
    completionRate,
    xpEarned: focusMinutes + completedSteps * 5,
  };
}