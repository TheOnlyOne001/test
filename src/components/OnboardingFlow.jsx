// src/components/OnboardingFlow.jsx
// User onboarding flow component

import React, { useState } from 'react';

export default function OnboardingFlow({ onComplete, user }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [preferences, setPreferences] = useState({
    autoCapture: true,
    categories: [],
    notifications: true,
  });

  const steps = [
    {
      title: 'Welcome to Interest Capture!',
      content: (
        <div className="text-center">
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎯</div>
          <h3 className="mb-3">Track Your Digital Interests</h3>
          <p className="mb-4">
            Interest Capture automatically tracks the websites you visit and categorizes
            your interests to help you understand your browsing patterns.
          </p>
          <div className="d-flex flex-column" style={{ gap: '12px', marginTop: '24px' }}>
            <div className="d-flex align-center p-3" style={{ gap: '12px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
              <span style={{ fontSize: '20px' }}>📊</span>
              <span>Interest Analytics</span>
            </div>
            <div className="d-flex align-center p-3" style={{ gap: '12px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
              <span style={{ fontSize: '20px' }}>🏷️</span>
              <span>Auto Categorization</span>
            </div>
            <div className="d-flex align-center p-3" style={{ gap: '12px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
              <span style={{ fontSize: '20px' }}>🔒</span>
              <span>Local Storage</span>
            </div>
          </div>
        </div>
      )
    },
    {
      title: 'Choose Your Interests',
      content: (
        <div className="text-center">
          <p className="mb-4">Select the categories you're most interested in tracking:</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginTop: '16px' }}>
            {[
              { name: 'technology', icon: '💻', label: 'Technology' },
              { name: 'business', icon: '💼', label: 'Business' },
              { name: 'sports', icon: '⚽', label: 'Sports' },
              { name: 'entertainment', icon: '🎬', label: 'Entertainment' },
              { name: 'health', icon: '🏥', label: 'Health' },
              { name: 'science', icon: '🔬', label: 'Science' },
              { name: 'education', icon: '📚', label: 'Education' },
              { name: 'finance', icon: '💰', label: 'Finance' },
              { name: 'travel', icon: '✈️', label: 'Travel' },
              { name: 'food', icon: '🍕', label: 'Food' },
              { name: 'lifestyle', icon: '🌟', label: 'Lifestyle' },
              { name: 'news', icon: '📰', label: 'News' },
            ].map((category) => (
              <div
                key={category.name}
                className={`d-flex flex-column align-center p-3 ${preferences.categories.includes(category.name) ? 'text-primary' : ''}`}
                style={{
                  border: preferences.categories.includes(category.name) ? '2px solid #4285f4' : '2px solid #e0e0e0',
                  backgroundColor: preferences.categories.includes(category.name) ? '#f0f7ff' : 'white',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onClick={() => toggleCategory(category.name)}
              >
                <div style={{ fontSize: '24px', marginBottom: '8px' }}>{category.icon}</div>
                <div style={{ fontSize: '12px', fontWeight: '500', color: '#333' }}>{category.label}</div>
              </div>
            ))}
          </div>
        </div>
      )
    },
    {
      title: 'Privacy & Settings',
      content: (
        <div className="text-center">
          <div className="text-left mb-4">
            <h4 className="mb-3">Privacy Settings</h4>
            <div className="mb-4">
              <label className="d-flex align-center" style={{ gap: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '500' }}>
                <input
                  type="checkbox"
                  checked={preferences.autoCapture}
                  onChange={(e) => setPreferences({...preferences, autoCapture: e.target.checked})}
                  style={{ marginTop: '2px' }}
                />
                Automatically capture interests from visited websites
              </label>
              <p className="text-muted mt-1" style={{ fontSize: '12px', marginLeft: '24px' }}>
                When enabled, the extension will automatically track and categorize your browsing interests.
              </p>
            </div>
            <div className="mb-4">
              <label className="d-flex align-center" style={{ gap: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '500' }}>
                <input
                  type="checkbox"
                  checked={preferences.notifications}
                  onChange={(e) => setPreferences({...preferences, notifications: e.target.checked})}
                  style={{ marginTop: '2px' }}
                />
                Show interest insights and notifications
              </label>
              <p className="text-muted mt-1" style={{ fontSize: '12px', marginLeft: '24px' }}>
                Receive periodic insights about your browsing patterns and interests.
              </p>
            </div>
          </div>
          <div className="text-left p-4" style={{ backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
            <h4 className="mb-3">🔒 Your Privacy Matters</h4>
            <p className="m-0">
              All your data is stored locally on your device. We don't send your
              browsing data to any external servers. You have full control over
              your data and can delete it at any time.
            </p>
          </div>
        </div>
      )
    },
    {
      title: 'You\'re All Set!',
      content: (
        <div className="text-center">
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>✅</div>
          <h3 className="mb-3">Welcome aboard, {user.name}!</h3>
          <p className="mb-4">
            Your Interest Capture extension is now ready to track your digital interests.
            Start browsing and check back here to see your interest patterns emerge!
          </p>
          <div className="text-left p-4" style={{ backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
            <h4 className="mb-3">What happens next:</h4>
            <ul className="mt-3" style={{ paddingLeft: '20px' }}>
              <li>Visit websites as you normally would</li>
              <li>The extension will automatically categorize your interests</li>
              <li>Check your dashboard to see insights and patterns</li>
              <li>Adjust settings anytime from the extension popup</li>
            </ul>
          </div>
        </div>
      )
    }
  ];

  const toggleCategory = (categoryName) => {
    setPreferences(prev => ({
      ...prev,
      categories: prev.categories.includes(categoryName)
        ? prev.categories.filter(c => c !== categoryName)
        : [...prev.categories, categoryName]
    }));
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    // Save user preferences
    await new Promise((resolve) => {
      chrome.storage.local.set({
        userPreferences: preferences
      }, resolve);
    });
    
    onComplete();
  };

  const currentStepData = steps[currentStep];

  return (
    <div className="d-flex flex-column" style={{ height: '100%', backgroundColor: '#fff' }}>
      {/* Progress Bar */}
      <div style={{ height: '4px', backgroundColor: '#e0e0e0', position: 'relative' }}>
        <div
          style={{
            height: '100%',
            backgroundColor: '#4285f4',
            transition: 'width 0.3s ease',
            width: `${((currentStep + 1) / steps.length) * 100}%`
          }}
        />
      </div>

      {/* Step Content */}
      <div className="flex-1 p-4" style={{ overflow: 'auto' }}>
        <h2 className="text-center mb-4" style={{ fontSize: '20px', fontWeight: '600', color: '#333' }}>
          {currentStepData.title}
        </h2>
        <div className="fade-in">
          {currentStepData.content}
        </div>
      </div>

      {/* Navigation */}
      <div className="d-flex align-center justify-between p-4" style={{ borderTop: '1px solid #e0e0e0' }}>
        <button
          onClick={handleBack}
          disabled={currentStep === 0}
          className={`btn ${currentStep === 0 ? 'btn-ghost' : 'btn-secondary'}`}
        >
          Back
        </button>
        
        <div className="text-secondary" style={{ fontSize: '14px' }}>
          {currentStep + 1} of {steps.length}
        </div>
        
        <button
          onClick={handleNext}
          className="btn btn-primary"
        >
          {currentStep === steps.length - 1 ? 'Get Started' : 'Next'}
        </button>
      </div>
    </div>
  );
}
