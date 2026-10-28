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
        // 跑团助手：外壳（标题 + 一级分段）下挂「局内模式」与「内容工坊」两个子功能。
        // 父级不具名：`path: ''` 的子路由是重定向项，给父级命名会触发 vue-router 告警。
        path: 'assistant',
        component: () => import('@/views/assistant/index.vue'),
        meta: {
          title: '跑团助手 | D&D车卡辅助',
        },
        children: [
          {
            path: '',
            redirect: { name: 'session-assistant' },
          },
          {
            // 路由名与页面目录沿用改造前的 `session-assistant`，避免牵连导航配置与已保存状态。
            path: 'session',
            name: 'session-assistant',
            component: () => import('@/views/session-assistant/index.vue'),
            meta: {
              title: '跑团助手 | D&D车卡辅助',
            },
          },
          {
            path: 'workshop',
            name: 'workshop',
            component: () => import('@/views/workshop/index.vue'),
            meta: {
              title: '内容工坊 | D&D车卡辅助',
            },
          },
          {
            path: 'workshop/:kind/:entryId',
            name: 'workshop-editor',
            component: () => import('@/views/workshop/edit/index.vue'),
            meta: {
              title: '编辑自定义内容 | D&D车卡辅助',
            },
          },
        ],
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
        path: 'about',
        name: 'about',
        component: () => import('@/views/about/index.vue'),
        meta: {
          title: '关于本站 | D&D车卡辅助',
          description: '了解免费的 D&D 5e 2014 车卡与跑团辅助工具，获取 B站、GitHub 与 QQ 交流群入口。',
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
