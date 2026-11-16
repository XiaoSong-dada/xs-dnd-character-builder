import { createPinia, setActivePinia } from 'pinia'
import { flushPromises, mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createMemoryHistory, createRouter } from 'vue-router'

import { deriveCharacter } from '@/rules/derive'
import { resetCustomContent } from '@/rules/repositories'
import { CharacterJsonService } from '@/services/character-json'
import { SessionStateStorageService } from '@/services/session-state-storage'
import { useCharacterDraftsStore } from '@/stores/character-drafts'
import SessionAssistantPage from '@/views/session-assistant/index.vue'

import { draft2024 } from '../fixtures/draft-2024'

async function mountEmbedded() {
  const pinia = createPinia()
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [{ path: '/assistant/session', name: 'session-assistant', component: SessionAssistantPage }],
  })
  await router.push('/assistant/session?embed=owlbear')
  return mount(SessionAssistantPage, { global: { plugins: [pinia, router] } })
}

async function importJson(wrapper: ReturnType<typeof mount>, raw: string): Promise<void> {
  const input = wrapper.get('input[type="file"]')
  const file = new File([raw], 'hero.json', { type: 'application/json' })
  Object.defineProperty(input.element, 'files', { value: [file], configurable: true })
  await input.trigger('change')
  await flushPromises()
}

describe('跑团助手：导入角色缺少自定义内容的提示', () => {
  beforeEach(() => {
    localStorage.clear()
    resetCustomContent()
    setActivePinia(createPinia())
  })

  it('导入引用了缺失自定义内容的角色时给出数量与处理指引', async () => {
    const store = useCharacterDraftsStore()
    store.createDraft()
    const draft = store.activeDraft
    if (!draft) throw new Error('draft missing')
    const raw = CharacterJsonService.exportDraft({ ...draft, raceId: 'custom-race-missing' })

    const wrapper = mount(SessionAssistantPage, { attachTo: document.body })
    await importJson(wrapper, raw)

    expect(wrapper.text()).toContain('缺少自定义内容')
    expect(wrapper.text()).toContain('本机不存在的自定义内容')
    expect(wrapper.text()).toContain('内容工坊')
    wrapper.unmount()
  })

  it('导入普通角色不显示缺失提示', async () => {
    const store = useCharacterDraftsStore()
    store.createDraft()
    const draft = store.activeDraft
    if (!draft) throw new Error('draft missing')
    const raw = CharacterJsonService.exportDraft({ ...draft, raceId: 'race-2014-human' })

    const wrapper = mount(SessionAssistantPage, { attachTo: document.body })
    await importJson(wrapper, raw)

    expect(wrapper.text()).not.toContain('缺少自定义内容')
    wrapper.unmount()
  })
})

describe('枭熊局内模式', () => {
  beforeEach(() => localStorage.clear())

  it.each([
    draft2024({ ruleset: '5e-2014', classId: 'class-2014-fighter', targetLevel: 3 }),
    draft2024({ ruleset: '5e-2024', classId: 'class-2024-fighter', targetLevel: 3 }),
  ])('导入 $ruleset 角色并恢复扣血，写入失败时保留已保存的数值', async (draft) => {
    const summary = deriveCharacter(draft)
    const maxHp = summary.hitPoints.value
    const hpText = (hp: number) => `${hp} / ${maxHp}`
    const wrapper = await mountEmbedded()
    await importJson(wrapper, 'invalid json')
    expect(wrapper.text()).toContain('不是有效的 JSON')
    await importJson(wrapper, CharacterJsonService.exportDraft(draft))
    expect(wrapper.get('.session-panel__hp').text()).toContain(`护甲等级（AC） ${summary.armorClass.value}`)
    expect(wrapper.get('.session-panel__hp').text()).toContain(hpText(maxHp))
    await wrapper.get('[aria-label="减少生命值"]').trigger('click')
    expect(wrapper.get('.session-panel__hp').text()).toContain(hpText(maxHp - 1))
    wrapper.unmount()

    const reopened = await mountEmbedded()
    const save = vi.spyOn(SessionStateStorageService, 'save').mockImplementationOnce(() => {
      throw new DOMException('Storage denied', 'QuotaExceededError')
    })
    try {
      expect(reopened.get('.session-panel__hp').text()).toContain(hpText(maxHp - 1))
      await reopened.get('[aria-label="减少生命值"]').trigger('click')
      expect(reopened.text()).toContain('无法保存生命值')
      expect(reopened.get('.session-panel__hp').text()).toContain(hpText(maxHp - 1))
    } finally {
      save.mockRestore()
      reopened.unmount()
    }
  })

  it('无法使用嵌入存储时显示原因并隐藏导入入口', async () => {
    const probe = vi.spyOn(SessionStateStorageService, 'canWrite').mockReturnValueOnce(false)
    const wrapper = await mountEmbedded()
    try {
      expect(wrapper.text()).toContain('无法保存角色')
      expect(wrapper.find('input[type="file"]').exists()).toBe(false)
    } finally {
      probe.mockRestore()
      wrapper.unmount()
    }
  })
})
