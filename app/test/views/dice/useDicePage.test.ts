import { mount } from '@vue/test-utils'
import { defineComponent, nextTick } from 'vue'
import { describe, expect, it, vi } from 'vitest'

import type { DiceWorkerResponse, RollRequest } from '@/types/dice'
import { useDicePage } from '@/views/dice/hooks/useDicePage'

function mountDicePage(responseFactory: (request: RollRequest) => DiceWorkerResponse) {
  const terminate = vi.fn()
  const simulate = vi.fn(async (request: RollRequest) => responseFactory(request))
  const component = defineComponent({
    setup() {
      return useDicePage({
        randomUint32: () => 123,
        randomInteger: (minimum) => minimum,
        createWorkerClient: () => ({ simulate, terminate }),
      })
    },
    template: '<div />',
  })
  return { wrapper: mount(component), simulate, terminate }
}

function successResponse(request: RollRequest): DiceWorkerResponse {
  const frameCount = 2
  const values = Array(frameCount * request.dice.length * 7).fill(0)
  for (let frame = 0; frame < frameCount; frame += 1) {
    request.dice.forEach((_, index) => { values[(frame * request.dice.length + index) * 7 + 6] = 1 })
  }
  return {
    type: 'success',
    trajectory: {
      rollId: request.id,
      diceIds: request.dice.map((die) => die.id),
      frameRate: 60,
      frameCount,
      durationMs: 33,
      transforms: new Float32Array(values),
      landingDirectionIndices: request.dice.map(() => 0),
    },
  }
}

describe('useDicePage', () => {
  it('builds a mixed pool and reveals results only after playback', async () => {
    const { wrapper } = mountDicePage(successResponse)
    const page = wrapper.vm as unknown as ReturnType<typeof useDicePage>
    page.addDie('d20')
    page.addDie('d100')
    expect(page.physicalDiceCount).toBe(3)
    expect(page.expression).toBe('1d20 + 1d100')

    await page.roll()
    expect(page.status).toBe('rolling')
    expect(page.results).toEqual([])
    const rollId = page.presentation?.request.id
    expect(rollId).toBeTruthy()
    page.handlePlaybackComplete(rollId ?? '')
    await nextTick()
    expect(page.status).toBe('complete')
    expect(page.results).toHaveLength(2)
    expect(page.total).toBe(2)
    wrapper.unmount()
  })

  it('enforces the twenty physical die limit with d100 costing two', () => {
    const { wrapper } = mountDicePage(successResponse)
    const page = wrapper.vm as unknown as ReturnType<typeof useDicePage>
    for (let index = 0; index < 10; index += 1) page.addDie('d100')
    expect(page.physicalDiceCount).toBe(20)
    expect(page.canAdd('d4')).toBe(false)
    expect(page.canAdd('d100')).toBe(false)
    wrapper.unmount()
  })

  it('falls back to textual results when physics fails', async () => {
    const { wrapper } = mountDicePage((request) => ({ type: 'failure', rollId: request.id, reason: 'cocked' }))
    const page = wrapper.vm as unknown as ReturnType<typeof useDicePage>
    page.addDie('d6')
    await page.roll()
    expect(page.status).toBe('fallback')
    expect(page.results[0]?.value).toBe(1)
    expect(page.notice).toContain('公平文字结果')
    wrapper.unmount()
  })

  it('clears stale results after the pool changes', async () => {
    const { wrapper } = mountDicePage((request) => ({ type: 'failure', rollId: request.id, reason: 'timeout' }))
    const page = wrapper.vm as unknown as ReturnType<typeof useDicePage>
    page.addDie('d6')
    await page.roll()
    expect(page.results).toHaveLength(1)
    page.addDie('d4')
    expect(page.results).toEqual([])
    expect(page.status).toBe('idle')
    wrapper.unmount()
  })
})
