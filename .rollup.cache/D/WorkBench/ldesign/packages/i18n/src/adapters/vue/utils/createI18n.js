/**
 * Utility functions for Vue i18n
 */
import { OptimizedI18n } from '../../../core/i18n-optimized';
/**
 * Create i18n instance for Vue
 */
export function createI18n(config) {
    const i18n = new OptimizedI18n(config);
    // Initialize
    i18n.init().catch(console.error);
    return i18n;
}
/**
 * Define i18n config with type checking
 */
export function defineI18nConfig(config) {
    return config;
}
/**
 * Load locale messages dynamically
 */
export async function loadLocaleMessages(locale, loader) {
    try {
        const module = await loader();
        return module.default || module;
    }
    catch (error) {
        console.error(`Failed to load locale ${locale}:`, error);
        return {};
    }
}
//# sourceMappingURL=createI18n.js.map