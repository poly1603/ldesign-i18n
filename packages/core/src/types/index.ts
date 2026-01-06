/**
 * @ldesign/i18n - Type Definitions
 * Core type definitions for the i18n system
 */

// ============== Basic Types ==============

export type Locale = string
export type MessageKey = string
export type MessageValue = string | Record<string, unknown>
export type InterpolationParams = Record<string, string | number | boolean | Date | null | undefined>
export type PluralRule = (count: number, locale: Locale) => string

/**
 * Translation messages structure
 */
export interface Messages {
  [key: string]: MessageValue | Messages
}

/**
 * 语言包元数据类型
 */
export interface LanguageMetadata {
  name?: string
  direction?: 'ltr' | 'rtl'
  fallback?: Locale
  [key: string]: string | boolean | number | undefined
}

/**
 * Language package containing all translations for a locale
 */
export interface LanguagePackage {
  locale: Locale
  messages: Messages
  metadata?: LanguageMetadata
}

/**
 * Translation options
 */
export interface TranslateOptions {
  locale?: Locale
  fallbackLocale?: Locale | Locale[]
  params?: InterpolationParams
  defaultValue?: string
  count?: number
  context?: string
  namespace?: string
  interpolation?: InterpolationOptions
}

/**
 * Interpolation options
 */
export interface InterpolationOptions {
  prefix?: string
  suffix?: string
  escapeValue?: boolean
  formatter?: (value: unknown, format?: string, locale?: Locale) => string
}

// ============== Core Interfaces ==============

/**
 * Message loader interface
 */
export interface MessageLoader {
  load: (locale: Locale, namespace?: string) => Promise<Messages>
  loadSync: (locale: Locale, namespace?: string) => Messages | null
  isLoaded: (locale: Locale, namespace?: string) => boolean
  preload?: (locales: Locale[], namespaces?: string[]) => Promise<void>
  reload?: (locale?: Locale, namespace?: string) => Promise<void>
}

/**
 * Message storage interface
 */
export interface MessageStorage {
  get: (locale: Locale, namespace?: string) => Messages | null
  set: (locale: Locale, messages: Messages, namespace?: string) => void
  has: (locale: Locale, namespace?: string) => boolean
  remove: (locale: Locale, namespace?: string) => void
  clear: () => void
  getAll: () => Map<string, Messages>
}

/**
 * Cache interface
 */
export interface Cache<K = string | number, V = unknown> {
  get: (key: K) => V | undefined
  set: (key: K, value: V, ttl?: number) => void
  has: (key: K) => boolean
  delete: (key: K) => boolean
  clear: () => void
  size: number
}

/**
 * Language detector interface
 */
export interface LanguageDetector {
  detect: () => Locale | null
  cacheUserLanguage?: (locale: Locale) => void
  lookup?: Record<string, () => Locale | null>
}

/**
 * 格式化选项类型
 */
export type FormatterOptions = Record<string, string | number | boolean | undefined>

/**
 * Formatter interface
 */
export interface Formatter {
  format: (value: unknown, format: string, locale: Locale, options?: FormatterOptions) => string
}

/**
 * Plugin interface
 */
export interface I18nPlugin {
  name: string
  version?: string
  install: (i18n: I18nInstance) => void | Promise<void>
  uninstall?: (i18n: I18nInstance) => void | Promise<void>
}

// ============== Configuration ==============

/**
 * Main i18n configuration
 */
export interface I18nConfig {
  // Basic settings
  locale?: Locale
  fallbackLocale?: Locale | Locale[]
  messages?: Record<Locale, Messages>

  // Advanced settings
  namespaces?: string[]
  defaultNamespace?: string
  namespaceSeparator?: string
  keySeparator?: string
  pluralSeparator?: string
  contextSeparator?: string

  // Features
  lazy?: boolean
  cache?: boolean | CacheConfig
  detection?: boolean | DetectionConfig
  interpolation?: InterpolationConfig

  // Extra behavior/config (extended)
  /**
   * 预加载语言列表（由上层适配器处理，core 仅做类型兼容）
   */
  preloadLocales?: string[]
  /**
   * 是否启用性能监控（由 core 内部轻量集成或外部插件实现）
   */
  performance?: boolean
  /**
   * 语言持久化配置（core 负责读写当前语言到存储）
   */
  persistence?: {
    enabled?: boolean
    key?: string
    storage?: 'localStorage' | 'sessionStorage'
  }

  // Components
  loader?: MessageLoader
  storage?: MessageStorage
  detector?: LanguageDetector
  formatters?: Record<string, Formatter>
  plugins?: I18nPlugin[]

  // Behavior
  missingKeyHandler?: MissingKeyHandler
  errorHandler?: ErrorHandler
  debug?: boolean
  silent?: boolean
  warnOnMissing?: boolean
}

/**
 * Cache configuration
 */
export interface CacheConfig {
  enabled?: boolean
  ttl?: number
  maxSize?: number
  strategy?: 'lru' | 'lfu' | 'fifo'
  storage?: 'memory' | 'localStorage' | 'sessionStorage' | Cache
}

/**
 * Cookie 配置选项
 */
export interface CookieOptions {
  path?: string
  domain?: string
  maxAge?: number
  expires?: Date
  secure?: boolean
  sameSite?: 'strict' | 'lax' | 'none'
}

/**
 * Detection configuration
 */
export interface DetectionConfig {
  order?: string[]
  lookupQuerystring?: string
  lookupCookie?: string
  lookupLocalStorage?: string
  lookupSessionStorage?: string
  lookupFromPathIndex?: number
  lookupFromSubdomainIndex?: number
  caches?: string[]
  cookieOptions?: CookieOptions
}

/**
 * Interpolation configuration
 */
export interface InterpolationConfig {
  prefix?: string
  suffix?: string
  escapeValue?: boolean
  nestingPrefix?: string
  nestingSuffix?: string
  formatSeparator?: string
  formatter?: (value: unknown, format?: string, locale?: Locale) => string
}

// ============== Events ==============

/**
 * Event types
 */
export type I18nEventType
  = | 'loaded'
  | 'loading'
  | 'loadError'
  | 'localeChanged'
  | 'namespaceLoaded'
  | 'missingKey'
  | 'fallback'
  | 'initialized'
  | 'pluginInstalled'
  | 'pluginUninstalled'

/**
 * Event data
 */
export interface I18nEventData {
  type: I18nEventType
  locale?: Locale
  namespace?: string
  key?: string
  fallback?: Locale
  error?: Error
  plugin?: string
  oldLocale?: Locale
  [key: string]: I18nEventType | Locale | string | Error | undefined
}

/**
 * Event listener
 */
export type I18nEventListener = (event: I18nEventData) => void

// ============== Error Handling ==============

/**
 * Missing key handler
 */
export type MissingKeyHandler = (
  key: string,
  locale: Locale,
  namespace?: string,
  fallbackValue?: string,
) => string

/**
 * Error handler
 */
export type ErrorHandler = (
  error: Error,
  context?: Record<string, any>,
) => void

// ============== Runtime Interfaces ==============

/**
 * Translation function
 */
export interface TranslationFunction {
  (key: MessageKey, options?: TranslateOptions): string
  (key: MessageKey, params?: InterpolationParams): string
  (key: MessageKey, defaultValue?: string, params?: InterpolationParams): string
}

/**
 * Main i18n instance interface
 */
export interface I18nInstance {
  // Core properties
  readonly version: string
  readonly config: Readonly<I18nConfig>
  locale: Locale
  fallbackLocale: Locale | Locale[]

  // Core methods
  t: TranslationFunction
  translate: (key: MessageKey, options?: TranslateOptions) => string
  exists: (key: MessageKey, options?: TranslateOptions) => boolean

  // Locale management
  setLocale: (locale: Locale) => Promise<void>
  getLocale: () => Locale
  addLocale: (locale: Locale, messages: Messages) => void
  removeLocale: (locale: Locale) => void
  hasLocale: (locale: Locale) => boolean
  getAvailableLocales: () => Locale[]

  // Message management
  addMessages: (locale: Locale, messages: Messages, namespace?: string) => void
  setMessages: (locale: Locale, messages: Messages, namespace?: string) => void
  getMessages: (locale?: Locale, namespace?: string) => Messages | null
  mergeMessages: (locale: Locale, messages: Messages, namespace?: string) => void

  // Namespace management
  loadNamespace: (namespace: string, locale?: Locale) => Promise<void>
  hasNamespace: (namespace: string, locale?: Locale) => boolean

  // Formatting
  format: (value: unknown, format: string, locale?: Locale, options?: FormatterOptions) => string
  number: (value: number, options?: Intl.NumberFormatOptions) => string
  currency: (value: number, currency: string, options?: Intl.NumberFormatOptions) => string
  date: (value: Date | string | number, options?: Intl.DateTimeFormatOptions) => string
  relativeTime: (value: Date | string | number, options?: Intl.RelativeTimeFormatOptions) => string

  // Pluralization
  plural: (key: MessageKey, count: number, options?: TranslateOptions) => string

  // Event management
  on: (event: I18nEventType, listener: I18nEventListener) => () => void
  off: (event: I18nEventType, listener: I18nEventListener) => void
  once: (event: I18nEventType, listener: I18nEventListener) => void
  emit: (event: I18nEventType, data?: Omit<I18nEventData, 'type'>) => void

  // Plugin management
  use: (plugin: I18nPlugin) => Promise<void>
  unuse: (plugin: I18nPlugin | string) => Promise<void>

  // Lifecycle
  init: (config?: Partial<I18nConfig>) => Promise<void>
  ready: () => Promise<void>
  destroy: () => void

  // Utilities
  clone: (config?: Partial<I18nConfig>) => I18nInstance
  createContext: (namespace: string) => I18nContext
}

/**
 * Namespaced context
 */
export interface I18nContext {
  namespace: string
  t: TranslationFunction
  exists: (key: MessageKey, options?: Omit<TranslateOptions, 'namespace'>) => boolean
}

// ============== Framework Adapters ==============

/**
 * Framework adapter interface
 */
export interface FrameworkAdapter<TApp = unknown> {
  name: string
  install: (app: TApp, i18n: I18nInstance) => void
  uninstall?: (app: TApp) => void
}

// ============== Engine Plugin ==============

/**
 * Engine 应用接口
 */
export interface EngineApp {
  use: (plugin: EnginePlugin) => void | Promise<void>
  [key: string]: unknown
}

/**
 * Engine 插件 API 类型
 */
export type EnginePluginApi = Record<string, ((...args: unknown[]) => unknown) | unknown>

/**
 * Engine plugin interface for @ldesign/engine integration
 */
export interface EnginePlugin {
  name: string
  version?: string
  install: (app: EngineApp) => void | Promise<void>
  onReady?: () => void | Promise<void>
  api?: EnginePluginApi
}

// ============== Export utility types ==============

export type DeepPartial<T> = T extends object ? {
  [P in keyof T]?: DeepPartial<T[P]>;
} : T

export type ValueOf<T> = T[keyof T]

export type PromiseOr<T> = T | Promise<T>

// Re-export type-safe translation utilities
export * from './type-safe'
