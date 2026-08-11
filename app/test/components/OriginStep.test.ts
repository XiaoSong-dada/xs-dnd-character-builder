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
})
