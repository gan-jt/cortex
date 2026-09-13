"use client";

import {
  CheckIcon,
  FileIcon,
  FocusIcon,
  SparklesIcon,
} from "@/components/icons";

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

const evidenceClasses: Record<
  ResearchEvidenceStrength,
  string
> = {
  STRONG: "evidence-strong",
  MODERATE: "evidence-moderate",
  LIMITED: "evidence-limited",
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
    <section className="research-report-card panel">
      <div className="research-report-glow" />

      <header className="research-report-header">
        <div>
          <p className="eyebrow research-eyebrow">
            Research Report
          </p>

          <h2>{report.paper.title}</h2>

          <p>{report.filename}</p>
        </div>

        <span className="research-complete-badge">
          <CheckIcon />
          Analysis complete
        </span>
      </header>

      <div className="research-report-layout">
        <aside className="research-report-sidebar">
          <div className="research-paper-icon">
            <FileIcon />
          </div>

          <h3>Paper details</h3>

          <dl>
            <div>
              <dt>Authors</dt>
              <dd>
                {report.paper.authors.length > 0
                  ? report.paper.authors.join(", ")
                  : "Not identified"}
              </dd>
            </div>

            <div>
              <dt>Publication</dt>
              <dd>
                {publicationDetails ||
                  "Not identified"}
              </dd>
            </div>

            <div>
              <dt>DOI</dt>
              <dd>
                {report.paper.doi ??
                  "Not identified"}
              </dd>
            </div>
          </dl>

          <div className="research-sidebar-note">
            <SparklesIcon />

            <p>
              Cortex separates extracted evidence from
              interpretation and includes relevant page
              references.
            </p>
          </div>
        </aside>

        <div className="research-report-content">
          <section className="research-question-card">
            <span>Research question</span>
            <p>{report.researchQuestion}</p>
          </section>

          <section className="research-report-section">
            <div className="research-section-heading">
              <span>01</span>
              <h3>Plain-Language Summary</h3>
            </div>

            <p className="research-summary">
              {report.plainLanguageSummary}
            </p>
          </section>

          <section className="research-report-section">
            <div className="research-section-heading">
              <span>02</span>
              <h3>Key Findings</h3>
            </div>

            <ol className="research-findings">
              {report.keyFindings.map(
                (finding, index) => (
                  <li key={`${finding}-${index}`}>
                    <span>{index + 1}</span>
                    <p>{finding}</p>
                  </li>
                ),
              )}
            </ol>
          </section>

          <section className="research-report-section">
            <div className="research-section-heading">
              <span>03</span>
              <h3>Methodology</h3>
            </div>

            <dl className="research-methodology-grid">
              <div>
                <dt>Study design</dt>
                <dd>
                  {report.methodology.studyDesign}
                </dd>
              </div>

              <div>
                <dt>Sample or data</dt>
                <dd>
                  {report.methodology.sampleOrData}
                </dd>
              </div>

              <div>
                <dt>Procedure</dt>
                <dd>
                  {report.methodology.procedure}
                </dd>
              </div>

              <div>
                <dt>Analysis method</dt>
                <dd>
                  {report.methodology.analysisMethod}
                </dd>
              </div>
            </dl>
          </section>

          <section className="research-report-section">
            <div className="research-section-heading">
              <span>04</span>
              <h3>Evidence Map</h3>
            </div>

            <div className="research-evidence-list">
              {report.evidenceMap.map(
                (item, index) => (
                  <article
                    className="research-evidence-card"
                    key={`${item.claim}-${index}`}
                  >
                    <div className="research-evidence-heading">
                      <h4>{item.claim}</h4>

                      <span
                        className={`research-evidence-badge ${
                          evidenceClasses[item.strength]
                        }`}
                      >
                        {item.strength}
                      </span>
                    </div>

                    <p>{item.evidence}</p>

                    {item.pageReferences.length > 0 && (
                      <div className="research-page-references">
                        <FileIcon />
                        Pages{" "}
                        {item.pageReferences.join(", ")}
                      </div>
                    )}
                  </article>
                ),
              )}
            </div>
          </section>

          <section className="research-report-section">
            <div className="research-section-heading">
              <span>05</span>
              <h3>Limitations</h3>
            </div>

            <ul className="research-limitations">
              {report.limitations.map(
                (limitation, index) => (
                  <li key={`${limitation}-${index}`}>
                    <span>!</span>
                    <p>{limitation}</p>
                  </li>
                ),
              )}
            </ul>
          </section>

          <section className="research-focus-handoff">
            <div className="research-focus-icon">
              <FocusIcon />
            </div>

            <div>
              <p className="eyebrow">
                Continue with Cortex
              </p>

              <h3>
                Turn this research into focused work.
              </h3>

              <p>
                Cortex will generate a guided session
                using this report as verified context.
              </p>
            </div>

            <button
              disabled={isStartingFocus}
              type="button"
              onClick={onStartFocus}
            >
              {isStartingFocus ? (
                <>
                  <span className="spinner" />
                  Creating session...
                </>
              ) : (
                <>
                  <SparklesIcon />
                  Start Focus Session
                </>
              )}
            </button>
          </section>

          {focusError && (
            <p
              aria-live="polite"
              className="research-error"
            >
              {focusError}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}