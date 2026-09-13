import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

function IconBase({ children, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      {children}
    </svg>
  );
}

export function HomeIcon(props: IconProps) {
  return <IconBase {...props}><path d="m3 11 9-8 9 8"/><path d="M5 10v10h14V10"/><path d="M9 20v-6h6v6"/></IconBase>;
}

export function LayersIcon(props: IconProps) {
  return <IconBase {...props}><path d="m12 2 9 5-9 5-9-5 9-5Z"/><path d="m3 12 9 5 9-5"/><path d="m3 17 9 5 9-5"/></IconBase>;
}

export function FocusIcon(props: IconProps) {
  return <IconBase {...props}><circle cx="12" cy="12" r="7"/><circle cx="12" cy="12" r="2"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/></IconBase>;
}

export function HistoryIcon(props: IconProps) {
  return <IconBase {...props}><path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5M12 7v5l3 2"/></IconBase>;
}

export function SparklesIcon(props: IconProps) {
  return <IconBase {...props}><path d="m12 3-1.2 3.3L7.5 7.5l3.3 1.2L12 12l1.2-3.3 3.3-1.2-3.3-1.2L12 3Z"/><path d="m18.5 13-.8 2.2-2.2.8 2.2.8.8 2.2.8-2.2 2.2-.8-2.2-.8-.8-2.2ZM5.5 13l-.6 1.6-1.6.6 1.6.6.6 1.7.6-1.7 1.7-.6-1.7-.6-.6-1.6Z"/></IconBase>;
}

export function ArrowIcon(props: IconProps) {
  return <IconBase {...props}><path d="M5 12h14M14 7l5 5-5 5"/></IconBase>;
}

export function CheckIcon(props: IconProps) {
  return <IconBase {...props}><path d="m5 12 4 4L19 6"/></IconBase>;
}

export function ClockIcon(props: IconProps) {
  return <IconBase {...props}><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></IconBase>;
}

export function ShieldIcon(props: IconProps) {
  return <IconBase {...props}><path d="M12 3 5 6v5c0 4.6 2.8 8.1 7 10 4.2-1.9 7-5.4 7-10V6l-7-3Z"/><path d="m9 12 2 2 4-4"/></IconBase>;
}

export function ZapIcon(props: IconProps) {
  return <IconBase {...props}><path d="m13 2-9 12h7l-1 8 9-12h-7l1-8Z"/></IconBase>;
}

export function PlayIcon(props: IconProps) {
  return <IconBase {...props}><path d="m8 5 11 7-11 7V5Z"/></IconBase>;
}

export function PauseIcon(props: IconProps) {
  return <IconBase {...props}><path d="M8 5v14M16 5v14"/></IconBase>;
}

export function XIcon(props: IconProps) {
  return <IconBase {...props}><path d="m6 6 12 12M18 6 6 18"/></IconBase>;
}

export function MenuIcon(props: IconProps) {
  return <IconBase {...props}><path d="M4 7h16M4 12h16M4 17h16"/></IconBase>;
}

export function CalendarIcon(
  props: IconProps,
) {
  return (
    <IconBase {...props}>
      <rect
        height="17"
        rx="2"
        width="18"
        x="3"
        y="4"
      />
      <path d="M8 2v4M16 2v4M3 9h18" />
      <path d="M8 13h.01M12 13h.01M16 13h.01M8 17h.01M12 17h.01" />
    </IconBase>
  );
}

export function FileIcon(
  props: IconProps,
) {
  return (
    <IconBase {...props}>
      <path d="M6 2h8l4 4v16H6z" />
      <path d="M14 2v5h5M9 13h6M9 17h6" />
    </IconBase>
  );
}

export function SearchIcon() {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <circle cx="11" cy="11" r="6.5" />
      <path strokeLinecap="round" d="m16 16 4 4" />
    </svg>
  );
}