/**
 * @ldesign/i18n - Advanced Formatter
 * 高级格式化功能，提供丰富的数据格式化选项
 */
import type { Formatter, Locale } from '../types';
export interface FormatOptions {
    locale?: Locale;
    [key: string]: any;
}
export declare class AdvancedFormatter {
    private locale;
    private readonly customFormatters;
    private readonly formatterCache;
    constructor(locale?: Locale);
    /**
     * 设置当前语言
     */
    setLocale(locale: Locale): void;
    /**
     * 注册自定义格式化器
     */
    registerFormatter(name: string, formatter: Formatter): void;
    /**
     * 格式化值
     */
    format(value: any, format: string, options?: FormatOptions): string;
    /**
     * 格式化数字
     */
    formatNumber(value: number, options?: any, locale?: Locale): string;
    /**
     * 格式化货币
     */
    formatCurrency(value: number, options?: any, locale?: Locale): string;
    /**
     * 格式化百分比
     */
    formatPercent(value: number, options?: any, locale?: Locale): string;
    /**
     * 格式化日期
     */
    formatDate(value: Date | string | number, options?: any, locale?: Locale): string;
    /**
     * 格式化时间
     */
    formatTime(value: Date | string | number, options?: any, locale?: Locale): string;
    /**
     * 格式化日期时间
     */
    formatDateTime(value: Date | string | number, options?: any, locale?: Locale): string;
    /**
     * 格式化相对时间
     */
    formatRelativeTime(value: Date | string | number, options?: any, locale?: Locale): string;
    /**
     * 格式化持续时间
     */
    formatDuration(value: number, _options?: any, locale?: Locale): string;
    /**
     * 格式化文件大小
     */
    formatFileSize(value: number, options?: any, locale?: Locale): string;
    /**
     * 格式化序数词
     */
    formatOrdinal(value: number, locale?: Locale): string;
    /**
     * 格式化列表
     */
    formatList(value: any[], options?: any, locale?: Locale): string;
    /**
     * 格式化电话号码
     */
    formatPhoneNumber(value: string, _options?: any, locale?: Locale): string;
    /**
     * 缩写大数字
     */
    abbreviateNumber(value: number, options?: any, locale?: Locale): string;
    /**
     * 注册默认格式化器
     */
    private registerDefaultFormatters;
    /**
     * 解析格式选项
     */
    private parseFormatOptions;
    /**
     * 转换为日期对象
     */
    private toDate;
    /**
     * 简单的复数化
     */
    private pluralize;
}
/**
 * 创建格式化器实例 - 使用单例模式
 */
export declare function createAdvancedFormatter(locale?: Locale): AdvancedFormatter;
/**
 * 清理格式化器缓存
 */
export declare function clearFormatterCache(): void;
//# sourceMappingURL=advanced-formatter.d.ts.map