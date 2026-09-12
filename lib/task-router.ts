import type { RouteDecision } from "@/types/task";

const HIGH_RISK_KEYWORDS = [
  "send",
  "delete",
  "publish",
  "submit",
  "purchase",
  "buy",
  "pay",
  "transfer",
  "book",
  "post publicly",
];

const COMPLEX_TASK_KEYWORDS = [
  "strategy",
  "business plan",
  "launch plan",
  "presentation",
  "research",
  "design",
  "investigate",
  "make a decision",
  "solve",
];

function containsAnyKeyword(text: string, keywords: string[]): boolean {
  return keywords.some((keyword) => text.includes(keyword));
}

export function routeTask(description: string): RouteDecision {
  const normalizedTask = description.trim().toLowerCase();

  if (normalizedTask.length < 12) {
    return {
      mode: "FOCUS",
      confidence: 0.55,
      complexity: 2,
      riskLevel: "LOW",
      verifiable: false,
      reason: "The task does not contain enough information to execute reliably.",
      missingInformation: [
        "A clearer description of the expected result is required.",
      ],
      suggestedDurationMinutes: 25,
    };
  }

  if (containsAnyKeyword(normalizedTask, HIGH_RISK_KEYWORDS)) {
    return {
      mode: "APPROVAL",
      confidence: 0.94,
      complexity: 2,
      riskLevel: "HIGH",
      verifiable: true,
      reason:
        "Cortex can prepare this task, but the final action requires user approval.",
      missingInformation: [],
      suggestedDurationMinutes: null,
    };
  }

  if (
    containsAnyKeyword(normalizedTask, COMPLEX_TASK_KEYWORDS) ||
    normalizedTask.length > 180
  ) {
    return {
      mode: "FOCUS",
      confidence: 0.87,
      complexity: 4,
      riskLevel: "MEDIUM",
      verifiable: false,
      reason:
        "This task requires substantial judgment, planning, or creative input.",
      missingInformation: [],
      suggestedDurationMinutes: 45,
    };
  }

  return {
    mode: "AUTO",
    confidence: 0.92,
    complexity: 1,
    riskLevel: "LOW",
    verifiable: true,
    reason:
      "This task is sufficiently clear, low-risk, and suitable for automatic execution.",
    missingInformation: [],
    suggestedDurationMinutes: null,
  };
}