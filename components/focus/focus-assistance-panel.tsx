"use client";

import type { FocusAssistance } from "@/types/focus-assistance";

interface FocusAssistancePanelProps {
  assistance?: FocusAssistance;
  buttonLabel: string;
  disabled: boolean;
  isLoading: boolean;
  userContext: string;
  onUserContextChange: (value: string) => void;
  onRequest: () => void;
  onClear: () => void;
}

interface ListSectionProps {
  title: string;
  items: string[];
}

function ListSection({
  title,
  items,
}: ListSectionProps) {
  if (items.length === 0) {
    return null;
  }

  return (
    <div>
      <h4 className="font-semibold text-slate-200">
        {title}
      </h4>

      <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-300">
        {items.map((item, index) => (
          <li key={`${title}-${index}`}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

export function FocusAssistancePanel({
  assistance,
  buttonLabel,
  disabled,
  isLoading,
  userContext,
  onUserContextChange,
  onRequest,
  onClear,
}: FocusAssistancePanelProps) {
  const content = assistance?.content;

  return (
    <div className="mt-4 border-t border-slate-700 pt-4">
      <label className="block">
        <span className="text-sm font-medium text-slate-300">
          Context for Cortex
        </span>

        <textarea
          className="mt-2 min-h-20 w-full rounded-lg border border-slate-700 bg-slate-950 p-3 text-sm text-white outline-none focus:border-cyan-400 disabled:opacity-50"
          value={userContext}
          disabled={disabled || isLoading}
          placeholder="Add decisions, constraints, ideas, or draft material for this step..."
          onChange={(event) =>
            onUserContextChange(event.target.value)
          }
        />
      </label>

      <div className="mt-3 flex flex-wrap gap-3">
        <button
          className="rounded-lg bg-cyan-400 px-4 py-2 text-sm font-semibold text-slate-950 disabled:opacity-50"
          type="button"
          disabled={disabled || isLoading}
          onClick={onRequest}
        >
          {isLoading ? "Cortex is working..." : buttonLabel}
        </button>

        {assistance && (
          <button
            className="rounded-lg border border-slate-600 px-4 py-2 text-sm text-white disabled:opacity-50"
            type="button"
            disabled={isLoading}
            onClick={onClear}
          >
            Clear response
          </button>
        )}
      </div>

      {content && (
        <section className="mt-4 space-y-4 rounded-xl border border-cyan-900 bg-slate-950 p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="font-bold text-cyan-300">
              Cortex Assistance
            </h3>

            <span className="rounded-full bg-cyan-950 px-2 py-1 text-xs text-cyan-300">
              {content.kind}
            </span>
          </div>

          <p className="text-sm text-slate-300">
            {content.summary}
          </p>

          {content.suggestedOutput && (
            <div>
              <h4 className="font-semibold text-slate-200">
                Suggested output
              </h4>

              <div className="mt-2 whitespace-pre-wrap rounded-lg bg-slate-900 p-4 text-sm text-slate-200">
                {content.suggestedOutput}
              </div>
            </div>
          )}

          <ListSection
            title="Questions"
            items={content.guidanceQuestions}
          />

          <ListSection
            title="Assumptions"
            items={content.assumptions}
          />

          <ListSection
            title="Next actions"
            items={content.nextActions}
          />

          <ListSection
            title="Verification checklist"
            items={content.verificationChecklist}
          />

          {content.requiresUserReview && (
            <p className="text-xs text-amber-300">
              Review this result before marking the step
              complete.
            </p>
          )}
        </section>
      )}
    </div>
  );
}