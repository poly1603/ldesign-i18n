/**
 * useI18nValidation - 表单验证国际化组合式函数
 * 
 * 提供表单验证消息的国际化支持
 */

import type { ComputedRef, Ref } from 'vue'
import { computed, unref } from 'vue'
import type { InterpolationParams } from '@ldesign/i18n-core'
import { useI18n } from './useI18n'

/**
 * 验证规则
 */
export interface ValidationRule {
  /** 规则名称 */
  name: string
  /** 验证函数 */
  validator: (value: any, params?: any) => boolean | Promise<boolean>
  /** 错误消息键 */
  messageKey: string
  /** 参数 */
  params?: Record<string, any>
}

/**
 * 验证结果
 */
export interface ValidationResult {
  /** 是否有效 */
  valid: boolean
  /** 错误消息 */
  message?: string
  /** 规则名称 */
  rule?: string
}

/**
 * 字段验证配置
 */
export interface FieldValidation {
  /** 字段名 */
  field: string
  /** 验证规则 */
  rules: ValidationRule[]
  /** 自定义消息键前缀 */
  messagePrefix?: string
}

export interface UseI18nValidationReturn {
  /** 验证单个值 */
  validate: (
    value: any,
    rules: ValidationRule | ValidationRule[]
  ) => Promise<ValidationResult>

  /** 验证字段 */
  validateField: (
    field: string,
    value: any,
    rules: ValidationRule[]
  ) => Promise<ValidationResult>

  /** 批量验证 */
  validateAll: (
    data: Record<string, any>,
    config: FieldValidation[]
  ) => Promise<Record<string, ValidationResult>>

  /** 获取验证消息 */
  getValidationMessage: (
    rule: string,
    params?: InterpolationParams
  ) => ComputedRef<string>

  /** 常用验证规则 */
  rules: {
    required: (messageKey?: string) => ValidationRule
    email: (messageKey?: string) => ValidationRule
    min: (min: number, messageKey?: string) => ValidationRule
    max: (max: number, messageKey?: string) => ValidationRule
    minLength: (length: number, messageKey?: string) => ValidationRule
    maxLength: (length: number, messageKey?: string) => ValidationRule
    pattern: (pattern: RegExp, messageKey?: string) => ValidationRule
    numeric: (messageKey?: string) => ValidationRule
    alphanumeric: (messageKey?: string) => ValidationRule
    url: (messageKey?: string) => ValidationRule
    phone: (messageKey?: string) => ValidationRule
    custom: (
      name: string,
      validator: (value: any) => boolean | Promise<boolean>,
      messageKey: string
    ) => ValidationRule
  }
}

export function useI18nValidation(): UseI18nValidationReturn {
  const { t } = useI18n()

  /**
   * 验证单个值
   */
  const validate = async (
    value: any,
    rules: ValidationRule | ValidationRule[]
  ): Promise<ValidationResult> => {
    const ruleList = Array.isArray(rules) ? rules : [rules]

    for (const rule of ruleList) {
      const isValid = await rule.validator(value, rule.params)

      if (!isValid) {
        const message = t(rule.messageKey, rule.params)
        return {
          valid: false,
          message,
          rule: rule.name,
        }
      }
    }

    return { valid: true }
  }

  /**
   * 验证字段
   */
  const validateField = async (
    field: string,
    value: any,
    rules: ValidationRule[]
  ): Promise<ValidationResult> => {
    const result = await validate(value, rules)

    if (!result.valid && result.message) {
      // 添加字段名到消息参数
      result.message = t(result.message as any, { field })
    }

    return result
  }

  /**
   * 批量验证
   */
  const validateAll = async (
    data: Record<string, any>,
    config: FieldValidation[]
  ): Promise<Record<string, ValidationResult>> => {
    const results: Record<string, ValidationResult> = {}

    await Promise.all(
      config.map(async (fieldConfig) => {
        const value = data[fieldConfig.field]
        const result = await validateField(
          fieldConfig.field,
          value,
          fieldConfig.rules
        )
        results[fieldConfig.field] = result
      })
    )

    return results
  }

  /**
   * 获取验证消息
   */
  const getValidationMessage = (
    rule: string,
    params?: InterpolationParams
  ): ComputedRef<string> => {
    return computed(() => {
      const key = `validation.${rule}`
      return t(key, params)
    })
  }

  /**
   * 常用验证规则
   */
  const rules = {
    required: (messageKey = 'validation.required'): ValidationRule => ({
      name: 'required',
      messageKey,
      validator: (value) => {
        if (value === null || value === undefined) return false
        if (typeof value === 'string') return value.trim().length > 0
        if (Array.isArray(value)) return value.length > 0
        return true
      },
    }),

    email: (messageKey = 'validation.email'): ValidationRule => ({
      name: 'email',
      messageKey,
      validator: (value) => {
        if (!value) return true
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        return emailRegex.test(String(value))
      },
    }),

    min: (min: number, messageKey = 'validation.min'): ValidationRule => ({
      name: 'min',
      messageKey,
      params: { min },
      validator: (value) => {
        if (value === null || value === undefined) return true
        const num = Number(value)
        return !isNaN(num) && num >= min
      },
    }),

    max: (max: number, messageKey = 'validation.max'): ValidationRule => ({
      name: 'max',
      messageKey,
      params: { max },
      validator: (value) => {
        if (value === null || value === undefined) return true
        const num = Number(value)
        return !isNaN(num) && num <= max
      },
    }),

    minLength: (length: number, messageKey = 'validation.minLength'): ValidationRule => ({
      name: 'minLength',
      messageKey,
      params: { length },
      validator: (value) => {
        if (!value) return true
        return String(value).length >= length
      },
    }),

    maxLength: (length: number, messageKey = 'validation.maxLength'): ValidationRule => ({
      name: 'maxLength',
      messageKey,
      params: { length },
      validator: (value) => {
        if (!value) return true
        return String(value).length <= length
      },
    }),

    pattern: (pattern: RegExp, messageKey = 'validation.pattern'): ValidationRule => ({
      name: 'pattern',
      messageKey,
      params: { pattern: pattern.toString() },
      validator: (value) => {
        if (!value) return true
        return pattern.test(String(value))
      },
    }),

    numeric: (messageKey = 'validation.numeric'): ValidationRule => ({
      name: 'numeric',
      messageKey,
      validator: (value) => {
        if (!value) return true
        return !isNaN(Number(value))
      },
    }),

    alphanumeric: (messageKey = 'validation.alphanumeric'): ValidationRule => ({
      name: 'alphanumeric',
      messageKey,
      validator: (value) => {
        if (!value) return true
        return /^[a-zA-Z0-9]+$/.test(String(value))
      },
    }),

    url: (messageKey = 'validation.url'): ValidationRule => ({
      name: 'url',
      messageKey,
      validator: (value) => {
        if (!value) return true
        try {
          new URL(String(value))
          return true
        } catch {
          return false
        }
      },
    }),

    phone: (messageKey = 'validation.phone'): ValidationRule => ({
      name: 'phone',
      messageKey,
      validator: (value) => {
        if (!value) return true
        // 基本的国际电话号码格式
        const phoneRegex = /^[+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,9}$/
        return phoneRegex.test(String(value))
      },
    }),

    custom: (
      name: string,
      validator: (value: any) => boolean | Promise<boolean>,
      messageKey: string
    ): ValidationRule => ({
      name,
      messageKey,
      validator,
    }),
  }

  return {
    validate,
    validateField,
    validateAll,
    getValidationMessage,
    rules,
  }
}