import { describe, expect, it } from 'vitest'

import { validateDraft, validateMulticlassAllocation } from '@/rules/validate'
import { deriveCharacter } from '@/rules/derive'
import { EMPTY_MANUAL_EDITS } from '@/rules/manual-edits'
import { draft2024, emptySpellSelections } from '../fixtures/draft-2024'
import type { AbilityScores, CharacterDraft, ClassLevelEntry, ClassSpellSelections } from '@/types/character'

/**
 * MC-F02：兼职校验信息的可读性。
 *
 * 标准：新玩家能理解①为什么不能兼这个职业、②这个数值来自哪个职业、③错误该怎么改。
 * 因此每条兼职相关问题都必须同时给出**中文原因**与**修正指引**，且原因里出现具体职业名。
 */

const ABILITIES: AbilityScores = { str: 13, dex: 14, con: 13, int: 13, wis: 13, cha: 16 }

const RANGER_SORCERER: readonly ClassLevelEntry[] = [
  { classId: 'class-2014-ranger', level: 4 },
  { classId: 'class-2014-sorcerer', level: 3 },
]

function mc(
  classes: readonly ClassLevelEntry[],
  options: { overrides?: Partial<CharacterDraft>; buckets?: readonly ClassSpellSelections[] } = {},
): CharacterDraft {
  const order = classes.flatMap((entry) => Array.from({ length: entry.level }, () => entry.classId))
  return draft2024({
    ruleset: '5e-2014',
    baseAbilities: ABILITIES,
    classId: classes[0]?.classId,
    targetLevel: order.length,
    multiclass: { enabled: true, primaryClassId: classes[0]?.classId ?? '', classes, levelOrder: order },
    manualEdits: EMPTY_MANUAL_EDITS,
    ...(options.buckets ? { spellSelections: { ...emptySpellSelections(), classSpellSelections: options.buckets } } : {}),
    ...options.overrides,
  })
}

describe('MC-F02 问题条目必须同时给出原因与修正指引', () => {
  it('所有兼职相关问题都带 resolution，且错误 id 稳定可追踪', () => {
    const draft = mc(
      [
        { classId: 'class-2014-ranger', level: 4 },
        { classId: 'class-2014-cleric', level: 3 },
      ],
      {
        overrides: {
          // 感知 13 满足牧师先决，但把感知压到 8 就会不满足
          baseAbilities: { str: 13, dex: 14, con: 13, int: 15, wis: 8, cha: 10 },
        },
      },
    )
    const issues = validateMulticlassAllocation(draft)
    expect(issues.length).toBeGreaterThan(0)
    for (const issue of issues) {
      expect(issue.resolution.trim().length, `${issue.id} 缺少修正指引`).toBeGreaterThan(0)
      expect(issue.message.trim().length, `${issue.id} 缺少原因说明`).toBeGreaterThan(0)
    }
  })

  it('先决不满足时说明差在哪一项属性，并指向第 5 步', () => {
    const draft = mc(
      [
        { classId: 'class-2014-fighter', level: 3 },
        { classId: 'class-2014-paladin', level: 2 },
      ],
      { overrides: { baseAbilities: { str: 10, dex: 14, con: 13, int: 13, wis: 13, cha: 13 } } },
    )
    const issue = validateMulticlassAllocation(draft).find((item) => item.id === 'multiclass-prerequisite-class-2014-paladin')
    expect(issue).toBeDefined()
    expect(issue?.message).toContain('圣武士')
    expect(issue?.message).toContain('13')
    expect(issue?.message).toContain('力量')
    expect(issue?.resolution).toContain('第 5 步')
  })

  it('职业等级越界时说明范围与当前值，并说明如何移除该职业', () => {
    const draft = mc([{ classId: 'class-2014-fighter', level: 3 }], {
      overrides: {
        multiclass: {
          enabled: true,
          primaryClassId: 'class-2014-fighter',
          classes: [
            { classId: 'class-2014-fighter', level: 3 },
            { classId: 'class-2014-rogue', level: 20 },
          ],
          levelOrder: [],
        },
        targetLevel: 23,
      },
    })
    const issues = validateMulticlassAllocation(draft)
    const rogue = issues.find((item) => item.id === 'multiclass-class-level-class-2014-rogue')
    expect(rogue?.message).toContain('游荡者')
    expect(rogue?.message).toContain('19')
    expect(rogue?.message).toContain('20')
    expect(rogue?.resolution).toContain('把等级降到 0')
    const outOfRange = issues.find((item) => item.id === 'multiclass-total-out-of-range')
    expect(outOfRange?.message).toContain('20')
    expect(outOfRange?.resolution).toContain('职业等级')
  })

  it('单职业 20 级不再被判越界（D42：上限按是否兼职区分）', () => {
    const draft = mc([{ classId: 'class-2014-fighter', level: 20 }], {
      overrides: {
        multiclass: {
          enabled: false,
          primaryClassId: 'class-2014-fighter',
          classes: [{ classId: 'class-2014-fighter', level: 20 }],
          levelOrder: [],
        },
        targetLevel: 20,
      },
    })
    const issues = validateMulticlassAllocation(draft)
    expect(issues.find((item) => item.id.startsWith('multiclass-class-level-'))).toBeUndefined()
  })
})

describe('MC-F02 法术问题的职业归属与修正指引', () => {
  it('游侠侧选了 2 环法术时，错误指明职业、法术名与最高环级', () => {
    const draft = mc(RANGER_SORCERER, {
      buckets: [
        { classId: 'class-2014-ranger', cantripIds: [], knownSpellIds: ['spell-2014-cure-wounds', 'spell-2014-alarm', 'spell-2014-barkskin'], preparedSpellIds: [], spellbookSpellIds: [] },
        { classId: 'class-2014-sorcerer', cantripIds: ['spell-2014-fire-bolt', 'spell-2014-acid-splash', 'spell-2014-chill-touch', 'spell-2014-blade-ward'], knownSpellIds: ['spell-2014-blur', 'spell-2014-burning-hands', 'spell-2014-charm-person', 'spell-2014-color-spray'], preparedSpellIds: [], spellbookSpellIds: [] },
      ],
    })
    const issue = validateDraft(draft).find((item) => item.id === 'unavailable-spell-class-2014-ranger')
    expect(issue).toBeDefined()
    expect(issue?.message).toContain('游侠（4级）')
    expect(issue?.message).toContain('树肤术')
    expect(issue?.resolution).toContain('1 环')
    expect(issue?.resolution).toContain('提高游侠的等级')
  })

  it('数量未完成时按职业分别报错，并指向该职业的任务', () => {
    const draft = mc(RANGER_SORCERER, {
      buckets: [
        { classId: 'class-2014-ranger', cantripIds: [], knownSpellIds: ['spell-2014-cure-wounds'], preparedSpellIds: [], spellbookSpellIds: [] },
        { classId: 'class-2014-sorcerer', cantripIds: ['spell-2014-fire-bolt'], knownSpellIds: ['spell-2014-blur'], preparedSpellIds: [], spellbookSpellIds: [] },
      ],
    })
    const issues = validateDraft(draft)
    const ranger = issues.find((item) => item.id === 'spell-count-class-2014-ranger')
    const sorcerer = issues.find((item) => item.id === 'spell-count-class-2014-sorcerer')
    expect(ranger?.message).toContain('游侠（4级）')
    expect(ranger?.message).toContain('已选 1 个，需要 3 个')
    expect(ranger?.resolution).toContain('游侠')
    expect(sorcerer?.message).toContain('术士（3级）')
    expect(sorcerer?.message).toContain('需要 4 个')
    // 戏法只由术士提供，游侠侧不应报戏法问题
    expect(issues.some((item) => item.id === 'cantrip-count-class-2014-ranger')).toBe(false)
    expect(issues.find((item) => item.id === 'cantrip-count-class-2014-sorcerer')?.message).toContain('已选 1 个，需要 4 个')
  })

  it('派生数值标注来源职业，玩家能看到「这个数值来自哪个职业」', () => {
    const draft = mc([
      { classId: 'class-2014-fighter', level: 3 },
      { classId: 'class-2014-rogue', level: 2 },
    ])
    const derived = deriveCharacter(draft)
    // 熟练加值按总等级（5 级 → +3），来源写明等级口径
    expect(derived.proficiencyBonus.value).toBe(3)
    expect(derived.proficiencyBonus.sources.some((source) => source.detail?.includes('5'))).toBe(true)
    // 豁免熟练只来自起始职业，且来源里能读到具体职业
    const strSave = derived.savingThrows.str
    expect(strSave.sources.some((source) => source.label === '职业豁免熟练' && source.detail?.includes('战士'))).toBe(true)
    expect(derived.savingThrows.wis.sources.some((source) => source.label === '职业豁免熟练')).toBe(false)
  })

  it('兼职草稿的校验结果里不出现原始英文 id（可读性底线）', () => {
    const draft = mc(RANGER_SORCERER, {
      buckets: [
        { classId: 'class-2014-ranger', cantripIds: [], knownSpellIds: ['spell-2014-barkskin'], preparedSpellIds: [], spellbookSpellIds: [] },
      ],
    })
    for (const issue of validateDraft(draft)) {
      expect(issue.message).not.toMatch(/class-2014-|spell-2014-|subclass-2014-/)
    }
  })
})
