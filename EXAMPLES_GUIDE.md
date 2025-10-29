# @ldesign/i18n 示例项目指南

本文档说明了所有包的 examples 演示项目。

## 📦 可用示例

每个包都有一个独立的、基于 @ldesign/launcher 的演示项目，用于测试核心功能。

### 1. Core 包示例

**路径**: `packages/core/examples`  
**端口**: 5000  
**技术**: TypeScript + Launcher (纯 JS，无框架)

```bash
cd packages/core/examples
pnpm install
pnpm dev
```

访问: http://localhost:5000

**功能演示**:
- ✅ 基础翻译 (t 函数)
- ✅ 参数插值
- ✅ 复数化
- ✅ 日期和数字格式化
- ✅ 语言切换
- ✅ 高级功能 (键检查、原始消息、动态合并)

---

### 2. Vue 包示例

**路径**: `packages/vue/examples`  
**端口**: 5001  
**技术**: Vue 3 + Launcher

```bash
cd packages/vue/examples
pnpm install
pnpm dev
```

访问: http://localhost:5001

**功能演示**:
- ✅ Composition API (useI18n)
- ✅ Trans 组件
- ✅ v-t 指令
- ✅ 复数化、格式化
- ✅ 语言切换
- ✅ 响应式状态

---

### 3. React 包示例

**路径**: `packages/react/examples`  
**端口**: 5002  
**技术**: React 18 + Launcher

```bash
cd packages/react/examples
pnpm install
pnpm dev
```

访问: http://localhost:5002

**功能演示**:
- ✅ React Hooks (useI18n)
- ✅ Trans 组件
- ✅ 复数化、格式化
- ✅ 语言切换
- ✅ 响应式状态

---

### 4. Svelte 包示例

**路径**: `packages/svelte/examples`  
**端口**: 5003  
**技术**: Svelte 4 + Launcher

```bash
cd packages/svelte/examples
pnpm install
pnpm dev
```

访问: http://localhost:5003

**功能演示**:
- ✅ Svelte Stores
- ✅ Trans 组件
- ✅ Actions (use:t, use:tPlural)
- ✅ 复数化、格式化
- ✅ 语言切换
- ✅ 响应式状态

---

### 5. Solid 包示例

**路径**: `packages/solid/examples`  
**端口**: 5004  
**技术**: Solid.js 1.x + Launcher

```bash
cd packages/solid/examples
pnpm install
pnpm dev
```

访问: http://localhost:5004

**功能演示**:
- ✅ Solid Signals
- ✅ Primitives (useI18n)
- ✅ Trans 组件
- ✅ Directives (use:t, use:tPlural)
- ✅ 复数化、格式化
- ✅ 语言切换
- ✅ 细粒度响应式

---

### 6. Angular 包示例

**路径**: `packages/angular/examples`  
**端口**: 5005  
**技术**: Angular 18 + Launcher

```bash
cd packages/angular/examples
pnpm install
pnpm dev
```

访问: http://localhost:5005

**功能演示**:
- ✅ Angular Services (I18nService)
- ✅ Pipes (translate, i18nDate, i18nNumber, plural)
- ✅ Directives (i18nTranslate)
- ✅ RxJS Observables
- ✅ 复数化、格式化
- ✅ 语言切换
- ✅ 依赖注入

---

## 🚀 快速启动所有示例

### 从包根目录启动

```bash
# Core
pnpm --filter @ldesign/i18n-core-example dev

# Vue
pnpm --filter @ldesign/i18n-vue-example dev

# React
pnpm --filter @ldesign/i18n-react-example dev

# Angular
pnpm --filter @ldesign/i18n-angular-example dev

# Svelte
pnpm --filter @ldesign/i18n-svelte-example dev

# Solid
pnpm --filter @ldesign/i18n-solid-example dev
```

### 同时启动多个示例

```bash
# 启动所有示例
pnpm -r --parallel --filter "*-example" dev
```

## 📊 示例对比

| 特性 | Core | Vue | React | Angular | Svelte | Solid |
|------|------|-----|-------|---------|--------|-------|
| **端口** | 5000 | 5001 | 5002 | 5005 | 5003 | 5004 |
| **基础翻译** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **参数插值** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **复数化** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **格式化** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **语言切换** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **组件** | - | ✅ | ✅ | ✅ | ✅ | ✅ |
| **指令/Actions/Pipes** | - | ✅ | - | ✅ | ✅ | ✅ |
| **响应式** | - | ✅ | ✅ | ✅ (RxJS) | ✅ | ✅ |

## 🎯 测试建议

### 1. 功能测试
- 打开每个示例
- 测试所有功能按钮
- 切换语言查看效果
- 检查输入响应

### 2. 性能测试
- 使用浏览器 DevTools
- 查看内存占用
- 检查渲染性能
- 测试缓存效果

### 3. 集成测试
- 确保所有框架功能对等
- 验证 API 一致性
- 测试错误处理

## 📝 文件结构

每个示例项目的标准结构：

```
examples/
├── package.json          # 项目配置
├── index.html            # HTML 入口
├── .ldesign/
│   └── launcher.config.ts  # Launcher 配置
├── tsconfig.json         # TypeScript 配置
├── src/
│   ├── main.ts(x)       # 应用入口
│   ├── App.(vue|tsx|svelte)  # 主应用组件
│   └── index.css        # 样式文件（可选）
└── README.md            # 说明文档
```

## 🎨 UI 特性

所有示例都具有：
- 现代化渐变背景
- 清晰的功能分区
- 交互式演示
- 语言切换器
- 响应式布局

## 🔧 开发建议

### 添加新功能

1. 在 core 包中实现功能
2. 更新所有框架适配器
3. 在每个 example 中添加演示
4. 确保功能一致性

### 调试

```bash
# 单独启动某个示例
cd packages/[包名]/examples
pnpm dev

# 查看构建产物
pnpm build
pnpm preview
```

## 📚 相关文档

- [主 README](./README.md) - 主包文档
- [Core README](./packages/core/README.md) - 核心库文档
- [Vue README](./packages/vue/README.md) - Vue 集成文档
- [React README](./packages/react/README.md) - React 集成文档
- [Angular README](./packages/angular/README.md) - Angular 集成文档
- [Svelte README](./packages/svelte/README.md) - Svelte 集成文档
- [Solid README](./packages/solid/README.md) - Solid 集成文档

## 🎉 总结

所有示例项目：
- ✅ 基于 @ldesign/launcher，统一管理
- ✅ 完整的 TypeScript 支持
- ✅ 展示核心功能
- ✅ 功能对等一致
- ✅ 易于理解和修改

使用这些示例可以快速了解和测试 @ldesign/i18n 的各种功能！

---

**维护**: LDesign Team  
**更新**: 2025-01

