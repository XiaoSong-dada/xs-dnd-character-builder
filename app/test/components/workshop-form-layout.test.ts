import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

/**
 * 提取 scoped SCSS 中指定规则块（含嵌套内容，按花括号配对）。
 * jsdom 没有布局，这里只锁定窄屏表单的源码契约；实际像素由浏览器设备模拟验证。
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

const customFieldSource = readFileSync(
  resolve(process.cwd(), 'src/features/custom-content/components/CustomField.vue'),
  'utf8',
)
const spellFormSource = readFileSync(
  resolve(process.cwd(), 'src/views/workshop/edit/components/SpellForm.vue'),
  'utf8',
)
const raceFormSource = readFileSync(
  resolve(process.cwd(), 'src/views/workshop/edit/components/RaceForm.vue'),
  'utf8',
)

describe('内容工坊窄屏表单布局（v1.14.0 修复）', () => {
  it('CustomField 内部列可收缩，控件填满字段且不撑出列', () => {
    const field = extractBlock(customFieldSource, '.custom-field {')
    expect(field).toContain('grid-template-columns: minmax(0, 1fr)')
    expect(field).toContain('min-width: 0')

    const controls = extractBlock(
      customFieldSource,
      ":deep(input:not([type='checkbox']):not([type='radio']))",
    )
    expect(controls).toContain('width: 100%')
    expect(controls).toContain('min-width: 0')
    expect(controls).toContain('max-width: 100%')
  })

  it('SpellForm 的施法信息窄屏降为单列', () => {
    const grid = extractBlock(spellFormSource, '&__grid')
    expect(grid).toContain('grid-template-columns: repeat(2, minmax(0, 1fr))')
    expect(grid).toMatch(
      /@media \(max-width: 32rem\)\s*\{[\s\S]*?grid-template-columns:\s*minmax\(0,\s*1fr\);/,
    )
  })

  it('RaceForm 的原生属性加值输入不按浏览器默认宽度溢出', () => {
    const ability = extractBlock(raceFormSource, '&__ability {')
    expect(ability).toContain('grid-template-columns: minmax(0, 1fr)')
    expect(ability).toContain('min-width: 0')
    expect(ability).toMatch(/input\s*\{[\s\S]*?width:\s*100%;[\s\S]*?min-width:\s*0;/)
  })
})
