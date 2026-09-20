import { describe, expect, it, vi } from 'vitest'

import {
  APP_BUILD_ID_FILE,
  digestDirtyContent,
  formatAppBuildId,
  parseAppBuildId,
  resolveAppBuildId,
} from '../../scripts/app-build-id'

const CWD = process.cwd()

describe('构建标识格式化规则', () => {
  it('干净工作区只保留 commit 短 hash', () => {
    expect(formatAppBuildId('abc1234')).toBe('abc1234')
  })

  it('有未提交改动时追加 -dirty- 与内容摘要', () => {
    expect(formatAppBuildId('abc1234', 'deadbeef')).toBe('abc1234-dirty-deadbeef')
  })

  it('内容摘要固定 8 位，且随片段顺序与内容变化', () => {
    const base = digestDirtyContent(['a', 'b'])
    expect(base).toMatch(/^[0-9a-f]{8}$/)
    expect(digestDirtyContent(['a', 'b'])).toBe(base)
    expect(digestDirtyContent(['b', 'a'])).not.toBe(base)
    expect(digestDirtyContent(['a', 'c'])).not.toBe(base)
  })

  it('解析时按 -dirty- 拆出 commit 与脏标记', () => {
    expect(parseAppBuildId('abc1234')).toEqual({ id: 'abc1234', commit: 'abc1234', dirty: false })
    expect(parseAppBuildId('abc1234-dirty-deadbeef')).toEqual({
      id: 'abc1234-dirty-deadbeef',
      commit: 'abc1234',
      dirty: true,
    })
  })
})

describe('构建标识来源优先级', () => {
  it('有注入值时直接采用，不再读 git', () => {
    const readProbe = vi.fn()
    const result = resolveAppBuildId(CWD, '1.8.0', 'abc1234-dirty-deadbeef', readProbe)

    expect(result).toMatchObject({ id: 'abc1234-dirty-deadbeef', commit: 'abc1234', dirty: true, source: 'injected' })
    expect(readProbe).not.toHaveBeenCalled()
  })

  it('注入值只有空白时视为未注入', () => {
    const result = resolveAppBuildId(CWD, '1.8.0', '   ', () => ({ commit: 'abc1234', dirty: false }))
    expect(result).toMatchObject({ id: 'abc1234', source: 'git' })
  })

  it('没有注入值时读本地 git：干净仓库只留 commit', () => {
    const result = resolveAppBuildId(CWD, '1.8.0', undefined, () => ({ commit: 'abc1234', dirty: false }))
    expect(result).toMatchObject({ id: 'abc1234', commit: 'abc1234', dirty: false, source: 'git' })
  })

  it('没有注入值时读本地 git：脏仓库带上内容摘要', () => {
    const result = resolveAppBuildId(CWD, '1.8.0', undefined, () => ({
      commit: 'abc1234',
      dirty: true,
      dirtyDigest: 'deadbeef',
    }))
    expect(result).toMatchObject({ id: 'abc1234-dirty-deadbeef', dirty: true, source: 'git' })
  })

  it('git 不可用时降级为 v<版本号>-nogit，而不是抛错中断构建', () => {
    const result = resolveAppBuildId(CWD, '1.8.0', undefined, () => {
      throw new Error('not a git repository')
    })

    expect(result).toMatchObject({ id: 'v1.8.0-nogit', dirty: false, source: 'fallback' })
    expect(result.commit).toBeUndefined()
  })
})

describe('构建标识产物约定', () => {
  it('产物文件名与运行时拉取的路径一致', () => {
    expect(APP_BUILD_ID_FILE).toBe('version.json')
  })
})
