// src/popup/index.js
// Entry point for the popup React app with error handling

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Add error boundary for debugging
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error: error.toString() };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Extension Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ 
          padding: '20px', 
          textAlign: 'center',
          width: '400px',
          height: '600px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          backgroundColor: '#f5f5f5'
        }}>
          <h2 style={{ color: '#d32f2f' }}>Extension Error</h2>
          <p style={{ margin: '10px 0', fontSize: '14px' }}>
            Something went wrong. Check the console for details.
          </p>
          <pre style={{ 
            backgroundColor: '#fff', 
            padding: '10px', 
            border: '1px solid #ddd',
            borderRadius: '4px',
            fontSize: '12px',
            textAlign: 'left',
            overflow: 'auto'
          }}>
            {this.state.error}
          </pre>
          <button 
            onClick={() => window.location.reload()}
            style={{
              marginTop: '10px',
              padding: '8px 16px',
              backgroundColor: '#1976d2',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Reload Extension
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// Initialize with error handling
try {
  const container = document.getElementById('root');
  if (!container) {
    throw new Error('Root element not found');
  }
  
  const root = ReactDOM.createRoot(container);
  root.render(
    <React.StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </React.StrictMode>
  );
  console.log('Extension popup initialized successfully');
} catch (error) {
  console.error('Failed to initialize extension:', error);
  
  // Fallback: Create a simple error message in the DOM
  const container = document.getElementById('root') || document.body;
  container.innerHTML = `
    <div style="
      padding: 20px; 
      text-align: center;
      width: 400px;
      height: 600px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      background-color: #f5f5f5;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    ">
      <h2 style="color: #d32f2f; margin-bottom: 20px;">Extension Failed to Load</h2>
      <p style="margin: 10px 0; font-size: 14px;">
        The extension encountered an error during initialization.
      </p>
      <div style="
        background-color: #fff; 
        padding: 10px; 
        border: 1px solid #ddd;
        border-radius: 4px;
        font-size: 12px;
        text-align: left;
        margin: 10px 0;
        font-family: monospace;
      ">
        ${error.toString()}
      </div>
      <p style="font-size: 12px; color: #666;">
        1. Check the browser console for more details<br>
        2. Try rebuilding the extension: <code>npm run build</code><br>
        3. Reload the extension in chrome://extensions/
      </p>
    </div>
  `;
}