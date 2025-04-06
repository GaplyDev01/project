import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      
      return (
        <div style={{ 
          margin: '20px', 
          padding: '20px', 
          border: '1px solid #f56565', 
          borderRadius: '4px', 
          backgroundColor: '#fff5f5' 
        }}>
          <h2 style={{ color: '#c53030' }}>Something went wrong</h2>
          <p>The application encountered an error. Please refresh the page and try again.</p>
          {this.state.error && (
            <pre style={{ 
              marginTop: '10px',
              padding: '10px',
              backgroundColor: '#edf2f7',
              overflow: 'auto',
              fontSize: '14px'
            }}>
              {this.state.error.toString()}
            </pre>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;