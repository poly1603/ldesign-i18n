<template>
  <div class="i18n-demo">
    <h1>{{ t('title') }}</h1>
    
    <!-- 使用 t 函数 -->
    <section>
      <h2>基础翻译</h2>
      <p>{{ t('hello') }}</p>
      <p>{{ t('welcome', { name: userName }) }}</p>
    </section>

    <!-- 使用 v-t 指令 -->
    <section>
      <h2>使用指令</h2>
      <p v-t="'hello'"></p>
      <p v-t="{ path: 'welcome', params: { name: userName } }"></p>
    </section>

    <!-- 使用组件 -->
    <section>
      <h2>使用组件</h2>
      <I18nTranslate keypath="hello" />
      <I18nTranslate 
        keypath="welcome" 
        :params="{ name: userName }" 
      />
    </section>

    <!-- 复数处理 -->
    <section>
      <h2>复数处理</h2>
      <p>{{ t('appleCount', appleCount) }}</p>
      <button @click="appleCount--">-</button>
      <input v-model.number="appleCount" type="number" />
      <button @click="appleCount++">+</button>
    </section>

    <!-- 语言切换 -->
    <section>
      <h2>语言切换</h2>
      <p>当前语言: {{ locale }}</p>
      <div class="language-buttons">
        <button 
          v-for="lang in availableLocales" 
          :key="lang"
          :class="{ active: locale === lang }"
          @click="setLocale(lang)"
        >
          {{ lang }}
        </button>
      </div>
    </section>

    <!-- 使用 LocaleSwitcher 组件 -->
    <section>
      <h2>语言切换器</h2>
      <LocaleSwitcher />
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from '../src/adapters/vue'
import { I18nTranslate, LocaleSwitcher } from '../src/adapters/vue/components'

const { t, locale, setLocale, availableLocales } = useI18n()

const userName = ref('张三')
const appleCount = ref(5)
</script>

<style scoped>
.i18n-demo {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

section {
  margin-bottom: 30px;
  padding: 20px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
}

h1 {
  color: #333;
  margin-bottom: 30px;
}

h2 {
  color: #666;
  font-size: 18px;
  margin-bottom: 15px;
}

.language-buttons {
  display: flex;
  gap: 10px;
}

button {
  padding: 8px 16px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: white;
  cursor: pointer;
  transition: all 0.3s;
}

button:hover {
  background: #f5f5f5;
}

button.active {
  background: #1890ff;
  color: white;
  border-color: #1890ff;
}

input[type="number"] {
  width: 100px;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  text-align: center;
  margin: 0 10px;
}
</style>

