import React from 'react'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null, info: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, info) {
    console.error('ErrorBoundary caught:', error, info)
    this.setState({ info })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          margin: '40px auto',
          maxWidth: 700,
          padding: '32px',
          background: '#fff0f0',
          border: '2px solid #f00',
          borderRadius: '12px',
          fontFamily: 'monospace',
        }}>
          <h2 style={{ color: '#c00', marginTop: 0 }}>⚠️ Runtime Error Caught</h2>
          <p style={{ color: '#900', fontWeight: 'bold' }}>
            {this.state.error?.toString()}
          </p>
          <pre style={{
            background: '#fff',
            padding: '16px',
            borderRadius: '8px',
            overflowX: 'auto',
            fontSize: '12px',
            color: '#333',
            whiteSpace: 'pre-wrap',
          }}>
            {this.state.info?.componentStack}
          </pre>
          <button
            onClick={() => this.setState({ hasError: false, error: null, info: null })}
            style={{
              marginTop: '16px',
              padding: '8px 20px',
              background: '#c00',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
            }}
          >
            Retry
          </button>
        </div>
      )
    }
    return this.props.children
  }
}

export default ErrorBoundary
