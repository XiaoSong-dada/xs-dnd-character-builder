import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { deriveCharacter } from '@/rules/derive'
import CharacterSheetStep from '@/views/character-builder/components/CharacterSheetStep.vue'
import SpellcastingStep from '@/views/character-builder/components/SpellcastingStep.vue'
import type { CharacterDraft } from '@/types/character'
import { draft2024 } from '../fixtures/draft-2024'

vi.mock('@/rules/item-catalog-loader', async () => {
  const { magicItemsCatalog2014 } = await import('@/rules/data/generated/magic-items-catalog-2014')
  return { loadItemCatalog: vi.fn(() => Promise.resolve(magicItemsCatalog2014)), resetItemCatalogCache: vi.fn() }
})

const FORBIDDEN = /(?<![A-Za-z])(STR|DEX|CON|INT|WIS|CHA)(?![A-Za-z])/

function fighter(ruleset: '5e-2014' | '5e-2024'): CharacterDraft {
  return draft2024({
    ruleset,
    classId: ruleset === '5e-2024' ? 'class-2024-fighter' : 'class-2014-fighter',
    raceId: ruleset === '5e-2024' ? 'species-2024-human' : 'race-2014-human',
    backgroundId: ruleset === '5e-2024' ? 'background-2024-soldier' : 'background-2014-soldier',
    targetLevel: 5,
  })
}

describe('B09-11 能力与技能属性标签中文化（界面）', () => {
  beforeEach(() => {
    localStorage.clear()
    setActivePinia(createPinia())
  })

  it('法术步骤头部显示中文施法属性', () => {
    const draft = draft2024({ classId: 'class-2024-wizard', subclassId: 'subclass-2024-wizard-evoker', targetLevel: 5 })
    const wrapper = mount(SpellcastingStep, { props: { draft } })

    expect(wrapper.text()).toContain('智力施法')
    expect(wrapper.text()).not.toContain('INT施法')
  })

  it('角色卡能力页签的技能与豁免不再出现英文属性简写', () => {
    for (const ruleset of ['5e-2024', '5e-2014'] as const) {
      const draft = fighter(ruleset)
      const wrapper = mount(CharacterSheetStep, { props: { draft, derived: deriveCharacter(draft) } })

      expect(wrapper.text()).toContain('敏捷调整值')
      expect(FORBIDDEN.test(wrapper.text()), `${ruleset} 角色卡仍含英文属性简写`).toBe(false)
    }
  })
})
