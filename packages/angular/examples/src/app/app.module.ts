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
          welcome: '欢迎 {name}！',
          items: '个项目 | 个项目',
          about: '关于',
          features: {
            title: '功能特性',
            services: 'Angular Services',
            pipes: 'Pipes 管道',
            directives: '指令支持',
            rxjs: 'RxJS 集成'
          }
        },
        'en': {
          hello: 'Hello',
          welcome: 'Welcome {name}!',
          items: 'item | items',
          about: 'About',
          features: {
            title: 'Features',
            services: 'Angular Services',
            pipes: 'Pipes',
            directives: 'Directive Support',
            rxjs: 'RxJS Integration'
          }
        },
        'ja': {
          hello: 'こんにちは',
          welcome: 'ようこそ {name}！',
          items: 'アイテム | アイテム',
          about: '私たちについて',
          features: {
            title: '機能',
            services: 'Angular サービス',
            pipes: 'パイプ',
            directives: 'ディレクティブサポート',
            rxjs: 'RxJS 統合'
          }
        }
      }
    })
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }

