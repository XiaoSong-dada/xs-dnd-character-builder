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

    await wrapper.setProps({ status: 'complete', presentation })
    expect(zoomIn.attributes('disabled')).toBeUndefined()
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
})
