import type { ReactNode } from "react";

interface DashboardSectionShellProps {
  children: ReactNode;
  className?: string;
}

export function DashboardSectionShell({ children, className = "" }: DashboardSectionShellProps) {
  return (
    <section
      className={`rounded-2xl border border-raw-border/25 bg-raw-surface/[0.14] p-3 shadow-[0_8px_30px_rgba(0,0,0,0.18)] sm:rounded-3xl sm:p-5 ${className}`}
    >
      {children}
    </section>
  );
}
