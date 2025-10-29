# @ldesign/i18n 快速参考

## 📦 包结构

```
packages/i18n/
├── packages/
│   ├── core/              # 核心库（框架无关）
│   │   ├── .ldesign/      # 构建配置
│   │   ├── examples/      # 示例项目
│   │   └── src/           # 源代码
│   ├── vue/               # Vue 3 集成
│   │   ├── .ldesign/      # 构建配置
│   │   ├── examples/      # 示例项目
│   │   └── src/           # 源代码
│   ├── react/             # React 集成
│   │   ├── .ldesign/      # 构建配置
│   │   ├── examples/      # 示例项目
│   │   └── src/           # 源代码
│   ├── angular/           # Angular 集成
│   │   ├── .ldesign/      # 构建配置
│   │   ├── examples/      # 示例项目
│   │   └── src/           # 源代码
│   ├── svelte/            # Svelte 集成
│   │   ├── .ldesign/      # 构建配置
│   │   ├── examples/      # 示例项目
│   │   └── src/           # 源代码
│   └── solid/             # Solid.js 集成
│       ├── .ldesign/      # 构建配置
│       ├── examples/      # 示例项目
│       └── src/           # 源代码
```

## 🚀 常用命令

### 构建包

```bash
# 构建单个包
cd packages/core && pnpm build
cd packages/vue && pnpm build
cd packages/react && pnpm build
cd packages/angular && pnpm build
cd packages/svelte && pnpm build
cd packages/solid && pnpm build

# 从根目录构建所有包
pnpm -r --filter "@ldesign/i18n-*" --filter "!*-example" build

# 测试所有包构建（使用脚本）
bash test-build-all.sh        # Linux/Mac
.\test-build-all.ps1          # Windows
```

### 运行示例

```bash
# 单个示例（从 example 目录）
cd packages/core/examples && pnpm dev     # http://localhost:5000
cd packages/vue/examples && pnpm dev      # http://localhost:5001
cd packages/react/examples && pnpm dev    # http://localhost:5002
cd packages/angular/examples && pnpm dev  # http://localhost:5005
cd packages/svelte/examples && pnpm dev   # http://localhost:5003
cd packages/solid/examples && pnpm dev    # http://localhost:5004

# 使用 filter（从根目录）
pnpm --filter @ldesign/i18n-core-example dev
pnpm --filter @ldesign/i18n-vue-example dev
pnpm --filter @ldesign/i18n-react-example dev
pnpm --filter @ldesign/i18n-angular-example dev
pnpm --filter @ldesign/i18n-svelte-example dev
pnpm --filter @ldesign/i18n-solid-example dev

# 同时启动所有示例
pnpm -r --parallel --filter "*i18n*example" dev

# 测试所有示例（使用脚本）
bash test-examples-all.sh     # Linux/Mac
.\test-examples-all.ps1       # Windows
```

### 构建和预览示例

```bash
# 构建示例
cd packages/core/examples && pnpm build
pnpm --filter @ldesign/i18n-core-example build

# 预览构建结果
cd packages/core/examples && pnpm preview
pnpm --filter @ldesign/i18n-core-example preview
```

## 📋 端口分配

| 项目 | 端口 | 访问地址 |
|------|------|---------|
| Core Example | 5000 | http://localhost:5000 |
| Vue Example | 5001 | http://localhost:5001 |
| React Example | 5002 | http://localhost:5002 |
| Angular Example | 5005 | http://localhost:5005 |
| Svelte Example | 5003 | http://localhost:5003 |
| Solid Example | 5004 | http://localhost:5004 |

## 🔧 配置文件位置

### 包构建配置

所有包的构建配置统一在 `.ldesign/` 目录：

```
packages/core/.ldesign/ldesign.config.ts
packages/vue/.ldesign/ldesign.config.ts
packages/react/.ldesign/ldesign.config.ts
packages/angular/.ldesign/ldesign.config.ts
packages/svelte/.ldesign/ldesign.config.ts
packages/solid/.ldesign/ldesign.config.ts
```

### Example 启动配置

所有 examples 的启动配置在各自的 `.ldesign/` 目录：

```
packages/core/examples/.ldesign/launcher.config.ts
packages/vue/examples/.ldesign/launcher.config.ts
packages/react/examples/.ldesign/launcher.config.ts
packages/angular/examples/.ldesign/launcher.config.ts
packages/svelte/examples/.ldesign/launcher.config.ts
packages/solid/examples/.ldesign/launcher.config.ts
```

## 📦 包依赖关系

```
@ldesign/i18n-core
    ↓ (依赖)
├── @ldesign/i18n-vue
├── @ldesign/i18n-react
├── @ldesign/i18n-angular
├── @ldesign/i18n-svelte
└── @ldesign/i18n-solid
```

## 🎯 快速测试流程

### 1. 构建所有包

```bash
# 从 packages/i18n 目录
pnpm -r --filter "@ldesign/i18n-*" --filter "!*-example" build
```

### 2. 测试所有示例

```bash
# 安装依赖并构建
bash test-examples-all.sh    # Linux/Mac
.\test-examples-all.ps1      # Windows
```

### 3. 启动示例查看效果

```bash
# 选择一个示例启动
pnpm --filter @ldesign/i18n-vue-example dev

# 或同时启动所有示例
pnpm -r --parallel --filter "*i18n*example" dev
```

## 📚 文档导航

- [主 README](./README.md) - 主包文档
- [框架总览](./packages/README.md) - 所有框架适配器说明
- [示例指南](./EXAMPLES_GUIDE.md) - Examples 详细指南
- [构建配置完成报告](./BUILD_AND_CONFIG_COMPLETE.md) - 配置迁移报告
- [框架支持完成报告](./FRAMEWORK_SUPPORT_COMPLETE.md) - Svelte/Solid 添加报告

### 各包文档

- [Core 文档](./packages/core/README.md)
- [Vue 文档](./packages/vue/README.md)
- [React 文档](./packages/react/README.md)
- [Svelte 文档](./packages/svelte/README.md)
- [Solid 文档](./packages/solid/README.md)

## 🛠️ 开发工作流

### 添加新功能

1. 在 `packages/core` 中实现核心功能
2. 在各框架包中添加框架特定实现
3. 在各 example 中添加演示
4. 构建测试: `bash test-build-all.sh`
5. Example 测试: `bash test-examples-all.sh`

### 发布流程

1. 更新所有包的版本号
2. 构建所有包: `pnpm -r build`
3. 运行测试: `pnpm -r test`
4. 发布: `pnpm -r publish`

## 💡 提示

- 使用 `--filter` 来精确选择包
- 使用 `-r` (recursive) 来操作所有包
- 使用 `--parallel` 来并行执行命令
- 所有示例都使用 `@ldesign/launcher` 统一管理

---

**快速开始**: [README.md](./README.md)  
**维护团队**: LDesign Team

