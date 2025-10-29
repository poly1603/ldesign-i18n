<script lang="ts">
  import { getContext } from 'svelte'
  import type { I18nStore } from '../stores'

  export let className: string = ''

  const i18n = getContext<I18nStore>('i18n')
  
  $: currentLocale = i18n?.getLocale() || 'en'
  $: supportedLocales = i18n?.getSupportedLocales() || []

  async function handleChange(event: Event) {
    const target = event.target as HTMLSelectElement
    const newLocale = target.value
    if (i18n) {
      await i18n.setLocale(newLocale)
    }
  }
</script>

<select class={className} value={currentLocale} on:change={handleChange}>
  {#each supportedLocales as locale}
    <option value={locale}>{locale}</option>
  {/each}
</select>
