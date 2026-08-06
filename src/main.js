import '@fontsource-variable/mulish/wght.css'
import '@fontsource-variable/mulish/wght-italic.css'
import '@fontsource/libre-baskerville/400.css'
import '@fontsource/libre-baskerville/700.css'
import '@fontsource/libre-baskerville/400-italic.css'

import '@/assets/main.scss'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import i18n from './i18n'
import { initUiState } from '@/utils/uiState'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(i18n)

app.mount('#app')
initUiState()
