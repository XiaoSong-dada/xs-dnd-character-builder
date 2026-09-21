import { createPinia } from 'pinia'
import { ViteSSG } from 'vite-ssg'

import App from '@/App.vue'
import { baseUrl } from '@/config/site'
import { applySeoMeta } from '@/router/seo'
import { routes } from '@/router/router'
import { initializeUmami } from '@/services/umami'
import '@/styles/index.scss'

export const createApp = ViteSSG(
  App,
  // base 必须显式传入：不传时 vue-router 会退回去读页面里的 <base href>，
  // 子路径部署下地址栏前缀与 <base> 一旦不一致，所有深链接都会落进 404 兜底路由。
  { routes, base: baseUrl },
  (context) => {
    context.app.use(createPinia())
    context.router.afterEach((to) => {
      applySeoMeta(to)
    })
  },
)

// 浏览器端初始化统计；vite-ssg 构建期（Node 无 document）由守卫安全跳过
initializeUmami()
