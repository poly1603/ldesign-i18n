import * as fs from 'node:fs'
import * as path from 'node:path'
import { execSync } from 'node:child_process'

const packagesDir = path.resolve(process.cwd(), 'packages')

async function buildPackage(packageName: string) {
  const packageDir = path.join(packagesDir, packageName)
  const packageJsonPath = path.join(packageDir, 'package.json')

  if (!fs.existsSync(packageJsonPath)) {
    console.log(`⚠️  Skipping ${packageName}: no package.json found`)
    return false
  }

  console.log(`\n📦 Building @ldesign/i18n-${packageName}...`)

  try {
    execSync('pnpm run build', {
      cwd: packageDir,
      stdio: 'inherit',
      env: { ...process.env },
    })
    console.log(`✅ Successfully built @ldesign/i18n-${packageName}`)
    return true
  }
  catch (error) {
    console.error(`❌ Failed to build @ldesign/i18n-${packageName}:`, error)
    return false
  }
}

async function main() {
  const packages = fs
    .readdirSync(packagesDir)
    .filter(name => fs.statSync(path.join(packagesDir, name)).isDirectory())

  console.log(`Found ${packages.length} packages to build`)

  // Build core first
  if (packages.includes('core')) {
    await buildPackage('core')
  }

  // Build other packages
  const results = []
  for (const pkg of packages) {
    if (pkg !== 'core') {
      const success = await buildPackage(pkg)
      results.push({ package: pkg, success })
    }
  }

  // Summary
  console.log('\n' + '='.repeat(50))
  console.log('Build Summary:')
  console.log('='.repeat(50))

  const successful = results.filter(r => r.success)
  const failed = results.filter(r => !r.success)

  console.log(`✅ Successful: ${successful.length}`)
  console.log(`❌ Failed: ${failed.length}`)

  if (failed.length > 0) {
    console.log('\nFailed packages:')
    failed.forEach(({ package: pkg }) => console.log(`  - ${pkg}`))
    process.exit(1)
  }
}

main().catch(console.error)
