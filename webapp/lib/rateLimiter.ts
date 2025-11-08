/**
 * Rate Limiter with exponential backoff and request queuing
 * Protects against hitting public API rate limits
 */

interface RateLimitConfig {
  maxRequestsPerMinute: number;
  minRequestInterval: number; // milliseconds between requests
  maxRetries: number;
  initialBackoff: number; // milliseconds
}

interface QueuedRequest<T> {
  fn: () => Promise<T>;
  resolve: (value: T) => void;
  reject: (error: any) => void;
  retries: number;
  apiName: string;
}

class RateLimiter {
  private requestTimestamps: Map<string, number[]> = new Map();
  private queue: QueuedRequest<any>[] = [];
  private isProcessing = false;
  private configs: Map<string, RateLimitConfig> = new Map();

  constructor() {
    // Conservative defaults for public APIs
    this.setConfig('geckoterminal', {
      maxRequestsPerMinute: 60, // Very conservative
      minRequestInterval: 1000, // 1 second between requests
      maxRetries: 3,
      initialBackoff: 2000,
    });

    this.setConfig('jupiter', {
      maxRequestsPerMinute: 60,
      minRequestInterval: 1000,
      maxRetries: 3,
      initialBackoff: 2000,
    });

    this.setConfig('dexscreener', {
      maxRequestsPerMinute: 60,
      minRequestInterval: 1000,
      maxRetries: 3,
      initialBackoff: 2000,
    });
  }

  setConfig(apiName: string, config: RateLimitConfig) {
    this.configs.set(apiName, config);
  }

  private getConfig(apiName: string): RateLimitConfig {
    return this.configs.get(apiName) || {
      maxRequestsPerMinute: 60,
      minRequestInterval: 1000,
      maxRetries: 3,
      initialBackoff: 2000,
    };
  }

  private cleanOldTimestamps(apiName: string) {
    const now = Date.now();
    const timestamps = this.requestTimestamps.get(apiName) || [];
    const oneMinuteAgo = now - 60000;

    // Keep only timestamps from the last minute
    const recentTimestamps = timestamps.filter(ts => ts > oneMinuteAgo);
    this.requestTimestamps.set(apiName, recentTimestamps);
  }

  private canMakeRequest(apiName: string): boolean {
    this.cleanOldTimestamps(apiName);
    const config = this.getConfig(apiName);
    const timestamps = this.requestTimestamps.get(apiName) || [];

    if (timestamps.length >= config.maxRequestsPerMinute) {
      return false;
    }

    // Check minimum interval
    if (timestamps.length > 0) {
      const lastRequest = timestamps[timestamps.length - 1];
      const timeSinceLastRequest = Date.now() - lastRequest;
      if (timeSinceLastRequest < config.minRequestInterval) {
        return false;
      }
    }

    return true;
  }

  private recordRequest(apiName: string) {
    const timestamps = this.requestTimestamps.get(apiName) || [];
    timestamps.push(Date.now());
    this.requestTimestamps.set(apiName, timestamps);
  }

  private async sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private async processQueue() {
    if (this.isProcessing || this.queue.length === 0) {
      return;
    }

    this.isProcessing = true;

    while (this.queue.length > 0) {
      const request = this.queue[0];
      const config = this.getConfig(request.apiName);

      // Wait until we can make a request
      while (!this.canMakeRequest(request.apiName)) {
        await this.sleep(config.minRequestInterval);
      }

      // Remove from queue and execute
      this.queue.shift();
      this.recordRequest(request.apiName);

      try {
        const result = await request.fn();
        request.resolve(result);
      } catch (error: any) {
        // Check if it's a rate limit error (429)
        const isRateLimitError =
          error?.status === 429 ||
          error?.message?.toLowerCase().includes('rate limit');

        if (isRateLimitError && request.retries < config.maxRetries) {
          // Exponential backoff
          const backoffTime = config.initialBackoff * Math.pow(2, request.retries);
          console.warn(`Rate limit hit for ${request.apiName}, retrying in ${backoffTime}ms...`);

          await this.sleep(backoffTime);

          // Re-queue with incremented retry count
          this.queue.unshift({
            ...request,
            retries: request.retries + 1,
          });
        } else {
          request.reject(error);
        }
      }
    }

    this.isProcessing = false;
  }

  async execute<T>(
    apiName: string,
    fn: () => Promise<T>,
    priority: boolean = false
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      const request: QueuedRequest<T> = {
        fn,
        resolve,
        reject,
        retries: 0,
        apiName,
      };

      if (priority) {
        this.queue.unshift(request);
      } else {
        this.queue.push(request);
      }

      this.processQueue();
    });
  }

  // Get current queue status for debugging/monitoring
  getStatus(apiName?: string) {
    if (apiName) {
      this.cleanOldTimestamps(apiName);
      const timestamps = this.requestTimestamps.get(apiName) || [];
      const config = this.getConfig(apiName);
      return {
        requestsInLastMinute: timestamps.length,
        maxRequests: config.maxRequestsPerMinute,
        queueLength: this.queue.filter(r => r.apiName === apiName).length,
      };
    }

    return {
      totalQueueLength: this.queue.length,
      apis: Array.from(this.configs.keys()).map(api => ({
        name: api,
        ...this.getStatus(api),
      })),
    };
  }
}

// Singleton instance
export const rateLimiter = new RateLimiter();

// Helper function to determine API from URL
export function getApiNameFromUrl(url: string): string {
  if (url.includes('geckoterminal.com')) return 'geckoterminal';
  if (url.includes('jup.ag')) return 'jupiter';
  if (url.includes('dexscreener.com')) return 'dexscreener';
  return 'default';
}
