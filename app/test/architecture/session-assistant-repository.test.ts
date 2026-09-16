import { readdirSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

/**
 * 架构守卫：跑团助手必须按 `draft.ruleset` 解析仓库。
 * 直接导入 `@/rules/repository`（2014 单例）会让 2024 草稿的名称/特性/法术/物品查询全部失效。
 */
describe('会话助手仓库解析守卫', () => {
  it('session-assistant 目录不得导入 2014 单例仓库', () => {
    const root = resolve(process.cwd(), 'src/views/session-assistant')
    const files: string[] = []
    const walk = (dir: string): void => {
      for (const entry of readdirSync(dir, { withFileTypes: true })) {
        const path = `${dir}/${entry.name}`
        if (entry.isDirectory()) walk(path)
        else if (/\.(ts|vue)$/.test(entry.name)) files.push(path)
      }
    }
    walk(root)

    expect(files.length).toBeGreaterThan(0)
    for (const file of files) {
      const source = readFileSync(file, 'utf-8')
      expect(source, file).not.toContain("from '@/rules/repository'")
    }
  })
})
