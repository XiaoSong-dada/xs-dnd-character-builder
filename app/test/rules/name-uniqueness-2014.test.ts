import { describe, expect, it } from 'vitest'

import { classFeatures2014 } from '@/rules/data/class-features-2014'
import { equipment2014 } from '@/rules/data/equipment-2014'
import { feats2014 } from '@/rules/data/feats-2014'
import { magicItems2014 } from '@/rules/data/magic-items-2014'
import { magicItems2024 } from '@/rules/data/magic-items-2024'
import { magicItemsXgteTcoe2014 } from '@/rules/data/magic-items-xgte-tcoe-2014'
import { spells2014 } from '@/rules/data/spells-2014'
import { subclassFeatures2014 } from '@/rules/data/subclass-features-2014'

describe('规则条目中文名唯一性（5e-2014）', () => {
  it('法术 name 全量唯一（拦截同名回归，如 Message/Sending）', () => {
    const names = spells2014.map((spell) => spell.name)
    expect(new Set(names).size).toBe(names.length)
  })

  it('职业特性在同职业内 (classId, name, level) 组合唯一（允许不同等级的同名升级条目）', () => {
    const keys = classFeatures2014.map((feature) => `${feature.classId}|${feature.name}|${feature.level}`)
    expect(new Set(keys).size).toBe(keys.length)
  })

  it('子职特性在同子职内 (subclassId, name, level) 组合唯一（允许不同等级的同名升级条目）', () => {
    const keys = subclassFeatures2014.map((feature) => `${feature.subclassId}|${feature.name}|${feature.level}`)
    expect(new Set(keys).size).toBe(keys.length)
  })

  it('装备与魔法物品 name 全量唯一（含 2014/XGtE/TCoE/2024 各表）', () => {
    const names = [...equipment2014, ...magicItems2014, ...magicItemsXgteTcoe2014, ...magicItems2024]
      .map((entry) => entry.name)
    expect(new Set(names).size).toBe(names.length)
  })

  it('专长 name 全量唯一（5e-2014，更名后防回归）', () => {
    const names = feats2014.map((feat) => feat.name)
    expect(new Set(names).size).toBe(names.length)
  })
})
