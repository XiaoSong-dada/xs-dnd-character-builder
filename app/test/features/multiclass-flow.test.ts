import { describe, expect, it } from 'vitest'

import { deriveCharacter } from '@/rules/derive'
import { buildCharacterExportModel } from '@/features/character-export/build-export-data'
import { getClassLevelLabel } from '@/rules/multiclass-session'
import { getHitDiceFaces, deriveMulticlassHitPoints } from '@/rules/multiclass-session'
import { getEffectiveSpellSlots, getMulticlassSpellcastingLevel, validateSpellSelections } from '@/rules/spellcasting'
import { getRulesRepository } from '@/rules/repositories'
import { reconcileSpellSelections } from '@/rules/spell-selection-reconciliation'
import { deriveAbilities } from '@/rules/derive'
import { EMPTY_MANUAL_EDITS } from '@/rules/manual-edits'
import { validateDraft } from '@/rules/validate'
import { buildTimelineForDraft } from '@/rules/timeline'
import { getClassEntries } from '@/rules/multiclass'
import { draft2024, emptySpellSelections } from '../fixtures/draft-2024'
import { parseCharacterDraft } from '@/services/draft-storage'
import type { AbilityScores, CharacterDraft, ClassLevelEntry, ClassSpellSelections } from '@/types/character'

/**
 * MC-F03 整体验收：需求 §1.3 的三条成功标准 + §10 的情景清单。
 *
 * 这里只做跨模块的端到端断言（规则 → 派生 → 时间线 → 校验 → 导出），
 * 单模块细节分别由各自的测试文件覆盖。
 */

const ABILITIES: AbilityScores = { str: 13, dex: 14, con: 13, int: 15, wis: 13, cha: 16 }

function mc(
  classes: readonly ClassLevelEntry[],
  options: { ruleset?: '5e-2014' | '5e-2024'; buckets?: readonly ClassSpellSelections[]; overrides?: Partial<CharacterDraft> } = {},
): CharacterDraft {
  const order = classes.flatMap((entry) => Array.from({ length: entry.level }, () => entry.classId))
  return draft2024({
    ruleset: options.ruleset ?? '5e-2014',
    baseAbilities: ABILITIES,
    classId: classes[0]?.classId,
    targetLevel: order.length,
    multiclass: { enabled: true, primaryClassId: classes[0]?.classId ?? '', classes, levelOrder: order },
    manualEdits: EMPTY_MANUAL_EDITS,
    ...(options.buckets ? { spellSelections: { ...emptySpellSelections(), classSpellSelections: options.buckets } } : {}),
    ...options.overrides,
  })
}

describe('MC-F03 §1.3 成功标准逐条验收', () => {
  it('标准 1：`战士3/游荡者2` 无施法、生命骰与熟练加值按总等级', () => {
    const draft = mc([
      { classId: 'class-2014-fighter', level: 3 },
      { classId: 'class-2014-rogue', level: 2 },
    ])
    expect(getEffectiveSpellSlots(draft)).toEqual([])
    expect(getMulticlassSpellcastingLevel(draft).casterLevel).toBe(0)
    expect(validateSpellSelections(draft)).toBe(true)
    // 熟练加值按总等级 5 → +3
    expect(deriveCharacter(draft).proficiencyBonus.value).toBe(3)
    // 生命骰 3×d10 + 2×d8
    expect(getHitDiceFaces(draft)).toEqual([10, 10, 10, 8, 8])
    // 规格：起始职业 1 级最大值只算一次 → 战士 1 级 10+1，之后 4 级各按所升职业固定值
    const hp = deriveMulticlassHitPoints(draft, 13)
    expect(hp.firstLevel).toBe(11)
    expect(hp.subsequentTotal).toBe(2 * 6 + 2 * 5 + 4 * 1)
    expect(deriveCharacter(draft).hitPoints.value).toBe(26 + 11)
  })

  it('标准 2：`游侠4/术士3` 的法术位为 5 级施法者的 4/3/2，但两个职业各自独立校验', () => {
    const buckets: ClassSpellSelections[] = [
      { classId: 'class-2014-ranger', cantripIds: [], knownSpellIds: ['spell-2014-cure-wounds', 'spell-2014-alarm', 'spell-2014-animal-friendship'], preparedSpellIds: [], spellbookSpellIds: [] },
      { classId: 'class-2014-sorcerer', cantripIds: ['spell-2014-fire-bolt', 'spell-2014-acid-splash', 'spell-2014-chill-touch', 'spell-2014-blade-ward'], knownSpellIds: ['spell-2014-blur', 'spell-2014-burning-hands', 'spell-2014-charm-person', 'spell-2014-color-spray'], preparedSpellIds: [], spellbookSpellIds: [] },
    ]
    const draft = mc([
      { classId: 'class-2014-ranger', level: 4 },
      { classId: 'class-2014-sorcerer', level: 3 },
    ], { buckets })

    expect(getMulticlassSpellcastingLevel(draft).casterLevel).toBe(5)
    expect(getEffectiveSpellSlots(draft).map((slot) => slot.count)).toEqual([4, 3, 2])
    expect(validateSpellSelections(draft)).toBe(true)

    // 不能准备 2 环游侠法术：树肤术（2 环游侠）不在游侠 4 级的可用列表里
    const illegal = mc([
      { classId: 'class-2014-ranger', level: 4 },
      { classId: 'class-2014-sorcerer', level: 3 },
    ], {
      buckets: [
        { classId: 'class-2014-ranger', cantripIds: [], knownSpellIds: ['spell-2014-barkskin'], preparedSpellIds: [], spellbookSpellIds: [] },
      ],
    })
    expect(validateSpellSelections(illegal)).toBe(false)
    expect(validateDraft(illegal).some((issue) => issue.id === 'unavailable-spell-class-2014-ranger')).toBe(true)

    // 戏法按**角色总等级 7** 取值：火焰箭 2d10（不是术士 3 级的 1d10）
    const model = buildCharacterExportModel(draft, deriveCharacter(draft))
    expect(model.cantrips.find((cantrip) => cantrip.id === 'spell-2014-fire-bolt')?.scaling).toBe('2d10')
  })

  it('标准 3：`圣武士6/魔契师1` 的通用池按 6÷2=3 计，契约池独立', () => {
    const draft = mc([
      { classId: 'class-2014-paladin', level: 6 },
      { classId: 'class-2014-warlock', level: 1 },
    ])
    const level = getMulticlassSpellcastingLevel(draft)
    expect(level.casterLevel).toBe(3)
    expect(level.pactCasterLevel).toBe(1)
    const slots = getEffectiveSpellSlots(draft)
    // 施法等级 3 → 4/2；魔契师 1 级契约池 1 个 1 环
    expect(slots.filter((slot) => !slot.pact).map((slot) => `${slot.level}:${slot.count}`)).toEqual(['1:4', '2:2'])
    expect(slots.filter((slot) => slot.pact)).toEqual([{ level: 1, count: 1, pact: true }])
  })
})

describe('MC-F03 情景清单', () => {
  it('`圣武士5` 半施法向下取整（决策 D1 的证明）', () => {
    expect(getMulticlassSpellcastingLevel(mc([{ classId: 'class-2014-paladin', level: 5 }])).casterLevel).toBe(2)
    expect(getMulticlassSpellcastingLevel(mc([{ classId: 'class-2024-paladin', level: 5 }], { ruleset: '5e-2024' })).casterLevel).toBe(2)
  })

  it('`战士3（奥法骑士）/法师5` 按 1+5=6 计', () => {
    const draft = mc([
      { classId: 'class-2014-fighter', level: 3, subclassId: 'subclass-2014-fighter-eldritch-knight' },
      { classId: 'class-2014-wizard', level: 5 },
    ])
    expect(getMulticlassSpellcastingLevel(draft).casterLevel).toBe(6)
  })

  it('职业数不受上限约束（决策 D9）：13 个已登记职业各 1 级全部合法', () => {
    const repository = getRulesRepository('5e-2014')
    const all = repository.classes.filter((item) => item.ruleset === '5e-2014').map((item) => ({ classId: item.id, level: 1 }))
    expect(all).toHaveLength(13)
    const draft = mc(all)
    expect(draft.targetLevel).toBe(13)
    expect(getClassEntries(draft)).toHaveLength(13)
    // 职业数本身不产生任何问题（D9：上限只由「总等级 ≤ 20」与「每职业 ≥ 1 级」两条规则约束）；
    // 其余问题都是尚未完成的车卡内容（技能、子职、法术选择），与职业数无关。
    const allocationIssues = validateDraft(draft).filter((issue) => issue.id.startsWith('multiclass-'))
    expect(allocationIssues.filter((issue) => issue.severity === 'error')).toEqual([])
    // 唯一的提示级问题来自奇械师：它的来源扩展书默认关闭，先决条件暂不判定（不阻断）
    expect(allocationIssues.map((issue) => issue.id)).toEqual(['multiclass-prerequisite-pending-class-2014-artificer'])
  })

  it('等级数学上限：20 个职业各 1 级合法，21 级被拒绝', () => {
    // 仓库现有 13 个 2014 职业，这里用占位 id 补足 20 项以验证规则层上限（而非数据条数）。
    const real = getRulesRepository('5e-2014').classes.filter((item) => item.ruleset === '5e-2014').map((item) => ({ classId: item.id, level: 1 }))
    const placeholders = Array.from({ length: 7 }, (_, index) => ({ classId: `class-2014-placeholder-${index}`, level: 1 }))
    const twenty = [...real, ...placeholders]
    expect(twenty).toHaveLength(20)
    const draft = mc(twenty)
    expect(draft.targetLevel).toBe(20)
    expect(getClassEntries(draft)).toHaveLength(20)
    // 未登记职业只给「先决条件待核验」的提示级问题（D8），不阻断；分配本身不报错
    expect(validateDraft(draft).filter((issue) => issue.id.startsWith('multiclass-') && issue.severity === 'error')).toEqual([])

    const over = mc([...twenty, { classId: 'class-2014-placeholder-20', level: 1 }])
    expect(validateDraft(over).some((issue) => issue.id === 'multiclass-total-out-of-range')).toBe(true)
  })

  it('关闭兼职开关后的合并流程：降级移除职业 → 失效归档 → 恢复后可重新选择', () => {
    const buckets: ClassSpellSelections[] = [
      { classId: 'class-2014-ranger', cantripIds: [], knownSpellIds: ['spell-2014-cure-wounds'], preparedSpellIds: [], spellbookSpellIds: [] },
      { classId: 'class-2014-sorcerer', cantripIds: ['spell-2014-fire-bolt'], knownSpellIds: ['spell-2014-blur'], preparedSpellIds: [], spellbookSpellIds: [] },
    ]
    const draft = mc([
      { classId: 'class-2014-ranger', level: 4 },
      { classId: 'class-2014-sorcerer', level: 3 },
    ], { buckets })

    // 合并到起始职业：移除术士
    const merged = reconcileSpellSelections(draft, {
      nextClassId: 'class-2014-ranger',
      nextSubclassId: undefined,
      nextTargetLevel: 4,
      nextMulticlass: { enabled: false, primaryClassId: 'class-2014-ranger', classes: [{ classId: 'class-2014-ranger', level: 4 }], levelOrder: Array(4).fill('class-2014-ranger') as string[] },
      removedClassIds: ['class-2014-sorcerer'],
      reason: 'source-removed',
      invalidatedAt: '2026-10-11T00:00:00.000Z',
    })
    expect(merged.archived.map((entry) => entry.spellId).sort()).toEqual(['spell-2014-blur', 'spell-2014-fire-bolt'])
    expect(merged.archived.every((entry) => entry.sourceKey === 'class-2014-sorcerer')).toBe(true)
    // 停用记录留在草稿里，不静默删除
    expect(merged.inactiveSpellSelections).toHaveLength(2)
  })

  it('时间线在兼职下仍完整且检查点带归属职业', () => {
    const draft = mc([
      { classId: 'class-2014-fighter', level: 3 },
      { classId: 'class-2014-rogue', level: 2 },
    ])
    const timeline = buildTimelineForDraft(draft)
    const classCheckpoints = timeline.filter((checkpoint) => checkpoint.classId)
    expect(classCheckpoints.length).toBeGreaterThan(0)
    expect(new Set(classCheckpoints.map((checkpoint) => checkpoint.classId)).size).toBe(2)
    // 归属职业的检查点各自带自己的职业等级
    expect(classCheckpoints.every((checkpoint) => (checkpoint.classLevel ?? 0) <= 3)).toBe(true)
    // id 唯一
    expect(new Set(timeline.map((checkpoint) => checkpoint.id)).size).toBe(timeline.length)
  })

  it('v9 草稿迁移到 v10 后数值不变（职业与等级口径一致）', () => {
    const legacy = {
      schemaVersion: 9,
      id: 'legacy-v9',
      ruleset: '5e-2014',
      createdAt: '',
      updatedAt: '',
      targetLevel: 5,
      abilityMethod: 'standard-array',
      classId: 'class-2014-fighter',
      subclassId: undefined,
      raceAbilityChoices: [],
      backgroundSkillIds: [],
      backgroundToolIds: [],
      languages: [],
      proficiencyReplacements: [],
      baseAbilities: ABILITIES,
      selections: [],
      startingEquipmentSelections: [],
      inventory: [],
      currency: { cp: 0, sp: 0, ep: 0, gp: 0, pp: 0 },
      adventureGold: 0,
      equipmentNeedsReview: false,
      spellSelections: emptySpellSelections(),
      name: '迁移角色',
      alignment: '',
      notes: '',
      currentStep: 'sheet',
    }
    const migrated = parseCharacterDraft(legacy)
    expect(migrated?.schemaVersion).toBe(10)
    expect(migrated?.multiclass?.classes).toEqual([{ classId: 'class-2014-fighter', level: 5 }])
    // 迁移后与手工构造的单职业草稿派生结果一致
    const reference = draft2024({ ruleset: '5e-2014', classId: 'class-2014-fighter', targetLevel: 5, baseAbilities: ABILITIES })
    expect(deriveCharacter(migrated as CharacterDraft).hitPoints.value)
      .toBe(deriveCharacter(reference).hitPoints.value)
    expect(deriveCharacter(migrated as CharacterDraft).proficiencyBonus.value)
      .toBe(deriveCharacter(reference).proficiencyBonus.value)
    expect(getClassLevelLabel(migrated as CharacterDraft)).toBe('战士5')
  })

  it('单职业草稿在全部跨模块出口都与多职业路径兼容（数值不变）', () => {
    const solo = draft2024({
      ruleset: '5e-2014',
      classId: 'class-2014-fighter',
      targetLevel: 5,
      baseAbilities: ABILITIES,
      spellSelections: emptySpellSelections(),
    })
    expect(getClassLevelLabel(solo)).toBe('战士5')
    expect(deriveCharacter(solo).hitPoints.value).toBe(39)
    expect(deriveCharacter(solo).proficiencyBonus.value).toBe(3)
    expect(getEffectiveSpellSlots(solo)).toEqual([])
    expect(validateSpellSelections(solo)).toBe(true)
    const model = buildCharacterExportModel(solo, deriveCharacter(solo))
    expect(model.identity.classLevel).toBe('战士（5级）')
    expect(model.combat.hitDiceTotal).toBe('5d10')
    expect(model.spellcasting).toBeUndefined()
    // 属性派生与改造前一致：标准数组 15/14/13/13/13/16 下力量 +1
    expect(deriveAbilities(solo).str).toBe(ABILITIES.str)
  })
})
