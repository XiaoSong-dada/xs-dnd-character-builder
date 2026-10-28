import { flushPromises, mount } from '@vue/test-utils'
import { createPinia, setActivePinia, type Pinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createMemoryHistory, createRouter, type Router } from 'vue-router'

import { routes } from '@/router/router'
import { resetCustomContent } from '@/rules/repositories'
import { useCharacterDraftsStore } from '@/stores/character-drafts'
import { useCustomContentStore } from '@/stores/custom-content'
import WorkshopPage from '@/views/workshop/index.vue'

interface MountedPage {
  readonly wrapper: ReturnType<typeof mount>
  readonly router: Router
}

/** 每个用例独立的 Pinia：先建 store（内容库），再挂载页面，避免跨用例串状态。 */
function setupWorkshop() {
  localStorage.clear()
  resetCustomContent()
  const pinia = createPinia()
  setActivePinia(pinia)
  const store = useCustomContentStore()
  return { pinia, store }
}

async function mountPage(pinia: Pinia): Promise<MountedPage> {
  const router = createRouter({ history: createMemoryHistory(), routes })
  await router.push('/assistant/workshop')
  await router.isReady()
  const wrapper = mount(WorkshopPage, { global: { plugins: [pinia, router] } })
  return { wrapper, router }
}

function seedExpansionAndRace(store: ReturnType<typeof useCustomContentStore>) {
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
    name: '工坊精灵',
    englishName: 'Workshop Elf',
    summary: '自制种族',
    description: '自制种族说明',
    speed: 30,
  })
  return { expansion, race }
}

describe('内容工坊列表页', () => {
  beforeEach(() => {
    localStorage.clear()
    resetCustomContent()
  })

  it('空库时引导先创建自定义扩展', async () => {
    const { pinia } = setupWorkshop()
    const { wrapper } = await mountPage(pinia)

    expect(wrapper.text()).toContain('还没有自定义扩展')
    expect(wrapper.findAll('article')).toHaveLength(0)
  })

  it('已建扩展与条目时展示卡片、计数与自动化级别', async () => {
    const { pinia, store } = setupWorkshop()
    seedExpansionAndRace(store)
    const { wrapper } = await mountPage(pinia)

    expect(wrapper.text()).toContain('工坊测试书')
    expect(wrapper.text()).toContain('工坊精灵')
    expect(wrapper.text()).toContain('会参与计算')
    expect(wrapper.text()).toContain('自定义扩展')
    expect(wrapper.text()).toContain('种族 1')
  })

  it('类型筛选与搜索可用，空类型 chip 置灰', async () => {
    const { pinia, store } = setupWorkshop()
    seedExpansionAndRace(store)
    const { wrapper } = await mountPage(pinia)

    const spellChip = wrapper.findAll('button').find((button) => button.text().startsWith('自定义法术'))
    expect(spellChip).toBeTruthy()
    expect(spellChip?.attributes('disabled')).toBeDefined()

    const raceChip = wrapper.findAll('button').find((button) => button.text().startsWith('自定义种族'))
    await raceChip?.trigger('click')
    expect(wrapper.text()).toContain('工坊精灵')

    await wrapper.get('input[type="search"]').setValue('不存在的内容')
    expect(wrapper.text()).toContain('没有匹配')
    expect(wrapper.text()).not.toContain('工坊精灵')
  })

  it('复制条目生成「（副本）」且不改变原条目', async () => {
    const { pinia, store } = setupWorkshop()
    seedExpansionAndRace(store)
    const { wrapper } = await mountPage(pinia)

    await wrapper.get('.workshop-entry-card__action').trigger('click')
    const names = store.entriesOf('5e-2014').map((entry) => entry.name)
    expect(names).toContain('工坊精灵（副本）')
    expect(names.filter((name) => name === '工坊精灵')).toHaveLength(1)
  })

  it('点击条目卡进入编辑器路由', async () => {
    const { pinia, store } = setupWorkshop()
    const { race } = seedExpansionAndRace(store)
    const { wrapper, router } = await mountPage(pinia)

    await wrapper.get('.workshop-entry-card__main').trigger('click')
    // 目标路由是懒加载组件：等导航真正落地再断言。
    await vi.waitFor(() => {
      expect(router.currentRoute.value.name).toBe('workshop-editor')
    })
    expect(router.currentRoute.value.params).toMatchObject({ kind: 'race', entryId: race.id })
  })

  it('无引用的条目删除前需确认，确认后从内容库移除', async () => {
    const { pinia, store } = setupWorkshop()
    seedExpansionAndRace(store)
    const { wrapper } = await mountPage(pinia)

    const removeButton = wrapper.findAll('.workshop-entry-card__action').find((button) => button.text() === '删除')
    await removeButton?.trigger('click')
    await flushPromises()
    expect(document.body.textContent).toContain('没有角色使用这条内容')

    const confirm = [...document.body.querySelectorAll('button')].find((button) => button.textContent?.includes('确认删除'))
    confirm?.click()
    await flushPromises()

    expect(store.entriesOf('5e-2014')).toHaveLength(0)
  })

  it('被引用的条目删除时建议归档，归档后条目保留并标记已归档', async () => {
    const { pinia, store } = setupWorkshop()
    const { race } = seedExpansionAndRace(store)

    // 造一份引用该种族的角色草稿
    const draftsStore = useCharacterDraftsStore()
    draftsStore.createDraft()
    draftsStore.updateDraft({ ruleset: '5e-2014', raceId: race.id })

    const { wrapper } = await mountPage(pinia)
    const removeButton = wrapper.findAll('.workshop-entry-card__action').find((button) => button.text() === '删除')
    await removeButton?.trigger('click')
    await flushPromises()
    expect(document.body.textContent).toContain('正在使用它')

    const archive = [...document.body.querySelectorAll('button')].find((button) => button.textContent?.includes('改为归档'))
    archive?.click()
    await flushPromises()

    expect(store.findEntry('5e-2014', race.id)?.archived).toBe(true)
    expect(wrapper.text()).toContain('已归档')
  })

  it('导入内容包先预览新增/覆盖数量，确认后写入内容库', async () => {
    const { pinia, store } = setupWorkshop()
    seedExpansionAndRace(store)
    const { wrapper } = await mountPage(pinia)

    const json = store.exportToJson('5e-2014')
    const file = new File([json], 'custom.json', { type: 'application/json' })
    const fileInput = wrapper.get('input[type="file"]')
    Object.defineProperty(fileInput.element, 'files', { value: [file], configurable: true })
    await fileInput.trigger('change')
    await flushPromises()

    expect(document.body.textContent).toContain('导入自定义内容')
    const confirm = [...document.body.querySelectorAll('button')].find((button) => button.textContent?.includes('确认导入'))
    confirm?.click()
    await flushPromises()

    expect(store.entriesOf('5e-2014')).toHaveLength(1)
  })
})