# React Basic Example

这是一个使用 @ldesign/i18n-react 的基础示例。

## 功能展示

- ✅ 基础翻译
- ✅ 参数插值
- ✅ 语言切换
- ✅ Trans 组件
- ✅ Context 使用

## 安装依赖

```bash
pnpm install
```

## 运行

```bash
pnpm dev
```

## 项目结构

```
react-basic/
├── src/
│   ├── App.tsx           # 主应用组件
│   ├── i18n.ts           # i18n 配置
│   ├── locales/          # 语言文件
│   │   ├── en.ts
│   │   └── zh.ts
│   └── main.tsx          # 入口文件
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## 使用示例

### 1. 配置 i18n

```typescript
// src/i18n.ts
import { createI18n } from '@ldesign/i18n-react'
import en from './locales/en'
import zh from './locales/zh'

export const i18n = createI18n({
  defaultLocale: 'en',
  supportedLocales: ['en', 'zh'],
  messages: { en, zh }
})
```

### 2. 使用 Provider

```tsx
// src/main.tsx
import { I18nProvider } from '@ldesign/i18n-react'
import { i18n } from './i18n'

root.render(
  <I18nProvider i18n={i18n}>
    <App />
  </I18nProvider>
)
```

### 3. 在组件中使用

```tsx
// src/App.tsx
import { useI18n, Trans } from '@ldesign/i18n-react'

function App() {
  const { t, locale, setLocale } = useI18n()
  
  return (
    <div>
      <h1>{t('welcome')}</h1>
      <p>{t('greeting', { name: 'World' })}</p>
      <Trans i18nKey="description" />
      
      <button onClick={() => setLocale(locale === 'en' ? 'zh' : 'en')}>
        Switch Language
      </button>
    </div>
  )
}
```

## 学习资源

- [API 文档](../../docs/packages/react/API.md)
- [完整示例](../../docs/packages/react/EXAMPLES.md)
- [最佳实践](../../docs/BEST_PRACTICES.md)
