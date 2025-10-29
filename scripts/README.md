# Scripts

项目工具脚本集合。

## 可用脚本

### validate-all.ps1

全面验证所有包的质量。

**功能**:
- ✅ TypeScript 类型检查
- ✅ 单元测试运行
- ✅ ESLint 代码检查
- ✅ 详细报告生成

**使用方法**:

```powershell
# 运行所有验证
.\scripts\validate-all.ps1

# 跳过测试
.\scripts\validate-all.ps1 -SkipTests

# 跳过类型检查
.\scripts\validate-all.ps1 -SkipTypes

# 跳过 Lint
.\scripts\validate-all.ps1 -SkipLint

# 显示详细输出
.\scripts\validate-all.ps1 -Verbose

# 组合使用
.\scripts\validate-all.ps1 -SkipTests -Verbose
```

**输出示例**:

```
============================================================
 Starting Validation
============================================================
Packages: 15
Options: Tests=True, Types=True, Lint=True

📦 Package: lit
[lit] Type checking... ✅ PASSED
[lit] Running tests... ✅ PASSED
  └─ 6 tests
[lit] Linting... ✅ PASSED

============================================================
 Validation Summary
============================================================

📝 Type Checking:
  Passed: 12/15
  Failed: 3/15
  Failed packages: core, react, vue

🧪 Tests:
  Passed: 15/15
  Failed: 0/15

🔍 Linting:
  Passed: 14/15
  Failed: 1/15

✅ All validations passed! 🎉
```

### check-types.ps1

快速检查所有包的 TypeScript 类型。

**使用方法**:

```powershell
.\scripts\check-types.ps1
```

**输出**:

```
=== Checking TypeScript Types for All Packages ===

Checking lit... ✅ PASSED
Checking alpinejs... ✅ PASSED
Checking core... ❌ FAILED
  └─ 332 errors found

=== Summary ===
Passed: 14/15
Failed: 1/15

Failed packages:
  - core
```

## 开发建议

### 提交前检查

```powershell
# 完整验证
.\scripts\validate-all.ps1

# 快速类型检查
.\scripts\check-types.ps1
```

### CI/CD 集成

```yaml
# GitHub Actions 示例
- name: Validate All Packages
  run: |
    pwsh -File scripts/validate-all.ps1
```

### 问题排查

如果验证失败：

1. **类型错误**
   ```powershell
   cd packages/<package-name>
   pnpm type-check
   ```

2. **测试失败**
   ```powershell
   cd packages/<package-name>
   pnpm test
   ```

3. **Lint 警告**
   ```powershell
   cd packages/<package-name>
   pnpm lint --fix
   ```

## 脚本开发规范

### 编写新脚本

1. 使用 PowerShell 或 Bash
2. 提供清晰的帮助信息
3. 支持常用参数
4. 输出彩色结果
5. 返回正确的退出码

### 命名规范

- `validate-*` - 验证脚本
- `build-*` - 构建脚本
- `test-*` - 测试脚本
- `check-*` - 检查脚本

### 参数规范

常用参数：
- `-Verbose` - 详细输出
- `-Skip*` - 跳过某个步骤
- `-Force` - 强制执行
- `-Help` - 显示帮助

## 常见问题

### Q: PowerShell 执行策略错误？

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Q: 权限不足？

```powershell
# 以管理员身份运行 PowerShell
Start-Process powershell -Verb runAs
```

### Q: 脚本运行缓慢？

```powershell
# 跳过不需要的检查
.\scripts\validate-all.ps1 -SkipTests -SkipLint
```

## 未来计划

- [ ] `build-all.ps1` - 批量构建所有包
- [ ] `publish-all.ps1` - 批量发布包
- [ ] `bump-version.ps1` - 版本号管理
- [ ] `generate-changelog.ps1` - 自动生成变更日志
- [ ] `analyze-bundle.ps1` - 包体积分析

---

**维护者**: LDesign Team  
**最后更新**: 2025-10-29
