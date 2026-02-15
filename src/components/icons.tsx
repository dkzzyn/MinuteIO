/**
 * MinuteIO — Sistema de ícones padronizado
 * Padrão: viewBox 0 0 24 24, stroke 1.5, round caps/joins, fill none, currentColor
 * Tamanho/cor: controlar via CSS (classes .icon .icon-sm .icon-md .icon-lg .icon-primary etc.)
 */

import type { ReactNode } from "react";

const SVG_DEFAULTS = {
  viewBox: "0 0 24 24" as const,
  fill: "none" as const,
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true
};

type IconProps = {
  className?: string;
  size?: "sm" | "md" | "lg";
  /** Cor semântica (opcional; senão herda do pai) */
  variant?: "primary" | "success" | "muted" | "white";
  children: ReactNode;
};

/** Componente base: aplica padrão visual a todos os ícones. */
export function Icon({ className = "", size = "md", variant, children }: IconProps) {
  const sizeClass = size === "sm" ? "icon-sm" : size === "lg" ? "icon-lg" : "icon-md";
  const variantClass = variant ? `icon-${variant}` : "";
  const classes = ["icon", sizeClass, variantClass, className].filter(Boolean).join(" ");
  return (
    <svg className={classes} {...SVG_DEFAULTS}>
      {children}
    </svg>
  );
}

type Props = { className?: string };

export function IconBell({ className }: Props) {
  return (
    <svg className={className ?? "icon icon-md"} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M12 3a6 6 0 0 0-6 6v3.5l-1.5 2A1 1 0 0 0 5.4 16h13.2a1 1 0 0 0 .9-1.5L18 12.5V9a6 6 0 0 0-6-6z" />
      <path d="M9.5 18a2.5 2.5 0 0 0 5 0" />
    </svg>
  );
}

export function IconUser({ className }: Props) {
  return (
    <svg className={className ?? "icon icon-md"} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="12" cy="7" r="3.5" />
      <path d="M4 20a8 8 0 0 1 16 0" />
    </svg>
  );
}

export function IconCalendar({ className }: Props) {
  return (
    <svg className={className ?? "icon icon-md"} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M16 3v4M8 3v4M3 11h18" />
    </svg>
  );
}

export function IconClock({ className }: Props) {
  return (
    <svg className={className ?? "icon icon-md"} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v6l4 2" />
    </svg>
  );
}

export function IconChartUp({ className }: Props) {
  return (
    <svg className={className ?? "icon icon-md"} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M3 20h18" />
      <path d="M5 16l4-4 3 3 6-6" />
      <path d="M18 9h3v3" />
    </svg>
  );
}

export function IconSun({ className }: Props) {
  return (
    <svg className={className ?? "icon icon-md"} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="12" cy="12" r="5" />
      <path d="M12 1v3M12 20v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M1 12h3M20 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1" />
    </svg>
  );
}

export function IconMoon({ className }: Props) {
  return (
    <svg className={className ?? "icon icon-md"} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 0 0 9.79 9.79z" />
    </svg>
  );
}

export function IconGear({ className }: Props) {
  return (
    <svg className={className ?? "icon icon-md"} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.8 1.8 0 0 0 .4 2l-1.6 2.8a1.8 1.8 0 0 1-2.2.8l-2-.8a7.7 7.7 0 0 1-2 0l-2 .8a1.8 1.8 0 0 1-2.2-.8L4.2 17a1.8 1.8 0 0 0 .4-2l-.8-2a1.8 1.8 0 0 0 0-2l.8-2a1.8 1.8 0 0 0-.4-2l1.6-2.8a1.8 1.8 0 0 1 2.2-.8l2 .8a7.7 7.7 0 0 1 2 0l2-.8a1.8 1.8 0 0 1 2.2.8L20 5a1.8 1.8 0 0 0-.4 2l.8 2a1.8 1.8 0 0 0 0 2z" />
    </svg>
  );
}

export function IconTrophy({ className }: Props) {
  return (
    <svg className={className ?? "icon icon-md"} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
      <path d="M6 4v2M18 4v2" />
      <path d="M4 9v9a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9" />
      <path d="M8 4h8v6a4 4 0 0 1-8 0V4z" />
      <path d="M12 15v4M9 19h6" />
    </svg>
  );
}

export function IconX({ className }: Props) {
  return (
    <svg className={className ?? "icon icon-md"} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M18 6L6 18M6 6l12 12" />
    </svg>
  );
}

export function IconFile({ className }: Props) {
  return (
    <svg className={className ?? "icon icon-md"} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
      <path d="M14 2v6h6" />
    </svg>
  );
}

export function IconUpload({ className }: Props) {
  return (
    <svg className={className ?? "icon icon-md"} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  );
}

export function IconEye({ className }: Props) {
  return (
    <svg className={className ?? "icon icon-md"} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

export function IconEyeOff({ className }: Props) {
  return (
    <svg className={className ?? "icon icon-md"} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M10.7 15.3 4 22" />
      <path d="m3 3 18 18" />
      <path d="M12 5.4a10 10 0 0 1 8.3 5.6 1 1 0 0 1 0 .9 10 10 0 0 1-5.2 4.4" />
      <path d="M12 18.6a10 10 0 0 1-8.3-5.6 1 1 0 0 1 0-.9 10 10 0 0 1 5.2-4.4" />
    </svg>
  );
}
