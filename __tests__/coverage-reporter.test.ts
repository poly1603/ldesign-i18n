/**
 * @ldesign/i18n - Coverage Reporter Tests
 */

import { describe, expect, it, beforeEach } from 'vitest';
import { TranslationCoverageReporter, createCoverageReporter } from '../src/utils/coverage-reporter';

describe('TranslationCoverageReporter', () => {
  let reporter: TranslationCoverageReporter;

  beforeEach(() => {
    reporter = new TranslationCoverageReporter({ enabled: true });
  });

  it('should track missing translations', () => {
    reporter.trackMissing('user.name', 'en');
    reporter.trackMissing('user.email', 'en');

    const stats = reporter.getCoverageStats('en');
    expect(stats.missingKeys).toBe(2);
  });

  it('should track translated keys', () => {
    reporter.trackTranslated('user.name', 'en');
    reporter.trackTranslated('user.email', 'en');

    const stats = reporter.getCoverageStats('en');
    expect(stats.translatedKeys).toBe(2);
  });

  it('should calculate coverage percentage', () => {
    reporter.trackTranslated('key1', 'en');
    reporter.trackTranslated('key2', 'en');
    reporter.trackMissing('key3', 'en');
    reporter.trackMissing('key4', 'en');

    const stats = reporter.getCoverageStats('en');
    expect(stats.coverage).toBe(50); // 2/4 = 50%
  });

  it('should increment count for duplicate missing keys', () => {
    reporter.trackMissing('user.name', 'en');
    reporter.trackMissing('user.name', 'en');
    reporter.trackMissing('user.name', 'en');

    const report = reporter.generateReport(['en']);
    const missing = report.missingTranslations.find(m => m.key === 'user.name');

    expect(missing?.count).toBe(3);
  });

  it('should generate coverage report', () => {
    reporter.trackTranslated('key1', 'en');
    reporter.trackTranslated('key2', 'en');
    reporter.trackMissing('key3', 'zh-CN');

    const report = reporter.generateReport(['en', 'zh-CN']);

    expect(report.locales).toHaveProperty('en');
    expect(report.locales).toHaveProperty('zh-CN');
    expect(report.missingTranslations).toHaveLength(1);
  });

  it('should generate recommendations', () => {
    // Create low coverage scenario
    reporter.trackMissing('key1', 'en');
    reporter.trackMissing('key2', 'en');
    reporter.trackMissing('key3', 'en');
    reporter.trackTranslated('key4', 'en');

    const report = reporter.generateReport(['en']);

    expect(report.recommendations.length).toBeGreaterThan(0);
    expect(report.recommendations[0]).toContain('coverage');
  });

  it('should export as JSON', () => {
    reporter.trackTranslated('key1', 'en');
    reporter.trackMissing('key2', 'en');

    const json = reporter.exportJSON(['en']);
    const parsed = JSON.parse(json);

    expect(parsed).toHaveProperty('locales');
    expect(parsed).toHaveProperty('missingTranslations');
  });

  it('should export as Markdown', () => {
    reporter.trackTranslated('key1', 'en');
    reporter.trackMissing('key2', 'en');

    const markdown = reporter.exportMarkdown(['en']);

    expect(markdown).toContain('# Translation Coverage Report');
    expect(markdown).toContain('Coverage by Locale');
    expect(markdown).toContain('en');
  });

  it('should export missing keys as JSON', () => {
    reporter.trackMissing('user.name', 'zh-CN');
    reporter.trackMissing('user.email', 'zh-CN');

    const json = reporter.exportMissingKeysJSON('zh-CN');
    const parsed = JSON.parse(json);

    expect(parsed).toHaveProperty('user.name');
    expect(parsed).toHaveProperty('user.email');
    expect(parsed['user.name']).toBe('');
  });

  it('should get summary statistics', () => {
    reporter.trackTranslated('key1', 'en');
    reporter.trackTranslated('key2', 'zh-CN');
    reporter.trackMissing('key3', 'fr');

    const summary = reporter.getSummary();

    expect(summary.totalKeys).toBe(3);
    expect(summary.localesTracked).toBe(2); // en and zh-CN
    expect(summary.totalMissing).toBe(1);
  });

  it('should clear all data', () => {
    reporter.trackTranslated('key1', 'en');
    reporter.trackMissing('key2', 'en');

    reporter.clear();

    const summary = reporter.getSummary();
    expect(summary.totalKeys).toBe(0);
    expect(summary.totalMissing).toBe(0);
  });
});

