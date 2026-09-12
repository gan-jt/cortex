"use client";

export type PetKind =
  | "sprout"
  | "lumi"
  | "orbit"
  | "pip"
  | "nori"
  | "nova";

export type SproutState =
  | "idle"
  | "focused"
  | "thinking"
  | "happy"
  | "sleeping"
  | "celebrating"
  | "sad"
  | "encouraging";

export const petData = {
  sprout: {
    name: "Sprout",
    mood: "Supportive",
    image: "/pets/sprout.png",
  },
  lumi: {
    name: "Lumi",
    mood: "Focused",
    image: "/pets/lumi.png",
  },
  orbit: {
    name: "Orbit",
    mood: "Motivating",
    image: "/pets/orbit.png",
  },
  pip: {
    name: "Pip",
    mood: "Calm",
    image: "/pets/pip.png",
  },
  nori: {
    name: "Nori",
    mood: "Cheerful",
    image: "/pets/nori.png",
  },
  nova: {
    name: "Nova",
    mood: "Relaxed",
    image: "/pets/nova.png",
  },
} as const;

const sproutStates: Record<SproutState, string> = {
  idle: "/pets/sprout-idle.png",
  focused: "/pets/sprout-focused.png",
  thinking: "/pets/sprout-thinking.png",
  happy: "/pets/sprout-happy.png",
  sleeping: "/pets/sprout-sleeping.png",
  celebrating: "/pets/sprout-celebrating.png",
  sad: "/pets/sprout-sad.png",
  encouraging: "/pets/sprout-encouraging.png",
};

type PetProps = {
  kind?: PetKind;
  small?: boolean;
  state?: SproutState;
};

export function Pet({
  kind = "sprout",
  small = false,
  state,
}: PetProps) {
  const src =
    kind === "sprout" && state
      ? sproutStates[state]
      : petData[kind].image;

  return (
    <img
      src={src}
      alt={petData[kind].name}
      className={`pet pet-png ${small ? "pet-small pet-png-small" : ""}`}
      draggable={false}
      style={{
        objectFit: "contain",
        background: "transparent",
        borderRadius: 0,
        boxShadow: "none",
        filter: "drop-shadow(0 0 18px rgba(255, 194, 72, 0.22))",
        userSelect: "none",
      }}
    />
  );
}
