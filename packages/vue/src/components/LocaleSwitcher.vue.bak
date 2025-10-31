<script setup lang="ts">
/**
 * LocaleSwitcher - 基于无头逻辑层重构
 * 使用 @ldesign/shared 的协议和逻辑层
 */
import { computed, ref } from 'vue'
import type { SelectorConfig, SelectorOption } from '@ldesign/shared/protocols'
import { useHeadlessSelector, useResponsivePopup } from '@ldesign/shared/composables'
import { renderIcon } from '@ldesign/shared/icons'
import { useI18n } from '../composables/useI18n';

interface Props {
  mode?: 'dropdown' | 'buttons' | 'tabs';
  displayNames?: Record<string, string>;
  flags?: Record<string, string>;
  showFlags?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  mode: 'dropdown',
  showFlags: true,
  displayNames: () => ({
    'zh-CN': '简体中文',
    'en-US': 'English',
    'ja-JP': '日本語',
  }),
  flags: () => ({
    'zh-CN': '🇨🇳',
    'en-US': '🇺🇸',
    'ja-JP': '🇯🇵',
  })
});

const emit = defineEmits<{
  change: [locale: string];
}>();

const { locale, availableLocales, setLocale } = useI18n()

const getLocaleName = (loc: string): string => {
  return props.displayNames[loc] || loc
}

const getShortName = (loc: string): string => {
  return loc.split('-')[0].toUpperCase()
}

const getFlag = (loc: string): string => {
  if (!props.showFlags) return ''
  return props.flags[loc] || '🌐'
}

// 选择器配置（遵循协议）
const config: SelectorConfig = {
  icon: 'Languages',
  popupMode: 'auto',
  listStyle: props.mode === 'dropdown' ? 'simple' : 'card',
  searchable: false,
  breakpoint: 768
}

// 转换为 SelectorOption 格式
const options = computed<SelectorOption[]>(() => {
  return availableLocales.value.map(loc => ({
    value: loc,
    label: getLocaleName(loc),
    icon: getFlag(loc),
    metadata: {
      flag: getFlag(loc)
    }
  }))
})

// 处理选择
const handleSelect = async (value: string) => {
  await setLocale(value)
  emit('change', value)
}

// 当前选中的选项
const currentOption = computed(() => {
  return options.value.find(opt => opt.value === locale.value)
})

// 使用无头选择器（仅 dropdown 模式）
const { state, actions, triggerRef, panelRef, activeIndexRef } = useHeadlessSelector({
  options,
  modelValue: locale,
  searchable: config.searchable,
  onSelect: handleSelect
})

// 使用响应式弹出（仅 dropdown 模式）
const { currentMode, popupStyle } = useResponsivePopup({
  mode: config.popupMode,
  triggerRef,
  panelRef,
  placement: 'bottom-start',
  breakpoint: config.breakpoint,
  isOpen: computed(() => state.value.isOpen)
})
</script>

<template>
  <div class="locale-switcher-wrapper">
    <!-- 下拉选择器样式 -->
    <div v-if="mode === 'dropdown'" class="locale-dropdown">
      <button ref="triggerRef" class="locale-dropdown-trigger" :aria-expanded="state.isOpen" @click="actions.toggle">
        <span class="locale-icon">{{ currentOption?.icon }}</span>
      </button>

      <Teleport to="body">
        <transition name="selector-panel">
          <div v-if="state.isOpen" ref="panelRef" class="locale-dropdown-menu"
            :class="{ 'locale-dropdown-dialog': currentMode === 'dialog' }" :style="popupStyle" @click.stop>
            <button v-for="(option, index) in state.filteredOptions" :key="option.value" class="locale-option" :class="{
              'active': state.selectedValue === option.value,
              'hover': state.activeIndex === index
            }" @click="actions.select(option.value)" @mouseenter="activeIndexRef = index">
              <span class="locale-option-flag">{{ option.icon }}</span>
              <span class="locale-option-label">{{ option.label }}</span>
              <svg v-if="state.selectedValue === option.value" class="locale-check" width="16" height="16"
                viewBox="0 0 16 16">
                <path d="M13.5 4.5L6 12L2.5 8.5" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                  stroke-linejoin="round" fill="none" />
              </svg>
            </button>
          </div>
        </transition>
      </Teleport>
    </div>
  </div>
</template>

<style scoped>
.locale-switcher-wrapper {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

/* 下拉选择器样式 */
.locale-dropdown {
  position: relative;
  display: inline-block;
}

.locale-dropdown-trigger {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: white;
  border: 1px solid #e1e4e8;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  color: #24292e;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
  min-width: 120px;
}

.locale-dropdown-trigger:hover {
  background: #f6f8fa;
  border-color: #d1d5da;
}

.locale-dropdown-trigger:focus {
  outline: none;
  border-color: #0366d6;
  box-shadow: 0 0 0 3px rgba(3, 102, 214, 0.1);
}

.locale-icon {
  font-size: 18px;
  line-height: 1;
}

.locale-arrow {
  transition: transform 0.2s ease;
  color: #586069;
  margin-left: auto;
}

.locale-arrow.rotate {
  transform: rotate(180deg);
}

.locale-dropdown-menu {
  min-width: 180px;
  background: white;
  border: 1px solid #e1e4e8;
  border-radius: 8px;
  box-shadow: 0 8px 24px rgba(149, 157, 165, 0.2);
  padding: 4px;
  max-height: 320px;
  overflow-y: auto;
}

.locale-dropdown-dialog {
  max-width: 90vw;
  max-height: 80vh;
}

.locale-option {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 8px 12px;
  border: none;
  background: transparent;
  font-size: 14px;
  color: #24292e;
  text-align: left;
  cursor: pointer;
  transition: background 0.15s ease;
  border-radius: 6px;
  white-space: nowrap;
}

.locale-option:hover,
.locale-option.hover {
  background: #f6f8fa;
}

.locale-option.active {
  background: #e7f3ff;
  color: #0366d6;
  font-weight: 500;
}

.locale-option-flag {
  font-size: 18px;
  line-height: 1;
}

.locale-option-label {
  flex: 1;
}

.locale-check {
  color: #0366d6;
  margin-left: auto;
}

/* 按钮组样式 */
.locale-buttons {
  display: inline-flex;
  gap: 4px;
  padding: 4px;
  background: #f6f8fa;
  border-radius: 8px;
}

.locale-button {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  border: none;
  background: transparent;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  color: #586069;
  cursor: pointer;
  transition: all 0.2s ease;
}

.locale-button:hover {
  background: white;
  color: #24292e;
}

.locale-button.active {
  background: white;
  color: #0366d6;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}

.locale-button-flag {
  font-size: 16px;
  line-height: 1;
}

.locale-button-label {
  text-transform: uppercase;
  font-size: 12px;
}

/* 标签样式 */
.locale-tabs {
  display: inline-flex;
  border-bottom: 2px solid #e1e4e8;
}

.locale-tab {
  padding: 8px 16px;
  border: none;
  background: transparent;
  font-size: 14px;
  font-weight: 500;
  color: #586069;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
}

.locale-tab:hover {
  color: #24292e;
}

.locale-tab.active {
  color: #0366d6;
}

.locale-tab.active::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  right: 0;
  height: 2px;
  background: #0366d6;
}

/* 过渡动画 - 统一标准 */
.selector-panel-enter-active {
  transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.selector-panel-leave-active {
  transition: all 0.2s cubic-bezier(0.4, 0, 1, 1);
}

.selector-panel-enter-from {
  opacity: 0;
  transform: translateY(-8px) scale(0.96);
}

.selector-panel-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

/* 深色模式支持 */
@media (prefers-color-scheme: dark) {
  .locale-dropdown-trigger {
    background: #1f2937;
    border-color: #374151;
    color: #f3f4f6;
  }

  .locale-dropdown-trigger:hover {
    background: #374151;
    border-color: #4b5563;
  }

  .locale-dropdown-menu {
    background: #1f2937;
    border-color: #374151;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
  }

  .locale-option {
    color: #f3f4f6;
  }

  .locale-option:hover {
    background: #374151;
  }

  .locale-option.active {
    background: #1e3a5f;
    color: #60a5fa;
  }
}
</style>