"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";

import { Button } from "@/shared/ui";

type ErrorBoundaryProps = {
  children: ReactNode;
  fallback?: ReactNode;
};

type ErrorBoundaryState = {
  hasError: boolean;
};

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(_error: Error, _info: ErrorInfo) {}

  private handleReset = () => {
    this.setState({ hasError: false });
  };

  render() {
    if (!this.state.hasError) return this.props.children;
    if (this.props.fallback) return this.props.fallback;

    return (
      <div
        role="alert"
        className="flex flex-col items-center justify-center min-h-[60vh] gap-4 px-6 text-center"
      >
        <h2 className="text-white text-lg font-medium tracking-tight">
          Something went wrong
        </h2>
        <p className="text-zinc-500 text-sm max-w-md">
          An unexpected error happened. Try again, or reload the page if it
          persists.
        </p>
        <Button variant="secondary" size="sm" onClick={this.handleReset}>
          Try again
        </Button>
      </div>
    );
  }
}
