import type {
  ResearchEvidenceStrength,
  ResearchReport,
} from "@/types/research";

interface ResearchReportPanelProps {
  report: ResearchReport;
  focusError: string | null;
  isStartingFocus: boolean;
  onStartFocus: () => void;
}

const evidenceStyles: Record<
  ResearchEvidenceStrength,
  string
> = {
  STRONG:
    "bg-emerald-950 text-emerald-300",
  MODERATE:
    "bg-amber-950 text-amber-300",
  LIMITED:
    "bg-red-950 text-red-300",
};

export function ResearchReportPanel({
  report,
  focusError,
  isStartingFocus,
  onStartFocus,
}: ResearchReportPanelProps) {
  const publicationDetails = [
    report.paper.publication,
    report.paper.publicationYear,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <section className="rounded-2xl border border-violet-700 bg-slate-900 p-6 text-white md:p-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-violet-300">
            Research Report
          </p>

          <h2 className="mt-3 text-3xl font-bold">
            {report.paper.title}
          </h2>

          <p className="mt-2 text-slate-400">
            {report.filename}
          </p>
        </div>

        <span className="rounded-full bg-emerald-950 px-3 py-1 text-sm font-semibold text-emerald-300">
          Analysis Complete
        </span>
      </div>

      <div className="mt-6 rounded-xl bg-slate-950 p-5">
        <p className="text-sm font-semibold text-slate-400">
          Paper information
        </p>

        <dl className="mt-3 space-y-3 text-sm">
          <div>
            <dt className="text-slate-500">
              Authors
            </dt>
            <dd className="mt-1 text-slate-200">
              {report.paper.authors.length > 0
                ? report.paper.authors.join(", ")
                : "Not identified"}
            </dd>
          </div>

          <div>
            <dt className="text-slate-500">
              Publication
            </dt>
            <dd className="mt-1 text-slate-200">
              {publicationDetails ||
                "Not identified"}
            </dd>
          </div>

          <div>
            <dt className="text-slate-500">
              DOI
            </dt>
            <dd className="mt-1 text-slate-200">
              {report.paper.doi ??
                "Not identified"}
            </dd>
          </div>
        </dl>
      </div>

      <div className="mt-6">
        <h3 className="text-xl font-bold">
          Research Question
        </h3>

        <p className="mt-3 leading-7 text-slate-300">
          {report.researchQuestion}
        </p>
      </div>

      <div className="mt-6">
        <h3 className="text-xl font-bold">
          Plain-Language Summary
        </h3>

        <p className="mt-3 leading-7 text-slate-300">
          {report.plainLanguageSummary}
        </p>
      </div>

      <div className="mt-6">
        <h3 className="text-xl font-bold">
          Key Findings
        </h3>

        <ol className="mt-3 space-y-3">
          {report.keyFindings.map(
            (finding, index) => (
              <li
                className="flex gap-3 rounded-lg bg-slate-950 p-4 text-slate-300"
                key={`${finding}-${index}`}
              >
                <span className="font-bold text-violet-300">
                  {index + 1}.
                </span>

                <span>{finding}</span>
              </li>
            ),
          )}
        </ol>
      </div>

      <div className="mt-6">
        <h3 className="text-xl font-bold">
          Methodology
        </h3>

        <dl className="mt-3 grid gap-4 md:grid-cols-2">
          <div className="rounded-lg bg-slate-950 p-4">
            <dt className="text-sm text-slate-500">
              Study design
            </dt>
            <dd className="mt-2 text-slate-200">
              {report.methodology.studyDesign}
            </dd>
          </div>

          <div className="rounded-lg bg-slate-950 p-4">
            <dt className="text-sm text-slate-500">
              Sample or data
            </dt>
            <dd className="mt-2 text-slate-200">
              {report.methodology.sampleOrData}
            </dd>
          </div>

          <div className="rounded-lg bg-slate-950 p-4">
            <dt className="text-sm text-slate-500">
              Procedure
            </dt>
            <dd className="mt-2 text-slate-200">
              {report.methodology.procedure}
            </dd>
          </div>

          <div className="rounded-lg bg-slate-950 p-4">
            <dt className="text-sm text-slate-500">
              Analysis method
            </dt>
            <dd className="mt-2 text-slate-200">
              {report.methodology.analysisMethod}
            </dd>
          </div>
        </dl>
      </div>

      <div className="mt-6">
        <h3 className="text-xl font-bold">
          Evidence Map
        </h3>

        <div className="mt-3 space-y-4">
          {report.evidenceMap.map(
            (item, index) => (
              <article
                className="rounded-xl border border-slate-700 bg-slate-950 p-5"
                key={`${item.claim}-${index}`}
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h4 className="font-bold text-slate-100">
                    {item.claim}
                  </h4>

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${evidenceStyles[item.strength]}`}
                  >
                    {item.strength}
                  </span>
                </div>

                <p className="mt-3 text-slate-300">
                  {item.evidence}
                </p>

                {item.pageReferences.length >
                  0 && (
                    <p className="mt-3 text-sm text-slate-500">
                      Pages:{" "}
                      {item.pageReferences.join(
                        ", ",
                      )}
                    </p>
                  )}
              </article>
            ),
          )}
        </div>
      </div>

      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <div>
          <h3 className="text-xl font-bold">
            Limitations
          </h3>

          <ul className="mt-3 list-disc space-y-2 pl-5 text-slate-300">
            {report.limitations.map(
              (limitation, index) => (
                <li
                  key={`${limitation}-${index}`}
                >
                  {limitation}
                </li>
              ),
            )}
          </ul>
        </div>

        <div>
          <h3 className="text-xl font-bold">
            Important Terms
          </h3>

          <dl className="mt-3 space-y-3">
            {report.importantTerms.map(
              (item, index) => (
                <div
                  className="rounded-lg bg-slate-950 p-4"
                  key={`${item.term}-${index}`}
                >
                  <dt className="font-semibold text-violet-300">
                    {item.term}
                  </dt>

                  <dd className="mt-1 text-sm text-slate-300">
                    {item.definition}
                  </dd>
                </div>
              ),
            )}
          </dl>
        </div>
      </div>

      <div className="mt-6">
        <h3 className="text-xl font-bold">
          Further Questions
        </h3>

        <ul className="mt-3 list-disc space-y-2 pl-5 text-slate-300">
          {report.furtherQuestions.map(
            (question, index) => (
              <li
                key={`${question}-${index}`}
              >
                {question}
              </li>
            ),
          )}
        </ul>
      </div>

      <div className="mt-6 rounded-xl border border-cyan-800 bg-cyan-950 p-5">
        <p className="text-sm font-semibold uppercase tracking-wider text-cyan-300">
          Suggested Focus Task
        </p>

        <p className="mt-3 leading-7 text-cyan-100">
          {report.suggestedFocusTask}
        </p>

        {focusError && (
          <p className="mt-4 rounded-lg border border-red-800 bg-red-950 p-3 text-sm text-red-300">
            {focusError}
          </p>
        )}

        <button
          className="mt-5 rounded-lg bg-cyan-400 px-5 py-3 font-semibold text-slate-950 disabled:cursor-not-allowed disabled:opacity-50"
          disabled={isStartingFocus}
          type="button"
          onClick={onStartFocus}
        >
          {isStartingFocus
            ? "Creating Focus Session..."
            : "Turn into Focus Session"}
        </button>
      </div>
    </section>
  );
}