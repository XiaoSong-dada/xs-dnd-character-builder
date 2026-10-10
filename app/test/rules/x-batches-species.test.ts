import { describe, expect, it } from 'vitest'

import { rulesRepository2014 } from '@/rules/repository'
import { rulesRepository2024 } from '@/rules/repositories'
import { isSourceEnabled } from '@/rules/source-books'

/**
 * X 批次：合作与 UA 种族（X01 Plane Shift、X02 探秘艾伯伦、X03 鬼魅幽谷玩家包、
 * X04 Beyond Drops 暮精、X05 幽暗地域二期 UA）。
 *
 * 覆盖计划《合作与UA种族X01-X05更新计划》的验收要求：
 * 来源登记归属、默认关闭、条目可达（父链与引用可解析）、版本隔离、用户裁定 R1—R5 的落地。
 */
const repo2014 = rulesRepository2014
const repo2024 = rulesRepository2024

const bySource = (ruleset: '5e-2014' | '5e-2024', sourceId: string) =>
  (ruleset === '5e-2014' ? repo2014 : repo2024).races.filter((race) => race.sourceIds.includes(sourceId))

const resolveAny = (ruleset: '5e-2014' | '5e-2024', id: string) => {
  const repo = ruleset === '5e-2014' ? repo2014 : repo2024
  return repo.getOption(id) ?? repo.getSpell(id) ?? repo.getEquipment(id) ?? repo.getRace(id)
}

describe('X 批次来源登记与归属（§2.1 第 2 条：注册表写错则条目永久不可达）', () => {
  it('X01／X03 复用既有来源，X02／X05 新增来源已登记在对应规则集', () => {
    expect(repo2014.sources.find((source) => source.id === 'tp-planshift-index')?.ruleset).toBe('5e-2014')
    expect(repo2014.sources.find((source) => source.id === 'tp-grim-hollow-index')?.ruleset).toBe('5e-2014')
    expect(repo2024.sources.find((source) => source.id === 'source-2024-tp-exploring-eberron')?.ruleset).toBe('5e-2024')
    expect(repo2024.sources.find((source) => source.id === 'source-2024-ua-underdark')?.ruleset).toBe('5e-2024')
    expect(repo2024.sources.find((source) => source.id === 'source-2024-ua-underdark')?.contentKind).toBe('playtest')
  })

  it('R4：Beyond Drops 来源就地修订为官方分类，ID 不变且仍默认关闭', () => {
    const source = repo2024.sources.find((item) => item.id === 'source-2024-tp-beyond-drops')
    expect(source).toBeDefined()
    expect(source?.contentKind).toBe('official')
    expect(source?.defaultEnabled).toBe(false)
    expect(source?.title).toContain('官方数字专栏')
  })

  it('X 批次使用的来源在关闭状态下不授予收益，开启后生效', () => {
    for (const [ruleset, sourceId] of [
      ['5e-2014', 'tp-planshift-index'],
      ['5e-2014', 'tp-grim-hollow-index'],
      ['5e-2024', 'source-2024-tp-exploring-eberron'],
      ['5e-2024', 'source-2024-tp-beyond-drops'],
      ['5e-2024', 'source-2024-ua-underdark'],
    ] as const) {
      expect(isSourceEnabled([sourceId], []), sourceId).toBe(false)
      expect(isSourceEnabled([sourceId], [sourceId]), sourceId).toBe(true)
    }
  })
})

describe('X01 Plane Shift 五世界（2014 写法）', () => {
  const races = bySource('5e-2014', 'tp-planshift-index').filter((race) => race.id.startsWith('race-2014-tp-ps-'))

  it('五个世界全部登记，条目可达且命名与来源正确', () => {
    expect(races.length).toBeGreaterThanOrEqual(31)
    for (const race of races) {
      expect(race.ruleset, race.id).toBe('5e-2014')
      expect(race.sourceIds, race.id).toEqual(['tp-planshift-index'])
      expect(race.status, race.id).toBe('selectable')
      expect(race.englishName.length, race.id).toBeGreaterThan(1)
      expect(race.description.length, race.id).toBeGreaterThan(60)
    }
    const english = races.map((race) => race.englishName)
    expect(english).toEqual(expect.arrayContaining([
      'Aetherborn', 'Vedalken', 'Kor', 'Siren', 'Khenra', 'Aven', 'Naga',
      'Minotaur', 'Ibis-Headed Aven', 'Hawk-Headed Aven',
    ]))
    // 五个世界均有条目
    for (const world of ['ixalan', 'innistrad', 'kaladesh', 'zendikar', 'amonkhet']) {
      expect(races.some((race) => race.id.startsWith(`race-2014-tp-ps-${world}-`)), world).toBe(true)
    }
  })

  it('R5：依夏兰半兽人中文名用「半兽人」，英文名记 Orc 且引用 PHB 半兽人模板', () => {
    const orc = races.find((race) => race.id.endsWith('ixalan-orc')) ?? races.find((race) => race.englishName === 'Orc')
    expect(orc, '依夏兰半兽人').toBeDefined()
    // 显示名带世界后缀以消除重名（同来源还有卡拉德许／赞迪卡／阿芒凯人类等同名条目）
    expect(orc?.name).toBe('半兽人（依夏兰）')
    expect(orc?.searchAliases ?? []).toContain('半兽人')
    expect(orc?.englishName).toBe('Orc')
    expect(orc?.countsAsRaceIds).toContain('race-2014-half-orc')
  })

  it('R1：赞迪卡鬼怪「坚毅」以正文条目为准，登记火焰与心灵抗性', () => {
    const goblin = repo2014.getRace('race-2014-tp-ps-zendikar-goblin')
    expect(goblin, '赞迪卡鬼怪').toBeDefined()
    expect(goblin?.damageResistances).toEqual(expect.arrayContaining(['火焰', '心灵']))
    expect(goblin?.damageResistances).not.toContain('强酸')
    // 差异留档：依夏兰章末概述作强酸与火焰，条目内保留说明以避免混用
    expect(goblin?.description).toContain('强酸')
    expect(goblin?.description).toContain('以本物种正文条目为准')
  })

  it('R2：分支属性叠加——父项与亚种各自登记差值，合计由派生相加', () => {
    // 艾文：父项敏捷 +2，鹰首再 +2 感知、鹭首再 +1 智力
    const aven = races.find((race) => race.englishName === 'Aven')
    expect(aven?.fixedAbilityBonuses).toEqual({ dex: 2 })
    expect(aven?.requiresSubrace).toBe(true)
    expect(aven?.subraceIds.length).toBeGreaterThanOrEqual(2)
    const subBonus = aven?.subraceIds.map((id) => repo2014.getRace(id)?.fixedAbilityBonuses) ?? []
    expect(subBonus).toEqual(expect.arrayContaining([{ wis: 2 }, { int: 1 }]))
    // 亚种只登记差值，不重复写上父项的加值
    for (const bonus of subBonus) expect(bonus).not.toHaveProperty('dex')
  })

  it('依尼翠人类为替换式方案，父项无属性加值且标记 replacesParentBonuses', () => {
    const innistrad = races.find((race) => race.englishName.includes('Innistrad') || race.name.includes('依尼翠'))
    expect(innistrad, '依尼翠人类').toBeDefined()
    expect(innistrad?.replacesParentBonuses).toBe(true)
    expect(innistrad?.fixedAbilityBonuses).toEqual({})
    expect(innistrad?.subraceIds.length).toBeGreaterThanOrEqual(4)
  })

  it('父链双向一致，引用人类／半兽人模板的条目登记 countsAsRaceIds', () => {
    for (const race of races) {
      for (const subraceId of race.subraceIds) {
        expect(repo2014.getRace(subraceId), `${race.id} -> ${subraceId}`).toBeDefined()
        expect(repo2014.getRace(subraceId)?.parentRaceId).toBe(race.id)
      }
      if (race.parentRaceId) expect(repo2014.getRace(race.parentRaceId), `${race.id} 的父项`).toBeDefined()
    }
    const reprintReferences = races.filter((race) => (race.countsAsRaceIds?.length ?? 0) > 0)
    expect(reprintReferences.length).toBeGreaterThanOrEqual(4)
    for (const race of reprintReferences) {
      for (const raceId of race.countsAsRaceIds ?? []) {
        expect(repo2014.getRace(raceId), `${race.id} -> ${raceId}`).toBeDefined()
      }
    }
  })

  it('授予法术与技能候选全部可解析', () => {
    for (const race of races) {
      for (const grant of race.spellGrants ?? []) {
        expect(repo2014.getSpell(grant.spellId), `${race.id}:${grant.spellId}`).toBeDefined()
        expect(grant.minimumLevel, `${race.id}:${grant.spellId}`).toBeGreaterThanOrEqual(1)
      }
      for (const skillId of race.skillProficiencies ?? []) {
        expect(resolveAny('5e-2014', skillId), `${race.id}:${skillId}`).toBeDefined()
      }
      for (const skillId of race.skillProficiencyChoices?.optionIds ?? []) {
        expect(resolveAny('5e-2014', skillId), `${race.id}:${skillId}`).toBeDefined()
      }
    }
  })

  it('版本隔离：2014 条目不得出现在 2024 仓库', () => {
    for (const race of races) expect(repo2024.getRace(race.id), race.id).toBeUndefined()
  })
})

describe('X02 探秘艾伯伦（2024 写法）', () => {
  const species = bySource('5e-2024', 'source-2024-tp-exploring-eberron').filter((race) =>
    race.id.startsWith('species-2024-ee-'))

  it('条目齐备、2024 写法且不授予种族属性加值', () => {
    expect(species.length).toBeGreaterThanOrEqual(9)
    for (const item of species) {
      expect(item.ruleset, item.id).toBe('5e-2024')
      expect(item.sourceIds, item.id).toEqual(['source-2024-tp-exploring-eberron'])
      expect(item.status, item.id).toBe('selectable')
      expect(item.fixedAbilityBonuses, item.id).toEqual({})
      expect(item.description.length, item.id).toBeGreaterThan(60)
    }
    expect(species.map((item) => item.englishName)).toEqual(expect.arrayContaining([
      'Kalamer Landwalker', 'Ruinbound', "Jhorgun'taal", 'Gnoll', 'Sahuagin',
    ]))
  })

  it('4927／4929 的中文名按正文英文名登记，未沿用 CHM 标题的对调写法', () => {
    const ghaal = species.find((item) => item.englishName.includes("Ghaal'dar"))
    const golin = species.find((item) => item.englishName.includes("Golin'dar"))
    expect(ghaal?.name).toContain('伽珥达')
    expect(golin?.name).toContain('哥林达')
    expect(ghaal?.id).not.toBe(golin?.id)
  })

  it('阿斯莫变体挂基础条目，不独立成套', () => {
    const variant = species.find((item) => (item.countsAsRaceIds?.length ?? 0) > 0)
    expect(variant, '阿斯莫变体').toBeDefined()
    for (const raceId of variant?.countsAsRaceIds ?? []) {
      expect(repo2024.getRace(raceId), raceId).toBeDefined()
    }
    expect(variant?.description).toContain('替换')
  })

  it('引用可解析：法术、技能与生物类型字段', () => {
    for (const item of species) {
      for (const grant of item.spellGrants ?? []) {
        expect(repo2024.getSpell(grant.spellId), `${item.id}:${grant.spellId}`).toBeDefined()
      }
      for (const skillId of item.skillProficiencies ?? []) {
        expect(resolveAny('5e-2024', skillId), `${item.id}:${skillId}`).toBeDefined()
      }
    }
  })

  it('来源归属修正：幻身灵旅者与马伦蒂改挂探秘艾伯伦，斯坦哈德仅保留其本书条目', () => {
    const changeling = repo2024.backgrounds.find((item) => item.id === 'background-2024-tp-changeling-traveler')
    const malenti = repo2024.backgrounds.find((item) => item.id === 'background-2024-tp-malenti')
    for (const background of [changeling, malenti]) {
      expect(background?.sourceIds, background?.id).toEqual(['source-2024-tp-exploring-eberron'])
      expect(background?.sourceIds, background?.id).not.toContain('source-2024-tp-drakkenheim')
      expect(background?.sourceIds, background?.id).not.toContain('source-2024-tp-steinhardt')
    }
    for (const featId of ['feat-2024-tp-focused-mask', 'feat-2024-tp-aquatic-adaptation']) {
      expect(repo2024.getFeat(featId)?.sourceIds, featId).toEqual(['source-2024-tp-exploring-eberron'])
    }
    // 真属斯坦哈德的条目不受影响
    for (const backgroundId of ['background-2024-tp-inquisitor', 'background-2024-tp-beast-hunter']) {
      expect(repo2024.backgrounds.find((item) => item.id === backgroundId)?.sourceIds, backgroundId)
        .toContain('source-2024-tp-steinhardt')
    }
  })

  it('版本隔离：探秘艾伯伦条目不得出现在 2014 仓库', () => {
    for (const item of species) expect(repo2014.getRace(item.id), item.id).toBeUndefined()
  })
})

describe('X03 鬼魅幽谷玩家包（2014 写法）', () => {
  const races = bySource('5e-2014', 'tp-grim-hollow-index').filter((race) => race.id.startsWith('race-2014-tp-gh-'))

  it('无形之灵与枉替之子两条，属性与速度登记正确', () => {
    expect(races).toHaveLength(2)
    const disembodied = races.find((race) => race.englishName === 'The Disembodied')
    const wechselkind = races.find((race) => race.englishName === 'Wechselkind')
    expect(disembodied?.fixedAbilityBonuses).toEqual({ int: 2, dex: 1 })
    expect(wechselkind?.fixedAbilityBonuses).toEqual({ con: 2, cha: 1 })
    expect(wechselkind?.size).toBe('small')
    expect(wechselkind?.speed).toBe(25)
    expect(wechselkind?.damageResistances).toContain('毒素')
    // 本项目既有条目统一用「森林语」表示 Sylvan（CHM 原文作「木族语」）
    expect(wechselkind?.fixedLanguages).toEqual(['森林语'])
    for (const race of races) {
      expect(race.ruleset, race.id).toBe('5e-2014')
      expect(race.sourceIds, race.id).toEqual(['tp-grim-hollow-index'])
      // 两条均无黑暗视觉
      expect(race.darkvision, race.id).toBeUndefined()
    }
  })

  it('授予法术可解析且为固定属性施法（每天一次、长休重获）', () => {
    for (const race of races) {
      for (const grant of race.spellGrants ?? []) {
        expect(repo2014.getSpell(grant.spellId), `${race.id}:${grant.spellId}`).toBeDefined()
        expect(grant.ability, `${race.id}:${grant.spellId}`).toBeDefined()
        expect(grant.freeCastings, `${race.id}:${grant.spellId}`).toBe(1)
        expect(grant.recovery, `${race.id}:${grant.spellId}`).toBe('long-rest')
      }
    }
  })
})

describe('X04 Beyond Drops 暮精（2024 写法）', () => {
  const species = bySource('5e-2024', 'source-2024-tp-beyond-drops').filter((race) =>
    race.id.startsWith('species-2024-beyond-drops-'))

  it('暮精单条：妖精、中型、30 尺、黑暗视觉 60 尺，无属性加值', () => {
    expect(species).toHaveLength(1)
    const duskling = species[0]
    expect(duskling?.name).toBe('暮精')
    expect(duskling?.englishName).toBe('Duskling')
    expect(duskling?.ruleset).toBe('5e-2024')
    expect(duskling?.fixedAbilityBonuses).toEqual({})
    expect(duskling?.size).toBe('medium')
    expect(duskling?.speed).toBe(30)
    expect(duskling?.darkvision).toBe(60)
  })

  it('内在魔法三选一与熟练加值次数进入说明，节选风险保留标注', () => {
    const duskling = species[0]
    for (const keyword of ['热忱', '机敏', '活力', '熟练加值', '长休']) {
      expect(duskling?.description, keyword).toContain(keyword)
    }
    expect(duskling?.description).toContain('节选')
  })
})

describe('X05 幽暗地域二期 UA（2024 写法，游玩测试）', () => {
  const species = bySource('5e-2024', 'source-2024-ua-underdark')

  it('五条玩家种族齐备，英文名与来源正确', () => {
    expect(species.length).toBeGreaterThanOrEqual(5)
    expect(species.map((item) => item.englishName)).toEqual(expect.arrayContaining([
      'Deep Imaskari', 'Kuo-toa', 'Illithidkin', 'Myconid', 'Drider',
    ]))
    for (const item of species) {
      expect(item.ruleset, item.id).toBe('5e-2024')
      expect(item.sourceIds, item.id).toEqual(['source-2024-ua-underdark'])
      expect(item.status, item.id).toBe('selectable')
      expect(item.fixedAbilityBonuses, item.id).toEqual({})
    }
  })

  it('蕈人为植物、蛛化卓尔为怪兽，生物类型如实登记未被改写', () => {
    const myconid = species.find((item) => item.englishName === 'Myconid')
    const drider = species.find((item) => item.englishName === 'Drider')
    expect(myconid?.description).toContain('植物')
    expect(drider?.description).toContain('怪兽')
  })

  it('分级法术授予与施法属性可解析', () => {
    const withGrants = species.filter((item) => (item.spellGrants?.length ?? 0) > 0)
    expect(withGrants.length).toBeGreaterThanOrEqual(2)
    // 施法属性在选取种族时从智／感／魅三选一（2024 物种范式）
    for (const item of withGrants) {
      expect(item.spellcastingAbilityChoices ?? [], item.id).toEqual(
        expect.arrayContaining(item.spellcastingAbilityChoices?.length ? ['int', 'wis', 'cha'] : []),
      )
      for (const grant of item.spellGrants ?? []) {
        expect(repo2024.getSpell(grant.spellId), `${item.id}:${grant.spellId}`).toBeDefined()
        expect(grant.minimumLevel, `${item.id}:${grant.spellId}`).toBeGreaterThanOrEqual(1)
      }
    }
    // 灵吸裔与蛛化卓尔分成 1／3／5 级三级授予，且各一次免法术位、长休重获
    for (const englishName of ['Illithidkin', 'Drider']) {
      const item = species.find((entry) => entry.englishName === englishName)
      expect(item?.spellcastingAbilityChoices, englishName).toEqual(['int', 'wis', 'cha'])
      expect(item?.spellGrants?.map((grant) => grant.minimumLevel), englishName).toEqual([1, 3, 5])
      for (const grant of item?.spellGrants ?? []) {
        expect(grant.alwaysPrepared, `${englishName}:${grant.spellId}`).toBe(true)
      }
    }
    // 寇涛：始终准备寻获魔宠、种族施放一次免法术位，无施法属性候选（法术不使用施法属性调整值）
    const kuoToa = species.find((entry) => entry.englishName === 'Kuo-toa')
    expect(kuoToa?.spellGrants?.[0]?.spellId).toBe('spell-2024-find-familiar')
    expect(kuoToa?.spellcastingAbilityChoices).toBeUndefined()
  })

  it('与同名怪物内容不共享条目 ID', () => {
    for (const item of species) {
      expect(repo2024.getRace(item.id), item.id).toBeDefined()
      expect(repo2014.getRace(item.id), `${item.id} 不得进入 2014 仓库`).toBeUndefined()
    }
  })
})
