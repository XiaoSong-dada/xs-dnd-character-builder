import { afterEach, describe, expect, it, vi } from 'vitest'

import { DiceAudioService } from '@/services/dice-audio'

afterEach(() => vi.unstubAllGlobals())

describe('dice audio', () => {
  it('is lazy and tolerates unsupported audio', () => {
    const create = vi.fn(function () { throw new Error('unavailable') })
    vi.stubGlobal('AudioContext', create)
    const audio = new DiceAudioService()
    expect(create).not.toHaveBeenCalled()
    expect(() => { audio.unlock(); audio.play(100); audio.dispose() }).not.toThrow()
  })

  it('stops scheduled impacts and closes resources, including after playback failure', () => {
    const sources: { stop: ReturnType<typeof vi.fn>; disconnect: ReturnType<typeof vi.fn> }[] = []
    const close = vi.fn(() => Promise.resolve())
    const node = () => ({ connect: vi.fn(function () { return target }), disconnect: vi.fn() })
    const target = { ...node(), gain: { value: 0 }, frequency: { value: 0 }, type: '' }
    const context = {
      state: 'running', currentTime: 0, sampleRate: 1000, destination: {}, close,
      createBuffer: () => ({ getChannelData: () => new Float32Array(90) }),
      createGain: () => target, createBiquadFilter: () => target,
      createBufferSource: vi.fn(() => {
        const source = { ...node(), start: vi.fn(), stop: vi.fn(), buffer: null, onended: null }
        sources.push(source)
        return source
      }),
    }
    vi.stubGlobal('AudioContext', function () { return context })
    const audio = new DiceAudioService()
    audio.unlock()
    audio.play(500)
    expect(sources.length).toBeGreaterThan(1)
    audio.stop()
    for (const source of sources) expect(source.disconnect).toHaveBeenCalled()
    context.createBufferSource.mockImplementation(() => { throw new Error('failed') })
    expect(() => audio.play(500)).not.toThrow()
    audio.dispose()
    expect(close).toHaveBeenCalledOnce()
  })

  it('handles blocked resume without an unhandled rejection', async () => {
    vi.stubGlobal('AudioContext', function () {
      return { state: 'suspended', resume: () => Promise.reject(new Error('blocked')), close: () => Promise.resolve() }
    })
    const audio = new DiceAudioService()
    audio.unlock()
    await Promise.resolve()
    expect(() => audio.play(200)).not.toThrow()
    audio.dispose()
  })
})
