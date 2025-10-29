import { OptimizedI18n } from '@ldesign/i18n-core'

// 创建 i18n 实例
const i18n = new OptimizedI18n({
  locale: 'zh-CN',
  fallbackLocale: 'en',
  messages: {
    'zh-CN': {
      hello: '你好',
      welcome: '欢迎 {name}！',
      items: '个项目 | 个项目',
      goodbye: '再见',
      about: '关于我们',
      nested: {
        message: '这是嵌套的消息'
      }
    },
    'en': {
      hello: 'Hello',
      welcome: 'Welcome {name}!',
      items: 'item | items',
      goodbye: 'Goodbye',
      about: 'About Us',
      nested: {
        message: 'This is a nested message'
      }
    },
    'ja': {
      hello: 'こんにちは',
      welcome: 'ようこそ {name}！',
      items: 'アイテム | アイテム',
      goodbye: 'さようなら',
      about: '私たちについて',
      nested: {
        message: 'これはネストされたメッセージです'
      }
    }
  },
  cache: {
    enabled: true,
    maxSize: 500
  }
})

// 初始化
await i18n.init()

let pluralCount = 5

// 工具函数
function $(id: string) {
  return document.getElementById(id)!
}

function updateOutput(id: string, content: string) {
  $(id).innerHTML = content
}

// 1. 基础翻译
$('btn-basic').addEventListener('click', () => {
  const results = [
    `t('hello'): ${i18n.t('hello')}`,
    `t('goodbye'): ${i18n.t('goodbye')}`,
    `t('about'): ${i18n.t('about')}`,
    `t('nested.message'): ${i18n.t('nested.message')}`
  ]
  updateOutput('output-basic', results.join('<br>'))
})

// 2. 参数插值
$('btn-interpolation').addEventListener('click', () => {
  const name = ($('input-name') as HTMLInputElement).value
  const result = i18n.t('welcome', { name })
  updateOutput('output-interpolation', `结果: ${result}`)
})

// 3. 复数化
$('btn-plural-dec').addEventListener('click', () => {
  pluralCount = Math.max(0, pluralCount - 1)
  $('plural-count').textContent = String(pluralCount)
})

$('btn-plural-inc').addEventListener('click', () => {
  pluralCount++
  $('plural-count').textContent = String(pluralCount)
})

$('btn-plural').addEventListener('click', () => {
  const result = i18n.plural('items', pluralCount)
  updateOutput('output-plural', `${pluralCount} ${result}`)
})

// 4. 日期和数字格式化
$('btn-format').addEventListener('click', () => {
  const results = [
    `日期 (long): ${i18n.date(new Date(), { dateStyle: 'long' })}`,
    `日期 (short): ${i18n.date(new Date(), { dateStyle: 'short' })}`,
    `数字: ${i18n.number(1234567.89)}`,
    `货币: ${i18n.currency(99.99, 'USD')}`,
    `百分比: ${i18n.number(0.85, { style: 'percent' })}`
  ]
  updateOutput('output-format', results.join('<br>'))
})

// 5. 语言切换
async function switchLocale(locale: string) {
  await i18n.setLocale(locale)
  updateOutput('output-locale', `当前语言: <strong>${i18n.locale}</strong><br>` +
    `回退语言: ${i18n.fallbackLocale}<br>` +
    `可用语言: ${i18n.getAvailableLocales().join(', ')}<br>` +
    `测试翻译: ${i18n.t('hello')}`)
}

$('btn-locale-zh').addEventListener('click', () => switchLocale('zh-CN'))
$('btn-locale-en').addEventListener('click', () => switchLocale('en'))
$('btn-locale-ja').addEventListener('click', () => switchLocale('ja'))

// 6. 高级功能
$('btn-exists').addEventListener('click', () => {
  const results = [
    `exists('hello'): ${i18n.exists('hello')}`,
    `exists('missing.key'): ${i18n.exists('missing.key')}`,
    `exists('nested.message'): ${i18n.exists('nested.message')}`
  ]
  updateOutput('output-advanced', results.join('<br>'))
})

$('btn-raw').addEventListener('click', () => {
  const messages = i18n.getMessages(i18n.locale)
  updateOutput('output-advanced',
    `<strong>当前语言的所有消息:</strong><br>` +
    `<pre style="background: #f0f0f0; padding: 1rem; border-radius: 4px; overflow-x: auto;">${JSON.stringify(messages, null, 2)}</pre>`)
})

$('btn-merge').addEventListener('click', () => {
  i18n.mergeMessages('zh-CN', {
    dynamic: {
      message: '这是动态添加的消息 - ' + new Date().toLocaleTimeString()
    }
  })
  const result = i18n.t('dynamic.message')
  updateOutput('output-advanced',
    `动态消息已添加！<br>` +
    `t('dynamic.message'): ${result}`)
})

// 初始化显示
updateOutput('output-locale', `当前语言: <strong>${i18n.locale}</strong>`)

console.log('✅ i18n-core example loaded successfully!')
console.log('i18n instance:', i18n)

