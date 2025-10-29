# 测试所有 i18n examples 的启动
# 使用方法: .\test-examples-all.ps1

$ErrorActionPreference = "Stop"

Write-Host "================================" -ForegroundColor Cyan
Write-Host "测试所有 examples 依赖安装..." -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# 包列表
$packages = @("core", "vue", "react", "angular", "svelte", "solid")

# 测试统计
$successCount = 0
$failCount = 0
$failedExamples = @()

foreach ($pkg in $packages) {
    Write-Host "[测试] @ldesign/i18n-$pkg-example" -ForegroundColor Blue
    Write-Host "路径: packages/$pkg/examples"
    
    Push-Location "packages/$pkg/examples"
    
    try {
        # 安装依赖
        Write-Host "正在安装依赖..." -ForegroundColor Yellow
        pnpm install
        Write-Host "✅ 依赖安装成功" -ForegroundColor Green
        
        # 测试构建
        Write-Host "正在测试构建..." -ForegroundColor Yellow
        pnpm build
        Write-Host "✅ @ldesign/i18n-$pkg-example 构建成功" -ForegroundColor Green
        $successCount++
    }
    catch {
        Write-Host "❌ @ldesign/i18n-$pkg-example 测试失败" -ForegroundColor Red
        $failCount++
        $failedExamples += $pkg
    }
    
    Pop-Location
    Write-Host ""
}

Write-Host "================================" -ForegroundColor Cyan
Write-Host "Examples 测试完成" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host "成功: $successCount" -ForegroundColor Green
Write-Host "失败: $failCount" -ForegroundColor Red

if ($failCount -gt 0) {
    Write-Host ""
    Write-Host "失败的 examples:" -ForegroundColor Red
    foreach ($pkg in $failedExamples) {
        Write-Host "  - $pkg"
    }
    exit 1
}
else {
    Write-Host ""
    Write-Host "🎉 所有 examples 测试成功！" -ForegroundColor Green
    Write-Host ""
    Write-Host "可以使用以下命令启动示例："
    Write-Host "  pnpm --filter @ldesign/i18n-core-example dev     # 端口 5000"
    Write-Host "  pnpm --filter @ldesign/i18n-vue-example dev      # 端口 5001"
    Write-Host "  pnpm --filter @ldesign/i18n-react-example dev    # 端口 5002"
    Write-Host "  pnpm --filter @ldesign/i18n-angular-example dev  # 端口 5005"
    Write-Host "  pnpm --filter @ldesign/i18n-svelte-example dev   # 端口 5003"
    Write-Host "  pnpm --filter @ldesign/i18n-solid-example dev    # 端口 5004"
    exit 0
}

