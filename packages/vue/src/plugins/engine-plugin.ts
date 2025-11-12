/**
 * Vue 3 I18n Engine 插件
 *
 * 将 Vue I18n 功能集成到 LDesign Engine 中
 * 
 * @module plugins/engine-plugin
 */

import type { Plugin } from '@ldesign/engine-core/types'
import type { I18nConfig, I18nInstance } from '@ldesign/i18n-core'
import { OptimizedI18n } from '@ldesign/i18n-core'
import { createI18nPlugin } from '../plugin'
import { I18N_SYMBOL } from '../constants'

/**
 * I18n Engine 插件配置选项
 */
export interface I18nEnginePluginOptions {
  /** 插件名称 */
  name?: string
  /** 插件版本 */
  version?: string
  /** 是否启用调试模式 */
  debug?: boolean
  /** 是否注册全局属性 */
  globalProperties?: boolean
  /** 是否注册指令 */
  directives?: boolean
  /** 是否注册组件 */
  components?: boolean
  /** 预加载的语言包 */
  preloadLocales?: string[]

  // I18n 核心配置
  /** 当前语言 */
  locale?: string
  /** 回退语言 */
  fallbackLocale?: string
  /** 语言包 */
  messages?: Record<string, Record<string, any>>
  /** 是否启用缓存 */
  cache?: boolean
  /** 缓存大小 */
  cacheSize?: number
  /** 是否启用性能监控 */
  performance?: boolean
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
    preloadLocales = [],
    ...i18nConfig
  } = options

  if (debug) {
    console.log('[Vue I18n Plugin] createI18nEnginePlugin called with options:', options)
  }

  // 标志，防止重复安装到 Vue 应用
  let vueInstalled = false

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
          locale: i18nConfig.locale,
          fallbackLocale: i18nConfig.fallbackLocale,
        })

        // 创建 i18n 实例
        const i18n = new OptimizedI18n(i18nConfig)

        // 初始化 i18n
        await i18n.init()

        // 预加载语言包
        if (preloadLocales.length > 0) {
          for (const locale of preloadLocales) {
            if (locale !== i18n.locale) {
              // OptimizedI18n 使用 addLocale 而不是 loadLocale
              // 如果消息已经在 messages 中提供，则跳过
              if (!i18nConfig.messages?.[locale]) {
                engine.logger?.warn?.(`Locale ${locale} not found in messages, skipping preload`)
              }
            }
          }
        }

        // 保存 i18n 配置到状态
        engine.state?.set?.('i18n:locale', i18n.locale)
        engine.state?.set?.('i18n:fallbackLocale', i18n.fallbackLocale)
        engine.state?.set?.('i18n:availableLocales', i18n.getAvailableLocales())

        // 监听语言切换事件
        i18n.on('localeChanged', ({ locale, oldLocale }) => {
          engine.logger?.info?.(`Locale changed: ${oldLocale} -> ${locale}`)
          engine.state?.set?.('i18n:locale', locale)
          engine.events?.emit?.('i18n:localeChanged', { locale, oldLocale })
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

        // 发射 i18n 安装完成事件
        engine.events?.emit?.('i18n:installed', { i18n, locale: i18n.locale })

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

        // 发射 i18n 卸载事件
        engine.events?.emit?.('i18n:uninstalled')

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

