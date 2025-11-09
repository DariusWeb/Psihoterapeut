import { createI18n } from 'vue-i18n';
import en from './locales/en.json';
import ro from './locales/ro.json';

export default createI18n({
  legacy: false, // Set to false to use Composition API
  locale: 'en', // set locale
  fallbackLocale: 'en', // set fallback locale
  messages: {
    en,
    ro
  }
});
