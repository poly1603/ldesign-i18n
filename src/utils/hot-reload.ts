/**
 * @ldesign/i18n - Hot Module Reload for Translations
 * Development feature for live translation updates
 */

import type { I18nInstance, Locale, Messages } from '../types'

/**
 * File watcher interface
 */
export interface FileWatcher {
  watch: (pattern: string, callback: (file: string) => void) => void
  unwatch: () => void
}

/**
 * Hot reload configuration
 */
export interface HotReloadConfig {
  enabled?: boolean
  patterns?: string[]
  debounceTime?: number
  onReload?: (locale: Locale, messages: Messages) => void
  onError?: (error: Error) => void
}

/**
 * Hot Reload Manager
 * Watches translation files and reloads them on change
 */
export class HotReloadManager {
  private readonly config: Required<HotReloadConfig>
  private i18n?: I18nInstance
  private watchers: FileWatcher[] = []
  private reloadTimers = new Map<string, NodeJS.Timeout>()
  private isDestroyed = false

  constructor(config: HotReloadConfig = {}) {
    this.config = {
      enabled: config.enabled !== false && (
        typeof process !== 'undefined' && process.env.NODE_ENV === 'development'
      ),
      patterns: config.patterns || [],
      debounceTime: config.debounceTime || 300,
      onReload: config.onReload || (() => { }),
      onError: config.onError || (error => console.error('[HotReload] Error:', error)),
    }
  }

  /**
   * Attach to i18n instance
   */
  attach(i18n: I18nInstance): void {
    if (!this.config.enabled)
      return

    this.i18n = i18n
  }

  /**
   * Watch translation files (Node.js environment)
   */
  watchFiles(baseDir: string): void {
    if (!this.config.enabled || typeof require === 'undefined') {
      return
    }

    try {
      // Only available in Node.js
      const fs = require('node:fs')
      const path = require('node:path')

      // Watch directory for changes
      const watcher = fs.watch(baseDir, { recursive: true }, (eventType: string, filename: string) => {
        if (this.isDestroyed || !filename)
          return

        // Only process JSON files
        if (!filename.endsWith('.json'))
          return

        // Debounce reload
        this.debounceReload(filename, () => {
          this.reloadFile(path.join(baseDir, filename))
        })
      })

      this.watchers.push({
        watch: () => { },
        unwatch: () => watcher.close(),
      })

      console.log(`[HotReload] Watching ${baseDir} for translation changes`)
    }
    catch (error) {
      this.config.onError(error as Error)
    }
  }

  /**
   * Watch using custom watcher
   */
  watchWith(watcher: FileWatcher, pattern: string): void {
    if (!this.config.enabled)
      return

    watcher.watch(pattern, (file) => {
      if (this.isDestroyed)
        return

      this.debounceReload(file, () => {
        this.reloadFile(file)
      })
    })

    this.watchers.push(watcher)
  }

  /**
   * Reload a translation file
   */
  private async reloadFile(filepath: string): Promise<void> {
    if (!this.i18n || this.isDestroyed)
      return

    try {
      const fs = require('node:fs')
      const path = require('node:path')

      // Extract locale from filename
      const filename = path.basename(filepath, '.json')
      const locale = this.extractLocale(filename)

      if (!locale) {
        console.warn(`[HotReload] Could not extract locale from ${filepath}`)
        return
      }

      // Read and parse file
      const content = await fs.promises.readFile(filepath, 'utf-8')
      const messages = JSON.parse(content)

      // Update i18n
      this.i18n.setMessages(locale, messages)

      // Clear cache to force reload
      if ('clearPerformanceCaches' in this.i18n) {
        (this.i18n as any).clearPerformanceCaches()
      }

      console.log(`[HotReload] ✅ Reloaded translations for locale: ${locale}`)

      // Call reload callback
      this.config.onReload(locale, messages)

      // Emit event if supported
      if ('emit' in this.i18n) {
        (this.i18n as any).emit('hotReload', { locale, filepath })
      }
    }
    catch (error) {
      this.config.onError(error as Error)
    }
  }

  /**
   * Extract locale from filename
   * Supports: en.json, en-US.json, translations.en.json, etc.
   */
  private extractLocale(filename: string): Locale | null {
    // Pattern: en.json or en-US.json
    const localePattern = /^([a-z]{2}(-[A-Z]{2})?)$/
    const match = filename.match(localePattern)
    if (match) {
      return match[1]
    }

    // Pattern: translations.en.json or messages.en-US.json
    const parts = filename.split('.')
    for (const part of parts) {
      const m = part.match(/^([a-z]{2}(-[A-Z]{2})?)$/)
      if (m) {
        return m[1]
      }
    }

    return null
  }

  /**
   * Debounce reload to avoid rapid successive reloads
   */
  private debounceReload(key: string, callback: () => void): void {
    // Clear existing timer
    const existing = this.reloadTimers.get(key)
    if (existing) {
      clearTimeout(existing)
    }

    // Set new timer
    const timer = setTimeout(() => {
      callback()
      this.reloadTimers.delete(key)
    }, this.config.debounceTime)

    this.reloadTimers.set(key, timer)
  }

  /**
   * Stop watching
   */
  stop(): void {
    // Clear all timers
    for (const timer of this.reloadTimers.values()) {
      clearTimeout(timer)
    }
    this.reloadTimers.clear()

    // Close all watchers
    for (const watcher of this.watchers) {
      try {
        watcher.unwatch()
      }
      catch (error) {
        console.error('[HotReload] Error closing watcher:', error)
      }
    }
    this.watchers = []
  }

  /**
   * Destroy hot reload manager
   */
  destroy(): void {
    this.isDestroyed = true
    this.stop()
    this.i18n = undefined
  }
}

/**
 * Create hot reload manager
 */
export function createHotReloadManager(config?: HotReloadConfig): HotReloadManager {
  return new HotReloadManager(config)
}

/**
 * Vite HMR integration helper
 */
export function viteHotReload(i18n: I18nInstance, acceptHMR: (deps: string[], callback: (modules: any[]) => void) => void): void {
  if (typeof process !== 'undefined' && process.env.NODE_ENV === 'development') {
    acceptHMR(['**/locales/**/*.json'], (modules) => {
      for (const mod of modules) {
        if (mod.default) {
          // Extract locale from module path
          const match = mod.path?.match(/\/locales\/([a-z]{2}(-[A-Z]{2})?)\.json$/)
          if (match) {
            const locale = match[1]
            i18n.setMessages(locale, mod.default)
            console.log(`[HMR] Reloaded locale: ${locale}`)
          }
        }
      }
    })
  }
}

/**
 * Webpack HMR integration helper
 */
export function webpackHotReload(i18n: I18nInstance, moduleHot: any): void {
  if (moduleHot && typeof process !== 'undefined' && process.env.NODE_ENV === 'development') {
    moduleHot.accept()

    // Watch for changes in locale files
    const localeContext = (require as any).context('../locales', true, /\.json$/)

    if (localeContext.hot) {
      localeContext.hot.accept(localeContext.id, () => {
        const newContext = (require as any).context('../locales', true, /\.json$/)

        newContext.keys().forEach((key: string) => {
          const match = key.match(/\/([a-z]{2}(-[A-Z]{2})?)\.json$/)
          if (match) {
            const locale = match[1]
            const messages = newContext(key)
            i18n.setMessages(locale, messages)
            console.log(`[HMR] Reloaded locale: ${locale}`)
          }
        })
      })
    }
  }
}
