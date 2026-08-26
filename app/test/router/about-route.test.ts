import { describe, expect, it } from 'vitest'
import { createMemoryHistory, createRouter } from 'vue-router'

import navigationSprite from '@/assets/icons/navigation.svg?raw'
import { navigationItems } from '@/layout/hooks/useBottomNavigation'
import { routes } from '@/router/router'

describe('关于本站路由与导航', () => {
  it('一级业务路由仅注册 about，不残留 profile', () => {
    const children = routes[0]?.children ?? []
    expect(children.some((route) => route.name === 'about' && route.path === 'about')).toBe(true)
    expect(children.some((route) => route.name === 'profile' || route.path === 'profile')).toBe(false)

    const about = children.find((route) => route.name === 'about')
    expect(about?.meta).toMatchObject({
      title: '关于本站 | D&D车卡辅助',
      description: '了解免费的 D&D 5e 2014 车卡与跑团辅助工具，获取 B站、GitHub 与 QQ 交流群入口。',
    })
  })

  it('旧 profile 地址命中 404，about 地址命中业务页面', () => {
    const router = createRouter({ history: createMemoryHistory(), routes })
    expect(router.resolve('/about').name).toBe('about')
    expect(router.resolve('/profile').name).toBe('not-found')
  })

  it('底部导航使用“关于本站”和信息图标', () => {
    expect(navigationItems.at(-1)).toEqual({
      routeName: 'about',
      label: '关于本站',
      iconId: 'navigation-about',
    })
    expect(navigationSprite).toContain('id="navigation-about"')
    expect(navigationSprite).not.toContain('id="navigation-profile"')
  })
})
