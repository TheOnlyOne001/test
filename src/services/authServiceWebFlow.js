// Alternative authentication service using launchWebAuthFlow
// This method works with regular Web Application OAuth2 clients

class AuthServiceWebFlow {
  constructor() {
    this.user = null;
    this.isAuthenticated = false;
    this.listeners = new Set();
    
    // OAuth2 configuration
    this.clientId = '40457641970-jtagtnt62rnvi1o9u2g9d4tti3f5qpr7.apps.googleusercontent.com';
    this.redirectUrl = chrome.identity.getRedirectURL();
    this.authUrl = 'https://accounts.google.com/o/oauth2/v2/auth';
    this.tokenUrl = 'https://oauth2.googleapis.com/token';
    this.scopes = [
      'https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/userinfo.email'
    ];
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
    console.log('🔐 Starting Chrome Extension Google Sign-In with WebAuthFlow...');
    console.log('📎 Redirect URL:', this.redirectUrl);
    
    try {
      // Step 1: Generate random state for CSRF protection
      const state = this.generateRandomString();
      
      // Step 2: Construct authorization URL
      const authParams = new URLSearchParams({
        client_id: this.clientId,
        response_type: 'code',
        redirect_uri: this.redirectUrl,
        scope: this.scopes.join(' '),
        state: state,
        access_type: 'offline',
        prompt: 'consent'
      });
      
      const authFullUrl = `${this.authUrl}?${authParams.toString()}`;
      console.log('🔗 Auth URL:', authFullUrl);
      
      // Step 3: Launch web auth flow
      const responseUrl = await new Promise((resolve, reject) => {
        chrome.identity.launchWebAuthFlow(
          {
            url: authFullUrl,
            interactive: true
          },
          (responseUrl) => {
            if (chrome.runtime.lastError) {
              console.error('❌ WebAuthFlow error:', chrome.runtime.lastError);
              reject(new Error(chrome.runtime.lastError.message));
            } else if (!responseUrl) {
              reject(new Error('No response URL received'));
            } else {
              console.log('✅ Response URL received:', responseUrl);
              resolve(responseUrl);
            }
          }
        );
      });
      
      // Step 4: Extract authorization code from response
      const url = new URL(responseUrl);
      const code = url.searchParams.get('code');
      const returnedState = url.searchParams.get('state');
      
      if (!code) {
        throw new Error('No authorization code received');
      }
      
      if (returnedState !== state) {
        throw new Error('State mismatch - possible CSRF attack');
      }
      
      console.log('✅ Authorization code received');
      
      // Step 5: Exchange code for tokens
      const tokens = await this.exchangeCodeForTokens(code);
      console.log('✅ Tokens received');
      
      // Step 6: Fetch user profile
      const userProfile = await this.fetchUserProfile(tokens.access_token);
      
      // Step 7: Save user data
      this.user = { 
        ...userProfile, 
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token
      };
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
        method: 'Chrome Identity WebAuthFlow'
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

  async exchangeCodeForTokens(code) {
    const tokenParams = new URLSearchParams({
      code: code,
      client_id: this.clientId,
      client_secret: '', // For installed apps, this can be empty
      redirect_uri: this.redirectUrl,
      grant_type: 'authorization_code'
    });

    const response = await fetch(this.tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: tokenParams.toString()
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Token exchange failed: ${error}`);
    }

    return await response.json();
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

  async signOut() {
    try {
      console.log('👋 Starting sign out...');

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

  generateRandomString() {
    const array = new Uint32Array(28);
    crypto.getRandomValues(array);
    return Array.from(array, dec => ('0' + dec.toString(16)).substr(-2)).join('');
  }

  // Debug method to check extension setup
  async debugInfo() {
    const manifest = chrome.runtime.getManifest();
    const info = {
      extensionId: chrome.runtime.id,
      manifestVersion: manifest.manifest_version,
      redirectUrl: this.redirectUrl,
      permissions: manifest.permissions,
      oauth2: manifest.oauth2,
      chromeIdentityAvailable: !!chrome.identity,
      storageAvailable: !!chrome.storage
    };
    
    console.log('🔍 Extension Debug Info:', info);
    return info;
  }
}

export default new AuthServiceWebFlow();