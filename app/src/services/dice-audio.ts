import { ClothDiceSynthesizer } from '@/services/dice-audio/synthesis'

export interface DiceAudio {
  unlock(): void
  play(durationMs: number, physicalDiceCount: number): void
  stop(): void
  dispose(): void
}

/** AudioContext is created only from a user gesture. Resume never schedules playback. */
export class DiceAudioService implements DiceAudio {
  private context?: AudioContext
  private voice?: AudioBufferSourceNode
  private disposed = false
  private sequence = 0
  private synthesizer = new ClothDiceSynthesizer()

  unlock() {
    if (this.disposed) return
    try {
      this.context ??= new AudioContext()
      if (this.context.state === 'suspended') void this.context.resume().catch(() => {})
    } catch { /* Audio is optional. */ }
  }

  play(durationMs: number, physicalDiceCount: number) {
    this.stop()
    const context = this.context
    if (this.disposed || !context || context.state !== 'running') return
    try {
      const samples = this.synthesizer.render(durationMs, physicalDiceCount, 173 + this.sequence++, context.sampleRate)
      if (!samples.length) return
      const buffer = context.createBuffer(1, samples.length, context.sampleRate)
      buffer.getChannelData(0).set(samples)
      const source = context.createBufferSource()
      this.voice = source
      source.buffer = buffer
      source.onended = () => {
        source.disconnect()
        source.onended = null
        if (this.voice === source) this.voice = undefined
      }
      source.connect(context.destination)
      source.start(context.currentTime)
      source.stop(context.currentTime + samples.length / context.sampleRate)
    } catch { this.stop() }
  }

  stop() {
    const source = this.voice
    this.voice = undefined
    if (!source) return
    source.onended = null
    try { source.stop() } catch { /* Already stopped. */ }
    try { source.disconnect() } catch { /* Already disconnected. */ }
  }

  dispose() {
    this.disposed = true
    this.stop()
    this.synthesizer.clear()
    try { void this.context?.close().catch(() => {}) } catch { /* Already closed. */ }
    this.context = undefined
  }
}
