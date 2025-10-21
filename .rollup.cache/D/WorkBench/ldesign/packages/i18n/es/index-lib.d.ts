/**
 * UMD 构建入口文件
 * 用于浏览器环境的全局变量导出
 */
import { OptimizedI18n } from './core/i18n-optimized';
export { createVueI18n, useI18n as useVueI18n } from './adapters/vue';
export * from './core';
export * from './types';
export * from './utils';
export { OptimizedI18n as I18n, OptimizedI18n };
declare const defaultI18n: OptimizedI18n;
export default defaultI18n;
