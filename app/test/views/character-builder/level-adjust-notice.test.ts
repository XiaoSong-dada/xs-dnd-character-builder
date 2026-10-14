import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

/**
 * 引导条模板契约（需求 §4.1，决策 D31）。
 *
 * 引导条的可点击性必须跟随 `levelAdjustNotice.step`：没有目标步骤时不显示
 * 「点击前往对应步骤处理。」、也不显示手型光标——修掉「写了『点击前往』但点了没反应」。
 * 页面 hook 侧另有「产出的引导条一定带 `step`」的不变式断言（`useCharacterBuilderPage.test.ts`）。
 */
describe('角色卡等级调整引导条 · 模板契约', () => {
  const source = readFileSync(resolve(process.cwd(), 'src/views/character-builder/index.vue'), 'utf-8')

  it('只有存在目标步骤时才显示可点击提示与手型光标', () => {
    expect(source).toContain("'builder-level-notice--static': !levelAdjustNotice.step")
    expect(source).toContain("levelAdjustNotice.step ? '点击前往对应步骤处理。' : ''")
  })

  it('不可点击形态隐藏空提示并去掉手型光标', () => {
    expect(source).toContain('&--static')
    expect(source).toContain('cursor: default')
    expect(source).toContain('p:empty')
  })
})
