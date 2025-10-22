/**
 * @ldesign/i18n - Struct-of-Arrays Message Storage
 * Memory-efficient storage for large-scale applications (10,000+ translation keys)
 */

import type { Locale, Messages } from '../types';

/**
 * SOA Message Store
 * Optimized for memory usage and cache locality
 */
export class SOAMessageStore {
  private keys: string[] = [];                    // All unique keys
  private locales: Locale[] = [];                 // All locales
  private values: (string | undefined)[][] = [];  // [locale][keyIndex]
  private keyIndexMap = new Map<string, number>();
  private localeIndexMap = new Map<Locale, number>();

  /**
   * Add messages for a locale
   */
  addMessages(locale: Locale, messages: Messages): void {
    // Get or create locale index
    let localeIndex = this.localeIndexMap.get(locale);
    if (localeIndex === undefined) {
      localeIndex = this.locales.length;
      this.locales.push(locale);
      this.localeIndexMap.set(locale, localeIndex);
      this.values[localeIndex] = [];
    }

    // Flatten messages and add to storage
    const flattened = this.flattenMessages(messages);

    for (const [key, value] of Object.entries(flattened)) {
      let keyIndex = this.keyIndexMap.get(key);

      if (keyIndex === undefined) {
        // New key - add to all locales
        keyIndex = this.keys.length;
        this.keys.push(key);
        this.keyIndexMap.set(key, keyIndex);

        // Initialize undefined for all existing locales
        for (let i = 0; i < this.values.length; i++) {
          if (this.values[i].length < keyIndex + 1) {
            this.values[i][keyIndex] = undefined;
          }
        }
      }

      // Set value
      this.values[localeIndex][keyIndex] = value as string;
    }
  }

  /**
   * Get translation for a key in a locale
   */
  get(locale: Locale, key: string): string | undefined {
    const localeIndex = this.localeIndexMap.get(locale);
    if (localeIndex === undefined) return undefined;

    const keyIndex = this.keyIndexMap.get(key);
    if (keyIndex === undefined) return undefined;

    return this.values[localeIndex]?.[keyIndex];
  }

  /**
   * Check if locale has a key
   */
  has(locale: Locale, key: string): boolean {
    const localeIndex = this.localeIndexMap.get(locale);
    if (localeIndex === undefined) return false;

    const keyIndex = this.keyIndexMap.get(key);
    if (keyIndex === undefined) return false;

    return this.values[localeIndex]?.[keyIndex] !== undefined;
  }

  /**
   * Get all messages for a locale (reconstructed)
   */
  getMessages(locale: Locale): Messages {
    const localeIndex = this.localeIndexMap.get(locale);
    if (localeIndex === undefined) return {};

    const result: Record<string, string> = {};

    for (let i = 0; i < this.keys.length; i++) {
      const value = this.values[localeIndex]?.[i];
      if (value !== undefined) {
        result[this.keys[i]] = value;
      }
    }

    return this.unflattenMessages(result);
  }

  /**
   * Remove a locale
   */
  removeLocale(locale: Locale): void {
    const localeIndex = this.localeIndexMap.get(locale);
    if (localeIndex === undefined) return;

    // Remove from arrays
    this.locales.splice(localeIndex, 1);
    this.values.splice(localeIndex, 1);

    // Rebuild locale index map
    this.localeIndexMap.clear();
    for (let i = 0; i < this.locales.length; i++) {
      this.localeIndexMap.set(this.locales[i], i);
    }
  }

  /**
   * Get all available locales
   */
  getLocales(): Locale[] {
    return [...this.locales];
  }

  /**
   * Get all keys
   */
  getKeys(): string[] {
    return [...this.keys];
  }

  /**
   * Get memory statistics
   */
  getMemoryStats(): {
    keyCount: number;
    localeCount: number;
    totalValues: number;
    estimatedBytes: number;
  } {
    const keyCount = this.keys.length;
    const localeCount = this.locales.length;
    const totalValues = keyCount * localeCount;

    // Estimate memory usage
    let estimatedBytes = 0;

    // Keys array
    estimatedBytes += this.keys.reduce((sum, key) => sum + key.length * 2, 0);

    // Locales array
    estimatedBytes += this.locales.reduce((sum, loc) => sum + loc.length * 2, 0);

    // Values array (only count defined values)
    for (const localeValues of this.values) {
      for (const value of localeValues) {
        if (value !== undefined) {
          estimatedBytes += value.length * 2;
        }
      }
    }

    // Maps overhead (approximate)
    estimatedBytes += (keyCount + localeCount) * 50;

    return {
      keyCount,
      localeCount,
      totalValues,
      estimatedBytes
    };
  }

  /**
   * Clear all data
   */
  clear(): void {
    this.keys = [];
    this.locales = [];
    this.values = [];
    this.keyIndexMap.clear();
    this.localeIndexMap.clear();
  }

  /**
   * Flatten nested messages to dot notation
   */
  private flattenMessages(messages: Messages, prefix = ''): Record<string, string> {
    const result: Record<string, string> = {};

    for (const [key, value] of Object.entries(messages)) {
      const fullKey = prefix ? `${prefix}.${key}` : key;

      if (typeof value === 'string') {
        result[fullKey] = value;
      } else if (typeof value === 'object' && value !== null) {
        Object.assign(result, this.flattenMessages(value as Messages, fullKey));
      }
    }

    return result;
  }

  /**
   * Unflatten dot notation to nested messages
   */
  private unflattenMessages(flat: Record<string, string>): Messages {
    const result: Messages = {};

    for (const [key, value] of Object.entries(flat)) {
      const parts = key.split('.');
      let current: any = result;

      for (let i = 0; i < parts.length - 1; i++) {
        const part = parts[i];
        if (!(part in current)) {
          current[part] = {};
        }
        current = current[part];
      }

      const lastPart = parts[parts.length - 1];
      current[lastPart] = value;
    }

    return result;
  }

  /**
   * Stop watching
   */
  stop(): void {
    // Clear all reload timers
    for (const timer of this.reloadTimers.values()) {
      clearTimeout(timer);
    }
    this.reloadTimers.clear();

    // Close all watchers
    for (const watcher of this.watchers) {
      try {
        watcher.unwatch();
      } catch (error) {
        console.error('[HotReload] Error unwatching:', error);
      }
    }
    this.watchers = [];
  }

  /**
   * Destroy manager
   */
  destroy(): void {
    this.isDestroyed = true;
    this.stop();
    this.clear();
    this.i18n = undefined;
  }

  /**
   * Debounce reload to prevent rapid successive reloads
   */
  private debounceReload(key: string, callback: () => void): void {
    const existing = this.reloadTimers.get(key);
    if (existing) {
      clearTimeout(existing);
    }

    const timer = setTimeout(() => {
      callback();
      this.reloadTimers.delete(key);
    }, this.config.debounceTime);

    this.reloadTimers.set(key, timer);
  }
}

/**
 * Create SOA message store
 */
export function createSOAMessageStore(): SOAMessageStore {
  return new SOAMessageStore();
}

/**
 * Create hot reload manager
 */
export function createHotReload(config?: HotReloadConfig): HotReloadManager {
  return new HotReloadManager(config);
}


