import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'
import { createMemoryHistory, createRouter } from 'vue-router'

import { draft2024 } from '../fixtures/draft-2024'
import CustomContentBadge from '@/features/custom-content/components/CustomContentBadge.vue'
import { emptyBundle } from '@/rules/custom-content'
import { registerCustomContent, resetCustomContent } from '@/rules/repositories'
import { routes } from '@/router/router'
import { useCustomContentStore } from '@/stores/custom-content'
import ClassStep from '@/views/character-builder/components/ClassStep.vue'
import SourcesStep from '@/views/character-builder/components/SourcesStep.vue'

function seedCustomContent() {
  localStorage.clear()
  resetCustomContent()
  const pinia = createPinia()
  setActivePinia(pinia)
  const store = useCustomContentStore()
  const expansion = store.saveExpansion({
    ruleset: '5e-2014',
    title: '我的自制扩展',
    shortTitle: '自制',
    defaultEnabled: true,
  })
  store.createEntry({
    kind: 'class',
    expansionId: expansion.id,
    ruleset: '5e-2014',
    name: '火焰骑士',
    englishName: 'Flame Knight',
    summary: '自制职业',
    description: '说明',
    hitDie: 10,
    primaryAbilities: ['力量'],
    savingThrowAbilities: ['str', 'con'],
  })
  return { pinia, store, expansion }
}

function mountWithRouter(component: Parameters<typeof mount>[0], options: Record<string, unknown>) {
  const router = createRouter({ history: createMemoryHistory(), routes })
  return mount(component, {
    ...options,
    global: { plugins: [router], ...(options.global as object ?? {}) },
  })
}

describe('自定义内容在车卡侧的可见性', () => {
  beforeEach(() => {
    localStorage.clear()
    resetCustomContent()
  })

  it('自定义徽标只对自定义来源显示', () => {
    const custom = mount(CustomContentBadge, { props: { sourceIds: ['source-custom-abc'] } })
    expect(custom.text()).toContain('自定义')

    const builtIn = mount(CustomContentBadge, { props: { sourceIds: ['basic-rules-2014'] } })
    expect(builtIn.text()).toBe('')
  })

  it('第 2 步来源列表出现「自定义内容」分组、徽标与工坊入口', async () => {
    seedCustomContent()
    const wrapper = mountWithRouter(SourcesStep, {
      props: { selected: ['source-custom-test'], ruleset: '5e-2014' },
      attachTo: document.body,
    })

    expect(wrapper.text()).toContain('我的自制扩展')
    expect(wrapper.text()).toContain('自定义')
    expect(wrapper.text()).toContain('自定义内容由你自行录入')
    const link = wrapper.findAll('button').find((button) => button.text().includes('去内容工坊新建'))
    expect(link).toBeTruthy()
    await link?.trigger('click')
    expect(wrapper.emitted('open-workshop')).toHaveLength(1)
    wrapper.unmount()
  })

  it('第 3 步职业候选里的自定义职业带「自定义」徽标', () => {
    const { expansion } = seedCustomContent()
    const wrapper = mount(ClassStep, {
      props: {
        draft: draft2024({ ruleset: '5e-2014', classId: undefined, enabledSourceIds: [expansion.id] }),
        ruleset: '5e-2014',
        enabledSourceIds: [expansion.id],
      },
    })

    expect(wrapper.text()).toContain('火焰骑士')
    expect(wrapper.text()).toContain('自定义')
  })

  it('未注册自定义内容时不渲染自定义分组', () => {
    const wrapper = mountWithRouter(SourcesStep, {
      props: { selected: [], ruleset: '5e-2024' },
    })
    expect(wrapper.text()).not.toContain('自定义内容由你自行录入')
    expect(wrapper.find('.sources-step__custom-label').exists()).toBe(false)
  })
})
