import { flushPromises, mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, h } from 'vue'
import { createMemoryHistory, createRouter, RouterView, type Router } from 'vue-router'

import { routes } from '@/router/router'
import { resetCustomContent } from '@/rules/repositories'
import { useCustomContentStore } from '@/stores/custom-content'
import RaceForm from '@/views/workshop/edit/components/RaceForm.vue'

/** 路由渲染外壳：让被测页面作为真正的路由组件挂载。 */
const Harness = defineComponent({ render: () => h(RouterView) })

const EXPANSIONS = [{ id: 'source-custom-test', title: '工坊测试书' }]

function setupStore() {
  localStorage.clear()
  resetCustomContent()
  const pinia = createPinia()
  setActivePinia(pinia)
  return { pinia, store: useCustomContentStore() }
}

async function mountEditor(pinia: ReturnType<typeof createPinia>, path: string): Promise<{ wrapper: ReturnType<typeof mount>; router: Router }> {
  const router = createRouter({ history: createMemoryHistory(), routes })
  await router.push(path)
  await router.isReady()
  // 通过 RouterView 挂载，让页面真正作为路由组件渲染（`onBeforeRouteLeave` 才能拿到活动路由记录）。
  const wrapper = mount(Harness, { global: { plugins: [pinia, router] } })
  return { wrapper, router }
}

function mountRaceForm(ruleset: '5e-2014' | '5e-2024') {
  return mount(RaceForm, {
    props: { ruleset, expansionId: 'source-custom-test', expansions: EXPANSIONS },
  })
}

describe('自定义种族表单', () => {
  beforeEach(() => {
    localStorage.clear()
    resetCustomContent()
  })

  it('2014 显示固定属性加值，2024 隐藏并说明原因', () => {
    const form2014 = mountRaceForm('5e-2014')
    expect(form2014.text()).toContain('固定属性加值')

    const form2024 = mountRaceForm('5e-2024')
    expect(form2024.text()).not.toContain('固定属性加值')
  })

  it('必填缺失时不触发保存', async () => {
    const form = mountRaceForm('5e-2014')
    await form.get('.sticky-action-bar button:last-child').trigger('click')
    expect(form.emitted('save')).toBeUndefined()
  })

  it('填写完整后保存，数字与列表字段被正确转换', async () => {
    const form = mountRaceForm('5e-2014')
    await form.get('#race-name').setValue('工坊精灵')
    await form.get('#race-summary').setValue('自制种族')
    await form.get('#race-description').setValue('自制种族说明')
    await form.get('#race-speed').setValue('30')
    await form.get('#race-darkvision').setValue('60')
    await form.get('#race-languages').setValue('通用语、精灵语')

    const skillButton = form.findAll('.race-form__chip').find((chip) => chip.text() === '察觉')
    await skillButton?.trigger('click')

    await form.get('.sticky-action-bar button:last-child').trigger('click')

    const payloads = form.emitted('save')
    expect(payloads).toBeTruthy()
    const input = payloads?.[0]?.[0] as Record<string, unknown>
    expect(input).toMatchObject({
      kind: 'race',
      name: '工坊精灵',
      expansionId: 'source-custom-test',
      speed: 30,
      darkvision: 60,
      fixedLanguages: ['通用语', '精灵语'],
    })
    expect(input.skillProficiencies).toContain('skill-perception')
  })
})

describe('内容工坊编辑器页', () => {
  it('新建扩展保存后写入内容库并回到列表', async () => {
    const { pinia, store } = setupStore()
    const { wrapper, router } = await mountEditor(pinia, '/assistant/workshop/expansion/new')

    await wrapper.get('#expansion-title').setValue('我的自制扩展')
    await wrapper.get('#expansion-short').setValue('自制')
    const saveButton = wrapper.findAll('button').find((button) => button.text() === '保存扩展')
    await saveButton?.trigger('click')

    expect(store.expansionsOf('5e-2014')).toHaveLength(1)
    expect(store.expansionsOf('5e-2014')[0]?.title).toBe('我的自制扩展')
    await vi.waitFor(() => {
      expect(router.currentRoute.value.name).toBe('workshop')
    })
  })

  it('编辑已有个性化条目会更新同一条而不是新建', async () => {
    const { pinia, store } = setupStore()
    const expansion = store.saveExpansion({
      ruleset: '5e-2014',
      title: '工坊测试书',
      shortTitle: '工坊',
      defaultEnabled: true,
    })
    const race = store.createEntry({
      kind: 'race',
      expansionId: expansion.id,
      ruleset: '5e-2014',
      name: '旧名字',
      englishName: '',
      summary: '概括',
      description: '说明',
      speed: 30,
    })

    const { wrapper } = await mountEditor(pinia, `/assistant/workshop/race/${race.id}`)
    await wrapper.get('#race-name').setValue('新名字')
    const saveButton = wrapper.findAll('button').find((button) => button.text() === '保存种族')
    await saveButton?.trigger('click')

    const entries = store.entriesOf('5e-2014')
    expect(entries).toHaveLength(1)
    expect(entries[0]?.name).toBe('新名字')
    expect(entries[0]?.id).toBe(race.id)
  })

  it('条目不存在时提示而不是崩溃', async () => {
    const { pinia } = setupStore()
    const { wrapper } = await mountEditor(pinia, '/assistant/workshop/race/custom-race-missing')
    expect(wrapper.text()).toContain('该自定义内容不存在')
  })
})

describe('内容工坊编辑器：从内置条目复制', () => {
  it('复制内置种族为表单初值，保存后生成新的 custom-* 条目', async () => {
    const { pinia, store } = setupStore()
    store.saveExpansion({ ruleset: '5e-2014', title: '工坊测试书', shortTitle: '工坊', defaultEnabled: true })
    const { wrapper } = await mountEditor(pinia, '/assistant/workshop/race/new')

    const templateButton = wrapper.findAll('button').find((button) => button.text().includes('从内置条目复制'))
    await templateButton?.trigger('click')
    await flushPromises()

    const option = [...document.body.querySelectorAll('button')]
      .find((button) => button.textContent?.trim().startsWith('半身人'))
    expect(option).toBeTruthy()
    option?.click()
    await flushPromises()

    expect((wrapper.get('#race-name').element as HTMLInputElement).value).toBe('半身人（自制）')

    const saveButton = wrapper.findAll('button').find((button) => button.text() === '保存种族')
    await saveButton?.trigger('click')
    await flushPromises()

    const races = store.entriesOf('5e-2014').filter((entry) => entry.kind === 'race')
    expect(races).toHaveLength(1)
    expect(races[0]?.id.startsWith('custom-race-')).toBe(true)
    expect(races[0]?.name).toBe('半身人（自制）')
  })
})