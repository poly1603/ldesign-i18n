/*!
 * ***********************************
 * @ldesign/i18n v3.0.0            *
 * Built with rollup               *
 * Build time: 2024-10-21 14:33:23 *
 * Build mode: production          *
 * Minified: No                    *
 * ***********************************
 */
import { computed } from 'vue';
import { useI18n } from './useI18n.js';

function useTranslation(namespace) {
  const {
    t,
    tc,
    te,
    locale
  } = useI18n({
    namespace
  });
  const ready = computed(() => locale.value !== void 0);
  return {
    t,
    tc,
    te,
    locale: locale.value,
    ready: ready.value
  };
}

export { useTranslation };
/*! End of @ldesign/i18n | Powered by @ldesign/builder */
//# sourceMappingURL=useTranslation.js.map
