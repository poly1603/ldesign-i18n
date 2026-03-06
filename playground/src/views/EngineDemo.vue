<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  useI18n,
  useI18nFormat,
  useI18nPlural,
  useI18nScope,
  useI18nValidation,
  useI18nMeta,
  useI18nRoute,
  useI18nMissingKeys,
} from '@ldesign/i18n-vue'

// ==================== useI18n ====================
const { t, tc, te, d, n, locale, i18n } = useI18n()

// ==================== useI18nScope ====================
const homeScope = useI18nScope('pages.home')
const settingsScope = useI18nScope('pages.settings')

// ==================== useI18nFormat ====================
const {
  formatNumber, formatCurrency, formatPercent, formatCompact,
  formatDate, formatTime, formatDateTime, formatRelativeTime,
  formatFileSize, formatDuration, formatList,
} = useI18nFormat()

// ==================== useI18nPlural ====================
const { plural, getPluralRule, smartPlural } = useI18nPlural()

// ==================== useI18nValidation ====================
const { validate, rules, getValidationMessage } = useI18nValidation()

// ==================== useI18nMeta ====================
useI18nMeta({
  title: 'demo.meta.pageTitle',
  description: 'demo.meta.pageDescription',
  autoLangTag: true,
})

// ==================== useI18nRoute ====================
const { localePath, switchLocaleRoute, getLocalizedRoutes, removeLocalePrefix } = useI18nRoute({
  strategy: 'prefix_except_default',
  defaultLocale: 'en-US',
})

// ==================== 响应式数据 ====================
const now = new Date()
const pastDate = new Date(Date.now() - 3600 * 1000 * 2)
const fileBytes = ref(1536000)
const durationMs = ref(3661000)
const listItems = ref(['Vue', 'React', 'Angular'])

// 复数化
const pluralCount = ref(1)
function incPlural() { pluralCount.value++ }
function decPlural() { if (pluralCount.value > 0) pluralCount.value-- }

// 格式化计算属性
const fmtNumber = formatNumber(1234567.89)
const fmtCurrency = formatCurrency(1299.99, 'CNY')
const fmtCurrencyUSD = formatCurrency(49.99, 'USD')
const fmtPercent = formatPercent(0.8567)
const fmtCompact = formatCompact(1234567)
const fmtDate = formatDate(now)
const fmtTime = formatTime(now)
const fmtDateTime = formatDateTime(now)
const fmtRelative = formatRelativeTime(pastDate)
const fmtFileSize = formatFileSize(fileBytes)
const fmtDuration = formatDuration(durationMs)
const fmtList = formatList(listItems)

// 复数
const pluralResult = plural('demo.plural.item', pluralCount)
const pluralRule = getPluralRule(pluralCount)
const smartPluralResult = smartPlural('file', pluralCount)

// 验证
const emailInput = ref('')
const nameInput = ref('')
const emailError = ref('')
const nameError = ref('')

async function validateEmail() {
  const result = await validate(emailInput.value, [rules.required(), rules.email()])
  emailError.value = result.valid ? t('demo.validationStatus.valid') : result.message || ''
}

async function validateName() {
  const result = await validate(nameInput.value, [rules.required(), rules.minLength(2), rules.maxLength(20)])
  nameError.value = result.valid ? t('demo.validationStatus.valid') : result.message || ''
}

// 路由
const routeExamples = computed(() => [
  { label: "localePath('/about')", result: localePath('/about') },
  { label: "localePath('/about', 'zh-CN')", result: localePath('/about', 'zh-CN') },
  { label: "localePath('/about', 'ja-JP')", result: localePath('/about', 'ja-JP') },
  { label: "switchLocaleRoute('zh-CN')", result: switchLocaleRoute('zh-CN') },
  { label: "removeLocalePrefix('/zh-CN/about')", result: removeLocalePrefix('/zh-CN/about') },
])

// v-t-plural 指令数据
const pluralDirectiveData = computed(() => ({
  key: 'demo.plural.file',
  count: pluralCount.value,
}))

// ==================== useI18nMissingKeys ====================
const { missingKeys, hasMissing, missingCount, clearMissing } = useI18nMissingKeys()

let missingCounter = 0
function triggerMissingKey() {
  missingCounter++
  i18n.t(`test.missing.key_${missingCounter}`)
  i18n.t(`another.nonexistent.path_${missingCounter}`)
}

// ==================== v-t-date / v-t-number 数据 ====================
const dateFullConfig = computed(() => ({ value: now, dateStyle: 'full' as const }))
const dateTimeConfig = computed(() => ({ value: now, timeStyle: 'medium' as const }))
const dateTimeComboConfig = computed(() => ({ value: now, dateStyle: 'medium' as const, timeStyle: 'short' as const }))
const currencyConfig = computed(() => ({ value: 1299.99, style: 'currency' as const, currency: 'CNY' }))
const currencyUSDConfig = computed(() => ({ value: 49.99, style: 'currency' as const, currency: 'USD' }))
const percentConfig = computed(() => ({ value: 0.856, style: 'percent' as const }))
const compactConfig = computed(() => ({ value: 1234567, notation: 'compact' as const }))
</script>

<template>
  <div class="demo">
    <!-- 模式说明 -->
    <section class="card highlight">
      <h2>{{ t('mode.engine.title') }}</h2>
      <p class="desc">{{ t('mode.engine.description') }}</p>
      <div class="code-block">
        <pre>import { createVueEngine } from '@ldesign/engine-vue3'
import { createI18nEnginePlugin } from '@ldesign/i18n-vue'

const i18nPlugin = createI18nEnginePlugin({
  locale: 'zh-CN',
  fallbackLocale: 'en-US',
  messages,
  persistence: { enabled: true, storage: 'localStorage' },
  onLocaleChange(locale, old) { console.log(old, '→', locale) },
  onReady(ctx) { console.log('Ready!', ctx.getLocale()) },
})

const engine = createVueEngine({
  app: { rootComponent: App },
  plugins: [i18nPlugin],
})
engine.mount('#app')</pre>
      </div>
    </section>

    <!-- ==================== 1. useI18n 基础翻译 ==================== -->
    <section class="card">
      <h3>useI18n() — {{ t('demo.basic.title') }}</h3>
      <p class="desc">{{ t('demo.basic.description') }}</p>
      <div class="code-block">
        <pre>const { t, tc, te, d, n, locale, setLocale } = useI18n()</pre>
      </div>
      <div class="examples">
        <div class="example-row">
          <code>t('demo.basic.hello')</code>
          <span class="result">{{ t('demo.basic.hello') }}</span>
        </div>
        <div class="example-row">
          <code>t('demo.basic.greeting', { name: 'Alice' })</code>
          <span class="result">{{ t('demo.basic.greeting', { name: 'Alice' }) }}</span>
        </div>
        <div class="example-row">
          <code>t('demo.interpolation.nested', { orderId: '10086', count: 3, total: '$99' })</code>
          <span class="result">{{ t('demo.interpolation.nested', { orderId: '10086', count: 3, total: '$99' }) }}</span>
        </div>
      </div>
    </section>

    <!-- ==================== 2. 复数化 ==================== -->
    <section class="card">
      <h3>useI18n().tc() & useI18nPlural() — {{ t('demo.plural.title') }}</h3>
      <p class="desc">{{ t('demo.plural.description') }}</p>
      <div class="code-block">
        <pre>// useI18n
tc('demo.plural.item', count)

// useI18nPlural — Reactive ComputedRef
const { plural, getPluralRule, smartPlural } = useI18nPlural()
const result = plural('key', countRef)     // ComputedRef&lt;string&gt;
const rule = getPluralRule(countRef)        // 'zero' | 'one' | 'other'
const smart = smartPlural('file', countRef) // Auto English plural</pre>
      </div>
      <div class="controls">
        <button class="btn" @click="decPlural">-</button>
        <span class="count">{{ pluralCount }}</span>
        <button class="btn" @click="incPlural">+</button>
      </div>
      <div class="examples">
        <div class="example-row">
          <code>tc('demo.plural.item', {{ pluralCount }})</code>
          <span class="result">{{ tc('demo.plural.item', pluralCount) }}</span>
        </div>
        <div class="example-row">
          <code>tc('demo.plural.apple', {{ pluralCount }})</code>
          <span class="result">{{ tc('demo.plural.apple', pluralCount) }}</span>
        </div>
        <div class="example-row">
          <code>plural('demo.plural.item', ref({{ pluralCount }}))</code>
          <span class="result">{{ pluralResult }}</span>
        </div>
        <div class="example-row">
          <code>getPluralRule({{ pluralCount }})</code>
          <span class="result badge badge-blue">{{ pluralRule }}</span>
        </div>
        <div class="example-row">
          <code>smartPlural('file', {{ pluralCount }})</code>
          <span class="result">{{ smartPluralResult }}</span>
        </div>
      </div>
    </section>

    <!-- ==================== 3. useI18nFormat ==================== -->
    <section class="card">
      <h3>{{ t('demo.format.title') }}</h3>
      <p class="desc">{{ t('demo.format.description') }}</p>
      <div class="code-block">
        <pre>const {
  formatNumber, formatCurrency, formatPercent, formatCompact,
  formatDate, formatTime, formatDateTime, formatRelativeTime,
  formatFileSize, formatDuration, formatList,
} = useI18nFormat()

// All return ComputedRef&lt;string&gt;, auto-update on locale change</pre>
      </div>
      <div class="examples">
        <div class="example-row"><code>formatNumber(1234567.89)</code><span class="result">{{ fmtNumber }}</span></div>
        <div class="example-row"><code>formatCurrency(1299.99, 'CNY')</code><span class="result">{{ fmtCurrency }}</span></div>
        <div class="example-row"><code>formatCurrency(49.99, 'USD')</code><span class="result">{{ fmtCurrencyUSD }}</span></div>
        <div class="example-row"><code>formatPercent(0.8567)</code><span class="result">{{ fmtPercent }}</span></div>
        <div class="example-row"><code>formatCompact(1234567)</code><span class="result">{{ fmtCompact }}</span></div>
        <div class="example-row"><code>formatDate(now)</code><span class="result">{{ fmtDate }}</span></div>
        <div class="example-row"><code>formatTime(now)</code><span class="result">{{ fmtTime }}</span></div>
        <div class="example-row"><code>formatDateTime(now)</code><span class="result">{{ fmtDateTime }}</span></div>
        <div class="example-row"><code>formatRelativeTime(2h ago)</code><span class="result">{{ fmtRelative }}</span></div>
        <div class="example-row"><code>formatFileSize(1536000)</code><span class="result">{{ fmtFileSize }}</span></div>
        <div class="example-row"><code>formatDuration(3661000ms)</code><span class="result">{{ fmtDuration }}</span></div>
        <div class="example-row"><code>formatList(['Vue','React','Angular'])</code><span class="result">{{ fmtList }}</span></div>
      </div>
    </section>

    <!-- ==================== 4. 指令 ==================== -->
    <section class="card">
      <h3>{{ t('demo.directive.title') }}</h3>
      <p class="desc">{{ t('demo.directive.description') }}</p>
      <div class="code-block">
        <pre>&lt;span v-t="'key'"&gt;&lt;/span&gt;
&lt;span v-t="{ key: 'key', params: { name: 'X' } }"&gt;&lt;/span&gt;</pre>
      </div>
      <div class="examples">
        <div class="example-row">
          <code>v-t="'demo.directive.simpleText'"</code>
          <span v-t="'demo.directive.simpleText'" class="result"></span>
        </div>
        <div class="example-row">
          <code>v-t="{ key, params: { name, day } }"</code>
          <span v-t="{ key: 'demo.directive.withParams', params: { name: 'Alice', day: 'Monday' } }" class="result"></span>
        </div>
      </div>
    </section>

    <section class="card">
      <h3>{{ t('demo.htmlDirective.title') }}</h3>
      <p class="desc">{{ t('demo.htmlDirective.description') }}</p>
      <div class="code-block">
        <pre>&lt;span v-t-html="'key.with.html'"&gt;&lt;/span&gt;
// innerHTML will be set to translated HTML content</pre>
      </div>
      <div class="examples">
        <div class="example-row">
          <code>v-t-html="'demo.htmlDirective.richText'"</code>
          <span v-t-html="'demo.htmlDirective.richText'" class="result"></span>
        </div>
        <div class="example-row">
          <code>v-t-html="'demo.htmlDirective.withLink'"</code>
          <span v-t-html="'demo.htmlDirective.withLink'" class="result"></span>
        </div>
      </div>
    </section>

    <section class="card">
      <h3>{{ t('demo.pluralDirective.title') }}</h3>
      <p class="desc">{{ t('demo.pluralDirective.description') }}</p>
      <div class="code-block">
        <pre>&lt;span v-t-plural="{ key: 'demo.plural.file', count: 5 }"&gt;&lt;/span&gt;</pre>
      </div>
      <div class="examples">
        <div class="example-row">
          <code>v-t-plural="{ key, count: {{ pluralCount }} }"</code>
          <span v-t-plural="pluralDirectiveData" class="result"></span>
        </div>
      </div>
    </section>

    <section class="card">
      <h3>{{ t('demo.tooltipDirective.title') }}</h3>
      <p class="desc">{{ t('demo.tooltipDirective.description') }}</p>
      <div class="code-block">
        <pre>&lt;span v-t-tooltip="{ key: 'key', showKey: true, showLocale: true }"&gt;&lt;/span&gt;
// Shows translation key and locale info on hover (debug)</pre>
      </div>
      <div class="examples">
        <div class="example-row">
          <code>v-t-tooltip (hover me!)</code>
          <span v-t-tooltip="{ key: 'demo.tooltipDirective.hoverMe', showKey: true, showLocale: true }" class="result" style="cursor: help; text-decoration: underline dotted;"></span>
        </div>
      </div>
    </section>

    <!-- ==================== 5. 组件 ==================== -->
    <section class="card">
      <h3>{{ t('demo.component.title') }}</h3>
      <p class="desc">{{ t('demo.component.description') }}</p>
      <div class="code-block">
        <pre>&lt;I18nText keypath="key" :params="{ name: 'X' }" tag="p" /&gt;
&lt;I18nTranslate keypath="key" :values="{ name: 'X' }" :count="5"&gt;
  &lt;template #default="{ text }"&gt;{<!-- -->{ text }<!-- -->}&lt;/template&gt;
&lt;/I18nTranslate&gt;</pre>
      </div>
      <div class="examples">
        <div class="example-row">
          <code>&lt;I18nText keypath="demo.basic.greeting" :params="{ name: 'World' }" /&gt;</code>
          <span class="result">
            <I18nText keypath="demo.basic.greeting" :params="{ name: 'World' }" />
          </span>
        </div>
        <div class="example-row">
          <code>&lt;I18nTranslate keypath="demo.basic.greetingWithRole" :values="{ name: 'Admin', role: 'Super' }" /&gt;</code>
          <span class="result">
            <I18nTranslate keypath="demo.basic.greetingWithRole" :values="{ name: 'Admin', role: 'Super' }" />
          </span>
        </div>
        <div class="example-row">
          <code>&lt;I18nText keypath="demo.plural.apple" :plural="3" /&gt;</code>
          <span class="result">
            <I18nText keypath="demo.plural.apple" :plural="3" />
          </span>
        </div>
      </div>
    </section>

    <!-- ==================== 6. useI18nScope ==================== -->
    <section class="card">
      <h3>{{ t('demo.scope.title') }}</h3>
      <p class="desc">{{ t('demo.scope.description') }}</p>
      <div class="code-block">
        <pre>const homeScope = useI18nScope('pages.home')
homeScope.t('title')               // → t('pages.home.title')
homeScope.gt('app.title')          // → t('app.title') (global)
homeScope.te('title')              // → te('pages.home.title')
homeScope.scope                    // → 'pages.home'</pre>
      </div>
      <div class="examples">
        <div class="example-row"><code>homeScope.t('title')</code><span class="result">{{ homeScope.t('title') }}</span></div>
        <div class="example-row"><code>homeScope.t('welcome', { name: 'Alice' })</code><span class="result">{{ homeScope.t('welcome', { name: 'Alice' }) }}</span></div>
        <div class="example-row"><code>settingsScope.t('title')</code><span class="result">{{ settingsScope.t('title') }}</span></div>
        <div class="example-row"><code>settingsScope.t('theme')</code><span class="result">{{ settingsScope.t('theme') }}</span></div>
        <div class="example-row"><code>homeScope.gt('app.title') (global)</code><span class="result">{{ homeScope.gt('app.title') }}</span></div>
        <div class="example-row"><code>homeScope.scope</code><span class="result badge badge-blue">{{ homeScope.scope }}</span></div>
      </div>
    </section>

    <!-- ==================== 7. useI18nValidation ==================== -->
    <section class="card">
      <h3>{{ t('demo.validation.title') }}</h3>
      <p class="desc">{{ t('demo.validation.description') }}</p>
      <div class="code-block">
        <pre>const { validate, rules, getValidationMessage } = useI18nValidation()

// Built-in rules: required, email, min, max, minLength, maxLength,
//                  numeric, url, phone, pattern, alphanumeric, custom

const result = await validate(value, [rules.required(), rules.email()])
// → { valid: false, message: 'Please enter a valid email', rule: 'email' }</pre>
      </div>
      <div class="input-group">
        <input v-model="emailInput" class="input" :placeholder="t('demo.validation.enterEmail')" @blur="validateEmail" />
        <span :class="['status-inline', emailError.startsWith('✓') ? 'status-ok' : 'status-err']" v-if="emailError">{{ emailError }}</span>
      </div>
      <div class="input-group">
        <input v-model="nameInput" class="input" :placeholder="t('demo.validation.enterName')" @blur="validateName" />
        <span :class="['status-inline', nameError.startsWith('✓') ? 'status-ok' : 'status-err']" v-if="nameError">{{ nameError }}</span>
      </div>
    </section>

    <!-- ==================== 8. useI18nMeta ==================== -->
    <section class="card">
      <h3>{{ t('demo.meta.title') }}</h3>
      <p class="desc">{{ t('demo.meta.description') }}</p>
      <div class="code-block">
        <pre>useI18nMeta({
  title: 'demo.meta.pageTitle',         // Auto-translate and set document.title
  description: 'demo.meta.pageDescription', // Set meta description
  autoLangTag: true,                     // Auto-set html lang attribute
  titleTemplate: '{<!-- -->{title}} | MyApp',      // Title template
  ogTitle: 'demo.meta.pageTitle',        // Open Graph title
})

// Auto-updates all meta tags on locale change</pre>
      </div>
      <div class="examples">
        <div class="example-row">
          <code>document.title</code>
          <span class="result">{{ t('demo.meta.pageTitle') }}</span>
        </div>
        <div class="example-row">
          <code>document.documentElement.lang</code>
          <span class="result badge badge-blue">{{ locale }}</span>
        </div>
      </div>
    </section>

    <!-- ==================== 9. useI18nRoute ==================== -->
    <section class="card">
      <h3>{{ t('demo.route.title') }}</h3>
      <p class="desc">{{ t('demo.route.description') }}</p>
      <div class="code-block">
        <pre>const { localePath, switchLocaleRoute, getLocalizedRoutes } = useI18nRoute({
  strategy: 'prefix_except_default',  // 'prefix' | 'prefix_except_default' | 'prefix_and_default'
  defaultLocale: 'en-US',
})

localePath('/about')            // → '/about' (default locale)
localePath('/about', 'zh-CN')   // → '/zh-CN/about'</pre>
      </div>
      <div class="examples">
        <div v-for="item in routeExamples" :key="item.label" class="example-row">
          <code>{{ item.label }}</code>
          <span class="result">{{ item.result }}</span>
        </div>
      </div>
    </section>

    <!-- ==================== 10. useI18nAsync ==================== -->
    <section class="card">
      <h3>{{ t('demo.async.title') }}</h3>
      <p class="desc">{{ t('demo.async.description') }}</p>
      <div class="code-block">
        <pre>const { loading, error, ready, loadMessages } = useI18nAsync({
  loader: async (locale) => {
    const module = await import(`./locales/${locale}.ts`)
    return module.default
  },
  loadLocale: true,  // Auto-load on mount
})

// loading.value → true/false (loading state)
// error.value   → Error | null
// ready.value   → true (loaded)
// loadMessages('ko-KR') → Manually load a locale</pre>
      </div>
    </section>

    <!-- ==================== 11. useI18nPerformance ==================== -->
    <section class="card">
      <h3>{{ t('demo.performance.title') }}</h3>
      <p class="desc">{{ t('demo.performance.description') }}</p>
      <div class="code-block">
        <pre>const { metrics, start, stop, reset, getReport } = useI18nPerformance({
  enabled: true,
  slowThreshold: 10,     // Slow translation threshold (ms)
  autoReport: false,
})

// metrics.value.totalTranslations → Total translations
// metrics.value.cacheHitRate      → Cache hit rate (%)
// metrics.value.avgTranslationTime → Avg translation time (ms)
// metrics.value.slowestTranslations → Slowest translations Top 10
// metrics.value.mostUsedKeys       → Most used keys Top 10
// metrics.value.estimatedMemoryUsage → Estimated memory (KB)</pre>
      </div>
    </section>

    <!-- ==================== 12. v-t-date 日期格式化指令 ==================== -->
    <section class="card">
      <h3>{{ t('demo.dateDirective.title') }}</h3>
      <p class="desc">{{ t('demo.dateDirective.description') }}</p>
      <div class="code-block">
        <pre>&lt;span v-t-date="new Date()" /&gt;
&lt;span v-t-date="{ value: myDate, dateStyle: 'full' }" /&gt;
&lt;span v-t-date="{ value: myDate, timeStyle: 'medium' }" /&gt;
&lt;span v-t-date="{ value: myDate, dateStyle: 'medium', timeStyle: 'short' }" /&gt;</pre>
      </div>
      <div class="examples">
        <div class="example-row">
          <code>v-t-date="new Date()"</code>
          <span v-t-date="now" class="result"></span>
        </div>
        <div class="example-row">
          <code>v-t-date="{ value, dateStyle: 'full' }"</code>
          <span v-t-date="dateFullConfig" class="result"></span>
        </div>
        <div class="example-row">
          <code>v-t-date="{ value, timeStyle: 'medium' }"</code>
          <span v-t-date="dateTimeConfig" class="result"></span>
        </div>
        <div class="example-row">
          <code>v-t-date="{ dateStyle: 'medium', timeStyle: 'short' }"</code>
          <span v-t-date="dateTimeComboConfig" class="result"></span>
        </div>
      </div>
    </section>

    <!-- ==================== 13. v-t-number 数字格式化指令 ==================== -->
    <section class="card">
      <h3>{{ t('demo.numberDirective.title') }}</h3>
      <p class="desc">{{ t('demo.numberDirective.description') }}</p>
      <div class="code-block">
        <pre>&lt;span v-t-number="12345.67" /&gt;
&lt;span v-t-number="{ value: 99.99, style: 'currency', currency: 'CNY' }" /&gt;
&lt;span v-t-number="{ value: 0.856, style: 'percent' }" /&gt;
&lt;span v-t-number="{ value: 1234567, notation: 'compact' }" /&gt;</pre>
      </div>
      <div class="examples">
        <div class="example-row">
          <code>v-t-number="12345.67"</code>
          <span v-t-number="12345.67" class="result"></span>
        </div>
        <div class="example-row">
          <code>v-t-number="{ value: 1299.99, currency: 'CNY' }"</code>
          <span v-t-number="currencyConfig" class="result"></span>
        </div>
        <div class="example-row">
          <code>v-t-number="{ value: 49.99, currency: 'USD' }"</code>
          <span v-t-number="currencyUSDConfig" class="result"></span>
        </div>
        <div class="example-row">
          <code>v-t-number="{ value: 0.856, style: 'percent' }"</code>
          <span v-t-number="percentConfig" class="result"></span>
        </div>
        <div class="example-row">
          <code>v-t-number="{ value: 1234567, notation: 'compact' }"</code>
          <span v-t-number="compactConfig" class="result"></span>
        </div>
      </div>
    </section>

    <!-- ==================== 14. I18nNumber 组件 ==================== -->
    <section class="card">
      <h3>{{ t('demo.numberComponent.title') }}</h3>
      <p class="desc">{{ t('demo.numberComponent.description') }}</p>
      <div class="code-block">
        <pre>&lt;I18nNumber :value="1234567" /&gt;
&lt;I18nNumber :value="99.99" format="currency" currency="CNY" /&gt;
&lt;I18nNumber :value="0.856" format="percent" /&gt;
&lt;I18nNumber :value="1234567" format="compact" /&gt;</pre>
      </div>
      <div class="examples">
        <div class="example-row">
          <code>&lt;I18nNumber :value="1234567" /&gt;</code>
          <span class="result"><I18nNumber :value="1234567" /></span>
        </div>
        <div class="example-row">
          <code>&lt;I18nNumber :value="1299.99" format="currency" currency="CNY" /&gt;</code>
          <span class="result"><I18nNumber :value="1299.99" format="currency" currency="CNY" /></span>
        </div>
        <div class="example-row">
          <code>&lt;I18nNumber :value="49.99" format="currency" currency="USD" /&gt;</code>
          <span class="result"><I18nNumber :value="49.99" format="currency" currency="USD" /></span>
        </div>
        <div class="example-row">
          <code>&lt;I18nNumber :value="0.856" format="percent" /&gt;</code>
          <span class="result"><I18nNumber :value="0.856" format="percent" /></span>
        </div>
        <div class="example-row">
          <code>&lt;I18nNumber :value="1234567" format="compact" /&gt;</code>
          <span class="result"><I18nNumber :value="1234567" format="compact" /></span>
        </div>
      </div>
    </section>

    <!-- ==================== 15. I18nDatetime 组件 ==================== -->
    <section class="card">
      <h3>{{ t('demo.datetimeComponent.title') }}</h3>
      <p class="desc">{{ t('demo.datetimeComponent.description') }}</p>
      <div class="code-block">
        <pre>&lt;I18nDatetime :value="new Date()" /&gt;
&lt;I18nDatetime :value="new Date()" dateStyle="full" /&gt;
&lt;I18nDatetime :value="new Date()" format="time" /&gt;
&lt;I18nDatetime :value="new Date()" format="datetime" /&gt;
&lt;I18nDatetime :value="pastDate" format="relative" /&gt;</pre>
      </div>
      <div class="examples">
        <div class="example-row">
          <code>&lt;I18nDatetime :value="now" /&gt;</code>
          <span class="result"><I18nDatetime :value="now" /></span>
        </div>
        <div class="example-row">
          <code>&lt;I18nDatetime :value="now" dateStyle="full" /&gt;</code>
          <span class="result"><I18nDatetime :value="now" dateStyle="full" /></span>
        </div>
        <div class="example-row">
          <code>&lt;I18nDatetime :value="now" format="time" /&gt;</code>
          <span class="result"><I18nDatetime :value="now" format="time" /></span>
        </div>
        <div class="example-row">
          <code>&lt;I18nDatetime :value="now" format="datetime" /&gt;</code>
          <span class="result"><I18nDatetime :value="now" format="datetime" /></span>
        </div>
        <div class="example-row">
          <code>&lt;I18nDatetime :value="pastDate" format="relative" /&gt;</code>
          <span class="result"><I18nDatetime :value="pastDate" format="relative" /></span>
        </div>
      </div>
    </section>

    <!-- ==================== 16. useI18nMissingKeys ==================== -->
    <section class="card">
      <h3>{{ t('demo.missingKeys.title') }}</h3>
      <p class="desc">{{ t('demo.missingKeys.description') }}</p>
      <div class="code-block">
        <pre>const { missingKeys, hasMissing, missingCount, clearMissing, exportMissing } = useI18nMissingKeys()

// missingKeys.value → [{ key, locale, timestamp, count }]
// hasMissing.value  → boolean
// missingCount.value → number
// clearMissing()    → Clear all records
// exportMissing()   → JSON string</pre>
      </div>
      <div class="controls">
        <button class="btn" @click="triggerMissingKey">{{ t('demo.missingKeys.triggerMissing') }}</button>
        <button class="btn" @click="clearMissing" v-if="hasMissing">{{ t('demo.missingKeys.clearAll') }}</button>
        <span v-if="hasMissing" class="badge badge-red">{{ t('demo.missingKeys.total', { params: { count: missingCount } }) }}</span>
        <span v-else class="badge badge-green">{{ t('demo.missingKeys.noMissing') }}</span>
      </div>
      <div v-if="hasMissing" class="examples">
        <div v-for="item in missingKeys" :key="item.key + item.locale" class="example-row">
          <code>{{ item.key }}</code>
          <span class="result">
            <span class="badge badge-blue">{{ item.locale }}</span>
            <span v-if="item.count > 1" style="margin-left: 8px; font-size: 12px; color: #6b7280;">×{{ item.count }}</span>
          </span>
        </div>
      </div>
    </section>

    <!-- ==================== 17. te() 翻译键检测 ==================== -->
    <section class="card">
      <h3>{{ t('demo.translationExists.title') }}</h3>
      <p class="desc">{{ t('demo.translationExists.description') }}</p>
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
          <code>te('validation.email')</code>
          <span :class="['result', 'badge', te('validation.email') ? 'badge-green' : 'badge-red']">
            {{ te('validation.email') ? t('demo.translationExists.exists') : t('demo.translationExists.missing') }}
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
  border-left: 4px solid var(--primary);
  background: linear-gradient(135deg, #fafbff 0%, white 100%);
}
.card h2 { font-size: 18px; margin-bottom: 8px; color: var(--primary); }
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
  font-size: 12px; color: var(--primary); background: var(--primary-light);
  padding: 2px 8px; border-radius: 4px;
  max-width: 55%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}
.result { color: var(--text); font-weight: 500; }

.controls { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; }
.btn {
  min-width: 32px; height: 32px; display: flex; align-items: center; justify-content: center;
  border: 1px solid var(--border); border-radius: 6px; background: white;
  font-size: 16px; font-weight: 600; cursor: pointer; transition: all 0.15s; padding: 0 10px;
}
.btn:hover { border-color: var(--primary); color: var(--primary); }
.count { font-size: 18px; font-weight: 700; min-width: 32px; text-align: center; }

.badge { padding: 2px 10px; border-radius: 10px; font-size: 12px; font-weight: 600; }
.badge-green { background: #dcfce7; color: #15803d; }
.badge-red { background: #fef2f2; color: #dc2626; }
.badge-blue { background: #dbeafe; color: #1d4ed8; }

.input-group { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; }
.input {
  flex: 1; padding: 8px 12px; border: 1px solid var(--border); border-radius: 6px;
  font-size: 13px; font-family: inherit;
}
.status-inline { font-size: 12px; font-weight: 600; white-space: nowrap; }
.status-ok { color: #15803d; }
.status-err { color: #dc2626; }
</style>
