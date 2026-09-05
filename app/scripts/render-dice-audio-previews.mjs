import { mkdir, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { createServer } from 'vite'

// Offline PCM rendering. New previews use exactly the live synthesizer, including its limiter.
const output = resolve(process.argv[2] ?? '../tmp/dice-audio-previews')
const sampleRate = 44100
const duration = 1.5

function legacySamples() {
  const output = new Float32Array(sampleRate * duration)
  const noise = new Float32Array(Math.ceil(sampleRate * 0.09))
  let state = 173
  for (let i = 0; i < noise.length; i++) {
    state = (Math.imul(state, 1664525) + 1013904223) | 0
    noise[i] = state / 2147483648 * Math.exp(-i / (sampleRate * 0.018))
  }
  // Web Audio lowpass coefficients: frequency 1800 Hz; default Q is 1 dB.
  const w = 2 * Math.PI * 1800 / sampleRate
  const c = Math.cos(w)
  const alpha = Math.sin(w) / (2 * Math.pow(10, 1 / 20))
  const b0 = (1 - c) / 2 / (1 + alpha), b1 = (1 - c) / (1 + alpha)
  const a1 = -2 * c / (1 + alpha), a2 = (1 - alpha) / (1 + alpha)
  for (let offset = 0; offset < duration; offset += 0.12 + offset * 0.14) {
    let x1 = 0, x2 = 0, y1 = 0, y2 = 0
    const gain = 0.3 * Math.pow(1 - offset / duration, 1.5)
    const start = Math.round(offset * sampleRate)
    // Include the biquad's decay after its 90ms source ends.
    for (let i = 0; i < sampleRate * 0.15 && start + i < output.length; i++) {
      const x = noise[i] ?? 0
      const y = b0 * x + b1 * x1 + b0 * x2 - a1 * y1 - a2 * y2
      output[start + i] += y * gain
      x2 = x1; x1 = x; y2 = y1; y1 = y
    }
  }
  return output
}

function wav(samples) {
  const data = Buffer.alloc(44 + samples.length * 2)
  data.write('RIFF', 0); data.writeUInt32LE(data.length - 8, 4); data.write('WAVEfmt ', 8)
  data.writeUInt32LE(16, 16); data.writeUInt16LE(1, 20); data.writeUInt16LE(1, 22)
  data.writeUInt32LE(sampleRate, 24); data.writeUInt32LE(sampleRate * 2, 28)
  data.writeUInt16LE(2, 32); data.writeUInt16LE(16, 34); data.write('data', 36)
  data.writeUInt32LE(samples.length * 2, 40)
  samples.forEach((sample, i) => data.writeInt16LE(Math.round(Math.max(-1, Math.min(1, sample)) * 32767), 44 + i * 2))
  return data
}

const server = await createServer({ server: { middlewareMode: true } })
try {
  await mkdir(output, { recursive: true })
  const { ClothDiceSynthesizer } = await server.ssrLoadModule('/src/services/dice-audio/synthesis.ts')
  const synth = new ClothDiceSynthesizer()
  const legacy = legacySamples()
  const report = []
  for (const [name, count] of [['1d20', 1], ['mixed', 5], ['20d6', 20]]) {
    for (const [version, samples] of [['old', legacy], ['cloth', synth.render(1500, count)]]) {
      await writeFile(resolve(output, `${name}-${version}.wav`), wav(samples))
      let peak = 0, sum = 0
      for (const value of samples) { peak = Math.max(peak, Math.abs(value)); sum += value * value }
      report.push({ name, version, seconds: samples.length / sampleRate, peak, rms: Math.sqrt(sum / samples.length) })
    }
  }
  await writeFile(resolve(output, 'metrics.json'), JSON.stringify(report, null, 2))
  await writeFile(resolve(output, 'index.html'), `<!doctype html><html lang="zh"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>布面骰子音效对照</title><style>body{font:16px system-ui;max-width:720px;margin:32px auto;padding:16px;background:#fffaf0;color:#382e26}section{padding:16px;border-bottom:1px solid #dacbb7}audio{width:100%}</style><h1>布面骰子音效对照</h1><p>每段 1.5 秒。未经主观等响度匹配，请分别比较落地质感、滚动层次和刺耳程度。新版使用应用内同一套合成器；旧版为原算法的离线复现。旧版不区分数量，三个旧版文件相同。听感待用户评价。</p>${['1d20', 'mixed', '20d6'].map(name => `<section><h2>${name === 'mixed' ? '1d20 + 2d6 + 1d100' : name}</h2><p>旧版</p><audio controls src="${name}-old.wav"></audio><p>新版布面</p><audio controls src="${name}-cloth.wav"></audio></section>`).join('')}</html>`)
  console.log(JSON.stringify({ output, report }, null, 2))
} finally {
  await server.close()
}
