# Interest Capture Extension

A minimal Chrome extension that captures and categorizes user browsing interests using Google Sign-In authentication and local storage.

## Features

- **Google Sign-In Authentication**: Uses Chrome Identity API for seamless authentication
- **Automatic Interest Capture**: Tracks and categorizes browsing behavior
- **User Onboarding**: 4-step preference selection flow
- **Dashboard**: View interest statistics and captured data  
- **Local Storage**: All data stored locally using Chrome storage API
- **Modern UI**: React-based interface with CSS animations

## Installation

### Manual Installation (Development)

1. **Build the Extension**:
   ```bash
   cd interest-capture-extension
   npm install
   npm run build
   ```

2. **Load in Chrome**:
   - Open Chrome and navigate to `chrome://extensions/`
   - Enable "Developer mode" (toggle in top right)
   - Click "Load unpacked"
   - Select the `dist` folder from the project directory

3. **Test the Extension**:
   - Click the extension icon in the Chrome toolbar
   - Follow the onboarding flow
   - Browse websites to test interest capture

## Project Structure

```
interest-capture-extension/
├── src/
│   ├── popup/
│   │   └── App.jsx                 # Main popup application
│   ├── background/
│   │   └── background.js           # Background script for tab monitoring
│   ├── content/
│   │   └── content.js              # Content script for page data extraction
│   ├── components/
│   │   ├── Dashboard.jsx           # Interest statistics dashboard
│   │   ├── GoogleSignIn.jsx        # Google Sign-In component
│   │   └── OnboardingFlow.jsx      # User onboarding flow
│   ├── contexts/
│   │   └── AuthContext.jsx         # Authentication state management
│   ├── services/
│   │   ├── authService.js          # Google Sign-In service
│   │   └── interestCaptureService.js # Interest tracking service
│   └── styles/
│       └── global.css              # CSS utilities and animations
├── dist/                           # Built extension files
├── manifest.json                   # Chrome extension manifest
├── webpack.config.js               # Build configuration
└── package.json                    # Dependencies
```

## How It Works

### Authentication
- **Dual Authentication System**: Tries Chrome Identity API first, falls back to Web Auth Flow
- **Primary Method**: `chrome.identity.getAuthToken()` - works with Chrome Extension OAuth clients
- **Fallback Method**: `chrome.identity.launchWebAuthFlow()` - works with WEB OAuth clients
- Google OAuth Client ID: `273799324150-0l8rqlkv2fmqicq84kp0vjffqe3tpfrj.apps.googleusercontent.com`
- Compatible with both Chrome Extension and WEB OAuth client types
- Fetches user profile from Google API (`https://www.googleapis.com/oauth2/v2/userinfo`)
- Stores user profile in Chrome local storage

#### OAuth Configuration Details
- **Authentication Strategy**: Robust dual approach for maximum compatibility
- **Primary Method**: Chrome Identity API (`getAuthToken`) - optimal for Chrome Extension clients
- **Fallback Method**: Web Auth Flow (`launchWebAuthFlow`) - broader compatibility with WEB clients
- **Scopes**: `https://www.googleapis.com/auth/userinfo.profile`, `https://www.googleapis.com/auth/userinfo.email`
- **Client Type**: Supports both Chrome Extension and Google OAuth WEB client configurations
- **Redirect URI**: Handles both Chrome extension and web redirect URI patterns automatically

### Interest Capture
- Background script monitors tab updates
- Content script extracts page data (title, URL, meta description)
- Automatic categorization using keyword matching
- Categories: Technology, Business, Health, Entertainment, Sports, Travel, Food, Science, Education, News

### Data Storage
- All data stored locally using `chrome.storage.local`
- User preferences, interests, and statistics
- No external database required

## Development

### Prerequisites
- Node.js and npm
- Chrome browser

### Scripts
```bash
npm install          # Install dependencies
npm run build        # Build for production
npm run dev          # Build with watch mode
```

### Dependencies
- React: UI framework
- Webpack: Build tool
- Babel: JSX transformation
- Chrome APIs: Extension functionality

## Architecture

### Components
- **App.jsx**: Main routing and state management
- **GoogleSignIn.jsx**: Authentication button with loading states
- **OnboardingFlow.jsx**: 4-step user preference selection
- **Dashboard.jsx**: Interest statistics and data visualization

### Services
- **authService.js**: Google Sign-In and user management
- **interestCaptureService.js**: Interest tracking and categorization

### Styling
- CSS utility classes for rapid development
- Animations using CSS transitions
- Responsive design for 400x600 popup

## Testing

### Manual Testing Steps
1. Load extension in Chrome
2. Click extension icon to open popup
3. Test Google Sign-In flow
4. Complete onboarding preferences
5. Browse different websites
6. Verify interest capture in dashboard
7. Check data persistence across sessions

### Test Scenarios
- Sign in with Google account
- Complete onboarding flow
- Browse technology websites
- Browse news websites  
- Check dashboard statistics
- Verify interest categorization
- Test data persistence

## Troubleshooting

### Common Issues
- **Extension not loading**: Check manifest.json syntax and ensure it's copied to dist folder
- **Google Sign-In failing**: The extension now uses dual authentication - at least one method should work
- **OAuth "Custom scheme URIs" error**: Extension automatically tries both authentication methods
- **"Authorization page could not be loaded"**: This indicates OAuth configuration issues - check Google Console settings
- **Interest not capturing**: Check background script permissions
- **Data not persisting**: Verify storage permissions

### Debug Steps
1. Open Chrome DevTools on extension popup
2. Check background script logs in Extensions page
3. Verify content script injection
4. Test storage API functionality
5. Check OAuth flow in browser console for detailed authentication error messages

### OAuth Configuration Notes
- **Dual Authentication System**: Extension tries both Chrome Identity API and Web Auth Flow
- **Primary Method**: `chrome.identity.getAuthToken()` - works with Chrome Extension OAuth clients
- **Fallback Method**: `chrome.identity.launchWebAuthFlow()` - works with WEB OAuth clients
- **Compatibility**: Works with both Chrome Extension and WEB OAuth client types
- **Error Handling**: Provides detailed error messages to help diagnose OAuth configuration issues
- **Automatic Fallback**: If one method fails, automatically tries the other

### Testing Instructions

#### Quick Test
1. Build the extension: `npm run build`
2. Load the extension in Chrome (`chrome://extensions/` > Developer mode > Load unpacked > select `dist` folder)
3. Click the extension icon and try signing in with Google
4. One of the two authentication methods should work

#### Expected Authentication Flow
- **Success**: User profile loads and dashboard becomes accessible
- **Partial Success**: One method fails but the other works (check console for details)
- **Complete Failure**: Both methods fail (indicates OAuth configuration issues)

#### Authentication Debug Information
The extension provides detailed error messages in the browser console:
- Primary method failures are logged with specific error details
- Fallback method attempts are clearly marked
- OAuth configuration issues are identified with helpful guidance

## Future Enhancements

- Export interest data
- Custom interest categories
- Interest trend analysis
- Privacy controls
- Multi-language support

## License

This project is created for educational purposes as part of the HackHazards hackathon.