"use client";

export interface FocusLockState {
  enabled: boolean;
  blockedDomains: string[];
  blockedAttempts: number;
  sessionId: string | null;
  endsAt: number | null;
}

interface FocusLockResponse {
  ok: boolean;
  state?: FocusLockState;
  error?: string;
}

interface ChromeRuntimeLike {
  lastError?: {
    message?: string;
  };

  sendMessage: (
    extensionId: string,
    message: unknown,
    callback: (response?: FocusLockResponse) => void,
  ) => void;
}

interface ChromeLike {
  runtime?: ChromeRuntimeLike;
}

declare global {
  interface Window {
    chrome?: ChromeLike;
  }
}

function getExtensionConnection() {
  if (typeof window === "undefined") {
    throw new Error(
      "Focus Lock is only available in the browser.",
    );
  }

  const extensionId =
    process.env.NEXT_PUBLIC_CORTEX_EXTENSION_ID?.trim();

  if (!extensionId) {
    throw new Error(
      "The Cortex Focus Lock extension ID is not configured.",
    );
  }

  const runtime = window.chrome?.runtime;

  if (!runtime?.sendMessage) {
    throw new Error(
      "The Cortex Focus Lock extension is not available.",
    );
  }

  return {
    extensionId,
    runtime,
  };
}

function sendFocusLockMessage(
  message: unknown,
): Promise<FocusLockState> {
  return new Promise((resolve, reject) => {
    let connection: ReturnType<
      typeof getExtensionConnection
    >;

    try {
      connection = getExtensionConnection();
    } catch (error) {
      reject(error);
      return;
    }

    const { extensionId, runtime } = connection;

    runtime.sendMessage(
      extensionId,
      message,
      (response) => {
        const runtimeError = runtime.lastError;

        if (runtimeError) {
          reject(
            new Error(
              runtimeError.message ??
                "Could not connect to Focus Lock.",
            ),
          );
          return;
        }

        if (!response?.ok || !response.state) {
          reject(
            new Error(
              response?.error ??
                "Focus Lock returned an invalid response.",
            ),
          );
          return;
        }

        resolve(response.state);
      },
    );
  });
}

export function getFocusLockState() {
  return sendFocusLockMessage({
    type: "CORTEX_GET_LOCK_STATE",
  });
}

interface StartFocusLockInput {
  sessionId: string;
  endsAt: number;
  blockedDomains: string[];
  resetAttempts?: boolean;
}

export function startFocusLock({
  sessionId,
  endsAt,
  blockedDomains,
  resetAttempts = false,
}: StartFocusLockInput) {
  return sendFocusLockMessage({
    type: "CORTEX_START_FOCUS",
    sessionId,
    endsAt,
    blockedDomains,
    resetAttempts,
  });
}

export function stopFocusLock() {
  return sendFocusLockMessage({
    type: "CORTEX_STOP_FOCUS",
  });
}

export async function isFocusLockAvailable() {
  try {
    await getFocusLockState();
    return true;
  } catch {
    return false;
  }
}