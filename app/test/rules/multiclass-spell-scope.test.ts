import { describe, expect, it } from 'vitest'

import {
  getAvailableSpells,
  getClassSpellcastingProfiles,
  getEffectiveSpellSlots,
  getRequiredCantripCount,
  getRequiredSpellCount,
  getSelectedSpellIds,
  getSpellCandidates,
  getSpellcastingScope,
  listSpellcastingScopes,
  validateSpellSelections,
  validateSpellSelectionScope,
} from '@/rules/spellcasting'
import { EMPTY_MANUAL_EDITS } from '@/rules/manual-edits'
import { draft2024 } from '../fixtures/draft-2024'
import type { AbilityScores, CharacterDraft, ClassLevelEntry, ClassSpellSelections } from '@/types/character'

/**
 * MC-D02／D03：施法作用域、逐职业数量与候选、每职业施法属性。
 *
 * 锁定案例：`游侠4/术士3`（需求 §1.3 成功标准第 2 条）。
 * - 游侠 4 级最高 1 环、已知 3 个；术士 3 级最高 2 环、已知 4 个、戏法 4 个；
 * - 总等级 7 → 施法等级 5 → 法术位 4/3/2（法术位本身由 `multiclass-spell-slots` 锁定）。
 */

const ABILITIES: AbilityScores = { str: 13, dex: 14, con: 13, int: 13, wis: 13, cha: 16 }

function mc(classes: readonly ClassLevelEntry[], spellSelections?: Partial<CharacterDraft['spellSelections']>): CharacterDraft {
  const order = classes.flatMap((entry) => Array.from({ length: entry.level }, () => entry.classId))
  return draft2024({
    ruleset: '5e-2014',
    baseAbilities: ABILITIES,
    classId: classes[0]?.classId,
    targetLevel: order.length,
    multiclass: { enabled: true, primaryClassId: classes[0]?.classId ?? '', classes, levelOrder: order },
    manualEdits: EMPTY_MANUAL_EDITS,
    ...(spellSelections ? { spellSelections: { ...draft2024().spellSelections, ...spellSelections } } : {}),
  })
}

const RANGER_SORCERER: readonly ClassLevelEntry[] = [
  { classId: 'class-2014-ranger', level: 4 },
  { classId: 'class-2014-sorcerer', level: 3 },
]

function scopeOf(draft: CharacterDraft, classId: string) {
  const scope = getSpellcastingScope(draft, classId)
  if (!scope) throw new Error(`未解析出 ${classId} 的施法作用域`)
  return scope
}

describe('MC-D03 施法作用域解析', () => {
  it('逐职业解析出各自的作用域与职业等级', () => {
    const draft = mc(RANGER_SORCERER)
    const scopes = listSpellcastingScopes(draft)
    expect(scopes.map((scope) => [scope.classId, scope.className, scope.classLevel])).toEqual([
      ['class-2014-ranger', '游侠', 4],
      ['class-2014-sorcerer', '术士', 3],
    ])
    // 每个作用域带自己的法术选择分桶，互不共用
    expect(scopes[0]?.selections.cantripIds).toEqual([])
    expect(scopes[1]?.selections.cantripIds).toEqual([])
  })

  it('非施法职业不产生作用域（战士3/游荡者2 无施法）', () => {
    const draft = mc([
      { classId: 'class-2014-fighter', level: 3 },
      { classId: 'class-2014-rogue', level: 2 },
    ])
    expect(listSpellcastingScopes(draft)).toEqual([])
  })

  it('单职业草稿只有一个作用域，等级取角色等级', () => {
    const solo = draft2024({ ruleset: '5e-2014', classId: 'class-2014-sorcerer', targetLevel: 5, baseAbilities: ABILITIES })
    const scopes = listSpellcastingScopes(solo)
    expect(scopes).toHaveLength(1)
    expect(scopes[0]?.classLevel).toBe(5)
  })

  it('没有自己分桶的职业不会读到起始职业的法术', () => {
    // 顶层数组里有游侠的戏法/法术，但术士没有自己的分桶
    const draft = mc(RANGER_SORCERER, { cantripIds: ['spell-2014-acid-splash'], knownSpellIds: ['spell-2014-cure-wounds'] })
    expect(scopeOf(draft, 'class-2014-ranger').selections.cantripIds).toEqual(['spell-2014-acid-splash'])
    expect(scopeOf(draft, 'class-2014-sorcerer').selections.cantripIds).toEqual([])
    expect(scopeOf(draft, 'class-2014-sorcerer').selections.knownSpellIds).toEqual([])
  })

  it('有分桶时以分桶为准，起始职业与第二职业各读各的', () => {
    const buckets: ClassSpellSelections[] = [
      { classId: 'class-2014-ranger', cantripIds: [], knownSpellIds: ['spell-2014-cure-wounds'], preparedSpellIds: [], spellbookSpellIds: [] },
      { classId: 'class-2014-sorcerer', cantripIds: ['spell-2014-acid-splash'], knownSpellIds: ['spell-2014-blur'], preparedSpellIds: [], spellbookSpellIds: [] },
    ]
    const draft = mc(RANGER_SORCERER, { classSpellSelections: buckets })
    expect(scopeOf(draft, 'class-2014-ranger').selections.knownSpellIds).toEqual(['spell-2014-cure-wounds'])
    expect(scopeOf(draft, 'class-2014-sorcerer').selections.knownSpellIds).toEqual(['spell-2014-blur'])
    expect(scopeOf(draft, 'class-2014-sorcerer').selections.cantripIds).toEqual(['spell-2014-acid-splash'])
  })
})

describe('MC-D03 逐职业数量与候选', () => {
  it('游侠侧按游侠 4 级：已知 3 个、最高 1 环、无戏法', () => {
    const draft = mc(RANGER_SORCERER)
    const scope = scopeOf(draft, 'class-2014-ranger')
    expect(getRequiredSpellCount(draft, scope.config, scope)).toBe(3)
    expect(getRequiredCantripCount(draft, scope.config, scope)).toBe(0)
    const available = getAvailableSpells(draft, scope.config, scope)
    expect(Math.max(...available.map((spell) => spell.level))).toBe(1)
    // 2 环游侠法术（树肤术）在游侠 4 级时不可选
    expect(available.some((spell) => spell.id === 'spell-2014-barkskin')).toBe(false)
    // 1 环游侠法术可选
    expect(available.some((spell) => spell.id === 'spell-2014-cure-wounds')).toBe(true)
  })

  it('术士侧按术士 3 级：已知 4 个、戏法 4 个、最高 2 环', () => {
    const draft = mc(RANGER_SORCERER)
    const scope = scopeOf(draft, 'class-2014-sorcerer')
    expect(getRequiredSpellCount(draft, scope.config, scope)).toBe(4)
    expect(getRequiredCantripCount(draft, scope.config, scope)).toBe(4)
    const available = getAvailableSpells(draft, scope.config, scope)
    expect(Math.max(...available.map((spell) => spell.level))).toBe(2)
    expect(available.some((spell) => spell.id === 'spell-2014-blur')).toBe(true)
    // 3 环术士法术（闪现术）在术士 3 级时不可选
    expect(available.some((spell) => spell.id === 'spell-2014-blink')).toBe(false)
  })

  it('同一法术不会同时出现在两个职业的候选里（除非两版都登记）', () => {
    const draft = mc(RANGER_SORCERER)
    const ranger = new Set(getAvailableSpells(draft, scopeOf(draft, 'class-2014-ranger').config, scopeOf(draft, 'class-2014-ranger')).map((spell) => spell.id))
    const sorcerer = getAvailableSpells(draft, scopeOf(draft, 'class-2014-sorcerer').config, scopeOf(draft, 'class-2014-sorcerer')).map((spell) => spell.id)
    // 疗伤术是游侠法术，不是术士法术
    expect(ranger.has('spell-2014-cure-wounds')).toBe(true)
    expect(sorcerer).not.toContain('spell-2014-cure-wounds')
    // 朦胧术是术士法术，不是游侠法术
    expect(sorcerer).toContain('spell-2014-blur')
    expect(ranger.has('spell-2014-blur')).toBe(false)
  })

  it('已选列表按职业分桶读取', () => {
    const buckets: ClassSpellSelections[] = [
      { classId: 'class-2014-ranger', cantripIds: [], knownSpellIds: ['spell-2014-cure-wounds'], preparedSpellIds: [], spellbookSpellIds: [] },
      { classId: 'class-2014-sorcerer', cantripIds: ['spell-2014-acid-splash'], knownSpellIds: ['spell-2014-blur', 'spell-2014-burning-hands'], preparedSpellIds: [], spellbookSpellIds: [] },
    ]
    const draft = mc(RANGER_SORCERER, { classSpellSelections: buckets })
    const ranger = scopeOf(draft, 'class-2014-ranger')
    const sorcerer = scopeOf(draft, 'class-2014-sorcerer')
    expect(getSelectedSpellIds(draft, ranger.config, ranger)).toEqual(['spell-2014-cure-wounds'])
    expect(getSelectedSpellIds(draft, sorcerer.config, sorcerer)).toEqual(['spell-2014-blur', 'spell-2014-burning-hands'])
  })

  it('known 模式没有可更换候选（与改造前一致）', () => {
    const draft = mc(RANGER_SORCERER)
    const scope = scopeOf(draft, 'class-2014-sorcerer')
    expect(getSpellCandidates(draft, scope.config, scope)).toEqual({ prepared: [], writeToBook: [], prepareFromBook: [] })
  })

  it('省略作用域参数时退回起始职业 + 角色总等级（单职业口径）', () => {
    const solo = draft2024({ ruleset: '5e-2014', classId: 'class-2014-ranger', targetLevel: 4, baseAbilities: ABILITIES })
    const config = listSpellcastingScopes(solo)[0]!.config
    // 默认作用域用 targetLevel（4），结果与显式传作用域一致
    expect(getRequiredSpellCount(solo, config)).toBe(3)
    expect(getAvailableSpells(solo, config).some((spell) => spell.id === 'spell-2014-barkskin')).toBe(false)
  })
})

describe('MC-D03 逐职业校验', () => {
  it('游侠侧准备了 2 环游侠法术时判为非法（环级上限按职业等级）', () => {
    const buckets: ClassSpellSelections[] = [
      { classId: 'class-2014-ranger', cantripIds: [], knownSpellIds: ['spell-2014-cure-wounds', 'spell-2014-barkskin'], preparedSpellIds: [], spellbookSpellIds: [] },
    ]
    const draft = mc(RANGER_SORCERER, { classSpellSelections: buckets })
    const ranger = scopeOf(draft, 'class-2014-ranger')
    expect(validateSpellSelectionScope(draft, ranger)).toBe(false)
    expect(validateSpellSelections(draft)).toBe(false)
    // 换成三个 1 环游侠法术即合法
    const legal = mc(RANGER_SORCERER, {
      classSpellSelections: [{
        classId: 'class-2014-ranger',
        cantripIds: [],
        knownSpellIds: ['spell-2014-cure-wounds', 'spell-2014-alarm', 'spell-2014-animal-friendship'],
        preparedSpellIds: [],
        spellbookSpellIds: [],
      }],
    })
    expect(validateSpellSelectionScope(legal, scopeOf(legal, 'class-2014-ranger'))).toBe(true)
  })

  it('数量按各职业自己的等级表：术士 3 级多于 4 个已知法术即非法', () => {
    const draft = mc(RANGER_SORCERER, {
      classSpellSelections: [{
        classId: 'class-2014-sorcerer',
        cantripIds: ['spell-2014-acid-splash', 'spell-2014-blade-ward', 'spell-2014-chill-touch', 'spell-2014-dancing-lights'],
        knownSpellIds: ['spell-2014-blur', 'spell-2014-burning-hands', 'spell-2014-charm-person', 'spell-2014-color-spray', 'spell-2014-alter-self'],
        preparedSpellIds: [],
        spellbookSpellIds: [],
      }],
    })
    expect(validateSpellSelectionScope(draft, scopeOf(draft, 'class-2014-sorcerer'))).toBe(false)
  })
})

describe('MC-D02 每职业施法属性', () => {
  it('游侠与术士各自给出法术攻击与豁免 DC', () => {
    const draft = mc(RANGER_SORCERER)
    const profiles = getClassSpellcastingProfiles(draft)
    // 总等级 7 → 熟练 +3；游侠感知 13（+1）、术士魅力 16（+3）
    expect(profiles.map((profile) => ({
      classId: profile.classId,
      ability: profile.ability,
      attack: profile.attackBonus,
      dc: profile.saveDc,
      max: profile.maxSpellLevel,
    }))).toEqual([
      { classId: 'class-2014-ranger', ability: 'wis', attack: 4, dc: 12, max: 1 },
      { classId: 'class-2014-sorcerer', ability: 'cha', attack: 6, dc: 14, max: 2 },
    ])
  })

  it('契约池职业标记 pact 且按自身等级给出最高环级', () => {
    const draft = mc([
      { classId: 'class-2014-warlock', level: 3 },
      { classId: 'class-2014-wizard', level: 5 },
    ])
    const profiles = getClassSpellcastingProfiles(draft)
    const warlock = profiles.find((profile) => profile.classId === 'class-2014-warlock')
    const wizard = profiles.find((profile) => profile.classId === 'class-2014-wizard')
    expect(warlock?.pact).toBe(true)
    expect(warlock?.maxSpellLevel).toBe(2)
    expect(warlock?.classLevel).toBe(3)
    expect(wizard?.pact).toBe(false)
    expect(wizard?.mode).toBe('spellbook')
    expect(wizard?.maxSpellLevel).toBe(3)
  })

  it('非施法职业不产生施法属性行', () => {
    const draft = mc([
      { classId: 'class-2014-fighter', level: 3 },
      { classId: 'class-2014-rogue', level: 2 },
    ])
    expect(getClassSpellcastingProfiles(draft)).toEqual([])
  })

  it('契约池与通用池同环并存：契约池不再覆盖通用环位（D02）', () => {
    const draft = mc([
      { classId: 'class-2014-warlock', level: 3 },
      { classId: 'class-2014-wizard', level: 5 },
    ])
    const slots = getEffectiveSpellSlots(draft)
    // 通用 4/3/2 与契约 2 个 2 环同时存在；此前按环级去重会让契约池覆盖 2 环通用位
    expect(slots.filter((slot) => !slot.pact).map((slot) => `${slot.level}:${slot.count}`)).toEqual(['1:4', '2:3', '3:2'])
    expect(slots.filter((slot) => slot.pact)).toEqual([{ level: 2, count: 2, pact: true }])
  })

  it('1/3 施法子职计入作用域（战士3（奥法骑士）/法师1）', () => {
    const draft = mc([
      { classId: 'class-2014-fighter', level: 3, subclassId: 'subclass-2014-fighter-eldritch-knight' },
      { classId: 'class-2014-wizard', level: 1 },
    ])
    const scopes = listSpellcastingScopes(draft)
    expect(scopes.map((scope) => scope.classId)).toEqual(['class-2014-fighter', 'class-2014-wizard'])
    expect(scopes[0]?.classLevel).toBe(3)
    expect(getClassSpellcastingProfiles(draft).map((profile) => profile.maxSpellLevel)).toEqual([1, 1])
  })
})
