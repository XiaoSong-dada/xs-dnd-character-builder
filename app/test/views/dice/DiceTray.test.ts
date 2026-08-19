import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { DicePresentation } from '@/types/dice'
import DiceTray from '@/views/dice/components/DiceTray.vue'

const rendererMocks = vi.hoisted(() => ({
  setTrayLayout: vi.fn(),
  resize: vi.fn(),
  setPresentation: vi.fn(),
  renderAt: vi.fn(),
  setInteractionEnabled: vi.fn(),
  zoomIn: vi.fn(),
  zoomOut: vi.fn(),
  resetView: vi.fn(),
  clearPresentation: vi.fn(),
  dispose: vi.fn(),
}))

vi.mock('@/views/dice/engine/dice-renderer', () => ({
  DiceRenderer: class {
    setTrayLayout = rendererMocks.setTrayLayout
    resize = rendererMocks.resize
    setPresentation = rendererMocks.setPresentation
    renderAt = rendererMocks.renderAt
    setInteractionEnabled = rendererMocks.setInteractionEnabled
    zoomIn = rendererMocks.zoomIn
    zoomOut = rendererMocks.zoomOut
    resetView = rendererMocks.resetView
    clearPresentation = rendererMocks.clearPresentation
    dispose = rendererMocks.dispose
  },
}))

const presentation: DicePresentation = {
  request: {
    id: 'roll-1',
    seed: 1,
    dice: [{ id: 'd6-1', logicalId: 'd6-1', type: 'd6', resultKind: 'standard', targetValue: 4 }],
  },
  trajectory: {
    rollId: 'roll-1',
    diceIds: ['d6-1'],
    frameRate: 60,
    frameCount: 1,
    durationMs: 0,
    transforms: new Float32Array([0, 0, 0, 0, 0, 0, 1]),
    landingDirectionIndices: [0],
  },
}

describe('DiceTray', () => {
  beforeEach(() => vi.clearAllMocks())

  it('enables view buttons only for a completed visual roll', async () => {
    const wrapper = mount(DiceTray, {
      props: { status: 'idle', reducedMotion: false, physicalCount: 6 },
    })
    const zoomIn = wrapper.get('button[aria-label="放大骰盘视图"]')
    expect(zoomIn.attributes('disabled')).toBeDefined()
    expect(rendererMocks.setTrayLayout).toHaveBeenCalledWith(6)
    expect(rendererMocks.setInteractionEnabled).toHaveBeenCalledWith(false)

    await wrapper.setProps({ status: 'complete', presentation })
    expect(zoomIn.attributes('disabled')).toBeUndefined()
    expect(rendererMocks.setInteractionEnabled).toHaveBeenCalledWith(true)
    await zoomIn.trigger('click')
    await wrapper.get('button[aria-label="缩小骰盘视图"]').trigger('click')
    await wrapper.get('button[aria-label="复位骰盘视图"]').trigger('click')
    expect(rendererMocks.zoomIn).toHaveBeenCalledOnce()
    expect(rendererMocks.zoomOut).toHaveBeenCalledOnce()
    expect(rendererMocks.resetView).toHaveBeenCalled()

    await wrapper.setProps({ status: 'fallback', presentation: undefined })
    expect(rendererMocks.clearPresentation).toHaveBeenCalled()
    expect(zoomIn.attributes('disabled')).toBeDefined()
    wrapper.unmount()
  })

  it('shows the two-finger hint while view controls are enabled and dismisses it automatically', async () => {
    vi.useFakeTimers()
    const wrapper = mount(DiceTray, {
      props: { status: 'idle', reducedMotion: false, physicalCount: 1 },
    })
    expect(wrapper.find('[role="status"]').exists()).toBe(false)

    await wrapper.setProps({ status: 'complete', presentation })
    const hint = wrapper.get('[role="status"]')
    expect(hint.text()).toContain('双指拖动')
    expect(hint.text()).toContain('捏合缩放')

    // 提示自动消失，不阻断操作
    await vi.advanceTimersByTimeAsync(4000)
    expect(wrapper.find('[role="status"]').exists()).toBe(false)

    // 新一轮投掷结果公布后重新展示
    await wrapper.setProps({ status: 'rolling', presentation: undefined })
    await wrapper.setProps({ status: 'complete', presentation })
    expect(wrapper.find('[role="status"]').exists()).toBe(true)

    // 离开交互启用态立即隐藏
    await wrapper.setProps({ status: 'idle', presentation: undefined })
    expect(wrapper.find('[role="status"]').exists()).toBe(false)

    vi.useRealTimers()
    wrapper.unmount()
  })
})
