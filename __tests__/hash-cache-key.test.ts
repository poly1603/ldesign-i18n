/**
 * @ldesign/i18n - Hash Cache Key Tests
 */

import { describe, expect, it } from 'vitest';
import { HashCacheKey, HybridCacheKey } from '../src/utils/hash-cache-key';

describe('HashCacheKey', () => {
  it('should generate consistent hashes for same inputs', () => {
    const hash1 = HashCacheKey.generate('en', 'user.name', 'app');
    const hash2 = HashCacheKey.generate('en', 'user.name', 'app');

    expect(hash1).toBe(hash2);
  });

  it('should generate different hashes for different locales', () => {
    const hash1 = HashCacheKey.generate('en', 'user.name', 'app');
    const hash2 = HashCacheKey.generate('zh-CN', 'user.name', 'app');

    expect(hash1).not.toBe(hash2);
  });

  it('should generate different hashes for different keys', () => {
    const hash1 = HashCacheKey.generate('en', 'user.name', 'app');
    const hash2 = HashCacheKey.generate('en', 'user.email', 'app');

    expect(hash1).not.toBe(hash2);
  });

  it('should handle optional parameters', () => {
    const hash1 = HashCacheKey.generate('en', 'user.name');
    const hash2 = HashCacheKey.generate('en', 'user.name', undefined);

    expect(hash1).toBe(hash2);
  });

  it('should handle count parameter', () => {
    const hash1 = HashCacheKey.generate('en', 'items', 'app', 1);
    const hash2 = HashCacheKey.generate('en', 'items', 'app', 5);

    expect(hash1).not.toBe(hash2);
  });

  it('should hash params object consistently', () => {
    const params1 = { name: 'John', age: 30 };
    const params2 = { age: 30, name: 'John' }; // Different order

    const hash1 = HashCacheKey.hashParams(params1);
    const hash2 = HashCacheKey.hashParams(params2);

    expect(hash1).toBe(hash2); // Should be same (keys sorted)
  });

  it('should return unsigned 32-bit integer', () => {
    const hash = HashCacheKey.generate('en', 'key');

    expect(typeof hash).toBe('number');
    expect(hash).toBeGreaterThanOrEqual(0);
    expect(hash).toBeLessThanOrEqual(0xFFFFFFFF);
  });
});

describe('HybridCacheKey', () => {
  it('should return number in production mode', () => {
    // Mock production
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';

    const key = HybridCacheKey.generate('en', 'user.name');

    expect(typeof key).toBe('number');

    process.env.NODE_ENV = originalEnv;
  });

  it('should return string in development mode', () => {
    // Mock development
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';

    const key = HybridCacheKey.generate('en', 'user.name');

    expect(typeof key).toBe('string');
    expect(key).toContain('en');
    expect(key).toContain('user.name');

    process.env.NODE_ENV = originalEnv;
  });
});

