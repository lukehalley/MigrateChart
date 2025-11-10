/**
 * Safe localStorage utilities with error handling
 * Handles quota exceeded, disabled localStorage (private browsing), and JSON parsing errors
 */

export class SafeStorage {
  /**
   * Safely get an item from localStorage
   * Returns null if localStorage is unavailable or key doesn't exist
   */
  static getItem(key: string): string | null {
    if (typeof window === 'undefined') return null;

    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.warn(`localStorage.getItem failed for key "${key}":`, error);
      return null;
    }
  }

  /**
   * Safely set an item in localStorage
   * Returns true if successful, false otherwise
   */
  static setItem(key: string, value: string): boolean {
    if (typeof window === 'undefined') return false;

    try {
      localStorage.setItem(key, value);
      return true;
    } catch (error) {
      // Handle quota exceeded error
      if (error instanceof DOMException && error.name === 'QuotaExceededError') {
        console.warn(`localStorage quota exceeded when setting key "${key}"`);
      } else {
        console.warn(`localStorage.setItem failed for key "${key}":`, error);
      }
      return false;
    }
  }

  /**
   * Safely remove an item from localStorage
   * Returns true if successful, false otherwise
   */
  static removeItem(key: string): boolean {
    if (typeof window === 'undefined') return false;

    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.warn(`localStorage.removeItem failed for key "${key}":`, error);
      return false;
    }
  }

  /**
   * Safely get and parse a JSON item from localStorage
   * Returns null if localStorage is unavailable, key doesn't exist, or JSON is invalid
   */
  static getJSON<T>(key: string): T | null {
    const item = this.getItem(key);
    if (item === null) return null;

    try {
      return JSON.parse(item) as T;
    } catch (error) {
      console.warn(`JSON.parse failed for localStorage key "${key}":`, error);
      // Remove corrupted data
      this.removeItem(key);
      return null;
    }
  }

  /**
   * Safely stringify and save a JSON item to localStorage
   * Returns true if successful, false otherwise
   */
  static setJSON<T>(key: string, value: T): boolean {
    try {
      const serialized = JSON.stringify(value);
      return this.setItem(key, serialized);
    } catch (error) {
      console.warn(`JSON.stringify failed for localStorage key "${key}":`, error);
      return false;
    }
  }

  /**
   * Check if localStorage is available and working
   */
  static isAvailable(): boolean {
    if (typeof window === 'undefined') return false;

    try {
      const testKey = '__localStorage_test__';
      localStorage.setItem(testKey, 'test');
      localStorage.removeItem(testKey);
      return true;
    } catch {
      return false;
    }
  }
}
