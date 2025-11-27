/**
 * v-t-tooltip - 带工具提示的翻译指令
 * 显示翻译文本并在悬停时显示原始键或额外信息
 */

import type { Directive, DirectiveBinding } from 'vue'
import type { I18nInstance } from '@ldesign/i18n-core'

interface TooltipBinding {
  key: string
  params?: Record<string, any>
  showKey?: boolean
  showLocale?: boolean
  position?: 'top' | 'bottom' | 'left' | 'right'
  delay?: number
}

let tooltip: HTMLDivElement | null = null

/**
 * 创建工具提示元素
 */
function createTooltip(): HTMLDivElement {
  if (tooltip) return tooltip

  tooltip = document.createElement('div')
  tooltip.className = 'i18n-tooltip'
  tooltip.style.cssText = `
    position: fixed;
    background: rgba(0, 0, 0, 0.85);
    color: white;
    padding: 6px 12px;
    border-radius: 4px;
    font-size: 12px;
    pointer-events: none;
    z-index: 9999;
    opacity: 0;
    transition: opacity 0.2s;
    white-space: nowrap;
    max-width: 300px;
    word-wrap: break-word;
  `
  document.body.appendChild(tooltip)

  return tooltip
}

/**
 * 显示工具提示
 */
function showTooltip(el: HTMLElement, content: string, position: string = 'top') {
  const tip = createTooltip()
  tip.textContent = content
  tip.style.opacity = '0'
  tip.style.display = 'block'

  // 计算位置
  const rect = el.getBoundingClientRect()
  const tipRect = tip.getBoundingClientRect()

  let top = 0
  let left = 0

  switch (position) {
    case 'top':
      top = rect.top - tipRect.height - 8
      left = rect.left + (rect.width - tipRect.width) / 2
      break
    case 'bottom':
      top = rect.bottom + 8
      left = rect.left + (rect.width - tipRect.width) / 2
      break
    case 'left':
      top = rect.top + (rect.height - tipRect.height) / 2
      left = rect.left - tipRect.width - 8
      break
    case 'right':
      top = rect.top + (rect.height - tipRect.height) / 2
      left = rect.right + 8
      break
  }

  tip.style.top = `${Math.max(0, top)}px`
  tip.style.left = `${Math.max(0, left)}px`

  // 淡入
  requestAnimationFrame(() => {
    tip.style.opacity = '1'
  })
}

/**
 * 隐藏工具提示
 */
function hideTooltip() {
  if (tooltip) {
    tooltip.style.opacity = '0'
    setTimeout(() => {
      if (tooltip) {
        tooltip.style.display = 'none'
      }
    }, 200)
  }
}

export const vTTooltip: Directive = {
  mounted(el: HTMLElement, binding: DirectiveBinding<string | TooltipBinding>, vnode) {
    const i18n = vnode.appContext?.app.config.globalProperties.$i18n as I18nInstance

    if (!i18n) {
      console.warn('[v-t-tooltip] i18n instance not found')
      return
    }

    let config: TooltipBinding
    if (typeof binding.value === 'string') {
      config = { key: binding.value }
    } else {
      config = binding.value
    }

    const { key, params, showKey = true, showLocale = false, position = 'top', delay = 300 } = config

    // 翻译并设置文本
    const translated = i18n.t(key, { params })
    el.textContent = translated

    // 构建工具提示内容
    let tooltipContent = ''
    if (showKey) {
      tooltipContent += `Key: ${key}`
    }
    if (showLocale) {
      tooltipContent += (tooltipContent ? '\n' : '') + `Locale: ${i18n.locale}`
    }

    if (!tooltipContent) return

    let timer: NodeJS.Timeout | null = null

    const handleMouseEnter = () => {
      timer = setTimeout(() => {
        showTooltip(el, tooltipContent, position)
      }, delay)
    }

    const handleMouseLeave = () => {
      if (timer) {
        clearTimeout(timer)
        timer = null
      }
      hideTooltip()
    }

    el.addEventListener('mouseenter', handleMouseEnter)
    el.addEventListener('mouseleave', handleMouseLeave)

    // 保存清理函数
    ;(el as any)._tooltipCleanup = () => {
      el.removeEventListener('mouseenter', handleMouseEnter)
      el.removeEventListener('mouseleave', handleMouseLeave)
      if (timer) {
        clearTimeout(timer)
      }
    }
  },

  updated(el: HTMLElement, binding: DirectiveBinding<string | TooltipBinding>, vnode) {
    const i18n = vnode.appContext?.app.config.globalProperties.$i18n as I18nInstance

    if (!i18n) return

    let config: TooltipBinding
    if (typeof binding.value === 'string') {
      config = { key: binding.value }
    } else {
      config = binding.value
    }

    const translated = i18n.t(config.key, { params: config.params })
    el.textContent = translated
  },

  unmounted(el: HTMLElement) {
    if ((el as any)._tooltipCleanup) {
      (el as any)._tooltipCleanup()
      delete (el as any)._tooltipCleanup
    }
  },
}

export default vTTooltip