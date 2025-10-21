/**
 * @ldesign/i18n - Bundle Size Optimization Utilities
 * Utilities for reducing bundle size and improving tree-shaking
 */
/**
 * Lazy load plugin with dynamic import
 * Reduces initial bundle size by loading plugins on demand
 */
export declare function lazyLoadPlugin(pluginName: string): Promise<any>;
/**
 * Feature flags for conditional imports
 * Use with build-time dead code elimination
 */
export declare const FEATURES: {
    readonly CORE: true;
    readonly INTERPOLATION: true;
    readonly PLURALIZATION: true;
    readonly CACHE: true;
    readonly LAZY_LOADING: true;
    readonly FORMATTING: true;
    readonly PLUGINS: true;
    readonly DETECTION: true;
    readonly NAMESPACES: true;
    readonly EVENTS: true;
    readonly AB_TESTING: false;
    readonly QUALITY_SCORING: false;
    readonly COLLABORATIVE: false;
    readonly OFFLINE_FIRST: false;
    readonly PERFORMANCE_MONITOR: false;
    readonly CONTEXT_AWARE: false;
    readonly INTELLIGENT_PREHEATER: false;
    readonly MEMORY_OPTIMIZER: false;
};
/**
 * Conditional import helper
 * Only imports module if feature is enabled
 */
export declare function conditionalImport<T>(feature: keyof typeof FEATURES, importFn: () => Promise<T>): Promise<T | null>;
/**
 * Create minimal i18n instance for production
 * Excludes development-only features
 */
export declare function createMinimalI18n(config: any): any;
export * from '../core/cache';
/**
 * Tree-shakeable exports
 * Each module can be imported separately to reduce bundle size
 */
export * from '../core/interpolation';
export * from '../core/pluralization';
/**
 * Webpack/Rollup magic comments for code splitting
 * Use these when importing heavy modules
 */
export declare const CHUNK_NAMES: {
    readonly PLUGINS: "plugins";
    readonly FORMATTERS: "formatters";
    readonly VUE_INTEGRATION: "vue";
    readonly LOCALES: "locales";
    readonly ADVANCED: "advanced";
};
/**
 * Preload hints for critical resources
 */
export declare function generatePreloadHints(locales: string[]): string[];
/**
 * Module federation config for micro-frontends
 */
export declare const MODULE_FEDERATION_CONFIG: {
    name: string;
    exposes: {
        './I18n': string;
        './Vue': string;
        './Utils': string;
    };
    shared: {
        vue: {
            singleton: boolean;
            requiredVersion: string;
        };
    };
};
/**
 * ESM-only exports for modern bundlers
 * Reduces polyfill overhead
 */
export declare const ESM_ONLY: {
    dynamicImport: (path: string) => Promise<any>;
    asyncLoader: (locale: string) => Promise<any>;
    createReactive: <T extends object>(target: T) => T;
};
/**
 * Build-time constants for dead code elimination
 */
export declare const BUILD_FLAGS: {
    readonly IS_PRODUCTION: boolean;
    readonly IS_DEVELOPMENT: boolean;
    readonly IS_TEST: false;
    readonly VERSION: "2.0.0";
    readonly BUILD_DATE: string;
};
/**
 * SideEffects-free pure functions
 * Mark these as pure for better tree-shaking
 */
export declare function pureFormatNumber(value: number, locale: string): string;
export declare function pureFormatDate(value: Date, locale: string): string;
export declare function pureCapitalize(str: string): string;
/**
 * Rollup plugin configuration for optimal bundling
 */
export declare const ROLLUP_OPTIMIZATION: {
    external: string[];
    sideEffectsFreeModules: string[];
    output: {
        esm: {
            format: string;
            preserveModules: boolean;
            preserveModulesRoot: string;
        };
        cjs: {
            format: string;
            exports: string;
        };
        umd: {
            format: string;
            name: string;
            globals: {
                vue: string;
            };
        };
    };
};
/**
 * Vite plugin configuration for optimal HMR and bundling
 */
export declare const VITE_OPTIMIZATION: {
    optimizeDeps: {
        include: string[];
        exclude: string[];
    };
    build: {
        rollupOptions: {
            output: {
                manualChunks: {
                    'i18n-core': string[];
                    'i18n-vue': string[];
                    'i18n-plugins': string[];
                };
            };
        };
        lib: {
            entry: string;
            formats: string[];
            fileName: (format: any) => string;
        };
    };
};
/**
 * Export size analyzer
 * Helps identify large exports for optimization
 */
export declare function analyzeExportSizes(): Map<string, number>;
/**
 * Recommendations for bundle size reduction
 */
export declare function getBundleSizeRecommendations(currentSize: number): string[];
