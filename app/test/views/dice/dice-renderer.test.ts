import { describe, expect, it } from 'vitest'

import { resolveTrayTouchAction } from '@/views/dice/engine/dice-renderer'

describe('resolveTrayTouchAction', () => {
  it('交互禁用期使用 manipulation：保留滚动与捏合缩放，禁用双击缩放', () => {
    expect(resolveTrayTouchAction(false)).toBe('manipulation')
  })

  it('交互启用期使用 none：手势全部交给 3D 视图控件', () => {
    expect(resolveTrayTouchAction(true)).toBe('none')
  })
})
