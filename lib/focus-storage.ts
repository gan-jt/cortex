"use client";

import { z } from "zod";

import { synchronizeFocusSession } from "@/lib/focus-session";
import type { FocusSession } from "@/types/focus-session";

export const FOCUS_SESSION_STORAGE_KEY =
  "cortex.focus-session.v1";

const FocusStepSchema = z.object({
  order: z.number().int(),
  title: z.string(),
  owner: z.enum(["USER", "CORTEX", "TOGETHER"]),
  instruction: z.string(),
  cortexSupport: z.string().nullable(),
  estimatedMinutes: z.number(),
  doneWhen: z.string(),
});

const FocusPlanSchema = z.object({
  objective: z.string(),
  durationMinutes: z.number(),
  firstAction: z.string(),
  steps: z.array(FocusStepSchema),
  questionsToResolve: z.array(z.string()),
  completionCriteria: z.array(z.string()),
});

const FocusSessionSchema = z.object({
  id: z.string(),
  taskDescription: z.string(),
  plan: FocusPlanSchema,
  status: z.enum([
    "READY",
    "ACTIVE",
    "PAUSED",
    "COMPLETED",
    "CANCELLED",
  ]),

  durationSeconds: z.number(),
  elapsedSeconds: z.number(),

  startedAt: z.number().nullable(),
  activeSince: z.number().nullable(),
  expectedEndAt: z.number().nullable(),
  pausedAt: z.number().nullable(),
  completedAt: z.number().nullable(),

  completedStepOrders: z.array(z.number()),
  blockedDomains: z.array(z.string()),

  blockedAttempts: z.array(
    z.object({
      hostname: z.string(),
      attemptedAt: z.number(),
    }),
  ),

  createdAt: z.number(),
  updatedAt: z.number(),
});

const StoredFocusSessionSchema = z.object({
  version: z.literal(1),
  session: FocusSessionSchema,
});

function canUseLocalStorage(): boolean {
  return typeof window !== "undefined";
}

export function saveFocusSession(
  session: FocusSession,
): boolean {
  if (!canUseLocalStorage()) {
    return false;
  }

  try {
    window.localStorage.setItem(
      FOCUS_SESSION_STORAGE_KEY,
      JSON.stringify({
        version: 1,
        session,
      }),
    );

    return true;
  } catch (error) {
    console.error("Could not save focus session:", error);
    return false;
  }
}

export function loadFocusSession(): FocusSession | null {
  if (!canUseLocalStorage()) {
    return null;
  }

  try {
    const storedValue = window.localStorage.getItem(
      FOCUS_SESSION_STORAGE_KEY,
    );

    if (!storedValue) {
      return null;
    }

    const parsedValue = StoredFocusSessionSchema.safeParse(
      JSON.parse(storedValue),
    );

    if (!parsedValue.success) {
      clearFocusSession();
      return null;
    }

    const synchronizedSession = synchronizeFocusSession(
      parsedValue.data.session,
    );

    if (
      synchronizedSession !== parsedValue.data.session
    ) {
      saveFocusSession(synchronizedSession);
    }

    return synchronizedSession;
  } catch (error) {
    console.error("Could not load focus session:", error);
    clearFocusSession();
    return null;
  }
}

export function clearFocusSession(): void {
  if (!canUseLocalStorage()) {
    return;
  }

  window.localStorage.removeItem(
    FOCUS_SESSION_STORAGE_KEY,
  );
}

export function subscribeToFocusSession(
  listener: (session: FocusSession | null) => void,
): () => void {
  if (!canUseLocalStorage()) {
    return () => undefined;
  }

  const handleStorageChange = (event: StorageEvent) => {
    if (event.key === FOCUS_SESSION_STORAGE_KEY) {
      listener(loadFocusSession());
    }
  };

  window.addEventListener("storage", handleStorageChange);

  return () => {
    window.removeEventListener(
      "storage",
      handleStorageChange,
    );
  };
}