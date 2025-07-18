// src/popup/App.jsx
// Main application component with basic routing

import React, { useState, useEffect } from 'react';
import AuthProvider, { useAuth } from '../contexts/AuthContext';
import GoogleSignIn from '../components/GoogleSignIn';
import Dashboard from '../components/Dashboard';
import OnboardingFlow from '../components/OnboardingFlow';
import interestCaptureService from '../services/interestCaptureService';
import '../styles/global.css';

function AppContent() {
  const { isAuthenticated, user, isLoading, signOut } = useAuth();
  const [currentView, setCurrentView] = useState('loading');
  const [isOnboarded, setIsOnboarded] = useState(false);

  useEffect(() => {
    const checkOnboardingStatus = async () => {
      if (isAuthenticated && user) {
        // Check if user has completed onboarding
        const result = await new Promise((resolve) => {
          chrome.storage.local.get(['onboardingCompleted'], resolve);
        });
        
        setIsOnboarded(result.onboardingCompleted || false);
        
        if (result.onboardingCompleted) {
          setCurrentView('dashboard');
        } else {
          setCurrentView('onboarding');
        }
      } else if (!isLoading) {
        setCurrentView('signin');
      }
    };

    checkOnboardingStatus();
  }, [isAuthenticated, user, isLoading]);

  const handleSignInSuccess = (user) => {
    console.log('User signed in:', user);
    setCurrentView('onboarding');
  };

  const handleSignInError = (error) => {
    console.error('Sign in error:', error);
  };

  const handleOnboardingComplete = async () => {
    // Save onboarding completion status
    await new Promise((resolve) => {
      chrome.storage.local.set({ onboardingCompleted: true }, resolve);
    });
    
    setIsOnboarded(true);
    setCurrentView('dashboard');
  };

  const handleSignOut = async () => {
    await signOut();
    // Clear onboarding status
    await new Promise((resolve) => {
      chrome.storage.local.remove(['onboardingCompleted'], resolve);
    });
    setIsOnboarded(false);
    setCurrentView('signin');
  };

  if (isLoading || currentView === 'loading') {
    return (
      <div className="d-flex flex-column align-center justify-center" style={{ height: '600px', width: '400px' }}>
        <div className="d-flex flex-column align-center justify-center text-center">
          <div className="spinner mb-3"></div>
          <p className="text-secondary">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="d-flex flex-column" style={{ height: '600px', width: '400px', backgroundColor: '#f5f5f5' }}>
      {/* Header */}
      <header className="card" style={{ borderRadius: '0', marginBottom: '0', borderBottom: '1px solid #e0e0e0' }}>
        <div className="d-flex justify-between align-center">
          <h1 className="m-0" style={{ fontSize: '20px', fontWeight: '600', color: '#333' }}>
            Interest Capture
          </h1>
          {isAuthenticated && (
            <div className="d-flex align-center" style={{ gap: '8px' }}>
              <img
                src={user.picture}
                alt={user.name}
                style={{ width: '32px', height: '32px', borderRadius: '50%' }}
              />
              <button
                onClick={handleSignOut}
                className="btn btn-ghost"
                style={{ fontSize: '12px', padding: '4px 8px' }}
              >
                Sign Out
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1" style={{ overflow: 'auto' }}>
        {currentView === 'signin' && (
          <div className="d-flex flex-column align-center justify-center text-center p-4" style={{ height: '100%' }}>
            <div className="mb-4 fade-in">
              <h2 className="mb-2">Welcome to Interest Capture</h2>
              <p className="text-secondary">Track your browsing interests and discover patterns in your online behavior.</p>
            </div>
            <GoogleSignIn
              onSignIn={handleSignInSuccess}
              onError={handleSignInError}
            />
          </div>
        )}

        {currentView === 'onboarding' && (
          <div className="fade-in">
            <OnboardingFlow
              onComplete={handleOnboardingComplete}
              user={user}
            />
          </div>
        )}

        {currentView === 'dashboard' && (
          <div className="fade-in">
            <Dashboard
              user={user}
              onViewChange={setCurrentView}
            />
          </div>
        )}
      </main>
    </div>
  );
}

// Main App component with providers
function App() {
  useEffect(() => {
    // Initialize services
    interestCaptureService.initialize();
  }, []);

  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}


export default App;