// src/services/interestCaptureService.js
// Minimal interest capture service for tracking user interests

class InterestCaptureService {
  constructor() {
    this.interests = new Map();
    this.categories = [
      'technology', 'business', 'sports', 'entertainment', 'health',
      'science', 'education', 'finance', 'travel', 'food',
      'lifestyle', 'news', 'shopping', 'social', 'other'
    ];
    this.initialized = false;
  }

  // Initialize service and load saved data
  async initialize() {
    if (this.initialized) return;
    
    try {
      const result = await new Promise((resolve) => {
        chrome.storage.local.get(['userInterests'], resolve);
      });

      if (result.userInterests) {
        this.interests = new Map(result.userInterests);
      }
      
      this.initialized = true;
      console.log('Interest capture service initialized');
    } catch (error) {
      console.error('Failed to initialize interest capture service:', error);
    }
  }

  // Capture interest from page content
  async captureInterest(url, title, content, category = 'other') {
    try {
      await this.initialize();
      
      // Extract domain for grouping
      const domain = this.extractDomain(url);
      
      // Create interest entry
      const interest = {
        url,
        title,
        domain,
        category: this.categorizeContent(title, content, category),
        timestamp: Date.now(),
        visits: 1
      };

      // Check if we already have this interest
      const key = `${domain}:${title}`;
      if (this.interests.has(key)) {
        const existing = this.interests.get(key);
        existing.visits++;
        existing.timestamp = Date.now();
      } else {
        this.interests.set(key, interest);
      }

      // Save to storage
      await this.saveInterests();
      
      return interest;
    } catch (error) {
      console.error('Failed to capture interest:', error);
      return null;
    }
  }

  // Categorize content based on keywords
  categorizeContent(title, content, fallback = 'other') {
    const text = `${title} ${content}`.toLowerCase();
    
    const categoryKeywords = {
      technology: ['tech', 'software', 'computer', 'programming', 'code', 'developer', 'ai', 'machine learning'],
      business: ['business', 'startup', 'entrepreneur', 'investment', 'marketing', 'sales', 'revenue'],
      sports: ['sports', 'football', 'basketball', 'soccer', 'tennis', 'game', 'team', 'player'],
      entertainment: ['movie', 'music', 'game', 'celebrity', 'film', 'tv', 'show', 'entertainment'],
      health: ['health', 'fitness', 'medical', 'diet', 'exercise', 'wellness', 'doctor'],
      science: ['science', 'research', 'study', 'discovery', 'experiment', 'scientific'],
      education: ['education', 'learning', 'course', 'university', 'school', 'student', 'study'],
      finance: ['finance', 'money', 'investment', 'stock', 'market', 'economy', 'financial'],
      travel: ['travel', 'vacation', 'trip', 'destination', 'hotel', 'flight', 'tourism'],
      food: ['food', 'recipe', 'restaurant', 'cooking', 'meal', 'cuisine', 'chef'],
      lifestyle: ['lifestyle', 'fashion', 'beauty', 'home', 'design', 'culture'],
      news: ['news', 'breaking', 'report', 'update', 'headline', 'current'],
      shopping: ['shop', 'buy', 'product', 'price', 'sale', 'discount', 'store'],
      social: ['social', 'community', 'forum', 'discussion', 'share', 'connect']
    };

    // Find best matching category
    let bestCategory = fallback;
    let maxMatches = 0;

    for (const [category, keywords] of Object.entries(categoryKeywords)) {
      const matches = keywords.filter(keyword => text.includes(keyword)).length;
      if (matches > maxMatches) {
        maxMatches = matches;
        bestCategory = category;
      }
    }

    return bestCategory;
  }

  // Extract domain from URL
  extractDomain(url) {
    try {
      const domain = new URL(url).hostname;
      return domain.replace(/^www\./, '');
    } catch {
      return 'unknown';
    }
  }

  // Get all captured interests
  async getInterests() {
    await this.initialize();
    return Array.from(this.interests.values());
  }

  // Get interests by category
  async getInterestsByCategory(category) {
    await this.initialize();
    return Array.from(this.interests.values()).filter(interest => 
      interest.category === category
    );
  }

  // Get interest statistics
  async getInterestStats() {
    await this.initialize();
    const interests = Array.from(this.interests.values());
    
    const stats = {
      total: interests.length,
      categories: {},
      domains: {},
      recent: interests.filter(i => Date.now() - i.timestamp < 7 * 24 * 60 * 60 * 1000).length
    };

    interests.forEach(interest => {
      // Category stats
      stats.categories[interest.category] = (stats.categories[interest.category] || 0) + 1;
      
      // Domain stats
      stats.domains[interest.domain] = (stats.domains[interest.domain] || 0) + 1;
    });

    return stats;
  }

  // Clear all interests
  async clearInterests() {
    this.interests.clear();
    await this.saveInterests();
  }

  // Save interests to storage
  async saveInterests() {
    try {
      await new Promise((resolve) => {
        chrome.storage.local.set({
          userInterests: Array.from(this.interests.entries())
        }, resolve);
      });
    } catch (error) {
      console.error('Failed to save interests:', error);
    }
  }

  // Get top interests
  async getTopInterests(limit = 10) {
    await this.initialize();
    return Array.from(this.interests.values())
      .sort((a, b) => b.visits - a.visits)
      .slice(0, limit);
  }

  // Get recent interests
  async getRecentInterests(limit = 10) {
    await this.initialize();
    return Array.from(this.interests.values())
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit);
  }
}

// Export singleton instance
export default new InterestCaptureService();