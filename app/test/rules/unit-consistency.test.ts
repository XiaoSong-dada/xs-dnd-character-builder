import { readdirSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

/**
 * 单位口径守卫（U03）：车卡数据与装备文档统一使用 5e 不全书用字
 * （尺／里／磅／立方尺／加仑），禁止米制与「英里」「立方英尺」。
 *
 * 说明：正则要求数字前置，因此「米诺陶」「析米克」「麦克斯米利安」等专名不会误报。
 */
const FORBIDDEN_PATTERNS = [
  { pattern: /\d\s*米/g, expected: '尺' },
  { pattern: /\d\s*千克/g, expected: '磅' },
  { pattern: /\d\s*厘米/g, expected: '尺' },
  { pattern: /\d\s*公里/g, expected: '里' },
  { pattern: /\d\s*英里|英里/g, expected: '里' },
  { pattern: /立方英尺/g, expected: '立方尺' },
] as const

function collectFiles(dir: string, extensions: RegExp): string[] {
  const files: string[] = []
  const walk = (current: string): void => {
    for (const entry of readdirSync(current, { withFileTypes: true })) {
      const path = `${current}/${entry.name}`
      if (entry.isDirectory()) walk(path)
      else if (extensions.test(entry.name)) files.push(path)
    }
  }
  walk(dir)
  return files
}

function findOffenders(files: readonly string[]): string[] {
  const offenders: string[] = []
  for (const file of files) {
    const lines = readFileSync(file, 'utf-8').split('\n')
    lines.forEach((line, index) => {
      for (const { pattern, expected } of FORBIDDEN_PATTERNS) {
        pattern.lastIndex = 0
        const matched = line.match(pattern)
        if (matched) offenders.push(`${file}:${index + 1} 出现「${matched[0].trim()}」，应使用「${expected}」`)
      }
    })
  }
  return offenders
}

describe('单位口径守卫（U03）', () => {
  it('rules/data 下的规则数据与生成物不使用米制或「英里」', () => {
    const files = collectFiles(resolve(process.cwd(), 'src/rules/data'), /\.(ts|json)$/)
    expect(files.length).toBeGreaterThan(50)
    expect(findOffenders(files)).toEqual([])
  })

  it('装备与魔法物品文档不使用米制（与生成物保持同一口径）', () => {
    const files = collectFiles(resolve(process.cwd(), '../docs/equipment/5e-2014'), /\.md$/)
    expect(files.length).toBeGreaterThan(10)
    expect(findOffenders(files)).toEqual([])
  })

  it('生成物中的装备重量与射程仍为磅与尺（射程数值未被单位迁移改写）', async () => {
    const { equipment2014 } = await import('@/rules/data/equipment-2014')
    const dagger = equipment2014.find((item) => item.id === 'dagger')
    const longbow = equipment2014.find((item) => item.id === 'longbow')
    const net = equipment2014.find((item) => item.id === 'net')
    expect(dagger?.range).toEqual([20, 60])
    expect(longbow?.range).toEqual([150, 600])
    expect(net?.range).toEqual([5, 15])
    expect(dagger?.description).toContain('20/60 尺')
    expect(longbow?.description).toContain('150/600 尺')
  })
})
