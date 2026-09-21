import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import QuickBuildShell from '@/features/quick-build/components/QuickBuildShell.vue'
import StickyActionBar from '@/features/quick-build/components/StickyActionBar.vue'

const shellSource = readFileSync(
  resolve(process.cwd(), 'src/features/quick-build/components/QuickBuildShell.vue'),
  'utf8',
)
const barSource = readFileSync(
  resolve(process.cwd(), 'src/features/quick-build/components/StickyActionBar.vue'),
  'utf8',
)

describe('QuickBuildShell 吸底区结构（v1.9.1 R3）', () => {
  it('当前角色框与操作栏同属一个吸底容器且相邻', () => {
    const wrapper = mount(QuickBuildShell, {
      slots: {
        default: '<p class="content-stub">内容</p>',
        drawer: '<div class="drawer-stub">当前角色</div>',
        actions: '<div class="actions-stub">操作</div>',
      },
    })
    const children = [...wrapper.get('.quick-build-shell__bottom').element.children]
    expect(children).toHaveLength(2)
    expect(children[0]?.classList.contains('quick-build-shell__drawer')).toBe(true)
    expect(children[1]?.classList.contains('quick-build-shell__actions')).toBe(true)
    expect(wrapper.find('.drawer-stub').exists()).toBe(true)
    expect(wrapper.find('.actions-stub').exists()).toBe(true)
  })

  it('只有抽屉、只有操作栏或两者都无时不渲染多余吸底块', () => {
    const drawerOnly = mount(QuickBuildShell, { slots: { drawer: '<div>当前角色</div>' } })
    expect(drawerOnly.find('.quick-build-shell__bottom').exists()).toBe(true)
    expect(drawerOnly.find('.quick-build-shell__actions').exists()).toBe(false)

    const actionsOnly = mount(QuickBuildShell, { slots: { actions: '<div>操作</div>' } })
    expect(actionsOnly.findAll('.quick-build-shell__bottom')).toHaveLength(1)
    expect(actionsOnly.find('.quick-build-shell__drawer').exists()).toBe(false)

    const none = mount(QuickBuildShell, { slots: { default: '<p>只有内容</p>' } })
    expect(none.find('.quick-build-shell__bottom').exists()).toBe(false)
  })

  it('吸底区为单一 sticky 容器，抽屉不再依赖固定让位常量', () => {
    // 旧写法：抽屉 sticky + `bottom: 4.75rem` 硬让位，提示行增高即遮挡当前角色框
    expect(shellSource).not.toContain('bottom: 4.75rem')
    expect(shellSource).toMatch(/&__bottom\s*\{[\s\S]*?position:\s*sticky/)
    expect(shellSource).toMatch(/&__bottom\s*\{[\s\S]*?z-index:\s*5/)
  })
})

describe('StickyActionBar 未完成提示动作（v1.9.1 R3-6）', () => {
  it('「去完成」渲染为按钮并发出 helperAction，不再使用锚点跳转', async () => {
    const wrapper = mount(StickyActionBar, {
      props: { primaryLabel: '继续', helperText: '法术选择尚未完成，请按任务清单补齐。', helperAction: true },
    })
    const action = wrapper.get('.sticky-action-bar__action')
    expect(action.element.tagName).toBe('BUTTON')
    expect(action.attributes('type')).toBe('button')
    expect(action.text()).toBe('去完成')
    expect(wrapper.find('a').exists()).toBe(false)

    await action.trigger('click')
    expect(wrapper.emitted('helperAction')).toHaveLength(1)
  })

  it('未开启 helperAction 时只显示提示文本', () => {
    const wrapper = mount(StickyActionBar, { props: { primaryLabel: '继续', helperText: '提示文本' } })
    expect(wrapper.text()).toContain('提示文本')
    expect(wrapper.find('.sticky-action-bar__action').exists()).toBe(false)
  })

  it('源码不再保留 helperHref 与 #builder-step-tasks 锚点', () => {
    expect(barSource).not.toContain('helperHref')
    expect(barSource).not.toContain('builder-step-tasks')
    expect(shellSource).not.toContain('builder-step-tasks')
  })
})
