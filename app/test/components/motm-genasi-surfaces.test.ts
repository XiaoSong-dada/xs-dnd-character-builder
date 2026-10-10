import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'
import { deriveCharacter } from '@/rules/derive'
import { getSpeciesSpellcastingProfiles } from '@/rules/spellcasting'
import { rulesRepository } from '@/rules/repository'
import { useSessionAssistantStore } from '@/stores/session-assistant'
import { SessionStateStorageService } from '@/services/session-state-storage'
import CharacterSheetStep from '@/views/character-builder/components/CharacterSheetStep.vue'
import SessionPanel from '@/views/session-assistant/components/SessionPanel.vue'
import OriginStep from '@/views/character-builder/components/OriginStep.vue'
import { draft2024, selection } from '../fixtures/draft-2024'

const draftFor = (slug: string, targetLevel = 5) => {
  const raceId = `race-2014-motm-${slug}-genasi`
  return draft2024({ id: `genasi-surface-${slug}`, ruleset: '5e-2014', classId: 'class-2014-fighter', raceId, targetLevel,
    enabledSourceIds: ['motm-2022-index'], raceAbilityChoices: ['str', 'dex'], speciesSizeChoice: 'small',
    selections: [selection(`${raceId}-spellcasting-ability`, ['spell-ability-wis'])],
  })
}

describe('元素裔法术说明与附赠资源页面', () => {
  beforeEach(() => {
    localStorage.clear()
    setActivePinia(createPinia())
  })
  it.each(['air', 'earth', 'fire', 'water'])('%s 在起源目录可搜索，并提供体型选择', async (slug) => {
    const draft = draftFor(slug)
    const wrapper = mount(OriginStep, { props: { ruleset: draft.ruleset, raceId: draft.raceId, enabledSourceIds: draft.enabledSourceIds, languages: [], raceSkillChoices: [], backgroundToolIds: [] } })
    await wrapper.get('[data-task-id="race"]').trigger('click')
    await wrapper.get('input[aria-label="搜索种族"]').setValue(rulesRepository.getRace(draft.raceId ?? '')?.englishName ?? '')
    const titles = wrapper.findAll('.expandable-option-card__title-line strong').map((item) => item.text()).filter((title) => !title.startsWith('已选择：'))
    expect(titles).toEqual([rulesRepository.getRace(draft.raceId ?? '')?.name])
    await wrapper.get('[data-task-id="species-size"]').trigger('click')
    const medium = wrapper.findAll('button').find((button) => button.text() === '中型')
    if (!medium) throw new Error('缺少元素裔体型选择')
    await medium.trigger('click')
    expect(wrapper.emitted('size')?.[0]).toEqual(['medium'])
    wrapper.unmount()
  })
  it.each(['air', 'earth', 'fire', 'water'])('%s 的角色卡与跑团显示逐法术免材料，来源关闭消失', async (slug) => {
    const draft = draftFor(slug)
    const sheet = mount(CharacterSheetStep, { props: { draft, derived: deriveCharacter(draft) } })
    await sheet.get('[role="tab"]:nth-child(4)').trigger('click')
    useSessionAssistantStore().setActiveTab('spells')
    const session = mount(SessionPanel, { props: { draft } })
    for (const wrapper of [sheet, session]) {
      expect(wrapper.text()).toContain('无需材料成分（种族施放）')
      for (const spellId of getSpeciesSpellcastingProfiles(draft)[0]?.materialFreeSpellIds ?? []) expect(wrapper.text()).toContain(rulesRepository.getSpell(spellId)?.name)
    }
    const disabled = { ...draft, enabledSourceIds: [] }
    await sheet.setProps({ draft: disabled, derived: deriveCharacter(disabled) })
    await session.setProps({ draft: disabled })
    for (const wrapper of [sheet, session]) {
      expect(wrapper.text()).not.toContain('无需材料成分（种族施放）')
      wrapper.unmount()
    }
  })

  it('土裔正常戏法不受次数限制，附赠次数可消耗并持久化，与行动无踪独立', async () => {
    const draft = draftFor('earth')
    const wrapper = mount(SessionPanel, { props: { draft } })
    const id = 'race-2014-motm-earth-genasi-bonus-blade-ward'
    expect(wrapper.text()).toContain('附赠剑刃防护')
    await wrapper.get('button[aria-label="消耗附赠剑刃防护"]').trigger('click')
    expect(SessionStateStorageService.load(draft.id)?.resourceUsage?.[id]).toBe(1)
    expect(SessionStateStorageService.load(draft.id)?.resourceUsage?.['race-2014-motm-earth-genasi:spell-2014-pass-without-trace'] ?? 0).toBe(0)
    useSessionAssistantStore().setActiveTab('spells')
    await wrapper.vm.$nextTick()
    expect(wrapper.text()).toContain('剑刃防护')
    expect(wrapper.text()).toContain('行动无踪')
    await wrapper.setProps({ draft: { ...draft, enabledSourceIds: [] } })
    expect(wrapper.text()).not.toContain('行动无踪')
    wrapper.unmount()
  })
})
