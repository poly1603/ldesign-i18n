/**
 * @ldesign/i18n - Error Classes
 * 自定义错误类层级，提供更好的错误处理和调试体验
 */

/**
 * I18n 基础错误类
 * 
 * 所有 i18n 相关错误的基类
 */
export class I18nError extends Error {
  /** 错误代码 */
  public readonly code: string
  /** 错误详情 */
  public readonly details?: any
  /** 时间戳 */
  public readonly timestamp: number

  constructor(message: string, code: string = 'I18N_ERROR', details?: any) {
    super(message)
    this.name = 'I18nError'
    this.code = code
    this.details = details
    this.timestamp = Date.now()

    // 维护正确的原型链
    Object.setPrototypeOf(this, I18nError.prototype)
  }

  /**
   * 转换为 JSON 格式
   */
  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      details: this.details,
      timestamp: this.timestamp,
      stack: this.stack,
    }
  }
}

/**
 * 加载错误
 * 
 * 语言包或资源加载失败时抛出
 */
export class LoadError extends I18nError {
  /** 加载的资源标识 */
  public readonly resource: string
  /** 原始错误 */
  public readonly cause?: Error

  constructor(message: string, resource: string, cause?: Error, details?: any) {
    super(message, 'LOAD_ERROR', details)
    this.name = 'LoadError'
    this.resource = resource
    this.cause = cause

    Object.setPrototypeOf(this, LoadError.prototype)
  }

  toJSON() {
    return {
      ...super.toJSON(),
      resource: this.resource,
      cause: this.cause?.message,
    }
  }
}

/**
 * 翻译错误
 * 
 * 翻译过程中发生的错误
 */
export class TranslationError extends I18nError {
  /** 翻译键 */
  public readonly key: string
  /** 语言 */
  public readonly locale: string
  /** 命名空间 */
  public readonly namespace?: string

  constructor(
    message: string,
    key: string,
    locale: string,
    namespace?: string,
    details?: any,
  ) {
    super(message, 'TRANSLATION_ERROR', details)
    this.name = 'TranslationError'
    this.key = key
    this.locale = locale
    this.namespace = namespace

    Object.setPrototypeOf(this, TranslationError.prototype)
  }

  toJSON() {
    return {
      ...super.toJSON(),
      key: this.key,
      locale: this.locale,
      namespace: this.namespace,
    }
  }
}

/**
 * 配置错误
 * 
 * 配置不正确时抛出
 */
export class ConfigError extends I18nError {
  /** 配置项名称 */
  public readonly configKey: string

  constructor(message: string, configKey: string, details?: any) {
    super(message, 'CONFIG_ERROR', details)
    this.name = 'ConfigError'
    this.configKey = configKey

    Object.setPrototypeOf(this, ConfigError.prototype)
  }

  toJSON() {
    return {
      ...super.toJSON(),
      configKey: this.configKey,
    }
  }
}

/**
 * 验证错误
 * 
 * 数据验证失败时抛出
 */
export class ValidationError extends I18nError {
  /** 验证的字段 */
  public readonly field: string
  /** 验证规则 */
  public readonly rule?: string

  constructor(message: string, field: string, rule?: string, details?: any) {
    super(message, 'VALIDATION_ERROR', details)
    this.name = 'ValidationError'
    this.field = field
    this.rule = rule

    Object.setPrototypeOf(this, ValidationError.prototype)
  }

  toJSON() {
    return {
      ...super.toJSON(),
      field: this.field,
      rule: this.rule,
    }
  }
}

/**
 * 超时错误
 * 
 * 操作超时时抛出
 */
export class TimeoutError extends I18nError {
  /** 超时时间（毫秒） */
  public readonly timeout: number
  /** 操作名称 */
  public readonly operation: string

  constructor(message: string, operation: string, timeout: number, details?: any) {
    super(message, 'TIMEOUT_ERROR', details)
    this.name = 'TimeoutError'
    this.operation = operation
    this.timeout = timeout

    Object.setPrototypeOf(this, TimeoutError.prototype)
  }

  toJSON() {
    return {
      ...super.toJSON(),
      operation: this.operation,
      timeout: this.timeout,
    }
  }
}

// 导出其他错误处理工具
export { RetryHandler } from './retry-handler'
export { ErrorRecovery, ErrorLogger } from './error-recovery'

// 导出类型
export type { RetryOptions } from './retry-handler'
export type { RecoveryOptions, RecoveryStrategy } from './error-recovery'