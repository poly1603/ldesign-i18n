<script lang="ts">
  import { useI18n } from '@ldesign/i18n-sveltekit'
  import { i18n } from '../lib/i18n'
  
  const { t, locale, setLocale } = useI18n(i18n)
  let count = 0

  function toggleLanguage() {
    setLocale($locale === 'en' ? 'zh' : 'en')
  }
</script>

<div style="padding: 2rem; font-family: system-ui, sans-serif;">
  <h1>{$t('welcome')}</h1>
  <p>{$t('description')}</p>
  
  <div style="margin-top: 2rem;">
    <button on:click={toggleLanguage}>
      {$t('switchLanguage')}
    </button>
    <span style="margin-left: 1rem;">
      Current: {$locale}
    </span>
  </div>

  <div style="margin-top: 2rem;">
    <h2>{$t('counter')}: {count}</h2>
    <button on:click={() => count++}>
      {$t('increment')}
    </button>
    <button on:click={() => count--} style="margin-left: 1rem;">
      {$t('decrement')}
    </button>
  </div>
</div>
