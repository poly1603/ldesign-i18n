/**
 * Vue 3 I18n Plugin
 */
import type { App, Plugin } from 'vue';
import type { I18nInstance } from '../../types';
export interface I18nPluginOptions {
    globalProperties?: boolean;
    directives?: boolean;
    components?: boolean;
    defaultLocale?: string;
}
export declare function createI18nPlugin(i18n: I18nInstance, options?: I18nPluginOptions): Plugin;
export declare class LDesignI18nPlugin implements Plugin {
    private i18n;
    private options;
    constructor(i18n: I18nInstance, options?: I18nPluginOptions);
    install(app: App): void;
}
//# sourceMappingURL=plugin.d.ts.map