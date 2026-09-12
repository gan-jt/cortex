"use client";

import { useState } from "react";

interface ClarificationPanelProps {
    questions: string[];
    isSubmitting: boolean;
    onContinue: (details: string) => void;
}

export function ClarificationPanel({
    questions,
    isSubmitting,
    onContinue,
}: ClarificationPanelProps) {
    const [details, setDetails] = useState("");

    return (
        <section className="rounded-2xl border border-violet-700 bg-slate-900 p-6 md:p-8">
            <div className="flex flex-wrap items-center gap-3">
                <span className="rounded-full bg-violet-950 px-3 py-1 text-sm font-bold text-violet-300">
                    CLARIFICATION NEEDED
                </span>
            </div>

            <h2 className="mt-5 text-2xl font-bold">
                Cortex needs a little more context
            </h2>

            <p className="mt-3 text-slate-300">
                Answer the questions below so Cortex can route
                and complete the task correctly.
            </p>

            <ol className="mt-6 space-y-3">
                {questions.map((question, index) => (
                    <li
                        className="flex gap-3 rounded-xl bg-slate-950 p-4 text-slate-200"
                        key={`${question}-${index}`}
                    >
                        <span className="font-bold text-violet-300">
                            {index + 1}.
                        </span>

                        <span>{question}</span>
                    </li>
                ))}
            </ol>

            <label className="mt-6 block">
                <span className="font-semibold text-slate-200">
                    Additional context
                </span>

                <textarea
                    className="mt-2 min-h-36 w-full rounded-xl border border-slate-700 bg-slate-950 p-4 text-white outline-none placeholder:text-slate-600 focus:border-violet-400"
                    value={details}
                    placeholder="Explain the task, desired result, relevant context, constraints, and deadline..."
                    onChange={(event) =>
                        setDetails(event.target.value)
                    }
                />
            </label>

            <button
                className="mt-4 rounded-lg bg-violet-400 px-5 py-3 font-bold text-slate-950 disabled:cursor-not-allowed disabled:opacity-50"
                type="button"
                disabled={isSubmitting || !details.trim()}
                onClick={() => onContinue(details.trim())}
            >
                {isSubmitting
                    ? "Cortex is reconsidering..."
                    : "Continue with details"}
            </button>
        </section>
    );
}