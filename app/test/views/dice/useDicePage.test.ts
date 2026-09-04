import { createPinia } from 'pinia'
import { mount } from '@vue/test-utils'
import { defineComponent, nextTick } from 'vue'
import { describe, expect, it, vi } from 'vitest'

import type { DiceAudio } from '@/services/dice-audio'
import type { DiceWorkerResponse, RollRequest } from '@/types/dice'
import { DICE_ROLL_DEADLINE_MS, useDicePage } from '@/views/dice/hooks/useDicePage'

function mountDicePage(responseFactory: (request: RollRequest) => DiceWorkerResponse | Promise<DiceWorkerResponse>, pinia = createPinia(), audio?: DiceAudio) {
  const terminate = vi.fn()
  const cancel = vi.fn()
  const simulate = vi.fn((request: RollRequest) => Promise.resolve(responseFactory(request)))
  const component = defineComponent({
    setup() {
      return useDicePage({
        createAudio: audio ? () => audio : undefined,
        randomUint32: () => 123,
        randomInteger: (minimum) => minimum,
        createWorkerClient: () => ({ simulate, cancel, terminate }),
      })
    },
    template: '<div />',
  })
  return { wrapper: mount(component, { global: { plugins: [pinia] } }), simulate, cancel, terminate }
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

  it('falls back at the three second deadline and ignores a late worker response', async () => {
    vi.useFakeTimers()
    let pendingRequest: RollRequest | undefined
    let resolveResponse: ((response: DiceWorkerResponse) => void) | undefined
    const deferred = new Promise<DiceWorkerResponse>((resolve) => { resolveResponse = resolve })
    const { wrapper, terminate } = mountDicePage((request) => {
      pendingRequest = request
      return deferred
    })
    const page = wrapper.vm as unknown as ReturnType<typeof useDicePage>
    page.addDie('d6')
    const rolling = page.roll()

    await vi.advanceTimersByTimeAsync(DICE_ROLL_DEADLINE_MS - 1)
    expect(page.status).toBe('preparing')
    await vi.advanceTimersByTimeAsync(1)
    expect(page.status).toBe('fallback')
    expect(page.results[0]?.value).toBe(1)
    expect(page.notice).toContain('超过 3 秒')
    expect(terminate).toHaveBeenCalledOnce()
    expect(DICE_ROLL_DEADLINE_MS).toBe(3000)

    if (pendingRequest) resolveResponse?.(successResponse(pendingRequest))
    await rolling
    expect(page.status).toBe('fallback')
    expect(page.results[0]?.value).toBe(1)
    wrapper.unmount()
    vi.useRealTimers()
  })

  it('applies the same deadline while a successful trajectory is playing', async () => {
    vi.useFakeTimers()
    const { wrapper } = mountDicePage(successResponse)
    const page = wrapper.vm as unknown as ReturnType<typeof useDicePage>
    page.addDie('d20')
    await page.roll()
    expect(page.status).toBe('rolling')
    const staleRollId = page.presentation?.request.id ?? ''

    await vi.advanceTimersByTimeAsync(DICE_ROLL_DEADLINE_MS)
    expect(page.status).toBe('fallback')
    expect(page.presentation).toBeUndefined()
    page.handlePlaybackComplete(staleRollId)
    expect(page.status).toBe('fallback')
    wrapper.unmount()
    vi.useRealTimers()
  })
})


describe('dice session retention', () => {
  it('skips physics and retains results and preferences across remounts', async () => {
    const pinia = createPinia()
    const first = mountDicePage(successResponse, pinia)
    const page = first.wrapper.vm as unknown as ReturnType<typeof useDicePage>
    page.addDie('d100')
    page.setSkipAnimation(true)
    page.setSoundEnabled(false)
    await page.roll()
    expect(first.simulate).not.toHaveBeenCalled()
    expect(page.status).toBe('complete')
    const results = JSON.parse(JSON.stringify(page.results))
    first.wrapper.unmount()
    const second = mountDicePage(successResponse, pinia)
    const restored = second.wrapper.vm as unknown as ReturnType<typeof useDicePage>
    expect(restored.results).toEqual(results)
    expect(restored.expression).toBe('1d100')
    expect(restored.skipAnimation).toBe(true)
    expect(restored.soundEnabled).toBe(false)
    expect(restored.presentation).toBeUndefined()
    expect(restored.isBusy).toBe(false)
    second.wrapper.unmount()
    const fresh = mountDicePage(successResponse)
    expect(fresh.wrapper.vm.results).toEqual([])
    fresh.wrapper.unmount()
  })

  it.each(['preparing', 'rolling'])('settles on leaving while %s and ignores stale completion', async (phase) => {
    const pinia = createPinia()
    let resolveResponse: ((response: DiceWorkerResponse) => void) | undefined
    let request: RollRequest | undefined
    const first = mountDicePage((input) => {
      request = input
      return phase === 'rolling' ? successResponse(input) : new Promise((resolve) => { resolveResponse = resolve })
    }, pinia)
    const page = first.wrapper.vm as unknown as ReturnType<typeof useDicePage>
    page.addDie('d20')
    const pending = page.roll()
    if (phase === 'rolling') await pending
    expect(page.status).toBe(phase)
    first.wrapper.unmount()
    const second = mountDicePage(successResponse, pinia)
    const restored = second.wrapper.vm as unknown as ReturnType<typeof useDicePage>
    expect(restored.total).toBe(1)
    expect(restored.isBusy).toBe(false)
    restored.addDie('d6')
    restored.setSkipAnimation(true)
    await restored.roll()
    if (request) {
      resolveResponse?.(successResponse(request))
      page.handlePlaybackComplete(request.id)
    }
    await pending
    expect(restored.total).toBe(2)
    expect(restored.results).toHaveLength(2)
    second.wrapper.unmount()
  })
})


describe('dice audio coordination', () => {
  it('plays once at animation start, stops on mute and disposes on leaving', async () => {
    const audio = { unlock: vi.fn(), play: vi.fn(), stop: vi.fn(), dispose: vi.fn() }
    const { wrapper } = mountDicePage(successResponse, createPinia(), audio)
    const page = wrapper.vm as unknown as ReturnType<typeof useDicePage>
    page.addDie('d6')
    await page.roll()
    expect(audio.unlock).toHaveBeenCalledOnce()
    expect(audio.play).not.toHaveBeenCalled()
    const id = page.presentation?.request.id ?? ''
    page.handlePlaybackStarted(id, 400)
    page.handlePlaybackStarted(id, 400)
    expect(audio.play).toHaveBeenCalledExactlyOnceWith(400)
    page.setSkipAnimation(true)
    expect(page.skipAnimation).toBe(false)
    audio.stop.mockClear()
    page.setSoundEnabled(false)
    expect(audio.stop).toHaveBeenCalledOnce()
    page.handlePlaybackComplete(id)
    expect(page.results).toHaveLength(1)
    const previous = page.results
    page.setSkipAnimation(true)
    expect(page.results).toEqual(previous)
    await page.roll()
    expect(audio.unlock).toHaveBeenCalledOnce()
    expect(audio.play).toHaveBeenCalledOnce()
    wrapper.unmount()
    expect(audio.dispose).toHaveBeenCalledOnce()
  })

  it('does not play for muted or reduced-motion rolls and stops on fallback', async () => {
    const audio = { unlock: vi.fn(), play: vi.fn(), stop: vi.fn(), dispose: vi.fn() }
    const { wrapper } = mountDicePage(successResponse, createPinia(), audio)
    const page = wrapper.vm as unknown as ReturnType<typeof useDicePage>
    page.addDie('d6')
    page.setSoundEnabled(false)
    await page.roll()
    page.handlePlaybackStarted(page.presentation?.request.id ?? '', 100)
    expect(audio.play).not.toHaveBeenCalled()
    page.handlePlaybackComplete(page.presentation?.request.id ?? '')
    page.setSoundEnabled(true)
    wrapper.vm.reducedMotion = true
    await page.roll()
    page.handlePlaybackStarted(page.presentation?.request.id ?? '', 100)
    expect(audio.play).not.toHaveBeenCalled()
    page.handleRendererUnavailable()
    expect(page.status).toBe('fallback')
    expect(audio.stop).toHaveBeenCalled()
    wrapper.unmount()
  })
})


it('checks elapsed time before accepting a worker response after a suspended timer', async () => {
  let clock = 0
  const now = vi.spyOn(performance, 'now').mockImplementation(() => clock)
  let resolveResponse: ((response: DiceWorkerResponse) => void) | undefined
  let request: RollRequest | undefined
  const { wrapper, terminate } = mountDicePage((value) => {
    request = value
    return new Promise((resolve) => { resolveResponse = resolve })
  })
  const page = wrapper.vm as unknown as ReturnType<typeof useDicePage>
  page.addDie('d6')
  const pending = page.roll()
  clock = 3100
  if (request) resolveResponse?.(successResponse(request))
  await pending
  expect(page.status).toBe('fallback')
  expect(page.total).toBe(1)
  expect(terminate).toHaveBeenCalledOnce()
  wrapper.unmount()
  now.mockRestore()
})

it('settles on visibility change and recreates the worker for the next roll', async () => {
  let clock = 0
  const now = vi.spyOn(performance, 'now').mockImplementation(() => clock)
  const audio = { unlock: vi.fn(), play: vi.fn(), stop: vi.fn(), dispose: vi.fn() }
  const terminate = vi.fn()
  const createWorkerClient = vi.fn(() => ({ simulate: async (request: RollRequest) => successResponse(request), cancel: vi.fn(), terminate }))
  const component = defineComponent({ setup: () => useDicePage({ randomUint32: () => 1, randomInteger: (minimum) => minimum, createWorkerClient, createAudio: () => audio }), template: '<div />' })
  const wrapper = mount(component, { global: { plugins: [createPinia()] } })
  const page = wrapper.vm as unknown as ReturnType<typeof useDicePage>
  page.addDie('d20')
  await page.roll()
  const oldId = page.presentation?.request.id ?? ''
  page.handlePlaybackStarted(oldId, 1500)
  clock = 4000
  document.dispatchEvent(new Event('visibilitychange'))
  expect(page.status).toBe('fallback')
  expect(terminate).toHaveBeenCalledOnce()
  expect(audio.stop).toHaveBeenCalled()
  await page.roll()
  expect(createWorkerClient).toHaveBeenCalledTimes(2)
  page.handlePlaybackComplete(oldId)
  expect(page.status).toBe('rolling')
  page.handlePlaybackComplete(page.presentation?.request.id ?? '')
  expect(page.total).toBe(1)
  wrapper.unmount()
  now.mockRestore()
})
