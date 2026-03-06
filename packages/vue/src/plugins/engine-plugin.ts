/**
 * Vue 3 I18n Engine 插件
 *
 * Vue 层薄适配器，将 core 的 engine plugin 与 Vue 应用集成
 *
 * @module plugins/engine-plugin
 */

import type { I18nInstance } from '@ldesign/i18n-core'
import {
  createI18nEnginePlugin as createCoreEnginePlugin,
  type I18nEnginePluginOptions as CorePluginOptions,
  type I18nPluginContext,
  type I18nPersistenceConfig,
  type EngineLike,
} from '@ldesign/i18n-core'
import { createI18nPlugin } from './plugin'

// Re-export core types for convenience
export type {
  I18nPluginContext,
  I18nPersistenceConfig,
  EngineLike,
} from '@ldesign/i18n-core'

/**
 * 语言检测策略
 */
export type LocaleDetectionStrategy = 'navigator' | 'cookie' | 'localStorage' | 'query' | 'path' | 'subdomain' | 'manual'

/**
 * 语言加载策略
 */
export type LocaleLoadStrategy = 'eager' | 'lazy' | 'on-demand'

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
}

/**
 * Vue I18n Engine 插件配置选项
 *
 * 继承 core 的 I18nEnginePluginOptions，新增 Vue 特有配置
 */
export interface I18nEnginePluginOptions extends CorePluginOptions {
  // ========== Vue 集成配置 ==========
  /** 是否注册全局属性 */
  globalProperties?: boolean
  /** 是否注册指令 */
  directives?: boolean
  /** 是否注册组件 */
  components?: boolean

  // ========== 语言选择器配置 ==========
  /** 语言选择器配置 */
  localeSwitcher?: LocaleSwitcherConfig
}

/**
 * I18n 预设配置
 */
export const I18nPresets = {
  /** 基础配置 */
  basic: {
    cache: true,
    cacheSize: 100,
  } as Partial<I18nEnginePluginOptions>,
  /** 开发配置 */
  development: {
    debug: true,
    warnOnMissing: true,
    logLevel: 'debug' as const,
  } as Partial<I18nEnginePluginOptions>,
  /** 生产配置 */
  production: {
    cache: true,
    cacheSize: 200,
    logLevel: 'error' as const,
  } as Partial<I18nEnginePluginOptions>,
}

/**
 * 创建 Vue 3 I18n Engine 插件
 *
 * 基于 core engine plugin，新增 Vue 层集成：
 * - 自动将 i18n 安装到 Vue 应用（provide、globalProperties、directives、components）
 * - 支持 app:created 事件延迟安装
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
) {
  const {
    // Vue-specific options
    globalProperties = true,
    directives = true,
    components = true,
    localeSwitcher,
    // Rest goes to core plugin
    ...coreOptions
  } = options

  // 创建核心 engine 插件
  const corePlugin = createCoreEnginePlugin(coreOptions)

  let vueInstalled = false

  /**
   * 将 i18n 安装到 Vue 应用
   */
  function installToVueApp(app: any, i18n: I18nInstance) {
    if (vueInstalled || !app) return
    const vuePlugin = createI18nPlugin(i18n, {
      globalProperties,
      directives,
      components,
    })
    app.use(vuePlugin)
    vueInstalled = true
  }

  return {
    name: corePlugin.name,
    version: corePlugin.version,
    dependencies: corePlugin.dependencies,

    async install(context: any) {
      // 1. 执行核心插件安装（创建 i18n 实例、注册状态/事件等）
      await corePlugin.install(context)

      const engine: EngineLike = context?.engine || context
      const i18n = corePlugin.getInstance()

      if (!i18n) {
        throw new Error('[Vue I18n Plugin] Core plugin did not create i18n instance')
      }

      // 2. 将 i18n 安装到 Vue 应用
      const app = engine.getApp?.()

      if (app && !vueInstalled) {
        installToVueApp(app, i18n)
      }
      else if (!vueInstalled) {
        // 等待 Vue 应用创建
        engine.events?.once?.('app:created', () => {
          if (vueInstalled) return
          const app = engine.getApp?.()
          if (app) {
            installToVueApp(app, i18n!)
          }
        })
      }
    },

    async uninstall(context: any) {
      await corePlugin.uninstall(context)
      vueInstalled = false
    },

    /**
     * 获取 i18n 实例
     */
    getInstance() {
      return corePlugin.getInstance()
    },

    /**
     * 获取插件上下文
     */
    getContext() {
      return corePlugin.getContext()
    },
  }
}

/**
 * 创建默认 Vue I18n Engine 插件
 */
export function createDefaultI18nEnginePlugin(
  locale: string,
  messages: Record<string, Record<string, any>>,
) {
  return createI18nEnginePlugin({
    locale,
    messages,
  })
}

/**
 * I18n 插件别名（向后兼容）
 */
export const i18nPlugin = createI18nEnginePlugin

