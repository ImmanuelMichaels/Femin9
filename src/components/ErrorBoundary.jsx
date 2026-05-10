import { Component } from 'react';
import { AlertTriangle } from 'lucide-react';

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
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          position: 'fixed', inset: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: '#ffebee', padding: 20, zIndex: 9999
        }}>
          <div style={{ maxWidth: 500, textAlign: 'center' }}>
            <AlertTriangle size={48} style={{ color: '#c62828', marginBottom: 16 }} />
            <h1 style={{ color: '#c62828', marginBottom: 16 }}>Error</h1>
            <pre style={{
              background: '#fff3e0', padding: 16,
              borderRadius: 8, overflow: 'auto',
              textAlign: 'left', fontSize: 12,
              color: '#d84315', whiteSpace: 'pre-wrap',
              wordBreak: 'break-word'
            }}>
              {this.state.error?.toString()}
            </pre>
            <p style={{ color: '#666', marginTop: 16, fontSize: 12 }}>
              Stack trace logged to console
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
