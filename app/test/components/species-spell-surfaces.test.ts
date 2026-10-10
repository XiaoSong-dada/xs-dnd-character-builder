import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { deriveCharacter } from '@/rules/derive'
import { rulesRepository } from '@/rules/repository'
import { useSessionAssistantStore } from '@/stores/session-assistant'
import { SessionStateStorageService } from '@/services/session-state-storage'
import CharacterSheetStep from '@/views/character-builder/components/CharacterSheetStep.vue'
import SessionPanel from '@/views/session-assistant/components/SessionPanel.vue'
import type { RaceRule } from '@/types/rules'
import { draft2024, selection } from '../fixtures/draft-2024'

const race: RaceRule = {
  id: 'test-species-spell-surface', ruleset: '5e-2014', name: '测试种族', englishName: 'Test',
  summary: '', description: '', fixedAbilityBonuses: {}, subraceIds: [], recommendedClassIds: [],
  status: 'implemented', sourceIds: ['erftlw-2019-index'], spellcastingAbilityChoices: ['int', 'wis', 'cha'],
  spellGrants: [
    { spellId: 'spell-2014-druidcraft', minimumLevel: 1, alwaysPrepared: true },
    { spellId: 'spell-2014-faerie-fire', minimumLevel: 3, alwaysPrepared: true, freeCastings: 1, recovery: 'long-rest' },
    { spellId: 'spell-2014-enlarge-reduce', minimumLevel: 5, alwaysPrepared: true, freeCastings: 1, recovery: 'long-rest' },
  ],
}
const makeDraft = () => draft2024({
  id: 'species-surfaces', ruleset: '5e-2014', classId: 'class-2014-fighter', targetLevel: 5,
  raceId: race.id, enabledSourceIds: ['erftlw-2019-index'],
  selections: [selection(`${race.id}-spellcasting-ability`, ['spell-ability-wis'])],
})

describe('非施法职业的种族法术展示', () => {
  beforeEach(() => {
    localStorage.clear()
    setActivePinia(createPinia())
    const getRace = rulesRepository.getRace.bind(rulesRepository)
    vi.spyOn(rulesRepository, 'getRace').mockImplementation((id) => id === race.id ? race : getRace(id))
  })
  afterEach(() => vi.restoreAllMocks())

  it('角色卡显示种族属性、DC、戏法及有环法术，来源关闭隐藏', async () => {
    const draft = makeDraft()
    const wrapper = mount(CharacterSheetStep, { props: { draft, derived: deriveCharacter(draft) } })
    await wrapper.get('[role="tab"]:nth-child(4)').trigger('click')
    expect(wrapper.text()).toContain('种族施法')
    expect(wrapper.text()).toContain('法术攻击 +4 · 法术豁免 DC 12')
    expect(wrapper.text()).toContain('戏法 · 1')
    expect(wrapper.text()).not.toContain('/ 0')
    for (const grant of race.spellGrants ?? []) expect(wrapper.text()).toContain(rulesRepository.getSpell(grant.spellId)?.name)
    const disabled = { ...draft, enabledSourceIds: [] }
    await wrapper.setProps({ draft: disabled, derived: deriveCharacter(disabled) })
    expect(wrapper.text()).not.toContain('种族施法')
    expect(wrapper.text()).not.toContain(rulesRepository.getSpell('spell-2014-faerie-fire')?.name)
    wrapper.unmount()
  })

  it('跑团法术页显示并可免费施放，次数持久化且来源关闭隐藏', async () => {
    const draft = makeDraft()
    useSessionAssistantStore().setActiveTab('spells')
    const wrapper = mount(SessionPanel, { props: { draft }, global: { stubs: { Teleport: true } } })
    expect(wrapper.text()).toContain('法术攻击 +4 · 法术豁免 DC 12')
    for (const grant of race.spellGrants ?? []) expect(wrapper.text()).toContain(rulesRepository.getSpell(grant.spellId)?.name)
    const cast = wrapper.findAll('button').find((button) => button.text() === '施法')
    expect(cast).toBeDefined()
    await cast?.trigger('click')
    const free = wrapper.findAll('button').find((button) => button.text().includes('免费施放'))
    expect(free).toBeDefined()
    await free?.trigger('click')
    expect(SessionStateStorageService.load(draft.id)?.resourceUsage?.[`${race.id}:spell-2014-faerie-fire`]).toBe(1)
    await wrapper.setProps({ draft: { ...draft, enabledSourceIds: [] } })
    expect(wrapper.text()).not.toContain('种族施法')
    expect(wrapper.findAll('button').some((button) => button.text() === '施法')).toBe(false)
    wrapper.unmount()
  })
})
