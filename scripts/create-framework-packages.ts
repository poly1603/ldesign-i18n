import * as fs from 'node:fs'
import * as path from 'node:path'

// 框架配置
const frameworks = [
  {
    name: 'alpinejs',
    displayName: 'Alpine.js',
    description: 'Alpine.js integration for @ldesign/i18n',
    peerDeps: { alpinejs: '^3.13.0' },
    features: ['directives', 'plugins'],
  },
  {
    name: 'nextjs',
    displayName: 'Next.js',
    description: 'Next.js integration for @ldesign/i18n with App Router and Pages Router support',
    peerDeps: { next: '^13.0.0 || ^14.0.0 || ^15.0.0', react: '^16.8.0 || ^17.0.0 || ^18.0.0' },
    features: ['hooks', 'components', 'server', 'middleware'],
  },
  {
    name: 'nuxtjs',
    displayName: 'Nuxt.js',
    description: 'Nuxt 3 integration for @ldesign/i18n with auto-imports and SSR support',
    peerDeps: { nuxt: '^3.0.0', vue: '^3.3.0' },
    features: ['composables', 'components', 'plugins', 'server'],
  },
  {
    name: 'remix',
    displayName: 'Remix',
    description: 'Remix integration for @ldesign/i18n with loader and action support',
    peerDeps: { '@remix-run/react': '^2.0.0', react: '^16.8.0 || ^17.0.0 || ^18.0.0' },
    features: ['hooks', 'components', 'loaders', 'utils'],
  },
  {
    name: 'astro',
    displayName: 'Astro',
    description: 'Astro integration for @ldesign/i18n with component support',
    peerDeps: { astro: '^4.0.0' },
    features: ['components', 'utils', 'middleware'],
  },
  {
    name: 'lit',
    displayName: 'Lit',
    description: 'Lit integration for @ldesign/i18n with directive and controller support',
    peerDeps: { lit: '^3.0.0' },
    features: ['directives', 'controllers', 'decorators'],
  },
  {
    name: 'preact',
    displayName: 'Preact',
    description: 'Preact integration for @ldesign/i18n with hooks support',
    peerDeps: { preact: '^10.0.0' },
    features: ['hooks', 'components'],
  },
  {
    name: 'qwik',
    displayName: 'Qwik',
    description: 'Qwik integration for @ldesign/i18n with resumable i18n support',
    peerDeps: { '@builder.io/qwik': '^1.0.0' },
    features: ['hooks', 'components'],
  },
  {
    name: 'sveltekit',
    displayName: 'SvelteKit',
    description: 'SvelteKit integration for @ldesign/i18n with load function support',
    peerDeps: { '@sveltejs/kit': '^2.0.0', svelte: '^4.0.0' },
    features: ['stores', 'components', 'server'],
  },
]

function createPackageJson(framework: typeof frameworks[0]) {
  const packageJson = {
    name: `@ldesign/i18n-${framework.name}`,
    type: 'module',
    version: '1.0.0',
    description: framework.description,
    author: 'ldesign',
    license: 'MIT',
    keywords: ['i18n', 'internationalization', 'localization', framework.name, 'typescript'],
    exports: {
      '.': {
        types: './es/index.d.ts',
        import: './es/index.js',
        require: './lib/index.cjs',
      },
      ...framework.features.reduce((acc, feature) => {
        acc[`./${feature}`] = {
          types: `./es/${feature}/index.d.ts`,
          import: `./es/${feature}/index.js`,
          require: `./lib/${feature}/index.cjs`,
        }
        return acc
      }, {} as Record<string, any>),
    },
    main: './lib/index.cjs',
    module: './es/index.js',
    types: './es/index.d.ts',
    files: ['LICENSE', 'README.md', 'dist', 'es', 'lib', 'package.json'],
    scripts: {
      build: 'ldesign-builder build -f esm,cjs',
      'build:watch': 'ldesign-builder build --watch',
      dev: 'ldesign-builder build --watch',
      test: 'vitest',
      'test:run': 'vitest run',
      'test:coverage': 'vitest run --coverage',
      clean: 'rimraf es lib dist coverage .tsbuildinfo',
      'type-check': 'tsc --noEmit',
      'type-check:watch': 'tsc --noEmit --watch',
      lint: 'eslint .',
      'lint:fix': 'eslint . --fix',
      prepublishOnly: 'pnpm run clean && pnpm run build',
    },
    peerDependencies: framework.peerDeps,
    peerDependenciesMeta: Object.keys(framework.peerDeps).reduce((acc, key) => {
      acc[key] = { optional: false }
      return acc
    }, {} as Record<string, any>),
    dependencies: {
      '@ldesign/i18n-core': 'workspace:*',
      '@ldesign/shared': 'workspace:*',
      tslib: '^2.6.2',
    },
    devDependencies: {
      '@antfu/eslint-config': '^6.0.0',
      '@ldesign/builder': 'workspace:*',
      '@types/node': '^22.0.0',
      '@vitest/ui': '^3.2.4',
      eslint: '^9.18.0',
      rimraf: '^5.0.5',
      typescript: '^5.7.3',
      vite: '^5.0.12',
      vitest: '^3.2.4',
    },
    publishConfig: {
      access: 'public',
    },
  }

  return JSON.stringify(packageJson, null, 2)
}

function createTsConfig() {
  return JSON.stringify(
    {
      extends: '../../tsconfig.json',
      compilerOptions: {
        outDir: './es',
        rootDir: './src',
        declaration: true,
        declarationMap: true,
        composite: true,
      },
      include: ['src/**/*'],
      exclude: ['node_modules', 'es', 'lib', 'dist', '**/__tests__/**', '**/*.spec.ts', '**/*.test.ts'],
    },
    null,
    2,
  )
}

function createEslintConfig() {
  return `import antfu from '@antfu/eslint-config'

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
}

function createVitestConfig() {
  return `import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'es/',
        'lib/',
        'dist/',
        '**/*.spec.ts',
        '**/*.test.ts',
        '**/types.ts',
      ],
    },
  },
})
`
}

function createIndexFile(framework: typeof frameworks[0]) {
  return `/**
 * @ldesign/i18n-${framework.name}
 * ${framework.displayName} integration for @ldesign/i18n
 * 
 * @version 1.0.0
 * @author LDesign Team
 * @license MIT
 */

export { createI18n, type I18nInstance } from '@ldesign/i18n-core'

// Export framework-specific integrations
${framework.features.map(feature => `export * from './${feature}'`).join('\n')}

// Version info
export const VERSION = '1.0.0'
`
}

function createFeatureFile(feature: string) {
  return `/**
 * ${feature.charAt(0).toUpperCase() + feature.slice(1)} for i18n integration
 */

// TODO: Implement ${feature}

export {}
`
}

function createReadme(framework: typeof frameworks[0]) {
  return `# @ldesign/i18n-${framework.name}

${framework.displayName} integration for @ldesign/i18n - Powerful i18n solution with type safety and performance optimization.

## Features

${framework.features.map(f => `- ✨ ${f.charAt(0).toUpperCase() + f.slice(1)}`).join('\n')}
- 🚀 High performance
- 📦 Tree-shakeable
- 🔒 Type safe
- 💪 Framework native integration

## Installation

\`\`\`bash
pnpm add @ldesign/i18n-${framework.name}
\`\`\`

## Usage

\`\`\`typescript
import { createI18n } from '@ldesign/i18n-${framework.name}'

const i18n = createI18n({
  locale: 'en',
  fallbackLocale: 'en',
  messages: {
    en: {
      hello: 'Hello World',
    },
    zh: {
      hello: '你好世界',
    },
  },
})
\`\`\`

## License

MIT © LDesign Team
`
}

// 主函数
async function main() {
  const packagesDir = path.resolve(process.cwd(), 'packages')

  for (const framework of frameworks) {
    const frameworkDir = path.join(packagesDir, framework.name)
    const srcDir = path.join(frameworkDir, 'src')

    // 创建目录
    fs.mkdirSync(frameworkDir, { recursive: true })
    fs.mkdirSync(srcDir, { recursive: true })

    // 创建 package.json
    fs.writeFileSync(path.join(frameworkDir, 'package.json'), createPackageJson(framework))

    // 创建 tsconfig.json
    fs.writeFileSync(path.join(frameworkDir, 'tsconfig.json'), createTsConfig())

    // 创建 eslint.config.js
    fs.writeFileSync(path.join(frameworkDir, 'eslint.config.js'), createEslintConfig())

    // 创建 vitest.config.ts
    fs.writeFileSync(path.join(frameworkDir, 'vitest.config.ts'), createVitestConfig())

    // 创建 README.md
    fs.writeFileSync(path.join(frameworkDir, 'README.md'), createReadme(framework))

    // 创建 src/index.ts
    fs.writeFileSync(path.join(srcDir, 'index.ts'), createIndexFile(framework))

    // 创建各功能目录和文件
    for (const feature of framework.features) {
      const featureDir = path.join(srcDir, feature)
      fs.mkdirSync(featureDir, { recursive: true })
      fs.writeFileSync(path.join(featureDir, 'index.ts'), createFeatureFile(feature))
    }

    console.log(`✅ Created @ldesign/i18n-${framework.name}`)
  }

  console.log('\n🎉 All framework packages created successfully!')
}

main().catch(console.error)
