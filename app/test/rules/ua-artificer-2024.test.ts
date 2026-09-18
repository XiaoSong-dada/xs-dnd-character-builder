import { describe, expect, it } from 'vitest'

import { artificerFeatures2024, artificerOptions2024, artificerReplicatePlans2024, artificerRule2024, artificerSubclasses2024 } from '@/rules/data/ua-artificer-2024'
import { classStartingEquipment2024 } from '@/rules/data/starting-equipment-2024'
import { artificerInfusions2014 } from '@/rules/data/artificer-2014'
import { uaMagicItems2024 } from '@/rules/data/ua-magic-items-2024'
import { getResourceMax } from '@/rules/resources'
import { isSourceEnabled } from '@/rules/source-books'
import { rulesRepository2024 } from '@/rules/repositories'
import { buildTimeline } from '@/rules/timeline'
import { validateDraft } from '@/rules/validate'
import { draft2024, selection } from '../fixtures/draft-2024'

const ARTIFICER_SOURCE = 'source-2024-ua-eberron'
const SUBCLASS_IDS = [
  'subclass-2024-ua-artificer-alchemist',
  'subclass-2024-ua-artificer-armorer',
  'subclass-2024-ua-artificer-artillerist',
  'subclass-2024-ua-artificer-battle-smith',
  'subclass-2024-ua-artificer-cartographer',
] as const

describe('2024 奇械师（破解奥秘 UA，E02）', () => {
  it('职业基础字段与来源隔离', () => {
    const classRule = rulesRepository2024.getClass('class-2024-ua-artificer')
    expect(classRule).toBeDefined()
    expect(classRule?.ruleset).toBe('5e-2024')
    expect(classRule?.status).toBe('selectable')
    expect(classRule?.sourceIds).toEqual([ARTIFICER_SOURCE])
    expect(classRule?.hitDie).toBe(8)
    expect(classRule?.primaryAbilities).toEqual(['int'])
    expect(classRule?.savingThrowAbilities).toEqual(['con', 'int'])
    expect(classRule?.armorTraining).toEqual(['light', 'medium', 'shield'])
    expect(classRule?.weaponTraining).toEqual({ categories: ['simple'] })
    expect(classRule?.introduction?.length).toBeGreaterThanOrEqual(20)
    // 未启用来源时不可见；启用后可见。
    expect(isSourceEnabled(classRule?.sourceIds ?? [], [], rulesRepository2024)).toBe(false)
    expect(isSourceEnabled(classRule?.sourceIds ?? [], [ARTIFICER_SOURCE], rulesRepository2024)).toBe(true)
  })

  it('职业特性 16 条（含 4 次属性提升）、等级节点与资源登记', () => {
    expect(artificerFeatures2024).toHaveLength(16)
    expect(new Set(artificerFeatures2024.map((feature) => feature.id)).size).toBe(16)
    expect(artificerFeatures2024.every((feature) => feature.classId === 'class-2024-ua-artificer')).toBe(true)
    expect(artificerFeatures2024.map((feature) => feature.level)).toEqual([...artificerFeatures2024.map((feature) => feature.level)].sort((a, b) => a - b))
    for (const level of [4, 8, 12, 16, 19]) {
      expect(artificerRule2024.checkpoints.some((checkpoint) => checkpoint.level === level && checkpoint.kind === 'ability-improvement')).toBe(true)
    }
    expect(artificerRule2024.checkpoints.find((checkpoint) => checkpoint.id === 'artificer-2024-plans-2')?.minSelections).toBe(4)
    const replicate = artificerFeatures2024.find((feature) => feature.id === 'artificer-2024-replicate-magic-item')?.resource
    if (!replicate) throw new Error('缺少仿制魔法物品资源')
    expect([2, 5, 6, 9, 10, 13, 14, 17, 18, 20].map((level) => getResourceMax(replicate, level))).toEqual([2, 2, 3, 3, 4, 4, 5, 5, 6, 6])
    // 储法物品：智力调整值×2（至少 2 次）。
    const storing = artificerFeatures2024.find((feature) => feature.id === 'artificer-2024-spell-storing-item')?.resource
    if (!storing) throw new Error('缺少储法物品资源')
    expect(getResourceMax(storing, 11, 0)).toBe(2)
    expect(getResourceMax(storing, 11, 3)).toBe(6)
  })

  it('施法配置：智力准备制、半施法位与法术列表完整', () => {
    const config = artificerRule2024.spellcasting
    if (!config) throw new Error('缺少施法配置')
    expect(config.mode).toBe('prepared')
    expect(config.ability).toBe('int')
    expect(config.startsAtLevel).toBe(1)
    expect(config.cantripsKnownByLevel?.[0]).toBe(2)
    expect(config.cantripsKnownByLevel?.[9]).toBe(3)
    expect(config.cantripsKnownByLevel?.[13]).toBe(4)
    expect(config.preparedCountByLevel?.[0]).toBe(2)
    expect(config.preparedCountByLevel?.[19]).toBe(15)
    expect(config.maxSpellLevelByClassLevel?.[0]).toBe(1)
    expect(config.maxSpellLevelByClassLevel?.[4]).toBe(2)
    expect(config.maxSpellLevelByClassLevel?.[17]).toBe(5)
    expect(config.slotsByClassLevel?.[0]).toEqual([2])
    expect(config.slotsByClassLevel?.[16]).toEqual([4, 3, 3, 3, 1])
    // 法术列表共 81 条，全部可解析；含 UA 新法术。
    expect(config.classSpellIds).toHaveLength(81)
    expect(new Set(config.classSpellIds).size).toBe(81)
    for (const spellId of config.classSpellIds) {
      expect(rulesRepository2024.getSpell(spellId), spellId).toBeDefined()
    }
    expect(config.classSpellIds).toContain('spell-2024-ua-homunculus-servant')
    expect(config.classSpellIds).toContain('spell-2024-mending')
    expect(config.classSpellIds).not.toContain('spell-2024-fireball')
  })

  it('劳技工具、技能与方案检查点规格正确', () => {
    const skills = artificerRule2024.checkpoints.find((checkpoint) => checkpoint.id === 'artificer-2024-skills-1')
    expect(skills?.optionIds).toHaveLength(7)
    expect(skills?.minSelections).toBe(2)
    const tools = artificerRule2024.checkpoints.find((checkpoint) => checkpoint.id === 'artificer-2024-tools-1')
    expect(tools?.optionIds).toHaveLength(17)
    for (const optionId of [...(skills?.optionIds ?? []), ...(tools?.optionIds ?? [])]) {
      expect(rulesRepository2024.getOption(optionId), optionId).toBeDefined()
    }
    const planCheckpoints = artificerRule2024.checkpoints.filter((checkpoint) => checkpoint.kind === 'infusion')
    expect(planCheckpoints.map((checkpoint) => checkpoint.minSelections)).toEqual([4, 1, 1, 1, 1])
    expect(planCheckpoints.every((checkpoint) => checkpoint.uniqueGroup === 'artificer-2024-plans')).toBe(true)
  })

  it('仿制方案 50 项全部可解析到物品，档位正确', () => {
    expect(artificerReplicatePlans2024).toHaveLength(50)
    const tierCounts = [2, 6, 10, 14].map((tier) => artificerReplicatePlans2024.filter((plan) => plan.planTier === tier).length)
    expect(tierCounts).toEqual([14, 20, 10, 6])
    for (const plan of artificerReplicatePlans2024) {
      expect(rulesRepository2024.getOption(plan.id), plan.id).toBeDefined()
      expect(plan.minimumLevel).toBe(plan.planTier)
      const item = rulesRepository2024.getEquipment(plan.replicateItemId)
      expect(item, `${plan.id} → ${plan.replicateItemId}`).toBeDefined()
      expect(item?.ruleset).toBe('5e-2024')
    }
  })

  it('5 个子职与始终准备法术闭合，装甲型号为可选检查点', () => {
    expect(artificerSubclasses2024.map((subclass) => subclass.id)).toEqual([...SUBCLASS_IDS])
    for (const subclass of artificerSubclasses2024) {
      expect(rulesRepository2024.getSubclass(subclass.id)?.id).toBe(subclass.id)
      expect(subclass.classId).toBe('class-2024-ua-artificer')
      expect(subclass.status).toBe('selectable')
      expect(subclass.sourceIds).toEqual([ARTIFICER_SOURCE])
      expect(subclass.selectionLevel).toBe(3)
      expect(subclass.features.length).toBeGreaterThan(0)
      for (const [level, spellIds] of Object.entries(subclass.alwaysPreparedSpellIdsByLevel ?? {})) {
        expect(Number(level)).toBeGreaterThanOrEqual(3)
        for (const spellId of spellIds) {
          expect(rulesRepository2024.getSpell(spellId), `${subclass.id}:${spellId}`).toBeDefined()
        }
      }
    }
    const armorModel = artificerSubclasses2024
      .find((subclass) => subclass.id === 'subclass-2024-ua-artificer-armorer')
      ?.features.find((feature) => feature.id === 'artificer-2024-armorer-model')
    expect(armorModel?.requiresChoice).toBe(true)
    expect(armorModel?.optionIds).toHaveLength(3)
  })

  it('UA 魔法物品 9 件与起始装备登记可解析', () => {
    expect(uaMagicItems2024).toHaveLength(9)
    expect(uaMagicItems2024.every((item) => item.sourceIds.includes(ARTIFICER_SOURCE))).toBe(true)
    for (const item of uaMagicItems2024) {
      expect(rulesRepository2024.getEquipment(item.id), item.id).toBeDefined()
    }
    expect(rulesRepository2024.getEquipment('equipment-2024-ua-spell-refueling-ring')?.attunement).toBe('conditional')
    expect(rulesRepository2024.getEquipment('equipment-2024-ua-mind-sharpener')?.magicItemUsage?.charged).toBe(true)
    // 起始装备 A/B 均可解析。
    const profile = classStartingEquipment2024.find((item) => item.classId === 'class-2024-ua-artificer')
    if (!profile) throw new Error('缺少奇械师起始装备方案')
    expect(profile.groups[0]?.options.map((option) => option.id)).toEqual(['artificer-2024-a', 'artificer-2024-b'])
    for (const option of profile.groups[0]?.options ?? []) {
      for (const grant of option.grants) {
        expect(rulesRepository2024.getEquipment(grant.itemId), `${option.id}:${grant.itemId}`).toBeDefined()
      }
    }
  })

  it('时间线在 20 级展开子职与全部检查点候选', () => {
    const withSubclass = buildTimeline('class-2024-ua-artificer', 20, { ruleset: '5e-2024', subclassId: 'subclass-2024-ua-artificer-armorer', enabledSourceIds: [ARTIFICER_SOURCE] })
    expect(withSubclass.some((checkpoint) => checkpoint.kind === 'subclass-feature' && checkpoint.optionIds.length === 3)).toBe(true)
    for (const checkpoint of withSubclass) {
      for (const optionId of checkpoint.optionIds) {
        const resolved = rulesRepository2024.getOption(optionId) ?? rulesRepository2024.getFeat(optionId)
        expect(resolved, `${checkpoint.id}:${optionId}`).toBeDefined()
      }
    }
    const withoutSubclass = buildTimeline('class-2024-ua-artificer', 20, { ruleset: '5e-2024', enabledSourceIds: [ARTIFICER_SOURCE] })
    expect(withoutSubclass.some((checkpoint) => checkpoint.kind === 'subclass')).toBe(true)
  })

  it('仿制绑定校验：合法绑定无错误，未掌握与物品不匹配被拦截', () => {
    const baseSelections = [
      selection('artificer-2024-plans-2', ['artificer-2024-plan-alchemy-jug', 'artificer-2024-plan-bag-of-holding', 'artificer-2024-plan-sending-stones', 'artificer-2024-plan-weapon-1']),
      selection('artificer-2024-plans-6', ['artificer-2024-plan-armor-1']),
    ]
    const inventory = [{ id: 'inv-jug', itemId: 'equipment-2024-alchemy-jug', quantity: 1, equippedQuantity: 0, sourceKind: 'adventure' as const, sourceId: 'test' }]
    const validDraft = draft2024({
      classId: 'class-2024-ua-artificer',
      targetLevel: 6,
      enabledSourceIds: [ARTIFICER_SOURCE],
      selections: baseSelections,
      inventory,
      infusionAssignments: [{ infusionId: 'artificer-2024-plan-alchemy-jug', inventoryEntryId: 'inv-jug' }],
    })
    expect(validateDraft(validDraft).filter((issue) => issue.id.startsWith('replicate'))).toEqual([])

    const unknown = validateDraft({ ...validDraft, selections: [baseSelections[1] ?? selection('artificer-2024-plans-6', [])] })
    expect(unknown.some((issue) => issue.id === 'replicate-not-known-artificer-2024-plan-alchemy-jug')).toBe(true)

    const mismatch = validateDraft({
      ...validDraft,
      inventory: [{ ...(inventory[0] ?? {}), id: 'inv-jug', itemId: 'equipment-2024-bag-of-holding', quantity: 1, equippedQuantity: 0, sourceKind: 'adventure' as const, sourceId: 'test' }],
    })
    expect(mismatch.some((issue) => issue.id === 'replicate-item-mismatch-artificer-2024-plan-alchemy-jug')).toBe(true)
  })

  it('2014 奇械师数据不受影响（隔离）', () => {
    expect(rulesRepository2024.getClass('class-2014-artificer')).toBeUndefined()
    const legacy2014 = artificerInfusions2014.map((infusion) => infusion.id)
    const plans2024 = artificerReplicatePlans2024.map((plan) => plan.id)
    expect(legacy2014.every((id) => !plans2024.includes(id))).toBe(true)
    expect(plans2024.every((id) => id.startsWith('artificer-2024-plan-'))).toBe(true)
    expect(artificerOptions2024.length).toBeGreaterThanOrEqual(50)
  })
})
