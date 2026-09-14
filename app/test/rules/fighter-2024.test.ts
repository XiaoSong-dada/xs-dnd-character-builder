import { describe, expect, it } from 'vitest'

import { rulesRepository2024 } from '@/rules/repositories'
import { fighterFeatures2024, fighterRule2024 } from '@/rules/data/fighter-2024'
import { getCheckpointSelectionBounds } from '@/rules/feats'
import { formatResourceText, getResourceMax } from '@/rules/resources'
import type { ClassResource } from '@/types/rules'
import { draft2024 } from '../fixtures/draft-2024'

function resourceOf(featureId: string): ClassResource {
  const resource = fighterFeatures2024.find((feature) => feature.id === featureId)?.resource
  if (!resource) throw new Error(`缺少资源登记：${featureId}`)
  return resource
}

describe('2024 战士与勇士数据（B08-01）', () => {
  it('职业基础字段、护甲与武器训练', () => {
    const classRule = rulesRepository2024.getClass('class-2024-fighter')
    expect(classRule?.status).toBe('implemented')
    expect(classRule?.hitDie).toBe(10)
    expect(classRule?.armorTraining).toEqual(['light', 'medium', 'heavy', 'shield'])
    expect(classRule?.weaponTraining).toEqual({ categories: ['simple', 'martial'] })
    expect(classRule?.savingThrowAbilities).toEqual(['str', 'con'])
  })

  it('职业特性条目完整、等级与 ID 唯一', () => {
    expect(fighterFeatures2024).toHaveLength(17)
    expect(new Set(fighterFeatures2024.map((feature) => feature.id)).size).toBe(17)
    expect(fighterFeatures2024.every((feature) => feature.classId === 'class-2024-fighter')).toBe(true)
    expect(fighterFeatures2024.every((feature) => feature.sourceIds.includes('source-2024-phb'))).toBe(true)
    expect(fighterFeatures2024.map((feature) => feature.level)).toEqual(
      expect.arrayContaining([1, 2, 3, 5, 9, 11, 13, 17, 19, 20]),
    )
    // 需玩家选择的特性必须挂到对应检查点，避免角色卡只显示“需选择”却无入口。
    const choiceFeatures = fighterFeatures2024.filter((feature) => feature.requiresChoice)
    expect(choiceFeatures.length).toBeGreaterThan(0)
    expect(choiceFeatures.every((feature) => (feature.checkpointIds?.length ?? 0) > 0)).toBe(true)
  })

  it('勇士子职 6 条特性覆盖 3／7／10／15／18 级', () => {
    const champion = rulesRepository2024.getSubclass('subclass-2024-fighter-champion')
    expect(champion?.status).toBe('implemented')
    expect(champion?.selectionLevel).toBe(3)
    expect(champion?.features).toHaveLength(6)
    expect(champion?.features.map((feature) => feature.level)).toEqual([3, 3, 7, 10, 15, 18])
    expect(new Set(champion?.features.map((feature) => feature.id)).size).toBe(6)
    const additional = champion?.features.find((feature) => feature.id === 'fighter-2024-champion-additional-fighting-style')
    expect(additional?.requiresChoice).toBe(true)
    expect(additional?.featCategories).toEqual(['fighting-style'])
  })

  it('回气／动作如潮／不屈上限按等级表登记，且仅展示不结算', () => {
    const secondWind = resourceOf('fighter-2024-class-second-wind')
    expect(getResourceMax(secondWind, 1)).toBe(2)
    expect(getResourceMax(secondWind, 4)).toBe(3)
    expect(getResourceMax(secondWind, 10)).toBe(4)
    expect(formatResourceText(secondWind, 4)).toBe('3 次 · 短休恢复')

    const actionSurge = resourceOf('fighter-2024-class-action-surge')
    expect(getResourceMax(actionSurge, 1)).toBe(0)
    expect(getResourceMax(actionSurge, 2)).toBe(1)
    expect(getResourceMax(actionSurge, 17)).toBe(2)

    const indomitable = resourceOf('fighter-2024-class-indomitable')
    expect(getResourceMax(indomitable, 8)).toBe(0)
    expect(getResourceMax(indomitable, 9)).toBe(1)
    expect(getResourceMax(indomitable, 13)).toBe(2)
    expect(getResourceMax(indomitable, 17)).toBe(3)
    expect(indomitable.recovery).toBe('long-rest')
  })

  it('武器精通数量随等级 3／4／5／6，候选来自当前规则集武器', () => {
    const checkpoint = fighterRule2024.checkpoints.find((item) => item.candidateKind === 'weapon-mastery')
    if (!checkpoint) throw new Error('缺少武器精通检查点')
    expect(checkpoint.kind).toBe('weapon-mastery')
    const boundsAt = (level: number) => getCheckpointSelectionBounds({ ...draft2024(), targetLevel: level }, checkpoint)
    expect([1, 4, 10, 16].map((level) => boundsAt(level).max)).toEqual([3, 4, 5, 6])
    expect([1, 4, 10, 16].map((level) => boundsAt(level).min)).toEqual([3, 4, 5, 6])
    expect(fighterRule2024.checkpoints.find((item) => item.kind === 'skills')?.optionIds).toHaveLength(9)
  })

  it('技能、勇士子职与精通词条可在仓库解析', () => {
    const skillCheckpoint = fighterRule2024.checkpoints.find((item) => item.kind === 'skills')
    expect(skillCheckpoint?.optionIds.every((id) => rulesRepository2024.getOption(id)?.name)).toBe(true)
    expect(rulesRepository2024.subclasses.filter((subclass) => subclass.classId === 'class-2024-fighter').map((subclass) => subclass.id)).toEqual([
      'subclass-2024-fighter-champion',
    ])
    expect(rulesRepository2024.getOption('subclass-2024-fighter-champion')?.name).toBe('勇士')
    const longsword = rulesRepository2024.getEquipment('equipment-2024-longsword')
    expect(longsword?.masteryId).toBe('mastery-2024-sap')
    expect(rulesRepository2024.getWeaponMastery('mastery-2024-sap')?.name).toBe('削弱')
  })
})
