"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  awardFocusReward,
  createFocusProfile,
  getFocusProgress,
} from "@/lib/focus-profile";
import {
  clearFocusProfile,
  loadFocusProfile,
  saveFocusProfile,
  subscribeToFocusProfile,
} from "@/lib/focus-profile-storage";
import type {
  FocusProfile,
  FocusRewardReceipt,
} from "@/types/focus-profile";
import type {
  FocusReward,
  FocusSession,
} from "@/types/focus-session";

interface FocusProfileState {
  profile: FocusProfile | null;
  lastRewardReceipt: FocusRewardReceipt | null;
}

export function useFocusProfile() {
  const [state, setState] =
    useState<FocusProfileState>({
      profile: null,
      lastRewardReceipt: null,
    });

  const [isLoaded, setIsLoaded] =
    useState(false);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setState({
        profile: loadFocusProfile(),
        lastRewardReceipt: null,
      });

      setIsLoaded(true);
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, []);

  useEffect(() => {
    if (!isLoaded) {
      return;
    }

    return subscribeToFocusProfile(
      (nextProfile) => {
        setState((currentState) => ({
          ...currentState,
          profile: nextProfile,
        }));
      },
    );
  }, [isLoaded]);

  useEffect(() => {
    if (!isLoaded || !state.profile) {
      return;
    }

    saveFocusProfile(state.profile);
  }, [isLoaded, state.profile]);

  const progress = useMemo(
    () =>
      getFocusProgress(
        state.profile?.totalXp ?? 0,
      ),
    [state.profile?.totalXp],
  );

  const awardCompletedSession = useCallback(
    (
      session: FocusSession,
      reward: FocusReward,
    ) => {
      if (session.status !== "COMPLETED") {
        return;
      }

      setState((currentState) => {
        if (!currentState.profile) {
          return currentState;
        }

        const result = awardFocusReward(
          currentState.profile,
          {
            sessionId: session.id,
            reward,
            completedAt:
              session.completedAt ?? Date.now(),
          },
        );

        if (!result.receipt.awarded) {
          return currentState;
        }

        return {
          profile: result.profile,
          lastRewardReceipt: result.receipt,
        };
      });
    },
    [],
  );

  const clearRewardReceipt = useCallback(() => {
    setState((currentState) => ({
      ...currentState,
      lastRewardReceipt: null,
    }));
  }, []);

  const resetProfile = useCallback(() => {
    const nextProfile = createFocusProfile();

    clearFocusProfile();

    setState({
      profile: nextProfile,
      lastRewardReceipt: null,
    });
  }, []);

  return {
    profile: state.profile,
    progress,
    lastRewardReceipt: state.lastRewardReceipt,
    isLoaded,
    awardCompletedSession,
    clearRewardReceipt,
    resetProfile,
  };
}