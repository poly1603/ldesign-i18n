import antfu from '@antfu/eslint-config'

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
