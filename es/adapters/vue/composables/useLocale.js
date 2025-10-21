/*!
 * ***********************************
 * @ldesign/i18n v3.0.0            *
 * Built with rollup               *
 * Build time: 2024-10-21 14:33:23 *
 * Build mode: production          *
 * Minified: No                    *
 * ***********************************
 */
import { ref } from 'vue';
import { useI18n } from './useI18n.js';

function useLocale() {
  const {
    locale,
    availableLocales,
    setLocale
  } = useI18n();
  const isCurrentLocale = (checkLocale) => {
    return locale?.value === checkLocale;
  };
  return {
    locale: locale || ref("en_us"),
    availableLocales,
    setLocale,
    isCurrentLocale
  };
}

export { useLocale };
/*! End of @ldesign/i18n | Powered by @ldesign/builder */
//# sourceMappingURL=useLocale.js.map
