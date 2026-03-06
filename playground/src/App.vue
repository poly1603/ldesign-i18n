<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from '@ldesign/i18n-vue'
import CoreDemo from './views/CoreDemo.vue'
import EngineDemo from './views/EngineDemo.vue'
import VueDemo from './views/VueDemo.vue'

const { t, locale, setLocale, availableLocales } = useI18n()
const activeTab = ref<'core' | 'engine' | 'vue'>('core')

const localeLabels: Record<string, string> = {
  'zh-CN': '简体中文',
  'en-US': 'English',
  'ja-JP': '日本語',
}

async function switchLocale(loc: string) {
  await setLocale(loc)
}
</script>

<template>
  <div class="app">
    <header class="header">
      <div class="header-left">
        <h1 class="logo">{{ t('app.title') }}</h1>
        <p class="subtitle">{{ t('app.subtitle') }}</p>
      </div>
      <div class="header-right">
        <div class="locale-switcher">
          <span class="locale-label">{{ t('common.language') }}:</span>
          <button
            v-for="loc in availableLocales"
            :key="loc"
            :class="['locale-btn', { active: locale === loc }]"
            @click="switchLocale(loc)"
          >
            {{ localeLabels[loc] || loc }}
          </button>
        </div>
      </div>
    </header>

    <nav class="tabs">
      <button :class="['tab', { active: activeTab === 'core' }]" @click="activeTab = 'core'">
        {{ t('app.nav.core') }}
      </button>
      <button :class="['tab', { active: activeTab === 'engine' }]" @click="activeTab = 'engine'">
        {{ t('app.nav.engine') }}
      </button>
      <button :class="['tab', { active: activeTab === 'vue' }]" @click="activeTab = 'vue'">
        {{ t('app.nav.vue') }}
      </button>
    </nav>

    <main class="content">
      <CoreDemo v-if="activeTab === 'core'" :key="0" />
      <EngineDemo v-else-if="activeTab === 'engine'" :key="1" />
      <VueDemo v-else :key="2" />
    </main>

    <footer class="footer">
      <p>{{ t('app.footer') }} · {{ t('common.currentLocale', { params: { locale } }) }}</p>
    </footer>
  </div>
</template>

<style>
:root {
  --primary: #4f46e5;
  --primary-light: #eef2ff;
  --border: #e5e7eb;
  --bg: #f9fafb;
  --text: #111827;
  --text-secondary: #6b7280;
  --radius: 8px;
  --shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.app {
  min-height: 100vh;
  background: var(--bg);
  color: var(--text);
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 32px;
  background: white;
  border-bottom: 1px solid var(--border);
  box-shadow: var(--shadow);
}

.header-left { display: flex; flex-direction: column; gap: 4px; }
.logo { font-size: 20px; font-weight: 700; color: var(--primary); }
.subtitle { font-size: 13px; color: var(--text-secondary); }

.locale-switcher {
  display: flex;
  align-items: center;
  gap: 8px;
}

.locale-label {
  font-size: 13px;
  color: var(--text-secondary);
}

.locale-btn {
  padding: 6px 14px;
  border: 1px solid var(--border);
  border-radius: 6px;
  background: white;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}

.locale-btn:hover {
  border-color: var(--primary);
  color: var(--primary);
}

.locale-btn.active {
  background: var(--primary);
  color: white;
  border-color: var(--primary);
}

.tabs {
  display: flex;
  gap: 0;
  padding: 0 32px;
  background: white;
  border-bottom: 1px solid var(--border);
}

.tab {
  padding: 12px 24px;
  border: none;
  background: none;
  font-size: 14px;
  font-weight: 500;
  color: var(--text-secondary);
  cursor: pointer;
  border-bottom: 2px solid transparent;
  transition: all 0.2s;
}

.tab:hover {
  color: var(--primary);
}

.tab.active {
  color: var(--primary);
  border-bottom-color: var(--primary);
}

.content {
  max-width: 960px;
  margin: 24px auto;
  padding: 0 32px;
}

.footer {
  text-align: center;
  padding: 24px;
  color: var(--text-secondary);
  font-size: 13px;
  border-top: 1px solid var(--border);
  margin-top: 48px;
}
</style>
