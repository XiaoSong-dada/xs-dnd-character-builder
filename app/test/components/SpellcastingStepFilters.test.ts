import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

/**
 * 提取 scoped SCSS 中 `&__xxx {` 规则块（含嵌套内容，按花括号配对）。
 * 组件样式不做布局计算，故以源码契约断言筛选行的列定义与断点写法（v1.9.1 R2-6）。
 */
function extractBlock(source: string, selector: string): string {
  const start = source.indexOf(selector)
  expect(start, `未找到 ${selector}`).toBeGreaterThanOrEqual(0)
  const open = source.indexOf('{', start)
  let depth = 0
  for (let index = open; index < source.length; index += 1) {
    if (source[index] === '{') depth += 1
    else if (source[index] === '}') {
      depth -= 1
      if (depth === 0) return source.slice(open, index + 1)
    }
  }
  throw new Error(`${selector} 规则块未闭合`)
}

const spellcastingStepSource = readFileSync(
  resolve(process.cwd(), 'src/views/character-builder/components/SpellcastingStep.vue'),
  'utf8',
)
const shellSource = readFileSync(
  resolve(process.cwd(), 'src/features/quick-build/components/QuickBuildShell.vue'),
  'utf8',
)

describe('SpellcastingStep 筛选行容器自适应（v1.9.1 R2）', () => {
  it('筛选行不以视口断点决定列数', () => {
    expect(extractBlock(spellcastingStepSource, '&__filters')).not.toContain('@media')
    // 车卡容器恒为 32rem：本组件不得再以视口 max-width 切换筛选布局
    const styleSection = spellcastingStepSource.slice(spellcastingStepSource.indexOf('<style'))
    expect(styleSection).not.toContain('@media (max-width')
  })

  it('列定义可收缩到容器宽度，不使用固定 rem 最小列宽', () => {
    const columns = extractBlock(spellcastingStepSource, '&__filters').match(/grid-template-columns:[^;]+;/)
    expect(columns, '筛选行需声明列定义').toBeTruthy()
    expect(columns![0]).toContain('auto-fit')
    expect(columns![0]).not.toMatch(/minmax\(\s*[\d.]+rem/)
  })

  it('保留触控高度与下拉可收缩约定', () => {
    const block = extractBlock(spellcastingStepSource, '&__filters')
    expect(block).toContain('min-height: 2.75rem')
    expect(block).toMatch(/select\s*\{[\s\S]*min-width: 0/)
  })

  it('车卡容器宽度口径不变（32rem，不随桌面加宽）', () => {
    expect(shellSource).toContain('width: min(100%, 32rem)')
  })
})
