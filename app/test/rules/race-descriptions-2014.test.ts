import { describe, expect, it } from 'vitest'

import { races2014 } from '@/rules/data/origins-2014'

describe('2014 种族介绍登记', () => {
  it('全部种族/子种族 description 非空且不含占位文本', () => {
    expect(races2014.length).toBeGreaterThanOrEqual(72)
    for (const race of races2014) {
      expect(race.description.trim(), `${race.id} 应有详细介绍`).not.toBe('')
      expect(race.description, `${race.id} 不应是占位文本`).not.toContain('占位')
    }
  })

  it('种族介绍包含核心决策信息（抽查）', () => {
    const byId = new Map(races2014.map((race) => [race.id, race]))
    // 矮人：黑暗视觉 + 毒素抗性
    expect(byId.get('race-2014-dwarf')?.description).toContain('黑暗视觉')
    expect(byId.get('race-2014-dwarf')?.description).toContain('毒素')
    // 精灵：魅惑豁免优势
    expect(byId.get('race-2014-elf')?.description).toContain('魅惑')
    // 变体人类：1 级专长
    expect(byId.get('race-2014-human-variant')?.description).toContain('专长')
    // 龙裔：吐息武器
    expect(byId.get('race-2014-dragonborn')?.description).toContain('吐息')
    // 半兽人：不屈顽强
    expect(byId.get('race-2014-half-orc')?.description).toContain('不屈顽强')
    // 提夫林：火焰抗性
    expect(byId.get('race-2014-tiefling')?.description).toContain('火焰抗性')
    // 扩展种族抽查
    // 哥布林：敏捷逃脱
    expect(byId.get('race-2014-goblin')?.description).toContain('敏捷逃脱')
    // 兽化人：兽化
    expect(byId.get('race-2014-shifter')?.description).toContain('兽化')
    // 鸟人：飞行
    expect(byId.get('race-2014-aarakocra')?.description).toContain('飞行')
    // 费兹本龙裔：无黑暗视觉 + 攻击替换式吐息
    expect(byId.get('race-2014-dragonborn-fizban')?.description).toContain('无黑暗视觉')
    expect(byId.get('race-2014-dragonborn-fizban')?.description).toContain('替换一次攻击')
    // 提夫林血统：替换炼狱传承
    expect(byId.get('race-2014-tiefling-legacy-zariel')?.description).toContain('替换炼狱传承')
  })

  it('介绍中的速度与既有 speed 字段一致', () => {
    const byId = new Map(races2014.map((race) => [race.id, race]))
    for (const race of races2014) {
      if (race.speed !== undefined) {
        expect(race.description, `${race.id} 介绍应提及速度`).toContain('速度')
      }
    }
    // 木精灵 speed 35 → 10.5 米；矮人 speed 25 → 7.5 米
    expect(byId.get('race-2014-elf-wood')?.description).toContain('10.5 米')
    expect(byId.get('race-2014-dwarf')?.description).toContain('7.5 米')
  })
})
