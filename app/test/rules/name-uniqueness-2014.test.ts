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

  it('关键法术名抽查（对齐 5e 不全书译名，防回归）', () => {
    const byEn = (englishName: string) => spells2014.find((spell) => spell.englishName === englishName)?.name
    // 更名项（含原 Message/Sending 同名冲突的 Sending）
    expect(byEn('Branding Smite')).toBe('印记斩')
    expect(byEn('Sending')).toBe('短讯术')
    expect(byEn('True Strike')).toBe('克敌先击')
    expect(byEn('Animal Shapes')).toBe('动物形态')
    expect(byEn('Levitate')).toBe('浮空术')
    expect(byEn('Guidance')).toBe('神导术')
    expect(byEn('Spirit Shroud')).toBe('魂灵环绕')
    expect(byEn('Summon Lesser Demons')).toBe('低阶恶魔召唤术')
    expect(byEn('Summon Draconic Spirit')).toBe('龙类灵魄召唤术')
    expect(byEn('Vortex Warp')).toBe('涡旋翘曲')
    // 保持项（与 5e 不全书一致，不得被误改）
    expect(byEn('Shocking Grasp')).toBe('电爪')
    expect(byEn('Magic Missile')).toBe('魔法飞弹')
    expect(byEn('Message')).toBe('传讯术')
  })
})
