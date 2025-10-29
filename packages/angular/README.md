# @ldesign/i18n-angular

[![npm version](https://badge.fury.io/js/@ldesign%2Fi18n-angular.svg)](https://badge.fury.io/js/@ldesign%2Fi18n-angular)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)
[![Angular](https://img.shields.io/badge/Angular-16%2F17%2F18-red.svg)](https://angular.io/)

Angular integration for @ldesign/i18n - 强大的国际化解决方案，支持 Services、Pipes、Directives 和 RxJS。

## ✨ 特性

- 💉 **依赖注入** - 基于 Angular DI 系统的 I18nService
- 📡 **RxJS 集成** - 完整的 Observable 支持
- 🎯 **类型安全** - 完整的 TypeScript 类型支持
- 🧩 **管道系统** - translate, i18nDate, i18nNumber, plural pipes
- 🎨 **指令支持** - i18nTranslate 指令
- 🧩 **组件化** - LocaleSwitcher 组件
- 🌐 **完整功能** - 翻译、复数化、日期/数字格式化等
- 💾 **智能缓存** - 继承自 @ldesign/i18n-core 的高性能缓存
- 📦 **模块化** - 支持 NgModule 和 Standalone Components

## 📦 安装

```bash
# npm
npm install @ldesign/i18n-angular

# yarn
yarn add @ldesign/i18n-angular

# pnpm
pnpm add @ldesign/i18n-angular
```

## 🚀 快速开始

### 使用 NgModule

```typescript
// app.module.ts
import { NgModule } from '@angular/core'
import { BrowserModule } from '@angular/platform-browser'
import { I18nModule } from '@ldesign/i18n-angular'
import { AppComponent } from './app.component'

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    I18nModule.forRoot({
      locale: 'zh-CN',
      fallbackLocale: 'en',
      messages: {
        'zh-CN': {
          hello: '你好',
          welcome: '欢迎 {name}！'
        },
        'en': {
          hello: 'Hello',
          welcome: 'Welcome {name}!'
        }
      }
    })
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
```

### 使用 Standalone Components

```typescript
// main.ts
import { bootstrapApplication } from '@angular/platform-browser'
import { I18nService } from '@ldesign/i18n-angular'
import { AppComponent } from './app.component'

bootstrapApplication(AppComponent, {
  providers: [
    I18nService,
    {
      provide: 'I18N_CONFIG',
      useValue: {
        locale: 'zh-CN',
        messages: { /* ... */ }
      }
    }
  ]
})
```

### 基础用法

```typescript
// app.component.ts
import { Component } from '@angular/core'
import { I18nService } from '@ldesign/i18n-angular'

@Component({
  selector: 'app-root',
  template: `
    <div>
      <!-- 使用 Service -->
      <h1>{{ i18n.t('hello') }}</h1>

      <!-- 使用 Pipe -->
      <p>{{ 'welcome' | translate: { name: 'Angular' } }}</p>

      <!-- 使用 Directive -->
      <div i18nTranslate="hello"></div>

      <!-- 语言切换 -->
      <button (click)="i18n.setLocale('en')">English</button>
      <button (click)="i18n.setLocale('zh-CN')">中文</button>
    </div>
  `
})
export class AppComponent {
  constructor(public i18n: I18nService) {}
}
```

## 📚 API 文档

### I18nService

主要的 Angular service，提供完整的 i18n 功能。

```typescript
constructor(private i18nService: I18nService) {}
```

#### 属性

- `locale: Locale` - 当前语言
- `fallbackLocale: Locale | Locale[]` - 回退语言
- `messages: Record<string, any>` - 当前消息
- `availableLocales: Locale[]` - 可用语言列表

#### Observable 属性

- `locale$: Observable<Locale>` - 当前语言（Observable）
- `messages$: Observable<Record<string, any>>` - 当前消息（Observable）
- `availableLocales$: Observable<Locale[]>` - 可用语言列表（Observable）

#### 翻译方法

- `t(key, params?)` - 翻译函数
- `te(key, locale?)` - 检查翻译键是否存在
- `tm(key)` - 获取原始消息
- `rt(message, params?)` - 插值原始消息
- `t$(key, params?)` - 翻译函数（Observable）

#### 复数化

- `tc(key, count, params?)` - 复数化翻译
- `tp(key, count, params?)` - tc 的别名

#### 格式化

- `d(value, format?)` - 日期格式化
- `n(value, format?)` - 数字格式化

#### 语言管理

- `setLocale(locale)` - 设置语言
- `getLocale()` - 获取当前语言
- `setFallbackLocale(locale)` - 设置回退语言
- `getFallbackLocale()` - 获取回退语言
- `getLocale$()` - 获取语言（Observable）

#### 消息管理

- `mergeLocaleMessage(locale, messages)` - 合并消息
- `getLocaleMessage(locale)` - 获取指定语言的消息
- `setLocaleMessage(locale, messages)` - 设置指定语言的消息
- `getMessages$()` - 获取消息（Observable）

### Pipes

#### TranslatePipe

翻译管道。

```html
<h1>{{ 'hello' | translate }}</h1>
<p>{{ 'welcome' | translate: { name: 'User' } }}</p>
```

#### I18nDatePipe

日期格式化管道。

```html
<p>{{ today | i18nDate }}</p>
<p>{{ today | i18nDate: 'long' }}</p>
```

#### I18nNumberPipe

数字格式化管道。

```html
<p>{{ 1234.56 | i18nNumber }}</p>
<p>{{ 99.99 | i18nNumber: 'currency' }}</p>
<p>{{ 0.85 | i18nNumber: 'percent' }}</p>
```

#### PluralPipe

复数化管道。

```html
<p>{{ 'items' | plural: 5 }}</p>
<p>{{ 'books' | plural: count: { author: 'John' } }}</p>
```

### Directives

#### TranslateDirective

翻译指令。

```html
<div i18nTranslate="hello"></div>
<div [i18nTranslate]="'welcome'" [i18nTranslateParams]="{ name: 'User' }"></div>
```

**输入属性**:
- `i18nTranslate: string` - 翻译键
- `i18nTranslateParams?: InterpolationParams` - 插值参数

### Components

#### LocaleSwitcherComponent

语言切换器组件（Standalone）。

```html
<ldesign-locale-switcher></ldesign-locale-switcher>
<ldesign-locale-switcher 
  [locales]="['zh-CN', 'en']" 
  [labels]="{ 'zh-CN': '中文', 'en': 'English' }">
</ldesign-locale-switcher>
```

**输入属性**:
- `locales?: Locale[]` - 自定义语言列表
- `labels?: Record<Locale, string>` - 自定义语言标签

## 🎯 高级用法

### 使用 RxJS Observables

```typescript
import { Component } from '@angular/core'
import { I18nService } from '@ldesign/i18n-angular'

@Component({
  selector: 'app-root',
  template: `
    <div>
      <p>Current locale: {{ locale$ | async }}</p>
      <p>{{ translation$ | async }}</p>
    </div>
  `
})
export class AppComponent {
  locale$ = this.i18nService.locale$
  translation$ = this.i18nService.t$('hello')

  constructor(private i18nService: I18nService) {}
}
```

### 动态加载语言包

```typescript
import { Component, OnInit } from '@angular/core'
import { I18nService } from '@ldesign/i18n-angular'

@Component({
  selector: 'app-root',
  template: '...'
})
export class AppComponent implements OnInit {
  constructor(private i18nService: I18nService) {}

  async ngOnInit() {
    // 动态加载语言包
    const messages = await fetch('/locales/zh-CN.json').then(r => r.json())
    this.i18nService.mergeLocaleMessage('zh-CN', messages)
    await this.i18nService.setLocale('zh-CN')
  }
}
```

### 使用命名空间

```typescript
@Component({
  selector: 'app-user',
  template: `
    <h1>{{ i18n.t('user.profile.title') }}</h1>
    <p>{{ i18n.t('user.settings.description') }}</p>
  `
})
export class UserComponent {
  constructor(public i18n: I18nService) {}
}
```

### Standalone Components 使用

```typescript
import { Component } from '@angular/core'
import { CommonModule } from '@angular/common'
import { TranslatePipe, I18nService } from '@ldesign/i18n-angular'

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  template: `
    <h1>{{ 'hello' | translate }}</h1>
  `
})
export class AppComponent {
  constructor(private i18nService: I18nService) {}
}
```

## 🎨 完整示例

### 模块模式

```typescript
// app.module.ts
import { NgModule } from '@angular/core'
import { BrowserModule } from '@angular/platform-browser'
import { I18nModule } from '@ldesign/i18n-angular'
import { AppComponent } from './app.component'

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    I18nModule.forRoot({
      locale: 'zh-CN',
      fallbackLocale: 'en',
      messages: {
        'zh-CN': {
          app: {
            title: '我的应用',
            welcome: '欢迎 {name}！'
          },
          items: '个项目 | 个项目'
        },
        'en': {
          app: {
            title: 'My App',
            welcome: 'Welcome {name}!'
          },
          items: 'item | items'
        }
      }
    })
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
```

```typescript
// app.component.ts
import { Component } from '@angular/core'
import { I18nService } from '@ldesign/i18n-angular'

@Component({
  selector: 'app-root',
  template: `
    <div class="app">
      <!-- 使用 Service -->
      <h1>{{ i18n.t('app.title') }}</h1>

      <!-- 使用 Pipe -->
      <p>{{ 'app.welcome' | translate: { name: userName } }}</p>

      <!-- 使用 Directive -->
      <div i18nTranslate="app.title"></div>

      <!-- 复数化 -->
      <p>{{ 'items' | plural: itemCount }}</p>

      <!-- 日期和数字格式化 -->
      <p>{{ today | i18nDate: 'long' }}</p>
      <p>{{ price | i18nNumber: 'currency' }}</p>

      <!-- 语言切换器 -->
      <ldesign-locale-switcher></ldesign-locale-switcher>

      <!-- 手动切换 -->
      <button (click)="i18n.setLocale('en')">English</button>
      <button (click)="i18n.setLocale('zh-CN')">中文</button>

      <!-- 响应式 -->
      <p>Current: {{ i18n.locale$ | async }}</p>
    </div>
  `
})
export class AppComponent {
  userName = 'Angular'
  itemCount = 5
  today = new Date()
  price = 99.99

  constructor(public i18n: I18nService) {}
}
```

### Standalone 模式

```typescript
// main.ts
import { bootstrapApplication } from '@angular/platform-browser'
import { importProvidersFrom } from '@angular/core'
import { I18nModule } from '@ldesign/i18n-angular'
import { AppComponent } from './app.component'

bootstrapApplication(AppComponent, {
  providers: [
    importProvidersFrom(
      I18nModule.forRoot({
        locale: 'zh-CN',
        messages: { /* ... */ }
      })
    )
  ]
})
```

```typescript
// app.component.ts (standalone)
import { Component } from '@angular/core'
import { CommonModule } from '@angular/common'
import { TranslatePipe, LocaleSwitcherComponent } from '@ldesign/i18n-angular'

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, TranslatePipe, LocaleSwitcherComponent],
  template: `
    <h1>{{ 'hello' | translate }}</h1>
    <ldesign-locale-switcher></ldesign-locale-switcher>
  `
})
export class AppComponent {}
```

## 📝 示例

查看 `examples/` 目录获取更多示例。

## 🔗 相关链接

- [@ldesign/i18n-core](../core) - 核心库
- [@ldesign/i18n-vue](../vue) - Vue 集成
- [@ldesign/i18n-react](../react) - React 集成
- [@ldesign/i18n-svelte](../svelte) - Svelte 集成
- [@ldesign/i18n-solid](../solid) - Solid.js 集成
- [Angular 官方文档](https://angular.io/)

## 📄 许可证

[MIT](../../LICENSE) © 2024 LDesign Team

## 🤝 贡献

欢迎贡献代码！请查看主仓库的贡献指南。

---

<div align="center">
  <sub>Built with ❤️ by <a href="https://github.com/ldesign">LDesign Team</a></sub>
</div>

