"use client";

import { z } from "zod";

import type { FocusPlan } from "@/types/focus";

const STORAGE_KEY = "cortex.focus-handoff.v1";
const MAX_AGE_MS = 15 * 60 * 1000;

const FocusPlanStepSchema = z.object({
  order: z.number().int().positive(),
  title: z.string().min(1),
  owner: z.enum(["USER", "CORTEX", "TOGETHER"]),
  instruction: z.string().min(1),
  cortexSupport: z.string().nullable(),
  estimatedMinutes: z.number().int().nonnegative(),
  doneWhen: z.string().min(1),
});

const FocusPlanSchema = z.object({
  objective: z.string().min(1),
  durationMinutes: z.number().int().positive(),
  firstAction: z.string().min(1),
  steps: z.array(FocusPlanStepSchema).min(1),
  questionsToResolve: z.array(z.string()),
  completionCriteria: z.array(z.string()),
});

const FocusHandoffSchema = z.object({
  version: z.literal(1),
  taskDescription: z.string().min(1),
  plan: FocusPlanSchema,
  createdAt: z.number().nonnegative(),
});

export interface FocusHandoff {
  version: 1;
  taskDescription: string;
  plan: FocusPlan;
  createdAt: number;
}

interface SaveFocusHandoffInput {
  taskDescription: string;
  plan: FocusPlan;
}

function getStorage() {
  if (typeof window === "undefined") {
    return null;
  }

  return window.sessionStorage;
}

export function saveFocusHandoff({
  taskDescription,
  plan,
}: SaveFocusHandoffInput) {
  const storage = getStorage();
  const normalizedDescription = taskDescription.trim();

  if (!storage) {
    throw new Error(
      "Focus handoff is only available in the browser.",
    );
  }

  if (!normalizedDescription) {
    throw new Error(
      "A task description is required to start Focus Mode.",
    );
  }

  const handoff: FocusHandoff = {
    version: 1,
    taskDescription: normalizedDescription,
    plan,
    createdAt: Date.now(),
  };

  const validatedHandoff =
    FocusHandoffSchema.parse(handoff);

  storage.setItem(
    STORAGE_KEY,
    JSON.stringify(validatedHandoff),
  );
}

export function loadFocusHandoff(): FocusHandoff | null {
  const storage = getStorage();

  if (!storage) {
    return null;
  }

  const storedValue = storage.getItem(STORAGE_KEY);

  if (!storedValue) {
    return null;
  }

  try {
    const parsedValue: unknown = JSON.parse(storedValue);
    const result =
      FocusHandoffSchema.safeParse(parsedValue);

    if (!result.success) {
      storage.removeItem(STORAGE_KEY);
      return null;
    }

    if (Date.now() - result.data.createdAt > MAX_AGE_MS) {
      storage.removeItem(STORAGE_KEY);
      return null;
    }

    return result.data;
  } catch {
    storage.removeItem(STORAGE_KEY);
    return null;
  }
}

export function consumeFocusHandoff(): FocusHandoff | null {
  const handoff = loadFocusHandoff();
  const storage = getStorage();

  storage?.removeItem(STORAGE_KEY);

  return handoff;
}

export function clearFocusHandoff() {
  getStorage()?.removeItem(STORAGE_KEY);
}