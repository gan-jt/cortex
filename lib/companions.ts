export type CompanionId =
  | "sprout"
  | "lumi"
  | "orbit"
  | "pip"
  | "nori"
  | "nova";

export interface CompanionDefinition {
  id: CompanionId;
  name: string;
  personality: string;
  image: string;
  accent: string;
  glow: string;
}

export const COMPANIONS: CompanionDefinition[] = [
  {
    id: "sprout",
    name: "Sprout",
    personality: "Supportive",
    image: "/pets/sprout.png",
    accent: "#ffd36a",
    glow: "rgba(255, 211, 106, 0.42)",
  },
  {
    id: "lumi",
    name: "Lumi",
    personality: "Focused",
    image: "/pets/lumi.png",
    accent: "#77cfff",
    glow: "rgba(119, 207, 255, 0.42)",
  },
  {
    id: "orbit",
    name: "Orbit",
    personality: "Motivating",
    image: "/pets/orbit.png",
    accent: "#f4a15d",
    glow: "rgba(244, 161, 93, 0.42)",
  },
  {
    id: "pip",
    name: "Pip",
    personality: "Calm",
    image: "/pets/pip.png",
    accent: "#a9c1d8",
    glow: "rgba(169, 193, 216, 0.36)",
  },
  {
    id: "nori",
    name: "Nori",
    personality: "Cheerful",
    image: "/pets/nori.png",
    accent: "#ff94b8",
    glow: "rgba(255, 148, 184, 0.42)",
  },
  {
    id: "nova",
    name: "Nova",
    personality: "Relaxed",
    image: "/pets/nova.png",
    accent: "#cbd4ff",
    glow: "rgba(203, 212, 255, 0.4)",
  },
];

export function isCompanionId(
  value: string | null,
): value is CompanionId {
  return COMPANIONS.some(
    (companion) => companion.id === value,
  );
}