<script lang="ts">
  import type { InterpolationParams } from '@ldesign/i18n-core'
  import { getI18nContext } from '../utils/context'

  /**
   * Translation key
   */
  export let keypath: string

  /**
   * Interpolation parameters
   */
  export let params: InterpolationParams | undefined = undefined

  /**
   * Locale override
   */
  export let locale: string | undefined = undefined

  /**
   * Tag name for wrapper element
   */
  export let tag: string = 'span'

  // Get i18n from context
  const i18n = getI18nContext()

  // Reactive translation
  $: translatedText = i18n.t(keypath, { params, locale })
</script>

<svelte:element this={tag}>
  {translatedText}
</svelte:element>

