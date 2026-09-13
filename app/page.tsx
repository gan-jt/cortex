"use client";

import {
  type FormEvent,
  useState,
} from "react";

import { CortexSidebar } from "@/components/layout/cortex-sidebar";
import { DashboardOverview } from "@/components/dashboard/dashboard-overview";
import { RoutingConversation } from "@/components/dashboard/routing-conversation";
import { DashboardCommandBar } from "@/components/dashboard/dashboard-command-bar";
import { ResearchEntryCard } from "@/components/dashboard/research-entry-card";

import Image from "next/image";
import { useCompanionSelection } from "@/hooks/use-companion-selection";

import { ApprovalHistory } from "@/components/approval/approval-history";
import { ApprovalPanel } from "@/components/approval/approval-panel";
import {
  ArrowIcon,
  CheckIcon,
  FocusIcon,
  ShieldIcon,
  SparklesIcon,
  ZapIcon,
} from "@/components/icons";
import { ClarificationPanel } from "@/components/task/clarification-panel";
import { useApprovalDecision } from "@/hooks/use-approval-decision";
import { useFocusProfile } from "@/hooks/use-focus-profile";
import { useTaskSubmission } from "@/hooks/use-task-submission";

type CortexMode = "AUTO" | "APPROVAL" | "FOCUS";

const EXAMPLE_TASKS = [
  {
    mode: "AUTO" as const,
    label: "Summarize this note",
    description:
      "Summarize this note in one sentence: Cortex automatically handles simple tasks, requests approval for risky actions, and turns complex work into focused sessions.",
  },
  {
    mode: "APPROVAL" as const,
    label: "Send a project update",
    description:
      "Send this email to cortex-team@example.com. Subject: Cortex beta launch update. Body: The Focus workflow and website blocking features are ready for team testing. Please send feedback by Monday.",
  },
  {
    mode: "FOCUS" as const,
    label: "Build a launch strategy",
    description:
      "Create a 45-minute launch strategy session for Cortex, a productivity app for college students. The goal is to recruit 50 beta users in two weeks using campus clubs and Instagram with a $200 budget. I need channel priorities, key messages, and success metrics.",
  },
];

const ROUTING_MODES = [
  {
    mode: "AUTO" as const,
    title: "Automatic execution",
    detail:
      "Clear, low-risk tasks are completed by Cortex with a verification checklist.",
    status: "Ready",
  },
  {
    mode: "APPROVAL" as const,
    title: "Controlled action",
    detail:
      "External or irreversible actions stop for human review before execution.",
    status: "Protected",
  },
  {
    mode: "FOCUS" as const,
    title: "Guided focus",
    detail:
      "Complex work becomes a structured session with steps, assistance, and Focus Lock.",
    status: "Focused",
  },
];

function modeIcon(mode: CortexMode) {
  if (mode === "AUTO") {
    return <ZapIcon />;
  }

  if (mode === "APPROVAL") {
    return <ShieldIcon />;
  }

  return <FocusIcon />;
}

export default function Home() {
  const [description, setDescription] =
    useState("");

  const [showExamples, setShowExamples] =
    useState(false);

  const { companion } =
    useCompanionSelection();

  const {
    result,
    error,
    isSubmitting,
    submitTask,
    clearResult,
  } = useTaskSubmission();

  const {
    approvalRecord,
    history,
    isHistoryLoaded,
    isSubmitting: isApprovalSubmitting,
    error: approvalError,
    submitDecision,
    clearDecision,
    clearHistory,
  } = useApprovalDecision();

  const {
    profile,
    progress,
  } = useFocusProfile();

  const clarificationQuestions =
    result?.clarificationQuestions ??
    result?.decision.missingInformation ??
    [];

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();
    clearDecision();

    try {
      await submitTask(description);
    } catch {
      // The hook exposes the error for display.
    }
  }

  async function handleClarification(
    details: string,
  ) {
    const originalTask =
      result?.task.description ??
      description.trim();

    const expandedDescription = [
      originalTask,
      "",
      "Additional context:",
      details,
    ].join("\n");

    setDescription(expandedDescription);
    clearDecision();

    try {
      await submitTask(expandedDescription);
    } catch {
      // The hook exposes the error for display.
    }
  }

  function selectExample(
    example: (typeof EXAMPLE_TASKS)[number],
  ) {
    setDescription(example.description);
    setShowExamples(false);
    clearResult();
    clearDecision();

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  return (
    <main className="app-shell">
      <CortexSidebar />
      <div
        aria-hidden="true"
        className="ambient ambient-one"
      />

      <div
        aria-hidden="true"
        className="ambient ambient-two"
      />

      <section
        className="dashboard"
        id="top"
      >
        <header className="topbar">
          <div>
            <p className="eyebrow">
              COMMAND CENTER
            </p>

            <h1>Welcome back, Leo</h1>

            <p>
              Ready to route your next task?
            </p>
          </div>

          <div className="topbar-actions">
            <DashboardCommandBar />
            <span className="system-status">
              <i />
              Cortex AI · Online
            </span>

            <span className="avatar">L</span>
          </div>
        </header>

        <div className="dashboard-grid">
          <section className="task-card panel">
            <div className="task-card-glow" />

            <div className="card-heading">
              <div>
                <p className="eyebrow cyan">
                  ASK CORTEX
                </p>

                <h2>
                  What do you need to get done?
                </h2>

                <p>
                  Cortex chooses the right mode
                  before any work begins.
                </p>
              </div>

              <span className="ai-pill">
                <SparklesIcon />
                Cortex AI
              </span>
            </div>

            <form onSubmit={handleSubmit}>
              <label
                className="sr-only"
                htmlFor="task-description"
              >
                Describe your task
              </label>

              <textarea
                id="task-description"
                placeholder="Describe a task, decision, or something you're stuck on..."
                rows={5}
                value={description}
                onChange={(event) => {
                  setDescription(
                    event.target.value,
                  );
                  clearResult();
                  clearDecision();
                }}
              />

              <div className="composer-actions">
                <button
                  className="secondary-button"
                  type="button"
                  onClick={() => {
                    setShowExamples(
                      (current) => !current,
                    );
                  }}
                >
                  <SparklesIcon />
                  Examples
                </button>

                <button
                  className="primary-button"
                  disabled={
                    isSubmitting ||
                    !description.trim()
                  }
                  type="submit"
                >
                  {isSubmitting ? (
                    <>
                      <span className="spinner" />
                      Cortex is routing...
                    </>
                  ) : (
                    <>
                      Route task
                      <ArrowIcon />
                    </>
                  )}
                </button>
              </div>
            </form>

            <div
              className={`example-drawer ${showExamples
                ? "example-drawer-open"
                : ""
                }`}
            >
              {EXAMPLE_TASKS.map(
                (example) => (
                  <button
                    className={`example-chip ${example.mode.toLowerCase()}`}
                    key={example.mode}
                    type="button"
                    onClick={() => {
                      selectExample(example);
                    }}
                  >
                    <span>{example.mode}</span>
                    {example.label}
                  </button>
                ),
              )}
            </div>

            {error && (
              <div className="error-banner">
                {error}
              </div>
            )}

            {(isSubmitting || result) && (
              <RoutingConversation
                key={
                  isSubmitting
                    ? `routing-${description}`
                    : `result-${result?.status}`
                }
                taskDescription={
                  result?.task.description ??
                  description
                }
                isSubmitting={isSubmitting}
                mode={result?.decision.mode}
                status={result?.status}
                reason={result?.decision.reason}
              />
            )}

            {result && (
              <section
                className={`routing-result mode-${result.decision.mode.toLowerCase()}`}
                id="routing-result"
              >
                <div className="result-topline">
                  <span
                    className={`mode-badge ${result.decision.mode.toLowerCase()}`}
                  >
                    {modeIcon(
                      result.decision.mode,
                    )}
                    {result.decision.mode}
                  </span>

                  <span className="result-status">
                    {result.status.replaceAll(
                      "_",
                      " ",
                    )}
                  </span>

                  <span className="confidence">
                    {Math.round(
                      result.decision
                        .confidence * 100,
                    )}
                    % confidence
                  </span>
                </div>

                <h3>Routing Decision</h3>

                <p className="decision-reason">
                  {result.decision.reason}
                </p>

                {result.status ===
                  "NEEDS_CLARIFICATION" &&
                  clarificationQuestions.length >
                  0 && (
                    <ClarificationPanel
                      key={
                        result.task.description
                      }
                      questions={
                        clarificationQuestions
                      }
                      isSubmitting={
                        isSubmitting
                      }
                      onContinue={(details) => {
                        void handleClarification(
                          details,
                        );
                      }}
                    />
                  )}

                {result.status ===
                  "WAITING_APPROVAL" &&
                  result.approvalPreview && (
                    <ApprovalPanel
                      key={
                        result.approvalPreview.id
                      }
                      preview={
                        result.approvalPreview
                      }
                      approvalRecord={
                        approvalRecord
                      }
                      error={approvalError}
                      isSubmitting={
                        isApprovalSubmitting
                      }
                      onApprove={(note) => {
                        void submitDecision({
                          preview:
                            result.approvalPreview!,
                          decision:
                            "APPROVED",
                          note,
                        });
                      }}
                      onReject={(note) => {
                        void submitDecision({
                          preview:
                            result.approvalPreview!,
                          decision:
                            "REJECTED",
                          note,
                        });
                      }}
                    />
                  )}

                {result.status ===
                  "COMPLETED" &&
                  result.execution && (
                    <div className="execution-panel">
                      <div className="subpanel-heading">
                        <CheckIcon />

                        <div>
                          <strong>
                            {
                              result.execution
                                .title
                            }
                          </strong>

                          <span>
                            {
                              result.execution
                                .summary
                            }
                          </span>
                        </div>
                      </div>

                      <div className="output-block">
                        {
                          result.execution
                            .output
                        }
                      </div>

                      <div className="verification-list">
                        {result.execution.verificationChecklist.map(
                          (item) => (
                            <span key={item}>
                              <CheckIcon />
                              {item}
                            </span>
                          ),
                        )}
                      </div>
                    </div>
                  )}

                {result.status ===
                  "FOCUS_READY" && (
                    <div className="focus-preview">
                      <p className="decision-reason">
                        Opening your Focus
                        Workspace...
                      </p>
                    </div>
                  )}
              </section>
            )}
          </section>

          <aside className="momentum-card panel">
            <div className="momentum-heading">
              <div>
                <span className="bars">
                  <i />
                  <i />
                  <i />
                </span>

                <h2>Momentum</h2>
              </div>

              <span className="level-pill">
                Level {progress.level}
              </span>
            </div>

            <div className="companion-scene">
              <div className="speech-bubble">
                One step at a time.
                <br />
                <strong>
                  You&apos;ve got this.
                </strong>
              </div>

              <div
                className="momentum-selected-companion"
                style={{
                  filter: `drop-shadow(0 0 24px ${companion.glow})`,
                }}
              >
                <Image
                  priority
                  alt={`${companion.name}, ${companion.personality} companion`}
                  height={180}
                  src={companion.image}
                  width={180}
                />
              </div>
            </div>

            <div className="streak-row">
              <span className="streak-icon">
                ◆
              </span>

              <div>
                <span>Focus streak</span>

                <strong>
                  {profile?.currentStreakDays ??
                    0}{" "}
                  days
                </strong>
              </div>
            </div>

            <div className="xp-label">
              <span>
                {progress.xpIntoLevel} XP
              </span>

              <span>
                {progress.xpForNextLevel} XP
              </span>
            </div>

            <div className="xp-bar">
              <span
                style={{
                  width: `${progress.levelProgressPercent}%`,
                }}
              />
            </div>

            <p className="xp-note">
              <SparklesIcon />
              {progress.petStage} companion ·{" "}
              {profile?.completedSessions ?? 0}{" "}
              completed sessions
            </p>
          </aside>
        </div>

        <DashboardOverview />

        <section
          className="workstream-section"
          id="workstream"
        >
          <div className="section-heading">
            <div>
              <p className="eyebrow">
                ROUTING MODES
              </p>

              <h2>
                Every task, in the right mode.
              </h2>
            </div>

            <span className="section-count">
              3 available paths
            </span>
          </div>

          <div className="workstream-grid">
            {ROUTING_MODES.map((item) => (
              <article
                className={`work-card ${item.mode.toLowerCase()}`}
                key={item.mode}
              >
                <div className="work-card-header">
                  <span
                    className={`mode-badge ${item.mode.toLowerCase()}`}
                  >
                    {modeIcon(item.mode)}
                    {item.mode}
                  </span>
                </div>

                <h3>{item.title}</h3>

                <p>{item.detail}</p>

                <div className="work-card-footer">
                  <span>
                    <i />
                    {item.status}
                  </span>

                  <button
                    type="button"
                    onClick={() => {
                      const example =
                        EXAMPLE_TASKS.find(
                          (candidate) =>
                            candidate.mode ===
                            item.mode,
                        );

                      if (example) {
                        selectExample(example);
                      }
                    }}
                  >
                    Try example
                    <ArrowIcon />
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>

        <ResearchEntryCard />

        <section
          className="workstream-section"
          id="approval-history"
        >
          <ApprovalHistory
            records={history}
            isLoaded={isHistoryLoaded}
            onClear={clearHistory}
          />
        </section>
      </section>
    </main>
  );
}