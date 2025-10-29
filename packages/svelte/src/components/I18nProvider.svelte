<script lang="ts">
  import type { I18nStore } from '../stores/createI18n'
  import { setI18nContext } from '../utils/context'

  /**
   * I18n store instance
   */
  export let i18n: I18nStore

  // Set i18n in context so child components can access it
  setI18nContext(i18n)
</script>

<slot />

