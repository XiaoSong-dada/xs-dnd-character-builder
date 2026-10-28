import { readdirSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

import { CUSTOM_ENTRY_PREFIX, CUSTOM_SOURCE_PREFIX, isCustomEntryId, isCustomSourceId } from '@/rules/custom-content'

function collect(dir: string, pattern: RegExp): string[] {
  const files: string[] = []
  const walk = (current: string): void => {
    for (const entry of readdirSync(current, { withFileTypes: true })) {
      const path = `${current}/${entry.name}`
      if (entry.isDirectory()) walk(path)
      else if (pattern.test(entry.name)) files.push(path)
    }
  }
  walk(dir)
  return files
}

/**
 * 架构守卫（内容工坊）：
 * 1. `src/rules` 必须保持框架无关——不得依赖 Vue/Pinia/路由/DOM 存储/页面模块；
 * 2. 自定义内容 ID 前缀是本需求的稳定契约（草稿引用与导入导出都依赖它）；
 * 3. 内置数据目录不得引用内容工坊模块（内置数据保持静态只读）。
 */
describe('内容工坊架构守卫', () => {
  it('rules 目录不得依赖页面、store、service 或 Vue 层', () => {
    const root = resolve(process.cwd(), 'src/rules')
    const files = collect(root, /\.ts$/)
    expect(files.length).toBeGreaterThan(0)

    const forbidden = [
      "from '@/views",
      "from '@/stores",
      "from '@/services",
      "from '@/hooks",
      "from '@/components",
      "from '@/features",
      "from 'vue'",
      "from 'pinia'",
      "from 'vue-router'",
    ]
    for (const file of files) {
      const source = readFileSync(file, 'utf-8')
      for (const marker of forbidden) {
        expect(source.includes(marker), `${file} 不应包含 ${marker}`).toBe(false)
      }
    }
  })

  it('内置规则数据目录不得引用内容工坊模块', () => {
    const root = resolve(process.cwd(), 'src/rules/data')
    for (const file of collect(root, /\.ts$/)) {
      const source = readFileSync(file, 'utf-8')
      expect(source.includes("from '@/rules/custom-content"), `${file} 不应引用内容工坊模块`).toBe(false)
    }
  })

  it('自定义内容 ID 前缀保持稳定', () => {
    expect(CUSTOM_ENTRY_PREFIX).toBe('custom-')
    expect(CUSTOM_SOURCE_PREFIX).toBe('source-custom-')
    expect(isCustomEntryId('custom-race-abc')).toBe(true)
    expect(isCustomEntryId('source-custom-abc')).toBe(false)
    expect(isCustomSourceId('source-custom-abc')).toBe(true)
    expect(isCustomSourceId('source-2024-phb')).toBe(false)
  })
})
