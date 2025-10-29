# @ldesign/i18n-remix

Remix integration for @ldesign/i18n - Powerful i18n solution with type safety and performance optimization.

## Features

- ✨ Hooks
- ✨ Components
- ✨ Loaders
- ✨ Utils
- 🚀 High performance
- 📦 Tree-shakeable
- 🔒 Type safe
- 💪 Framework native integration

## Installation

```bash
pnpm add @ldesign/i18n-remix
```

## Usage

```typescript
import { createI18n } from '@ldesign/i18n-remix'

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
```

## License

MIT © LDesign Team
