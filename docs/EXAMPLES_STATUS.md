# 示例项目状态报告

**生成时间**: 2025-10-30  
**操作**: 批量创建示例项目

## 📦 已创建的示例项目

已为以下 6 个框架包创建了 `example` 目录和基础配置:

| 框架 | 目录 | 状态 | 配置文件 |
|-----|------|------|---------|
| React | `packages/react/example` | ✅ | 完整 |
| Vue | `packages/vue/example` | ✅ | 完整 |
| Solid | `packages/solid/example` | ✅ | 完整 |
| Svelte | `packages/svelte/example` | ✅ | 完整 |
| Preact | `packages/preact/example` | ✅ | 完整 |
| Lit | `packages/lit/example` | ✅ | 完整 |

## 📂 每个示例项目包含

### 配置文件

- ✅ `package.json` - 项目配置和依赖
- ✅ `vite.config.ts` - Vite 构建配置
- ✅ `tsconfig.json` - TypeScript 配置
- ✅ `index.html` - HTML 入口
- ✅ `README.md` - 使用说明

### 翻译文件

- ✅ `src/locales/en.json` - 英文翻译
- ✅ `src/locales/zh.json` - 中文翻译

### 翻译内容

```json
{
  "welcome": "Welcome to @ldesign/i18n",
  "description": "A powerful internationalization solution",
  "switchLanguage": "Switch to Chinese",
  "counter": "Count: {{count}}",
  "increment": "Increment",
  "decrement": "Decrement"
}
```

## ⏳ 待完成工作

每个示例项目还需要以下源代码文件:

### 1. i18n 配置文件 (`src/i18n.ts`)

用于初始化 i18n 实例:

```typescript
import { createI18n } from '@ldesign/i18n-react' // 替换为对应框架
import en from './locales/en.json'
import zh from './locales/zh.json'

export const i18n = createI18n({
  locale: 'en',
  fallbackLocale: 'en',
  messages: { en, zh },
})
```

### 2. App 组件

演示 i18n 功能的主组件:
- 显示翻译文本
- 参数插值示例
- 语言切换功能
- 计数器示例

### 3. main 入口文件

应用入口,挂载 App:
- React: `main.tsx` with `I18nProvider`
- Vue: `main.ts` with `i18n` plugin
- Solid: `main.tsx` with `I18nProvider`
- Svelte: `main.js` with store
- Preact: `main.tsx` with `I18nProvider`
- Lit: `main.ts` with custom element

## 🎨 推荐的示例功能

每个示例应包含以下功能演示:

1. **基础翻译** - `t('welcome')`
2. **参数插值** - `t('counter', { count: 5 })`
3. **嵌套键** - `t('nested.key')`
4. **语言切换** - 按钮切换 en/zh
5. **响应式更新** - 切换语言后自动更新UI

## 🚀 使用方式

### 安装依赖

在每个 example 目录下:

```bash
cd packages/{framework}/example
pnpm install
```

### 运行开发服务器

```bash
pnpm dev
```

访问 http://localhost:3000

### 构建生产版本

```bash
pnpm build
```

## 📋 依赖说明

### 通用依赖

所有示例都依赖:
- `@ldesign/i18n-core` - 核心包
- `@ldesign/i18n-{framework}` - 对应框架适配器
- `vite` - 构建工具
- `typescript` - 类型支持

### 框架特定依赖

| 框架 | 依赖 | Vite 插件 |
|-----|------|-----------|
| React | react, react-dom | @vitejs/plugin-react |
| Vue | vue | @vitejs/plugin-vue |
| Solid | solid-js | vite-plugin-solid |
| Svelte | svelte | @sveltejs/vite-plugin-svelte |
| Preact | preact | @preact/preset-vite |
| Lit | lit | - (无需插件) |

## 🎯 下一步行动

### 立即可做

1. 为 React 示例添加源代码文件 (优先)
2. 测试 React 示例能否正常运行
3. 复制 React 示例模式到其他框架

### 批量操作

创建脚本生成所有框架的源代码文件:
- `scripts/create-example-sources.mjs`
- 根据框架特性生成对应的组件代码

### 验证清单

对每个示例执行:
- [ ] `pnpm install` 无错误
- [ ] `pnpm dev` 能启动
- [ ] 页面能正常显示
- [ ] 翻译功能正常
- [ ] 语言切换正常
- [ ] `pnpm build` 无错误

## 📊 完成度

### 基础配置: 100% ✅

所有框架的配置文件已创建完成

### 源代码: 0% ⏳

还需要为每个框架创建:
- App 组件
- main 入口
- i18n 配置

### 预计工作量

- React: 10分钟 (可复用 examples/react-basic)
- Vue: 10分钟
- Solid: 15分钟
- Svelte: 15分钟
- Preact: 10分钟
- Lit: 15分钟

**总计**: 约 1-2 小时

## 🔗 相关资源

- 已有的完整示例: `examples/react-basic/`
- Vite 文档: https://vitejs.dev/
- 各框架官方文档
- @ldesign/i18n 核心文档: `docs/API_REFERENCE.md`

---

**创建时间**: 2025-10-30 10:00  
**创建工具**: `scripts/create-examples.mjs`  
**状态**: 基础配置完成,源代码待添加
