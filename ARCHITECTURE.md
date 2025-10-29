# @ldesign/i18n 架构文档

## 项目结构

这是一个 monorepo 结构的多语言(i18n)管理系统,包含核心库和多个框架适配包。

```
packages/i18n/
├── packages/                    # 所有子包
│   ├── core/                   # 核心库(框架无关)
│   ├── alpinejs/               # Alpine.js 适配
│   ├── angular/                # Angular 适配
│   ├── astro/                  # Astro 适配
│   ├── lit/                    # Lit 适配
│   ├── nextjs/                 # Next.js 适配
│   ├── nuxtjs/                 # Nuxt.js 适配
│   ├── preact/                 # Preact 适配
│   ├── qwik/                   # Qwik 适配
│   ├── react/                  # React 适配
│   ├── remix/                  # Remix 适配
│   ├── solid/                  # Solid 适配
│   ├── svelte/                 # Svelte 适配
│   ├── sveltekit/              # SvelteKit 适配
│   └── vue/                    # Vue 3 适配
├── examples/                    # 示例项目
├── scripts/                     # 构建和管理脚本
└── docs/                        # 文档
```

## 核心架构

### 1. 核心包 (@ldesign/i18n-core)

框架无关的 i18n 核心功能:

- **I18n 引擎**: 翻译、格式化、插值
- **缓存系统**: LRU、多层缓存、自适应缓存
- **性能监控**: 性能指标收集和分析
- **插件系统**: 可扩展的插件架构
- **类型安全**: 完整的 TypeScript 类型定义

#### 主要模块

- `core/i18n-optimized.ts` - 优化的 I18n 主类
- `core/cache/` - 缓存系统
- `core/interpolation.ts` - 插值引擎
- `core/pluralization.ts` - 复数规则
- `core/performance-monitor.ts` - 性能监控
- `plugins/` - 插件系统

### 2. 框架适配包

每个框架适配包提供:

- 框架特定的集成方式
- Hooks/Composables/Directives
- 组件封装
- SSR 支持(如适用)
- 类型定义

#### React 生态

- `@ldesign/i18n-react` - React hooks 和组件
- `@ldesign/i18n-nextjs` - Next.js App Router/Pages Router 支持
- `@ldesign/i18n-remix` - Remix loader/action 支持

#### Vue 生态

- `@ldesign/i18n-vue` - Vue 3 Composition API
- `@ldesign/i18n-nuxtjs` - Nuxt 3 auto-imports 和 SSR

#### 其他框架

- `@ldesign/i18n-alpinejs` - Alpine.js 指令
- `@ldesign/i18n-angular` - Angular services 和 pipes
- `@ldesign/i18n-astro` - Astro 组件和中间件
- `@ldesign/i18n-lit` - Lit 指令和控制器
- `@ldesign/i18n-preact` - Preact hooks
- `@ldesign/i18n-qwik` - Qwik 可恢复性支持
- `@ldesign/i18n-solid` - Solid signals 集成
- `@ldesign/i18n-svelte` - Svelte stores
- `@ldesign/i18n-sveltekit` - SvelteKit load 函数支持

## 开发流程

### 安装依赖

```bash
# 在根目录安装所有依赖
pnpm install

# 或单独安装某个包
pnpm --filter @ldesign/i18n-core install
```

### 构建

```bash
# 构建所有包
pnpm run build:all

# 构建单个包
cd packages/core
pnpm run build
```

### Lint 检查

```bash
# Lint 所有包
pnpm run lint:all

# 自动修复
pnpm run lint:all:fix

# Lint 单个包
cd packages/core
pnpm run lint
```

### 类型检查

```bash
# 检查单个包
cd packages/core
pnpm run type-check
```

### 测试

```bash
# 运行单个包的测试
cd packages/core
pnpm run test

# 运行覆盖率测试
pnpm run test:coverage
```

## 构建产物

每个包都会生成以下产物:

- `es/` - ESM 格式
- `lib/` - CommonJS 格式
- `dist/` - UMD 格式(仅 core 包)

## 配置说明

### ESLint

所有包使用 `@antfu/eslint-config`,配置文件为 `eslint.config.js`。

### TypeScript

每个包都有自己的 `tsconfig.json`,继承自根配置。

### Builder

使用 `@ldesign/builder` 进行打包,支持:
- ESM
- CommonJS
- UMD
- TypeScript 类型生成

## 性能优化

1. **Tree-shaking**: 所有包支持 tree-shaking
2. **缓存策略**: 多层缓存系统
3. **懒加载**: 按需加载功能模块
4. **内存优化**: WeakMap/WeakSet 避免内存泄漏
5. **性能监控**: 内置性能指标收集

## 测试策略

### 单元测试

- 使用 Vitest
- 覆盖率要求: 80%+
- 测试文件: `**/__tests__/**/*.test.ts`

### E2E 测试

- 使用 Playwright
- 测试真实的框架集成场景

### 性能测试

- Benchmark 测试
- 内存泄漏检测
- 性能回归测试

## 发布流程

1. 确保所有测试通过
2. 运行 `pnpm run lint:all`
3. 运行 `pnpm run build:all`
4. 更新版本号
5. 提交并打标签
6. 发布到 npm

## 贡献指南

1. Fork 项目
2. 创建功能分支
3. 编写代码和测试
4. 确保 lint 和测试通过
5. 提交 PR

## License

MIT © LDesign Team
