# @ldesign/i18n 测试指南

## 📋 完成状态

所有包和示例项目已经创建完成：

### ✅ 已完成

1. **框架适配器**: Core, Vue, React, Angular, Svelte, Solid
2. **构建配置**: 所有包的 `.ldesign/ldesign.config.ts`
3. **示例项目**: 6 个完整的 example 项目
4. **Launcher 配置**: 所有 examples 的 `.ldesign/launcher.config.ts`
5. **Alias 配置**: 所有 examples 已配置路径别名
6. **依赖安装**: 所有 examples 依赖已安装

## 🚀 测试流程

### 第一步：构建所有包

在运行示例之前，必须先构建所有包：

```bash
# 从 packages/i18n 目录执行

# 方法 1: 使用测试脚本
.\test-build-all.ps1          # Windows
bash test-build-all.sh        # Linux/Mac

# 方法 2: 手动构建每个包
cd packages/core && pnpm build
cd ../vue && pnpm build
cd ../react && pnpm build
cd ../angular && pnpm build
cd ../svelte && pnpm build
cd ../solid && pnpm build

# 方法 3: 使用 pnpm filter（从 i18n 根目录）
pnpm -r --filter "@ldesign/i18n-core" build
pnpm -r --filter "@ldesign/i18n-vue" build
pnpm -r --filter "@ldesign/i18n-react" build
pnpm -r --filter "@ldesign/i18n-angular" build
pnpm -r --filter "@ldesign/i18n-svelte" build
pnpm -r --filter "@ldesign/i18n-solid" build
```

### 第二步：运行示例项目

构建完成后，可以启动示例：

```bash
# 单个示例（从 packages/i18n 目录）
pnpm --filter @ldesign/i18n-core-example dev      # 端口 5000
pnpm --filter @ldesign/i18n-vue-example dev       # 端口 5001
pnpm --filter @ldesign/i18n-react-example dev     # 端口 5002
pnpm --filter @ldesign/i18n-angular-example dev   # 端口 5005
pnpm --filter @ldesign/i18n-svelte-example dev    # 端口 5003
pnpm --filter @ldesign/i18n-solid-example dev     # 端口 5004

# 或从 example 目录启动
cd packages/core/examples && pnpm dev
cd packages/vue/examples && pnpm dev
# ... 等等
```

### 第三步：功能测试

访问每个示例并测试以下功能：

#### 核心功能测试
- [ ] 页面正常加载，无 console 错误
- [ ] 基础翻译显示正确
- [ ] 参数插值正常工作
- [ ] 复数化功能正常
- [ ] 日期格式化正常
- [ ] 数字格式化正常

#### 语言切换测试
- [ ] 切换到英文，所有文本更新
- [ ] 切换到中文，所有文本更新
- [ ] 切换到日文（如果支持），所有文本更新

#### 框架特定功能测试

**Vue** (5001):
- [ ] useI18n composable 正常工作
- [ ] Trans 组件正常显示
- [ ] v-t 指令正常工作
- [ ] 响应式更新正常

**React** (5002):
- [ ] useI18n hook 正常工作
- [ ] Trans 组件正常显示
- [ ] 响应式更新正常

**Angular** (5005):
- [ ] I18nService 注入成功
- [ ] translate pipe 正常工作
- [ ] i18nDate, i18nNumber pipes 正常工作
- [ ] i18nTranslate 指令正常工作
- [ ] Observable 流正常工作

**Svelte** (5003):
- [ ] createI18n store 正常工作
- [ ] Trans 组件正常显示
- [ ] use:t action 正常工作
- [ ] use:tPlural action 正常工作
- [ ] 响应式更新正常

**Solid** (5004):
- [ ] useI18n primitive 正常工作
- [ ] Trans 组件正常显示
- [ ] use:t directive 正常工作
- [ ] use:tPlural directive 正常工作
- [ ] Signals 响应式正常

## 📝 访问地址

| 示例 | 端口 | URL |
|------|------|-----|
| Core | 5000 | http://localhost:5000 |
| Vue | 5001 | http://localhost:5001 |
| React | 5002 | http://localhost:5002 |
| Angular | 5005 | http://localhost:5005 |
| Svelte | 5003 | http://localhost:5003 |
| Solid | 5004 | http://localhost:5004 |

## 🐛 常见问题

### 问题 1: 模块找不到

**症状**: `Cannot find module '@ldesign/i18n-xxx'`

**解决方案**:
```bash
# 先构建对应的包
cd packages/xxx
pnpm build
```

### 问题 2: launcher 命令不存在

**症状**: `command not found: launcher`

**解决方案**:
```bash
# 确保 @ldesign/launcher 已构建
cd ../../tools/launcher
pnpm build

# 或重新安装依赖
pnpm install
```

### 问题 3: 端口被占用

**症状**: `Port 5000 is already in use`

**解决方案**:
1. 关闭占用端口的进程
2. 或修改 `.ldesign/launcher.config.ts` 中的端口号

### 问题 4: TypeScript 错误

**症状**: 类型错误或编译错误

**解决方案**:
```bash
# 清理并重新构建
cd packages/xxx
pnpm clean
pnpm build
```

## 🔧 快速修复

如果遇到问题，可以尝试：

```bash
# 1. 清理所有构建产物
pnpm -r --filter "@ldesign/i18n-*" --filter "!*-example" run clean

# 2. 重新安装依赖
pnpm install

# 3. 重新构建所有包
.\test-build-all.ps1

# 4. 启动示例测试
.\test-examples-all.ps1
```

## 📊 预期结果

### 构建成功

所有包构建后应该生成：
- `es/` - ESM 格式
- `lib/` - CJS 格式
- `dist/` - UMD 格式（仅 Core）
- 类型声明文件 (.d.ts)

### 示例运行成功

每个示例启动后应该：
- 在指定端口启动开发服务器
- 浏览器自动打开或可手动访问
- 页面正常显示，无 console 错误
- 所有交互功能正常工作

## 📚 相关文档

- [快速参考](./QUICK_REFERENCE.md) - 常用命令
- [示例指南](./EXAMPLES_GUIDE.md) - 示例详细说明
- [最终完成报告](./FINAL_COMPLETION_REPORT.md) - 实施详情

## 🎯 测试脚本

项目提供了自动化测试脚本：

```bash
# 测试所有包构建
.\test-build-all.ps1          # Windows
bash test-build-all.sh        # Linux/Mac

# 测试所有示例
.\test-examples-all.ps1       # Windows
bash test-examples-all.sh     # Linux/Mac
```

---

**准备好测试了吗？** 按照上述步骤开始测试吧！

**提示**: 建议先构建所有包，然后逐个测试示例，确保每个都正常工作。

