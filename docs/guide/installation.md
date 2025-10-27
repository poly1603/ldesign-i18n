# 安装

## 包管理器安装

### pnpm (推荐)

```bash
pnpm add @ldesign/i18n
```

### npm

```bash
npm install @ldesign/i18n
```

### yarn

```bash
yarn add @ldesign/i18n
```

## CDN 引入

对于不使用构建工具的项目，可以通过 CDN 引入：

### unpkg

```html
<!-- 最新版本 -->
<script src="https://unpkg.com/@ldesign/i18n"></script>

<!-- 指定版本 -->
<script src="https://unpkg.com/@ldesign/i18n@3.0.1"></script>
```

### jsdelivr

```html
<!-- 最新版本 -->
<script src="https://cdn.jsdelivr.net/npm/@ldesign/i18n"></script>

<!-- 指定版本 -->
<script src="https://cdn.jsdelivr.net/npm/@ldesign/i18n@3.0.1"></script>
```

使用 CDN 引入后，全局会暴露 `LDesignI18n` 对象：

```html
<script src="https://unpkg.com/@ldesign/i18n"></script>
<script>
  const { createI18n } = LDesignI18n
  
  const i18n = createI18n({
    locale: 'zh-CN',
    messages: {
      'zh-CN': { hello: '你好' },
      'en-US': { hello: 'Hello' }
    }
  })
  
  console.log(i18n.t('hello')) // 你好
</script>
```

## 版本要求

### Node.js

- Node.js >= 16.0.0
- 推荐使用 LTS 版本

### TypeScript

- TypeScript >= 4.5.0
- 推荐使用最新稳定版

### 浏览器

- Chrome >= 90
- Firefox >= 88
- Safari >= 14
- Edge >= 90

## 可选依赖

### Vue 3

如果要使用 Vue 3 适配器：

```bash
pnpm add vue@^3.3.0
```

```typescript
import { createVueI18n } from '@ldesign/i18n/adapters/vue'
```

### React

如果要使用 React（开发中）：

```bash
pnpm add react@^18.0.0
```

## 开发工具

### ESLint 插件

为了更好的开发体验，推荐安装 ESLint 插件（开发中）：

```bash
pnpm add -D @ldesign/eslint-plugin-i18n
```

配置 ESLint：

```js
// eslint.config.js
export default {
  plugins: ['@ldesign/i18n'],
  rules: {
    '@ldesign/i18n/no-missing-keys': 'warn',
    '@ldesign/i18n/no-unused-keys': 'warn'
  }
}
```

### TypeScript 类型检查

如果使用 TypeScript，确保项目配置正确：

```json
// tsconfig.json
{
  "compilerOptions": {
    "moduleResolution": "bundler",
    "module": "ESNext",
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "types": ["@ldesign/i18n"],
    "strict": true
  }
}
```

## 项目结构

推荐的项目结构：

```
project/
├── src/
│   ├── i18n/
│   │   ├── index.ts          # i18n 配置
│   │   ├── locales/
│   │   │   ├── zh-CN.json    # 中文翻译
│   │   │   ├── en-US.json    # 英文翻译
│   │   │   └── ...
│   │   └── types.ts          # 类型定义
│   ├── main.ts
│   └── ...
└── package.json
```

### 创建 i18n 配置

```typescript
// src/i18n/index.ts
import { createI18n } from '@ldesign/i18n'
import zhCN from './locales/zh-CN.json'
import enUS from './locales/en-US.json'

export const i18n = createI18n({
  locale: localStorage.getItem('locale') || 'zh-CN',
  fallbackLocale: 'en-US',
  messages: {
    'zh-CN': zhCN,
    'en-US': enUS
  },
  cache: {
    enabled: true,
    strategy: 'adaptive'
  }
})
```

### 创建翻译文件

```json
// src/i18n/locales/zh-CN.json
{
  "common": {
    "hello": "你好",
    "welcome": "欢迎"
  },
  "nav": {
    "home": "首页",
    "about": "关于"
  }
}
```

```json
// src/i18n/locales/en-US.json
{
  "common": {
    "hello": "Hello",
    "welcome": "Welcome"
  },
  "nav": {
    "home": "Home",
    "about": "About"
  }
}
```

### 类型定义

```typescript
// src/i18n/types.ts
import type { InferMessageType } from '@ldesign/i18n/types'
import zhCN from './locales/zh-CN.json'

export type Messages = InferMessageType<typeof zhCN>
```

## 验证安装

创建一个简单的测试文件验证安装是否成功：

```typescript
// test-i18n.ts
import { createI18n } from '@ldesign/i18n'

const i18n = createI18n({
  locale: 'zh-CN',
  messages: {
    'zh-CN': {
      hello: '你好，世界！'
    }
  }
})

console.log(i18n.t('hello'))
// 输出: 你好，世界！

console.log('✅ @ldesign/i18n 安装成功！')
```

运行测试：

```bash
# 使用 ts-node
npx ts-node test-i18n.ts

# 或者使用 tsx
npx tsx test-i18n.ts
```

## 构建配置

### Vite

```typescript
// vite.config.ts
import { defineConfig } from 'vite'

export default defineConfig({
  optimizeDeps: {
    include: ['@ldesign/i18n']
  }
})
```

### Webpack

```javascript
// webpack.config.js
module.exports = {
  resolve: {
    alias: {
      '@ldesign/i18n': '@ldesign/i18n/es'
    }
  }
}
```

### Rollup

```javascript
// rollup.config.js
export default {
  external: ['@ldesign/i18n'],
  output: {
    globals: {
      '@ldesign/i18n': 'LDesignI18n'
    }
  }
}
```

## 故障排除

### 模块解析错误

如果遇到模块解析错误：

```
Cannot find module '@ldesign/i18n' or its corresponding type declarations.
```

解决方案：

1. 确认已正确安装包：
```bash
pnpm install
```

2. 检查 `tsconfig.json` 配置：
```json
{
  "compilerOptions": {
    "moduleResolution": "bundler"
  }
}
```

3. 尝试重启 TypeScript 服务器

### 类型定义缺失

如果类型提示不工作：

1. 确认 TypeScript 版本 >= 4.5.0
2. 检查 `tsconfig.json` 中的 `types` 配置
3. 清除缓存并重新安装：
```bash
pnpm clean
pnpm install
```

### Vue 集成问题

如果 Vue 适配器无法使用：

1. 确认 Vue 版本 >= 3.3.0
2. 确认正确导入：
```typescript
import { createVueI18n } from '@ldesign/i18n/adapters/vue'
```

3. 检查 Vite 配置中的 `optimizeDeps.include`

### 浏览器兼容性

如果需要支持旧版浏览器，安装 polyfills：

```bash
pnpm add core-js regenerator-runtime
```

在入口文件顶部引入：

```typescript
import 'core-js/stable'
import 'regenerator-runtime/runtime'
```

## 下一步

安装完成后，查看：

- [快速开始](/guide/getting-started) - 5 分钟上手
- [Vue 集成](/guide/vue-integration) - 在 Vue 3 中使用
- [配置选项](/api/core) - 详细的配置说明

