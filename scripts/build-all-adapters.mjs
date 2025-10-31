#!/usr/bin/env node

import { execSync } from 'node:child_process'

const adapters = [
  'core',
  'react',
  'vue',
  'solid',
  'svelte',
  'preact',
  'lit',
  'astro',
  'sveltekit',
  'alpinejs',
  'nextjs',
  'nuxtjs',
  // 'angular', // Needs special setup
  // 'qwik',    // Has build issues
  // 'remix',   // Not ready yet
]

console.log('🔨 Building all framework adapters...\n')

let successCount = 0
let failCount = 0
const results = []

for (const adapter of adapters) {
  const packageName = adapter === 'core' ? '@ldesign/i18n-core' : `@ldesign/i18n-${adapter}`
  
  try {
    console.log(`📦 Building ${packageName}...`)
    
    execSync(`pnpm --filter ${packageName} build`, {
      stdio: 'pipe',
      cwd: process.cwd(),
    })
    
    console.log(`  ✅ ${adapter}: Build successful\n`)
    successCount++
    results.push({ adapter, status: 'success' })
  } catch (error) {
    console.log(`  ❌ ${adapter}: Build failed`)
    console.log(`     ${error.message}\n`)
    failCount++
    results.push({ adapter, status: 'failed', error: error.message })
  }
}

console.log('\n' + '='.repeat(60))
console.log('📊 Build Results Summary')
console.log('='.repeat(60))
console.log(`✅ Successful: ${successCount}`)
console.log(`❌ Failed: ${failCount}`)
console.log(`📊 Total: ${adapters.length}`)
console.log('='.repeat(60))

if (failCount > 0) {
  console.log('\n❌ Failed builds:')
  results
    .filter(r => r.status === 'failed')
    .forEach(r => console.log(`  - ${r.adapter}`))
}

console.log('\n✨ Build process completed!')

if (failCount > 0) {
  process.exit(1)
}
