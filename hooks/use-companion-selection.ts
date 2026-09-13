"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  COMPANIONS,
  isCompanionId,
  type CompanionId,
} from "@/lib/companions";

const COMPANION_STORAGE_KEY =
  "cortex.selected-companion.v1";

const COMPANION_UPDATED_EVENT =
  "cortex:companion-updated";

export function useCompanionSelection() {
  const [selectedId, setSelectedId] =
    useState<CompanionId>("sprout");

  const [isLoaded, setIsLoaded] =
    useState(false);

  useEffect(() => {
    function handleCompanionUpdate(
      event: Event,
    ) {
      const companionEvent =
        event as CustomEvent<CompanionId>;

      if (isCompanionId(companionEvent.detail)) {
        setSelectedId(companionEvent.detail);
      }
    }

    window.addEventListener(
      COMPANION_UPDATED_EVENT,
      handleCompanionUpdate,
    );

    const timeoutId = window.setTimeout(() => {
      const storedId = window.localStorage.getItem(
        COMPANION_STORAGE_KEY,
      );

      if (isCompanionId(storedId)) {
        setSelectedId(storedId);
      }

      setIsLoaded(true);
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);

      window.removeEventListener(
        COMPANION_UPDATED_EVENT,
        handleCompanionUpdate,
      );
    };
  }, []);

  const selectCompanion = useCallback(
    (companionId: CompanionId) => {
      setSelectedId(companionId);

      window.localStorage.setItem(
        COMPANION_STORAGE_KEY,
        companionId,
      );

      window.dispatchEvent(
        new CustomEvent<CompanionId>(
          COMPANION_UPDATED_EVENT,
          {
            detail: companionId,
          },
        ),
      );
    },
    [],
  );

  const companion = useMemo(
    () =>
      COMPANIONS.find(
        (item) => item.id === selectedId,
      ) ?? COMPANIONS[0],
    [selectedId],
  );

  return {
    companion,
    companions: COMPANIONS,
    selectedId,
    isLoaded,
    selectCompanion,
  };
}