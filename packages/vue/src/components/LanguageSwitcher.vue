<template>
  <div class="ld-lang-switcher">
    <select class="lang-select" :value="locale" @change="onChange">
      <option v-for="loc in locales" :key="loc" :value="loc">
        {{ displayName(loc) }}
      </option>
    </select>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from '../composables/useI18n'

// 使用全局 i18n 实例
const { locale, availableLocales, setLocale } = useI18n()

// 本地可选项
const locales = computed(() => availableLocales.value)

// 显示名称（可按需扩展）
function displayName(loc: string): string {
  const map: Record<string, string> = {
    'zh-CN': '简体中文',
    'en-US': 'English',
    'ja-JP': '日本語',
  }
  return map[loc] || loc
}

async function onChange(e: Event) {
  const value = (e.target as HTMLSelectElement).value
  await setLocale(value)
}
</script>

<style scoped>
.ld-lang-switcher {
  display: inline-block;
}
.lang-select {
  padding: 6px 10px;
  border: 1px solid var(--color-border, #d9d9d9);
  border-radius: 6px;
  background: var(--color-bg-container, #ffffff);
  color: var(--color-text-primary, #333);
  font-size: 14px;
}
.lang-select:focus {
  outline: none;
  border-color: var(--color-primary, #1890ff);
  box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.1);
}
</style>

