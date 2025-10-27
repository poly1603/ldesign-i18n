# @ldesign/i18n 示例

本目录包含了 @ldesign/i18n 的各种使用示例。

## 运行示例

### 运行单个示例

```bash
# 基础用法
pnpm examples

# 或指定特定示例
pnpm tsx examples/1-basic-usage.ts
pnpm tsx examples/2-interpolation-plural.ts
pnpm tsx examples/4-performance-cache.ts
pnpm tsx examples/5-lazy-loading.ts
pnpm tsx examples/6-plugins.ts
```

### 运行所有示例

```bash
pnpm examples:all
```

## 示例列表

### 1. 基础用法 (`1-basic-usage.ts`)

演示如何创建和使用基本的 i18n 实例：
- 创建 i18n 实例
- 简单翻译
- 带参数的翻译
- 切换语言
- 检查键是否存在

### 2. 插值和复数 (`2-interpolation-plural.ts`)

演示参数插值和复数处理：
- 基础插值
- 多参数插值
- 复数形式处理
- 中英文复数对比
- 复杂场景示例

### 3. Vue 基础 (`3-vue-basic.vue`)

Vue 3 集成示例：
- 使用 useI18n composable
- v-t 指令
- I18nTranslate 组件
- LocaleSwitcher 组件
- 响应式语言切换

### 4. 性能优化和缓存 (`4-performance-cache.ts`)

性能优化示例：
- 启用缓存
- 不同缓存策略对比
- 性能监控和报告
- 缓存效果测试

### 5. 懒加载 (`5-lazy-loading.ts`)

动态加载语言包：
- 按需加载语言
- 语言包管理
- 批量预加载
- 加载状态处理

### 6. 插件系统 (`6-plugins.ts`)

插件开发和使用：
- 日志插件
- 本地存储插件
- 统计插件
- 验证插件
- 热更新插件

### 7. 完整示例 (`complete-example.ts`)

一个综合性的完整示例，展示了：
- 项目结构
- 最佳实践
- 真实场景应用

## Vue 示例

Vue 相关的示例需要在 Vue 项目中运行。你可以：

1. 创建一个新的 Vue 项目
2. 安装 @ldesign/i18n
3. 复制示例代码到你的项目中

或者查看 [Vue 集成文档](../docs/guide/vue-integration.md) 了解更多。

## 在线体验

访问 [在线演示](https://ldesign.dev/i18n/examples) 在浏览器中尝试这些示例。

## 相关文档

- [快速开始](../docs/guide/getting-started.md)
- [API 参考](../docs/api/core.md)
- [Vue 集成](../docs/guide/vue-integration.md)
- [性能优化](../docs/guide/performance.md)

## 贡献示例

欢迎贡献更多示例！请确保：

1. 代码清晰且有注释
2. 包含 TypeScript 类型
3. 添加到此 README
4. 更新相关文档

## 问题反馈

如果示例有问题或者你想看到更多示例，请：

- 提交 [Issue](https://github.com/your-org/ldesign/issues)
- 加入 [讨论](https://github.com/your-org/ldesign/discussions)

