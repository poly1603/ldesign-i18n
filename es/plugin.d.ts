/**
 * @ldesign/i18n - Optimized Plugin
 * 极简、高性能的 i18n 插件实现
 */
import type { I18nConfig } from './types';
import { type App, type Ref } from 'vue';
import { OptimizedI18n } from './core/i18n-optimized';
export interface I18nPluginOptions extends Omit<I18nConfig, 'locale'> {
    /**
     * 语言设置 - 支持 string 或 Ref<string>
     * 如果传入 Ref，将直接使用（共享模式）
     * 如果传入 string 或不传，将创建新的 Ref（独立模式）
     */
    locale?: string | Ref<string>;
    /**
     * 是否持久化语言设置
     * @default true
     */
    persist?: boolean;
    /**
     * localStorage 的 key
     * @default 'ldesign-locale'
     */
    storageKey?: string;
}
/**
 * 创建优化的 i18n 插件
 */
export declare function createI18nPlugin(options?: I18nPluginOptions): {
    name: string;
    locale: Ref<string, string>;
    t: any;
    i18n: OptimizedI18n;
    setLocale: (newLocale: string) => void;
    destroy: () => void;
    install(app: App): void;
};
/**
 * 在组件中使用 i18n
 */
export declare function useI18n(): {
    name: string;
    locale: Ref<string, string>;
    t: any;
    i18n: OptimizedI18n;
    setLocale: (newLocale: string) => void;
    destroy: () => void;
    install(app: App): void;
} | {
    locale: Ref<string, string>;
    t: (key: string) => string;
    setLocale: () => void;
};
//# sourceMappingURL=plugin.d.ts.map