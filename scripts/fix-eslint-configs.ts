import * as fs from 'node:fs'
import * as path from 'node:path'

const packagesDir = path.resolve(process.cwd(), 'packages')

const correctConfig = `import antfu from '@antfu/eslint-config'

export default antfu({
  type: 'lib',
  typescript: true,
  ignores: [
    'es',
    'lib',
    'dist',
    'coverage',
    'node_modules',
    '*.min.js',
    '.tsbuildinfo',
  ],
  rules: {
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    'no-debugger': 'warn',
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-non-null-assertion': 'off',
    '@typescript-eslint/ban-ts-comment': 'off',
  },
})
`

async function main() {
  const packages = fs
    .readdirSync(packagesDir)
    .filter(name => fs.statSync(path.join(packagesDir, name)).isDirectory())

  for (const pkg of packages) {
    const eslintConfigPath = path.join(packagesDir, pkg, 'eslint.config.js')

    if (fs.existsSync(eslintConfigPath)) {
      const content = fs.readFileSync(eslintConfigPath, 'utf-8')

      // Check if it contains import/order rule
      if (content.includes('import/order')) {
        console.log(`✏️  Fixing ${pkg}/eslint.config.js`)
        fs.writeFileSync(eslintConfigPath, correctConfig)
        console.log(`✅ Fixed ${pkg}/eslint.config.js`)
      }
      else {
        console.log(`✓ ${pkg}/eslint.config.js is already correct`)
      }
    }
  }

  console.log('\n🎉 All ESLint configs fixed!')
}

main().catch(console.error)
