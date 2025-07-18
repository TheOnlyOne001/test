// src/services/authService.js
// Simplified Google OAuth authentication service using Chrome Identity API only

class AuthService {
  constructor() {
    this.user = null;
    this.isAuthenticated = false;
    this.listeners = new Set();
  }

  // Add event listeners for auth state changes
  addListener(callback) {
    this.listeners.add(callback);
  }

  removeListener(callback) {
    this.listeners.delete(callback);
  }

  notifyListeners() {
    this.listeners.forEach(callback => callback(this.user, this.isAuthenticated));
  }

  // Initialize auth state from storage
  async initialize() {
    try {
      const result = await new Promise((resolve) => {
        chrome.storage.local.get(['user', 'isAuthenticated'], resolve);
      });

      if (result.user && result.isAuthenticated) {
        this.user = result.user;
        this.isAuthenticated = true;
        this.notifyListeners();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Auth initialization failed:', error);
      return false;
    }
  }

  // Google Sign-In using Chrome Identity API only
  async signInWithGoogle() {
    try {
      console.log('🔐 Starting Google Sign-In with Chrome Identity API...');
      
      const token = await new Promise((resolve, reject) => {
        chrome.identity.getAuthToken({ interactive: true }, (token) => {
          if (chrome.runtime.lastError) {
            reject(new Error(chrome.runtime.lastError.message));
          } else {
            resolve(token);
          }
        });
      });

      if (!token) {
        throw new Error('No token received from Chrome Identity API');
      }

      console.log('🎟️ Chrome Identity API token received successfully');

      // Fetch user profile from Google API
      const userProfile = await this.fetchUserProfile(token);
      
      // Store user data locally
      this.user = {
        ...userProfile,
        token: token
      };
      this.isAuthenticated = true;

      // Save to local storage
      await new Promise((resolve) => {
        chrome.storage.local.set({
          user: this.user,
          isAuthenticated: true
        }, resolve);
      });

      this.notifyListeners();
      console.log('✅ Authentication successful:', this.user);
      return { success: true, user: this.user };
    } catch (error) {
      console.error('❌ Authentication failed:', error);
      return {
        success: false,
        error: `Authentication failed: ${error.message}`
      };
    }
  }

  // Fetch user profile from Google API
  async fetchUserProfile(token) {
    try {
      console.log('👤 Fetching user profile...');
      const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const userInfo = await response.json();
      console.log('✅ User profile fetched successfully');
      return {
        id: userInfo.id,
        email: userInfo.email,
        name: userInfo.name,
        picture: userInfo.picture
      };
    } catch (error) {
      console.error('❌ Failed to fetch user profile:', error);
      throw error;
    }
  }

  // Sign out
  async signOut() {
    try {
      // Clear Chrome identity token
      if (this.user?.token) {
        chrome.identity.removeCachedAuthToken({
          token: this.user.token
        }, () => {
          console.log('🗑️ Cached auth token removed');
        });
      }

      // Clear local storage
      await new Promise((resolve) => {
        chrome.storage.local.remove(['user', 'isAuthenticated'], resolve);
      });

      console.log('👋 User signed out successfully');
    } catch (error) {
      console.error('❌ Sign out error:', error);
    } finally {
      this.user = null;
      this.isAuthenticated = false;
      this.notifyListeners();
    }
  }

  // Get current user
  getCurrentUser() {
    return this.user;
  }

  // Check if user is authenticated
  isUserAuthenticated() {
    return this.isAuthenticated;
  }
}

export default AuthService;