/**
 * useI18nRoute - 路由国际化组合式函数
 * 
 * 提供路由的多语言支持
 */

import type { ComputedRef, Ref } from 'vue'
import { computed, watch } from 'vue'
import type { Locale } from '@ldesign/i18n-core'
import { useI18n } from './useI18n'

export interface RouteParams {
  [key: string]: string | number
}

export interface LocalizedRoute {
  path: string
  name?: string
  meta?: Record<string, any>
}

export interface UseI18nRouteOptions {
  /** 路由前缀策略 */
  strategy?: 'prefix' | 'prefix_except_default' | 'prefix_and_default'
  /** 默认语言 */
  defaultLocale?: Locale
  /** 路由映射表 */
  routes?: Record<Locale, Record<string, string>>
  /** 是否自动同步URL */
  autoSync?: boolean
}

export interface UseI18nRouteReturn {
  /** 本地化路由路径 */
  localePath: (path: string, locale?: Locale) => string
  /** 切换语言路由 */
  switchLocaleRoute: (locale: Locale) => string
  /** 获取当前路由的所有语言版本 */
  getLocalizedRoutes: (path: string) => Record<Locale, string>
  /** 从路径中提取语言 */
  getLocaleFromPath: (path: string) => Locale | null
  /** 移除路径中的语言前缀 */
  removeLocalePrefix: (path: string) => string
}

export function useI18nRoute(options: UseI18nRouteOptions = {}): UseI18nRouteReturn {
  const { locale, availableLocales } = useI18n()
  
  const {
    strategy = 'prefix_except_default',
    defaultLocale = 'en',
    routes = {},
    autoSync = false,
  } = options

  /**
   * 本地化路由路径
   */
  const localePath = (path: string, targetLocale?: Locale): string => {
    const loc = targetLocale || locale.value
    
    // 移除现有的语言前缀
    const cleanPath = removeLocalePrefix(path)
    
    // 如果有自定义路由映射
    if (routes[loc] && routes[loc][cleanPath]) {
      path = routes[loc][cleanPath]
    }
    
    // 根据策略添加前缀
    if (strategy === 'prefix') {
      return `/${loc}${cleanPath}`
    } else if (strategy === 'prefix_except_default') {
      return loc === defaultLocale ? cleanPath : `/${loc}${cleanPath}`
    } else if (strategy === 'prefix_and_default') {
      return `/${loc}${cleanPath}`
    }
    
    return cleanPath
  }

  /**
   * 切换语言路由
   */
  const switchLocaleRoute = (targetLocale: Locale): string => {
    if (typeof window === 'undefined') {
      return '/'
    }
    
    const currentPath = window.location.pathname
    const cleanPath = removeLocalePrefix(currentPath)
    
    return localePath(cleanPath, targetLocale)
  }

  /**
   * 获取当前路由的所有语言版本
   */
  const getLocalizedRoutes = (path: string): Record<Locale, string> => {
    const cleanPath = removeLocalePrefix(path)
    const result: Record<Locale, string> = {}
    
    availableLocales.value.forEach(loc => {
      result[loc] = localePath(cleanPath, loc)
    })
    
    return result
  }

  /**
   * 从路径中提取语言
   */
  const getLocaleFromPath = (path: string): Locale | null => {
    const segments = path.split('/').filter(Boolean)
    
    if (segments.length === 0) {
      return null
    }
    
    const firstSegment = segments[0]
    
    // 检查第一个片段是否是有效的语言代码
    if (availableLocales.value.includes(firstSegment)) {
      return firstSegment
    }
    
    return null
  }

  /**
   * 移除路径中的语言前缀
   */
  const removeLocalePrefix = (path: string): string => {
    const detectedLocale = getLocaleFromPath(path)
    
    if (detectedLocale) {
      return path.replace(new RegExp(`^/${detectedLocale}`), '') || '/'
    }
    
    return path
  }

  // 自动同步URL（如果启用）
  if (autoSync && typeof window !== 'undefined') {
    watch(locale, (newLocale, oldLocale) => {
      if (newLocale !== oldLocale) {
        const newPath = switchLocaleRoute(newLocale)
        if (window.location.pathname !== newPath) {
          window.history.pushState({}, '', newPath)
        }
      }
    })
  }

  return {
    localePath,
    switchLocaleRoute,
    getLocalizedRoutes,
    getLocaleFromPath,
    removeLocalePrefix,
  }
}