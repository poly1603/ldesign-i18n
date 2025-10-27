# 基本用法

本节展示 @ldesign/i18n 的基础用法。

## 创建 i18n 实例

```typescript
import { createI18n } from '@ldesign/i18n'

const i18n = createI18n({
  locale: 'zh-CN',
  fallbackLocale: 'en-US',
  messages: {
    'zh-CN': {
      hello: '你好',
      goodbye: '再见'
    },
    'en-US': {
      hello: 'Hello',
      goodbye: 'Goodbye'
    }
  }
})
```

## 简单翻译

```typescript
// 获取当前语言的翻译
console.log(i18n.t('hello'))  // 输出: 你好

// 切换语言
i18n.setLocale('en-US')
console.log(i18n.t('hello'))  // 输出: Hello
```

## 带参数的翻译

```typescript
const i18n = createI18n({
  locale: 'zh-CN',
  messages: {
    'zh-CN': {
      welcome: '欢迎，{name}！',
      greeting: '{greeting}，{name}。今天是{date}。'
    },
    'en-US': {
      welcome: 'Welcome, {name}!',
      greeting: '{greeting}, {name}. Today is {date}.'
    }
  }
})

// 单个参数
console.log(i18n.t('welcome', { name: '张三' }))
// 输出: 欢迎，张三！

// 多个参数
console.log(i18n.t('greeting', {
  greeting: '你好',
  name: '李四',
  date: '2025年10月27日'
}))
// 输出: 你好，李四。今天是2025年10月27日。
```

## 复数处理

```typescript
const i18n = createI18n({
  locale: 'zh-CN',
  messages: {
    'zh-CN': {
      appleCount: '没有苹果 | 一个苹果 | {count} 个苹果',
      itemCount: '{count} 件商品'
    },
    'en-US': {
      appleCount: 'no apples | one apple | {count} apples',
      itemCount: '{count} item | {count} items'
    }
  }
})

// 中文复数
console.log(i18n.t('appleCount', 0))  // 没有苹果
console.log(i18n.t('appleCount', 1))  // 一个苹果
console.log(i18n.t('appleCount', 5))  // 5 个苹果

// 切换到英文
i18n.setLocale('en-US')
console.log(i18n.t('appleCount', 0))  // no apples
console.log(i18n.t('appleCount', 1))  // one apple
console.log(i18n.t('appleCount', 5))  // 5 apples
```

## 嵌套翻译键

```typescript
const i18n = createI18n({
  locale: 'zh-CN',
  messages: {
    'zh-CN': {
      user: {
        profile: {
          title: '用户资料',
          name: '姓名',
          email: '邮箱'
        },
        settings: {
          title: '设置',
          language: '语言',
          theme: '主题'
        }
      }
    }
  }
})

// 使用点号访问嵌套键
console.log(i18n.t('user.profile.title'))  // 用户资料
console.log(i18n.t('user.profile.name'))   // 姓名
console.log(i18n.t('user.settings.title')) // 设置
```

## 检查翻译键是否存在

```typescript
const i18n = createI18n({
  locale: 'zh-CN',
  messages: {
    'zh-CN': {
      hello: '你好'
    }
  }
})

// 检查键是否存在
if (i18n.hasKey('hello')) {
  console.log(i18n.t('hello'))
}

if (!i18n.hasKey('unknown')) {
  console.log('翻译键不存在')
}
```

## 获取当前语言

```typescript
const i18n = createI18n({
  locale: 'zh-CN',
  messages: { /* ... */ }
})

// 获取当前语言
console.log(i18n.locale)  // zh-CN

// 获取所有可用语言
console.log(i18n.availableLocales)  // ['zh-CN', 'en-US']
```

## 动态添加翻译

```typescript
const i18n = createI18n({
  locale: 'zh-CN',
  messages: {
    'zh-CN': {
      hello: '你好'
    }
  }
})

// 添加新语言
i18n.setLocaleMessage('ja-JP', {
  hello: 'こんにちは'
})

// 切换到新语言
i18n.setLocale('ja-JP')
console.log(i18n.t('hello'))  // こんにちは

// 合并现有语言的翻译
i18n.mergeLocaleMessage('zh-CN', {
  goodbye: '再见'
})

i18n.setLocale('zh-CN')
console.log(i18n.t('goodbye'))  // 再见
```

## 回退语言

```typescript
const i18n = createI18n({
  locale: 'zh-CN',
  fallbackLocale: 'en-US',
  messages: {
    'zh-CN': {
      hello: '你好'
      // 缺少 'goodbye'
    },
    'en-US': {
      hello: 'Hello',
      goodbye: 'Goodbye'
    }
  }
})

console.log(i18n.t('hello'))    // 你好 (使用中文)
console.log(i18n.t('goodbye'))  // Goodbye (回退到英文)
```

## 多级回退

```typescript
const i18n = createI18n({
  locale: 'zh-TW',
  fallbackLocale: ['zh-CN', 'en-US'],  // 多级回退
  messages: {
    'zh-TW': {
      // 缺少翻译
    },
    'zh-CN': {
      hello: '你好',
      // 缺少 'goodbye'
    },
    'en-US': {
      hello: 'Hello',
      goodbye: 'Goodbye'
    }
  }
})

console.log(i18n.t('hello'))    // 你好 (回退到 zh-CN)
console.log(i18n.t('goodbye'))  // Goodbye (回退到 en-US)
```

## 监听语言变化

```typescript
const i18n = createI18n({
  locale: 'zh-CN',
  messages: { /* ... */ }
})

// 监听语言切换事件
const unsubscribe = i18n.on('locale-changed', (newLocale, oldLocale) => {
  console.log(`语言从 ${oldLocale} 切换到 ${newLocale}`)
  
  // 更新文档语言属性
  document.documentElement.lang = newLocale
  
  // 保存到 localStorage
  localStorage.setItem('locale', newLocale)
})

// 切换语言将触发事件
i18n.setLocale('en-US')

// 取消监听
unsubscribe()
```

## 自定义缺失处理

```typescript
const i18n = createI18n({
  locale: 'zh-CN',
  messages: {
    'zh-CN': {
      hello: '你好'
    }
  },
  missing: (locale, key, instance) => {
    // 记录缺失的翻译键
    console.warn(`Missing translation: ${key} in ${locale}`)
    
    // 返回默认值（键名）
    return key
    
    // 或者返回更友好的提示
    // return `[缺少翻译: ${key}]`
  }
})

// 访问不存在的键
console.log(i18n.t('unknown'))  // unknown (使用自定义处理)
```

## 完整示例

```typescript
import { createI18n } from '@ldesign/i18n'

// 创建 i18n 实例
const i18n = createI18n({
  locale: localStorage.getItem('locale') || 'zh-CN',
  fallbackLocale: 'en-US',
  messages: {
    'zh-CN': {
      common: {
        hello: '你好',
        welcome: '欢迎，{name}！',
        itemCount: '共 {count} 件商品'
      },
      user: {
        profile: '个人资料',
        settings: '设置'
      }
    },
    'en-US': {
      common: {
        hello: 'Hello',
        welcome: 'Welcome, {name}!',
        itemCount: '{count} item | {count} items'
      },
      user: {
        profile: 'Profile',
        settings: 'Settings'
      }
    }
  },
  missing: (locale, key) => {
    console.warn(`Missing: ${key} in ${locale}`)
    return key
  }
})

// 监听语言变化
i18n.on('locale-changed', (newLocale) => {
  localStorage.setItem('locale', newLocale)
  document.documentElement.lang = newLocale
})

// 使用示例
console.log(i18n.t('common.hello'))  // 你好
console.log(i18n.t('common.welcome', { name: '张三' }))  // 欢迎，张三！
console.log(i18n.t('common.itemCount', 5))  // 共 5 件商品

// 切换语言
i18n.setLocale('en-US')
console.log(i18n.t('common.hello'))  // Hello

// 导出供其他模块使用
export { i18n }
```

## 在浏览器中使用

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <title>i18n Example</title>
  <script src="https://unpkg.com/@ldesign/i18n"></script>
</head>
<body>
  <div id="app">
    <h1 id="title"></h1>
    <p id="welcome"></p>
    <button id="toggle">Switch Language</button>
  </div>

  <script>
    const { createI18n } = LDesignI18n

    const i18n = createI18n({
      locale: 'zh-CN',
      messages: {
        'zh-CN': {
          title: '国际化示例',
          welcome: '欢迎使用 @ldesign/i18n'
        },
        'en-US': {
          title: 'i18n Example',
          welcome: 'Welcome to @ldesign/i18n'
        }
      }
    })

    function updateUI() {
      document.getElementById('title').textContent = i18n.t('title')
      document.getElementById('welcome').textContent = i18n.t('welcome')
      document.documentElement.lang = i18n.locale
    }

    document.getElementById('toggle').addEventListener('click', () => {
      i18n.setLocale(i18n.locale === 'zh-CN' ? 'en-US' : 'zh-CN')
      updateUI()
    })

    updateUI()
  </script>
</body>
</html>
```

## 下一步

- 查看 [消息格式化示例](/examples/formatting)
- 了解 [Vue 集成示例](/examples/vue-basic)
- 探索 [高级特性](/examples/lazy-loading)

