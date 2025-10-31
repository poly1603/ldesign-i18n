#!/usr/bin/env node

import { execSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import { resolve } from 'node:path'

const frameworks = [
  'react', 'vue', 'solid', 'svelte', 'preact', 'lit',
  // 'astro', 'sveltekit', // Require special setup
]

console.log('🧪 Testing example projects...\n')

let successCount = 0
let failCount = 0

for (const framework of frameworks) {
  const exampleDir = resolve(`packages/${framework}/example`)
  
  if (!existsSync(exampleDir)) {
    console.log(`⚠️  ${framework}: Example directory not found`)
    continue
  }

  try {
    console.log(`📦 Testing ${framework} example...`)
    
    // Check if node_modules exists
    const nodeModulesPath = resolve(exampleDir, 'node_modules')
    if (!existsSync(nodeModulesPath)) {
      console.log(`  ⚠️  Installing dependencies...`)
      execSync('pnpm install', { 
        cwd: exampleDir,
        stdio: 'pipe'
      })
    }

    // Run TypeScript check
    execSync('npx tsc --noEmit', { 
      cwd: exampleDir,
      stdio: 'pipe'
    })
    
    console.log(`  ✅ ${framework}: TypeScript check passed\n`)
    successCount++
  } catch (error) {
    console.log(`  ❌ ${framework}: TypeScript check failed`)
    console.log(`     ${error.message}\n`)
    failCount++
  }
}

console.log('\n' + '='.repeat(60))
console.log(`📊 Results: ${successCount} passed, ${failCount} failed`)
console.log('='.repeat(60))

if (failCount > 0) {
  process.exit(1)
}
