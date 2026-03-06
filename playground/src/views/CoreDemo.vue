<script setup lang="ts">
/**
 * Core Demo — 展示 @ldesign/i18n-core 的纯 JS 用法
 *
 * 这些 API 不依赖 Vue，可以在 Node.js / 浏览器 / Web Worker 等任何 JS 环境中使用。
 * 此处为了方便展示，将结果渲染到 Vue 模板中。
 */
import { ref, computed, watch, onUnmounted } from 'vue'
import { useI18n } from '@ldesign/i18n-vue'
import { createI18n } from '@ldesign/i18n-core'
import { messages } from '../locales'

const { t, locale } = useI18n()

// ==================== 1. 创建独立实例 ====================
const standalone = createI18n({
  locale: locale.value, // Initialize with current global locale
  fallbackLocale: 'en-US',
  messages,
})
standalone.init()

const standaloneLocale = ref(standalone.locale)
const standaloneResult = ref(standalone.t('demo.basic.hello'))

async function setStandaloneLocale(loc: string) {
  await standalone.setLocale(loc)
  standaloneLocale.value = standalone.locale
  standaloneResult.value = standalone.t('demo.basic.hello')
}

// Sync standalone locale with global locale when top-level language switches
watch(locale, (newLocale) => {
  if (newLocale !== standaloneLocale.value) {
    setStandaloneLocale(newLocale)
  }
})

// ==================== 2. 基础翻译 ====================
const basicResults = computed(() => {
  void standaloneLocale.value // 依赖响应式 locale 触发重新计算
  return [
    { code: "i18n.t('demo.basic.hello')", result: standalone.t('demo.basic.hello') },
    { code: "i18n.t('demo.basic.welcome')", result: standalone.t('demo.basic.welcome') },
  ]
})

// ==================== 3. 变量插值 ====================
const interpResults = computed(() => {
  void standaloneLocale.value
  return [
    { code: "i18n.t('demo.basic.greeting', { name: 'Alice' })", result: standalone.t('demo.basic.greeting', { name: 'Alice' }) },
    { code: "i18n.t('demo.basic.greetingWithRole', { name: 'Bob', role: 'Admin' })", result: standalone.t('demo.basic.greetingWithRole', { name: 'Bob', role: 'Admin' }) },
    { code: "i18n.t('demo.interpolation.nested', { orderId: '10086', count: 3, total: '$99.99' })", result: standalone.t('demo.interpolation.nested', { orderId: '10086', count: 3, total: '$99.99' }) },
  ]
})

// ==================== 4. 复数化 ====================
const pluralCount = ref(1)
function incPlural() { pluralCount.value++ }
function decPlural() { if (pluralCount.value > 0) pluralCount.value-- }

const pluralResult = computed(() => {
  void standaloneLocale.value
  return standalone.plural('demo.plural.item', pluralCount.value)
})
const pluralApple = computed(() => {
  void standaloneLocale.value
  return standalone.plural('demo.plural.apple', pluralCount.value)
})

// ==================== 5. 格式化 ====================
const now = new Date()
const formattingResults = computed(() => {
  void standaloneLocale.value
  return [
    { label: 'date(now, { dateStyle: "full" })', result: standalone.date(now, { dateStyle: 'full' }) },
    { label: 'date(now, { timeStyle: "medium" })', result: standalone.date(now, { timeStyle: 'medium' }) },
    { label: 'number(1234567.89)', result: standalone.number(1234567.89) },
    { label: 'number(0.856, { style: "percent" })', result: standalone.number(0.856, { style: 'percent' }) },
    { label: 'currency(1299.99, "CNY")', result: standalone.currency(1299.99, 'CNY') },
    { label: 'currency(49.99, "USD")', result: standalone.currency(49.99, 'USD') },
    { label: 'currency(4980, "JPY")', result: standalone.currency(4980, 'JPY') },
    { label: 'relativeTime(1h ago)', result: standalone.relativeTime(new Date(Date.now() - 3600000)) },
  ]
})

// ==================== 6. 翻译键检测 ====================
const existsResults = computed(() => {
  void standaloneLocale.value
  return [
    { key: 'demo.basic.hello', exists: standalone.exists('demo.basic.hello') },
    { key: 'non.existent.key', exists: standalone.exists('non.existent.key') },
    { key: 'common.save', exists: standalone.exists('common.save') },
  ]
})

// ==================== 7. 语言管理 ====================
const availableLocales = computed(() => standalone.getAvailableLocales())

// ==================== 8. 动态消息管理 ====================
const mergeInput = ref(JSON.stringify({ custom: { hello: 'Custom Hello!' } }, null, 2))
const mergeStatus = ref('')
const customResult = ref('')

function doMerge() {
  try {
    const msgs = JSON.parse(mergeInput.value)
    standalone.mergeMessages(standalone.locale, msgs)
    mergeStatus.value = t('demo.dynamicMessages.mergeSuccess')
    customResult.value = standalone.t('custom.hello')
  } catch {
    mergeStatus.value = t('demo.dynamicMessages.invalidJSON')
    customResult.value = ''
  }
}

// ==================== 9. 事件监听 ====================
const eventLog = ref<string[]>([])
const unsubLocale = standalone.on('localeChanged', ({ locale: newLoc }) => {
  eventLog.value.push(`[localeChanged] → ${newLoc}`)
  if (eventLog.value.length > 5) eventLog.value.shift()
})
const unsubMissing = standalone.on('missingKey', ({ key }) => {
  eventLog.value.push(`[missingKey] "${key}"`)
  if (eventLog.value.length > 5) eventLog.value.shift()
})

function triggerMissing() {
  standalone.t('this.key.does.not.exist')
}

onUnmounted(() => {
  if (typeof unsubLocale === 'function') unsubLocale()
  if (typeof unsubMissing === 'function') unsubMissing()
  standalone.destroy()
})
</script>

<template>
  <div class="demo">
    <!-- 模式说明 -->
    <section class="card highlight-orange">
      <h2>{{ t('mode.core.title') }}</h2>
      <p class="desc">{{ t('mode.core.description') }}</p>
      <div class="code-block">
        <pre>import { createI18n } from '@ldesign/i18n-core'

const i18n = createI18n({
  locale: 'zh-CN',
  fallbackLocale: 'en-US',
  messages: {
    'zh-CN': { hello: '你好' },
    'en-US': { hello: 'Hello' },
  },
})
await i18n.init()

i18n.t('hello')           // → '你好'
i18n.date(new Date())     // → '2026/2/25'
i18n.number(1234.5)       // → '1,234.5'
i18n.currency(99, 'USD')  // → '$99.00'</pre>
      </div>
    </section>

    <!-- 1. 独立实例 & 语言切换 -->
    <section class="card">
      <h3>{{ t('demo.core.title') }} — createI18n()</h3>
      <p class="desc">{{ t('demo.core.subtitle') }}</p>
      <div class="locale-row">
        <span>standalone.locale: <b>{{ standaloneLocale }}</b></span>
        <div class="btn-group">
          <button v-for="loc in availableLocales" :key="loc"
            :class="['btn', { active: standaloneLocale === loc }]"
            @click="setStandaloneLocale(loc)">{{ loc }}</button>
        </div>
      </div>
      <div class="examples">
        <div class="example-row">
          <code>i18n.t('demo.basic.hello')</code>
          <span class="result">{{ standaloneResult }}</span>
        </div>
      </div>
    </section>

    <!-- 2. 基础翻译 -->
    <section class="card">
      <h3>{{ t('demo.basic.title') }} — t(key)</h3>
      <p class="desc">{{ t('demo.basic.description') }}</p>
      <div class="code-block">
        <pre>i18n.t('demo.basic.hello')    // Simple translation
i18n.t('key', { name: 'X' }) // With interpolation</pre>
      </div>
      <div class="examples">
        <div v-for="item in basicResults" :key="item.code" class="example-row">
          <code>{{ item.code }}</code>
          <span class="result">{{ item.result }}</span>
        </div>
      </div>
    </section>

    <!-- 3. 变量插值 -->
    <section class="card">
      <h3>{{ t('demo.interpolation.title') }} — t(key, params)</h3>
      <p class="desc">{{ t('demo.interpolation.description') }}</p>
      <div class="code-block">
        <pre>// Use {<!-- -->{variable}} placeholder in message templates
// 'greeting': 'Hello, {<!-- -->{name}}!'
i18n.t('greeting', { name: 'Alice' }) // → 'Hello, Alice!'</pre>
      </div>
      <div class="examples">
        <div v-for="item in interpResults" :key="item.code" class="example-row">
          <code>{{ item.code }}</code>
          <span class="result">{{ item.result }}</span>
        </div>
      </div>
    </section>

    <!-- 4. 复数化 -->
    <section class="card">
      <h3>{{ t('demo.plural.title') }} — plural(key, count)</h3>
      <p class="desc">{{ t('demo.plural.description') }}</p>
      <div class="code-block">
        <pre>// Messages use key:value|key:value format:
// '0:No items|other:{<!-- -->{count}} items'
i18n.plural('demo.plural.item', 0) // → 'No items'
i18n.plural('demo.plural.item', 1) // → '1 item'
i18n.plural('demo.plural.item', 5) // → '5 items'</pre>
      </div>
      <div class="controls">
        <button class="btn" @click="decPlural">-</button>
        <span class="count">{{ pluralCount }}</span>
        <button class="btn" @click="incPlural">+</button>
      </div>
      <div class="examples">
        <div class="example-row">
          <code>plural('demo.plural.item', {{ pluralCount }})</code>
          <span class="result">{{ pluralResult }}</span>
        </div>
        <div class="example-row">
          <code>plural('demo.plural.apple', {{ pluralCount }})</code>
          <span class="result">{{ pluralApple }}</span>
        </div>
      </div>
    </section>

    <!-- 5. 格式化 -->
    <section class="card">
      <h3>{{ t('demo.dateTime.title') }} & {{ t('demo.number.title') }}</h3>
      <p class="desc">{{ t('demo.formatting.description') }}</p>
      <div class="code-block">
        <pre>i18n.date(new Date(), { dateStyle: 'full' })
i18n.number(1234567.89)
i18n.number(0.856, { style: 'percent' })
i18n.currency(1299.99, 'CNY')
i18n.relativeTime(pastDate)</pre>
      </div>
      <div class="examples">
        <div v-for="item in formattingResults" :key="item.label" class="example-row">
          <code>{{ item.label }}</code>
          <span class="result">{{ item.result }}</span>
        </div>
      </div>
    </section>

    <!-- 6. 翻译键检测 -->
    <section class="card">
      <h3>exists(key) — {{ t('demo.basic.title') }}</h3>
      <p class="desc">{{ t('demo.exists.description') }}</p>
      <div class="code-block">
        <pre>i18n.exists('demo.basic.hello')   // → true
i18n.exists('non.existent.key')   // → false</pre>
      </div>
      <div class="examples">
        <div v-for="item in existsResults" :key="item.key" class="example-row">
          <code>exists('{{ item.key }}')</code>
          <span :class="['result', 'badge', item.exists ? 'badge-green' : 'badge-red']">
            {{ item.exists ? '✓ true' : '✗ false' }}
          </span>
        </div>
      </div>
    </section>

    <!-- 7. 语言管理 -->
    <section class="card">
      <h3>{{ t('demo.localeManagement.title') }}</h3>
      <p class="desc">{{ t('demo.localeManagement.description') }}</p>
      <div class="code-block">
        <pre>i18n.getAvailableLocales()  // → ['zh-CN', 'en-US', 'ja-JP']
await i18n.setLocale('en-US')
i18n.locale                  // → 'en-US'</pre>
      </div>
      <div class="examples">
        <div class="example-row">
          <code>getAvailableLocales()</code>
          <span class="result">{{ availableLocales.join(', ') }}</span>
        </div>
        <div class="example-row">
          <code>locale</code>
          <span class="result badge badge-blue">{{ standaloneLocale }}</span>
        </div>
      </div>
    </section>

    <!-- 8. 动态消息管理 -->
    <section class="card">
      <h3>{{ t('demo.dynamicMessages.title') }}</h3>
      <p class="desc">{{ t('demo.dynamicMessages.description') }}</p>
      <div class="code-block">
        <pre>// Merge to existing locale
i18n.mergeMessages('zh-CN', { custom: { hello: 'Custom!' } })
i18n.t('custom.hello') // → 'Custom!'

// Add new locale
i18n.addLocale('ko-KR', { hello: '안녕하세요' })</pre>
      </div>
      <div class="input-group vertical">
        <textarea v-model="mergeInput" class="textarea" rows="3"></textarea>
        <button class="btn-primary" @click="doMerge">{{ t('demo.dynamicMessages.mergeButton', { params: { locale: standaloneLocale } }) }}</button>
      </div>
      <p v-if="mergeStatus" :class="['status', mergeStatus.startsWith('✓') ? 'status-ok' : 'status-err']">
        {{ mergeStatus }}
        <span v-if="customResult"> → i18n.t('custom.hello') = "{{ customResult }}"</span>
      </p>
    </section>

    <!-- 9. 事件监听 -->
    <section class="card">
      <h3>{{ t('demo.events.title') }}</h3>
      <p class="desc">{{ t('demo.events.description') }}</p>
      <div class="code-block">
        <pre>i18n.on('localeChanged', ({ locale }) => {
  console.log('Locale changed to:', locale)
})

i18n.on('missingKey', ({ key, locale }) => {
  console.warn(`Missing: "${key}" in ${locale}`)
})</pre>
      </div>
      <div class="btn-group" style="margin-bottom: 12px">
        <button class="btn" @click="setStandaloneLocale('en-US')">→ en-US</button>
        <button class="btn" @click="setStandaloneLocale('zh-CN')">→ zh-CN</button>
        <button class="btn" @click="triggerMissing">{{ t('demo.events.triggerMissing') }}</button>
      </div>
      <div class="event-log">
        <div v-if="eventLog.length === 0" class="log-empty">{{ t('demo.events.noEvents') }}</div>
        <div v-for="(log, i) in eventLog" :key="i" class="log-item">{{ log }}</div>
      </div>
    </section>

    <!-- 10. Engine 插件 & 持久化配置 -->
    <section class="card">
      <h3>{{ t('demo.enginePlugin.title') }}</h3>
      <p class="desc">{{ t('demo.enginePlugin.description') }}</p>
      <div class="code-block">
        <pre>import { createI18nEnginePlugin } from '@ldesign/i18n-core'

const plugin = createI18nEnginePlugin({
  locale: 'zh-CN',
  fallbackLocale: 'en-US',
  messages,

  // Persistence config
  persistence: {
    enabled: true,
    key: 'my-app-locale',       // localStorage key
    storage: 'localStorage',     // 'localStorage' | 'sessionStorage' | 'cookie'
  },

  // Callbacks
  onReady(ctx) {
    console.log('Ready!', ctx.getLocale())
  },
  onLocaleChange(locale, oldLocale) {
    console.log(`${oldLocale} → ${locale}`)
  },
  onMissingKey(key, locale) {
    console.warn(`Missing: ${key}`)
  },

  // Lifecycle hooks
  hooks: {
    onBeforeInstall: () => { ... },
    onAfterInstall: () => { ... },
  },
})

// For Engine
engine.use(plugin)

// Or for Vue Engine
const vuePlugin = createI18nEnginePlugin({
  ...coreOptions,
  globalProperties: true,  // Register $t / $i18n
  directives: true,        // Register v-t / v-t-html / v-t-plural / v-t-tooltip
  components: true,        // Register I18nText / I18nTranslate / I18nProvider
})</pre>
      </div>
    </section>
  </div>
</template>

<style scoped>
.demo { display: flex; flex-direction: column; gap: 20px; }

.card {
  background: white;
  border-radius: var(--radius);
  padding: 24px;
  border: 1px solid var(--border);
}

.card.highlight-orange {
  border-left: 4px solid #f59e0b;
  background: linear-gradient(135deg, #fffbeb 0%, white 100%);
}

.card h2 { font-size: 18px; margin-bottom: 8px; color: #f59e0b; }
.card h3 { font-size: 16px; margin-bottom: 8px; }
.desc { font-size: 13px; color: var(--text-secondary); margin-bottom: 16px; }

.code-block {
  background: #1e1e2e;
  color: #cdd6f4;
  border-radius: 6px;
  padding: 16px;
  margin-bottom: 16px;
  overflow-x: auto;
}

.code-block pre {
  font-family: 'Fira Code', 'Consolas', monospace;
  font-size: 12px;
  line-height: 1.6;
  white-space: pre;
}

.examples { display: flex; flex-direction: column; gap: 10px; }

.example-row {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 8px 12px;
  background: var(--bg);
  border-radius: 6px;
  font-size: 13px;
}

.example-row code {
  flex-shrink: 0;
  font-family: 'Fira Code', 'Consolas', monospace;
  font-size: 12px;
  color: #f59e0b;
  background: #fef9c3;
  padding: 2px 8px;
  border-radius: 4px;
  max-width: 60%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.result { color: var(--text); font-weight: 500; }

.controls {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.btn {
  min-width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--border);
  border-radius: 6px;
  background: white;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
  padding: 0 10px;
}

.btn:hover { border-color: #f59e0b; color: #f59e0b; }
.btn.active { background: #f59e0b; color: white; border-color: #f59e0b; }
.count { font-size: 18px; font-weight: 700; min-width: 32px; text-align: center; }

.btn-group { display: flex; gap: 8px; flex-wrap: wrap; }

.locale-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  padding: 8px 12px;
  background: var(--bg);
  border-radius: 6px;
  font-size: 13px;
}

.badge {
  padding: 2px 10px;
  border-radius: 10px;
  font-size: 12px;
  font-weight: 600;
}

.badge-green { background: #dcfce7; color: #15803d; }
.badge-red { background: #fef2f2; color: #dc2626; }
.badge-blue { background: #dbeafe; color: #1d4ed8; }

.input-group { display: flex; gap: 8px; margin-bottom: 12px; }
.input-group.vertical { flex-direction: column; }

.textarea {
  padding: 8px 12px;
  border: 1px solid var(--border);
  border-radius: 6px;
  font-size: 12px;
  font-family: 'Fira Code', 'Consolas', monospace;
  resize: vertical;
}

.btn-primary {
  padding: 8px 20px;
  background: #f59e0b;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  white-space: nowrap;
}

.btn-primary:hover { background: #d97706; }

.status { font-size: 13px; margin-top: 8px; padding: 8px 12px; border-radius: 6px; }
.status-ok { background: #dcfce7; color: #15803d; }
.status-err { background: #fef2f2; color: #dc2626; }

.event-log {
  background: #1e1e2e;
  border-radius: 6px;
  padding: 12px 16px;
  font-family: 'Fira Code', 'Consolas', monospace;
  font-size: 12px;
  color: #a6e3a1;
  min-height: 60px;
}

.log-empty { color: #6c7086; }
.log-item { line-height: 1.8; }
</style>
