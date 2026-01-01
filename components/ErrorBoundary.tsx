/**
 * Error Boundary Component
 * Catches errors and displays graceful error UI
 */

import React, { ReactNode, ErrorInfo } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Error Boundary caught:", error, errorInfo);
    this.setState({
      error,
      errorInfo,
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-white flex items-center justify-center px-6">
          <div className="max-w-md w-full">
            <div className="bg-red-50 border border-red-200 rounded-2xl p-8 space-y-6">
              <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full">
                <svg
                  className="w-6 h-6 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4v2m0 0v2m0-6v-2m0 0V7a2 2 0 012-2h.5a2 2 0 011.94 1.46l1.226 6.037A2 2 0 0120.5 16h-17a2 2 0 01-1.94-2.463l1.226-6.037A2 2 0 017.5 5H8a2 2 0 012 2v2m0 0V7"
                  />
                </svg>
              </div>

              <div className="text-center space-y-2">
                <h2 className="text-lg font-bold text-slate-900">
                  Something went wrong
                </h2>
                <p className="text-sm text-slate-600">
                  We encountered an unexpected error. Please try refreshing the
                  page.
                </p>
              </div>

              {process.env.NODE_ENV === "development" && this.state.error && (
                <div className="bg-slate-900 rounded-lg p-4 space-y-2 overflow-auto max-h-48">
                  <p className="text-xs font-mono text-red-400 break-words">
                    {this.state.error.toString()}
                  </p>
                  {this.state.errorInfo && (
                    <p className="text-xs font-mono text-slate-400 break-words whitespace-pre-wrap">
                      {this.state.errorInfo.componentStack}
                    </p>
                  )}
                </div>
              )}

              <button
                onClick={() => window.location.reload()}
                className="w-full px-4 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors text-sm"
              >
                Refresh Page
              </button>

              <a
                href="/"
                className="block w-full text-center px-4 py-3 bg-white text-slate-900 font-semibold rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors text-sm"
              >
                Go Home
              </a>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
