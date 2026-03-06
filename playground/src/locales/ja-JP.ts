export default {
  app: {
    title: '@ldesign/i18n デモ',
    subtitle: '高性能でモダンな国際化ソリューション',
    nav: { core: 'Core (素の JS)', engine: 'Engine Vue モード', vue: 'ネイティブ Vue モード' },
    footer: '@ldesign/i18n による提供',
  },

  common: {
    language: '言語',
    switchLanguage: '言語を切り替え',
    currentLocale: '現在の言語：{{locale}}',
    confirm: '確認',
    cancel: 'キャンセル',
    save: '保存',
    delete: '削除',
    edit: '編集',
    loading: '読み込み中...',
    noData: 'データなし',
    success: '成功',
    error: 'エラー',
    reset: 'リセット',
    submit: '送信',
  },

  demo: {
    basic: {
      title: '基本翻訳',
      description: 't() 関数で基本的な翻訳を行います',
      hello: 'こんにちは、世界！',
      welcome: 'LDesign I18n へようこそ',
      greeting: 'こんにちは、{{name}}さん！',
      greetingWithRole: '{{name}}さん（{{role}}）、お帰りなさい',
    },
    interpolation: {
      title: '変数補間',
      description: '{{variable}} 構文で変数を補間します',
      message: '{{user}} が {{time}} にメッセージを送信しました',
      nested: '注文 #{{orderId}} には {{count}} 個の商品が含まれ、合計 {{total}} です',
      withHtml: '詳細は <a href="{{url}}">こちら</a> をご覧ください',
    },
    plural: {
      title: '複数形',
      description: 'tc() / plural() 関数で複数形を処理します',
      item: '0:アイテムなし|other:{{count}} 個のアイテム',
      apple: '0:りんごなし|other:{{count}} 個のりんご',
      message: '0:メッセージなし|other:{{count}} 件の新着メッセージ',
      file: '0:ファイルなし|other:{{count}} 個のファイル',
    },
    dateTime: {
      title: '日付と時刻のフォーマット',
      description: 'date() / d() 関数で日付をフォーマットします',
      now: '現在時刻',
      today: '今日',
    },
    number: {
      title: '数値と通貨のフォーマット',
      description: 'number() / currency() / n() 関数でフォーマットします',
      price: '価格',
      quantity: '数量',
      total: '合計',
      percentage: 'パーセント',
      compact: 'コンパクト形式',
      fileSize: 'ファイルサイズ',
    },
    directive: {
      title: 'v-t ディレクティブ',
      description: 'v-t ディレクティブでテキストコンテンツを設定します',
      simpleText: 'このテキストは v-t ディレクティブで翻訳されました',
      withParams: 'こんにちは、{{name}}さん！今日は {{day}} です',
    },
    htmlDirective: {
      title: 'v-t-html ディレクティブ',
      description: 'v-t-html で HTML コンテンツを設定します（リッチテキスト対応）',
      richText: 'これは<b>太字</b>と<em>斜体</em>のテキストです',
      withLink: '詳細は <a href="https://github.com" target="_blank">GitHub</a> をご覧ください',
    },
    pluralDirective: {
      title: 'v-t-plural ディレクティブ',
      description: 'v-t-plural ディレクティブで複数形翻訳を行います',
    },
    tooltipDirective: {
      title: 'v-t-tooltip ディレクティブ',
      description: '翻訳テキストを表示し、ホバーで翻訳キーを表示（デバッグ用）',
      hoverMe: 'ホバーで翻訳キー情報を表示',
    },
    component: {
      title: '翻訳コンポーネント',
      description: 'I18nText / I18nTranslate コンポーネントを使用します',
      textExample: 'I18nText コンポーネントでレンダリングされました',
      translateExample: 'I18nTranslate コンポーネントでレンダリングされました',
    },
    provider: {
      title: 'I18nProvider コンポーネント',
      description: '子コンポーネントに独立した i18n インスタンスコンテキストを提供',
    },
    scope: {
      title: 'スコープ翻訳 (useI18nScope)',
      description: 'useI18nScope で名前空間付き翻訳を行います',
    },
    format: {
      title: 'フォーマットユーティリティ (useI18nFormat)',
      description: '数値、通貨、パーセント、日付、相対時間、リスト、ファイルサイズのフォーマット',
    },
    validation: {
      title: 'フォームバリデーション (useI18nValidation)',
      description: '組み込みバリデーションルール、エラーメッセージ自動国際化',
      enterEmail: 'メールアドレスを入力',
      enterName: '名前を入力',
      enterAge: '年齢を入力',
    },
    meta: {
      title: 'SEO メタデータ (useI18nMeta)',
      description: 'ページタイトル、説明、OG タグを自動管理',
      pageTitle: 'I18n Playground - 国際化デモ',
      pageDescription: '@ldesign/i18n の多言語機能を紹介する総合デモページ',
    },
    route: {
      title: 'ルート国際化 (useI18nRoute)',
      description: 'ルートパスに言語プレフィックスを追加、複数の戦略をサポート',
    },
    async: {
      title: '非同期読み込み (useI18nAsync)',
      description: '言語パックをオンデマンドで非同期読み込み',
    },
    performance: {
      title: 'パフォーマンス監視 (useI18nPerformance)',
      description: '翻訳パフォーマンス、キャッシュヒット率、メモリ使用量を監視',
    },
    core: {
      title: 'Core 用法（フレームワーク非依存）',
      subtitle: '@ldesign/i18n-core は Vue に依存せず、あらゆる JS/TS 環境で使用可能',
    },
    dateDirective: {
      title: 'v-t-date 日付フォーマットディレクティブ',
      description: 'テンプレートで直接日付をフォーマット、言語切り替えに自動追従',
    },
    numberDirective: {
      title: 'v-t-number 数値フォーマットディレクティブ',
      description: 'テンプレートで数値・通貨・パーセントをフォーマット、言語切り替えに自動追従',
    },
    numberComponent: {
      title: 'I18nNumber 数値フォーマットコンポーネント',
      description: '宣言的な数値フォーマット、通常数値・通貨・パーセント・コンパクト形式対応',
    },
    datetimeComponent: {
      title: 'I18nDatetime 日付フォーマットコンポーネント',
      description: '宣言的な日付フォーマット、日付・時刻・日時・相対時間対応',
    },
    missingKeys: {
      title: '翻訳キー欠落検出 (useI18nMissingKeys)',
      description: '開発デバッグツール、リアルタイムで欠落した翻訳キーを収集',
      triggerMissing: '欠落キーをトリガー',
      clearAll: 'すべてクリア',
      noMissing: '欠落した翻訳キーはありません',
      total: '{{count}} 個の欠落キー',
    },
    // CoreDemo
    formatting: {
      description: 'date() / number() / currency() / relativeTime() — Intl API ベース、locale に自動追従',
    },
    exists: {
      description: '翻訳キーの存在を確認し、フォールバックキー名の表示を防止',
    },
    localeManagement: {
      title: 'getAvailableLocales() / setLocale()',
      description: '利用可能な言語一覧を取得し、動的に言語を切り替え',
    },
    dynamicMessages: {
      title: 'mergeMessages() / addLocale()',
      description: '実行時に翻訳メッセージを動的にマージまたは追加',
      mergeButton: '{{locale}} にマージ',
      mergeSuccess: '✓ マージ成功！',
      invalidJSON: '✗ 無効な JSON',
    },
    events: {
      title: "on('localeChanged') / on('missingKey')",
      description: '言語変更と翻訳キー欠落イベントをリッスン',
      triggerMissing: '欠落キーをトリガー',
      noEvents: 'イベントはまだありません。言語切り替えまたは欠落キーのトリガーを試してください。',
    },
    enginePlugin: {
      title: 'Engine プラグイン & 永続化設定',
      description: 'createI18nEnginePlugin で Engine プラグインを作成、自動永続化とコールバックをサポート',
    },
    translationExists: {
      title: 'te() — 翻訳キー検出',
      description: '翻訳キーが存在するか確認',
      descriptionConditional: '翻訳キーが存在するか確認し、条件付きレンダリングに使用',
      exists: '✓ 存在',
      missing: '✗ 欠落',
    },
    validationStatus: {
      valid: '✓ 有効',
    },
    // VueDemo
    compositionApi: {
      title: 'useI18n() — Composition API',
      description: '翻訳、複数形、日付、数値フォーマット、メッセージ管理を含む完全な Composition API',
    },
    useLocale: {
      title: 'useLocale()',
      description: '言語管理 composable、言語状態と切り替え機能を提供',
    },
    useTranslation: {
      title: 'useTranslation(namespace)',
      description: '名前空間を内蔵したシンプルな翻訳フック（react-i18next の useTranslation に類似）',
    },
    useI18nScope: {
      title: 'useI18nScope(scope)',
      description: 'コンポーネントレベルのスコープ翻訳、gt() グローバルフォールバック対応',
    },
    dynamicTranslation: {
      title: '動的翻訳',
      description: '翻訳キーを入力してリアルタイムで結果を取得',
      placeholder: '翻訳キーを入力...',
      translateButton: '翻訳',
    },
    mergeLocaleMessage: {
      title: 'mergeLocaleMessage()',
      description: '実行時に現在の言語に新しい翻訳メッセージを動的にマージ',
    },
    setLocaleMessage: {
      title: 'setLocaleMessage() / getLocaleMessage()',
      description: '指定言語のメッセージオブジェクト全体を置換、または現在のメッセージを取得して変更',
      replacePath: '置換パス：{{path}}',
      replaceButton: '置換',
      replaceSuccess: '✓ 置換成功！下の aboutScope を確認してください。',
      error: '✗ エラー',
    },
    globalProperties: {
      title: '$t / $i18n グローバルプロパティ',
      description: 'テンプレートで $t グローバルプロパティを直接使用（Options API / テンプレート使用）',
    },
  },

  pages: {
    home: {
      title: 'ホーム',
      description: 'ホームページの説明です',
      welcome: 'お帰りなさい、{{name}}さん！',
    },
    settings: {
      title: '設定',
      description: '設定を管理します',
      theme: 'テーマ',
      language: '言語',
      notifications: '通知',
    },
    about: {
      title: 'について',
      description: '詳細情報',
      version: 'バージョン {{version}}',
    },
  },

  validation: {
    required: 'この項目は必須です',
    email: '有効なメールアドレスを入力してください',
    min: '値は {{min}} 以上でなければなりません',
    max: '値は {{max}} 以下でなければなりません',
    minLength: '{{length}} 文字以上で入力してください',
    maxLength: '{{length}} 文字以内で入力してください',
    numeric: '数字を入力してください',
    url: '有効な URL を入力してください',
    phone: '有効な電話番号を入力してください',
    pattern: '形式が正しくありません',
  },

  mode: {
    core: {
      title: 'Core (素の JS)',
      description: '純粋な @ldesign/i18n-core、Node.js、ブラウザ、Web Worker など、あらゆる JS 環境で使用可能',
    },
    engine: {
      title: 'Engine Vue モード',
      description: '@ldesign/engine-vue3 の VueEngine で駆動、createI18nEnginePlugin で統合',
      features: [
        'Engine ライフサイクルに自動統合',
        'localStorage に言語設定を永続化',
        'Engine イベントシステムで言語変更をブロードキャスト',
        'Engine 状態管理統合',
        'onReady / onLocaleChange コールバックサポート',
      ],
    },
    vue: {
      title: 'ネイティブ Vue モード',
      description: 'createI18nPlugin を直接使用して Vue アプリにインストール、Engine 不要',
      features: [
        '軽量、Engine 依存なし',
        'app.use() でインストール',
        '$t / $i18n グローバルプロパティを提供',
        'すべての composables をサポート',
        'スタンドアロン Vue プロジェクトに最適',
      ],
    },
  },
}
