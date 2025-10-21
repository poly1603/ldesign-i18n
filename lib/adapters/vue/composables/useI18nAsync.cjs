/*!
 * ***********************************
 * @ldesign/i18n v3.0.0            *
 * Built with rollup               *
 * Build time: 2024-10-21 14:33:23 *
 * Build mode: production          *
 * Minified: No                    *
 * ***********************************
 */
'use strict';

var vue = require('vue');
var useI18n = require('./useI18n.cjs');

function useI18nAsync(options = {}) {
  const {
    locale,
    mergeLocaleMessage
  } = useI18n.useI18n();
  const loading = vue.ref(false);
  const error = vue.ref(null);
  const ready = vue.ref(false);
  let abortController = null;
  const loadMessages = async (targetLocale) => {
    if (!options.loader) {
      console.warn("[useI18nAsync] No loader provided");
      return;
    }
    if (abortController) {
      abortController.abort();
    }
    abortController = new AbortController();
    loading.value = true;
    error.value = null;
    try {
      const messages = await options.loader(targetLocale);
      if (!abortController.signal.aborted) {
        mergeLocaleMessage(targetLocale, messages);
        ready.value = true;
      }
    } catch (err) {
      if (err?.name !== "AbortError") {
        error.value = err;
        console.error("[useI18nAsync] Failed to load messages:", err);
      }
    } finally {
      loading.value = false;
      abortController = null;
    }
  };
  vue.onMounted(() => {
    if (options.loadLocale) {
      const targetLocale = options.locale || locale.value;
      loadMessages(targetLocale);
    }
  });
  vue.onUnmounted(() => {
    if (abortController) {
      abortController.abort();
      abortController = null;
    }
  });
  return {
    loading,
    error,
    ready,
    loadMessages
  };
}

exports.useI18nAsync = useI18nAsync;
/*! End of @ldesign/i18n | Powered by @ldesign/builder */
//# sourceMappingURL=useI18nAsync.cjs.map
