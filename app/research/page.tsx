import { ResearchWorkspace } from "@/components/research/research-workspace";
import { CortexSidebar } from "@/components/layout/cortex-sidebar";

export default function ResearchPage() {
  return (
    <main className="research-page-shell">
      <CortexSidebar />
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />

      <div className="research-page-content">
        <section className="research-page-intro">
          <div>
            <p className="eyebrow research-eyebrow">
              Research Workspace
            </p>

            <h1>
              From a dense paper to a clear next step.
            </h1>

            <p>
              Upload a research paper, inspect the
              evidence behind its claims, and turn the
              result into a guided Focus Session.
            </p>
          </div>

          <div className="research-capabilities">
            <span>PDF analysis</span>
            <span>Page evidence</span>
            <span>Focus handoff</span>
          </div>
        </section>

        <ResearchWorkspace />
      </div>
    </main>
  );
}