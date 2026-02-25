/**
 * @ldesign/i18n Engine 插件
 */
import type { I18nEnginePluginOptions } from './types'
import { createI18n } from '../core'

export const i18nStateKeys = {
  INSTANCE: 'i18n:instance' as const,
  LOCALE: 'i18n:locale' as const,
  FALLBACK_LOCALE: 'i18n:fallbackLocale' as const,
} as const

export const i18nEventKeys = {
  INSTALLED: 'i18n:installed' as const,
  UNINSTALLED: 'i18n:uninstalled' as const,
  LOCALE_CHANGED: 'i18n:localeChanged' as const,
} as const

export function createI18nEnginePlugin(options: I18nEnginePluginOptions = {}) {
  let instance: any = null
  return {
    name: 'i18n',
    version: '1.0.0',
    dependencies: options.dependencies ?? [],

    async install(context: any) {
      const engine = context.engine || context
      instance = createI18n(options as any)
      engine.state?.set(i18nStateKeys.INSTANCE, instance)
      engine.state?.set(i18nStateKeys.LOCALE, (options as any).locale ?? 'zh-CN')
      engine.events?.emit(i18nEventKeys.INSTALLED, { name: 'i18n' })
      engine.logger?.info('[I18n Plugin] installed')
    },

    async uninstall(context: any) {
      const engine = context.engine || context
      instance?.destroy?.(); instance = null
      engine.state?.delete(i18nStateKeys.INSTANCE)
      engine.state?.delete(i18nStateKeys.LOCALE)
      engine.events?.emit(i18nEventKeys.UNINSTALLED, {})
      engine.logger?.info('[I18n Plugin] uninstalled')
    },
  }
}
