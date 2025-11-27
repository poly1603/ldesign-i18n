/**
 * useI18nMeta - SEO 和元数据国际化组合式函数
 * 
 * 自动管理页面标题、描述和其他元数据的国际化
 */

import { watch, onMounted, onUnmounted } from 'vue'
import type { Ref } from 'vue'
import { useI18n } from './useI18n'

/**
 * 元数据配置
 */
export interface MetaConfig {
  /** 标题键 */
  title?: string
  /** 描述键 */
  description?: string
  /** 关键词键 */
  keywords?: string
  /** OG标题键 */
  ogTitle?: string
  /** OG描述键 */
  ogDescription?: string
  /** OG图片URL */
  ogImage?: string
  /** Twitter卡片类型 */
  twitterCard?: 'summary' | 'summary_large_image' | 'app' | 'player'
  /** 自定义meta标签 */
  custom?: Array<{
    name?: string
    property?: string
    content: string
    translate?: boolean
  }>
  /** 标题模板 */
  titleTemplate?: string
  /** 是否自动添加语言标签 */
  autoLangTag?: boolean
}

export interface UseI18nMetaReturn {
  /** 更新元数据 */
  updateMeta: (config: MetaConfig) => void
  /** 设置标题 */
  setTitle: (titleKey: string, params?: Record<string, any>) => void
  /** 设置描述 */
  setDescription: (descKey: string, params?: Record<string, any>) => void
  /** 添加meta标签 */
  addMetaTag: (name: string, content: string, translate?: boolean) => void
  /** 移除meta标签 */
  removeMetaTag: (name: string) => void
  /** 清除所有自定义meta */
  clearMeta: () => void
}

export function useI18nMeta(initialConfig?: MetaConfig): UseI18nMetaReturn {
  const { t, locale } = useI18n()
  const managedTags = new Set<HTMLMetaElement>()
  let originalTitle = ''

  onMounted(() => {
    originalTitle = document.title

    if (initialConfig) {
      updateMeta(initialConfig)
    }
  })

  onUnmounted(() => {
    // 清理管理的标签
    managedTags.forEach(tag => {
      if (tag.parentNode) {
        tag.parentNode.removeChild(tag)
      }
    })
    managedTags.clear()

    // 恢复原标题
    if (originalTitle) {
      document.title = originalTitle
    }
  })

  /**
   * 更新元数据
   */
  const updateMeta = (config: MetaConfig): void => {
    if (typeof document === 'undefined') return

    // 更新标题
    if (config.title) {
      const title = t(config.title)
      const finalTitle = config.titleTemplate
        ? config.titleTemplate.replace('{title}', title)
        : title
      document.title = finalTitle
    }

    // 更新描述
    if (config.description) {
      const description = t(config.description)
      setOrUpdateMetaTag('description', description)
    }

    // 更新关键词
    if (config.keywords) {
      const keywords = t(config.keywords)
      setOrUpdateMetaTag('keywords', keywords)
    }

    // 更新 OG 标签
    if (config.ogTitle) {
      const ogTitle = t(config.ogTitle)
      setOrUpdateMetaTag('og:title', ogTitle, 'property')
    }

    if (config.ogDescription) {
      const ogDescription = t(config.ogDescription)
      setOrUpdateMetaTag('og:description', ogDescription, 'property')
    }

    if (config.ogImage) {
      setOrUpdateMetaTag('og:image', config.ogImage, 'property')
    }

    // 更新 Twitter 卡片
    if (config.twitterCard) {
      setOrUpdateMetaTag('twitter:card', config.twitterCard)
    }

    // 更新自定义meta标签
    if (config.custom) {
      config.custom.forEach(meta => {
        const content = meta.translate ? t(meta.content) : meta.content
        const attr = meta.property ? 'property' : 'name'
        const attrValue = meta.property || meta.name
        if (attrValue) {
          setOrUpdateMetaTag(attrValue, content, attr)
        }
      })
    }

    // 自动添加语言标签
    if (config.autoLangTag !== false) {
      document.documentElement.lang = locale.value
      setOrUpdateMetaTag('og:locale', locale.value, 'property')
    }
  }

  /**
   * 设置或更新meta标签
   */
  const setOrUpdateMetaTag = (
    name: string,
    content: string,
    attr: 'name' | 'property' = 'name'
  ): void => {
    if (typeof document === 'undefined') return

    let tag = document.querySelector(
      `meta[${attr}="${name}"]`
    ) as HTMLMetaElement

    if (tag) {
      tag.content = content
    } else {
      tag = document.createElement('meta')
      tag.setAttribute(attr, name)
      tag.content = content
      document.head.appendChild(tag)
      managedTags.add(tag)
    }
  }

  /**
   * 设置标题
   */
  const setTitle = (titleKey: string, params?: Record<string, any>): void => {
    if (typeof document === 'undefined') return
    document.title = t(titleKey, params)
  }

  /**
   * 设置描述
   */
  const setDescription = (descKey: string, params?: Record<string, any>): void => {
    const description = t(descKey, params)
    setOrUpdateMetaTag('description', description)
  }

  /**
   * 添加meta标签
   */
  const addMetaTag = (name: string, content: string, translate = false): void => {
    const finalContent = translate ? t(content) : content
    setOrUpdateMetaTag(name, finalContent)
  }

  /**
   * 移除meta标签
   */
  const removeMetaTag = (name: string): void => {
    if (typeof document === 'undefined') return

    const tag = document.querySelector(
      `meta[name="${name}"], meta[property="${name}"]`
    ) as HTMLMetaElement

    if (tag && managedTags.has(tag)) {
      tag.parentNode?.removeChild(tag)
      managedTags.delete(tag)
    }
  }

  /**
   * 清除所有自定义meta
   */
  const clearMeta = (): void => {
    managedTags.forEach(tag => {
      if (tag.parentNode) {
        tag.parentNode.removeChild(tag)
      }
    })
    managedTags.clear()
  }

  // 监听语言变化，自动更新meta
  if (initialConfig) {
    watch(locale, () => {
      updateMeta(initialConfig)
    })
  }

  return {
    updateMeta,
    setTitle,
    setDescription,
    addMetaTag,
    removeMetaTag,
    clearMeta,
  }
}