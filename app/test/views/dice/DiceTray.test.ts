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
  pickDie: vi.fn(),
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
    pickDie = rendererMocks.pickDie
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
      props: { status: 'idle', reducedMotion: false, physicalCount: 6, canReroll: false },
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
      props: { status: 'idle', reducedMotion: false, physicalCount: 1, canReroll: false },
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


it.each([800, 6000])('plays the complete %i ms trajectory within 1500 ms', async (durationMs) => {
  let frame: FrameRequestCallback | undefined
  vi.spyOn(performance, 'now').mockReturnValue(0)
  vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => { frame = callback; return 1 })
  const value = { ...presentation, trajectory: { ...presentation.trajectory, durationMs } }
  const wrapper = mount(DiceTray, { props: { status: 'rolling', reducedMotion: false, physicalCount: 1, presentation: value, canReroll: false } })
  const duration = Math.min(durationMs, 1500)
  expect(wrapper.emitted('started')).toEqual([['roll-1', duration]])
  frame?.(duration / 2)
  expect(rendererMocks.renderAt).toHaveBeenLastCalledWith(value.trajectory, durationMs / 2)
  expect(wrapper.emitted('complete')).toBeUndefined()
  frame?.(duration)
  expect(rendererMocks.renderAt).toHaveBeenLastCalledWith(value.trajectory, durationMs)
  expect(wrapper.emitted('complete')).toEqual([['roll-1']])
  wrapper.unmount()
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

function dispatchPointer(target: EventTarget, type: string, pointerId: number, clientX: number, clientY: number) {
  const event = new Event(type, { bubbles: true, cancelable: true })
  Object.assign(event, { pointerId, clientX, clientY })
  target.dispatchEvent(event)
}

describe('DiceTray single die reroll picking', () => {
  beforeEach(() => vi.clearAllMocks())

  function mountComplete() {
    return mount(DiceTray, {
      props: { status: 'complete', reducedMotion: false, physicalCount: 1, presentation, canReroll: true },
    })
  }

  it('emits the picked logical die for a short single-pointer tap', async () => {
    rendererMocks.pickDie.mockReturnValue('d6-1')
    const wrapper = mountComplete()
    const canvas = wrapper.get('canvas').element
    dispatchPointer(canvas, 'pointerdown', 1, 120, 140)
    dispatchPointer(canvas, 'pointerup', 1, 122, 142)
    await wrapper.vm.$nextTick()
    expect(rendererMocks.pickDie).toHaveBeenCalledWith(122, 142)
    expect(wrapper.emitted('reroll')).toEqual([['d6-1']])
    wrapper.unmount()
  })

  it('does not reroll when the pointer drags across the tray', async () => {
    rendererMocks.pickDie.mockReturnValue('d6-1')
    const wrapper = mountComplete()
    const canvas = wrapper.get('canvas').element
    dispatchPointer(canvas, 'pointerdown', 1, 120, 140)
    dispatchPointer(canvas, 'pointerup', 1, 160, 140)
    await wrapper.vm.$nextTick()
    expect(rendererMocks.pickDie).not.toHaveBeenCalled()
    expect(wrapper.emitted('reroll')).toBeUndefined()
    wrapper.unmount()
  })

  it('ignores two-finger gestures and taps while reroll is unavailable', async () => {
    rendererMocks.pickDie.mockReturnValue('d6-1')
    const wrapper = mountComplete()
    const canvas = wrapper.get('canvas').element
    dispatchPointer(canvas, 'pointerdown', 1, 120, 140)
    dispatchPointer(canvas, 'pointerdown', 2, 220, 140)
    dispatchPointer(canvas, 'pointerup', 1, 121, 141)
    dispatchPointer(canvas, 'pointerup', 2, 220, 140)
    expect(wrapper.emitted('reroll')).toBeUndefined()

    await wrapper.setProps({ canReroll: false })
    dispatchPointer(canvas, 'pointerdown', 3, 120, 140)
    dispatchPointer(canvas, 'pointerup', 3, 120, 140)
    expect(rendererMocks.pickDie).not.toHaveBeenCalled()
    expect(wrapper.emitted('reroll')).toBeUndefined()
    wrapper.unmount()
  })

  it('ignores a pointer held longer than a tap', async () => {
    vi.useFakeTimers()
    rendererMocks.pickDie.mockReturnValue('d6-1')
    const wrapper = mountComplete()
    const canvas = wrapper.get('canvas').element
    dispatchPointer(canvas, 'pointerdown', 1, 120, 140)
    await vi.advanceTimersByTimeAsync(700)
    dispatchPointer(canvas, 'pointerup', 1, 120, 140)
    expect(rendererMocks.pickDie).not.toHaveBeenCalled()
    expect(wrapper.emitted('reroll')).toBeUndefined()
    vi.useRealTimers()
    wrapper.unmount()
  })
})
