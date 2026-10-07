import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'
import { deriveCharacter } from '@/rules/derive'
import { rulesRepository } from '@/rules/repository'
import { EMPTY_MANUAL_EDITS } from '@/rules/manual-edits'
import { useSessionAssistantStore } from '@/stores/session-assistant'
import { SessionStateStorageService } from '@/services/session-state-storage'
import OriginStep from '@/views/character-builder/components/OriginStep.vue'
import CharacterSheetStep from '@/views/character-builder/components/CharacterSheetStep.vue'
import SessionPanel from '@/views/session-assistant/components/SessionPanel.vue'
import { draft2024, selection } from '../fixtures/draft-2024'

const id = 'race-2014-motm-fairy'
const makeDraft = () => draft2024({
  id: 'fairy-surfaces', ruleset: '5e-2014', classId: 'class-2014-fighter', targetLevel: 5,
  raceId: id, enabledSourceIds: ['motm-2022-index'], raceAbilityChoices: ['str', 'dex'],
  selections: [selection(`${id}-spellcasting-ability`, ['spell-ability-wis'])],
})

describe('仙灵选择、角色卡与跑团法术', () => {
  beforeEach(() => {
    localStorage.clear()
    setActivePinia(createPinia())
  })

  it('中英文可查同一仙灵，任一来源可见且停用后隐藏，不生成体型二选一', async () => {
    const wrapper = mount(OriginStep, { props: { ruleset: '5e-2014', raceId: id, enabledSourceIds: ['motm-2022-index'], languages: [], raceSkillChoices: [], backgroundToolIds: [] } })
    await wrapper.get('[data-task-id="race"]').trigger('click')
    for (const query of ['Fairy', '仙灵']) {
      await wrapper.get('input[aria-label="搜索种族"]').setValue(query)
      const titles = wrapper.findAll('.expandable-option-card__title-line strong').map((item) => item.text()).filter((title) => !title.startsWith('已选择：'))
      expect(titles).toEqual(['仙灵'])
    }
    expect(wrapper.find('[data-task-id="species-size"]').exists()).toBe(false)
    await wrapper.setProps({ enabledSourceIds: ['twbtw-2021-index'] })
    expect(wrapper.findAll('.expandable-option-card__title-line strong').map((item) => item.text())).toContain('仙灵')
    await wrapper.setProps({ enabledSourceIds: [] })
    expect(wrapper.findAll('.expandable-option-card__title-line strong').map((item) => item.text()).filter((title) => !title.startsWith('已选择：'))).toEqual([])
    wrapper.unmount()
  })

  it('角色卡按等级显示法术与种族数值，能力页保留飞行限制', async () => {
    const draft = makeDraft()
    const wrapper = mount(CharacterSheetStep, { props: { draft, derived: deriveCharacter(draft) } })
    await wrapper.get('[role="tab"]:nth-child(4)').trigger('click')
    expect(wrapper.text()).toContain('仙灵 · 感知 · 法术攻击 +4 · 法术豁免 DC 12')
    for (const spell of rulesRepository.getRace(id)?.spellGrants ?? []) expect(wrapper.text()).toContain(rulesRepository.getSpell(spell.spellId)?.name)
    const firstLevel = { ...draft, targetLevel: 1 }
    await wrapper.setProps({ draft: firstLevel, derived: deriveCharacter(firstLevel) })
    expect(wrapper.text()).toContain(rulesRepository.getSpell('spell-2014-druidcraft')?.name)
    expect(wrapper.text()).not.toContain(rulesRepository.getSpell('spell-2014-faerie-fire')?.name)
    await wrapper.get('[role="tab"]:nth-child(3)').trigger('click')
    await wrapper.get('button[aria-label="展开飞行"]').trigger('click')
    expect(wrapper.text()).toContain('穿中甲或重甲时不可使用')
    wrapper.unmount()
  })

  it('免费次数独立持久化，用法术位不扣免费次数，法术位不足时仍可免费施放', async () => {
    const draft = { ...makeDraft(), manualEdits: { ...EMPTY_MANUAL_EDITS, spellSlotAdjustments: { 1: 1, 2: 1 } } }
    useSessionAssistantStore().setActiveTab('spells')
    const wrapper = mount(SessionPanel, { props: { draft }, global: { stubs: { Teleport: true } } })
    const castButtons = () => wrapper.findAll('button').filter((button) => button.text() === '施法')
    expect(castButtons()).toHaveLength(2)
    await castButtons()[0].trigger('click')
    const free = wrapper.findAll('button').find((button) => button.text().includes('免费施放'))
    if (!free) throw new Error('仙灵妖火缺少免费施放入口')
    await free.trigger('click')
    expect(SessionStateStorageService.load(draft.id)?.resourceUsage?.[`${id}:spell-2014-faerie-fire`]).toBe(1)
    expect(SessionStateStorageService.load(draft.id)?.resourceUsage?.[`${id}:spell-2014-enlarge-reduce`] ?? 0).toBe(0)
    await castButtons()[1].trigger('click')
    const slot = wrapper.findAll('button').find((button) => button.text() === '消耗 2 环法术位')
    if (!slot) throw new Error('仙灵变巨术缺少合适环位入口')
    await slot.trigger('click')
    expect(SessionStateStorageService.load(draft.id)?.usedSpellSlots[2]).toBe(1)
    expect(SessionStateStorageService.load(draft.id)?.resourceUsage?.[`${id}:spell-2014-enlarge-reduce`] ?? 0).toBe(0)
    await castButtons()[1].trigger('click')
    const remainingFree = wrapper.findAll('button').find((button) => button.text().includes('免费施放'))
    if (!remainingFree) throw new Error('环位用完后丢失独立免费次数')
    await remainingFree.trigger('click')
    expect(SessionStateStorageService.load(draft.id)?.resourceUsage?.[`${id}:spell-2014-enlarge-reduce`]).toBe(1)
    await wrapper.setProps({ draft: { ...draft, enabledSourceIds: [] } })
    expect(castButtons()).toHaveLength(0)
    await wrapper.setProps({ draft: { ...draft, enabledSourceIds: ['twbtw-2021-index'] } })
    expect(castButtons()).toHaveLength(2)
    expect(SessionStateStorageService.load(draft.id)?.resourceUsage?.[`${id}:spell-2014-faerie-fire`]).toBe(1)
    wrapper.unmount()
  })
})
