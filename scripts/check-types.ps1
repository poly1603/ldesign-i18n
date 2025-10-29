# Check TypeScript types for all packages
# Usage: .\scripts\check-types.ps1

$packages = @(
    'lit',
    'alpinejs',
    'astro',
    'sveltekit',
    'qwik',
    'preact',
    'react',
    'vue',
    'nextjs',
    'nuxtjs',
    'remix',
    'solid',
    'svelte',
    'angular'
)

$failed = @()
$passed = @()

Write-Host "`n=== Checking TypeScript Types for All Packages ===`n" -ForegroundColor Cyan

foreach ($pkg in $packages) {
    Write-Host "Checking $pkg..." -NoNewline
    
    Push-Location "packages\$pkg"
    
    $output = pnpm type-check 2>&1
    $exitCode = $LASTEXITCODE
    
    Pop-Location
    
    if ($exitCode -eq 0) {
        Write-Host " ✅ PASSED" -ForegroundColor Green
        $passed += $pkg
    } else {
        Write-Host " ❌ FAILED" -ForegroundColor Red
        $failed += $pkg
        
        # Count errors
        $errorCount = ($output | Select-String "error TS" | Measure-Object).Count
        if ($errorCount -gt 0) {
            Write-Host "  └─ $errorCount errors found" -ForegroundColor Yellow
        }
    }
}

Write-Host "`n=== Summary ===" -ForegroundColor Cyan
Write-Host "Passed: $($passed.Count)/$($packages.Count)" -ForegroundColor Green
Write-Host "Failed: $($failed.Count)/$($packages.Count)" -ForegroundColor Red

if ($failed.Count -gt 0) {
    Write-Host "`nFailed packages:" -ForegroundColor Yellow
    foreach ($pkg in $failed) {
        Write-Host "  - $pkg" -ForegroundColor Red
    }
    exit 1
} else {
    Write-Host "`nAll packages passed type checking! 🎉" -ForegroundColor Green
    exit 0
}
