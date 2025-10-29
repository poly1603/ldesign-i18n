# @ldesign/i18n 快速开始

> 5分钟上手 @ldesign/i18n 多语言管理系统

## 📦 项目结构

```
packages/i18n/
├── packages/          # 16个子包
│   ├── core/         # ✅ 核心库(框架无关)
│   ├── react/        # ✅ React hooks 和组件
│   ├── vue/          # ✅ Vue composables 和组件
│   ├── nextjs/       # ✅ Next.js 服务端+中间件
│   └── ...           # 其他12个框架
├── scripts/          # 自动化脚本
└── docs/             # 文档
```

## 🚀 快速命令

### 安装和构建

```bash
# 安装依赖
pnpm install

# 构建所有包
pnpm run build:all

# 构建单个包
pnpm --filter @ldesign/i18n-core run build
```

### 代码质量

```bash
# Lint 所有包
pnpm run lint:all

# 自动修复 lint 问题
pnpm run lint:all:fix

# 类型检查
pnpm --filter @ldesign/i18n-core run type-check
```

### 测试

```bash
# 运行测试
pnpm --filter @ldesign/i18n-core run test

# 监听模式
pnpm --filter @ldesign/i18n-core run test

# 覆盖率
pnpm --filter @ldesign/i18n-core run test:coverage
```

## 📁 重要文件

### 文档
- `ARCHITECTURE.md` - 架构设计文档
- `PROJECT_STATUS.md` - 项目当前状态
- `COMPLETION_SUMMARY.md` - 完成情况总结
- `FINAL_REPORT.md` - 详细实施报告
- `QUICK_START.md` - 本文档

### 脚本
- `scripts/create-framework-packages.ts` - 批量创建框架包
- `scripts/build-all-packages.ts` - 批量构建
- `scripts/lint-all-packages.ts` - 批量lint检查
- `scripts/fix-eslint-configs.ts` - 修复ESLint配置

### 配置
- `tsconfig.json` - TypeScript配置(已修复)
- `vitest.base.config.ts` - 测试配置模板
- 各包的 `eslint.config.js` - 已统一配置

## 🎯 当前状态

### ✅ 已完成 (100%)
- 架构设计和monorepo结构
- 16个包的配置系统
- ESLint、TypeScript、Vitest配置
- 自动化脚本工具
- 完整文档系统

### ⏳ 进行中 (48%)
- 框架适配包实现
  - React ✅
  - Vue ✅  
  - Next.js 60%
  - 其他框架 10-30%

### ❌ 待开始
- 完整的单元测试
- E2E测试
- 性能测试
- 示例项目

## 💡 使用示例

### React

```tsx
import { createI18n, I18nProvider, useTranslation } from '@ldesign/i18n-react'

const i18n = createI18n({
  locale: 'en',
  fallbackLocale: 'en',
  messages: {
    en: { greeting: 'Hello' },
    zh: { greeting: '你好' }
  }
})

function App() {
  return (
    <I18nProvider i18n={i18n}>
      <MyComponent />
    </I18nProvider>
  )
}

function MyComponent() {
  const { t, setLocale } = useTranslation()
  return <div>{t('greeting')}</div>
}
```

### Vue

```vue
<script setup>
import { useI18n } from '@ldesign/i18n-vue'
const { t, locale } = useI18n()
</script>

<template>
  <div>{{ t('greeting') }}</div>
</template>
```

### Next.js

```tsx
// app/[locale]/layout.tsx
import { getServerI18n, I18nProvider } from '@ldesign/i18n-nextjs'

export default async function Layout({ params }) {
  const i18n = await getServerI18n({
    locale: params.locale,
    messages: { /* ... */ }
  })
  
  return <I18nProvider i18n={i18n}>{children}</I18nProvider>
}

// middleware.ts
import { createI18nMiddleware } from '@ldesign/i18n-nextjs'

export const middleware = createI18nMiddleware({
  locales: ['en', 'zh'],
  defaultLocale: 'en'
})
```

## 🔧 常见任务

### 添加新的框架支持

```bash
# 使用脚本创建(已包含15个框架)
pnpm exec tsx scripts/create-framework-packages.ts
```

### 修复所有ESLint配置

```bash
# 批量修复配置问题
pnpm exec tsx scripts/fix-eslint-configs.ts
```

### 添加新测试

```typescript
// packages/core/src/__tests__/your-test.test.ts
import { describe, expect, it } from 'vitest'

describe('YourFeature', () => {
  it('should work', () => {
    expect(true).toBe(true)
  })
})
```

## ⚠️ 已知问题

1. **TypeScript类型警告** - 核心代码有20+未使用变量警告
2. **依赖路径警告** - builder/launcher工具路径问题(不影响功能)
3. **Peer dependency冲突** - 多个包版本冲突(可接受)

## 📋 下一步

### 高优先级
1. 修复核心代码类型警告
2. 完成Next.js、Remix、Nuxt实现
3. 编写核心包完整测试

### 中优先级
4. 完成其他框架适配包
5. 创建示例项目
6. 性能基准测试

### 低优先级
7. API文档站点
8. CI/CD流程
9. 发布准备

## 🔗 相关资源

- 核心包: `packages/core/`
- React包: `packages/react/`
- Vue包: `packages/vue/`
- Next.js包: `packages/nextjs/`

## 📞 帮助

查看详细文档:
- 架构: `ARCHITECTURE.md`
- 状态: `PROJECT_STATUS.md`
- 报告: `FINAL_REPORT.md`

---

**更新时间**: 2025-10-29
**版本**: v1.0.0
