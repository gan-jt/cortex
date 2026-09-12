"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { useFocusLock } from "@/hooks/use-focus-lock";
import { useFocusSession } from "@/hooks/use-focus-session";
import { consumeFocusHandoff } from "@/lib/focus-handoff";

function formatTime(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${String(minutes).padStart(2, "0")}:${String(
    seconds,
  ).padStart(2, "0")}`;
}

const primaryButton =
  "rounded-lg bg-cyan-400 px-4 py-2 font-semibold text-slate-950 disabled:opacity-50";

const secondaryButton =
  "rounded-lg border border-slate-600 px-4 py-2 text-white disabled:opacity-50";

export default function FocusPage() {
  const [handoffChecked, setHandoffChecked] =
    useState(false);

  const {
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
    clear,
  } = useFocusSession();

  const {
    lockState,
    lockError,
    isConnecting,
    isAvailable,
    refreshFocusLock,
  } = useFocusLock(handoffChecked ? session : null);

  useEffect(() => {
    if (!isLoaded || handoffChecked) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      const handoff = consumeFocusHandoff();

      if (handoff) {
        initializeSession({
          taskDescription: handoff.taskDescription,
          plan: handoff.plan,
        });
      }

      setHandoffChecked(true);
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [
    handoffChecked,
    initializeSession,
    isLoaded,
  ]);

  if (!isLoaded || !handoffChecked) {
    return (
      <main className="min-h-screen bg-slate-950 p-8 text-white">
        <p className="text-slate-300">
          Preparing Focus Workspace...
        </p>
      </main>
    );
  }

  if (!session) {
    return (
      <main className="min-h-screen bg-slate-950 p-8 text-white">
        <div className="mx-auto max-w-3xl rounded-2xl border border-slate-700 bg-slate-900 p-8">
          <p className="text-sm font-semibold uppercase tracking-wider text-cyan-400">
            Cortex Focus
          </p>

          <h1 className="mt-3 text-4xl font-bold">
            No Focus Session
          </h1>

          <p className="mt-4 text-slate-300">
            Submit a complex task from the Cortex task
            intake page to create a Focus Plan.
          </p>

          <Link
            className="mt-6 inline-block rounded-lg bg-cyan-400 px-5 py-3 font-semibold text-slate-950"
            href="/"
          >
            Return to Cortex
          </Link>
        </div>
      </main>
    );
  }

  const completedSteps =
    session.completedStepOrders.length;

  return (
    <main className="min-h-screen bg-slate-950 p-6 text-white md:p-10">
      <div className="mx-auto max-w-5xl space-y-6">
        <header>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm font-semibold uppercase tracking-wider text-cyan-400">
              Cortex Focus · {session.status}
            </p>

            <Link
              className="text-sm text-slate-400 hover:text-white"
              href="/"
            >
              Back to Cortex
            </Link>
          </div>

          <h1 className="mt-3 text-3xl font-bold md:text-5xl">
            {session.plan.objective}
          </h1>

          <p className="mt-4 text-lg text-slate-300">
            First action: {session.plan.firstAction}
          </p>
        </header>

        <section className="rounded-2xl border border-slate-700 bg-slate-900 p-6">
          <p className="text-center text-6xl font-bold tabular-nums md:text-8xl">
            {formatTime(remainingSeconds)}
          </p>

          <div className="mt-6 flex flex-wrap justify-center gap-3">
            {session.status === "READY" && (
              <button
                className={primaryButton}
                onClick={start}
              >
                Start Focus
              </button>
            )}

            {session.status === "ACTIVE" && (
              <>
                <button
                  className={secondaryButton}
                  onClick={pause}
                >
                  Pause
                </button>

                <button
                  className={primaryButton}
                  onClick={complete}
                >
                  Complete
                </button>
              </>
            )}

            {session.status === "PAUSED" && (
              <>
                <button
                  className={primaryButton}
                  onClick={resume}
                >
                  Resume
                </button>

                <button
                  className={secondaryButton}
                  onClick={complete}
                >
                  Complete
                </button>
              </>
            )}

            {session.status !== "COMPLETED" &&
              session.status !== "CANCELLED" && (
                <button
                  className={secondaryButton}
                  onClick={cancel}
                >
                  Cancel
                </button>
              )}

            {(session.status === "COMPLETED" ||
              session.status === "CANCELLED") && (
              <button
                className={secondaryButton}
                onClick={clear}
              >
                Clear Session
              </button>
            )}
          </div>
        </section>

        <div className="grid gap-6 md:grid-cols-[2fr_1fr]">
          <section className="rounded-2xl border border-slate-700 bg-slate-900 p-6">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-2xl font-bold">
                Focus Steps
              </h2>

              <p className="text-slate-400">
                {completedSteps}/{session.plan.steps.length}
              </p>
            </div>

            <div className="mt-5 space-y-4">
              {session.plan.steps.map((step) => {
                const isCompleted =
                  session.completedStepOrders.includes(
                    step.order,
                  );

                return (
                  <label
                    className="flex cursor-pointer gap-4 rounded-xl border border-slate-700 p-4"
                    key={step.order}
                  >
                    <input
                      className="mt-1"
                      type="checkbox"
                      checked={isCompleted}
                      onChange={() =>
                        toggleStep(step.order)
                      }
                    />

                    <span>
                      <span className="flex flex-wrap items-center gap-2">
                        <strong>
                          {step.order}. {step.title}
                        </strong>

                        <span className="rounded-full bg-slate-800 px-2 py-1 text-xs text-cyan-300">
                          {step.owner}
                        </span>

                        <span className="text-xs text-slate-500">
                          {step.estimatedMinutes} min
                        </span>
                      </span>

                      <span className="mt-2 block text-slate-300">
                        {step.instruction}
                      </span>

                      <span className="mt-2 block text-sm text-slate-500">
                        Done when: {step.doneWhen}
                      </span>
                    </span>
                  </label>
                );
              })}
            </div>
          </section>

          <aside className="space-y-6">
            <section className="rounded-2xl border border-slate-700 bg-slate-900 p-6">
              <h2 className="text-xl font-bold">
                Focus Lock
              </h2>

              <div className="mt-4 space-y-2 text-sm text-slate-300">
                <p>
                  Extension:{" "}
                  {isConnecting
                    ? "Checking..."
                    : isAvailable
                      ? "Connected"
                      : "Unavailable"}
                </p>

                <p>
                  Blocking:{" "}
                  {lockState?.enabled ? "ON" : "OFF"}
                </p>

                <p>
                  Blocked attempts:{" "}
                  {lockState?.blockedAttempts ?? 0}
                </p>
              </div>

              {lockError && (
                <p className="mt-4 rounded-lg bg-red-950 p-3 text-sm text-red-300">
                  {lockError}
                </p>
              )}

              <button
                className="mt-4 text-sm text-cyan-400"
                onClick={refreshFocusLock}
              >
                Refresh extension
              </button>
            </section>

            <section className="rounded-2xl border border-slate-700 bg-slate-900 p-6">
              <h2 className="text-xl font-bold">
                Blocked Sites
              </h2>

              <ul className="mt-4 space-y-2 text-sm text-slate-300">
                {session.blockedDomains.map((domain) => (
                  <li key={domain}>{domain}</li>
                ))}
              </ul>
            </section>
          </aside>
        </div>

        {reward && session.status === "COMPLETED" && (
          <section className="rounded-2xl border border-emerald-700 bg-emerald-950 p-8 text-center">
            <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-emerald-400 text-4xl shadow-[0_0_60px_rgba(52,211,153,0.6)]">
              ✦
            </div>

            <h2 className="mt-5 text-3xl font-bold">
              Focus Complete
            </h2>

            <p className="mt-2 text-xl text-emerald-200">
              +{reward.xpEarned} XP
            </p>

            <p className="mt-2 text-sm text-emerald-300">
              {reward.completedSteps}/{reward.totalSteps}{" "}
              steps completed · {reward.focusMinutes} focus
              minutes
            </p>
          </section>
        )}
      </div>
    </main>
  );
}