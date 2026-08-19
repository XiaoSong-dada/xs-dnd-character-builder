import type { RouteRecordRaw } from 'vue-router'

import MainLayout from '@/layout/MainLayout.vue'

// 路由表：由 vite-ssg（构建期）与 ViteSSG 工厂（客户端）共同消费，不再维护模块级单例 router
export const routes: RouteRecordRaw[] = [
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
          description: '分步创建 D&D 5e 角色卡：属性、职业、种族、背景与装备自动计算和校验，新玩家也能轻松上手。',
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
          title: '赛博骰娘 | D&D车卡辅助',
          description: '在线 3D 骰子工具：d4、d6、d8、d10、d12、d20 与 d100 混合骰池，真实碰撞落定并自动合计结果。',
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
]
