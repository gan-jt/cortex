import Link from "next/link";

import {
  ArrowIcon,
  FileIcon,
  SparklesIcon,
} from "@/components/icons";

export function ResearchEntryCard() {
  return (
    <section
      className="research-entry-card panel"
      id="paper-research"
    >
      <div className="research-entry-glow" />

      <div className="research-entry-copy">
        <p className="eyebrow research-eyebrow">
          Cortex Research
        </p>

        <h2>
          Turn a research paper into actionable
          understanding.
        </h2>

        <p>
          Analyze methodology, evidence, findings, and
          limitations—then turn the result into a guided
          Focus Session.
        </p>

        <div className="research-entry-features">
          <span>PDF analysis</span>
          <span>Evidence mapping</span>
          <span>Focus handoff</span>
        </div>

        <Link
          className="research-entry-button"
          href="/research"
        >
          <SparklesIcon />
          Open Research Workspace
          <ArrowIcon />
        </Link>
      </div>

      <div
        aria-hidden="true"
        className="research-entry-visual"
      >
        <span className="research-visual-orbit" />

        <div className="research-document">
          <span>
            <FileIcon />
          </span>

          <i />
          <i />
          <i />

          <strong>Evidence</strong>
        </div>

        <span className="research-visual-spark research-spark-one">
          ✦
        </span>

        <span className="research-visual-spark research-spark-two">
          ✦
        </span>
      </div>
    </section>
  );
}