import { createI18n } from 'vue-i18n';
import en from './locales/en.json';
import ro from './locales/ro.json';

export default createI18n({
  legacy: false,
  locale: 'en',
  fallbackLocale: 'en',
  missingWarn: false, // RO is a sparse overlay; every missing key would warn
  fallbackWarn: false,
  messages: {
    en,
    ro
  }
});
