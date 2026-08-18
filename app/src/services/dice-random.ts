export type Uint32Source = () => number

export function secureUint32(): number {
  if (!globalThis.crypto?.getRandomValues) {
    throw new Error('当前环境无法生成可靠的随机结果。')
  }
  const buffer = new Uint32Array(1)
  globalThis.crypto.getRandomValues(buffer)
  const value = buffer[0]
  if (value === undefined) throw new Error('当前环境无法生成可靠的随机结果。')
  return value
}

export function randomIntegerInclusive(
  minimum: number,
  maximum: number,
  source: Uint32Source = secureUint32,
): number {
  if (!Number.isInteger(minimum) || !Number.isInteger(maximum) || maximum < minimum) {
    throw new RangeError('随机整数范围无效。')
  }

  const span = maximum - minimum + 1
  const uint32Range = 0x1_0000_0000
  const acceptanceLimit = Math.floor(uint32Range / span) * span
  let value = source() >>> 0
  while (value >= acceptanceLimit) value = source() >>> 0
  return minimum + (value % span)
}

