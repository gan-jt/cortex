"use client";

import {
  useState,
  type FormEvent,
} from "react";

interface PaperResearchFormProps {
  error: string | null;
  isAnalyzing: boolean;
  onAnalyze: (
    file: File,
    question: string,
  ) => Promise<unknown>;
}

const DEFAULT_QUESTION =
  "What is the paper's main research question, methodology, key evidence, and most important limitation?";

export function PaperResearchForm({
  error,
  isAnalyzing,
  onAnalyze,
}: PaperResearchFormProps) {
  const [file, setFile] =
    useState<File | null>(null);

  const [question, setQuestion] =
    useState(DEFAULT_QUESTION);

  const [formError, setFormError] =
    useState<string | null>(null);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();
    setFormError(null);

    if (!file) {
      setFormError("Select a PDF file.");
      return;
    }

    if (!question.trim()) {
      setFormError("Enter a research question.");
      return;
    }

    try {
      await onAnalyze(file, question);
    } catch {
      return;
    }
  }

  const displayedError = formError ?? error;

  return (
    <section className="rounded-2xl border border-violet-700 bg-slate-900 p-6 md:p-8">
      <p className="text-sm font-semibold uppercase tracking-wider text-violet-300">
        Cortex Research
      </p>

      <h2 className="mt-3 text-3xl font-bold text-white">
        Analyze a Research Paper
      </h2>

      <p className="mt-3 text-slate-300">
        Upload a PDF and ask Cortex to identify its
        research question, methodology, evidence, and
        limitations.
      </p>

      <form
        className="mt-6 space-y-5"
        onSubmit={handleSubmit}
      >
        <div>
          <label
            className="block text-sm font-semibold text-slate-200"
            htmlFor="research-paper"
          >
            Research paper
          </label>

          <input
            accept=".pdf,application/pdf"
            className="mt-2 block w-full rounded-lg border border-slate-600 bg-slate-950 p-3 text-sm text-slate-200 file:mr-4 file:rounded-md file:border-0 file:bg-violet-400 file:px-4 file:py-2 file:font-semibold file:text-slate-950"
            disabled={isAnalyzing}
            id="research-paper"
            type="file"
            onChange={(event) => {
              setFile(
                event.target.files?.[0] ?? null,
              );
              setFormError(null);
            }}
          />

          <p className="mt-2 text-xs text-slate-500">
            PDF only · Maximum file size: 15 MB
          </p>
        </div>

        <div>
          <label
            className="block text-sm font-semibold text-slate-200"
            htmlFor="research-question"
          >
            Research question
          </label>

          <textarea
            className="mt-2 min-h-32 w-full rounded-lg border border-slate-600 bg-slate-950 p-4 text-white outline-none focus:border-violet-400"
            disabled={isAnalyzing}
            id="research-question"
            maxLength={2000}
            value={question}
            onChange={(event) => {
              setQuestion(event.target.value);
              setFormError(null);
            }}
          />

          <p className="mt-2 text-right text-xs text-slate-500">
            {question.length}/2000
          </p>
        </div>

        {displayedError && (
          <p className="rounded-lg border border-red-800 bg-red-950 p-3 text-sm text-red-300">
            {displayedError}
          </p>
        )}

        <button
          className="rounded-lg bg-violet-400 px-5 py-3 font-semibold text-slate-950 disabled:cursor-not-allowed disabled:opacity-50"
          disabled={isAnalyzing}
          type="submit"
        >
          {isAnalyzing
            ? "Analyzing Paper..."
            : "Analyze Paper"}
        </button>
      </form>
    </section>
  );
}