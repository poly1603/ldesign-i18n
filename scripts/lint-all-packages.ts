import * as fs from 'node:fs'
import * as path from 'node:path'
import { execSync } from 'node:child_process'

const packagesDir = path.resolve(process.cwd(), 'packages')

async function lintPackage(packageName: string, fix = false) {
  const packageDir = path.join(packagesDir, packageName)
  const eslintConfigPath = path.join(packageDir, 'eslint.config.js')

  if (!fs.existsSync(eslintConfigPath)) {
    console.log(`⚠️  Skipping ${packageName}: no eslint config found`)
    return { success: true, skipped: true }
  }

  console.log(`\n🔍 Linting @ldesign/i18n-${packageName}...`)

  try {
    const command = fix ? 'pnpm run lint:fix' : 'pnpm run lint'
    execSync(command, {
      cwd: packageDir,
      stdio: 'inherit',
      env: { ...process.env },
    })
    console.log(`✅ @ldesign/i18n-${packageName} passed lint check`)
    return { success: true, skipped: false }
  }
  catch (error) {
    console.error(`❌ @ldesign/i18n-${packageName} failed lint check`)
    return { success: false, skipped: false }
  }
}

async function main() {
  const args = process.argv.slice(2)
  const fix = args.includes('--fix')

  console.log(`Running lint${fix ? ' with --fix' : ''}...\n`)

  const packages = fs
    .readdirSync(packagesDir)
    .filter(name => fs.statSync(path.join(packagesDir, name)).isDirectory())

  const results = []
  for (const pkg of packages) {
    const result = await lintPackage(pkg, fix)
    if (!result.skipped) {
      results.push({ package: pkg, ...result })
    }
  }

  // Summary
  console.log('\n' + '='.repeat(50))
  console.log('Lint Summary:')
  console.log('='.repeat(50))

  const successful = results.filter(r => r.success)
  const failed = results.filter(r => !r.success)

  console.log(`✅ Passed: ${successful.length}`)
  console.log(`❌ Failed: ${failed.length}`)

  if (failed.length > 0) {
    console.log('\nFailed packages:')
    failed.forEach(({ package: pkg }) => console.log(`  - ${pkg}`))
    process.exit(1)
  }
}

main().catch(console.error)
