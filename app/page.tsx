"use client";

import {
  type FormEvent,
  useState,
} from "react";
import { ApprovalPanel } from "@/components/approval/approval-panel";
import { useApprovalDecision } from "@/hooks/use-approval-decision";
import { useTaskSubmission } from "@/hooks/use-task-submission";
import { ApprovalHistory } from "@/components/approval/approval-history";

const EXAMPLE_TASKS = [
  {
    label: "AUTO example",
    description:
      "Summarize this note in one sentence: Cortex automatically handles simple tasks, requests approval for risky actions, and turns complex work into focused sessions.",
  },
  {
    label: "APPROVAL example",
    description:
      "Send the project update email to the team.",
  },
  {
    label: "FOCUS example",
    description:
      "Create a 45-minute launch strategy session for Cortex, a productivity app for college students. The goal is to recruit 50 beta users in two weeks using campus clubs and Instagram with a $200 budget. I need channel priorities, key messages, and success metrics.",
  },
];

export default function Home() {
  const [description, setDescription] =
    useState<string>("");

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
      // The hook exposes the error for display below.
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-12 text-white">
      <div className="mx-auto max-w-5xl">
        <header>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-400">
            Cortex
          </p>

          <h1 className="mt-4 max-w-3xl text-4xl font-bold md:text-6xl">
            Turn any task into the right kind of work.
          </h1>

          <p className="mt-5 max-w-2xl text-lg text-slate-300">
            Cortex decides whether to execute automatically,
            request approval, or create a guided Focus
            Session.
          </p>
        </header>

        <section className="mt-10 rounded-2xl border border-slate-700 bg-slate-900 p-6 md:p-8">
          <form onSubmit={handleSubmit}>
            <label
              className="text-lg font-semibold"
              htmlFor="task-description"
            >
              What do you need to get done?
            </label>

            <textarea
              id="task-description"
              className="mt-4 min-h-48 w-full rounded-xl border border-slate-700 bg-slate-950 p-5 text-lg text-white outline-none placeholder:text-slate-600 focus:border-cyan-400"
              value={description}
              placeholder="Describe the task, desired result, context, and constraints..."
              onChange={(event) => {
                setDescription(event.target.value);
                clearResult();
                clearDecision();
              }}
            />

            <div className="mt-4 flex flex-wrap gap-3">
              {EXAMPLE_TASKS.map((example) => (
                <button
                  className="rounded-full border border-slate-700 px-3 py-2 text-sm text-slate-300 hover:border-cyan-400 hover:text-cyan-300"
                  key={example.label}
                  type="button"
                  onClick={() => {
                    setDescription(example.description);
                    clearResult();
                    clearDecision();
                  }}
                >
                  {example.label}
                </button>
              ))}
            </div>

            <button
              className="mt-6 rounded-lg bg-cyan-400 px-6 py-3 font-bold text-slate-950 disabled:cursor-not-allowed disabled:opacity-50"
              type="submit"
              disabled={
                isSubmitting || !description.trim()
              }
            >
              {isSubmitting
                ? "Cortex is routing..."
                : "Route Task"}
            </button>
          </form>
        </section>

        {error && (
          <section className="mt-6 rounded-xl border border-red-800 bg-red-950 p-5 text-red-200">
            {error}
          </section>
        )}

        {result && (
          <div className="mt-6 space-y-6">
            <section className="rounded-2xl border border-slate-700 bg-slate-900 p-6">
              <div className="flex flex-wrap items-center gap-3">
                <span className="rounded-full bg-cyan-950 px-3 py-1 text-sm font-bold text-cyan-300">
                  {result.decision.mode}
                </span>

                <span className="rounded-full bg-slate-800 px-3 py-1 text-sm text-slate-300">
                  {result.status}
                </span>

                <span className="text-sm text-slate-400">
                  {Math.round(
                    result.decision.confidence * 100,
                  )}
                  % confidence
                </span>
              </div>

              <h2 className="mt-5 text-2xl font-bold">
                Routing Decision
              </h2>

              <p className="mt-3 text-slate-300">
                {result.decision.reason}
              </p>

              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                <div className="rounded-lg bg-slate-950 p-4">
                  <p className="text-sm text-slate-500">
                    Complexity
                  </p>
                  <p className="mt-1 text-xl font-bold">
                    {result.decision.complexity}/5
                  </p>
                </div>

                <div className="rounded-lg bg-slate-950 p-4">
                  <p className="text-sm text-slate-500">
                    Risk
                  </p>
                  <p className="mt-1 text-xl font-bold">
                    {result.decision.riskLevel}
                  </p>
                </div>

                <div className="rounded-lg bg-slate-950 p-4">
                  <p className="text-sm text-slate-500">
                    Routing source
                  </p>
                  <p className="mt-1 text-xl font-bold">
                    {result.routingSource}
                  </p>
                </div>
              </div>
            </section>

            {result.status === "WAITING_APPROVAL" &&
              result.approvalPreview && (
                <ApprovalPanel
                  key={result.approvalPreview.id}
                  preview={result.approvalPreview}
                  approvalRecord={approvalRecord}
                  error={approvalError}
                  isSubmitting={isApprovalSubmitting}
                  onApprove={(note) => {
                    void submitDecision({
                      preview: result.approvalPreview!,
                      decision: "APPROVED",
                      note,
                    });
                  }}
                  onReject={(note) => {
                    void submitDecision({
                      preview: result.approvalPreview!,
                      decision: "REJECTED",
                      note,
                    });
                  }}
                />
              )}

            {result.status === "COMPLETED" &&
              result.execution && (
                <section className="rounded-2xl border border-emerald-800 bg-emerald-950 p-6">
                  <p className="text-sm font-semibold uppercase tracking-wider text-emerald-300">
                    Automatically completed
                  </p>

                  <h2 className="mt-3 text-2xl font-bold">
                    {result.execution.title}
                  </h2>

                  <p className="mt-3 text-emerald-100">
                    {result.execution.summary}
                  </p>

                  <div className="mt-5 whitespace-pre-wrap rounded-xl bg-slate-950 p-5 text-slate-200">
                    {result.execution.output}
                  </div>

                  {result.execution
                    .verificationChecklist.length > 0 && (
                      <div className="mt-5">
                        <h3 className="font-bold">
                          Verification
                        </h3>

                        <ul className="mt-2 list-disc space-y-1 pl-5 text-emerald-100">
                          {result.execution.verificationChecklist.map(
                            (item) => (
                              <li key={item}>{item}</li>
                            ),
                          )}
                        </ul>
                      </div>
                    )}
                </section>
              )}

            {result.status ===
              "WAITING_APPROVAL" && (
                <section className="rounded-2xl border border-amber-700 bg-amber-950 p-6">
                  <p className="text-sm font-semibold uppercase tracking-wider text-amber-300">
                    Approval required
                  </p>

                  <h2 className="mt-3 text-2xl font-bold">
                    Cortex stopped before the external action.
                  </h2>

                  <p className="mt-3 text-amber-100">
                    Review and approve the action before it is
                    executed.
                  </p>
                </section>
              )}

            {result.status ===
              "NEEDS_CLARIFICATION" && (
                <section className="rounded-2xl border border-violet-700 bg-violet-950 p-6">
                  <p className="text-sm font-semibold uppercase tracking-wider text-violet-300">
                    More information needed
                  </p>

                  <h2 className="mt-3 text-2xl font-bold">
                    Clarify these points
                  </h2>

                  <ul className="mt-4 list-disc space-y-2 pl-5 text-violet-100">
                    {clarificationQuestions.map(
                      (question) => (
                        <li key={question}>{question}</li>
                      ),
                    )}
                  </ul>
                </section>
              )}
          </div>
        )}

        <div className="mt-10">
          <ApprovalHistory
            records={history}
            isLoaded={isHistoryLoaded}
            onClear={clearHistory}
          />
        </div>
      </div>
    </main>
  );
}