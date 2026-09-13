"use client";

import { useState } from "react";

import type {
  ApprovalPreview,
  ApprovalRecord,
} from "@/types/approval";

interface ApprovalPanelProps {
  preview: ApprovalPreview;
  approvalRecord: ApprovalRecord | null;
  error: string | null;
  isSubmitting: boolean;
  onApprove: (note: string) => void;
  onReject: (note: string) => void;
}

export function ApprovalPanel({
  preview,
  approvalRecord,
  error,
  isSubmitting,
  onApprove,
  onReject,
}: ApprovalPanelProps) {
  const [note, setNote] = useState("");

  return (
    <section className="rounded-2xl border border-amber-700 bg-slate-900 p-6 md:p-8">
      <div className="flex flex-wrap items-center gap-3">
        <span className="rounded-full bg-amber-950 px-3 py-1 text-sm font-bold text-amber-300">
          APPROVAL REQUIRED
        </span>

        <span className="rounded-full bg-slate-800 px-3 py-1 text-sm text-slate-300">
          {preview.actionType}
        </span>
      </div>

      <h2 className="mt-5 text-2xl font-bold">
        {preview.title}
      </h2>

      <p className="mt-3 text-slate-300">
        {preview.summary}
      </p>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <div className="rounded-xl bg-slate-950 p-4">
          <p className="text-sm text-slate-500">
            Target
          </p>

          <p className="mt-2 font-semibold text-white">
            {preview.target ?? "Not specified"}
          </p>
        </div>

        <div className="rounded-xl bg-slate-950 p-4">
          <p className="text-sm text-slate-500">
            Approval status
          </p>

          <p
            className={`mt-2 font-semibold ${
              preview.canApprove
                ? "text-emerald-300"
                : "text-amber-300"
            }`}
          >
            {preview.canApprove
              ? "Ready for review"
              : "Missing required information"}
          </p>
        </div>
      </div>

      <div className="mt-6">
        <h3 className="font-bold text-slate-200">
          Proposed action
        </h3>

        <p className="mt-2 text-slate-300">
          {preview.proposedAction}
        </p>
      </div>

      {preview.draftOutput && (
        <div className="mt-6">
          <h3 className="font-bold text-slate-200">
            Draft output
          </h3>

          <div className="mt-2 whitespace-pre-wrap rounded-xl border border-slate-700 bg-slate-950 p-4 text-sm text-slate-200">
            {preview.draftOutput}
          </div>
        </div>
      )}

      <div className="mt-6">
        <h3 className="font-bold text-slate-200">
          External effects
        </h3>

        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-300">
          {preview.externalEffects.map(
            (effect, index) => (
              <li key={`effect-${index}`}>
                {effect}
              </li>
            ),
          )}
        </ul>
      </div>

      {preview.missingInformation.length > 0 && (
        <div className="mt-6 rounded-xl border border-red-900 bg-red-950 p-4">
          <h3 className="font-bold text-red-200">
            Required before approval
          </h3>

          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-red-300">
            {preview.missingInformation.map(
              (item, index) => (
                <li key={`missing-${index}`}>
                  {item}
                </li>
              ),
            )}
          </ul>
        </div>
      )}

      <div className="mt-6">
        <h3 className="font-bold text-slate-200">
          Verification checklist
        </h3>

        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-300">
          {preview.verificationChecklist.map(
            (item, index) => (
              <li key={`check-${index}`}>
                {item}
              </li>
            ),
          )}
        </ul>
      </div>

      {!approvalRecord && (
        <div className="mt-6 border-t border-slate-700 pt-6">
          <label className="block">
            <span className="text-sm font-semibold text-slate-300">
              Decision note
            </span>

            <textarea
              className="mt-2 min-h-24 w-full rounded-lg border border-slate-700 bg-slate-950 p-3 text-sm text-white outline-none focus:border-cyan-400"
              value={note}
              placeholder="Optional reason, correction, or approval note..."
              onChange={(event) =>
                setNote(event.target.value)
              }
            />
          </label>

          {error && (
            <p className="mt-4 rounded-lg bg-red-950 p-3 text-sm text-red-300">
              {error}
            </p>
          )}

          <div className="mt-4 flex flex-wrap gap-3">
            <button
              className="rounded-lg bg-emerald-400 px-5 py-3 font-bold text-slate-950 disabled:cursor-not-allowed disabled:opacity-50"
              type="button"
              disabled={
                isSubmitting || !preview.canApprove
              }
              onClick={() => onApprove(note)}
            >
              {isSubmitting
                ? "Recording..."
                : "Approve"}
            </button>

            <button
              className="rounded-lg border border-red-700 px-5 py-3 font-bold text-red-300 disabled:opacity-50"
              type="button"
              disabled={isSubmitting}
              onClick={() => onReject(note)}
            >
              Reject
            </button>
          </div>
        </div>
      )}

      {approvalRecord && (
        <div
          className={`mt-6 rounded-xl border p-5 ${
            approvalRecord.decision === "APPROVED"
              ? "border-emerald-700 bg-emerald-950"
              : "border-red-800 bg-red-950"
          }`}
        >
          <p className="text-sm font-semibold">
            {approvalRecord.decision}
          </p>

          <p className="mt-2">
            {approvalRecord.resultMessage}
          </p>

          

          {approvalRecord.note && (
            <p className="mt-2 text-sm opacity-75">
              Note: {approvalRecord.note}
            </p>
          )}
        </div>
      )}
    </section>
  );
}