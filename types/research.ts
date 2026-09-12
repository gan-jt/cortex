export type ResearchEvidenceStrength =
  | "STRONG"
  | "MODERATE"
  | "LIMITED";

export interface PaperIdentity {
  title: string;
  authors: string[];
  publication: string | null;
  publicationYear: number | null;
  doi: string | null;
}

export interface ResearchMethodology {
  studyDesign: string;
  sampleOrData: string;
  procedure: string;
  analysisMethod: string;
}

export interface ResearchEvidenceItem {
  claim: string;
  evidence: string;
  pageReferences: string[];
  strength: ResearchEvidenceStrength;
}

export interface ResearchTerm {
  term: string;
  definition: string;
}

export interface ResearchReportContent {
  paper: PaperIdentity;
  researchQuestion: string;
  plainLanguageSummary: string;
  keyFindings: string[];
  methodology: ResearchMethodology;
  evidenceMap: ResearchEvidenceItem[];
  limitations: string[];
  importantTerms: ResearchTerm[];
  furtherQuestions: string[];
  suggestedFocusTask: string;
}

export interface ResearchReport
  extends ResearchReportContent {
  id: string;
  filename: string;
  userQuestion: string;
  generatedAt: number;
}

export interface ResearchPaperResponse {
  status: "COMPLETED";
  report: ResearchReport;
}