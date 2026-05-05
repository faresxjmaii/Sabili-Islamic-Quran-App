import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertCircle, RotateCcw, Home } from 'lucide-react';
import { motion } from 'framer-motion';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(): Partial<State> {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    this.setState({
      error,
      errorInfo,
    });
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  handleReload = () => {
    window.location.href = '/';
  };

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    const isDevelopment = import.meta.env.DEV;

    return (
      <div className="min-h-screen flex items-center justify-center bg-[#07111F] text-[#F8FAFC] px-4">
      <div className="app-atmosphere pointer-events-none fixed inset-0 z-0" aria-hidden="true" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="relative z-10 w-full max-w-md"
      >
        {/* Error Icon */}
        <motion.div
          animate={{ rotate: [0, -10, 10, -5, 5, 0] }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex justify-center mb-6"
        >
          <div className="relative">
            <div className="absolute inset-0 bg-red-500/20 rounded-full blur-2xl w-24 h-24 mx-auto" />
            <AlertCircle className="w-20 h-20 text-red-400 relative z-10" strokeWidth={1.5} />
          </div>
        </motion.div>

        {/* Error Content */}
        <div className="bg-gradient-to-b from-slate-800/60 to-slate-900/40 rounded-2xl border border-slate-700/50 p-8 backdrop-blur-md shadow-2xl">
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-2xl font-bold text-center mb-2 bg-gradient-to-r from-slate-100 to-slate-300 bg-clip-text text-transparent"
          >
            Something went wrong
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-center text-slate-400 text-sm mb-6"
          >
            We encountered an unexpected issue. Please try recovering or returning to the home page.
          </motion.p>

          {/* Error Details (Development Only) */}
          {isDevelopment && this.state.error && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mb-6 p-4 bg-red-900/20 border border-red-700/30 rounded-lg overflow-auto max-h-32"
            >
              <p className="font-mono text-xs text-red-300 whitespace-pre-wrap break-words">
                {this.state.error.message}
              </p>
              {this.state.errorInfo && (
                <details className="mt-2 text-xs text-red-200">
                  <summary className="cursor-pointer hover:text-red-100">Stack trace</summary>
                  <pre className="mt-2 font-mono text-xs whitespace-pre-wrap break-words">
                    {this.state.errorInfo.componentStack}
                  </pre>
                </details>
              )}
            </motion.div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3">
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={this.handleReset}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-blue-500/50"
            >
              <RotateCcw className="w-5 h-5" />
              Try to recover
            </motion.button>

            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={this.handleReload}
              className="w-full bg-slate-700/50 hover:bg-slate-600/50 text-slate-100 font-semibold py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 border border-slate-600/50"
            >
              <Home className="w-5 h-5" />
              Return home
            </motion.button>
          </div>
        </div>

        {/* Decorative Elements */}
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 3, repeat: Infinity }}
          className="absolute top-0 right-10 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl -z-10"
        />
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 4, repeat: Infinity, delay: 0.5 }}
          className="absolute bottom-0 left-10 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl -z-10"
        />
      </motion.div>
      </div>
    );
  }
}
