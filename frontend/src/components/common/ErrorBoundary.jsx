import React from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Unhandled UI error:", error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <div className="flex min-h-screen items-center justify-center bg-white px-4 text-slate-950 dark:bg-[#0B0F19] dark:text-white">
        <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-2xl shadow-slate-950/10 dark:border-white/10 dark:bg-[#111827]/90 dark:shadow-black/30">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-rose-400/20 bg-rose-500/10 text-rose-500">
            <AlertTriangle size={26} strokeWidth={2.4} />
          </div>

          <h1 className="mb-2 text-xl font-semibold tracking-tight">
            Something went wrong
          </h1>
          <p className="mb-6 text-sm leading-6 text-slate-600 dark:text-slate-400">
            LearnQuick hit an unexpected interface error. Refreshing usually
            restores the current session.
          </p>

          <button
            type="button"
            onClick={this.handleReload}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-sky-500 px-5 text-sm font-semibold text-white shadow-lg shadow-sky-500/25 transition-all duration-200 hover:bg-sky-600"
          >
            <RefreshCw size={16} strokeWidth={2.4} />
            Refresh app
          </button>
        </div>
      </div>
    );
  }
}

export default ErrorBoundary;
