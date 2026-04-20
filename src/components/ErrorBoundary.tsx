import { Component, ErrorInfo, ReactNode } from "react";
import { track } from "@/lib/analytics";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: (error: Error, reset: () => void) => ReactNode;
}

interface ErrorBoundaryState {
  error: Error | null;
}

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    const route =
      typeof window !== "undefined" ? window.location.pathname : "unknown";

    track("error_boundary_triggered", {
      message: error.message,
      stack: info.componentStack ?? error.stack ?? undefined,
      route,
    });
  }

  reset = (): void => {
    this.setState({ error: null });
  };

  render(): ReactNode {
    if (this.state.error) {
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.reset);
      }

      return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-raw-black to-raw-black/80 px-4">
          <div className="w-full max-w-md rounded-2xl border border-raw-border/50 bg-raw-surface p-8 text-center shadow-2xl">
            <p className="font-display text-lg tracking-wide text-raw-text">
              Something broke.
            </p>
            <p className="mt-2 text-sm text-raw-silver/60">
              We logged it and we'll look at it. Try again, or reload.
            </p>
            <div className="mt-6 flex flex-col gap-2">
              <button
                type="button"
                onClick={this.reset}
                className="w-full rounded-xl bg-raw-gold py-3 text-sm font-bold text-raw-ink transition-all hover:bg-raw-gold/90"
              >
                Try again
              </button>
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="w-full rounded-xl border border-raw-border/60 py-3 text-sm text-raw-silver/70 transition-colors hover:text-raw-silver"
              >
                Reload
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
