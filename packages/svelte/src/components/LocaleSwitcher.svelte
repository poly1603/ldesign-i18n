<script lang="ts">
  import type { Locale } from '@ldesign/i18n-core'
  import { getI18nContext } from '../utils/context'

  /**
   * Custom locales to display (optional)
   */
  export let locales: Locale[] | undefined = undefined

  /**
   * Custom labels for locales
   */
  export let labels: Record<Locale, string> | undefined = undefined

  // Get i18n from context
  const i18n = getI18nContext()

  // Get available locales
  $: availableLocales = locales || $i18n.availableLocales

  // Get current locale
  $: currentLocale = $i18n.locale

  // Handle locale change
  async function handleChange(event: Event) {
    const target = event.target as HTMLSelectElement
    const newLocale = target.value as Locale
    await i18n.setLocale(newLocale)
  }

  // Get label for locale
  function getLabel(locale: Locale): string {
    if (labels && labels[locale]) {
      return labels[locale]
    }
    return locale
  }
</script>

<select value={$currentLocale} on:change={handleChange}>
  {#each availableLocales as locale}
    <option value={locale}>{getLabel(locale)}</option>
  {/each}
</select>

