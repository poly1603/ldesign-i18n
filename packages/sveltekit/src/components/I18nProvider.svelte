<script lang="ts">
  import { setContext } from 'svelte'
  import type { I18nStore } from '../stores'

  export let i18n: I18nStore

  setContext('i18n', i18n)
</script>

<slot />
