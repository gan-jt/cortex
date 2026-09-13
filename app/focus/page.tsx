"use client";

import Link from "next/link";
import Image from "next/image";
import { useCompanionSelection } from "@/hooks/use-companion-selection";
import { CortexSidebar } from "@/components/layout/cortex-sidebar";
import {
  useEffect,
  useState,
  type CSSProperties,
} from "react";
import { useFocusProfile } from "@/hooks/use-focus-profile";
import { FocusAssistancePanel } from "@/components/focus/focus-assistance-panel";
import { useFocusAssistant } from "@/hooks/use-focus-assistant";

import { useFocusLock } from "@/hooks/use-focus-lock";
import { useFocusSession } from "@/hooks/use-focus-session";
import { consumeFocusHandoff } from "@/lib/focus-handoff";

import {
  ArrowIcon,
  CheckIcon,
  ClockIcon,
  FocusIcon,
  PauseIcon,
  PlayIcon,
  ShieldIcon,
  SparklesIcon,
  XIcon,
} from "@/components/icons";

function formatTime(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${String(minutes).padStart(2, "0")}:${String(
    seconds,
  ).padStart(2, "0")}`;
}

const ASSISTANCE_BUTTON_LABELS = {
  USER: "Guide me",
  CORTEX: "Draft it",
  TOGETHER: "Work together",
} as const;

export default function FocusPage() {
  const [handoffChecked, setHandoffChecked] =
    useState(false);

  const {
    companion,
    companions,
    selectedId,
    selectCompanion,
  } = useCompanionSelection();

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
    assistanceByStep,
    stepContexts,
    loadingStepOrder,
    error: assistanceError,
    isLoaded: isAssistanceLoaded,
    requestAssistance,
    setStepContext,
    clearStepAssistance,
    clearAllAssistance,
  } = useFocusAssistant(session?.id ?? null);

  const {
    profile,
    progress,
    lastRewardReceipt,
    isLoaded: isProfileLoaded,
    awardCompletedSession,
  } = useFocusProfile();

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

  useEffect(() => {
    if (
      !isProfileLoaded ||
      !session ||
      session.status !== "COMPLETED" ||
      !reward
    ) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      awardCompletedSession(session, reward);
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [
    awardCompletedSession,
    isProfileLoaded,
    reward,
    session,
  ]);

  function handleClearSession() {
    clearAllAssistance();
    clear();
  }

  if (!isLoaded || !handoffChecked || !isProfileLoaded) {
    return (
      <main className="focus-shell">
        <CortexSidebar />

        <section className="focus-loading">
          <span className="spinner" />
          Preparing Focus Workspace...
        </section>
      </main>
    );
  }

  if (!session) {
    return (
      <main className="focus-shell">
        <CortexSidebar />

        <section className="focus-empty">
          <div className="focus-empty-icon">
            <FocusIcon />
          </div>

          <p className="eyebrow cyan">
            No Focus Session
          </p>

          <h1>Route a task through Cortex first.</h1>

          <p>
            When a task needs your full attention,
            Cortex will build a focused plan and send
            it here.
          </p>

          <Link
            className="primary-button compact"
            href="/"
          >
            Return to Cortex
            <ArrowIcon />
          </Link>
        </section>
      </main>
    );
  }

  const completedSteps =
    session.completedStepOrders.length;

  const companionMotion =
    session.status === "ACTIVE"
      ? "is-working"
      : session.status === "PAUSED"
        ? "is-paused"
        : session.status === "COMPLETED"
          ? "is-celebrating"
          : "is-idle";

  const totalSteps = session.plan.steps.length;

  const stepProgress =
    totalSteps > 0
      ? (completedSteps / totalSteps) * 100
      : 0;

  const totalFocusSeconds =
    (session.plan.durationMinutes ?? 45) * 60;

  const remainingPercent = Math.max(
    0,
    Math.min(
      100,
      (remainingSeconds / totalFocusSeconds) * 100,
    ),
  );

  const timerRingDegrees =
    session.status === "COMPLETED"
      ? 360
      : session.status === "CANCELLED"
        ? 0
        : remainingPercent * 3.6;


  const focusHeading =
    session.status === "READY"
      ? "Ready to Focus"
      : session.status === "ACTIVE"
        ? "Deep Focus"
        : session.status === "PAUSED"
          ? "Take a Breath"
          : session.status === "COMPLETED"
            ? "Focus Complete"
            : "Session Ended";

  const timerModeLabel =
    session.status === "READY"
      ? "Ready to focus"
      : session.status === "ACTIVE"
        ? "Deep Focus"
        : session.status === "PAUSED"
          ? "Focus paused"
          : session.status === "COMPLETED"
            ? "Session complete"
            : "Session cancelled";

  const nextStepOrder =
    session.plan.steps.find(
      (step) =>
        !session.completedStepOrders.includes(
          step.order,
        ),
    )?.order;

  const isSessionFinished =
    session.status === "COMPLETED" ||
    session.status === "CANCELLED";

  const streakDays =
    profile?.currentStreakDays ?? 0;

  return (
    <main className="focus-shell">
      <CortexSidebar />
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />

      <header className="focus-topbar focus-session-topbar">
        <div className="focus-session-heading">
          <p className="eyebrow cyan">
            Focus Workspace
          </p>

          <strong>
            Stay with the next clear action.
          </strong>
        </div>

        <span
          className={`session-status ${session.status.toLowerCase()}`}
        >
          <i />
          {session.status}
        </span>
      </header>

      <section className="focus-layout">
        <div className="focus-main panel">
          <p className="eyebrow cyan">
            Focus Session
          </p>

          <h1
            className="focus-session-title"
            title={session.plan.objective}
          >
            {focusHeading}
          </h1>

          <p className="focus-task">
            {session.plan.durationMinutes ?? 45} minutes
            {" · "}
            {totalSteps} focused steps
            {" · "}
            Cortex-guided session
          </p>
          <div className="first-action">
            <span>Start here</span>
            <strong>
              {session.plan.firstAction}
            </strong>
          </div>



          <div className="focus-timer-stage">
            <div
              className={`focus-timer-ring focus-timer-${session.status.toLowerCase()}`}
              style={
                {
                  "--timer-progress": `${timerRingDegrees}deg`,
                } as CSSProperties
              }
            >
              <div className="focus-timer-ring-inner">
                <span className="focus-timer-mode">
                  <ClockIcon />
                  {timerModeLabel}
                </span>

                <strong className="focus-timer-value">
                  {formatTime(remainingSeconds)}
                </strong>

                <span className="focus-timer-step-status">
                  {completedSteps} of {totalSteps} steps
                </span>

                <div className="focus-ring-controls">
                  {session.status === "READY" && (
                    <button
                      className="primary-button focus-ring-primary"
                      type="button"
                      onClick={start}
                    >
                      <PlayIcon />
                      Start
                    </button>
                  )}

                  {session.status === "ACTIVE" && (
                    <>
                      <button
                        className="secondary-button focus-ring-secondary"
                        type="button"
                        onClick={pause}
                      >
                        <PauseIcon />
                        Pause
                      </button>

                      <button
                        className="complete-button focus-ring-secondary"
                        type="button"
                        onClick={complete}
                      >
                        <CheckIcon />
                        Complete
                      </button>
                    </>
                  )}

                  {session.status === "PAUSED" && (
                    <>
                      <button
                        className="primary-button focus-ring-primary"
                        type="button"
                        onClick={resume}
                      >
                        <PlayIcon />
                        Resume
                      </button>

                      <button
                        className="complete-button focus-ring-secondary"
                        type="button"
                        onClick={complete}
                      >
                        <CheckIcon />
                        Complete
                      </button>
                    </>
                  )}

                  {isSessionFinished && (
                    <button
                      className="secondary-button focus-ring-secondary"
                      type="button"
                      onClick={handleClearSession}
                    >
                      Clear Session
                    </button>
                  )}
                </div>
              </div>
            </div>

            {!isSessionFinished && (
              <button
                className="focus-end-session"
                type="button"
                onClick={cancel}
              >
                <XIcon />
                End session
              </button>
            )}
          </div>
        </div>

        <section className="steps-panel panel">
          <div className="section-heading compact-heading">
            <div>
              <p className="eyebrow">
                Your Focus Plan
              </p>

              <h2>
                One clear step at a time.
              </h2>
            </div>

            <span className="section-count">
              {completedSteps}/{totalSteps} complete
            </span>
          </div>

          {assistanceError && (
            <p className="focus-error">
              {assistanceError}
            </p>
          )}

          <div className="focus-step-list">
            {session.plan.steps.map((step) => {
              const isCompleted =
                session.completedStepOrders.includes(
                  step.order,
                );

              const isCurrent =
                step.order === nextStepOrder;

              const assistance =
                assistanceByStep[step.order];

              const isLoadingAssistance =
                loadingStepOrder === step.order;

              return (
                <article
                  className={[
                    "focus-step-item",
                    isCompleted
                      ? "focus-step-completed"
                      : "",
                    isCurrent
                      ? "focus-step-current"
                      : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  key={step.order}
                >
                  <button
                    aria-label={
                      isCompleted
                        ? `Mark step ${step.order} incomplete`
                        : `Complete step ${step.order}`
                    }
                    className="focus-step-toggle"
                    disabled={isSessionFinished}
                    type="button"
                    onClick={() =>
                      toggleStep(step.order)
                    }
                  >
                    {isCompleted ? (
                      <CheckIcon />
                    ) : (
                      String(step.order).padStart(
                        2,
                        "0",
                      )
                    )}
                  </button>

                  <div className="focus-step-content">
                    <div className="focus-step-heading">
                      <div>
                        <strong>{step.title}</strong>

                        {isCurrent && (
                          <span className="current-step-badge">
                            Current step
                          </span>
                        )}
                      </div>

                      <div className="focus-step-meta">
                        <span
                          className={`focus-owner focus-owner-${step.owner.toLowerCase()}`}
                        >
                          {step.owner}
                        </span>

                        <span>
                          {step.estimatedMinutes} min
                        </span>
                      </div>
                    </div>

                    <p className="focus-step-instruction">
                      {step.instruction}
                    </p>

                    {step.cortexSupport && (
                      <p className="focus-cortex-support">
                        <SparklesIcon />
                        {step.cortexSupport}
                      </p>
                    )}

                    <p className="focus-done-when">
                      <CheckIcon />
                      <span>
                        <strong>Done when:</strong>{" "}
                        {step.doneWhen}
                      </span>
                    </p>

                    <div className="focus-assistance-slot">
                      <FocusAssistancePanel
                        assistance={assistance}
                        buttonLabel={
                          ASSISTANCE_BUTTON_LABELS[
                          step.owner
                          ]
                        }
                        disabled={
                          isSessionFinished ||
                          isCompleted ||
                          !isAssistanceLoaded
                        }
                        isLoading={
                          isLoadingAssistance
                        }
                        userContext={
                          stepContexts[step.order] ??
                          ""
                        }
                        onUserContextChange={(
                          value,
                        ) => {
                          setStepContext(
                            step.order,
                            value,
                          );
                        }}
                        onRequest={() => {
                          void requestAssistance({
                            sessionId: session.id,
                            taskDescription:
                              session.taskDescription,
                            objective:
                              session.plan.objective,
                            step: {
                              order: step.order,
                              title: step.title,
                              owner: step.owner,
                              instruction:
                                step.instruction,
                              cortexSupport:
                                step.cortexSupport,
                              doneWhen:
                                step.doneWhen,
                            },
                            userContext:
                              stepContexts[
                                step.order
                              ]?.trim() ||
                              undefined,
                          });
                        }}
                        onClear={() =>
                          clearStepAssistance(
                            step.order,
                          )
                        }
                      />
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <section className="focus-tools-grid">
          <article className="focus-tool-card panel">
            <div className="focus-tool-heading">
              <span className="focus-tool-icon lock-icon">
                <ShieldIcon />
              </span>

              <div>
                <p className="eyebrow">
                  Distraction control
                </p>
                <h2>Focus Lock</h2>
              </div>
            </div>

            <div className="focus-lock-status">
              <div>
                <span>Extension</span>
                <strong
                  className={
                    isAvailable
                      ? "status-positive"
                      : "status-muted"
                  }
                >
                  {isConnecting
                    ? "Checking..."
                    : isAvailable
                      ? "Connected"
                      : "Unavailable"}
                </strong>
              </div>

              <div>
                <span>Blocking</span>
                <strong
                  className={
                    lockState?.enabled
                      ? "status-positive"
                      : "status-muted"
                  }
                >
                  {lockState?.enabled
                    ? "Active"
                    : "Off"}
                </strong>
              </div>

              <div>
                <span>Blocked attempts</span>
                <strong>
                  {lockState?.blockedAttempts ?? 0}
                </strong>
              </div>
            </div>

            {lockError && (
              <p className="focus-error">
                {lockError}
              </p>
            )}

            <button
              className="focus-text-button"
              type="button"
              onClick={refreshFocusLock}
            >
              Refresh extension
              <ArrowIcon />
            </button>
          </article>

          <article className="focus-tool-card focus-companion-card panel">
            <div className="focus-tool-heading">
              <span className="focus-tool-icon companion-icon">
                <SparklesIcon />
              </span>

              <div>
                <p className="eyebrow">
                  Your companion
                </p>

                <h2>{companion.name}</h2>

                <p className="companion-personality">
                  {companion.personality}
                </p>
              </div>
            </div>

            <div
              className={`focus-companion-portrait ${companionMotion}`}
              style={{
                borderColor: companion.accent,
                boxShadow: `0 0 42px ${companion.glow}`,
              }}
            >
              <Image
                priority
                alt={`${companion.name}, ${companion.personality} companion`}
                height={170}
                src={companion.image}
                width={170}
              />
            </div>

            <div
              aria-label="Choose your companion"
              className="focus-companion-picker"
              role="radiogroup"
            >
              {companions.map((item) => {
                const isSelected =
                  item.id === selectedId;

                return (
                  <button
                    aria-checked={isSelected}
                    aria-label={`Choose ${item.name}, ${item.personality}`}
                    className={`focus-companion-option ${isSelected ? "is-selected" : ""
                      }`}
                    key={item.id}
                    role="radio"
                    style={
                      isSelected
                        ? {
                          borderColor: item.accent,
                          boxShadow: `0 0 18px ${item.glow}`,
                        }
                        : undefined
                    }
                    type="button"
                    onClick={() => {
                      selectCompanion(item.id);
                    }}
                  >
                    <Image
                      alt=""
                      height={52}
                      src={item.image}
                      width={52}
                    />

                    <strong>{item.name}</strong>
                    <span>{item.personality}</span>
                  </button>
                );
              })}
            </div>

            <div className="focus-level-row">
              <span>
                Level {progress.level}
              </span>

              <span>
                {progress.xpIntoLevel}/
                {progress.xpForNextLevel} XP
              </span>
            </div>

            <div className="focus-level-progress">
              <span
                style={{
                  width: `${progress.levelProgressPercent}%`,
                }}
              />
            </div>

            <div className="focus-profile-stats">
              <div>
                <strong>
                  {profile?.completedSessions ?? 0}
                </strong>
                <span>Sessions</span>
              </div>

              <div>
                <strong>{streakDays}</strong>
                <span>
                  {streakDays === 1
                    ? "Day streak"
                    : "Days streak"}
                </span>
              </div>
            </div>
          </article>

          <article className="focus-tool-card panel">
            <div className="focus-tool-heading">
              <span className="focus-tool-icon blocked-icon">
                <FocusIcon />
              </span>

              <div>
                <p className="eyebrow">
                  Protected space
                </p>
                <h2>Blocked Sites</h2>
              </div>
            </div>

            {session.blockedDomains.length > 0 ? (
              <ul className="focus-domain-list">
                {session.blockedDomains.map(
                  (domain) => (
                    <li key={domain}>
                      <span />
                      {domain}
                    </li>
                  ),
                )}
              </ul>
            ) : (
              <p className="focus-empty-domains">
                No blocked domains were configured for
                this session.
              </p>
            )}
          </article>
        </section>

        {reward &&
          session.status === "COMPLETED" && (
            <section className="focus-reward-panel panel">
              <span className="focus-reward-icon">
                ✦
              </span>

              <div>
                <p className="eyebrow">
                  Session complete
                </p>

                <h2>
                  You moved the work forward.
                </h2>

                <p>
                  {reward.completedSteps}/
                  {reward.totalSteps} steps completed ·{" "}
                  {reward.focusMinutes} focus minutes
                </p>
              </div>

              <div className="focus-reward-xp">
                <strong>
                  +
                  {lastRewardReceipt?.xpAwarded ??
                    reward.xpEarned}
                </strong>

                <span>
                  XP · Level {progress.level}
                </span>
              </div>
            </section>
          )}
      </section>
    </main>
  );
}