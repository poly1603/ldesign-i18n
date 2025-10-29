# @ldesign/i18n - Monorepo

> 🎉 **v4.0 重大更新**: 重构为 monorepo 架构，提供更灵活的模块化支持！

企业级国际化解决方案 - 功能强大、类型安全、高性能的多语言库。

## 📦 包列表

本项目现在是一个 monorepo，包含三个独立的 npm 包：

### [@ldesign/i18n-core](./packages/core)

[![npm](https://img.shields.io/npm/v/@ldesign/i18n-core)](https://www.npmjs.com/package/@ldesign/i18n-core)

框架无关的核心库 - 可在任何 JavaScript 框架中使用

```bash
pnpm add @ldesign/i18n-core
```

### [@ldesign/i18n-vue](./packages/vue)

[![npm](https://img.shields.io/npm/v/@ldesign/i18n-vue)](https://www.npmjs.com/package/@ldesign/i18n-vue)

Vue 3 深度集成 - 提供组合式 API、组件和指令

```bash
pnpm add @ldesign/i18n-vue @ldesign/i18n-core
```

### [@ldesign/i18n-react](./packages/react)

[![npm](https://img.shields.io/npm/v/@ldesign/i18n-react)](https://www.npmjs.com/package/@ldesign/i18n-react)

React 深度集成 - 提供 Hooks、组件和 HOC

```bash
pnpm add @ldesign/i18n-react @ldesign/i18n-core
```

## 🚀 快速开始

### Vue 3 项目

```vue
<script setup>
import { useI18n } from '@ldesign/i18n-vue'

const { t, locale } = useI18n()
</script>

<template>
  <div>
    <h1>{{ t('hello') }}</h1>
    <select v-model="locale">
      <option value="zh-CN">中文</option>
      <option value="en">English</option>
    </select>
  </div>
</template>
```

### React 项目

```tsx
import { I18nProvider, useI18n } from '@ldesign/i18n-react'

function App() {
  return (
    <I18nProvider config={{ locale: 'zh-CN', messages: {...} }}>
      <MyComponent />
    </I18nProvider>
  )
}

function MyComponent() {
  const { t, locale, setLocale } = useI18n()
  
  return (
    <div>
      <h1>{t('hello')}</h1>
      <select value={locale} onChange={e => setLocale(e.target.value)}>
        <option value="zh-CN">中文</option>
        <option value="en">English</option>
      </select>
    </div>
  )
}
```

### 纯 JavaScript / 其他框架

```typescript
import { createI18n } from '@ldesign/i18n-core'

const i18n = createI18n({
  locale: 'zh-CN',
  messages: {
    'zh-CN': { hello: '你好' },
    'en': { hello: 'Hello' }
  }
})

console.log(i18n.t('hello')) // "你好"
```

## ✨ 核心特性

- ⚡ **极致性能** - 哈希缓存键（+70%速度）、模板预编译（+40-60%插值速度）
- 💚 **内存优化** - 35%内存减少、60%更少GC压力
- 🌍 **完整RTL** - 15种RTL语言支持
- 🔒 **类型安全** - 完整的 TypeScript 支持
- 🎨 **管道格式化** - 15+内置管道、链式转换
- 🛠️ **开发工具** - 翻译覆盖率报告、热重载、性能监控

## 📚 文档

- [Monorepo 架构指南](./MONOREPO_GUIDE.md)
- [实施完成报告](./MONOREPO_IMPLEMENTATION_COMPLETE.md)
- [Core 包文档](./packages/core/README.md)
- [Vue 包文档](./packages/vue/README.md)
- [React 包文档](./packages/react/README.md)

## 🔧 开发

### 安装依赖

```bash
pnpm install
```

### 构建所有包

```bash
pnpm -r run build
```

### 开发模式

```bash
pnpm -r run dev
```

### 运行测试

```bash
pnpm -r run test
```

## 🌟 为什么选择 Monorepo？

### 1. **按需安装**
只安装你需要的包，减少不必要的依赖

### 2. **更小的包体积**
- Vue 项目不会引入 React 代码
- React 项目不会引入 Vue 代码
- 核心功能完全独立

### 3. **独立版本管理**
每个包可以独立发布和更新

### 4. **易于扩展**
未来可以轻松添加其他框架支持（Svelte、Solid、Angular 等）

## 📦 包依赖关系

```
@ldesign/i18n-core (无依赖)
    ├── @ldesign/i18n-vue (依赖 core + vue)
    └── @ldesign/i18n-react (依赖 core + react)
```

## 🔄 迁移指南

从旧版本迁移非常简单：

**之前**:
```typescript
import { I18n } from '@ldesign/i18n'
import { useI18n } from '@ldesign/i18n/vue'
```

**现在（推荐）**:
```typescript
// 核心功能
import { I18n } from '@ldesign/i18n-core'

// Vue
import { useI18n } from '@ldesign/i18n-vue'

// React
import { useI18n } from '@ldesign/i18n-react'
```

## 🤝 贡献

欢迎贡献！请查看各个包的文档了解更多信息。

## 📄 许可证

[MIT](./LICENSE) © 2024 LDesign Team

---

## 📂 目录结构

```
packages/i18n/
├── packages/           # 子包目录
│   ├── core/          # @ldesign/i18n-core
│   ├── vue/           # @ldesign/i18n-vue
│   └── react/         # @ldesign/i18n-react
├── pnpm-workspace.yaml
├── package.json
└── README.md (this file)
```

更多详细信息，请参阅 [Monorepo 架构指南](./MONOREPO_GUIDE.md)。

