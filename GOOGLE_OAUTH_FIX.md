# Fix Google Sign-In for Chrome Extension

## Problem
The error "Error 400: invalid_request - Custom URI scheme is not supported on Chrome apps" occurs because the OAuth2 client ID is not properly configured for Chrome extensions in Google Cloud Console.

## Solution

### Step 1: Create a New OAuth2 Client for Chrome Extension

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project (or create a new one)
3. Navigate to **APIs & Services** > **Credentials**
4. Click **+ CREATE CREDENTIALS** > **OAuth client ID**
5. **IMPORTANT**: Select **Chrome App** as the Application type (NOT "Web application")
6. Fill in the details:
   - **Name**: Interest Capture Extension (or any descriptive name)
   - **Application ID**: `ciimjbfhdkddbbbefecchngmdklpbpmb` (your extension ID from Chrome)
7. Click **Create**
8. Copy the new Client ID

### Step 2: Update Your Extension

1. Replace the client_id in `manifest.json` with the new Chrome App client ID
2. Make sure your extension ID matches what you entered in Google Cloud Console

### Step 3: Verify Extension ID

Your extension ID is: `ciimjbfhdkddbbbefecchngmdklpbpmb`

Make sure this matches:
- The Application ID in Google Cloud Console OAuth2 client
- The actual ID shown in chrome://extensions when your extension is loaded

### Step 4: Additional Checks

1. **Verify OAuth2 Consent Screen**:
   - Go to **APIs & Services** > **OAuth consent screen**
   - Make sure it's configured with:
     - App name
     - User support email
     - Developer contact information
   - Add your test users if in testing mode

2. **Enable Required APIs**:
   - Go to **APIs & Services** > **Library**
   - Search and enable:
     - Google+ API (deprecated but sometimes still needed)
     - Google Identity Toolkit API
     - People API

### Step 5: Test the Fix

1. Reload your extension in Chrome
2. Try signing in again
3. You should see Google's OAuth consent screen instead of the error

## Common Issues

### If you still see the error:
1. **Wrong Client Type**: Double-check that you selected "Chrome App" not "Web application"
2. **Extension ID Mismatch**: Verify your extension ID matches exactly
3. **Cached Tokens**: Clear Chrome's cached tokens:
   ```javascript
   chrome.identity.clearAllCachedAuthTokens(() => {
     console.log('Tokens cleared');
   });
   ```

### If you can't find "Chrome App" option:
Google has been making changes to OAuth2 client types. If "Chrome App" is not available:
1. Try "Desktop app" type instead
2. Or use "Web application" with these redirect URIs:
   - `https://<extension-id>.chromiumapp.org/`
   - `https://ciimjbfhdkddbbbefecchngmdklpbpmb.chromiumapp.org/`

## Alternative: Using launchWebAuthFlow

If the above doesn't work, you may need to switch to `chrome.identity.launchWebAuthFlow` instead of `getAuthToken`. This requires more code changes but is more flexible.

## Resources
- [Chrome Identity API Documentation](https://developer.chrome.com/docs/extensions/reference/identity/)
- [OAuth2 for Chrome Extensions](https://developer.chrome.com/docs/extensions/mv3/tut_oauth/)