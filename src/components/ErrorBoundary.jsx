// src/components/ErrorBoundary.jsx
import { Component } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
    // TODO: send to your error reporting service (Sentry, etc.)
    // reportError(error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    const isDev = import.meta.env?.DEV ?? false;

    return (
      <div style={{
        position: 'fixed', inset: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: '#fff', padding: 24, zIndex: 9999,
      }}>
        <div style={{ maxWidth: 480, width: '100%', textAlign: 'center' }}>

          {/* Icon */}
          <div style={{
            width: 72, height: 72, borderRadius: '50%',
            background: '#ffebee',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 20px',
          }}>
            <AlertTriangle size={36} color="#c62828" />
          </div>

          {/* Heading */}
          <h2 style={{ color: '#1a1a2e', marginBottom: 8, fontSize: 22 }}>
            Something went wrong
          </h2>
          <p style={{ color: '#6b7280', fontSize: 14, marginBottom: 24, lineHeight: 1.6 }}>
            Femin9 ran into an unexpected error. Your data is safe —
            try refreshing or tapping the button below.
          </p>

          {/* Error detail — dev only */}
          {isDev && this.state.error && (
            <pre style={{
              background: '#fff8f1', border: '1px solid #ffd5b0',
              padding: 16, borderRadius: 10,
              textAlign: 'left', fontSize: 11,
              color: '#b45309', whiteSpace: 'pre-wrap',
              wordBreak: 'break-word', marginBottom: 24,
              maxHeight: 200, overflowY: 'auto',
            }}>
              {this.state.error.toString()}
            </pre>
          )}

          {/* Actions */}
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <button
              onClick={this.handleReset}
              style={{
                padding: '12px 24px',
                border: '1.5px solid #e5e7eb',
                borderRadius: 12, background: '#fff',
                color: '#374151', fontSize: 14, fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Try Again
            </button>
            <button
              onClick={this.handleReload}
              style={{
                padding: '12px 24px',
                border: 'none', borderRadius: 12,
                background: 'linear-gradient(135deg, #e84393, #7b2ff7)',
                color: '#fff', fontSize: 14, fontWeight: 600,
                cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 8,
              }}
            >
              <RefreshCw size={15} />
              Reload App
            </button>
          </div>

        </div>
      </div>
    );
  }
}