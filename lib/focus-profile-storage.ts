"use client";

import { z } from "zod";

import { createFocusProfile } from "@/lib/focus-profile";
import type { FocusProfile } from "@/types/focus-profile";

export const FOCUS_PROFILE_STORAGE_KEY =
  "cortex.focus-profile.v1";

const FocusProfileSchema = z.object({
  version: z.literal(1),
  totalXp: z.number().int().nonnegative(),
  completedSessions: z
    .number()
    .int()
    .nonnegative(),
  totalFocusMinutes: z
    .number()
    .int()
    .nonnegative(),
  totalCompletedSteps: z
    .number()
    .int()
    .nonnegative(),
  currentStreakDays: z
    .number()
    .int()
    .nonnegative(),
  longestStreakDays: z
    .number()
    .int()
    .nonnegative(),
  lastCompletedDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .nullable(),
  rewardedSessionIds: z
    .array(z.string().min(1))
    .max(100),
  createdAt: z.number().nonnegative(),
  updatedAt: z.number().nonnegative(),
});

function getStorage() {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

export function loadFocusProfile(): FocusProfile {
  const storage = getStorage();

  if (!storage) {
    return createFocusProfile();
  }

  const storedValue = storage.getItem(
    FOCUS_PROFILE_STORAGE_KEY,
  );

  if (!storedValue) {
    return createFocusProfile();
  }

  try {
    const parsedValue: unknown =
      JSON.parse(storedValue);

    const result =
      FocusProfileSchema.safeParse(parsedValue);

    if (!result.success) {
      storage.removeItem(
        FOCUS_PROFILE_STORAGE_KEY,
      );

      return createFocusProfile();
    }

    return result.data;
  } catch {
    storage.removeItem(
      FOCUS_PROFILE_STORAGE_KEY,
    );

    return createFocusProfile();
  }
}

export function saveFocusProfile(
  profile: FocusProfile,
) {
  const storage = getStorage();

  if (!storage) {
    return;
  }

  const validatedProfile =
    FocusProfileSchema.parse(profile);

  storage.setItem(
    FOCUS_PROFILE_STORAGE_KEY,
    JSON.stringify(validatedProfile),
  );
}

export function clearFocusProfile() {
  getStorage()?.removeItem(
    FOCUS_PROFILE_STORAGE_KEY,
  );
}

export function subscribeToFocusProfile(
  listener: (profile: FocusProfile) => void,
) {
  if (typeof window === "undefined") {
    return () => undefined;
  }

  function handleStorageEvent(
    event: StorageEvent,
  ) {
    if (
      event.storageArea === window.localStorage &&
      event.key === FOCUS_PROFILE_STORAGE_KEY
    ) {
      listener(loadFocusProfile());
    }
  }

  window.addEventListener(
    "storage",
    handleStorageEvent,
  );

  return () => {
    window.removeEventListener(
      "storage",
      handleStorageEvent,
    );
  };
}