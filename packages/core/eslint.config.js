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
    // 性能优化相关规则
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    'no-debugger': 'warn',
    
    // TypeScript 规则
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-non-null-assertion': 'off',
    '@typescript-eslint/ban-ts-comment': 'off',
    
    // 代码质量规则
    'complexity': ['warn', 20],
    'max-depth': ['warn', 4],
    'max-lines-per-function': ['warn', { max: 200, skipBlankLines: true, skipComments: true }],
    
    // 性能规则
    'no-await-in-loop': 'warn',
    'no-unreachable-loop': 'error',
  },
})
