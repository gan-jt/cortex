"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import {
  getFocusLockState,
  startFocusLock,
  stopFocusLock,
  type FocusLockState,
} from "@/lib/focus-lock-client";
import type {
  FocusSession,
  FocusSessionStatus,
} from "@/types/focus-session";

function getErrorMessage(error: unknown) {
  return error instanceof Error
    ? error.message
    : "Could not connect to Cortex Focus Lock.";
}

export function useFocusLock(session: FocusSession | null) {
  const [lockState, setLockState] = useState<FocusLockState | null>(null);
  const [lockError, setLockError] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  const previousStatusRef = useRef<FocusSessionStatus | null>(null);

  const status = session?.status ?? null;
  const sessionId = session?.id ?? null;
  const endsAt = session?.expectedEndAt ?? null;
  const blockedDomainsKey = session?.blockedDomains.join(",") ?? "";

  const refreshFocusLock = useCallback(async () => {
    setIsConnecting(true);

    try {
      const nextState = await getFocusLockState();
      setLockState(nextState);
      setLockError(null);
    } catch (error) {
      setLockState(null);
      setLockError(getErrorMessage(error));
    } finally {
      setIsConnecting(false);
    }
  }, []);

  useEffect(() => {
    const previousStatus = previousStatusRef.current;
    previousStatusRef.current = status;

    let cancelled = false;

    async function synchronizeFocusLock() {
      setIsConnecting(true);

      try {
        let nextState: FocusLockState;

        if (status === "ACTIVE") {
          if (!sessionId || !endsAt) {
            throw new Error(
              "The active focus session does not have a valid end time.",
            );
          }

          nextState = await startFocusLock({
            sessionId,
            endsAt,
            blockedDomains: blockedDomainsKey
              .split(",")
              .filter(Boolean),
            resetAttempts: previousStatus === "READY",
          });
        } else if (
          status === "READY" ||
          status === "PAUSED" ||
          status === "COMPLETED" ||
          status === "CANCELLED" ||
          (status === null && previousStatus !== null)
        ) {
          nextState = await stopFocusLock();
        } else {
          nextState = await getFocusLockState();
        }

        if (!cancelled) {
          setLockState(nextState);
          setLockError(null);
        }
      } catch (error) {
        if (!cancelled) {
          setLockState(null);
          setLockError(getErrorMessage(error));
        }
      } finally {
        if (!cancelled) {
          setIsConnecting(false);
        }
      }
    }

    void synchronizeFocusLock();

    return () => {
      cancelled = true;
    };
  }, [blockedDomainsKey, endsAt, sessionId, status]);

  return {
    lockState,
    lockError,
    isConnecting,
    isAvailable: lockState !== null && lockError === null,
    refreshFocusLock,
  };
}