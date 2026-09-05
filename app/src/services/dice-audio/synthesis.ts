/** Shared by live playback and offline WAV previews. No browser or game state. */
export interface ClothImpact {
  at: number
  duration: number
  frequency: number
  cutoff: number
  gain: number
  body: number
}

function randomSequence(seed: number) {
  let state = seed >>> 0
  return () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0
    return state / 4294967296
  }
}

export function planClothImpacts(durationMs: number, physicalCount: number, seed: number): ClothImpact[] {
  if (!Number.isFinite(durationMs) || durationMs <= 0) return []
  const duration = Math.min(durationMs, 1500) / 1000
  const dice = Number.isFinite(physicalCount) ? Math.max(1, Math.min(20, Math.floor(physicalCount))) : 1
  const count = Math.min(16, 5 + Math.ceil(2.5 * Math.sqrt(dice)))
  const random = randomSequence(seed)
  return Array.from({ length: count }, (_, index) => {
    const progress = index / (count - 1)
    const landing = index === 0
    const settling = index === count - 1
    const at = duration * (0.1 + 0.8 * Math.pow(progress, 1.45))
    const length = landing ? 0.075 : settling ? 0.045 : 0.025 + random() * 0.03
    return {
      at,
      duration: Math.min(length, duration * 0.1),
      frequency: 120 + random() * 100,
      cutoff: 350 + random() * 750,
      gain: (landing ? 0.7 : settling ? 0.12 : 0.42 * Math.pow(1 - progress, 1.2)) * (0.9 + random() * 0.2),
      body: landing ? 0.7 : settling ? 0.55 : 0.25,
    }
  })
}

export class ClothDiceSynthesizer {
  private noise?: Float32Array
  private noiseRate = 0

  render(durationMs: number, physicalCount: number, seed = 173, sampleRate = 44100): Float32Array {
    const impacts = planClothImpacts(durationMs, physicalCount, seed)
    if (!impacts.length) return new Float32Array()
    const length = Math.ceil(Math.min(durationMs, 1500) / 1000 * sampleRate)
    const output = new Float32Array(length)
    const envelopes = new Float32Array(length)
    if (!this.noise || this.noiseRate !== sampleRate) {
      const random = randomSequence(173)
      this.noise = Float32Array.from({ length: Math.ceil(sampleRate * 0.1) }, () => random() * 2 - 1)
      this.noiseRate = sampleRate
    }
    let peakEnvelope = 0
    impacts.forEach((impact, index) => {
      const start = Math.round(impact.at * sampleRate)
      const frames = Math.floor(impact.duration * sampleRate)
      const coefficient = 1 - Math.exp(-2 * Math.PI * impact.cutoff / sampleRate)
      let filtered = 0
      for (let frame = 0; frame < frames && start + frame < length; frame++) {
        const time = frame / sampleRate
        const progress = frame / Math.max(1, frames - 1)
        const attack = Math.min(1, time / Math.min(0.004, impact.duration / 4))
        const envelope = attack * Math.exp(-5 * progress) * (1 - progress) * impact.gain
        filtered += coefficient * ((this.noise?.[(frame + index * 137) % this.noise.length] ?? 0) - filtered)
        const body = Math.sin(2 * Math.PI * impact.frequency * time)
        const offset = start + frame
        output[offset] = (output[offset] ?? 0) + envelope * (body * impact.body + filtered * (1 - impact.body))
        envelopes[offset] = (envelopes[offset] ?? 0) + envelope
        peakEnvelope = Math.max(peakEnvelope, envelopes[offset] ?? 0)
      }
    })
    const gain = 0.65 / Math.max(1, peakEnvelope)
    // Memoryless soft compression has no look-ahead delay or tail after stop.
    for (let i = 0; i < output.length; i++) output[i] = 0.6 * Math.tanh((output[i] ?? 0) * gain / 0.6)
    return output
  }

  clear() {
    this.noise = undefined
    this.noiseRate = 0
  }
}
