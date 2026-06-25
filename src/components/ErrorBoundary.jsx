// src/components/ErrorBoundary.jsx
// Wrap every page route in this. Prevents white-screen crashes from reaching users.

import { Component } from 'react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, errorId: null };
  }

  static getDerivedStateFromError() {
    return { hasError: true, errorId: Date.now().toString(36) };
  }

  componentDidCatch(error, info) {
    // Replace with your error tracker (Sentry, etc.)
    console.error('[ErrorBoundary]', error, info.componentStack);
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div style={{
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        minHeight: '60vh', padding: 32, textAlign: 'center',
      }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🌸</div>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--dp)', marginBottom: 8 }}>
          Something went wrong
        </h2>
        <p style={{ fontSize: 14, color: 'var(--mt)', lineHeight: 1.6, maxWidth: 320, marginBottom: 24 }}>
          Femin9 hit an unexpected error. Your data is safe. Please refresh the page.
        </p>
        <button
          onClick={() => { this.setState({ hasError: false }); window.location.reload(); }}
          style={{
            background: 'var(--dp)', color: '#fff', border: 'none',
            borderRadius: 12, padding: '12px 28px', fontSize: 14,
            fontWeight: 700, cursor: 'pointer',
          }}
        >
          Refresh
        </button>
        <p style={{ fontSize: 11, color: 'var(--mt)', marginTop: 16 }}>
          Error ID: {this.state.errorId}
        </p>
      </div>
    );
  }
}

// Usage in AppShell.jsx around renderPage():
// import ErrorBoundary from '../components/ErrorBoundary';
// <ErrorBoundary key={tab}>{renderPage()}</ErrorBoundary>
