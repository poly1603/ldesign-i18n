/**
 * useI18nFormat - 格式化工具组合式函数
 * 
 * 提供日期、数字、货币等格式化功能
 */

import type { ComputedRef, Ref } from 'vue'
import { computed, unref } from 'vue'
import { useI18n } from './useI18n'

export interface UseI18nFormatReturn {
  // 数字格式化
  formatNumber: (value: number | Ref<number>, options?: Intl.NumberFormatOptions) => ComputedRef<string>
  formatPercent: (value: number | Ref<number>, decimals?: number) => ComputedRef<string>
  formatCompact: (value: number | Ref<number>) => ComputedRef<string>
  
  // 货币格式化
  formatCurrency: (
    value: number | Ref<number>,
    currency?: string | Ref<string>,
    options?: Intl.NumberFormatOptions
  ) => ComputedRef<string>
  
  // 日期格式化
  formatDate: (value: Date | number | string | Ref<Date | number | string>, options?: Intl.DateTimeFormatOptions) => ComputedRef<string>
  formatTime: (value: Date | number | string | Ref<Date | number | string>) => ComputedRef<string>
  formatDateTime: (value: Date | number | string | Ref<Date | number | string>) => ComputedRef<string>
  formatRelativeTime: (value: Date | number | string | Ref<Date | number | string>) => ComputedRef<string>
  
  // 列表格式化
  formatList: (items: string[] | Ref<string[]>, type?: 'conjunction' | 'disjunction' | 'unit') => ComputedRef<string>
  
  // 文件大小格式化
  formatFileSize: (bytes: number | Ref<number>, decimals?: number) => ComputedRef<string>
  
  // 持续时间格式化
  formatDuration: (ms: number | Ref<number>) => ComputedRef<string>
}

export function useI18nFormat(): UseI18nFormatReturn {
  const { i18n, locale } = useI18n()

  /**
   * 格式化数字
   */
  const formatNumber = (
    value: number | Ref<number>,
    options?: Intl.NumberFormatOptions
  ): ComputedRef<string> => {
    return computed(() => {
      const num = unref(value)
      return i18n.number(num, options)
    })
  }

  /**
   * 格式化百分比
   */
  const formatPercent = (
    value: number | Ref<number>,
    decimals = 2
  ): ComputedRef<string> => {
    return computed(() => {
      const num = unref(value)
      return i18n.number(num, {
        style: 'percent',
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })
    })
  }

  /**
   * 格式化紧凑数字（如 1K, 1M）
   */
  const formatCompact = (value: number | Ref<number>): ComputedRef<string> => {
    return computed(() => {
      const num = unref(value)
      return i18n.number(num, {
        notation: 'compact',
        compactDisplay: 'short',
      })
    })
  }

  /**
   * 格式化货币
   */
  const formatCurrency = (
    value: number | Ref<number>,
    currency: string | Ref<string> = 'USD',
    options?: Intl.NumberFormatOptions
  ): ComputedRef<string> => {
    return computed(() => {
      const num = unref(value)
      const curr = unref(currency)
      return i18n.currency(num, curr, options)
    })
  }

  /**
   * 格式化日期
   */
  const formatDate = (
    value: Date | number | string | Ref<Date | number | string>,
    options?: Intl.DateTimeFormatOptions
  ): ComputedRef<string> => {
    return computed(() => {
      const date = unref(value)
      return i18n.date(date, options || { dateStyle: 'medium' })
    })
  }

  /**
   * 格式化时间
   */
  const formatTime = (
    value: Date | number | string | Ref<Date | number | string>
  ): ComputedRef<string> => {
    return computed(() => {
      const date = unref(value)
      return i18n.date(date, { timeStyle: 'medium' })
    })
  }

  /**
   * 格式化日期时间
   */
  const formatDateTime = (
    value: Date | number | string | Ref<Date | number | string>
  ): ComputedRef<string> => {
    return computed(() => {
      const date = unref(value)
      return i18n.date(date, {
        dateStyle: 'medium',
        timeStyle: 'short',
      })
    })
  }

  /**
   * 格式化相对时间
   */
  const formatRelativeTime = (
    value: Date | number | string | Ref<Date | number | string>
  ): ComputedRef<string> => {
    return computed(() => {
      const date = unref(value)
      return i18n.relativeTime(date)
    })
  }

  /**
   * 格式化列表
   */
  const formatList = (
    items: string[] | Ref<string[]>,
    type: 'conjunction' | 'disjunction' | 'unit' = 'conjunction'
  ): ComputedRef<string> => {
    return computed(() => {
      const list = unref(items)
      try {
        return new Intl.ListFormat(locale.value, { type }).format(list)
      } catch {
        return list.join(', ')
      }
    })
  }

  /**
   * 格式化文件大小
   */
  const formatFileSize = (
    bytes: number | Ref<number>,
    decimals = 2
  ): ComputedRef<string> => {
    return computed(() => {
      const size = unref(bytes)
      
      if (size === 0) return '0 Bytes'
      
      const k = 1024
      const dm = decimals < 0 ? 0 : decimals
      const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB']
      
      const i = Math.floor(Math.log(size) / Math.log(k))
      const value = size / Math.pow(k, i)
      
      return `${value.toFixed(dm)} ${sizes[i]}`
    })
  }

  /**
   * 格式化持续时间
   */
  const formatDuration = (ms: number | Ref<number>): ComputedRef<string> => {
    return computed(() => {
      const duration = unref(ms)
      
      const seconds = Math.floor(duration / 1000)
      const minutes = Math.floor(seconds / 60)
      const hours = Math.floor(minutes / 60)
      const days = Math.floor(hours / 24)

      if (days > 0) {
        return `${days}d ${hours % 24}h`
      } else if (hours > 0) {
        return `${hours}h ${minutes % 60}m`
      } else if (minutes > 0) {
        return `${minutes}m ${seconds % 60}s`
      } else {
        return `${seconds}s`
      }
    })
  }

  return {
    formatNumber,
    formatPercent,
    formatCompact,
    formatCurrency,
    formatDate,
    formatTime,
    formatDateTime,
    formatRelativeTime,
    formatList,
    formatFileSize,
    formatDuration,
  }
}