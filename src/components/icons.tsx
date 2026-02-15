type Props = { className?: string };

export function IconBell({ className }: Props) {
  return (
    <svg className={className ?? "w-4 h-4"} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 3a6 6 0 0 0-6 6v3.5l-1.5 2A1 1 0 0 0 5.4 16h13.2a1 1 0 0 0 .9-1.5L18 12.5V9a6 6 0 0 0-6-6z" />
      <path d="M9.5 18a2.5 2.5 0 0 0 5 0" />
    </svg>
  );
}

export function IconUser({ className }: Props) {
  return (
    <svg className={className ?? "w-4 h-4"} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="7" r="3.5" />
      <path d="M4 20a8 8 0 0 1 16 0" />
    </svg>
  );
}

export function IconCalendar({ className }: Props) {
  return (
    <svg className={className ?? "w-4 h-4"} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M16 3v4M8 3v4M3 11h18" />
    </svg>
  );
}

export function IconClock({ className }: Props) {
  return (
    <svg className={className ?? "w-4 h-4"} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v6l4 2" />
    </svg>
  );
}

export function IconChartUp({ className }: Props) {
  return (
    <svg className={className ?? "w-4 h-4"} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 20h18" />
      <path d="M5 16l4-4 3 3 6-6" />
      <path d="M18 9h3v3" />
    </svg>
  );
}

export function IconSun({ className }: Props) {
  return (
    <svg className={className ?? "w-4 h-4"} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="5" />
      <path d="M12 1v3M12 20v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M1 12h3M20 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1" />
    </svg>
  );
}

export function IconMoon({ className }: Props) {
  return (
    <svg className={className ?? "w-4 h-4"} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 0 0 9.79 9.79z" />
    </svg>
  );
}

export function IconGear({ className }: Props) {
  return (
    <svg className={className ?? "w-4 h-4"} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.8 1.8 0 0 0 .4 2l-1.6 2.8a1.8 1.8 0 0 1-2.2.8l-2-.8a7.7 7.7 0 0 1-2 0l-2 .8a1.8 1.8 0 0 1-2.2-.8L4.2 17a1.8 1.8 0 0 0 .4-2l-.8-2a1.8 1.8 0 0 0 0-2l.8-2a1.8 1.8 0 0 0-.4-2l1.6-2.8a1.8 1.8 0 0 1 2.2-.8l2 .8a7.7 7.7 0 0 1 2 0l2-.8a1.8 1.8 0 0 1 2.2.8L20 5a1.8 1.8 0 0 0-.4 2l.8 2a1.8 1.8 0 0 0 0 2z" />
    </svg>
  );
}

export function IconTrophy({ className }: Props) {
  return (
    <svg className={className ?? "w-4 h-4"} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
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
    <svg className={className ?? "w-4 h-4"} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M18 6L6 18M6 6l12 12" />
    </svg>
  );
}
