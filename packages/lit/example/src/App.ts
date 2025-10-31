import { LitElement, html, css } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import { i18n } from './i18n'

@customElement('app-root')
export class App extends LitElement {
  static styles = css`
    :host {
      display: block;
      padding: 2rem;
      font-family: system-ui, sans-serif;
    }

    .section {
      margin-top: 2rem;
    }

    button {
      margin-left: 1rem;
    }

    button:first-child {
      margin-left: 0;
    }
  `

  @property({ type: Number })
  private count = 0

  @property({ type: String })
  private locale = i18n.locale

  private toggleLanguage() {
    const currentLocale = i18n.locale
    i18n.setLocale(currentLocale === 'en' ? 'zh' : 'en')
    this.locale = i18n.locale
  }

  render() {
    return html`
      <h1>${i18n.t('welcome')}</h1>
      <p>${i18n.t('description')}</p>
      
      <div class="section">
        <button @click=${this.toggleLanguage}>
          ${i18n.t('switchLanguage')}
        </button>
        <span>Current: ${this.locale}</span>
      </div>

      <div class="section">
        <h2>${i18n.t('counter')}: ${this.count}</h2>
        <button @click=${() => this.count++}>
          ${i18n.t('increment')}
        </button>
        <button @click=${() => this.count--}>
          ${i18n.t('decrement')}
        </button>
      </div>
    `
  }
}
