import { Component, type ReactNode } from 'react';
import { Button } from '@messai/ui';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  override componentDidCatch(error: Error, errorInfo: any) {
    console.error('3D Viewer Error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  override render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex items-center justify-center h-full min-h-[600px] bg-gray-50">
          <div className="text-center p-8">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-red-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-serif font-semibold text-gray-900 mb-2">
              3D Rendering Error
            </h3>
            <p className="text-gray-600 mb-4">
              An error occurred while rendering the 3D model. This might be due to WebGL
              compatibility or resource loading issues.
            </p>
            {this.state.error && (
              <details className="text-left bg-gray-100 p-4 rounded mb-4">
                <summary className="cursor-pointer font-mono text-sm">Error Details</summary>
                <pre className="mt-2 text-xs overflow-auto">{this.state.error.toString()}</pre>
              </details>
            )}
            <Button onClick={this.handleReset} variant="primary">
              Try Again
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
