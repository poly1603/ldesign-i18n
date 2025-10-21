/*!
 * ***********************************
 * @ldesign/i18n v3.0.0            *
 * Built with rollup               *
 * Build time: 2024-10-21 14:33:23 *
 * Build mode: production          *
 * Minified: No                    *
 * ***********************************
 */
'use strict';

var cache = require('../core/cache.cjs');
var interpolation = require('../core/interpolation.cjs');
var pluralization = require('../core/pluralization.cjs');

async function lazyLoadPlugin(pluginName) {
  console.warn(`Plugin ${pluginName} is not yet implemented`);
  return Promise.resolve(null);
}
const FEATURES = {
  // Core features (always included)
  CORE: true,
  INTERPOLATION: true,
  PLURALIZATION: true,
  // Optional features (enabled by default in browser)
  CACHE: true,
  LAZY_LOADING: true,
  FORMATTING: true,
  PLUGINS: true,
  DETECTION: true,
  NAMESPACES: true,
  EVENTS: true,
  // Advanced features (can be enabled if needed)
  AB_TESTING: false,
  QUALITY_SCORING: false,
  COLLABORATIVE: false,
  OFFLINE_FIRST: false,
  PERFORMANCE_MONITOR: false,
  CONTEXT_AWARE: false,
  INTELLIGENT_PREHEATER: false,
  MEMORY_OPTIMIZER: false
};
async function conditionalImport(feature, importFn) {
  if (FEATURES[feature]) {
    return importFn();
  }
  return null;
}
function createMinimalI18n(config) {
  const productionConfig = {
    ...config,
    debug: false,
    warnOnMissing: false,
    devtools: false
  };
  if (productionConfig.plugins) {
    productionConfig.plugins = productionConfig.plugins.filter((plugin) => !plugin.isDevelopmentOnly);
  }
  return productionConfig;
}
const CHUNK_NAMES = {
  PLUGINS: (
    /* webpackChunkName: "i18n-plugins" */
    "plugins"
  ),
  FORMATTERS: (
    /* webpackChunkName: "i18n-formatters" */
    "formatters"
  ),
  VUE_INTEGRATION: (
    /* webpackChunkName: "i18n-vue" */
    "vue"
  ),
  LOCALES: (
    /* webpackChunkName: "i18n-locales" */
    "locales"
  ),
  ADVANCED: (
    /* webpackChunkName: "i18n-advanced" */
    "advanced"
  )
};
function generatePreloadHints(locales) {
  const hints = [];
  locales.forEach((locale) => {
    hints.push(`/locales/${locale}.json`);
  });
  hints.push("/i18n-core.js");
  return hints;
}
const MODULE_FEDERATION_CONFIG = {
  name: "@ldesign/i18n",
  exposes: {
    "./I18n": "./src/core/i18n",
    "./Vue": "./src/adapters/vue",
    "./Utils": "./src/utils/helpers"
  },
  shared: {
    vue: {
      singleton: true,
      requiredVersion: "^3.0.0"
    }
  }
};
const ESM_ONLY = {
  // Use native dynamic imports
  dynamicImport: (path) => import(
    /* @vite-ignore */
    path
  ),
  // Use native async/await
  asyncLoader: async (locale) => {
    const module = await import(
      /* @vite-ignore */
      `../locales/${locale}.js`
    );
    return module.default;
  },
  // Use native Proxy for reactive bindings
  createReactive: (target) => {
    return new Proxy(target, {
      set(obj, prop, value) {
        Reflect.set(obj, prop, value);
        return true;
      }
    });
  }
};
const BUILD_FLAGS = {
  IS_PRODUCTION: typeof window !== "undefined" && !window.__DEV__,
  IS_DEVELOPMENT: typeof window !== "undefined" && window.__DEV__ === true,
  IS_TEST: false,
  VERSION: "2.0.0",
  BUILD_DATE: (/* @__PURE__ */ new Date()).toISOString()
};
function pureFormatNumber(value, locale) {
  return new Intl.NumberFormat(locale).format(value);
}
function pureFormatDate(value, locale) {
  return new Intl.DateTimeFormat(locale).format(value);
}
function pureCapitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
const ROLLUP_OPTIMIZATION = {
  // External dependencies to exclude from bundle
  external: ["vue", "react", "angular", "@vue/reactivity", "@vue/runtime-core"],
  // Modules to mark as side-effect free
  sideEffectsFreeModules: ["./utils/helpers", "./core/interpolation", "./core/pluralization"],
  // Output configuration for different formats
  output: {
    esm: {
      format: "esm",
      preserveModules: true,
      preserveModulesRoot: "src"
    },
    cjs: {
      format: "cjs",
      exports: "named"
    },
    umd: {
      format: "umd",
      name: "LDesignI18n",
      globals: {
        vue: "Vue"
      }
    }
  }
};
const VITE_OPTIMIZATION = {
  // Dependencies to pre-bundle
  optimizeDeps: {
    include: ["@ldesign/shared"],
    exclude: ["@ldesign/i18n/plugins/*"]
  },
  // Build configuration
  build: {
    rollupOptions: {
      output: {
        // Manual chunks for code splitting
        manualChunks: {
          "i18n-core": ["./src/core/i18n", "./src/core/interpolation", "./src/core/pluralization"],
          "i18n-vue": ["./src/adapters/vue"],
          "i18n-plugins": ["./src/plugins/index"]
        }
      }
    },
    // Library mode configuration
    lib: {
      entry: "./src/index.ts",
      formats: ["es", "cjs", "umd"],
      fileName: (format) => `i18n.${format}.js`
    }
  }
};
function analyzeExportSizes() {
  const sizes = /* @__PURE__ */ new Map();
  sizes.set("I18n", 15e3);
  sizes.set("InterpolationEngine", 3e3);
  sizes.set("PluralizationEngine", 2e3);
  sizes.set("Cache", 4e3);
  sizes.set("Plugins", 5e4);
  return sizes;
}
function getBundleSizeRecommendations(currentSize) {
  const recommendations = [];
  if (currentSize > 1e5) {
    recommendations.push("Consider lazy loading plugins");
    recommendations.push("Use dynamic imports for locales");
    recommendations.push("Enable tree-shaking in your bundler");
  }
  if (currentSize > 5e4) {
    recommendations.push("Remove unused features via feature flags");
    recommendations.push("Use production builds in production");
    recommendations.push("Consider code splitting for Vue components");
  }
  if (currentSize > 25e3) {
    recommendations.push("Minimize the number of locales bundled");
    recommendations.push("Use CDN for locale data");
  }
  return recommendations;
}

exports.LRUCache = cache.LRUCache;
exports.MultiTierCache = cache.MultiTierCache;
exports.StorageCache = cache.StorageCache;
exports.WeakCache = cache.WeakCache;
exports.createCache = cache.createCache;
exports.InterpolationEngine = interpolation.InterpolationEngine;
exports.PluralizationEngine = pluralization.PluralizationEngine;
exports.BUILD_FLAGS = BUILD_FLAGS;
exports.CHUNK_NAMES = CHUNK_NAMES;
exports.ESM_ONLY = ESM_ONLY;
exports.FEATURES = FEATURES;
exports.MODULE_FEDERATION_CONFIG = MODULE_FEDERATION_CONFIG;
exports.ROLLUP_OPTIMIZATION = ROLLUP_OPTIMIZATION;
exports.VITE_OPTIMIZATION = VITE_OPTIMIZATION;
exports.analyzeExportSizes = analyzeExportSizes;
exports.conditionalImport = conditionalImport;
exports.createMinimalI18n = createMinimalI18n;
exports.generatePreloadHints = generatePreloadHints;
exports.getBundleSizeRecommendations = getBundleSizeRecommendations;
exports.lazyLoadPlugin = lazyLoadPlugin;
exports.pureCapitalize = pureCapitalize;
exports.pureFormatDate = pureFormatDate;
exports.pureFormatNumber = pureFormatNumber;
/*! End of @ldesign/i18n | Powered by @ldesign/builder */
//# sourceMappingURL=bundle-optimization.cjs.map
