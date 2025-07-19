// src/popup/App.jsx
// Debug version with extension information

import React, { useState, useEffect } from 'react';
import authService from '../services/authServiceFixed';
import '../styles/global.css';

// Auth Context
const AuthContext = React.createContext();

function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const initialized = await authService.initialize();
        if (initialized) {
          setUser(authService.getCurrentUser());
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const signIn = async () => {
    setIsLoading(true);
    try {
      const result = await authService.signInWithGoogle();
      if (result.success) {
        setUser(result.user);
        setIsAuthenticated(true);
        return result;
      } else {
        return result;
      }
    } catch (error) {
      console.error('Sign-in error:', error);
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      await authService.signOut();
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Sign-out error:', error);
    }
  };

  return (
    <AuthContext.Provider value={{
      user, isAuthenticated, isLoading, signIn, signOut
    }}>
      {children}
    </AuthContext.Provider>
  );
}

function useAuth() {
  return React.useContext(AuthContext);
}

// Debug Info Component
function DebugInfo() {
  const [debugInfo, setDebugInfo] = useState(null);

  useEffect(() => {
    const getDebugInfo = async () => {
      const info = await authService.debugInfo();
      setDebugInfo(info);
    };
    getDebugInfo();
  }, []);

  if (!debugInfo) return null;

  return (
    <div className="card mb-4">
      <h3 className="mb-3">🔍 Extension Debug Info</h3>
      <div style={{ fontSize: '12px', fontFamily: 'monospace' }}>
        <div><strong>Extension ID:</strong> {debugInfo.extensionId}</div>
        <div><strong>Client ID:</strong> {debugInfo.oauth2?.client_id}</div>
        <div><strong>Chrome Identity:</strong> {debugInfo.chromeIdentityAvailable ? '✅' : '❌'}</div>
        <div><strong>Storage:</strong> {debugInfo.storageAvailable ? '✅' : '❌'}</div>
        <div><strong>Permissions:</strong> {debugInfo.permissions?.join(', ')}</div>
      </div>
      <div className="mt-2" style={{ fontSize: '11px', color: '#666' }}>
        Make sure the Extension ID matches the Item ID in Google Console
      </div>
    </div>
  );
}

// Enhanced Google Sign-In Component
function GoogleSignIn({ onSignIn, onError }) {
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [error, setError] = useState(null);
  const { signIn } = useAuth();

  const handleSignIn = async () => {
    setIsSigningIn(true);
    setError(null);

    try {
      const result = await signIn();
      if (result.success) {
        onSignIn?.(result.user);
      } else {
        setError(result.error);
        onError?.(new Error(result.error));
      }
    } catch (err) {
      console.error('Sign-in error:', err);
      setError(err.message);
      onError?.(err);
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleDebugAuth = async () => {
    console.log('🔍 Running debug info...');
    const info = await authService.debugInfo();
    console.log('Debug Info:', info);
    alert(`Extension ID: ${info.extensionId}\nClient ID: ${info.oauth2?.client_id}\nCheck console for full details.`);
  };

  return (
    <div className="d-flex flex-column align-center">
      <button
        onClick={handleSignIn}
        disabled={isSigningIn}
        className={`btn btn-primary ${isSigningIn ? 'disabled' : ''}`}
        style={{ padding: '10px 16px', marginBottom: '10px' }}
      >
        {isSigningIn ? (
          <>
            <div className="spinner" style={{ width: '16px', height: '16px', border: '2px solid #ffffff', borderTop: '2px solid transparent' }} />
            Signing in...
          </>
        ) : (
          <>
            <svg width="16" height="16" viewBox="0 0 24 24" style={{ marginRight: '8px' }}>
              <path fill="white" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            </svg>
            Sign in with Google
          </>
        )}
      </button>

      <button
        onClick={handleDebugAuth}
        className="btn btn-ghost"
        style={{ fontSize: '12px', padding: '6px 12px' }}
      >
        Show Debug Info
      </button>

      {error && (
        <div className="mt-2 p-2" style={{
          backgroundColor: '#ffebee',
          borderRadius: '4px',
          fontSize: '12px',
          border: '1px solid #ffcdd2',
          maxWidth: '350px'
        }}>
          <div style={{ fontWeight: 'bold', color: '#d32f2f' }}>Error:</div>
          <div style={{ color: '#666', marginTop: '4px' }}>{error}</div>
        </div>
      )}
    </div>
  );
}

// Dashboard Component
function Dashboard({ user, onSignOut }) {
  return (
    <div className="p-4" style={{ backgroundColor: '#f5f5f5', minHeight: '100%' }}>
      <div className="card mb-4 fade-in">
        <h2 className="mb-2">✅ Authentication Successful!</h2>
        <div className="d-flex align-center mt-2" style={{ gap: '8px' }}>
          <img
            src={user.picture}
            alt={user.name}
            style={{ width: '32px', height: '32px', borderRadius: '50%' }}
          />
          <div>
            <div style={{ fontWeight: 'bold' }}>{user.name}</div>
            <div style={{ fontSize: '12px', color: '#666' }}>{user.email}</div>
          </div>
        </div>
      </div>

      <div className="card fade-in">
        <h3 className="mb-3">🎉 Success!</h3>
        <p style={{ marginBottom: '16px' }}>
          Your Chrome extension OAuth is now working correctly. The authentication 
          flow completed successfully using the Chrome Identity API.
        </p>
        
        <button
          onClick={onSignOut}
          className="btn btn-secondary"
          style={{ width: '100%' }}
        >
          Sign Out
        </button>
      </div>
    </div>
  );
}

// Main App Content
function AppContent() {
  const { isAuthenticated, user, isLoading, signOut } = useAuth();
  const [currentView, setCurrentView] = useState('loading');

  useEffect(() => {
    if (isLoading) {
      setCurrentView('loading');
    } else if (isAuthenticated) {
      setCurrentView('dashboard');
    } else {
      setCurrentView('signin');
    }
  }, [isAuthenticated, isLoading]);

  const handleSignInSuccess = (user) => {
    console.log('✅ Sign-in successful:', user);
    setCurrentView('dashboard');
  };

  const handleSignInError = (error) => {
    console.error('❌ Sign-in error:', error);
  };

  const handleSignOut = async () => {
    await signOut();
    setCurrentView('signin');
  };

  if (currentView === 'loading') {
    return (
      <div className="d-flex flex-column align-center justify-center" style={{ height: '600px', width: '400px' }}>
        <div className="spinner mb-3"></div>
        <p className="text-secondary">Loading...</p>
      </div>
    );
  }

  return (
    <div className="d-flex flex-column" style={{ height: '600px', width: '400px', backgroundColor: '#f5f5f5' }}>
      <header className="card" style={{ borderRadius: '0', marginBottom: '0', borderBottom: '1px solid #e0e0e0' }}>
        <div className="d-flex justify-between align-center">
          <h1 className="m-0" style={{ fontSize: '20px', fontWeight: '600', color: '#333' }}>
            Interest Capture
          </h1>
          {isAuthenticated && (
            <img src={user.picture} alt={user.name} style={{ width: '32px', height: '32px', borderRadius: '50%' }} />
          )}
        </div>
      </header>

      <main className="flex-1" style={{ overflow: 'auto' }}>
        {currentView === 'signin' && (
          <div className="d-flex flex-column align-center justify-center text-center p-4" style={{ height: '100%' }}>
            <DebugInfo />
            <div className="mb-4 fade-in">
              <h2 className="mb-2">Chrome Extension OAuth Test</h2>
              <p className="text-secondary">Testing Google Sign-In with Chrome Identity API</p>
            </div>
            <GoogleSignIn onSignIn={handleSignInSuccess} onError={handleSignInError} />
          </div>
        )}

        {currentView === 'dashboard' && (
          <div className="fade-in">
            <Dashboard user={user} onSignOut={handleSignOut} />
          </div>
        )}
      </main>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;