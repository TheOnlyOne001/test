// src/background/background.js
// Background script for the Chrome extension

import interestCaptureService from '../services/interestCaptureService.js';

// Initialize the extension
chrome.runtime.onInstalled.addListener(() => {
  console.log('Interest Capture Extension installed');
  
  // Initialize interest capture service
  interestCaptureService.initialize();
});

// Listen for tab updates to capture interests
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  // Only process when the tab is completely loaded
  if (changeInfo.status === 'complete' && tab.url) {
    // Skip chrome:// and extension pages
    if (tab.url.startsWith('chrome://') || tab.url.startsWith('chrome-extension://')) {
      return;
    }

    try {
      // Get user preferences
      const result = await chrome.storage.local.get(['userPreferences']);
      const preferences = result.userPreferences || { autoCapture: true };

      // Only capture if auto-capture is enabled
      if (preferences.autoCapture) {
        // Inject content script to get page content
        await chrome.scripting.executeScript({
          target: { tabId: tabId },
          files: ['content.js']
        });

        // Send message to content script to capture page data
        chrome.tabs.sendMessage(tabId, { action: 'capturePageData' });
      }
    } catch (error) {
      console.error('Error capturing interest:', error);
    }
  }
});

// Listen for messages from content script
chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
  if (request.action === 'captureInterest') {
    try {
      const interest = await interestCaptureService.captureInterest(
        request.data.url,
        request.data.title,
        request.data.content,
        request.data.category
      );
      
      sendResponse({ success: true, interest });
    } catch (error) {
      console.error('Error capturing interest:', error);
      sendResponse({ success: false, error: error.message });
    }
  }
  
  return true; // Keep the message channel open for async response
});

// Handle extension icon click
chrome.action.onClicked.addListener((tab) => {
  // The popup will handle this, but we can add additional logic here if needed
  console.log('Extension icon clicked');
});