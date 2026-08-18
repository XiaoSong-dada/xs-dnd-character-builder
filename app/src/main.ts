import { createPinia } from 'pinia'
import { createApp } from 'vue'

import App from '@/App.vue'
import router from '@/router/router'
import { initializeUmami } from '@/services/umami'
import '@/styles/index.scss'

createApp(App).use(createPinia()).use(router).mount('#app')
initializeUmami()
