import type { I18nConfig, I18nInstance } from '../types'

/**
 * 语言持久化配置
 */
export interface I18nPersistenceConfig {
  /** 是否启用持久化 */
  enabled?: boolean
  /** 存储键名 */
  key?: string
  /** 存储类型 */
  storage?: 'localStorage' | 'sessionStorage' | 'cookie'
  /** Cookie 配置（当 storage 为 cookie 时） */
  cookie?: {
    domain?: string
    path?: string
    maxAge?: number
    secure?: boolean
    sameSite?: 'strict' | 'lax' | 'none'
  }
}

/**
 * I18n 插件上下文（onReady 回调参数）
 */
export interface I18nPluginContext {
  /** 设置当前语言 */
  setLocale: (locale: string) => Promise<void>
  /** 获取当前语言 */
  getLocale: () => string
  /** 翻译函数 */
  t: (key: string, params?: Record<string, any>) => string
  /** 获取可用语言列表 */
  getAvailableLocales: () => string[]
  /** 添加语言包 */
  addLocale: (locale: string, messages: Record<string, any>) => void
  /** 检查翻译键是否存在 */
  has: (key: string, locale?: string) => boolean
  /** i18n 实例 */
  instance: I18nInstance
}

/**
 * Engine 接口（简化版，框架无关）
 */
export interface EngineLike {
  logger?: {
    info?: (...args: any[]) => void
    warn?: (...args: any[]) => void
    error?: (...args: any[]) => void
  }
  events?: {
    once?: (event: string, cb: (...args: any[]) => void) => void
    emit?: (event: string, payload?: any) => void
    on?: (event: string, cb: (payload?: any) => void) => void
    off?: (event: string, cb?: (payload?: any) => void) => void
  }
  getApp?: () => any
  state?: {
    set?: (k: string, v: any) => void
    get?: (k: string) => any
    delete?: (k: string) => void
  }
  i18n?: I18nInstance
  setI18n?: (i18n: I18nInstance) => void
  api?: {
    register: (api: any) => void
    unregister: (name: string) => void
  }
}

/**
 * I18n Engine 插件配置选项
 */
export interface I18nEnginePluginOptions extends Omit<I18nConfig, 'persistence'> {
  /** 插件名称 */
  name?: string
  /** 插件版本 */
  version?: string
  /** 插件依赖 */
  dependencies?: string[]

  // ========== 持久化配置 ==========
  /** 持久化配置 */
  persistence?: I18nPersistenceConfig

  // ========== 预加载配置 ==========
  /** 预加载的语言包 */
  preloadLocales?: string[]

  // ========== 调试配置 ==========
  /** 日志级别 */
  logLevel?: 'error' | 'warn' | 'info' | 'debug'

  // ========== 事件回调 ==========
  /** 语言切换回调 */
  onLocaleChange?: (locale: string, oldLocale: string) => void | Promise<void>
  /** 缺失翻译键回调 */
  onMissingKey?: (key: string, locale: string) => void
  /** 初始化完成回调 */
  onReady?: (context: I18nPluginContext) => void | Promise<void>

  // ========== 扩展配置 ==========
  /** 自定义钩子 */
  hooks?: {
    onBeforeInstall?: () => void | Promise<void>
    onAfterInstall?: () => void | Promise<void>
    onLocaleChange?: (locale: string, oldLocale: string) => void
    onMissingKey?: (key: string, locale: string) => void
  }
}
