import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { createMemoryHistory, createRouter } from 'vue-router'

import BottomNavigation from '@/layout/components/BottomNavigation.vue'
import { routes } from '@/router/router'

function createTestRouter() {
  return createRouter({ history: createMemoryHistory(), routes })
}

async function mountNavigationAt(path: string) {
  const router = createTestRouter()
  await router.push(path)
  await router.isReady()
  const wrapper = mount(BottomNavigation, { global: { plugins: [router] } })
  return { router, wrapper }
}

function assistantLink(wrapper: ReturnType<typeof mount>) {
  return wrapper.findAll('a').find((link) => link.text().includes('跑团助手'))
}

describe('跑团助手父子路由与外壳', () => {
  it('/assistant 重定向到局内模式，三个子地址各自命中路由', async () => {
    const router = createTestRouter()
    await router.push('/assistant')
    await router.isReady()
    expect(router.currentRoute.value.name).toBe('session-assistant')
    expect(router.currentRoute.value.path).toBe('/assistant/session')

    expect(router.resolve('/assistant/session').name).toBe('session-assistant')
    expect(router.resolve('/assistant/workshop').name).toBe('workshop')
    expect(router.resolve('/assistant/workshop/race/custom-race-1').name).toBe('workshop-editor')
  })

  it('子路由各自带有页面标题', () => {
    expect(resolveTitle('/assistant/session')).toBe('跑团助手 | D&D车卡辅助')
    expect(resolveTitle('/assistant/workshop')).toBe('内容工坊 | D&D车卡辅助')
    expect(resolveTitle('/assistant/workshop/spell/new')).toBe('编辑自定义内容 | D&D车卡辅助')
  })

  it('底部导航在内容工坊子路由上仍高亮跑团助手', async () => {
    const { wrapper } = await mountNavigationAt('/assistant/workshop')
    const link = assistantLink(wrapper)
    expect(link?.classes()).toContain('bottom-navigation__link--active')
    expect(link?.attributes('aria-current')).toBe('page')
  })

  it('底部导航在编辑器路由上仍高亮跑团助手', async () => {
    const { wrapper } = await mountNavigationAt('/assistant/workshop/feat/custom-feat-1')
    expect(assistantLink(wrapper)?.classes()).toContain('bottom-navigation__link--active')
  })

  it('切换到其他一级页面时跑团助手不再高亮', async () => {
    const { wrapper } = await mountNavigationAt('/dice')
    const link = assistantLink(wrapper)
    expect(link?.classes()).not.toContain('bottom-navigation__link--active')
    expect(link?.attributes('aria-current')).toBeUndefined()
  })
})

function resolveTitle(path: string): unknown {
  const router = createTestRouter()
  return router.resolve(path).meta.title
}
