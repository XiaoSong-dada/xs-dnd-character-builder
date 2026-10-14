import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import CharacterDrawer from '@/features/quick-build/components/CharacterDrawer.vue'
import type { DerivedCharacterSummary } from '@/types/character'

/** MC-E05 车卡吸底摘要：职业行必须与角色卡头部、草稿列表用同一格式。 */
function summary(overrides: Partial<DerivedCharacterSummary> = {}): DerivedCharacterSummary {
  return { level: 5, className: '战士', proficiencyBonus: '+3', ...overrides }
}

describe('CharacterDrawer 职业行（MC-E05）', () => {
  it('多职业显示「战士3 / 游荡者2（5 级角色）」', () => {
    const wrapper = mount(CharacterDrawer, {
      props: {
        summary: summary({ classLabel: '战士3 / 游荡者2（5 级角色）' }),
        completion: 60,
      },
    })
    expect(wrapper.text()).toContain('战士3 / 游荡者2（5 级角色）')
    // 不再退化成「5级 战士」这种只带起始职业的写法
    expect(wrapper.text()).not.toContain('5级 战士')
  })

  it('单职业显示「战士5」，不出现总等级括注', () => {
    const wrapper = mount(CharacterDrawer, {
      props: { summary: summary({ classLabel: '战士5' }), completion: 100 },
    })
    expect(wrapper.text()).toContain('战士5')
  })

  it('未选职业时退回「N级 · 尚未选择职业」', () => {
    const wrapper = mount(CharacterDrawer, {
      props: { summary: summary({ className: undefined, classLabel: undefined }), completion: 10 },
    })
    expect(wrapper.text()).toContain('5级 · 尚未选择职业')
  })
})
