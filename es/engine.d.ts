/**
 * @ldesign/i18n - Engine Plugin Integration
 *
 * 提供与 @ldesign/engine 的集成
 *
 * 注意：此文件用于兼容旧的 Engine 插件系统
 * 新项目建议使用 plugin.ts 中的 createI18nPlugin
 */
import type { App } from 'vue';
import type { I18nConfig, I18nInstance } from './types';
export interface I18nEnginePluginOptions extends I18nConfig {
    /**
     * 是否自动检测浏览器语言
     */
    detectBrowserLanguage?: boolean;
    /**
     * 是否持久化语言设置到 localStorage
     */
    persistLanguage?: boolean;
    /**
     * localStorage 的 key
     */
    storageKey?: string;
    /**
     * 语言变化时的回调
     */
    onLocaleChange?: (locale: string) => void;
}
/**
 * 创建 i18n Engine 插件
 */
export declare function createI18nEnginePlugin(options?: I18nEnginePluginOptions): {
    name: string;
    version: string;
    localeRef: import("vue").Ref<string, string>;
    install(context: any): Promise<void>;
    setupVueApp(app: App): void;
    api: {
        readonly i18n: I18nInstance;
        readonly vuePlugin: any;
        changeLocale(locale: string): Promise<void>;
        t(key: string, params?: Record<string, any>): string;
        getCurrentLocale(): string;
        getAvailableLocales(): string[];
    };
};
/**
 * 创建默认配置的 i18n Engine 插件
 */
export declare function createDefaultI18nEnginePlugin(): {
    name: string;
    version: string;
    localeRef: import("vue").Ref<string, string>;
    install(context: any): Promise<void>;
    setupVueApp(app: App): void;
    api: {
        readonly i18n: I18nInstance;
        readonly vuePlugin: any;
        changeLocale(locale: string): Promise<void>;
        t(key: string, params?: Record<string, any>): string;
        getCurrentLocale(): string;
        getAvailableLocales(): string[];
    };
};
export declare const i18nPlugin: typeof createI18nEnginePlugin;
//# sourceMappingURL=engine.d.ts.map