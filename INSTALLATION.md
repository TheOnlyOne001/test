# Installation Guide

## Quick Start

1. **Build the Extension**:
   ```bash
   cd interest-capture-extension
   npm install
   npm run build
   ```

2. **Load in Chrome**:
   - Open Chrome browser
   - Navigate to `chrome://extensions/`
   - Enable "Developer mode" (toggle in top-right corner)
   - Click "Load unpacked" button
   - Select the `dist` folder from the project directory

3. **Verify Installation**:
   - Extension should appear in the extensions list
   - Click the extension icon in Chrome toolbar
   - Extension popup should open (400x600 px window)

## Testing the Extension

### Authentication Flow
1. Click "Sign in with Google" button
2. Complete Google OAuth flow
3. Verify user profile is displayed

### Onboarding Flow
1. Complete 4-step preference selection:
   - Welcome screen
   - Interest categories selection
   - Privacy preferences
   - Completion confirmation

### Interest Capture
1. Browse different websites (technology, news, sports, etc.)
2. Open extension popup
3. Navigate to Dashboard tab
4. Verify interests are being captured and categorized

## File Structure After Build

```
dist/
├── manifest.json          # Extension manifest
├── popup.html            # Extension popup HTML
├── popup.js              # Main popup JavaScript (199 KiB)
├── background.js         # Background script (13.4 KiB)
├── content.js            # Content script (1.52 KiB)
└── *.LICENSE.txt         # License files
```

## Troubleshooting

### Extension Not Loading
- Check that `manifest.json` exists in `dist` folder
- Verify manifest syntax is valid
- Ensure Developer mode is enabled

### Google Sign-In Issues
- Check Chrome console for errors
- Verify internet connection
- Ensure popup blockers are disabled

### Interest Capture Not Working
- Check that background script has loaded
- Verify content script permissions
- Open Chrome DevTools to check for errors

## Manual Testing Checklist

- [ ] Extension loads without errors
- [ ] Google Sign-In works correctly
- [ ] Onboarding flow completes
- [ ] Dashboard displays properly
- [ ] Interest capture functions
- [ ] Data persists across sessions
- [ ] Extension popup opens correctly
- [ ] Background script runs without errors

## Next Steps

After successful installation and testing, the extension is ready for use. Users can:
- Browse websites normally
- View captured interests in the dashboard
- Monitor interest statistics over time
- Adjust privacy preferences as needed