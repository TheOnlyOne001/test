// src/services/authService.js
// Chrome Extension ONLY authentication service

class AuthService {
  constructor() {
    this.user = null;
    this.isAuthenticated = false;
    this.listeners = new Set();
  }

  addListener(callback) {
    this.listeners.add(callback);
  }

  removeListener(callback) {
    this.listeners.delete(callback);
  }

  notifyListeners() {
    this.listeners.forEach(callback => callback(this.user, this.isAuthenticated));
  }

  async initialize() {
    try {
      const result = await new Promise((resolve) => {
        chrome.storage.local.get(['user', 'isAuthenticated'], resolve);
      });

      if (result.user && result.isAuthenticated) {
        this.user = result.user;
        this.isAuthenticated = true;
        this.notifyListeners();
        console.log('✅ User restored from storage:', this.user);
        return true;
      }
      return false;
    } catch (error) {
      console.error('❌ Auth initialization failed:', error);
      return false;
    }
  }

  async signInWithGoogle() {
    console.log('🔐 Starting Chrome Extension Google Sign-In...');
    
    try {
      // First, clear any cached tokens to avoid conflicts
      await this.clearCachedTokens();
      
      // Use Chrome Identity API - the ONLY method that works for Chrome extensions
      const token = await new Promise((resolve, reject) => {
        console.log('📱 Requesting Chrome Identity token...');
        
        chrome.identity.getAuthToken({ 
          interactive: true,
          scopes: [
            'https://www.googleapis.com/auth/userinfo.profile',
            'https://www.googleapis.com/auth/userinfo.email'
          ]
        }, (token) => {
          if (chrome.runtime.lastError) {
            console.error('❌ Chrome Identity API error:', chrome.runtime.lastError);
            reject(new Error(chrome.runtime.lastError.message));
          } else if (!token) {
            console.error('❌ No token received');
            reject(new Error('No token received from Chrome Identity API'));
          } else {
            console.log('✅ Token received successfully');
            resolve(token);
          }
        });
      });

      // Fetch user profile using the token
      console.log('👤 Fetching user profile...');
      const userProfile = await this.fetchUserProfile(token);
      
      // Save user data
      this.user = { ...userProfile, token };
      this.isAuthenticated = true;

      // Store in Chrome storage
      await new Promise((resolve) => {
        chrome.storage.local.set({
          user: this.user,
          isAuthenticated: true
        }, () => {
          console.log('✅ User data saved to storage');
          resolve();
        });
      });

      this.notifyListeners();
      console.log('🎉 Authentication successful!', this.user);
      
      return { 
        success: true, 
        user: this.user,
        method: 'Chrome Identity API'
      };

    } catch (error) {
      console.error('❌ Authentication failed:', error);
      return {
        success: false,
        error: `Authentication failed: ${error.message}`,
        details: error
      };
    }
  }

  async fetchUserProfile(token) {
    try {
      console.log('🌐 Making API request to Google...');
      
      const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ API Response error:', response.status, errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const userInfo = await response.json();
      console.log('✅ User profile received:', userInfo);
      
      return {
        id: userInfo.id,
        email: userInfo.email,
        name: userInfo.name,
        picture: userInfo.picture,
        verified_email: userInfo.verified_email
      };
    } catch (error) {
      console.error('❌ Failed to fetch user profile:', error);
      throw new Error(`Profile fetch failed: ${error.message}`);
    }
  }

  async clearCachedTokens() {
    return new Promise((resolve) => {
      console.log('🧹 Clearing cached tokens...');
      chrome.identity.clearAllCachedAuthTokens(() => {
        console.log('✅ All cached tokens cleared');
        resolve();
      });
    });
  }

  async signOut() {
    try {
      console.log('👋 Starting sign out...');
      
      // Remove cached token
      if (this.user?.token) {
        await new Promise((resolve) => {
          chrome.identity.removeCachedAuthToken({
            token: this.user.token
          }, () => {
            console.log('✅ Cached token removed');
            resolve();
          });
        });
      }

      // Clear all cached tokens
      await this.clearCachedTokens();

      // Clear storage
      await new Promise((resolve) => {
        chrome.storage.local.remove(['user', 'isAuthenticated'], () => {
          console.log('✅ Storage cleared');
          resolve();
        });
      });

      // Reset state
      this.user = null;
      this.isAuthenticated = false;
      this.notifyListeners();
      
      console.log('✅ Sign out complete');
      return { success: true };
      
    } catch (error) {
      console.error('❌ Sign out error:', error);
      // Even if there's an error, reset the state
      this.user = null;
      this.isAuthenticated = false;
      this.notifyListeners();
      
      return { success: false, error: error.message };
    }
  }

  getCurrentUser() {
    return this.user;
  }

  isUserAuthenticated() {
    return this.isAuthenticated;
  }

  // Debug method to check extension setup
  async debugInfo() {
    const manifest = chrome.runtime.getManifest();
    const info = {
      extensionId: chrome.runtime.id,
      manifestVersion: manifest.manifest_version,
      permissions: manifest.permissions,
      oauth2: manifest.oauth2,
      chromeIdentityAvailable: !!chrome.identity,
      storageAvailable: !!chrome.storage
    };
    
    console.log('🔍 Extension Debug Info:', info);
    return info;
  }
}

export default new AuthService();