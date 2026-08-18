import { mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import OriginStep from '@/views/character-builder/components/OriginStep.vue'

describe('OriginStep 种族展开', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  it('种族卡片展开显示种族介绍与推荐徽标', async () => {
    // 模拟手机宽度视口
    window.innerWidth = 375
    window.dispatchEvent(new Event('resize'))
    const wrapper = mount(OriginStep, { props: { languages: [] } })
    const dwarfCard = wrapper.findAll('.expandable-option-card').find((card) => card.text().includes('矮人'))
    expect(dwarfCard).toBeTruthy()
    await dwarfCard!.find('.expandable-option-card__arrow').trigger('click')
    expect(dwarfCard!.find('.expandable-option-card__growth').exists()).toBe(true)
    expect(dwarfCard!.text()).toContain('种族介绍')
    expect(dwarfCard!.text()).toContain('黑暗视觉')
  })

  it('单击选择种族经 250ms 判定后 emit race，展开不触发选择', async () => {
    const wrapper = mount(OriginStep, { props: { languages: [] } })
    const dwarfMain = wrapper.findAll('.expandable-option-card__main').find((button) => button.text().includes('矮人'))
    expect(dwarfMain).toBeTruthy()
    await dwarfMain!.trigger('click')
    expect(wrapper.emitted('race')).toBeUndefined()
    await vi.advanceTimersByTimeAsync(250)
    expect(wrapper.emitted('race')).toHaveLength(1)
  })

  it('dm-only 基础种族显示可选规则徽章，普通种族不显示', () => {
    const wrapper = mount(OriginStep, { props: { languages: [] } })
    const cards = wrapper.findAll('.expandable-option-card')
    const aarakocraBadges = cards.find((card) => card.text().includes('鸟人'))!.findAll('.ui-badge').map((badge) => badge.text())
    const dwarfBadges = cards.find((card) => card.text().includes('矮人'))!.findAll('.ui-badge').map((badge) => badge.text())
    expect(aarakocraBadges).toContain('可选规则')
    expect(dwarfBadges).not.toContain('可选规则')
  })

  it('选择兽化人后手机宽度下渲染四个子种族卡片', () => {
    window.innerWidth = 375
    window.dispatchEvent(new Event('resize'))
    const wrapper = mount(OriginStep, { props: { languages: [], raceId: 'race-2014-shifter' } })
    const text = wrapper.text()
    expect(text).toContain('选择子种族')
    expect(text).toContain('熊皮兽化人')
    expect(text).toContain('长牙兽化人')
    expect(text).toContain('疾行兽化人')
    expect(text).toContain('野猎兽化人')
  })

  it('选择费兹本龙裔后渲染色龙/宝石/金属三类型', () => {
    const wrapper = mount(OriginStep, { props: { languages: [], raceId: 'race-2014-dragonborn-fizban' } })
    const text = wrapper.text()
    expect(text).toContain('色龙裔')
    expect(text).toContain('宝石龙裔')
    expect(text).toContain('金属龙裔')
  })

  it('背景卡片展开显示背景介绍，选择经 250ms 判定后 emit background', async () => {
    const wrapper = mount(OriginStep, { props: { languages: [] } })
    const acolyteCard = wrapper.findAll('.expandable-option-card').find((card) => card.text().includes('侍僧'))
    expect(acolyteCard).toBeTruthy()
    await acolyteCard!.find('.expandable-option-card__arrow').trigger('click')
    expect(acolyteCard!.text()).toContain('背景介绍')
    expect(acolyteCard!.text()).toContain('信仰庇护')
    await acolyteCard!.find('.expandable-option-card__main').trigger('click')
    expect(wrapper.emitted('background')).toBeUndefined()
    await vi.advanceTimersByTimeAsync(250)
    expect(wrapper.emitted('background')).toHaveLength(1)
    expect(wrapper.emitted('background')![0]).toEqual(['background-2014-acolyte'])
  })

  it('正式背景变体卡片可展开并显示变体介绍', async () => {
    const wrapper = mount(OriginStep, { props: { languages: [], backgroundId: 'background-2014-sailor' } })
    const pirateCard = wrapper.findAll('.expandable-option-card').find((card) => card.text().includes('海盗'))
    expect(pirateCard).toBeTruthy()
    await pirateCard!.find('.expandable-option-card__arrow').trigger('click')
    expect(pirateCard!.text()).toContain('变体介绍')
    expect(pirateCard!.text()).toContain('恶名')
  })
})

describe('OriginStep 种族熟练自选', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  function mountWith(patch: Record<string, unknown> = {}) {
    return mount(OriginStep, { props: { languages: [], raceSkillChoices: [], ...patch } })
  }

  function choiceButtons(wrapper: ReturnType<typeof mount>, block: string): ReturnType<typeof mount>['element'][] {
    return Array.from(wrapper.element.querySelectorAll(`.origin-step__race-choices .origin-step__choices button`))
  }

  it('半精灵展示全技能 2 选且点击 emit raceSkills', async () => {
    const wrapper = mountWith({ raceId: 'race-2014-half-elf' })
    expect(wrapper.text()).toContain('半精灵熟练选择')
    expect(wrapper.text()).toContain('选择2项技能熟练')
    const buttons = choiceButtons(wrapper)
    expect(buttons.length).toBe(18)
    // 模拟父组件回写：每次点击后把 emit 结果写回 props。
    ;(buttons.find((button) => button.textContent?.includes('欺瞒')) as HTMLButtonElement).click()
    await wrapper.setProps({ raceSkillChoices: ['skill-deception'] })
    const nextButtons = choiceButtons(wrapper)
    ;(nextButtons.find((button) => button.textContent?.includes('游说')) as HTMLButtonElement).click()
    expect(wrapper.emitted('raceSkills')).toHaveLength(2)
    expect(wrapper.emitted('raceSkills')![1][0]).toEqual(['skill-deception', 'skill-persuasion'])
  })

  it('兽人限定 7 项技能', () => {
    const wrapper = mountWith({ raceId: 'race-2014-orc' })
    const block = wrapper.find('.origin-step__race-choices')
    expect(block.findAll('button').length).toBe(7)
    // 区块内不包含限定列表外的技能（背景列表中的“欺瞒”不影响）。
    expect(block.text()).not.toContain('欺瞒')
  })

  it('矮人展示工具选择并 emit raceTool（子种族继承父种族工具规格）', () => {
    const wrapper = mountWith({ raceId: 'race-2014-dwarf', subraceId: 'race-2014-dwarf-mountain' })
    expect(wrapper.text()).toContain('选择一项工具熟练')
    const buttons = choiceButtons(wrapper)
    ;(buttons.find((button) => button.textContent?.includes('盗贼工具')) as HTMLButtonElement).click()
    expect(wrapper.emitted('raceTool')).toEqual([['tool-thieves-tools']])
  })

  it('吉斯洋基技能/工具二选一互斥：选工具清空技能，选技能清空工具', async () => {
    const wrapper = mountWith({ raceId: 'race-2014-gith-githyanki', raceSkillChoices: ['skill-arcana'] })
    expect(wrapper.text()).toContain('或选择一项工具熟练（与技能二选一）')
    const buttons = choiceButtons(wrapper)
    ;(buttons.find((button) => button.textContent?.includes('盗贼工具')) as HTMLButtonElement).click()
    expect(wrapper.emitted('raceTool')?.[0]?.[0]).toBe('tool-thieves-tools')
    // 选工具时清空技能侧。
    expect(wrapper.emitted('raceSkills')?.[0]?.[0]).toEqual([])

    const skillOnly = mountWith({ raceId: 'race-2014-gith-githyanki', raceToolChoice: 'tool-thieves-tools' })
    const skillButtons = choiceButtons(skillOnly)
    ;(skillButtons.find((button) => button.textContent?.includes('奥秘')) as HTMLButtonElement).click()
    expect(skillOnly.emitted('raceSkills')?.[0]?.[0]).toEqual(['skill-arcana'])
    expect(skillOnly.emitted('raceTool')?.[0]?.[0]).toBeUndefined()
  })

  it('无熟练规格的种族不显示自选区块', () => {
    const wrapper = mountWith({ raceId: 'race-2014-human' })
    expect(wrapper.text()).not.toContain('熟练选择')
  })
})
