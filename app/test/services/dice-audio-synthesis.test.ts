import { describe, expect, it } from 'vitest'

import { ClothDiceSynthesizer, planClothImpacts } from '@/services/dice-audio/synthesis'

describe('cloth dice synthesis', () => {
  it.each([1, 5, 20])('renders bounded, non-silent and reproducible audio for %i dice', (count) => {
    const synth = new ClothDiceSynthesizer()
    const samples = synth.render(1500, count)
    expect(samples.length).toBe(66150)
    let peak = 0
    let energy = 0
    for (const sample of samples) {
      expect(Number.isFinite(sample)).toBe(true)
      peak = Math.max(peak, Math.abs(sample))
      energy += sample * sample
    }
    expect(peak).toBeGreaterThan(0.05)
    expect(peak).toBeLessThan(0.6)
    expect(energy).toBeGreaterThan(0)
    expect(samples.slice(0, 6000).every((value) => value === 0)).toBe(true)
    expect(samples.at(-1)).toBe(0)
    expect(synth.render(1500, count)).toEqual(samples)
    expect(synth.render(1500, count, 174)).not.toEqual(samples)
    synth.clear()
    expect(synth.render(1500, count)).toEqual(samples)
  })

  it.each([1, 20, 100, 800, 1500])('keeps every impact inside a %i ms playback', (duration) => {
    const events = planClothImpacts(duration, 20, 173)
    expect(events.length).toBeLessThanOrEqual(16)
    expect(events[0]?.at).toBeCloseTo(duration / 10000)
    for (const event of events) {
      expect(event.at + event.duration).toBeLessThanOrEqual(duration / 1000 + 1e-9)
    }
    const samples = new ClothDiceSynthesizer().render(duration, 20)
    expect(samples.length).toBe(Math.ceil(duration / 1000 * 44100))
  })

  it('handles invalid duration and caps dice count', () => {
    const synth = new ClothDiceSynthesizer()
    for (const duration of [0, -1, NaN, Infinity]) expect(synth.render(duration, 1)).toHaveLength(0)
    expect(planClothImpacts(1500, 200, 173)).toEqual(planClothImpacts(1500, 20, 173))
    expect(planClothImpacts(1500, 1, 173).length).toBeLessThan(planClothImpacts(1500, 20, 173).length)
  })
})
