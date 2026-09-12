"use client";

import type { ApprovalRecord } from "@/types/approval";

interface ApprovalHistoryProps {
  records: ApprovalRecord[];
  isLoaded: boolean;
  onClear: () => void;
}

export function ApprovalHistory({
  records,
  isLoaded,
  onClear,
}: ApprovalHistoryProps) {
  return (
    <section className="rounded-2xl border border-slate-700 bg-slate-900 p-6 md:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-violet-300">
            Safety audit
          </p>

          <h2 className="mt-2 text-2xl font-bold">
            Approval History
          </h2>
        </div>

        {records.length > 0 && (
          <button
            className="rounded-lg border border-slate-600 px-3 py-2 text-sm text-slate-300 hover:border-red-500 hover:text-red-300"
            type="button"
            onClick={onClear}
          >
            Clear history
          </button>
        )}
      </div>

      {!isLoaded && (
        <p className="mt-5 text-slate-400">
          Loading approval history...
        </p>
      )}

      {isLoaded && records.length === 0 && (
        <p className="mt-5 text-slate-400">
          No approval decisions have been recorded yet.
        </p>
      )}

      {isLoaded && records.length > 0 && (
        <div className="mt-6 space-y-4">
          {records.map((record) => (
            <article
              className="rounded-xl border border-slate-700 bg-slate-950 p-4"
              key={record.id}
            >
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`rounded-full px-2 py-1 text-xs font-bold ${
                    record.decision === "APPROVED"
                      ? "bg-emerald-950 text-emerald-300"
                      : "bg-red-950 text-red-300"
                  }`}
                >
                  {record.decision}
                </span>

                <span className="rounded-full bg-slate-800 px-2 py-1 text-xs text-slate-300">
                  {record.executionStatus}
                </span>

                <span className="text-xs text-slate-500">
                  {new Date(
                    record.decidedAt,
                  ).toLocaleString()}
                </span>
              </div>

              <p className="mt-3 font-semibold text-white">
                {record.taskDescription}
              </p>

              <p className="mt-2 text-sm text-slate-300">
                {record.resultMessage}
              </p>

              {record.note && (
                <p className="mt-2 text-sm text-slate-500">
                  Note: {record.note}
                </p>
              )}
            </article>
          ))}
        </div>
      )}
    </section>
  );
}