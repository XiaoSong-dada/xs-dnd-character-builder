import { afterEach, describe, expect, it } from 'vitest'

import { draft2024 } from '../fixtures/draft-2024'
import { emptyBundle } from '@/rules/custom-content'
import { getFeatPool } from '@/rules/feats'
import { getAvailableSpells } from '@/rules/spellcasting'
import { getRulesRepository, registerCustomContent, resetCustomContent } from '@/rules/repositories'
import type { CustomExpansion, CustomFeatEntry, CustomSpellEntry } from '@/types/custom-content'
import type { CharacterDraft } from '@/types/character'

const NOW = '2026-10-19T00:00:00.000Z'

function expansion(ruleset: '5e-2014' | '5e-2024'): CustomExpansion {
  return {
    id: 'source-custom-pool',
    ruleset,
    title: '池测试书',
    shortTitle: '池测',
    defaultEnabled: true,
    createdAt: NOW,
    updatedAt: NOW,
  }
}

function featEntry(ruleset: '5e-2014' | '5e-2024', category?: CustomFeatEntry['category']): CustomFeatEntry {
  return {
    kind: 'feat',
    id: 'custom-feat-pool',
    expansionId: 'source-custom-pool',
    ruleset,
    name: '工坊专长',
    englishName: 'Workshop Feat',
    summary: '自制专长',
    description: '说明',
    createdAt: NOW,
    updatedAt: NOW,
    ...(category ? { category } : {}),
  }
}

function spellEntry(ruleset: '5e-2014' | '5e-2024', classId: string): CustomSpellEntry {
  return {
    kind: 'spell',
    id: 'custom-spell-pool',
    expansionId: 'source-custom-pool',
    ruleset,
    name: '工坊法术',
    englishName: 'Workshop Spell',
    summary: '自制法术',
    description: '说明',
    createdAt: NOW,
    updatedAt: NOW,
    level: 1,
    classIds: [classId],
  }
}

function wizardDraft2014(enabledSourceIds: readonly string[]): CharacterDraft {
  return {
    ...draft2024({
      ruleset: '5e-2014',
      classId: 'class-2014-wizard',
      targetLevel: 5,
      enabledSourceIds,
    }),
    multiclass: undefined,
  }
}

function wizardDraft2024(enabledSourceIds: readonly string[]): CharacterDraft {
  return draft2024({
    classId: 'class-2024-wizard',
    targetLevel: 5,
    enabledSourceIds,
  })
}

function wizardConfig(ruleset: '5e-2014' | '5e-2024') {
  const config = getRulesRepository(ruleset).getClass(ruleset === '5e-2014' ? 'class-2014-wizard' : 'class-2024-wizard')?.spellcasting
  if (!config) throw new Error('wizard spellcasting config missing')
  return config
}

describe('内容工坊：专长与法术的候选池联动', () => {
  afterEach(() => {
    resetCustomContent()
  })

  it('2024 origin 类别的自定义专长进入起源专长候选池', () => {
    registerCustomContent('5e-2024', {
      ...emptyBundle(),
      expansions: [expansion('5e-2024')],
      feats: [featEntry('5e-2024', 'origin')],
    })
    const repository = getRulesRepository('5e-2024')
    const pool = getFeatPool(repository, ['origin'], { enabledSourceIds: ['source-custom-pool'] })
    expect(pool.map((feat) => feat.id)).toContain('custom-feat-pool')
  })

  it('2014 自定义专长以通用类别进入候选池', () => {
    registerCustomContent('5e-2014', {
      ...emptyBundle(),
      expansions: [expansion('5e-2014')],
      feats: [featEntry('5e-2014')],
    })
    const repository = getRulesRepository('5e-2014')
    const pool = getFeatPool(repository, ['general'], { enabledSourceIds: ['source-custom-pool'] })
    expect(pool.map((feat) => feat.id)).toContain('custom-feat-pool')
  })

  it('关闭自定义来源后专长不再出现在候选池', () => {
    registerCustomContent('5e-2024', {
      ...emptyBundle(),
      expansions: [expansion('5e-2024')],
      feats: [featEntry('5e-2024', 'origin')],
    })
    const repository = getRulesRepository('5e-2024')
    const pool = getFeatPool(repository, ['origin'], { enabledSourceIds: [] })
    expect(pool.map((feat) => feat.id)).not.toContain('custom-feat-pool')
  })

  it('2014 自定义法术进入法师第 8 步候选池', () => {
    registerCustomContent('5e-2014', {
      ...emptyBundle(),
      expansions: [expansion('5e-2014')],
      spells: [spellEntry('5e-2014', 'class-2014-wizard')],
    })
    const draft = wizardDraft2014(['source-custom-pool'])
    const available = getAvailableSpells(draft, wizardConfig('5e-2014'))
    expect(available.map((spell) => spell.id)).toContain('custom-spell-pool')
  })

  it('2024 自定义法术进入法师第 8 步候选池', () => {
    registerCustomContent('5e-2024', {
      ...emptyBundle(),
      expansions: [expansion('5e-2024')],
      spells: [spellEntry('5e-2024', 'class-2024-wizard')],
    })
    const draft = wizardDraft2024(['source-custom-pool'])
    const available = getAvailableSpells(draft, wizardConfig('5e-2024'))
    expect(available.map((spell) => spell.id)).toContain('custom-spell-pool')
  })

  it('关闭自定义来源后法术不再出现在第 8 步候选池', () => {
    registerCustomContent('5e-2024', {
      ...emptyBundle(),
      expansions: [expansion('5e-2024')],
      spells: [spellEntry('5e-2024', 'class-2024-wizard')],
    })
    const draft = wizardDraft2024([])
    const available = getAvailableSpells(draft, wizardConfig('5e-2024'))
    expect(available.map((spell) => spell.id)).not.toContain('custom-spell-pool')
  })

  it('未登记职业归属的自定义法术不会自动进入任何职业池', () => {
    registerCustomContent('5e-2024', {
      ...emptyBundle(),
      expansions: [expansion('5e-2024')],
      spells: [{ ...spellEntry('5e-2024', 'class-2024-wizard'), classIds: [] }],
    })
    const repository = getRulesRepository('5e-2024')
    const wizard = repository.getClass('class-2024-wizard')
    expect(wizard?.spellcasting?.classSpellIds).not.toContain('custom-spell-pool')
  })
})
