import type { FocusAssistance } from "@/types/focus-assistance";

const STORAGE_VERSION = 1;
const STORAGE_PREFIX = "cortex.focus-assistance";

export interface FocusAssistanceWorkspace {
  assistanceByStep: Record<number, FocusAssistance>;
  stepContexts: Record<number, string>;
}

interface StoredFocusAssistanceWorkspace
  extends FocusAssistanceWorkspace {
  version: number;
  sessionId: string;
  updatedAt: number;
}

function createEmptyWorkspace(): FocusAssistanceWorkspace {
  return {
    assistanceByStep: {},
    stepContexts: {},
  };
}

function getStorageKey(sessionId: string): string {
  return `${STORAGE_PREFIX}.${sessionId}`;
}

export function loadFocusAssistanceWorkspace(
  sessionId: string,
): FocusAssistanceWorkspace {
  if (typeof window === "undefined") {
    return createEmptyWorkspace();
  }

  try {
    const storedValue = window.localStorage.getItem(
      getStorageKey(sessionId),
    );

    if (!storedValue) {
      return createEmptyWorkspace();
    }

    const parsed = JSON.parse(
      storedValue,
    ) as Partial<StoredFocusAssistanceWorkspace>;

    if (
      parsed.version !== STORAGE_VERSION ||
      parsed.sessionId !== sessionId ||
      !parsed.assistanceByStep ||
      !parsed.stepContexts
    ) {
      return createEmptyWorkspace();
    }

    return {
      assistanceByStep: parsed.assistanceByStep,
      stepContexts: parsed.stepContexts,
    };
  } catch {
    return createEmptyWorkspace();
  }
}

export function saveFocusAssistanceWorkspace(
  sessionId: string,
  workspace: FocusAssistanceWorkspace,
): void {
  if (typeof window === "undefined") {
    return;
  }

  const storedWorkspace: StoredFocusAssistanceWorkspace = {
    version: STORAGE_VERSION,
    sessionId,
    updatedAt: Date.now(),
    assistanceByStep: workspace.assistanceByStep,
    stepContexts: workspace.stepContexts,
  };

  try {
    window.localStorage.setItem(
      getStorageKey(sessionId),
      JSON.stringify(storedWorkspace),
    );
  } catch {
    // Cortex can continue without local persistence.
  }
}

export function clearFocusAssistanceWorkspace(
  sessionId: string,
): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.removeItem(
      getStorageKey(sessionId),
    );
  } catch {
    // The in-memory workspace can still be cleared.
  }
}