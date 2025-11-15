import { Component } from 'react'
import PropTypes from 'prop-types'

/**
 * ErrorBoundary Component
 * Catches JavaScript errors anywhere in the child component tree
 */
class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo)
    this.setState({
      error,
      errorInfo
    })
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null })
    if (this.props.onReset) {
      this.props.onReset()
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="container mt-5">
          <div className="card border-danger">
            <div className="card-header bg-danger text-white">
              <h5 className="mb-0">
                <i className="fas fa-exclamation-triangle me-2"></i>
                Something Went Wrong
              </h5>
            </div>
            <div className="card-body">
              <p className="text-muted">
                We're sorry, but something unexpected happened. Please try refreshing the page.
              </p>
              
              {this.state.error && (
                <div className="alert alert-light border mt-3">
                  <strong>Error:</strong> {this.state.error.toString()}
                </div>
              )}
              
              {process.env.NODE_ENV === 'development' && this.state.errorInfo && (
                <details className="mt-3">
                  <summary className="text-muted cursor-pointer">
                    <small>View Error Details (Development Only)</small>
                  </summary>
                  <pre className="alert alert-light border mt-2 small">
                    {this.state.errorInfo.componentStack}
                  </pre>
                </details>
              )}
              
              <div className="mt-4">
                <button 
                  onClick={this.handleReset} 
                  className="btn btn-primary me-2"
                >
                  <i className="fas fa-redo me-2"></i>
                  Try Again
                </button>
                <button 
                  onClick={() => window.location.href = '/'} 
                  className="btn btn-outline-secondary"
                >
                  <i className="fas fa-home me-2"></i>
                  Go Home
                </button>
              </div>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

ErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired,
  onReset: PropTypes.func,
}

export default ErrorBoundary
