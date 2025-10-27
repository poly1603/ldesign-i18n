# @ldesign/i18n 文档

欢迎查看 @ldesign/i18n 的完整文档！

## 快速导航

### 🚀 入门

- [简介](./guide/introduction.md) - 了解 @ldesign/i18n
- [快速开始](./guide/getting-started.md) - 5 分钟上手
- [安装](./guide/installation.md) - 详细安装指南

### 📚 指南

#### 基础
- [国际化引擎](./guide/i18n-engine.md) - 核心引擎介绍
- [消息格式化](./guide/message-formatting.md) - 格式化规则
- [插值与复数](./guide/interpolation.md) - 参数插值和复数处理
- [缓存机制](./guide/caching.md) - 性能缓存

#### 框架集成
- [Vue 3 集成](./guide/vue-integration.md) - 在 Vue 中使用
- [React 集成](./guide/react-integration.md) - 在 React 中使用
- [原生 JavaScript](./guide/vanilla-js.md) - 无框架使用

#### 高级特性
- [性能优化](./guide/performance.md) - 优化技巧
- [插件系统](./guide/plugins.md) - 插件开发
- [懒加载](./guide/lazy-loading.md) - 按需加载
- [实时同步](./guide/realtime-sync.md) - 实时更新
- [RTL 支持](./guide/rtl-support.md) - 从右到左语言

#### 最佳实践
- [项目结构](./guide/project-structure.md) - 推荐结构
- [类型安全](./guide/type-safety.md) - TypeScript
- [性能监控](./guide/monitoring.md) - 监控和分析
- [测试](./guide/testing.md) - 测试策略

### 📖 API 参考

#### 核心 API
- [核心 API](./api/core.md) - 主要 API
- [I18nEngine](./api/i18n-engine.md) - 引擎 API
- [格式化器](./api/formatters.md) - 格式化 API
- [缓存](./api/cache.md) - 缓存 API
- [插件](./api/plugins.md) - 插件 API

#### Vue 适配器
- [Vue 插件](./api/vue-plugin.md) - 插件 API
- [Composables](./api/vue-composables.md) - 组合式 API
- [组件](./api/vue-components.md) - Vue 组件
- [指令](./api/vue-directives.md) - Vue 指令

#### 工具
- [辅助函数](./api/helpers.md) - 工具函数
- [类型定义](./api/types.md) - TypeScript 类型

### 💡 示例

#### 基础示例
- [基本用法](./examples/basic.md) - 入门示例
- [消息格式化](./examples/formatting.md) - 格式化示例
- [复数处理](./examples/pluralization.md) - 复数示例

#### Vue 示例
- [Vue 基础](./examples/vue-basic.md) - Vue 基础
- [Composition API](./examples/vue-composition.md) - 组合式 API
- [组件示例](./examples/vue-components.md) - 组件使用
- [指令示例](./examples/vue-directives.md) - 指令使用

#### React 示例
- [React 基础](./examples/react-basic.md) - React 基础
- [Hooks 示例](./examples/react-hooks.md) - Hooks
- [Context 示例](./examples/react-context.md) - Context

#### 高级示例
- [懒加载](./examples/lazy-loading.md) - 懒加载
- [实时同步](./examples/realtime-sync.md) - 实时同步
- [版本控制](./examples/version-control.md) - 版本管理
- [性能优化](./examples/performance.md) - 性能优化

## 本地运行文档

### 安装依赖

```bash
pnpm install
```

### 开发模式

```bash
pnpm docs:dev
```

访问 http://localhost:5173 查看文档。

### 构建文档

```bash
pnpm docs:build
```

### 预览构建结果

```bash
pnpm docs:preview
```

## 文档结构

```
docs/
├── .vitepress/
│   └── config.ts          # VitePress 配置
├── guide/                 # 指南
│   ├── introduction.md
│   ├── getting-started.md
│   ├── installation.md
│   └── ...
├── api/                   # API 参考
│   ├── core.md
│   ├── i18n-engine.md
│   └── ...
├── examples/              # 示例
│   ├── basic.md
│   ├── vue-basic.md
│   └── ...
├── public/                # 静态资源
└── index.md              # 首页
```

## 贡献文档

我们欢迎文档贡献！请遵循以下指南：

1. **清晰准确** - 确保内容准确且易于理解
2. **代码示例** - 提供可运行的代码示例
3. **中文优先** - 主要文档使用中文
4. **格式规范** - 遵循 Markdown 格式规范

### 文档编写规范

- 使用中文标点符号
- 代码块指定语言
- 添加适当的标题层级
- 链接使用相对路径
- 图片放在 `public/` 目录

## 反馈

如果文档有问题或建议，请：

- 提交 [Issue](https://github.com/your-org/ldesign/issues)
- 提交 [Pull Request](https://github.com/your-org/ldesign/pulls)
- 加入 [讨论](https://github.com/your-org/ldesign/discussions)

## 许可证

文档遵循 [MIT License](../LICENSE)。

