/*!
 * ***********************************
 * @ldesign/i18n v3.0.0            *
 * Built with rollup               *
 * Build time: 2024-10-21 14:33:23 *
 * Build mode: production          *
 * Minified: No                    *
 * ***********************************
 */
import { OptimizedI18n } from './i18n-optimized.js';
export { FastCacheKeyBuilder, ObjectPool } from './i18n-optimized.js';
export { AdvancedFormatter, clearFormatterCache, createAdvancedFormatter } from './advanced-formatter.js';
export { LRUCache, MultiTierCache, StorageCache, WeakCache, createCache } from './cache.js';
export { InterpolationEngine } from './interpolation.js';
export { LazyLoader, createLazyLoader } from './lazy-loader.js';
export { PluralizationEngine } from './pluralization.js';

function createI18n(config) {
  const instance = new OptimizedI18n(config || {});
  if (config?.messages) {
    instance.init().catch((err) => {
      console.error("Failed to initialize i18n:", err);
    });
  }
  return instance;
}

export { OptimizedI18n as I18n, OptimizedI18n, createI18n };
/*! End of @ldesign/i18n | Powered by @ldesign/builder */
//# sourceMappingURL=index.js.map
