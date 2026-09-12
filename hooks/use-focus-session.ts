"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  calculateFocusReward,
  cancelFocusSession,
  completeFocusSession,
  createFocusSession,
  DEFAULT_BLOCKED_DOMAINS,
  getRemainingSeconds,
  pauseFocusSession,
  recordBlockedAttempt,
  resumeFocusSession,
  startFocusSession,
  synchronizeFocusSession,
  toggleFocusStep,
} from "@/lib/focus-session";
import {
  clearFocusSession,
  loadFocusSession,
  saveFocusSession,
} from "@/lib/focus-storage";
import type { FocusPlan } from "@/types/focus";
import type { FocusSession } from "@/types/focus-session";

interface InitializeFocusSessionInput {
  taskDescription: string;
  plan: FocusPlan;
  blockedDomains?: string[];
}

export function useFocusSession() {
  const [session, setSession] =
    useState<FocusSession | null>(null);

  const [currentTime, setCurrentTime] = useState(
    () => Date.now(),
  );

  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setSession(loadFocusSession());
      setCurrentTime(Date.now());
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

    if (session) {
      saveFocusSession(session);
    } else {
      clearFocusSession();
    }
  }, [isLoaded, session]);

  const isActive = session?.status === "ACTIVE";

  useEffect(() => {
    if (!isActive) {
      return;
    }

    const intervalId = window.setInterval(() => {
      const now = Date.now();

      setCurrentTime(now);

      setSession((currentSession) => {
        if (!currentSession) {
          return null;
        }

        return synchronizeFocusSession(
          currentSession,
          now,
        );
      });
    }, 1000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [isActive]);

  const remainingSeconds = session
    ? getRemainingSeconds(session, currentTime)
    : 0;

  const reward = useMemo(
    () =>
      session
        ? calculateFocusReward(session, currentTime)
        : null,
    [currentTime, session],
  );

  const initializeSession = useCallback(
    ({
      taskDescription,
      plan,
      blockedDomains = DEFAULT_BLOCKED_DOMAINS,
    }: InitializeFocusSessionInput) => {
      const nextSession = createFocusSession({
        taskDescription,
        plan,
        blockedDomains,
      });

      setCurrentTime(Date.now());
      setSession(nextSession);

      return nextSession;
    },
    [],
  );

  const start = useCallback(() => {
    setSession((currentSession) =>
      currentSession
        ? startFocusSession(currentSession)
        : null,
    );
  }, []);

  const pause = useCallback(() => {
    setSession((currentSession) =>
      currentSession
        ? pauseFocusSession(currentSession)
        : null,
    );
  }, []);

  const resume = useCallback(() => {
    setSession((currentSession) =>
      currentSession
        ? resumeFocusSession(currentSession)
        : null,
    );
  }, []);

  const complete = useCallback(() => {
    setSession((currentSession) =>
      currentSession
        ? completeFocusSession(currentSession)
        : null,
    );
  }, []);

  const cancel = useCallback(() => {
    setSession((currentSession) =>
      currentSession
        ? cancelFocusSession(currentSession)
        : null,
    );
  }, []);

  const toggleStep = useCallback((stepOrder: number) => {
    setSession((currentSession) =>
      currentSession
        ? toggleFocusStep(currentSession, stepOrder)
        : null,
    );
  }, []);

  const addBlockedAttempt = useCallback(
    (hostname: string) => {
      setSession((currentSession) =>
        currentSession
          ? recordBlockedAttempt(
              currentSession,
              hostname,
            )
          : null,
      );
    },
    [],
  );

  const clear = useCallback(() => {
    setSession(null);
  }, []);

  return {
    session,
    isLoaded,
    remainingSeconds,
    reward,

    initializeSession,
    start,
    pause,
    resume,
    complete,
    cancel,
    toggleStep,
    addBlockedAttempt,
    clear,
  };
}