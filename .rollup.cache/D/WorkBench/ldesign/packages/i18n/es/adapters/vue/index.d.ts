/**
 * @ldesign/i18n Vue 3 Adapter
 * Complete Vue 3 integration with plugin, composables, and components
 */
import type { App } from 'vue';
import type { I18nConfig, I18nInstance } from '../../types';
import { createI18nPlugin, LDesignI18nPlugin } from './plugin';
export { createI18nPlugin, LDesignI18nPlugin };
export { default as I18nProvider } from './components/I18nProvider.vue';
export { default as I18nText } from './components/I18nText.vue';
export { default as I18nTranslate } from './components/I18nTranslate.vue';
export { default as LocaleSwitcher } from './components/LocaleSwitcher.vue';
export { useI18n } from './composables/useI18n';
export { useI18nAsync } from './composables/useI18nAsync';
export { useLocale } from './composables/useLocale';
export { useTranslation } from './composables/useTranslation';
export { vT } from './directives/vT';
export { vTHtml } from './directives/vTHtml';
export { vTPlural } from './directives/vTPlural';
export * from './types';
export { createI18n } from './utils/createI18n';
export { defineI18nConfig } from './utils/defineI18nConfig';
export { loadLocaleMessages } from './utils/loadLocaleMessages';
export declare function setupI18n(app: App, config?: I18nConfig): I18nInstance;
