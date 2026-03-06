<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n, useLocale, useI18nScope, useTranslation } from '@ldesign/i18n-vue'

// ==================== useI18n ====================
const { t, tc, te, d, n, locale, setLocale, availableLocales, i18n,
        mergeLocaleMessage, getLocaleMessage, setLocaleMessage } = useI18n()

// ==================== useLocale ====================
const { isCurrentLocale } = useLocale()

// ==================== useI18nScope ====================
const homeScope = useI18nScope('pages.home')
const settingsScope = useI18nScope('pages.settings')
const aboutScope = useI18nScope('pages.about')

// ==================== useTranslation ====================
const { t: tHome } = useTranslation('pages.home')
const { t: tSettings, tc: tcSettings, te: teSettings } = useTranslation('pages.settings')

// ==================== 动态翻译 ====================
const dynamicKey = ref('demo.basic.hello')
const dynamicResult = ref('')
function translateDynamic() {
  dynamicResult.value = t(dynamicKey.value)
}

// ==================== 动态消息合并 ====================
const newMessages = ref(JSON.stringify({ custom: { greeting: 'Custom greeting!' } }, null, 2))
const mergeStatus = ref('')
function mergeMessages() {
  try {
    const msgs = JSON.parse(newMessages.value)
    mergeLocaleMessage(locale.value, msgs)
    mergeStatus.value = `${t('demo.dynamicMessages.mergeSuccess')} t('custom.greeting') = "${t('custom.greeting')}"`
  } catch {
    mergeStatus.value = t('demo.dynamicMessages.invalidJSON')
  }
}

// ==================== setLocaleMessage 演示 ====================
const replaceTarget = ref('pages.about')
const replaceJSON = ref(JSON.stringify({
  title: 'New About',
  description: 'Replaced description',
  version: 'v{{version}}',
}, null, 2))
const replaceStatus = ref('')
function doReplace() {
  try {
    const msgs = JSON.parse(replaceJSON.value)
    // 获取当前完整消息 → 替换目标分支 → 写回
    const current = getLocaleMessage(locale.value)
    const keys = replaceTarget.value.split('.')
    let obj: any = current
    for (let i = 0; i < keys.length - 1; i++) {
      if (!obj[keys[i]]) obj[keys[i]] = {}
      obj = obj[keys[i]]
    }
    obj[keys[keys.length - 1]] = msgs
    setLocaleMessage(locale.value, current)
    replaceStatus.value = t('demo.setLocaleMessage.replaceSuccess')
  } catch {
    replaceStatus.value = t('demo.setLocaleMessage.error')
  }
}
</script>

<template>
  <div class="demo">
    <!-- 模式说明 -->
    <section class="card highlight">
      <h2>{{ t('mode.vue.title') }}</h2>
      <p class="desc">{{ t('mode.vue.description') }}</p>
      <div class="code-block">
        <pre>// Method 1: Manual setup
import { createApp } from 'vue'
import { createI18n } from '@ldesign/i18n-core'
import { createI18nPlugin } from '@ldesign/i18n-vue'

const i18n = createI18n({ locale: 'zh-CN', fallbackLocale: 'en-US', messages })
const app = createApp(App)
app.use(createI18nPlugin(i18n))
app.mount('#app')

// Method 2: Quick setup (setupI18n)
import { setupI18n } from '@ldesign/i18n-vue'

const app = createApp(App)
const i18n = setupI18n(app, { locale: 'zh-CN', messages })
app.mount('#app')</pre>
      </div>
    </section>

    <!-- 1. useI18n 完整 API -->
    <section class="card">
      <h3>{{ t('demo.compositionApi.title') }}</h3>
      <p class="desc">{{ t('demo.compositionApi.description') }}</p>
      <div class="code-block">
        <pre>const {
  t, tc, te, tm, rt,   // translate / plural / exists / raw message / interpolate
  d, n,                 // date format / number format
  locale, setLocale,    // locale state / switch
  availableLocales,     // available locales list
  mergeLocaleMessage,   // merge messages
  getLocaleMessage,     // get messages
  setLocaleMessage,     // replace messages
  i18n,                 // raw instance
} = useI18n()</pre>
      </div>
      <div class="examples">
        <div class="example-row">
          <code>t('demo.basic.hello')</code>
          <span class="result">{{ t('demo.basic.hello') }}</span>
        </div>
        <div class="example-row">
          <code>t('demo.basic.greeting', { name: 'Vue' })</code>
          <span class="result">{{ t('demo.basic.greeting', { name: 'Vue' }) }}</span>
        </div>
        <div class="example-row">
          <code>tc('demo.plural.file', 5)</code>
          <span class="result">{{ tc('demo.plural.file', 5) }}</span>
        </div>
        <div class="example-row">
          <code>d(new Date())</code>
          <span class="result">{{ d(new Date()) }}</span>
        </div>
        <div class="example-row">
          <code>n(9876.54)</code>
          <span class="result">{{ n(9876.54) }}</span>
        </div>
        <div class="example-row">
          <code>n(0.42, 'percent')</code>
          <span class="result">{{ n(0.42, 'percent') }}</span>
        </div>
        <div class="example-row">
          <code>n(99.99, 'currency')</code>
          <span class="result">{{ n(99.99, 'currency') }}</span>
        </div>
      </div>
    </section>

    <!-- 2. useLocale -->
    <section class="card">
      <h3>{{ t('demo.useLocale.title') }}</h3>
      <p class="desc">{{ t('demo.useLocale.description') }}</p>
      <div class="code-block">
        <pre>const { locale, availableLocales, setLocale, isCurrentLocale } = useLocale()

isCurrentLocale('zh-CN') // → true (if current is zh-CN)</pre>
      </div>
      <div class="examples">
        <div class="example-row">
          <code>locale</code>
          <span class="result badge badge-blue">{{ locale }}</span>
        </div>
        <div class="example-row">
          <code>availableLocales</code>
          <span class="result">{{ availableLocales.join(', ') }}</span>
        </div>
        <div v-for="loc in availableLocales" :key="loc" class="example-row">
          <code>isCurrentLocale('{{ loc }}')</code>
          <span :class="['result', 'badge', isCurrentLocale(loc) ? 'badge-green' : 'badge-gray']">
            {{ isCurrentLocale(loc) }}
          </span>
        </div>
      </div>
    </section>

    <!-- 3. useTranslation -->
    <section class="card">
      <h3>{{ t('demo.useTranslation.title') }}</h3>
      <p class="desc">{{ t('demo.useTranslation.description') }}</p>
      <div class="code-block">
        <pre>const { t: tHome } = useTranslation('pages.home')
tHome('title')   // → t('pages.home.title')
tHome('welcome', { name: 'User' }) // → t('pages.home.welcome', { name: 'User' })

const { t: tSettings, te: teSettings } = useTranslation('pages.settings')
teSettings('theme') // → te('pages.settings.theme')</pre>
      </div>
      <div class="examples">
        <div class="example-row">
          <code>tHome('title')</code>
          <span class="result">{{ tHome('title') }}</span>
        </div>
        <div class="example-row">
          <code>tHome('welcome', { name: 'User' })</code>
          <span class="result">{{ tHome('welcome', { name: 'User' }) }}</span>
        </div>
        <div class="example-row">
          <code>tSettings('title')</code>
          <span class="result">{{ tSettings('title') }}</span>
        </div>
        <div class="example-row">
          <code>tSettings('notifications')</code>
          <span class="result">{{ tSettings('notifications') }}</span>
        </div>
      </div>
    </section>

    <!-- 4. useI18nScope -->
    <section class="card">
      <h3>{{ t('demo.useI18nScope.title') }}</h3>
      <p class="desc">{{ t('demo.useI18nScope.description') }}</p>
      <div class="code-block">
        <pre>const aboutScope = useI18nScope('pages.about')
aboutScope.t('title')             // → t('pages.about.title')
aboutScope.t('version', { version: '4.0.0' })
aboutScope.gt('app.title')        // Global translation (bypass scope)
aboutScope.te('title')            // Check if key exists in scope
aboutScope.scope                  // → 'pages.about'</pre>
      </div>
      <div class="examples">
        <div class="example-row"><code>aboutScope.t('title')</code><span class="result">{{ aboutScope.t('title') }}</span></div>
        <div class="example-row"><code>aboutScope.t('version', { version: '4.0.0' })</code><span class="result">{{ aboutScope.t('version', { version: '4.0.0' }) }}</span></div>
        <div class="example-row"><code>aboutScope.gt('common.save') (global)</code><span class="result">{{ aboutScope.gt('common.save') }}</span></div>
        <div class="example-row"><code>aboutScope.scope</code><span class="result badge badge-blue">{{ aboutScope.scope }}</span></div>
      </div>
    </section>

    <!-- 5. 动态翻译 -->
    <section class="card">
      <h3>{{ t('demo.dynamicTranslation.title') }}</h3>
      <p class="desc">{{ t('demo.dynamicTranslation.description') }}</p>
      <div class="input-group">
        <input v-model="dynamicKey" class="input" :placeholder="t('demo.dynamicTranslation.placeholder')" @keyup.enter="translateDynamic" />
        <button class="btn-primary" @click="translateDynamic">{{ t('demo.dynamicTranslation.translateButton') }}</button>
      </div>
      <div v-if="dynamicResult" class="examples">
        <div class="example-row">
          <code>t('{{ dynamicKey }}')</code>
          <span class="result">{{ dynamicResult }}</span>
        </div>
      </div>
    </section>

    <!-- 6. 动态合并语言包 -->
    <section class="card">
      <h3>{{ t('demo.mergeLocaleMessage.title') }}</h3>
      <p class="desc">{{ t('demo.mergeLocaleMessage.description') }}</p>
      <div class="code-block">
        <pre>const { mergeLocaleMessage } = useI18n()
mergeLocaleMessage('zh-CN', { custom: { greeting: 'Hi!' } })
t('custom.greeting') // → 'Hi!'</pre>
      </div>
      <div class="input-group vertical">
        <textarea v-model="newMessages" class="textarea" rows="4"></textarea>
        <button class="btn-primary" @click="mergeMessages">{{ t('demo.dynamicMessages.mergeButton', { params: { locale } }) }}</button>
      </div>
      <p v-if="mergeStatus" :class="['status', mergeStatus.startsWith('✓') ? 'status-ok' : 'status-err']">
        {{ mergeStatus }}
      </p>
    </section>

    <!-- 7. setLocaleMessage -->
    <section class="card">
      <h3>{{ t('demo.setLocaleMessage.title') }}</h3>
      <p class="desc">{{ t('demo.setLocaleMessage.description') }}</p>
      <div class="code-block">
        <pre>const msgs = getLocaleMessage('zh-CN')
msgs.pages.about = { title: 'New', ... }
setLocaleMessage('zh-CN', msgs)</pre>
      </div>
      <div class="input-group vertical">
        <label class="input-label">{{ t('demo.setLocaleMessage.replacePath', { params: { path: replaceTarget } }) }}</label>
        <textarea v-model="replaceJSON" class="textarea" rows="4"></textarea>
        <button class="btn-primary" @click="doReplace">{{ t('demo.setLocaleMessage.replaceButton') }}</button>
      </div>
      <p v-if="replaceStatus" :class="['status', replaceStatus.startsWith('✓') ? 'status-ok' : 'status-err']">
        {{ replaceStatus }}
      </p>
      <div class="examples" style="margin-top: 8px">
        <div class="example-row"><code>aboutScope.t('title')</code><span class="result">{{ aboutScope.t('title') }}</span></div>
        <div class="example-row"><code>aboutScope.t('description')</code><span class="result">{{ aboutScope.t('description') }}</span></div>
      </div>
    </section>

    <!-- 8. $t 全局属性 -->
    <section class="card">
      <h3>{{ t('demo.globalProperties.title') }}</h3>
      <p class="desc">{{ t('demo.globalProperties.description') }}</p>
      <div class="code-block">
        <pre>// Auto-registered after createI18nPlugin install:
// app.config.globalProperties.$t = i18n.t
// app.config.globalProperties.$i18n = i18n
// app.config.globalProperties.$locale = { get, set }

// Use directly in templates:
// {{ $t('key') }}
// {{ $t('key', { name: 'X' }) }}</pre>
      </div>
      <div class="examples">
        <div class="example-row">
          <code>{<!-- -->{ $t('demo.basic.hello') }<!-- -->}</code>
          <span class="result">{{ $t('demo.basic.hello') }}</span>
        </div>
        <div class="example-row">
          <code>{<!-- -->{ $t('common.save') }<!-- -->}</code>
          <span class="result">{{ $t('common.save') }}</span>
        </div>
        <div class="example-row">
          <code>{<!-- -->{ $t('demo.basic.greeting', { name: 'World' }) }<!-- -->}</code>
          <span class="result">{{ $t('demo.basic.greeting', { name: 'World' }) }}</span>
        </div>
      </div>
    </section>

    <!-- 9. te() 翻译键检测 -->
    <section class="card">
      <h3>{{ t('demo.translationExists.title') }}</h3>
      <p class="desc">{{ t('demo.translationExists.descriptionConditional') }}</p>
      <div class="code-block">
        <pre>// Conditional rendering in templates
// &lt;span v-if="te('optional.key')"&gt;{{ t('optional.key') }}&lt;/span&gt;
// &lt;span v-else&gt;Fallback content&lt;/span&gt;</pre>
      </div>
      <div class="examples">
        <div class="example-row">
          <code>te('demo.basic.hello')</code>
          <span :class="['result', 'badge', te('demo.basic.hello') ? 'badge-green' : 'badge-red']">
            {{ te('demo.basic.hello') ? t('demo.translationExists.exists') : t('demo.translationExists.missing') }}
          </span>
        </div>
        <div class="example-row">
          <code>te('non.existent.key')</code>
          <span :class="['result', 'badge', te('non.existent.key') ? 'badge-green' : 'badge-red']">
            {{ te('non.existent.key') ? t('demo.translationExists.exists') : t('demo.translationExists.missing') }}
          </span>
        </div>
        <div class="example-row">
          <code>te('validation.required')</code>
          <span :class="['result', 'badge', te('validation.required') ? 'badge-green' : 'badge-red']">
            {{ te('validation.required') ? t('demo.translationExists.exists') : t('demo.translationExists.missing') }}
          </span>
        </div>
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
.card.highlight {
  border-left: 4px solid #10b981;
  background: linear-gradient(135deg, #f0fdf4 0%, white 100%);
}
.card h2 { font-size: 18px; margin-bottom: 8px; color: #10b981; }
.card h3 { font-size: 16px; margin-bottom: 8px; }
.desc { font-size: 13px; color: var(--text-secondary); margin-bottom: 16px; }

.code-block {
  background: #1e1e2e; color: #cdd6f4; border-radius: 6px;
  padding: 16px; margin-bottom: 16px; overflow-x: auto;
}
.code-block pre {
  font-family: 'Fira Code', 'Consolas', monospace;
  font-size: 12px; line-height: 1.6; white-space: pre;
}

.examples { display: flex; flex-direction: column; gap: 10px; }
.example-row {
  display: flex; align-items: center; gap: 16px;
  padding: 8px 12px; background: var(--bg); border-radius: 6px; font-size: 13px;
}
.example-row code {
  flex-shrink: 0; font-family: 'Fira Code', 'Consolas', monospace;
  font-size: 12px; color: #10b981; background: #ecfdf5;
  padding: 2px 8px; border-radius: 4px;
  max-width: 55%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}
.result { color: var(--text); font-weight: 500; }

.badge { padding: 2px 10px; border-radius: 10px; font-size: 12px; font-weight: 600; }
.badge-green { background: #dcfce7; color: #15803d; }
.badge-red { background: #fef2f2; color: #dc2626; }
.badge-gray { background: #f3f4f6; color: #6b7280; }
.badge-blue { background: #dbeafe; color: #1d4ed8; }

.input-group { display: flex; gap: 8px; margin-bottom: 12px; }
.input-group.vertical { flex-direction: column; }
.input-label { font-size: 12px; color: var(--text-secondary); }
.input {
  flex: 1; padding: 8px 12px; border: 1px solid var(--border); border-radius: 6px;
  font-size: 13px; font-family: 'Fira Code', 'Consolas', monospace;
}
.textarea {
  padding: 8px 12px; border: 1px solid var(--border); border-radius: 6px;
  font-size: 12px; font-family: 'Fira Code', 'Consolas', monospace; resize: vertical;
}

.btn-primary {
  padding: 8px 20px; background: #10b981; color: white; border: none;
  border-radius: 6px; font-size: 13px; font-weight: 500; cursor: pointer;
  white-space: nowrap;
}
.btn-primary:hover { background: #059669; }

.status { font-size: 13px; margin-top: 8px; padding: 8px 12px; border-radius: 6px; }
.status-ok { background: #dcfce7; color: #15803d; }
.status-err { background: #fef2f2; color: #dc2626; }
</style>
