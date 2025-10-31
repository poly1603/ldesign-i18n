<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from '@ldesign/i18n-vue'

const { t, locale, setLocale } = useI18n()
const count = ref(0)

function toggleLanguage() {
  setLocale(locale.value === 'en' ? 'zh' : 'en')
}
</script>

<template>
  <div :style="{ padding: '2rem', fontFamily: 'system-ui, sans-serif' }">
    <h1>{{ t('welcome') }}</h1>
    <p>{{ t('description') }}</p>
    
    <div :style="{ marginTop: '2rem' }">
      <button @click="toggleLanguage">
        {{ t('switchLanguage') }}
      </button>
      <span :style="{ marginLeft: '1rem' }">
        Current: {{ locale }}
      </span>
    </div>

    <div :style="{ marginTop: '2rem' }">
      <h2>{{ t('counter') }}: {{ count }}</h2>
      <button @click="count++">
        {{ t('increment') }}
      </button>
      <button @click="count--" :style="{ marginLeft: '1rem' }">
        {{ t('decrement') }}
      </button>
    </div>
  </div>
</template>
