# Comprehensive validation script for all packages
# Validates types, tests, linting, and builds

param(
    [switch]$SkipTests,
    [switch]$SkipTypes,
    [switch]$SkipLint,
    [switch]$Verbose
)

$ErrorActionPreference = "Continue"

# Colors
$ColorSuccess = "Green"
$ColorError = "Red"
$ColorWarning = "Yellow"
$ColorInfo = "Cyan"

# Package list
$packages = @(
    'core',
    'react',
    'vue',
    'nextjs',
    'nuxtjs',
    'remix',
    'solid',
    'svelte',
    'sveltekit',
    'angular',
    'lit',
    'alpinejs',
    'astro',
    'preact',
    'qwik'
)

# Results tracking
$results = @{
    TypeCheck = @{ Passed = @(); Failed = @() }
    Tests = @{ Passed = @(); Failed = @() }
    Lint = @{ Passed = @(); Failed = @() }
}

function Write-Header {
    param([string]$Text)
    Write-Host "`n" -NoNewline
    Write-Host "=" * 60 -ForegroundColor $ColorInfo
    Write-Host " $Text" -ForegroundColor $ColorInfo
    Write-Host "=" * 60 -ForegroundColor $ColorInfo
}

function Write-Step {
    param([string]$Package, [string]$Step)
    Write-Host "`n[$Package] " -NoNewline -ForegroundColor $ColorInfo
    Write-Host "$Step..." -NoNewline
}

function Write-Result {
    param([bool]$Success, [string]$Message = "")
    if ($Success) {
        Write-Host " ✅ PASSED" -ForegroundColor $ColorSuccess
        if ($Message) { Write-Host "  └─ $Message" -ForegroundColor Gray }
    } else {
        Write-Host " ❌ FAILED" -ForegroundColor $ColorError
        if ($Message) { Write-Host "  └─ $Message" -ForegroundColor $ColorWarning }
    }
}

# Main validation
Write-Header "Starting Validation"
Write-Host "Packages: $($packages.Count)" -ForegroundColor Gray
Write-Host "Options: Tests=$(-not $SkipTests), Types=$(-not $SkipTypes), Lint=$(-not $SkipLint)`n" -ForegroundColor Gray

foreach ($pkg in $packages) {
    Write-Host "`n📦 Package: $pkg" -ForegroundColor $ColorInfo
    
    $pkgPath = "packages\$pkg"
    if (-not (Test-Path $pkgPath)) {
        Write-Host "  ⚠️  Package not found: $pkgPath" -ForegroundColor $ColorWarning
        continue
    }
    
    Push-Location $pkgPath
    
    # Type Check
    if (-not $SkipTypes) {
        Write-Step $pkg "Type checking"
        $output = pnpm type-check 2>&1
        $success = $LASTEXITCODE -eq 0
        
        if ($success) {
            $results.TypeCheck.Passed += $pkg
            Write-Result $true
        } else {
            $results.TypeCheck.Failed += $pkg
            $errorCount = ($output | Select-String "error TS" | Measure-Object).Count
            Write-Result $false "$errorCount errors"
            
            if ($Verbose) {
                Write-Host "  Errors:" -ForegroundColor $ColorWarning
                $output | Select-String "error TS" | Select-Object -First 5 | ForEach-Object {
                    Write-Host "    $_" -ForegroundColor Gray
                }
            }
        }
    }
    
    # Tests
    if (-not $SkipTests) {
        Write-Step $pkg "Running tests"
        $output = pnpm test:run 2>&1
        $success = $LASTEXITCODE -eq 0
        
        if ($success) {
            $results.Tests.Passed += $pkg
            $testCount = ($output | Select-String "Tests\s+\d+" | Select-Object -First 1) -replace '.*Tests\s+(\d+).*', '$1'
            Write-Result $true "$testCount tests"
        } else {
            $results.Tests.Failed += $pkg
            Write-Result $false
        }
    }
    
    # Lint
    if (-not $SkipLint) {
        Write-Step $pkg "Linting"
        $output = pnpm lint 2>&1
        $success = $LASTEXITCODE -eq 0
        
        if ($success) {
            $results.Lint.Passed += $pkg
            Write-Result $true
        } else {
            $results.Lint.Failed += $pkg
            $warningCount = ($output | Select-String "warning" | Measure-Object).Count
            Write-Result $false "$warningCount warnings"
        }
    }
    
    Pop-Location
}

# Summary
Write-Header "Validation Summary"

if (-not $SkipTypes) {
    Write-Host "`n📝 Type Checking:" -ForegroundColor $ColorInfo
    Write-Host "  Passed: $($results.TypeCheck.Passed.Count)/$($packages.Count)" -ForegroundColor $ColorSuccess
    Write-Host "  Failed: $($results.TypeCheck.Failed.Count)/$($packages.Count)" -ForegroundColor $ColorError
    if ($results.TypeCheck.Failed.Count -gt 0) {
        Write-Host "  Failed packages: $($results.TypeCheck.Failed -join ', ')" -ForegroundColor $ColorWarning
    }
}

if (-not $SkipTests) {
    Write-Host "`n🧪 Tests:" -ForegroundColor $ColorInfo
    Write-Host "  Passed: $($results.Tests.Passed.Count)/$($packages.Count)" -ForegroundColor $ColorSuccess
    Write-Host "  Failed: $($results.Tests.Failed.Count)/$($packages.Count)" -ForegroundColor $ColorError
    if ($results.Tests.Failed.Count -gt 0) {
        Write-Host "  Failed packages: $($results.Tests.Failed -join ', ')" -ForegroundColor $ColorWarning
    }
}

if (-not $SkipLint) {
    Write-Host "`n🔍 Linting:" -ForegroundColor $ColorInfo
    Write-Host "  Passed: $($results.Lint.Passed.Count)/$($packages.Count)" -ForegroundColor $ColorSuccess
    Write-Host "  Failed: $($results.Lint.Failed.Count)/$($packages.Count)" -ForegroundColor $ColorError
    if ($results.Lint.Failed.Count -gt 0) {
        Write-Host "  Failed packages: $($results.Lint.Failed -join ', ')" -ForegroundColor $ColorWarning
    }
}

# Overall result
$totalFailed = $results.TypeCheck.Failed.Count + $results.Tests.Failed.Count + $results.Lint.Failed.Count

Write-Host "`n" -NoNewline
if ($totalFailed -eq 0) {
    Write-Host "✅ All validations passed! 🎉" -ForegroundColor $ColorSuccess
    exit 0
} else {
    Write-Host "❌ $totalFailed validation(s) failed" -ForegroundColor $ColorError
    exit 1
}
