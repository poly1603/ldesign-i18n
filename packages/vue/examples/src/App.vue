<template>
  <div class="app">
    <header class="header">
      <h1>@ldesign/i18n-vue 功能演示</h1>
      <div class="locale-switcher">
        <button @click="setLocale('zh-CN')">中文</button>
        <button @click="setLocale('en')">English</button>
        <button @click="setLocale('ja')">日本語</button>
        <span class="current-locale">当前: {{ locale }}</span>
      </div>
    </header>

    <main class="content">
      <section class="demo-section">
        <h2>1. 基础翻译 (useI18n)</h2>
        <div class="demo-item">
          <p><strong>t('hello'):</strong> {{ t('hello') }}</p>
          <p><strong>t('about'):</strong> {{ t('about') }}</p>
        </div>
      </section>

      <section class="demo-section">
        <h2>2. 参数插值</h2>
        <div class="demo-item">
          <input v-model="userName" placeholder="输入名字" />
          <p>{{ t('welcome', { name: userName }) }}</p>
        </div>
      </section>

      <section class="demo-section">
        <h2>3. Trans 组件</h2>
        <div class="demo-item">
          <I18nTranslate keypath="welcome" :params="{ name: userName }" />
        </div>
      </section>

      <section class="demo-section">
        <h2>4. 复数化</h2>
        <div class="demo-item">
          <div class="controls">
            <button @click="itemCount--">-</button>
            <span class="count">{{ itemCount }}</span>
            <button @click="itemCount++">+</button>
          </div>
          <p>{{ itemCount }} {{ tc('items', itemCount) }}</p>
        </div>
      </section>

      <section class="demo-section">
        <h2>5. 指令 (v-t)</h2>
        <div class="demo-item">
          <div v-t="'hello'"></div>
          <div v-t="{ key: 'welcome', params: { name: '指令' } }"></div>
        </div>
      </section>

      <section class="demo-section">
        <h2>6. 格式化</h2>
        <div class="demo-item">
          <p>日期: {{ d(new Date(), 'long') }}</p>
          <p>数字: {{ n(1234567.89) }}</p>
          <p>货币: {{ n(99.99, 'currency') }}</p>
        </div>
      </section>

      <section class="demo-section">
        <h2>7. 功能特性</h2>
        <div class="demo-item">
          <ul>
            <li>{{ t('features.composables') }}</li>
            <li>{{ t('features.components') }}</li>
            <li>{{ t('features.directives') }}</li>
          </ul>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from '@ldesign/i18n-vue'
import { I18nTranslate } from '@ldesign/i18n-vue'

const { t, tc, d, n, locale, setLocale } = useI18n()

const userName = ref('Vue')
const itemCount = ref(5)
</script>

<style scoped>
.app {
  min-height: 100vh;
  background: linear-gradient(135deg, #42b883 0%, #35495e 100%);
  padding: 2rem;
}

.header {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  margin-bottom: 2rem;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
}

.header h1 {
  margin: 0 0 1rem 0;
  color: #42b883;
}

.locale-switcher {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.locale-switcher button {
  padding: 0.5rem 1rem;
  background: #42b883;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.locale-switcher button:hover {
  background: #35495e;
}

.current-locale {
  margin-left: 1rem;
  font-weight: 600;
  color: #42b883;
}

.content {
  max-width: 1000px;
  margin: 0 auto;
}

.demo-section {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  margin-bottom: 1.5rem;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.demo-section h2 {
  margin: 0 0 1rem 0;
  color: #35495e;
  border-bottom: 2px solid #42b883;
  padding-bottom: 0.5rem;
}

.demo-item {
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 4px;
}

.demo-item p {
  margin: 0.5rem 0;
}

input {
  padding: 0.5rem;
  border: 2px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  width: 200px;
}

.controls {
  display: flex;
  gap: 1rem;
  align-items: center;
  margin-bottom: 1rem;
}

.controls button {
  padding: 0.5rem 1rem;
  background: #42b883;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.count {
  font-size: 1.5rem;
  font-weight: 600;
  color: #42b883;
  min-width: 3rem;
  text-align: center;
}

ul {
  margin: 0;
  padding-left: 1.5rem;
}

li {
  margin: 0.5rem 0;
}
</style>

