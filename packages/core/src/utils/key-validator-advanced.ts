/**
 * @ldesign/i18n - Advanced Key Validator
 * 高级键名验证工具，检查格式、命名约定和冲突
 */

import type { Messages, Locale } from '../types'

/**
 * 验证规则
 */
export interface ValidationRule {
  /** 规则名称 */
  name: string
  /** 规则描述 */
  description: string
  /** 验证函数 */
  validate: (key: string, value: any, context: ValidationContext) => ValidationIssue | null
}

/**
 * 验证上下文
 */
export interface ValidationContext {
  /** 所有键名 */
  allKeys: Set<string>
  /** 语言 */
  locale: Locale
  /** 命名空间 */
  namespace?: string
  /** 父键路径 */
  parentPath?: string
}

/**
 * 验证问题
 */
export interface ValidationIssue {
  /** 问题类型 */
  type: 'error' | 'warning' | 'info'
  /** 规则名称 */
  rule: string
  /** 键名 */
  key: string
  /** 问题描述 */
  message: string
  /** 建议修复方案 */
  suggestion?: string
}

/**
 * 验证报告
 */
export interface ValidationReport {
  /** 是否通过验证 */
  valid: boolean
  /** 总问题数 */
  totalIssues: number
  /** 错误数 */
  errors: number
  /** 警告数 */
  warnings: number
  /** 信息数 */
  infos: number
  /** 所有问题 */
  issues: ValidationIssue[]
  /** 验证的键总数 */
  totalKeys: number
}

/**
 * 命名约定
 */
export type NamingConvention = 'camelCase' | 'snake_case' | 'kebab-case' | 'dot.notation'

/**
 * 验证选项
 */
export interface KeyValidatorOptions {
  /** 命名约定 */
  namingConvention?: NamingConvention
  /** 最大键长度 */
  maxKeyLength?: number
  /** 最大嵌套深度 */
  maxDepth?: number
  /** 是否允许空值 */
  allowEmptyValues?: boolean
  /** 是否检查重复键 */
  checkDuplicates?: boolean
  /** 自定义规则 */
  customRules?: ValidationRule[]
}

/**
 * 高级键名验证器
 * 
 * 提供全面的键名验证功能：
 * - 格式检查（命名约定、长度、深度）
 * - 冲突检测（重复键、大小写冲突）
 * - 值验证（空值、类型）
 * - 命名建议
 * 
 * @example
 * ```typescript
 * const validator = new KeyValidator({
 *   namingConvention: 'camelCase',
 *   maxKeyLength: 50,
 *   maxDepth: 5,
 * });
 * 
 * const report = validator.validate(messages, 'zh-CN');
 * 
 * if (!report.valid) {
 *   console.log(`发现 ${report.errors} 个错误`);
 *   report.issues.forEach(issue => {
 *     console.log(`[${issue.type}] ${issue.key}: ${issue.message}`);
 *   });
 * }
 * ```
 */
export class KeyValidator {
  private options: Required<KeyValidatorOptions>
  private builtInRules: ValidationRule[]

  constructor(options: KeyValidatorOptions = {}) {
    this.options = {
      namingConvention: options.namingConvention || 'camelCase',
      maxKeyLength: options.maxKeyLength || 100,
      maxDepth: options.maxDepth || 10,
      allowEmptyValues: options.allowEmptyValues ?? false,
      checkDuplicates: options.checkDuplicates ?? true,
      customRules: options.customRules || [],
    }

    this.builtInRules = this.createBuiltInRules()
  }

  /**
   * 验证消息对象
   * 
   * @param messages - 消息对象
   * @param locale - 语言
   * @param namespace - 命名空间
   * @returns 验证报告
   */
  validate(
    messages: Messages,
    locale: Locale,
    namespace?: string,
  ): ValidationReport {
    const issues: ValidationIssue[] = []
    const allKeys = new Set<string>()

    // 第一遍：收集所有键
    this.collectKeys(messages, '', allKeys)

    // 第二遍：验证每个键
    const context: ValidationContext = {
      allKeys,
      locale,
      namespace,
    }

    this.validateObject(messages, '', context, issues)

    // 统计问题
    const errors = issues.filter(i => i.type === 'error').length
    const warnings = issues.filter(i => i.type === 'warning').length
    const infos = issues.filter(i => i.type === 'info').length

    return {
      valid: errors === 0,
      totalIssues: issues.length,
      errors,
      warnings,
      infos,
      issues,
      totalKeys: allKeys.size,
    }
  }

  /**
   * 验证单个键名
   * 
   * @param key - 键名
   * @param value - 值
   * @param context - 验证上下文
   * @returns 验证问题数组
   */
  validateKey(
    key: string,
    value: any,
    context: ValidationContext,
  ): ValidationIssue[] {
    const issues: ValidationIssue[] = []
    const allRules = [...this.builtInRules, ...this.options.customRules]

    for (const rule of allRules) {
      const issue = rule.validate(key, value, context)
      if (issue) {
        issues.push(issue)
      }
    }

    return issues
  }

  /**
   * 创建内置验证规则
   */
  private createBuiltInRules(): ValidationRule[] {
    return [
      // 规则1: 命名约定检查
      {
        name: 'naming-convention',
        description: '检查键名是否符合命名约定',
        validate: (key, _value, _context) => {
          if (!this.checkNamingConvention(key)) {
            return {
              type: 'warning',
              rule: 'naming-convention',
              key,
              message: `键名 "${key}" 不符合 ${this.options.namingConvention} 命名约定`,
              suggestion: this.suggestNaming(key),
            }
          }
          return null
        },
      },

      // 规则2: 键长度检查
      {
        name: 'key-length',
        description: '检查键名长度',
        validate: (key, _value, _context) => {
          if (key.length > this.options.maxKeyLength) {
            return {
              type: 'warning',
              rule: 'key-length',
              key,
              message: `键名长度 ${key.length} 超过最大限制 ${this.options.maxKeyLength}`,
              suggestion: '考虑使用更短的键名',
            }
          }
          return null
        },
      },

      // 规则3: 嵌套深度检查
      {
        name: 'max-depth',
        description: '检查嵌套深度',
        validate: (key, _value, _context) => {
          const depth = key.split('.').length
          if (depth > this.options.maxDepth) {
            return {
              type: 'warning',
              rule: 'max-depth',
              key,
              message: `嵌套深度 ${depth} 超过最大限制 ${this.options.maxDepth}`,
              suggestion: '考虑重构键的层级结构',
            }
          }
          return null
        },
      },

      // 规则4: 空值检查
      {
        name: 'empty-value',
        description: '检查空值',
        validate: (key, value, _context) => {
          if (!this.options.allowEmptyValues && (value === '' || value === null || value === undefined)) {
            return {
              type: 'error',
              rule: 'empty-value',
              key,
              message: `键 "${key}" 的值为空`,
              suggestion: '提供有效的翻译值或删除该键',
            }
          }
          return null
        },
      },

      // 规则5: 特殊字符检查
      {
        name: 'special-chars',
        description: '检查特殊字符',
        validate: (key, _value, _context) => {
          // 只允许字母、数字、点、下划线、连字符
          const invalidChars = key.match(/[^a-zA-Z0-9._-]/g)
          if (invalidChars) {
            return {
              type: 'error',
              rule: 'special-chars',
              key,
              message: `键名包含无效字符: ${invalidChars.join(', ')}`,
              suggestion: '只使用字母、数字、点、下划线和连字符',
            }
          }
          return null
        },
      },

      // 规则6: 大小写冲突检查
      {
        name: 'case-conflict',
        description: '检查大小写冲突',
        validate: (key, _value, context) => {
          if (!this.options.checkDuplicates) {
            return null
          }

          const lowerKey = key.toLowerCase()
          for (const existingKey of context.allKeys) {
            if (existingKey !== key && existingKey.toLowerCase() === lowerKey) {
              return {
                type: 'error',
                rule: 'case-conflict',
                key,
                message: `键名与 "${existingKey}" 存在大小写冲突`,
                suggestion: '使用不同的键名以避免混淆',
              }
            }
          }
          return null
        },
      },

      // 规则7: 保留关键字检查
      {
        name: 'reserved-keywords',
        description: '检查保留关键字',
        validate: (key, _value, _context) => {
          const reservedKeywords = [
            'constructor',
            'prototype',
            '__proto__',
            'toString',
            'valueOf',
            'hasOwnProperty',
          ]
          const segments = key.split('.')
          const hasReserved = segments.some(seg => reservedKeywords.includes(seg))

          if (hasReserved) {
            return {
              type: 'error',
              rule: 'reserved-keywords',
              key,
              message: `键名包含保留关键字`,
              suggestion: '避免使用 JavaScript 保留关键字',
            }
          }
          return null
        },
      },

      // 规则8: 数字开头检查
      {
        name: 'starts-with-number',
        description: '检查是否以数字开头',
        validate: (key, _value, _context) => {
          if (/^\d/.test(key)) {
            return {
              type: 'warning',
              rule: 'starts-with-number',
              key,
              message: `键名以数字开头`,
              suggestion: '键名最好以字母开头',
            }
          }
          return null
        },
      },

      // 规则9: 连续点号检查
      {
        name: 'consecutive-dots',
        description: '检查连续点号',
        validate: (key, _value, _context) => {
          if (key.includes('..')) {
            return {
              type: 'error',
              rule: 'consecutive-dots',
              key,
              message: `键名包含连续的点号`,
              suggestion: '移除多余的点号',
            }
          }
          return null
        },
      },

      // 规则10: 首尾点号检查
      {
        name: 'edge-dots',
        description: '检查首尾点号',
        validate: (key, _value, _context) => {
          if (key.startsWith('.') || key.endsWith('.')) {
            return {
              type: 'error',
              rule: 'edge-dots',
              key,
              message: `键名以点号开头或结尾`,
              suggestion: '移除首尾的点号',
            }
          }
          return null
        },
      },
    ]
  }

  /**
   * 验证对象
   */
  private validateObject(
    obj: any,
    prefix: string,
    context: ValidationContext,
    issues: ValidationIssue[],
  ): void {
    for (const key in obj) {
      if (!Object.prototype.hasOwnProperty.call(obj, key)) {
        continue
      }

      const fullKey = prefix ? `${prefix}.${key}` : key
      const value = obj[key]

      // 验证当前键
      const keyIssues = this.validateKey(fullKey, value, context)
      issues.push(...keyIssues)

      // 递归验证嵌套对象
      if (value && typeof value === 'object' && !Array.isArray(value)) {
        this.validateObject(value, fullKey, context, issues)
      }
    }
  }

  /**
   * 收集所有键
   */
  private collectKeys(obj: any, prefix: string, keys: Set<string>): void {
    for (const key in obj) {
      if (!Object.prototype.hasOwnProperty.call(obj, key)) {
        continue
      }

      const fullKey = prefix ? `${prefix}.${key}` : key
      keys.add(fullKey)

      const value = obj[key]
      if (value && typeof value === 'object' && !Array.isArray(value)) {
        this.collectKeys(value, fullKey, keys)
      }
    }
  }

  /**
   * 检查命名约定
   */
  private checkNamingConvention(key: string): boolean {
    const segments = key.split('.')

    for (const segment of segments) {
      let isValid = false

      switch (this.options.namingConvention) {
        case 'camelCase':
          // 首字母小写，后续单词首字母大写
          isValid = /^[a-z][a-zA-Z0-9]*$/.test(segment)
          break

        case 'snake_case':
          // 全小写，用下划线分隔
          isValid = /^[a-z][a-z0-9_]*$/.test(segment)
          break

        case 'kebab-case':
          // 全小写，用连字符分隔
          isValid = /^[a-z][a-z0-9-]*$/.test(segment)
          break

        case 'dot.notation':
          // 任何字母数字组合
          isValid = /^[a-zA-Z][a-zA-Z0-9]*$/.test(segment)
          break
      }

      if (!isValid) {
        return false
      }
    }

    return true
  }

  /**
   * 建议命名
   */
  private suggestNaming(key: string): string {
    const segments = key.split('.')

    const convertedSegments = segments.map(segment => {
      switch (this.options.namingConvention) {
        case 'camelCase':
          return this.toCamelCase(segment)
        case 'snake_case':
          return this.toSnakeCase(segment)
        case 'kebab-case':
          return this.toKebabCase(segment)
        default:
          return segment
      }
    })

    return `建议使用: ${convertedSegments.join('.')}`
  }

  /**
   * 转换为驼峰命名
   */
  private toCamelCase(str: string): string {
    return str
      .replace(/[-_](.)/g, (_, char) => char.toUpperCase())
      .replace(/^[A-Z]/, char => char.toLowerCase())
  }

  /**
   * 转换为下划线命名
   */
  private toSnakeCase(str: string): string {
    return str
      .replace(/([A-Z])/g, '_$1')
      .replace(/[-\s]/g, '_')
      .toLowerCase()
      .replace(/^_/, '')
  }

  /**
   * 转换为连字符命名
   */
  private toKebabCase(str: string): string {
    return str
      .replace(/([A-Z])/g, '-$1')
      .replace(/[_\s]/g, '-')
      .toLowerCase()
      .replace(/^-/, '')
  }
}