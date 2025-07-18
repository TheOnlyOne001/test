// src/contexts/AuthContext.jsx
// Simplified authentication context for minimal extension

import React, { createContext, useContext, useEffect, useState } from 'react';
import authService from '../services/authService.js';

const AuthContext = createContext();

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize authentication state
  useEffect(() => {
    const initAuth = async () => {
      try {
        setIsLoading(true);
        const isInitialized = await authService.initialize();
        
        if (isInitialized) {
          setUser(authService.getCurrentUser());
          setIsAuthenticated(true);
        } else {
          setUser(null);
          setIsAuthenticated(false);
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
        setError(err.message);
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  // Listen for auth state changes
  useEffect(() => {
    const handleAuthStateChange = (newUser, newAuthState) => {
      setIsAuthenticated(newAuthState);
      setUser(newUser);
      
      if (!newAuthState) {
        setUser(null);
      }
    };

    // Listen for auth state changes from authService
    authService.addListener(handleAuthStateChange);

    return () => {
      authService.removeListener(handleAuthStateChange);
    };
  }, []);

  const signIn = async () => {
    try {
      setError(null);
      setIsLoading(true);
      
      const result = await authService.signInWithGoogle();
      
      if (result.success) {
        setUser(result.user);
        setIsAuthenticated(true);
        return { success: true, user: result.user };
      } else {
        throw new Error(result.error || 'Authentication failed');
      }
    } catch (err) {
      console.error('Sign-in error:', err);
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setError(null);
      await authService.signOut();
      setUser(null);
      setIsAuthenticated(false);
      return { success: true };
    } catch (err) {
      console.error('Sign-out error:', err);
      setError(err.message);
      return { success: false, error: err.message };
    }
  };

  const refreshUser = async () => {
    try {
      if (!isAuthenticated) return null;
      
      const refreshed = await authService.refreshProfile();
      if (refreshed) {
        const updatedUser = authService.getCurrentUser();
        setUser(updatedUser);
        return updatedUser;
      }
      return null;
    } catch (err) {
      console.error('Refresh user error:', err);
      // If refresh fails, sign out
      await signOut();
      return null;
    }
  };

  const value = {
    // User state
    user,
    isAuthenticated,
    isLoading,
    error,
    
    // Auth actions
    signIn,
    signOut,
    refreshUser,
    
    // Convenience getters for compatibility
    isConnected: isAuthenticated,
    address: user?.email || null,
    
    // Status helpers
    isConnecting: isLoading,
    isReconnecting: false,
    isDisconnected: !isAuthenticated,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hooks for compatibility
export function useAccount() {
  const { user, isAuthenticated, isLoading } = useAuth();
  
  return {
    address: user?.email || null,
    isConnected: isAuthenticated,
    isConnecting: isLoading,
    isDisconnected: !isAuthenticated,
    isReconnecting: false,
  };
}

export default AuthProvider;