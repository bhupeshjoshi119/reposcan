// Rate limit handler for GitHub API
class RateLimitHandler {
  private lastRequestTime = 0;
  private requestCount = 0;
  private resetTime = 0;
  private readonly minInterval = 100; // Minimum 100ms between requests

  // Check if we can make a request
  canMakeRequest(): boolean {
    const now = Date.now();
    
    // Reset counter if reset time has passed
    if (now > this.resetTime) {
      this.requestCount = 0;
      this.resetTime = now + 60000; // Reset every minute
    }

    // Check if we've exceeded rate limits
    if (this.requestCount >= 60) { // GitHub allows 60 requests per minute for authenticated users
      return false;
    }

    // Check minimum interval
    if (now - this.lastRequestTime < this.minInterval) {
      return false;
    }

    return true;
  }

  // Record a request
  recordRequest(): void {
    this.lastRequestTime = Date.now();
    this.requestCount++;
  }

  // Get time until next request is allowed
  getTimeUntilNextRequest(): number {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    
    if (timeSinceLastRequest < this.minInterval) {
      return this.minInterval - timeSinceLastRequest;
    }

    if (this.requestCount >= 60) {
      return this.resetTime - now;
    }

    return 0;
  }

  // Wait until next request is allowed
  async waitForNextRequest(): Promise<void> {
    const waitTime = this.getTimeUntilNextRequest();
    if (waitTime > 0) {
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }

  // Handle rate limit response from GitHub
  handleRateLimitResponse(headers: Headers): void {
    const remaining = headers.get('x-ratelimit-remaining');
    const reset = headers.get('x-ratelimit-reset');
    
    if (remaining) {
      this.requestCount = 60 - parseInt(remaining);
    }
    
    if (reset) {
      this.resetTime = parseInt(reset) * 1000; // Convert to milliseconds
    }
  }
}

export const rateLimitHandler = new RateLimitHandler();

// Enhanced fetch with rate limiting
export async function rateLimitedFetch(url: string, options?: RequestInit): Promise<Response> {
  // Wait if necessary
  await rateLimitHandler.waitForNextRequest();
  
  // Record the request
  rateLimitHandler.recordRequest();
  
  // Make the request
  const response = await fetch(url, options);
  
  // Handle rate limit headers
  if (response.headers) {
    rateLimitHandler.handleRateLimitResponse(response.headers);
  }
  
  // If we hit rate limit, wait and retry once
  if (response.status === 403 && response.headers.get('x-ratelimit-remaining') === '0') {
    const resetTime = response.headers.get('x-ratelimit-reset');
    if (resetTime) {
      const waitTime = (parseInt(resetTime) * 1000) - Date.now();
      if (waitTime > 0 && waitTime < 300000) { // Don't wait more than 5 minutes
        console.log(`Rate limited. Waiting ${Math.ceil(waitTime / 1000)} seconds...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
        
        // Retry the request
        rateLimitHandler.recordRequest();
        return fetch(url, options);
      }
    }
  }
  
  return response;
}