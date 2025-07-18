// src/content/content.js
// Content script for capturing page data

// Listen for messages from background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'capturePageData') {
    try {
      const pageData = extractPageData();
      
      // Send captured data back to background script
      chrome.runtime.sendMessage({
        action: 'captureInterest',
        data: pageData
      }, (response) => {
        console.log('Interest captured:', response);
      });
      
      sendResponse({ success: true });
    } catch (error) {
      console.error('Error extracting page data:', error);
      sendResponse({ success: false, error: error.message });
    }
  }
  
  return true;
});

// Extract relevant data from the current page
function extractPageData() {
  const url = window.location.href;
  const title = document.title || '';
  
  // Extract text content from the page
  const content = extractTextContent();
  
  return {
    url,
    title,
    content,
    timestamp: Date.now()
  };
}

// Extract meaningful text content from the page
function extractTextContent() {
  // Remove unwanted elements
  const elementsToRemove = [
    'script', 'style', 'nav', 'header', 'footer', 
    'aside', 'menu', 'noscript', 'iframe'
  ];
  
  // Clone the document to avoid modifying the original
  const docClone = document.cloneNode(true);
  
  // Remove unwanted elements
  elementsToRemove.forEach(tagName => {
    const elements = docClone.querySelectorAll(tagName);
    elements.forEach(el => el.remove());
  });
  
  // Extract text from main content areas
  const contentSelectors = [
    'main',
    'article', 
    '[role="main"]',
    '.content',
    '#content',
    '.post',
    '.article',
    'body'
  ];
  
  let textContent = '';
  
  for (const selector of contentSelectors) {
    const element = docClone.querySelector(selector);
    if (element) {
      textContent = element.textContent || element.innerText || '';
      break;
    }
  }
  
  // Fallback to body if no content found
  if (!textContent) {
    textContent = docClone.body?.textContent || docClone.body?.innerText || '';
  }
  
  // Clean up the text
  textContent = textContent
    .replace(/\s+/g, ' ') // Replace multiple whitespace with single space
    .replace(/\n+/g, ' ') // Replace newlines with spaces
    .trim()
    .substring(0, 5000); // Limit length to avoid storage issues
  
  return textContent;
}

// Extract meta information
function extractMetaData() {
  const metaData = {};
  
  // Extract meta description
  const description = document.querySelector('meta[name="description"]');
  if (description) {
    metaData.description = description.getAttribute('content');
  }
  
  // Extract meta keywords
  const keywords = document.querySelector('meta[name="keywords"]');
  if (keywords) {
    metaData.keywords = keywords.getAttribute('content');
  }
  
  // Extract Open Graph data
  const ogTitle = document.querySelector('meta[property="og:title"]');
  if (ogTitle) {
    metaData.ogTitle = ogTitle.getAttribute('content');
  }
  
  const ogDescription = document.querySelector('meta[property="og:description"]');
  if (ogDescription) {
    metaData.ogDescription = ogDescription.getAttribute('content');
  }
  
  const ogType = document.querySelector('meta[property="og:type"]');
  if (ogType) {
    metaData.ogType = ogType.getAttribute('content');
  }
  
  return metaData;
}

// Check if the page is worth capturing
function isPageWorthCapturing() {
  const url = window.location.href;
  
  // Skip certain types of pages
  const skipPatterns = [
    /^chrome:\/\//,
    /^chrome-extension:\/\//,
    /^about:/,
    /^file:\/\//,
    /localhost/,
    /127\.0\.0\.1/,
    /\.(pdf|jpg|jpeg|png|gif|svg|css|js|json|xml)$/i
  ];
  
  for (const pattern of skipPatterns) {
    if (pattern.test(url)) {
      return false;
    }
  }
  
  // Check if page has meaningful content
  const title = document.title || '';
  const bodyText = document.body?.textContent || '';
  
  if (title.length < 3 || bodyText.length < 100) {
    return false;
  }
  
  return true;
}

// Initialize content script
function init() {
  // Only capture if page is worth capturing
  if (!isPageWorthCapturing()) {
    return;
  }
  
  // Wait for page to be fully loaded
  if (document.readyState === 'complete') {
    // Page is already loaded
    console.log('Interest Capture: Content script initialized');
  } else {
    // Wait for page to load
    window.addEventListener('load', () => {
      console.log('Interest Capture: Content script initialized');
    });
  }
}

// Initialize when script loads
init();