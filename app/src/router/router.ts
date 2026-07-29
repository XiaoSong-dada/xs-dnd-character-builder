import { createRouter, createWebHistory } from 'vue-router'

import MainLayout from '@/layout/MainLayout.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: MainLayout,
      children: [
        {
          path: '',
          redirect: { name: 'character-builder' },
        },
        {
          path: 'character-builder',
          name: 'character-builder',
          component: () => import('@/views/character-builder/index.vue'),
          meta: {
            title: '辅助车卡 | D&D车卡辅助',
          },
        },
        {
          path: 'classes',
          name: 'classes',
          component: () => import('@/views/classes/index.vue'),
          meta: {
            title: '职业介绍 | D&D车卡辅助',
          },
        },
        {
          path: 'dice',
          name: 'dice',
          component: () => import('@/views/dice/index.vue'),
          meta: {
            title: '赛博骰子 | D&D车卡辅助',
          },
        },
        {
          path: 'profile',
          name: 'profile',
          component: () => import('@/views/profile/index.vue'),
          meta: {
            title: '个人中心 | D&D车卡辅助',
          },
        },
      ],
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('@/views/not-found/index.vue'),
      meta: {
        title: '页面不存在 | D&D车卡辅助',
      },
    },
  ],
})

router.afterEach((to) => {
  document.title = to.meta.title ?? 'D&D车卡辅助'
})

export default router
