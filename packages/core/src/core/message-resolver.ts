/**
 * @ldesign/i18n - Message Resolver
 * 统一的消息解析逻辑，避免代码重复
 */

import type { Locale, MessageKey, Messages, TranslateOptions } from '../types'
import { getNestedValue, isPlainObject, isString } from '../utils/helpers'
import type { PluralizationEngine } from './pluralization'

/**
 * 消息解析器配置
 */
export interface MessageResolverConfig {
  /** 键分隔符 */
  keySeparator: string
  /** 命名空间分隔符 */
  namespaceSeparator: string
  /** 默认命名空间 */
  defaultNamespace: string
  /** 复数化引擎 */
  pluralization: PluralizationEngine
}

/**
 * 消息解析结果
 */
export interface ResolveResult {
  /** 解析到的消息 */
  message?: string
  /** 是否找到消息 */
  found: boolean
  /** 使用的语言（可能是降级语言） */
  usedLocale?: Locale
}

/**
 * 统一的消息解析器
 * 
 * 提取公共的消息解析逻辑，避免在 resolveMessageOptimized 和 
 * resolveFallbackOptimized 中重复代码
 * 
 * ## 主要功能
 * - 支持命名空间解析
 * - 支持嵌套键路径
 * - 支持复数形式
 * - 支持降级语言链
 * 
 * @example
 * ```typescript
 * const resolver = new MessageResolver(config);
 * const result = resolver.resolve('app.title', 'zh-CN', messages, options);
 * if (result.found) {
 *   console.log(result.message);
 * }
 * ```
 */
export class MessageResolver {
  private config: MessageResolverConfig

  constructor(config: MessageResolverConfig) {
    this.config = config
  }

  /**
   * 解析消息
   * 
   * @param key - 翻译键
   * @param locale - 目标语言
   * @param messages - 消息对象
   * @param namespace - 命名空间
   * @param options - 翻译选项
   * @returns 解析结果
   */
  resolve(
    key: MessageKey,
    locale: Locale,
    messages: Messages | undefined,
    _namespace: string,
    options: TranslateOptions,
  ): ResolveResult {
    if (!messages) {
      return { found: false }
    }

    // 处理键中的命名空间（如 'common:app.title'）
    let resolvedKey = key
    const nsIndex = this.config.namespaceSeparator
      ? key.indexOf(this.config.namespaceSeparator)
      : -1

    if (nsIndex > -1) {
      // const keyNamespace = key.substring(0, nsIndex)
      resolvedKey = key.substring(nsIndex + this.config.namespaceSeparator.length)
      
      // 如果键中指定了命名空间，则从该命名空间获取消息
      // 注意：这里需要调用者传入完整的命名空间映射
      // 为了保持解析器的纯粹性，这里暂时只处理当前 messages
    }

    // 使用键分隔符获取嵌套值
    const value = getNestedValue(messages, resolvedKey, this.config.keySeparator)

    if (value === undefined) {
      return { found: false }
    }

    // 如果是字符串，直接返回
    if (isString(value)) {
      return {
        found: true,
        message: value,
        usedLocale: locale,
      }
    }

    // 如果是对象且有 count 参数，处理复数形式
    if (isPlainObject(value) && options.count !== undefined) {
      const pluralMessage = this.config.pluralization.selectPlural(
        value as any,
        options.count,
        locale,
      )
      
      if (pluralMessage !== undefined) {
        return {
          found: true,
          message: pluralMessage,
          usedLocale: locale,
        }
      }
    }

    return { found: false }
  }

  /**
   * 从命名空间映射中解析消息
   * 
   * @param key - 翻译键
   * @param locale - 目标语言
   * @param namespaces - 命名空间映射
   * @param options - 翻译选项
   * @returns 解析结果
   */
  resolveFromNamespace(
    key: MessageKey,
    locale: Locale,
    namespaces: Map<string, Map<Locale, Messages>>,
    options: TranslateOptions,
  ): ResolveResult {
    // 检查键中是否包含命名空间
    const nsIndex = this.config.namespaceSeparator 
      ? key.indexOf(this.config.namespaceSeparator) 
      : -1

    if (nsIndex > -1) {
      const keyNamespace = key.substring(0, nsIndex)
      const resolvedKey = key.substring(nsIndex + this.config.namespaceSeparator.length)
      
      const nsMessages = namespaces.get(keyNamespace)?.get(locale)
      if (nsMessages) {
        return this.resolve(resolvedKey, locale, nsMessages, keyNamespace, options)
      }
    }

    return { found: false }
  }

  /**
   * 解析降级语言链
   * 
   * @param key - 翻译键
   * @param fallbackLocales - 降级语言数组
   * @param messagesMap - 语言消息映射
   * @param namespace - 命名空间
   * @param options - 翻译选项
   * @returns 解析结果
   */
  resolveFallbackChain(
    key: MessageKey,
    fallbackLocales: Locale[],
    messagesMap: Map<Locale, Messages>,
    namespace: string,
    options: TranslateOptions,
  ): ResolveResult {
    for (const fallbackLocale of fallbackLocales) {
      // 跳过与当前语言相同的降级语言
      if (fallbackLocale === options.locale) {
        continue
      }

      const messages = messagesMap.get(fallbackLocale)
      if (!messages) {
        continue
      }

      const result = this.resolve(key, fallbackLocale, messages, namespace, options)
      if (result.found) {
        return result
      }
    }

    return { found: false }
  }

  /**
   * 从命名空间映射中解析降级语言链
   * 
   * @param key - 翻译键
   * @param fallbackLocales - 降级语言数组
   * @param namespaces - 命名空间映射
   * @param targetNamespace - 目标命名空间
   * @param options - 翻译选项
   * @returns 解析结果
   */
  resolveFallbackChainFromNamespace(
    key: MessageKey,
    fallbackLocales: Locale[],
    namespaces: Map<string, Map<Locale, Messages>>,
    targetNamespace: string,
    options: TranslateOptions,
  ): ResolveResult {
    const namespaceMessages = namespaces.get(targetNamespace)
    if (!namespaceMessages) {
      return { found: false }
    }

    return this.resolveFallbackChain(
      key,
      fallbackLocales,
      namespaceMessages,
      targetNamespace,
      options,
    )
  }
}