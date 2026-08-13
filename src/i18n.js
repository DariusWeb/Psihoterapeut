import { createI18n } from 'vue-i18n';
import en from './locales/en.json';
import ro from './locales/ro.json';

export default createI18n({
  legacy: false, // Set to false to use Composition API
  locale: 'en', // set locale
  fallbackLocale: 'en', // set fallback locale
  missingWarn: false, // RO is a sparse overlay; every missing key would warn
  fallbackWarn: false,
  messages: {
    en,
    ro
  }
});
