import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'
import { deriveCharacter } from '@/rules/derive'
import { getSpeciesProficiencyBlockers } from '@/rules/origins'
import { rulesRepository } from '@/rules/repository'
import { useSessionAssistantStore } from '@/stores/session-assistant'
import { SessionStateStorageService } from '@/services/session-state-storage'
import OriginStep from '@/views/character-builder/components/OriginStep.vue'
import CharacterSheetStep from '@/views/character-builder/components/CharacterSheetStep.vue'
import SessionPanel from '@/views/session-assistant/components/SessionPanel.vue'
import TimelineStep from '@/views/character-builder/components/TimelineStep.vue'
import { motmDraft, motmSlugs } from '../fixtures/motm-2014'

describe('MotM全目录、具体选择与三种施法路径', () => {
  beforeEach(() => { localStorage.clear(); setActivePinia(createPinia()) })
  it('33个条目均可用英文搜索，来源关闭隐藏且恢复可见', async () => {
    const wrapper = mount(OriginStep, { props: { ruleset: '5e-2014', enabledSourceIds: ['motm-2022-index'], languages: [], raceSkillChoices: [], backgroundToolIds: [] } })
    await wrapper.get('[data-task-id="race"]').trigger('click')
    for (const slug of motmSlugs) {
      const race = rulesRepository.getRace(`race-2014-motm-${slug}`)
      await wrapper.get('input[aria-label="搜索种族"]').setValue(race?.englishName ?? '')
      const titles = () => wrapper.findAll('.expandable-option-card__title-line strong').map((item) => item.text())
      expect(titles()).toContain(race?.name)
      await wrapper.setProps({ enabledSourceIds: [] })
      expect(titles()).not.toContain(race?.name)
      await wrapper.setProps({ enabledSourceIds: ['motm-2022-index'] })
      expect(titles()).toContain(race?.name)
    }
    wrapper.unmount()
  })
  it('半羊人必选任务只列十种具体乐器，非法选项提示并可修正', async () => {
    const draft = { ...motmDraft('satyr'), raceToolChoice: 'tool-thieves-tools' }
    const wrapper = mount(OriginStep, { props: { ruleset: draft.ruleset, raceId: draft.raceId, enabledSourceIds: draft.enabledSourceIds, raceToolChoice: draft.raceToolChoice, blockers: getSpeciesProficiencyBlockers(draft, rulesRepository), languages: [] } })
    await wrapper.get('[data-task-id="race-proficiencies"]').trigger('click')
    const ids = rulesRepository.getRace(draft.raceId ?? '')?.toolProficiencyChoices?.optionIds ?? []
    for (const id of ids) expect(wrapper.text()).toContain(rulesRepository.getEquipment(id)?.name)
    expect(wrapper.text()).toContain('请重新选择具体工具')
    const flute = wrapper.findAll('button').find((button) => button.text() === '长笛')
    if (!flute) throw new Error('Missing flute choice')
    await flute.trigger('click')
    expect(wrapper.emitted('raceTool')?.[0]).toEqual(['flute'])
    wrapper.unmount()
  })
  it.each(['satyr', 'shifter', 'kobold', 'aasimar', 'eladrin'])('%s 的具体选择贯通角色卡、跑团并随来源停用', async (slug) => {
    const draft = motmDraft(slug)
    const sheet = mount(CharacterSheetStep, { props: { draft, derived: deriveCharacter(draft) } })
    await sheet.get('[role="tab"]:nth-child(3)').trigger('click')
    useSessionAssistantStore().setActiveTab('features')
    const session = mount(SessionPanel, { props: { draft } })
    const selected = slug === 'satyr' ? rulesRepository.getEquipment(draft.raceToolChoice ?? '')?.name : rulesRepository.getOption(draft.selections[0]?.optionIds[0] ?? '')?.name
    if (!selected) throw new Error('Missing selected label')
    for (const wrapper of [sheet, session]) {
      if (slug === 'satyr') await wrapper.get('button[aria-label="展开种族工具熟练"]').trigger('click')
      expect(wrapper.text()).toContain(selected)
    }
    const disabled = { ...draft, enabledSourceIds: [] }
    await sheet.setProps({ draft: disabled, derived: deriveCharacter(disabled) })
    await session.setProps({ draft: disabled })
    for (const wrapper of [sheet, session]) { expect(wrapper.text()).not.toContain(selected); wrapper.unmount() }
  })
  it('狗头人遗赠在时间线生成必选任务并收集选项', async () => {
    const draft = { ...motmDraft('kobold'), selections: [] }
    const wrapper = mount(TimelineStep, { props: { draft, classId: draft.classId ?? '', targetLevel: draft.targetLevel, backgroundSkillIds: [], selections: [] } })
    expect(wrapper.text()).toContain('狗头人遗赠')
    const task = wrapper.findAll('button').find((button) => button.text().includes('狗头人遗赠'))
    if (!task) throw new Error('Missing kobold legacy task')
    await task.trigger('click')
    expect(wrapper.text()).toContain('机智')
    expect(wrapper.text()).toContain('逆反')
    expect(wrapper.text()).toContain('龙术')
    wrapper.unmount()
  })
  it('蛇人仅蛇不限次数入口不扣资源或法术位，同名职业法术仍有独立环位入口', async () => {
    const draft = { ...motmDraft('yuan-ti'), classId: 'class-2014-druid', spellSelections: { ...motmDraft('yuan-ti').spellSelections, preparedSpellIds: ['spell-2014-animal-friendship'] } }
    useSessionAssistantStore().setActiveTab('spells')
    const wrapper = mount(SessionPanel, { props: { draft }, global: { stubs: { Teleport: true } } })
    const card = wrapper.findAll('.expandable-option-card').find((item) => item.text().includes('化兽为友'))
    if (!card) throw new Error('Missing animal friendship')
    const cast = card.findAll('button').find((button) => button.text() === '施法')
    if (!cast) throw new Error('Missing cast action')
    await cast.trigger('click')
    expect(wrapper.text()).toContain('仅限蛇')
    expect(wrapper.findAll('button').some((button) => button.text() === '消耗 1 环法术位')).toBe(true)
    const atWill = wrapper.findAll('button').find((button) => button.text().startsWith('不耗法术位施放'))
    if (!atWill) throw new Error('Missing at-will action')
    const before = SessionStateStorageService.load(draft.id)
    await atWill.trigger('click')
    const after = SessionStateStorageService.load(draft.id)
    expect(after?.resourceUsage).toEqual(before?.resourceUsage)
    expect(after?.usedSpellSlots).toEqual(before?.usedSpellSlots)
    wrapper.unmount()
  })
  it('吉斯灵能免费和种族环位入口分别扣各自资源，全部成分豁免不免专注', async () => {
    const original = motmDraft('githyanki')
    const draft = { ...original, manualEdits: { ...original.manualEdits, spellSlotAdjustments: { 1: 1 } } }
    useSessionAssistantStore().setActiveTab('spells')
    const wrapper = mount(SessionPanel, { props: { draft }, global: { stubs: { Teleport: true } } })
    const card = wrapper.findAll('.expandable-option-card').find((item) => item.text().includes('跳跃术'))
    if (!card) throw new Error('Missing jump')
    const cast = () => card.findAll('button').find((button) => button.text() === '施法')
    await cast()?.trigger('click')
    expect(wrapper.text()).toContain('无需语言、姿势及材料成分（不免专注）')
    const slot = wrapper.findAll('button').find((button) => button.text().includes('吉斯洋基人') && button.text().includes('1 环法术位'))
    if (!slot) throw new Error('Missing species slot path')
    await slot.trigger('click')
    expect(SessionStateStorageService.load(draft.id)?.usedSpellSlots[1]).toBe(1)
    expect(SessionStateStorageService.load(draft.id)?.resourceUsage?.[`${draft.raceId}:spell-2014-jump`] ?? 0).toBe(0)
    await cast()?.trigger('click')
    const free = wrapper.findAll('button').find((button) => button.text().includes('免费施放'))
    if (!free) throw new Error('Missing free path')
    await free.trigger('click')
    expect(SessionStateStorageService.load(draft.id)?.resourceUsage?.[`${draft.raceId}:spell-2014-jump`]).toBe(1)
    wrapper.unmount()
  })
})
