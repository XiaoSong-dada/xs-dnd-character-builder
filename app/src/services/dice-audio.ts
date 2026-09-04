export interface DiceAudio {
  unlock(): void
  play(durationMs: number): void
  stop(): void
  dispose(): void
}

/** Lazily created per page; all audio failures are non-fatal. */
export class DiceAudioService implements DiceAudio {
  private context?: AudioContext
  private voices = new Set<AudioBufferSourceNode>()
  private disposed = false

  unlock() {
    if (this.disposed) return
    try {
      this.context ??= new AudioContext()
      if (this.context.state === 'suspended') void this.context.resume().catch(() => {})
    } catch { /* Unsupported or blocked audio must never block a roll. */ }
  }

  play(durationMs: number) {
    this.stop()
    const context = this.context
    if (this.disposed || !context || context.state !== 'running' || durationMs <= 0) return
    try {
      const duration = Math.min(durationMs / 1000, 20)
      const start = context.currentTime
      // A single short noise buffer, shaped into increasingly quiet impacts.
      const buffer = context.createBuffer(1, Math.ceil(context.sampleRate * 0.09), context.sampleRate)
      const samples = buffer.getChannelData(0)
      let noise = 173
      for (let i = 0; i < samples.length; i++) {
        noise = (Math.imul(noise, 1664525) + 1013904223) | 0
        samples[i] = (noise / 2147483648) * Math.exp(-i / (context.sampleRate * 0.018))
      }
      for (let offset = 0; offset < duration; offset += 0.12 + offset * 0.14) {
        const source = context.createBufferSource()
        const gain = context.createGain()
        const filter = context.createBiquadFilter()
        this.voices.add(source)
        source.onended = () => {
          source.disconnect()
          gain.disconnect()
          filter.disconnect()
          this.voices.delete(source)
        }
        source.buffer = buffer
        filter.type = 'lowpass'
        filter.frequency.value = 1800
        gain.gain.value = 0.3 * Math.pow(1 - offset / duration, 1.5)
        source.connect(filter).connect(gain).connect(context.destination)
        source.start(start + offset)
        source.stop(start + Math.min(offset + 0.09, duration))
      }
    } catch { this.stop() }
  }

  stop() {
    for (const source of this.voices) {
      try { source.stop(); source.disconnect() } catch { /* Already stopped. */ }
    }
    this.voices.clear()
  }

  dispose() {
    this.disposed = true
    this.stop()
    try { void this.context?.close().catch(() => {}) } catch { /* Already closed. */ }
    this.context = undefined
  }
}
