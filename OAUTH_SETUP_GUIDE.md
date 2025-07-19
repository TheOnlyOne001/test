# Google OAuth2 Setup for Chrome Extension

## Quick Fix Steps

### Step 1: Configure OAuth2 Client in Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to **APIs & Services** > **Credentials**
3. Find your existing OAuth2 client (ID: `40457641970-jtagtnt62rnvi1o9u2g9d4tti3f5qpr7.apps.googleusercontent.com`)
4. Click on it to edit

### Step 2: Add Authorized Redirect URIs

For a Web Application OAuth2 client, add these redirect URIs:
```
https://ciimjbfhdkddbbbefecchngmdklpbpmb.chromiumapp.org/
```

This is the special redirect URI format for Chrome extensions: `https://<extension-id>.chromiumapp.org/`

### Step 3: Update Your Extension Code

Option A: Keep using the current implementation (Quick fix)
- No code changes needed
- Just ensure the OAuth2 client is properly configured

Option B: Switch to WebAuthFlow implementation (More reliable)
- Replace the import in your components from:
  ```javascript
  import authService from '../services/authService';
  ```
  To:
  ```javascript
  import authService from '../services/authServiceWebFlow';
  ```

### Step 4: Test Your Extension

1. Reload your extension in `chrome://extensions`
2. Click on your extension popup
3. Click "Sign in with Google"
4. You should now see the Google OAuth consent screen

## Troubleshooting

### If you still get errors:

1. **Check Extension ID**: Make sure your extension ID is `ciimjbfhdkddbbbefecchngmdklpbpmb`
   - You can verify this in `chrome://extensions`

2. **Clear Cache**: Run this in your extension's background script console:
   ```javascript
   chrome.identity.clearAllCachedAuthTokens();
   ```

3. **Check OAuth Consent Screen**: Ensure it's properly configured in Google Cloud Console

### Alternative: Create a New OAuth2 Client

If the above doesn't work, create a new OAuth2 client:

1. In Google Cloud Console, go to **APIs & Services** > **Credentials**
2. Click **+ CREATE CREDENTIALS** > **OAuth client ID**
3. Choose **Web application**
4. Add Authorized redirect URIs:
   ```
   https://ciimjbfhdkddbbbefecchngmdklpbpmb.chromiumapp.org/
   ```
5. Copy the new Client ID
6. Update it in your `manifest.json` and auth service files

## Which Implementation to Use?

### Current Implementation (authService.js)
- ✅ Simpler code
- ✅ Uses Chrome's built-in auth
- ❌ Requires specific OAuth2 client configuration
- ❌ May fail with "Custom URI scheme" error

### WebAuthFlow Implementation (authServiceWebFlow.js)
- ✅ Works with standard Web Application OAuth2 clients
- ✅ More control over the auth flow
- ✅ Better error handling
- ❌ Slightly more complex code

## Recommended Approach

1. First, try fixing the OAuth2 client configuration as described above
2. If that doesn't work, switch to the WebAuthFlow implementation
3. The WebAuthFlow is more future-proof as Google is moving away from Chrome App OAuth2 clients