import type { ReactNode } from "react";

export interface LoadingStateProps {
  label?: string;
  lines?: number;
}

export function LoadingState({ label = "Loading…", lines = 3 }: LoadingStateProps) {
  return (
    <div role="status" aria-live="polite" aria-label={label} className="w-full">
      <span className="sr-only">{label}</span>
      <div aria-hidden="true" className="grid gap-2">
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className="h-10 animate-pulse rounded-[var(--radius-md)] bg-[var(--surface)]"
          />
        ))}
      </div>
    </div>
  );
}

export interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
  retryLabel?: string;
}

export function ErrorState({
  message = "Something went wrong.",
  onRetry,
  retryLabel = "Try again",
}: ErrorStateProps) {
  return (
    <div
      role="alert"
      className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] px-4 py-6 text-center"
    >
      <p className="text-sm font-medium text-[var(--ink)]">{message}</p>
      {onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          className="mt-3 rounded-[var(--radius-md)] border border-[var(--border-strong)] px-4 py-2 text-sm font-medium text-[var(--ink)] transition-colors hover:bg-[var(--surface-2)]"
        >
          {retryLabel}
        </button>
      ) : null}
    </div>
  );
}

export interface EmptyStateProps {
  title?: string;
  message?: string;
  action?: ReactNode;
}

export function EmptyState({
  title = "Nothing here yet",
  message,
  action,
}: EmptyStateProps) {
  return (
    <div className="rounded-[var(--radius-md)] border border-dashed border-[var(--border-strong)] px-4 py-8 text-center">
      <p className="text-sm font-semibold text-[var(--ink)]">{title}</p>
      {message ? (
        <p className="mt-1 text-sm text-[var(--muted)]">{message}</p>
      ) : null}
      {action ? <div className="mt-3">{action}</div> : null}
    </div>
  );
}
