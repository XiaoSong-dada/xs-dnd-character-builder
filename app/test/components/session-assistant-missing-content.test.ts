import { createPinia, setActivePinia } from 'pinia'
import { flushPromises, mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it } from 'vitest'

import { resetCustomContent } from '@/rules/repositories'
import { CharacterJsonService } from '@/services/character-json'
import { useCharacterDraftsStore } from '@/stores/character-drafts'
import SessionAssistantPage from '@/views/session-assistant/index.vue'

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
