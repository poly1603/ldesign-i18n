/**
 * @ldesign/i18n - Pipeline Formatter
 * Supports chained variable transformations with pipe syntax
 * e.g., {{name | capitalize | truncate:20}}
 */

import type { Locale } from '../types';

/**
 * Pipe function type
 */
export type PipeFunction = (value: any, ...args: string[]) => any;

/**
 * Built-in pipes
 */
const BUILT_IN_PIPES: Record<string, PipeFunction> = {
  // String pipes
  uppercase: (value: string) => String(value).toUpperCase(),
  lowercase: (value: string) => String(value).toLowerCase(),
  capitalize: (value: string) => {
    const str = String(value);
    return str.charAt(0).toUpperCase() + str.slice(1);
  },
  title: (value: string) => {
    return String(value).replace(/\w\S*/g, txt =>
      txt.charAt(0).toUpperCase() + txt.slice(1).toLowerCase()
    );
  },
  trim: (value: string) => String(value).trim(),
  truncate: (value: string, length: string = '50', suffix: string = '...') => {
    const str = String(value);
    const maxLength = parseInt(length, 10);
    return str.length > maxLength ? str.slice(0, maxLength) + suffix : str;
  },

  // Number pipes
  number: (value: number, locale?: string) => {
    return new Intl.NumberFormat(locale).format(Number(value));
  },
  currency: (value: number, currency: string = 'USD', locale?: string) => {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency
    }).format(Number(value));
  },
  percent: (value: number, locale?: string) => {
    return new Intl.NumberFormat(locale, {
      style: 'percent',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(Number(value));
  },

  // Date pipes
  date: (value: Date | string | number, format: string = 'short', locale?: string) => {
    const date = value instanceof Date ? value : new Date(value);
    return new Intl.DateTimeFormat(locale, { dateStyle: format as any }).format(date);
  },
  time: (value: Date | string | number, format: string = 'short', locale?: string) => {
    const date = value instanceof Date ? value : new Date(value);
    return new Intl.DateTimeFormat(locale, { timeStyle: format as any }).format(date);
  },
  relative: (value: Date | string | number, locale?: string) => {
    const date = value instanceof Date ? value : new Date(value);
    const now = new Date();
    const diffInSeconds = Math.floor((date.getTime() - now.getTime()) / 1000);

    const units: [Intl.RelativeTimeFormatUnit, number][] = [
      ['year', 60 * 60 * 24 * 365],
      ['month', 60 * 60 * 24 * 30],
      ['day', 60 * 60 * 24],
      ['hour', 60 * 60],
      ['minute', 60],
      ['second', 1]
    ];

    for (const [unit, secondsInUnit] of units) {
      if (Math.abs(diffInSeconds) >= secondsInUnit) {
        const val = Math.floor(diffInSeconds / secondsInUnit);
        return new Intl.RelativeTimeFormat(locale, { numeric: 'auto' }).format(val, unit);
      }
    }

    return new Intl.RelativeTimeFormat(locale, { numeric: 'auto' }).format(0, 'second');
  },

  // Array pipes
  join: (value: any[], separator: string = ', ') => {
    return Array.isArray(value) ? value.join(separator) : String(value);
  },
  list: (value: any[], type: string = 'conjunction', locale?: string) => {
    if (!Array.isArray(value)) return String(value);
    if (typeof (Intl as any).ListFormat !== 'undefined') {
      return new (Intl as any).ListFormat(locale, { type }).format(value);
    }
    return value.join(', ');
  },
  first: (value: any[], count?: string) => {
    if (!Array.isArray(value)) return value;
    const n = count ? parseInt(count, 10) : 1;
    return n === 1 ? value[0] : value.slice(0, n);
  },
  last: (value: any[], count?: string) => {
    if (!Array.isArray(value)) return value;
    const n = count ? parseInt(count, 10) : 1;
    return n === 1 ? value[value.length - 1] : value.slice(-n);
  },
  limit: (value: any[], count: string = '10') => {
    if (!Array.isArray(value)) return value;
    return value.slice(0, parseInt(count, 10));
  },

  // Utility pipes
  default: (value: any, defaultValue: string = '') => {
    return value == null || value === '' ? defaultValue : value;
  },
  json: (value: any) => {
    try {
      return JSON.stringify(value);
    } catch {
      return String(value);
    }
  }
};

/**
 * Pipeline Formatter
 * Processes chained transformations on interpolation values
 */
export class PipelineFormatter {
  private readonly pipes = new Map<string, PipeFunction>();
  private readonly cache = new Map<string, PipeFunction[]>();
  private readonly MAX_CACHE_SIZE = 500;

  constructor() {
    // Register built-in pipes
    for (const [name, fn] of Object.entries(BUILT_IN_PIPES)) {
      this.pipes.set(name, fn);
    }
  }

  /**
   * Register a custom pipe
   */
  registerPipe(name: string, fn: PipeFunction): void {
    this.pipes.set(name, fn);
    this.cache.clear(); // Clear cache when pipes change
  }

  /**
   * Unregister a pipe
   */
  unregisterPipe(name: string): void {
    this.pipes.delete(name);
    this.cache.clear();
  }

  /**
   * Format value through pipeline
   * @param value - The value to format
   * @param pipeline - Pipe chain e.g., "capitalize | truncate:20"
   * @param locale - Current locale
   */
  format(value: any, pipeline: string, locale?: Locale): any {
    if (!pipeline || !pipeline.trim()) {
      return value;
    }

    // Get compiled pipeline
    const pipes = this.compilePipeline(pipeline);

    // Apply pipes in sequence
    let result = value;
    for (const { name, args } of pipes) {
      const pipe = this.pipes.get(name);
      if (pipe) {
        try {
          result = pipe(result, ...args, locale);
        } catch (error) {
          console.error(`[@ldesign/i18n] Error in pipe "${name}":`, error);
          return value; // Return original value on error
        }
      } else {
        console.warn(`[@ldesign/i18n] Unknown pipe: "${name}"`);
      }
    }

    return result;
  }

  /**
   * Compile pipeline string into pipe functions
   */
  private compilePipeline(pipeline: string): Array<{ name: string; args: string[] }> {
    // Check cache
    const cached = this.cache.get(pipeline);
    if (cached) {
      return cached as any;
    }

    // Parse pipeline
    const pipes: Array<{ name: string; args: string[] }> = [];
    const parts = pipeline.split('|');

    for (const part of parts) {
      const trimmed = part.trim();
      if (!trimmed) continue;

      // Parse pipe name and arguments
      const colonIndex = trimmed.indexOf(':');
      if (colonIndex === -1) {
        pipes.push({ name: trimmed, args: [] });
      } else {
        const name = trimmed.slice(0, colonIndex).trim();
        const argsStr = trimmed.slice(colonIndex + 1);
        const args = argsStr.split(':').map(a => a.trim());
        pipes.push({ name, args });
      }
    }

    // Cache with size limit
    if (this.cache.size >= this.MAX_CACHE_SIZE) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey !== undefined) {
        this.cache.delete(firstKey);
      }
    }

    this.cache.set(pipeline, pipes as any);
    return pipes;
  }

  /**
   * Check if a pipe exists
   */
  hasPipe(name: string): boolean {
    return this.pipes.has(name);
  }

  /**
   * Get all registered pipe names
   */
  getPipeNames(): string[] {
    return Array.from(this.pipes.keys());
  }

  /**
   * Clear pipeline cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { size: number; maxSize: number } {
    return {
      size: this.cache.size,
      maxSize: this.MAX_CACHE_SIZE
    };
  }
}

/**
 * Create a pipeline formatter
 */
export function createPipelineFormatter(): PipelineFormatter {
  return new PipelineFormatter();
}


