import React from 'react';
import { AlertCircle } from 'lucide-react';

/**
 * ErrorBoundary component to catch and display errors in child components
 * Prevents the entire app from crashing due to a single component error
 */
export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error to error reporting service
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      // Fallback UI when an error occurs
      return (
        <div className="min-h-screen bg-slate-900 text-slate-100 flex items-center justify-center flex-col gap-4 p-6">
          <div className="p-3 bg-rose-600 rounded-xl shadow-md">
            <AlertCircle className="h-8 w-8 text-white stroke-[2.5]" />
          </div>
          <div className="text-center max-w-md">
            <p className="text-base font-bold text-rose-400 mb-1">Something went wrong</p>
            <p className="text-xs text-slate-400 leading-relaxed">
              An error occurred while rendering this component. The application is still running.
            </p>
            {this.state.error && (
              <pre className="mt-3 text-[10px] bg-slate-800 text-rose-300 rounded-lg p-3 text-left overflow-auto max-h-28">
                {this.state.error.message}
              </pre>
            )}
            {this.props.fallback && this.props.fallback(this.state.error, this.resetError)}
          </div>
          <button
            onClick={this.resetError}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-sm font-semibold text-slate-200 transition-all"
          >
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }

  resetError = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };
}

/**
 * Higher-order component that wraps a component with ErrorBoundary
 * Usage: export default withErrorBoundary(MyComponent);
 */
export function withErrorBoundary(Component, FallbackComponent = null) {
  return function WrappedComponent(props) {
    return (
      <ErrorBoundary fallback={FallbackComponent ? (error, reset) => <FallbackComponent error={error} onReset={reset} /> : null}>
        <Component {...props} />
      </ErrorBoundary>
    );
  };
}

/**
 * Simple error display component for use with withErrorBoundary
 */
export function ErrorDisplay({ error, onReset }) {
  return (
    <div className="p-4 bg-rose-900/20 border border-rose-700 rounded-lg">
      <p className="text-rose-400 text-sm">Error: {error?.message || 'Unknown error'}</p>
      <button
        onClick={onReset}
        className="mt-2 px-3 py-1 bg-rose-700 hover:bg-rose-600 text-white text-xs rounded"
      >
        Retry
      </button>
    </div>
  );
}
