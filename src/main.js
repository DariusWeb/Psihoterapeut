import '@fontsource-variable/mulish/wght.css'
import '@fontsource/libre-baskerville/400.css'
import '@fontsource/libre-baskerville/700.css'

import '@/assets/main.scss'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import i18n from './i18n'
import { initUiState } from '@/utils/uiState'
import { initRenderCapability } from '@/utils/renderCapability'
import { initAnalytics } from '@/services/analytics'
import { initLiveBanner } from '@/services/liveBanner'

initRenderCapability()

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(i18n)

app.mount('#app')
initUiState()
initAnalytics()
initLiveBanner()
