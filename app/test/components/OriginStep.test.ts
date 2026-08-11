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
