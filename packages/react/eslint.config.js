import antfu from '@antfu/eslint-config'

export default antfu({
  type: 'lib',
  typescript: true,
  react: true,
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
    
    // React 规则
    'react/prop-types': 'off',
    'react/react-in-jsx-scope': 'off',
    'react-hooks/exhaustive-deps': 'warn',
    
  },
})
