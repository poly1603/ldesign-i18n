/**
 * @ldesign/i18n-core Engine 插件
 *
 * 框架无关的 i18n engine 插件，负责：
 * - 创建和管理 i18n 实例
 * - locale 持久化 (localStorage/sessionStorage/cookie)
 * - 发射标准 I18N_EVENTS
 * - 注册 i18n API 到 engine
 * - 管理 engine.state 中的 i18n 状态
 */
import type { I18nInstance } from '../types'
import type { I18nEnginePluginOptions, I18nPluginContext, I18nPersistenceConfig, EngineLike } from './types'
import { createI18n } from '../core'

// ==================== 状态键 ====================

export const i18nStateKeys = {
  INSTANCE: 'i18n:instance' as const,
  LOCALE: 'i18n:locale' as const,
  FALLBACK_LOCALE: 'i18n:fallbackLocale' as const,
  AVAILABLE_LOCALES: 'i18n:availableLocales' as const,
  CONFIG: 'i18n:config' as const,
} as const

export const i18nEventKeys = {
  INSTALLED: 'i18n:installed' as const,
  UNINSTALLED: 'i18n:uninstalled' as const,
  LOCALE_CHANGED: 'i18n:localeChanged' as const,
  LOCALE_CHANGING: 'i18n:localeChanging' as const,
  MESSAGES_LOADED: 'i18n:messagesLoaded' as const,
  MISSING_KEY: 'i18n:missingKey' as const,
} as const

// ==================== 持久化工具 ====================

function loadLocaleFromStorage(persistence?: I18nPersistenceConfig): string | null {
  if (!persistence || persistence.enabled === false) return null
  const storageKey = persistence.key || 'ldesign-i18n'
  const storageType = persistence.storage || 'localStorage'

  try {
    if (typeof globalThis === 'undefined') return null

    if (storageType === 'cookie' && typeof document !== 'undefined') {
      const match = document.cookie.match(new RegExp(`${storageKey}=([^;]+)`))
      return match ? match[1] : null
    }

    const storage = storageType === 'sessionStorage'
      ? globalThis.sessionStorage
      : globalThis.localStorage

    if (!storage) return null
    const data = storage.getItem(storageKey)
    if (data) {
      const parsed = JSON.parse(data)
      return parsed.locale || null
    }
  }
  catch { /* ignore in SSR or restricted environments */ }
  return null
}

function saveLocaleToStorage(locale: string, persistence?: I18nPersistenceConfig): void {
  if (!persistence || persistence.enabled === false) return
  const storageKey = persistence.key || 'ldesign-i18n'
  const storageType = persistence.storage || 'localStorage'

  try {
    if (typeof globalThis === 'undefined') return

    if (storageType === 'cookie' && typeof document !== 'undefined') {
      const c = persistence.cookie || {}
      let cookie = `${storageKey}=${locale}`
      if (c.path) cookie += `; path=${c.path}`
      if (c.domain) cookie += `; domain=${c.domain}`
      if (c.maxAge) cookie += `; max-age=${c.maxAge}`
      if (c.secure) cookie += '; secure'
      if (c.sameSite) cookie += `; samesite=${c.sameSite}`
      document.cookie = cookie
      return
    }

    const storage = storageType === 'sessionStorage'
      ? globalThis.sessionStorage
      : globalThis.localStorage

    if (!storage) return
    const existing = storage.getItem(storageKey)
    const data = existing ? JSON.parse(existing) : {}
    data.locale = locale
    data.updatedAt = Date.now()
    storage.setItem(storageKey, JSON.stringify(data))
  }
  catch { /* ignore */ }
}

// ==================== 创建插件 ====================

/**
 * 创建 i18n Engine 插件（框架无关）
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
export function createI18nEnginePlugin(options: I18nEnginePluginOptions = {}) {
  const {
    name = 'i18n',
    version = '1.0.0',
    dependencies = [],
    persistence,
    preloadLocales = [],
    onLocaleChange,
    onMissingKey,
    onReady,
    hooks,
    logLevel = 'warn',
    // Extract i18n config
    locale: configLocale,
    fallbackLocale,
    messages,
    ...restI18nConfig
  } = options

  let instance: I18nInstance | null = null
  let pluginContext: I18nPluginContext | null = null

  // 确定初始语言：Storage > config > 'zh-CN'
  const storedLocale = loadLocaleFromStorage(persistence)
  const initialLocale = storedLocale || configLocale || 'zh-CN'

  return {
    name,
    version,
    dependencies,

    async install(context: any) {
      const engine: EngineLike = context?.engine || context

      if (!engine) {
        throw new Error('[I18n Plugin] Engine instance not found in context')
      }

      // 执行 beforeInstall 钩子
      await hooks?.onBeforeInstall?.()

      engine.logger?.info?.('[I18n Plugin] Installing...', {
        version,
        locale: initialLocale,
        fallbackLocale,
      })

      // 创建 i18n 实例
      instance = createI18n({
        locale: initialLocale,
        fallbackLocale,
        messages,
        ...restI18nConfig,
      })

      // 初始化
      await instance.init()

      // 预加载语言包
      if (preloadLocales.length > 0) {
        for (const lc of preloadLocales) {
          if (lc !== instance.locale && !messages?.[lc]) {
            engine.logger?.warn?.(`[I18n Plugin] Locale "${lc}" not found in messages, skipping preload`)
          }
        }
      }

      // 包装 setLocale 以触发回调和持久化
      const originalSetLocale = instance.setLocale.bind(instance)
      instance.setLocale = async (newLocale: string) => {
        const oldLocale = instance!.locale

        engine.events?.emit?.(i18nEventKeys.LOCALE_CHANGING, { locale: newLocale, oldLocale })

        await originalSetLocale(newLocale)

        // 持久化
        saveLocaleToStorage(newLocale, persistence)

        // 更新 engine 状态
        engine.state?.set?.(i18nStateKeys.LOCALE, newLocale)

        // 发射事件
        engine.events?.emit?.(i18nEventKeys.LOCALE_CHANGED, { locale: newLocale, oldLocale })

        // 触发回调
        if (onLocaleChange && oldLocale !== newLocale) {
          try {
            await onLocaleChange(newLocale, oldLocale)
          }
          catch (e) {
            engine.logger?.error?.('[I18n Plugin] onLocaleChange error:', e)
          }
        }

        // 向后兼容 hooks
        if (hooks?.onLocaleChange && oldLocale !== newLocale) {
          hooks.onLocaleChange(newLocale, oldLocale)
        }
      }

      // 监听缺失翻译
      instance.on('missingKey', ({ key, locale }) => {
        engine.events?.emit?.(i18nEventKeys.MISSING_KEY, { key, locale })
        onMissingKey?.(key ?? '', locale ?? instance!.locale)
        hooks?.onMissingKey?.(key ?? '', locale ?? instance!.locale)
      })

      // 创建插件上下文
      pluginContext = {
        setLocale: (locale: string) => instance!.setLocale(locale),
        getLocale: () => instance!.locale,
        t: (key: string, params?: Record<string, any>) => instance!.t(key, params),
        getAvailableLocales: () => instance!.getAvailableLocales(),
        addLocale: (locale: string, msgs: Record<string, any>) => instance!.addLocale(locale, msgs),
        has: (key: string, locale?: string) => {
          try {
            const result = instance!.t(key, {}, locale)
            return result !== key
          }
          catch {
            return false
          }
        },
        instance: instance!,
      }

      // 保存状态到 engine
      engine.state?.set?.(i18nStateKeys.INSTANCE, instance)
      engine.state?.set?.(i18nStateKeys.LOCALE, instance.locale)
      engine.state?.set?.(i18nStateKeys.FALLBACK_LOCALE, instance.fallbackLocale)
      engine.state?.set?.(i18nStateKeys.AVAILABLE_LOCALES, instance.getAvailableLocales())
      engine.state?.set?.(i18nStateKeys.CONFIG, options)

      // 注册 i18n 到 engine
      if (engine.setI18n) {
        engine.setI18n(instance)
      }
      else {
        (engine as any).i18n = instance
      }

      // 注册 i18n 服务到容器
      const container = (context as any).container || (engine as any).container
      if (container?.singleton) {
        container.singleton('i18n', instance)
      }

      // 注册 API 到 API 注册表
      if (engine.api) {
        engine.api.register({
          name: 'i18n',
          version,
          getLocale: () => instance!.locale,
          setLocale: (locale: string) => instance!.setLocale(locale),
          t: (key: string, params?: Record<string, any>) => instance!.t(key, params),
          getAvailableLocales: () => instance!.getAvailableLocales(),
          addLocale: (locale: string, msgs: Record<string, any>) => instance!.addLocale(locale, msgs),
          removeLocale: (locale: string) => instance!.removeLocale(locale),
          context: pluginContext,
        })
      }

      // 发射安装完成事件
      engine.events?.emit?.(i18nEventKeys.INSTALLED, { locale: instance.locale })

      // 触发 onReady 回调
      if (onReady && pluginContext) {
        try {
          await onReady(pluginContext)
        }
        catch (e) {
          engine.logger?.error?.('[I18n Plugin] onReady error:', e)
        }
      }

      // 执行 afterInstall 钩子
      await hooks?.onAfterInstall?.()

      engine.logger?.info?.('[I18n Plugin] Installed successfully')
    },

    async uninstall(context: any) {
      const engine: EngineLike = context?.engine || context
      if (!engine) return

      engine.logger?.info?.('[I18n Plugin] Uninstalling...')

      // 清理状态
      engine.state?.delete?.(i18nStateKeys.INSTANCE)
      engine.state?.delete?.(i18nStateKeys.LOCALE)
      engine.state?.delete?.(i18nStateKeys.FALLBACK_LOCALE)
      engine.state?.delete?.(i18nStateKeys.AVAILABLE_LOCALES)
      engine.state?.delete?.(i18nStateKeys.CONFIG)

      // 注销 API
      engine.api?.unregister('i18n')

      // 清理 i18n 实例
      if (instance && 'destroy' in instance) {
        instance.destroy()
      }

      // 清除引用
      if (engine.setI18n) {
        engine.setI18n(null as any)
      }
      else {
        (engine as any).i18n = null
      }

      instance = null
      pluginContext = null

      engine.events?.emit?.(i18nEventKeys.UNINSTALLED, {})
      engine.logger?.info?.('[I18n Plugin] Uninstalled successfully')
    },

    /**
     * 获取 i18n 实例（供外部访问）
     */
    getInstance(): I18nInstance | null {
      return instance
    },

    /**
     * 获取插件上下文
     */
    getContext(): I18nPluginContext | null {
      return pluginContext
    },
  }
}
