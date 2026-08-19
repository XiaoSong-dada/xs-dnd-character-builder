import { createPinia } from 'pinia'
import { ViteSSG } from 'vite-ssg'

import App from '@/App.vue'
import { applySeoMeta } from '@/router/seo'
import { routes } from '@/router/router'
import { initializeUmami } from '@/services/umami'
import '@/styles/index.scss'

export const createApp = ViteSSG(
  App,
  { routes },
  (context) => {
    context.app.use(createPinia())
    context.router.afterEach((to) => {
      applySeoMeta(to)
    })
  },
)

// 浏览器端初始化统计；vite-ssg 构建期（Node 无 document）由守卫安全跳过
initializeUmami()
