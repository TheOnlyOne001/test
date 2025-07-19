# Chrome Extension OAuth Setup - Complete Guide

## Understanding Chrome Extension OAuth

When you create an OAuth client with type "Chrome Extension" in Google Cloud Console, it works differently from Web Application OAuth:

1. **No Redirect URIs**: Chrome Extension OAuth clients don't use redirect URIs
2. **Extension ID Matching**: Authentication works by matching your extension ID
3. **Uses chrome.identity.getAuthToken()**: This is the only supported method

## Prerequisites Check

### 1. Verify Your Extension ID
Your extension ID is: `ciimjbfhdkddbbbefecchngmdklpbpmb`

To confirm:
1. Go to `chrome://extensions`
2. Enable "Developer mode"
3. Find your extension and verify the ID matches

### 2. Verify OAuth Client Configuration

In Google Cloud Console:
1. Go to **APIs & Services** > **Credentials**
2. Click on your OAuth 2.0 Client ID
3. Verify:
   - **Application type**: Chrome Extension
   - **Application ID**: `ciimjbfhdkddbbbefecchngmdklpbpmb`
   - **Name**: Interest Capture Extension (or similar)

## Common Issues and Solutions

### Issue: "Error 400: invalid_request"

This error typically means one of the following:

1. **Extension ID Mismatch**
   - The extension ID in Google Cloud Console doesn't match your actual extension ID
   - Solution: Update the Application ID in Google Cloud Console to match exactly

2. **OAuth Consent Screen Not Configured**
   - Go to **APIs & Services** > **OAuth consent screen**
   - Ensure all required fields are filled:
     - App name
     - User support email
     - Developer contact information
   - If in testing mode, add test users

3. **APIs Not Enabled**
   - Go to **APIs & Services** > **Library**
   - Enable these APIs:
     - Google Identity Toolkit API
     - People API

### Issue: "OAuth2 not granted or revoked"

This can happen when:
1. The user previously denied permissions
2. The OAuth consent screen was updated
3. Cached tokens are corrupted

Solution: The updated auth service handles this by clearing cached tokens and retrying.

## Testing Your Fix

1. **Rebuild the extension**:
   ```bash
   npm run build
   ```

2. **Reload in Chrome**:
   - Go to `chrome://extensions`
   - Click the refresh button on your extension

3. **Test authentication**:
   - Click your extension icon
   - Click "Sign in with Google"
   - You should see Google's OAuth consent screen

4. **Check the console**:
   - Right-click the extension icon
   - Select "Inspect popup"
   - Check the Console tab for debug information

## If It Still Doesn't Work

### 1. Create a New OAuth Client

Sometimes it's easier to start fresh:

1. In Google Cloud Console, create a new OAuth 2.0 Client ID
2. Select **Chrome Extension** as the type
3. Enter your extension ID: `ciimjbfhdkddbbbefecchngmdklpbpmb`
4. Update the client_id in your `manifest.json`
5. Rebuild and reload your extension

### 2. Check OAuth Consent Screen Status

If your app is in "Testing" mode:
- Only test users can authenticate
- Add your email to the test users list

If you need production access:
- You may need to verify your app with Google
- This is required for sensitive scopes or public distribution

### 3. Debug Information

The updated auth service includes detailed logging. Check the console for:
- Extension ID verification
- OAuth2 configuration in manifest
- Specific error messages from Chrome Identity API

## Key Differences from Web OAuth

1. **No redirect URIs** - Chrome handles this internally
2. **No client secret** - Not needed for Chrome extensions
3. **Scopes in manifest.json** - Not in the API call
4. **Extension ID is critical** - Must match exactly

## Need More Help?

If you're still having issues:
1. Check the exact error message in the console
2. Verify all IDs match exactly (no extra spaces)
3. Try creating a fresh OAuth client
4. Ensure your extension is loaded unpacked with the correct ID