# 测试所有 i18n 包的构建
# 使用方法: .\test-build-all.ps1

$ErrorActionPreference = "Stop"

Write-Host "================================" -ForegroundColor Cyan
Write-Host "开始测试所有包的构建..." -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# 包列表
$packages = @("core", "vue", "react", "angular", "svelte", "solid")

# 构建统计
$successCount = 0
$failCount = 0
$failedPackages = @()

foreach ($pkg in $packages) {
    Write-Host "[构建] @ldesign/i18n-$pkg" -ForegroundColor Blue
    Write-Host "路径: packages/$pkg"
    
    Push-Location "packages/$pkg"
    
    try {
        pnpm build
        Write-Host "✅ @ldesign/i18n-$pkg 构建成功" -ForegroundColor Green
        $successCount++
    }
    catch {
        Write-Host "❌ @ldesign/i18n-$pkg 构建失败" -ForegroundColor Red
        $failCount++
        $failedPackages += $pkg
    }
    
    Pop-Location
    Write-Host ""
}

Write-Host "================================" -ForegroundColor Cyan
Write-Host "构建测试完成" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host "成功: $successCount" -ForegroundColor Green
Write-Host "失败: $failCount" -ForegroundColor Red

if ($failCount -gt 0) {
    Write-Host ""
    Write-Host "失败的包:" -ForegroundColor Red
    foreach ($pkg in $failedPackages) {
        Write-Host "  - $pkg"
    }
    exit 1
}
else {
    Write-Host ""
    Write-Host "🎉 所有包构建成功！" -ForegroundColor Green
    exit 0
}

