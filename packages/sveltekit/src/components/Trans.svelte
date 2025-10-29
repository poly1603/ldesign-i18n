<script lang="ts">
  import { getContext } from 'svelte'
  import type { I18nStore } from '../stores'

  export let key: string
  export let params: Record<string, any> = {}
  export let fallback: string = key

  const i18n = getContext<I18nStore>('i18n')
  
  $: text = i18n ? i18n.t(key, params) : fallback
</script>

{text}
