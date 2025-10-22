/**
 * @ldesign/i18n - Translation Coverage Reporter
 * Tracks missing translations and generates coverage reports for development
 */

import type { Locale, MessageKey } from '../types';

/**
 * Missing translation record
 */
export interface MissingTranslation {
  key: MessageKey;
  locale: Locale;
  timestamp: number;
  count: number;
  stack?: string;
}

/**
 * Coverage statistics
 */
export interface CoverageStats {
  locale: Locale;
  totalKeys: number;
  translatedKeys: number;
  missingKeys: number;
  coverage: number; // Percentage
}

/**
 * Coverage report
 */
export interface CoverageReport {
  timestamp: Date;
  locales: Record<Locale, CoverageStats>;
  missingTranslations: MissingTranslation[];
  recommendations: string[];
}

/**
 * Translation Coverage Reporter
 * Tracks and reports on translation coverage
 */
export class TranslationCoverageReporter {
  private readonly missingKeys = new Map<string, MissingTranslation>();
  private readonly allKeys = new Set<MessageKey>();
  private readonly translatedKeys = new Map<Locale, Set<MessageKey>>();
  private readonly enabled: boolean;

  constructor(options: { enabled?: boolean } = {}) {
    this.enabled = options.enabled !== false && (
      typeof process !== 'undefined' && process.env.NODE_ENV === 'development'
    );
  }

  /**
   * Track a missing translation
   */
  trackMissing(key: MessageKey, locale: Locale, stack?: string): void {
    if (!this.enabled) return;

    const cacheKey = `${locale}:${key}`;
    const existing = this.missingKeys.get(cacheKey);

    if (existing) {
      existing.count++;
      existing.timestamp = Date.now();
    } else {
      this.missingKeys.set(cacheKey, {
        key,
        locale,
        timestamp: Date.now(),
        count: 1,
        stack: this.enabled ? this.captureStack() : undefined
      });
    }

    this.allKeys.add(key);
  }

  /**
   * Track a translated key
   */
  trackTranslated(key: MessageKey, locale: Locale): void {
    if (!this.enabled) return;

    if (!this.translatedKeys.has(locale)) {
      this.translatedKeys.set(locale, new Set());
    }

    this.translatedKeys.get(locale)!.add(key);
    this.allKeys.add(key);
  }

  /**
   * Get coverage statistics for a locale
   */
  getCoverageStats(locale: Locale): CoverageStats {
    const translated = this.translatedKeys.get(locale) || new Set();
    const missing = Array.from(this.missingKeys.values())
      .filter(m => m.locale === locale);

    const totalKeys = this.allKeys.size;
    const translatedKeys = translated.size;
    const missingKeys = missing.length;

    return {
      locale,
      totalKeys,
      translatedKeys,
      missingKeys,
      coverage: totalKeys > 0 ? (translatedKeys / totalKeys) * 100 : 0
    };
  }

  /**
   * Generate a coverage report
   */
  generateReport(locales: Locale[]): CoverageReport {
    const report: CoverageReport = {
      timestamp: new Date(),
      locales: {},
      missingTranslations: Array.from(this.missingKeys.values()),
      recommendations: []
    };

    for (const locale of locales) {
      report.locales[locale] = this.getCoverageStats(locale);
    }

    // Generate recommendations
    report.recommendations = this.generateRecommendations(report.locales);

    return report;
  }

  /**
   * Generate recommendations based on coverage
   */
  private generateRecommendations(locales: Record<Locale, CoverageStats>): string[] {
    const recommendations: string[] = [];

    for (const [locale, stats] of Object.entries(locales)) {
      if (stats.coverage < 50) {
        recommendations.push(
          `Critical: Locale "${locale}" has only ${stats.coverage.toFixed(1)}% coverage (${stats.translatedKeys}/${stats.totalKeys} keys)`
        );
      } else if (stats.coverage < 80) {
        recommendations.push(
          `Warning: Locale "${locale}" has ${stats.coverage.toFixed(1)}% coverage (${stats.missingKeys} missing keys)`
        );
      } else if (stats.coverage < 100) {
        recommendations.push(
          `Info: Locale "${locale}" is almost complete - ${stats.missingKeys} keys remaining`
        );
      }
    }

    // Find frequently missing keys
    const frequentlyMissing = Array.from(this.missingKeys.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    if (frequentlyMissing.length > 0) {
      recommendations.push(
        `High priority keys to translate: ${frequentlyMissing.map(m => `"${m.key}" (${m.count} requests)`).join(', ')}`
      );
    }

    return recommendations;
  }

  /**
   * Export report as JSON
   */
  exportJSON(locales: Locale[]): string {
    const report = this.generateReport(locales);
    return JSON.stringify(report, null, 2);
  }

  /**
   * Export report as Markdown
   */
  exportMarkdown(locales: Locale[]): string {
    const report = this.generateReport(locales);
    const lines: string[] = [];

    lines.push('# Translation Coverage Report');
    lines.push(`\nGenerated: ${report.timestamp.toISOString()}\n`);

    lines.push('## Coverage by Locale\n');
    lines.push('| Locale | Coverage | Translated | Missing | Total |');
    lines.push('|--------|----------|------------|---------|-------|');

    for (const [locale, stats] of Object.entries(report.locales)) {
      lines.push(
        `| ${locale} | ${stats.coverage.toFixed(1)}% | ${stats.translatedKeys} | ${stats.missingKeys} | ${stats.totalKeys} |`
      );
    }

    if (report.recommendations.length > 0) {
      lines.push('\n## Recommendations\n');
      for (const rec of report.recommendations) {
        lines.push(`- ${rec}`);
      }
    }

    if (report.missingTranslations.length > 0) {
      lines.push('\n## Missing Translations\n');

      // Group by locale
      const byLocale = new Map<Locale, MissingTranslation[]>();
      for (const missing of report.missingTranslations) {
        if (!byLocale.has(missing.locale)) {
          byLocale.set(missing.locale, []);
        }
        byLocale.get(missing.locale)!.push(missing);
      }

      for (const [locale, missing] of byLocale) {
        lines.push(`\n### ${locale}\n`);
        for (const m of missing.slice(0, 20)) {  // Limit to top 20
          lines.push(`- \`${m.key}\` (${m.count} requests)`);
        }

        if (missing.length > 20) {
          lines.push(`\n_... and ${missing.length - 20} more_`);
        }
      }
    }

    return lines.join('\n');
  }

  /**
   * Export missing keys as JSON for translation tools
   */
  exportMissingKeysJSON(locale: Locale): string {
    const missing = Array.from(this.missingKeys.values())
      .filter(m => m.locale === locale)
      .map(m => m.key);

    const result: Record<string, string> = {};
    for (const key of missing) {
      result[key] = ''; // Empty string for translator to fill
    }

    return JSON.stringify(result, null, 2);
  }

  /**
   * Capture stack trace
   */
  private captureStack(): string | undefined {
    if (typeof Error.captureStackTrace === 'function') {
      const obj: any = {};
      Error.captureStackTrace(obj, this.trackMissing);
      return obj.stack;
    }

    try {
      throw new Error();
    } catch (e: any) {
      return e.stack;
    }
  }

  /**
   * Clear all tracked data
   */
  clear(): void {
    this.missingKeys.clear();
    this.allKeys.clear();
    this.translatedKeys.clear();
  }

  /**
   * Get statistics summary
   */
  getSummary(): {
    totalKeys: number;
    localesTracked: number;
    totalMissing: number;
  } {
    return {
      totalKeys: this.allKeys.size,
      localesTracked: this.translatedKeys.size,
      totalMissing: this.missingKeys.size
    };
  }
}

/**
 * Create a coverage reporter
 */
export function createCoverageReporter(options?: { enabled?: boolean }): TranslationCoverageReporter {
  return new TranslationCoverageReporter(options);
}


