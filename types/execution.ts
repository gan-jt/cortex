export type OutputFormat = "MARKDOWN" | "PLAIN_TEXT";

export interface ExecutionResult {
  title: string;
  summary: string;
  output: string;
  outputFormat: OutputFormat;
  verificationChecklist: string[];
}