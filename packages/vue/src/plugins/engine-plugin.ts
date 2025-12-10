/**
 * Vue 3 I18n Engine 插件
 *
 * 将 Vue I18n 功能集成到 LDesign Engine 中
 * 
 * @module plugins/engine-plugin
 */

import type { Plugin, I18nPluginAPI } from '@ldesign/engine-core/types'
import type { I18nInstance } from '@ldesign/i18n-core'
import { OptimizedI18n } from '@ldesign/i18n-core'
import { I18N_EVENTS } from '@ldesign/engine-core/constants/events'
import { createI18nPlugin } from './plugin'

/**
 * 语言检测策略
 */
export type LocaleDetectionStrategy = 'navigator' | 'cookie' | 'localStorage' | 'query' | 'path' | 'subdomain' | 'manual'

/**
 * 语言加载策略
 */
export type LocaleLoadStrategy = 'eager' | 'lazy' | 'on-demand'

/**
 * 复数规则类型
 */
export type PluralRuleType = 'cardinal' | 'ordinal'

/**
 * I18n 持久化配置
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
 * I18n 性能配置
 */
export interface I18nPerformanceConfig {
  /** 是否启用缓存 */
  cache?: boolean
  /** 缓存大小 */
  cacheSize?: number
  /** 缓存策略 */
  cacheStrategy?: 'lru' | 'lfu' | 'fifo'
  /** 是否启用性能监控 */
  monitoring?: boolean
  /** 是否启用批量翻译 */
  batchTranslation?: boolean
  /** 批量大小 */
  batchSize?: number
}

/**
 * I18n 回退配置
 */
export interface I18nFallbackConfig {
  /** 回退语言 */
  locale?: string
  /** 回退链（多级回退） */
  chain?: string[]
  /** 是否显示缺失的翻译键 */
  showMissingKeys?: boolean
  /** 缺失翻译的占位符 */
  missingKeyPlaceholder?: string | ((key: string) => string)
  /** 是否在控制台警告缺失的翻译 */
  warnOnMissing?: boolean
}

/**
 * I18n 格式化配置
 */
export interface I18nFormattingConfig {
  /** 日期格式化选项 */
  dateTimeFormats?: Record<string, Intl.DateTimeFormatOptions>
  /** 数字格式化选项 */
  numberFormats?: Record<string, Intl.NumberFormatOptions>
  /** 货币格式化选项 */
  currencyFormats?: Record<string, { currency: string; style?: string }>
  /** 自定义格式化器 */
  customFormatters?: Record<string, (value: any, locale: string) => string>
}

/**
 * I18n 插件配置
 */
export interface I18nPluginConfig {
  /** 插件列表 */
  plugins?: Array<{
    name: string
    install: (i18n: any) => void
  }>
}

/**
 * 语言选项配置
 */
export interface LocaleOption {
  /** 语言代码 */
  code: string
  /** 多语言标签 */
  i18n: {
    zh: { label: string; description?: string }
    en: { label: string; description?: string }
  }
  /** 图标（可选） */
  icon?: string
  /** 是否禁用 */
  disabled?: boolean
}

/**
 * 语言选择器配置
 */
export interface LocaleSwitcherConfig {
  /** 禁用的语言代码 */
  disabledLocales?: string[]
  /** 自定义语言选项 */
  customLocales?: LocaleOption[]
  /** 是否只使用自定义语言 */
  useOnlyCustom?: boolean
  /** 样式配置 */
  style?: {
    width?: string
    maxHeight?: string
  }
}

/**
 * I18n 插件上下文（用于 onReady 回调）
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
 * I18n Engine 插件完整配置选项
 */
export interface I18nEnginePluginOptions {
  // ========== 基础配置 ==========
  /** 插件名称 */
  name?: string
  /** 插件版本 */
  version?: string
  /** 当前语言 */
  locale?: string
  /** 回退语言 */
  fallbackLocale?: string
  /** 语言包 */
  messages?: Record<string, Record<string, any>>
  /** 可用语言列表 */
  availableLocales?: string[]

  // ========== 语言检测配置 ==========
  /** 语言检测策略 */
  detectionStrategy?: LocaleDetectionStrategy | LocaleDetectionStrategy[]
  /** 语言检测顺序 */
  detectionOrder?: LocaleDetectionStrategy[]
  /** 是否自动检测语言 */
  autoDetect?: boolean

  // ========== 语言加载配置 ==========
  /** 语言加载策略 */
  loadStrategy?: LocaleLoadStrategy
  /** 预加载的语言包 */
  preloadLocales?: string[]
  /** 语言包加载器 */
  loader?: (locale: string) => Promise<Record<string, any>>
  /** 语言包路径模板 */
  loadPath?: string

  // ========== 回退配置 ==========
  /** 回退配置 */
  fallback?: I18nFallbackConfig

  // ========== 格式化配置 ==========
  /** 格式化配置 */
  formatting?: I18nFormattingConfig

  // ========== 持久化配置 ==========
  /** 持久化配置 */
  persistence?: I18nPersistenceConfig

  // ========== 性能配置 ==========
  /** 性能配置 */
  performanceConfig?: I18nPerformanceConfig
  /** 是否启用缓存（简化配置） */
  cache?: boolean
  /** 缓存大小（简化配置） */
  cacheSize?: number
  /** 是否启用性能监控（简化配置） */
  performance?: boolean

  // ========== 插件配置 ==========
  /** 插件配置 */
  pluginConfig?: I18nPluginConfig

  // ========== 语言选择器配置 ==========
  /** 语言选择器配置 */
  localeSwitcher?: LocaleSwitcherConfig

  // ========== Vue 集成配置 ==========
  /** 是否注册全局属性 */
  globalProperties?: boolean
  /** 是否注册指令 */
  directives?: boolean
  /** 是否注册组件 */
  components?: boolean
  /** 是否注册全局组件（别名） */
  globalComponents?: boolean

  // ========== 调试配置 ==========
  /** 是否启用调试模式 */
  debug?: boolean
  /** 是否启用性能监控（简化配置） */
  performanceMonitoring?: boolean
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
  /** 自定义元数据 */
  meta?: Record<string, any>
  /** 自定义钩子（向后兼容） */
  hooks?: {
    onBeforeInstall?: () => void | Promise<void>
    onAfterInstall?: () => void | Promise<void>
    onLocaleChange?: (locale: string, oldLocale: string) => void
    onMissingKey?: (key: string, locale: string) => void
  }
}

/**
 * I18n 预设配置
 */
export const I18nPresets = {
  /** 基础配置 */
  basic: {
    cache: true,
    cacheSize: 100,
    fallback: { showMissingKeys: false },
  },
  /** 高性能配置 */
  performance: {
    cache: true,
    cacheSize: 500,
    performanceConfig: {
      monitoring: true,
      batchTranslation: true,
      batchSize: 50,
    },
  },
  /** 开发配置 */
  development: {
    debug: true,
    fallback: { showMissingKeys: true, warnOnMissing: true },
    logLevel: 'debug' as const,
  },
  /** 生产配置 */
  production: {
    cache: true,
    cacheSize: 200,
    fallback: { showMissingKeys: false, warnOnMissing: false },
    logLevel: 'error' as const,
  },
}

/**
 * Engine 接口（简化版）
 */
interface EngineLike {
  logger?: {
    info?: (...args: any[]) => void
    warn?: (...args: any[]) => void
    error?: (...args: any[]) => void
  }
  events?: {
    once?: (event: string, cb: () => void) => void
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
}

/**
 * 创建 Vue 3 I18n Engine 插件
 *
 * @param options - 插件配置选项
 * @returns Engine 插件实例
 * 
 * @example
 * ```typescript
 * const i18nPlugin = createI18nEnginePlugin({
 *   locale: 'zh-CN',
 *   fallbackLocale: 'en-US',
 *   messages: {
 *     'zh-CN': { hello: '你好' },
 *     'en-US': { hello: 'Hello' }
 *   }
 * })
 * 
 * engine.use(i18nPlugin)
 * ```
 */
export function createI18nEnginePlugin(
  options: I18nEnginePluginOptions = {},
): Plugin {
  const {
    name = 'i18n',
    version = '1.0.0',
    debug = false,
    globalProperties = true,
    directives = true,
    components = true,
    globalComponents = components,
    preloadLocales = [],
    persistence,
    localeSwitcher,
    onLocaleChange,
    onMissingKey,
    onReady,
    hooks,
    ...i18nConfig
  } = options

  if (debug) {
    console.log('[Vue I18n Plugin] createI18nEnginePlugin called with options:', options)
  }

  // ==================== 持久化配置 ====================
  const STORAGE_KEY = persistence?.key || 'ldesign-i18n'
  const storageType = persistence?.storage || 'localStorage'
  const persistenceEnabled = persistence?.enabled !== false

  // 从 Storage 读取保存的语言
  const loadLocaleFromStorage = (): string | null => {
    if (!persistenceEnabled) return null
    try {
      if (storageType === 'cookie') {
        const match = document.cookie.match(new RegExp(`${STORAGE_KEY}=([^;]+)`))
        return match ? match[1] : null
      }
      const storage = storageType === 'sessionStorage' ? sessionStorage : localStorage
      const data = storage.getItem(STORAGE_KEY)
      if (data) {
        const parsed = JSON.parse(data)
        return parsed.locale || null
      }
    } catch { /* ignore */ }
    return null
  }

  // 保存语言到 Storage
  const saveLocaleToStorage = (locale: string) => {
    if (!persistenceEnabled) return
    try {
      if (storageType === 'cookie') {
        const cookieConfig = persistence?.cookie || {}
        let cookie = `${STORAGE_KEY}=${locale}`
        if (cookieConfig.path) cookie += `; path=${cookieConfig.path}`
        if (cookieConfig.domain) cookie += `; domain=${cookieConfig.domain}`
        if (cookieConfig.maxAge) cookie += `; max-age=${cookieConfig.maxAge}`
        if (cookieConfig.secure) cookie += '; secure'
        if (cookieConfig.sameSite) cookie += `; samesite=${cookieConfig.sameSite}`
        document.cookie = cookie
      } else {
        const storage = storageType === 'sessionStorage' ? sessionStorage : localStorage
        const existing = storage.getItem(STORAGE_KEY)
        const data = existing ? JSON.parse(existing) : {}
        data.locale = locale
        data.updatedAt = Date.now()
        storage.setItem(STORAGE_KEY, JSON.stringify(data))
      }
    } catch (e) {
      console.warn('[I18n Engine Plugin] Failed to save locale to storage:', e)
    }
  }

  // ==================== 初始化状态 ====================
  // 优先级: Storage > options > 'zh-CN'
  const storedLocale = loadLocaleFromStorage()
  let currentLocale = storedLocale || i18nConfig.locale || 'zh-CN'

  if (debug) {
    console.log('[I18n Engine Plugin] Initial locale:', { currentLocale, storedLocale, configLocale: i18nConfig.locale })
  }

  // 标志，防止重复安装到 Vue 应用
  let vueInstalled = false
  let pluginContext: I18nPluginContext | null = null

  return {
    name,
    version,
    dependencies: [],

    async install(context: any) {
      try {
        console.log('[Vue I18n Plugin] ========== install method called ==========')
        if (debug) {
          console.log('[Vue I18n Plugin] install method called with context:', context)
        }

        const engine: EngineLike = context?.engine || context

        if (!engine) {
          throw new Error('Engine instance not found in context')
        }

        engine.logger?.info?.('Installing Vue i18n plugin...', {
          version,
          locale: currentLocale,
          fallbackLocale: i18nConfig.fallbackLocale,
        })

        // 创建 i18n 实例，使用恢复的语言
        // 只提取 OptimizedI18n 需要的配置
        const i18nOptions = {
          locale: currentLocale,
          fallbackLocale: i18nConfig.fallbackLocale,
          messages: i18nConfig.messages,
          cache: i18nConfig.cache,
          cacheSize: i18nConfig.cacheSize,
          performance: i18nConfig.performance,
        }
        const i18n = new OptimizedI18n(i18nOptions as any)

        // 初始化 i18n
        await i18n.init()

        // 预加载语言包
        if (preloadLocales.length > 0) {
          for (const locale of preloadLocales) {
            if (locale !== i18n.locale) {
              if (!i18nConfig.messages?.[locale]) {
                engine.logger?.warn?.(`Locale ${locale} not found in messages, skipping preload`)
              }
            }
          }
        }

        // 包装 setLocale 以触发回调和持久化
        const originalSetLocale = i18n.setLocale.bind(i18n)
        i18n.setLocale = async (newLocale: string) => {
          const oldLocale = currentLocale
          currentLocale = newLocale
          await originalSetLocale(newLocale)

          // 保存到 Storage
          saveLocaleToStorage(newLocale)

          // 触发回调
          if (onLocaleChange && oldLocale !== newLocale) {
            try {
              await onLocaleChange(newLocale, oldLocale)
            } catch (e) {
              console.error('[I18n Engine Plugin] onLocaleChange error:', e)
            }
          }
          // 向后兼容 hooks
          if (hooks?.onLocaleChange && oldLocale !== newLocale) {
            hooks.onLocaleChange(newLocale, oldLocale)
          }
        }

        // 创建插件上下文
        pluginContext = {
          setLocale: (locale: string) => i18n.setLocale(locale),
          getLocale: () => i18n.locale,
          t: (key: string, params?: Record<string, any>) => i18n.t(key, params),
          getAvailableLocales: () => i18n.getAvailableLocales(),
          addLocale: (locale: string, messages: Record<string, any>) => i18n.addLocale(locale, messages),
          has: (key: string, locale?: string) => {
            try {
              const result = i18n.t(key, {}, locale)
              return result !== key
            } catch {
              return false
            }
          },
          instance: i18n,
        }

        // 保存 i18n 配置到状态
        engine.state?.set?.('i18n:locale', i18n.locale)
        engine.state?.set?.('i18n:fallbackLocale', i18n.fallbackLocale)
        engine.state?.set?.('i18n:availableLocales', i18n.getAvailableLocales())
        engine.state?.set?.('i18n:config', options)

        // 监听语言切换事件
        i18n.on('localeChanged', ({ locale, oldLocale }) => {
          engine.logger?.info?.(`Locale changed: ${oldLocale} -> ${locale}`)
          engine.state?.set?.('i18n:locale', locale)
          engine.events?.emit?.(I18N_EVENTS.LOCALE_CHANGED, { locale, oldLocale })
        })

        // 安装到 Vue 应用
        const app = engine.getApp?.()

        console.log('[I18n] Checking Vue app:', { hasApp: !!app, vueInstalled })

        if (app && !vueInstalled) {
          console.log('[I18n] Vue app already exists, installing immediately')
          // 使用 Vue I18n 插件（会自动 provide i18n 实例）
          const vuePlugin = createI18nPlugin(i18n, {
            globalProperties,
            directives,
            components,
          })
          app.use(vuePlugin)
          vueInstalled = true
        }
        else if (!vueInstalled) {
          console.log('[I18n] Vue app not ready, waiting for app:created event')
          // 如果应用还未创建，等待应用创建事件
          engine.events?.once?.('app:created', () => {
            if (vueInstalled) {
              console.log('[I18n] i18n already installed to Vue app, skipping')
              return
            }

            console.log('[I18n] Preparing i18n for mount...')
            const app = engine.getApp?.()
            if (app) {
              console.log('[I18n] Installing i18n to Vue app via app:created event')
              // 使用 Vue I18n 插件（会自动 provide i18n 实例）
              const vuePlugin = createI18nPlugin(i18n, {
                globalProperties,
                directives,
                components,
              })
              app.use(vuePlugin)
              vueInstalled = true
              console.log('[I18n] i18n installed to Vue app successfully')
            }
            else {
              console.error('[I18n] Vue app still not available after app:created event')
            }
          })
        }
        else {
          console.log('[I18n] i18n already installed to Vue app, skipping')
        }

        // 注册 i18n 到 engine
        if (engine.setI18n) {
          engine.setI18n(i18n)
        }
        else {
          (engine as any).i18n = i18n
        }

        // 注册 i18n 服务到容器（用于 engine-vue3 的 installVue）
        const container = (context as any).container || (engine as any).container
        if (container && container.singleton) {
          container.singleton('i18n', i18n)
          if (debug) {
            console.log('[Vue I18n Plugin] I18n service registered to container')
          }
        }

        // 注册 i18n API 到 API 注册表
        if ((engine as any).api) {
          const i18nAPI = {
            name: 'i18n',
            version: version || '1.0.0',
            getLocale: () => i18n.locale,
            setLocale: (locale: string) => i18n.setLocale(locale),
            t: (key: string, params?: Record<string, any>) => i18n.t(key, params),
            getAvailableLocales: () => i18n.getAvailableLocales(),
            addLocale: (locale: string, messages: Record<string, any>) => i18n.addLocale(locale, messages),
            removeLocale: (locale: string) => i18n.removeLocale(locale),
            has: (key: string, _locale?: string) => {
              try {
                const result = i18n.t(key)
                return result !== key
              } catch {
                return false
              }
            },
            getConfig: () => options,
            context: pluginContext,
          };
          (engine as any).api.register(i18nAPI)
          if (debug) {
            console.log('[Vue I18n Plugin] I18n API registered to API registry')
          }
        }

        // 发射 i18n 安装完成事件
        engine.events?.emit?.(I18N_EVENTS.INSTALLED, { locale: i18n.locale })

        // 触发 onReady 回调
        if (onReady && pluginContext) {
          try {
            await onReady(pluginContext)
            if (debug) {
              console.log('[I18n Engine Plugin] onReady hook executed')
            }
          } catch (e) {
            console.error('[I18n Engine Plugin] onReady error:', e)
          }
        }

        engine.logger?.info?.('Vue i18n plugin installed successfully')
      }
      catch (error) {
        const engine: EngineLike = context?.engine || context
        engine?.logger?.error?.('Failed to install Vue i18n plugin:', error)
        throw error
      }
    },

    async uninstall(context: any) {
      try {
        const engine: EngineLike = context?.engine || context

        if (!engine) {
          return
        }

        engine.logger?.info?.('Uninstalling Vue i18n plugin...')

        // 清理状态
        engine.state?.delete?.('i18n:locale')
        engine.state?.delete?.('i18n:fallbackLocale')
        engine.state?.delete?.('i18n:availableLocales')

        // 清理 i18n 实例
        const i18n = engine.i18n
        if (i18n && 'destroy' in i18n) {
          i18n.destroy()
        }

        // 清理 i18n 引用
        if (engine.setI18n) {
          engine.setI18n(null as any)
        }
        else {
          (engine as any).i18n = null
        }

        // 注销 i18n API
        if ((engine as any).api) {
          (engine as any).api.unregister('i18n')
        }

        // 发射 i18n 卸载事件
        engine.events?.emit?.(I18N_EVENTS.UNINSTALLED)

        engine.logger?.info?.('Vue i18n plugin uninstalled successfully')
      }
      catch (error) {
        const engine: EngineLike = context?.engine || context
        engine?.logger?.error?.('Failed to uninstall Vue i18n plugin:', error)
      }
    },
  }
}

/**
 * 创建默认 Vue I18n Engine 插件
 *
 * @param locale - 默认语言
 * @param messages - 语言包
 * @returns Engine 插件实例
 */
export function createDefaultI18nEnginePlugin(
  locale: string,
  messages: Record<string, Record<string, any>>,
): Plugin {
  return createI18nEnginePlugin({
    locale,
    messages,
  })
}

/**
 * I18n 插件别名（向后兼容）
 */
export const i18nPlugin = createI18nEnginePlugin

