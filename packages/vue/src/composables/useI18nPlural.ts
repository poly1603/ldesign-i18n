/**
 * useI18nPlural - 复数化工具组合式函数
 * 
 * 提供智能的复数形式处理
 */

import type { ComputedRef, Ref } from 'vue'
import { computed, unref } from 'vue'
import type { InterpolationParams } from '@ldesign/i18n-core'
import { useI18n } from './useI18n'

export interface UseI18nPluralReturn {
  // 基础复数化
  plural: (key: string, count: number | Ref<number>, params?: InterpolationParams) => ComputedRef<string>
  
  // 带范围的复数化
  pluralRange: (key: string, min: number | Ref<number>, max: number | Ref<number>, params?: InterpolationParams) => ComputedRef<string>
  
  // 智能复数化（自动处理常见模式）
  smartPlural: (singular: string, count: number | Ref<number>) => ComputedRef<string>
  
  // 获取复数规则
  getPluralRule: (count: number | Ref<number>) => ComputedRef<string>
}

export function useI18nPlural(): UseI18nPluralReturn {
  const { i18n, locale } = useI18n()

  /**
   * 基础复数化
   */
  const plural = (
    key: string,
    count: number | Ref<number>,
    params?: InterpolationParams
  ): ComputedRef<string> => {
    return computed(() => {
      const num = unref(count)
      return i18n.plural(key, num, { params })
    })
  }

  /**
   * 带范围的复数化
   */
  const pluralRange = (
    key: string,
    min: number | Ref<number>,
    max: number | Ref<number>,
    params?: InterpolationParams
  ): ComputedRef<string> => {
    return computed(() => {
      const minVal = unref(min)
      const maxVal = unref(max)
      const count = maxVal - minVal + 1
      
      return i18n.plural(key, count, {
        params: { ...params, min: minVal, max: maxVal, count },
      })
    })
  }

  /**
   * 智能复数化（英文）
   */
  const smartPlural = (
    singular: string,
    count: number | Ref<number>
  ): ComputedRef<string> => {
    return computed(() => {
      const num = unref(count)
      
      if (num === 1) {
        return singular
      }

      // 简单的英文复数规则
      if (singular.endsWith('s') || singular.endsWith('x') || singular.endsWith('z') ||
          singular.endsWith('ch') || singular.endsWith('sh')) {
        return `${singular}es`
      } else if (singular.endsWith('y') && !/[aeiou]y$/.test(singular)) {
        return `${singular.slice(0, -1)}ies`
      } else if (singular.endsWith('f')) {
        return `${singular.slice(0, -1)}ves`
      } else if (singular.endsWith('fe')) {
        return `${singular.slice(0, -2)}ves`
      } else if (singular.endsWith('o') && !/[aeiou]o$/.test(singular)) {
        return `${singular}es`
      } else {
        return `${singular}s`
      }
    })
  }

  /**
   * 获取复数规则
   */
  const getPluralRule = (count: number | Ref<number>): ComputedRef<string> => {
    return computed(() => {
      const num = unref(count)
      
      try {
        const rules = new Intl.PluralRules(locale.value)
        return rules.select(num)
      } catch {
        // 回退到简单规则
        if (num === 0) return 'zero'
        if (num === 1) return 'one'
        if (num === 2) return 'two'
        if (num < 5) return 'few'
        if (num < 10) return 'many'
        return 'other'
      }
    })
  }

  return {
    plural,
    pluralRange,
    smartPlural,
    getPluralRule,
  }
}