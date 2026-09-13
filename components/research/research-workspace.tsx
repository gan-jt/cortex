"use client";

import { PaperResearchForm } from "@/components/research/paper-research-form";
import { ResearchReportPanel } from "@/components/research/research-report-panel";
import { usePaperResearch } from "@/hooks/use-paper-research";

export function ResearchWorkspace() {
  const {
    report,
    error,
    focusError,
    isAnalyzing,
    isCreatingFocus,
    analyzePaper,
    startFocusFromReport,
  } = usePaperResearch();

  function handleStartFocus() {
    if (!report) {
      return;
    }

    void startFocusFromReport(report).catch(() => {
      // The hook exposes focusError for display.
    });
  }

  return (
    <div className="research-workspace">
      <PaperResearchForm
        error={error}
        isAnalyzing={isAnalyzing}
        onAnalyze={analyzePaper}
      />

      {report && (
        <ResearchReportPanel
          report={report}
          focusError={focusError}
          isStartingFocus={isCreatingFocus}
          onStartFocus={handleStartFocus}
        />
      )}
    </div>
  );
}