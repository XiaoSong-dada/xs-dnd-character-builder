import { describe, expect, it } from 'vitest'

import { getRulesRepository } from '@/rules/repositories'
import { isSourceEnabled } from '@/rules/source-books'

/**
 * G3-I1：第三方 2024 写法种族（歪曲之月 13 + 瓦尔达的秘密尖塔 5）。
 *
 * 登记口径见 `app/src/rules/data/races-crooked-moon-2024.ts` 顶部注释：
 * 2024 物种不提供属性加值（属性来自背景），故 `fixedAbilityBonuses` 一律为空。
 */
const repository = getRulesRepository('5e-2024')
const cmSpecies = repository.races.filter((item) => item.id.startsWith('species-2024-cm-'))
const vssSpecies = repository.races.filter((item) => item.id.startsWith('species-2024-vss-'))

describe('G3-I1 第三方 2024 种族', () => {
  it('歪曲之月 13 条种族齐备，命名与来源正确', () => {
    expect(cmSpecies.length).toBe(13)
    for (const species of cmSpecies) {
      expect(species.ruleset, species.id).toBe('5e-2024')
      expect(species.sourceIds, species.id).toEqual(['source-2024-tp-crooked-moon'])
      expect(species.status, species.id).toBe('selectable')
      // 2024 物种不提供固定属性加值
      expect(species.fixedAbilityBonuses, species.id).toEqual({})
      expect(species.englishName.length, species.id).toBeGreaterThan(2)
      expect(species.description.length, species.id).toBeGreaterThan(60)
    }
    expect(cmSpecies.map((item) => item.englishName)).toEqual(expect.arrayContaining([
      'Silkborn', 'Harvestborn', 'Curseborn', 'Bogborn', 'Deepborn', 'Ashborn', 'Plagueborn',
      'Stoneborn', 'Threadborn', 'Relicborn', 'Azureborn', 'Gnarlborn', 'Graveborn',
    ]))
  })

  it('瓦尔达的秘密尖塔 5 条（含匠偶 3 个构造亚种）齐备且父子关系正确', () => {
    expect(vssSpecies.length).toBe(5)
    const vssSource = repository.sources.find((source) => source.id === 'source-2024-tp-valdas-spire')
    expect(vssSource, '瓦尔达来源必须登记在 2024 注册表，否则条目永久不可达').toBeDefined()
    expect(vssSource?.defaultEnabled).toBe(false)
    for (const species of vssSpecies) {
      expect(species.sourceIds, species.id).toEqual(['source-2024-tp-valdas-spire'])
      expect(species.fixedAbilityBonuses, species.id).toEqual({})
    }
    expect(isSourceEnabled(['source-2024-tp-valdas-spire'], [], repository)).toBe(false)
    expect(isSourceEnabled(['source-2024-tp-valdas-spire'], ['source-2024-tp-valdas-spire'], repository)).toBe(true)
    const geppettin = repository.getRace('species-2024-vss-geppettin')
    expect(geppettin?.requiresSubrace).toBe(true)
    expect(geppettin?.subraceIds).toHaveLength(3)
    for (const subraceId of geppettin?.subraceIds ?? []) {
      const subrace = repository.getRace(subraceId)
      expect(subrace, subraceId).toBeDefined()
      expect(subrace?.parentRaceId, subraceId).toBe('species-2024-vss-geppettin')
    }
  })

  it('授予法术全部可解析，且施法属性候选为非空', () => {
    const withGrants = [...cmSpecies, ...vssSpecies].filter((item) => (item.spellGrants?.length ?? 0) > 0)
    // 丝虫种／丰收种／灰烬种／线偶种／苍羽种 + 曼德拉
    expect(withGrants.length).toBe(6)
    for (const species of withGrants) {
      expect(species.spellcastingAbilityChoices?.length ?? 0, species.id).toBeGreaterThan(0)
      for (const grant of species.spellGrants ?? []) {
        expect(repository.getSpell(grant.spellId), `${species.id}:${grant.spellId}`).toBeDefined()
        expect(grant.minimumLevel, `${species.id}:${grant.spellId}`).toBeGreaterThanOrEqual(1)
      }
    }
    // 曼德拉：橡棍术 1 级、神莓术 3 级、树肤术 5 级
    const mandrake = repository.getRace('species-2024-vss-mandrake')
    expect(mandrake?.spellGrants?.map((grant) => grant.minimumLevel)).toEqual([1, 3, 5])
  })

  it('技能二选一候选可解析', () => {
    for (const species of [...cmSpecies, ...vssSpecies]) {
      const choices = species.skillProficiencyChoices
      if (!choices) continue
      expect(choices.count, species.id).toBe(1)
      expect((choices.optionIds ?? []).length, species.id).toBeGreaterThanOrEqual(1)
      for (const optionId of choices.optionIds ?? []) {
        expect(repository.getOption(optionId), `${species.id}:${optionId}`).toBeDefined()
      }
    }
  })

  it('第三方种族默认关闭，未启用来源时不可选', async () => {
    const { isSourceEnabled } = await import('@/rules/source-books')
    for (const species of [...cmSpecies, ...vssSpecies]) {
      expect(isSourceEnabled(species.sourceIds, []), species.id).toBe(false)
      expect(isSourceEnabled(species.sourceIds, [...species.sourceIds]), species.id).toBe(true)
    }
  })
})

/** G3-I1 第二批：2014 写法第三方种族（胧忆岛 2 + 谦卑林 22，含 11 个亚种）。 */
const repository2014 = getRulesRepository('5e-2014')
const tp2014 = repository2014.races.filter((item) => item.id.startsWith('race-2014-tp-'))

describe('G3-I1 第三方 2014 种族', () => {
  it('24 条齐备（胧忆岛 2 + 谦卑林 22），主族 12 + 亚种 12', () => {
    // tp2014 现含黯潮之书 21 条，故先按来源过滤本批
    const batch = tp2014.filter((item) => !item.id.startsWith('race-2014-tp-ebt-'))
    expect(batch.length).toBe(24)
    const obojima = batch.filter((item) => item.sourceIds.includes('tp-obojima-index'))
    const humblewood = batch.filter((item) => item.sourceIds.includes('tp-humblewood-index'))
    expect(obojima.length).toBe(2)
    expect(humblewood.length).toBe(22)
    for (const race of batch) {
      expect(race.ruleset, race.id).toBe('5e-2014')
      expect(race.status, race.id).toBe('selectable')
      expect(race.englishName.length, race.id).toBeGreaterThan(2)
      expect(race.description.length, race.id).toBeGreaterThan(60)
    }
    // 胧忆岛 2 条均为主族；谦卑林 22 条 = 10 主族（浣熊／狡狐／猬／跳鼠／鹿／隼／雉／鸦／鸮／鸽）+ 12 亚种
    expect(batch.filter((item) => !item.parentRaceId).length).toBe(12)
    expect(batch.filter((item) => item.parentRaceId).length).toBe(12)
  })

  it('父子关系双向一致：父种族 subraceIds 与子种族 parentRaceId 对应', () => {
    const batch = tp2014.filter((item) => !item.id.startsWith('race-2014-tp-ebt-'))
    const parents = batch.filter((item) => item.subraceIds.length > 0)
    expect(parents.length).toBe(6)
    for (const parent of parents) {
      expect(parent.requiresSubrace, parent.id).toBe(true)
      for (const subraceId of parent.subraceIds) {
        const subrace = repository2014.getRace(subraceId)
        expect(subrace, `${parent.id}→${subraceId}`).toBeDefined()
        expect(subrace?.parentRaceId, subraceId).toBe(parent.id)
      }
    }
  })

  it('属性加值齐备：固定加值或自选加值至少其一', () => {
    const batch = tp2014.filter((item) => !item.id.startsWith('race-2014-tp-ebt-'))
    for (const race of batch) {
      const fixed = Object.keys(race.fixedAbilityBonuses).length
      const flexible = (race.flexibleBonusGroups?.length ?? 0) > 0
      expect(fixed + (flexible ? 1 : 0), race.id).toBeGreaterThan(0)
    }
    // 两个自选加值种族：达良人、鸣玉族（一项 +2、另一项 +1）
    for (const id of ['race-2014-tp-dara', 'race-2014-tp-nakudama']) {
      expect(repository2014.getRace(id)?.flexibleBonusGroups?.map((group) => group.value), id).toEqual([2, 1])
    }
  })

  it('技能与法术引用全部可解析', () => {
    const batch = tp2014.filter((item) => !item.id.startsWith('race-2014-tp-ebt-'))
    const bad: string[] = []
    for (const race of batch) {
      for (const skillId of race.skillProficiencies ?? []) {
        if (!repository2014.getOption(skillId)) bad.push(`${race.id}:skill:${skillId}`)
      }
      for (const skillId of race.skillProficiencyChoices?.optionIds ?? []) {
        if (!repository2014.getOption(skillId)) bad.push(`${race.id}:skillChoice:${skillId}`)
      }
      for (const grant of race.spellGrants ?? []) {
        if (!repository2014.getSpell(grant.spellId)) bad.push(`${race.id}:spell:${grant.spellId}`)
      }
    }
    expect(bad).toEqual([])
  })

  it('2014 第三方种族默认关闭', async () => {
    const { isSourceEnabled } = await import('@/rules/source-books')
    for (const race of tp2014) {
      expect(isSourceEnabled(race.sourceIds, []), race.id).toBe(false)
    }
  })
})

/** G3-I1 第三批：黯潮之书 21 条（10 主族 + 11 亚种）。 */
const ebtRaces = repository2014.races.filter((item) => item.id.startsWith('race-2014-tp-ebt-'))

describe('G3-I1 黯潮之书种族', () => {
  it('21 条齐备（10 主族 + 11 亚种）', () => {
    expect(ebtRaces.length).toBe(21)
    expect(ebtRaces.filter((item) => !item.parentRaceId).length).toBe(10)
    expect(ebtRaces.filter((item) => item.parentRaceId).length).toBe(11)
    for (const race of ebtRaces) {
      expect(race.ruleset, race.id).toBe('5e-2014')
      expect(race.sourceIds, race.id).toEqual(['tp-ebon-tides-index'])
      expect(race.description.length, race.id).toBeGreaterThan(60)
    }
  })

  it('十主族名称齐备，含两个带负向加值的种族', () => {
    const mains = ebtRaces.filter((item) => !item.parentRaceId)
    expect(mains.map((item) => item.englishName)).toEqual(expect.arrayContaining([
      'Bearfolk', 'Darakhul', 'Shadow Goblin', 'Umbral Human', 'Quickstep',
      'Spiritfarer Erina', 'Ratatosk', 'Unbound Satarre', 'Sublime Ravenfolk', 'Stygian Shade',
    ]))
    // 树鼠族 力量 −2、暗精灵（亚种）敏捷 −1 —— 负向加值需如实登记
    expect(repository2014.getRace('race-2014-tp-ebt-ratatosk')?.fixedAbilityBonuses.str).toBe(-2)
    expect(repository2014.getRace('race-2014-tp-ebt-sable-elf')?.fixedAbilityBonuses.dex).toBe(-1)
  })

  it('精灵／侏儒亚种的父种族指向核心种族（原书基础书未登记）', () => {
    for (const [subraceId, parentId] of [
      ['race-2014-tp-ebt-shadow-fey', 'race-2014-elf'],
      ['race-2014-tp-ebt-sable-elf', 'race-2014-elf'],
      ['race-2014-tp-ebt-lunar-elf', 'race-2014-elf'],
      ['race-2014-tp-ebt-wyrd-gnome', 'race-2014-gnome'],
    ] as const) {
      const subrace = repository2014.getRace(subraceId)
      expect(subrace, subraceId).toBeDefined()
      expect(subrace?.parentRaceId, subraceId).toBe(parentId)
      expect(repository2014.getRace(parentId), parentId).toBeDefined()
    }
  })

  it('内部亚种的父子关系双向一致', () => {
    for (const parentId of ['race-2014-tp-ebt-bearfolk', 'race-2014-tp-ebt-darakhul', 'race-2014-tp-ebt-umbral-human', 'race-2014-tp-ebt-ratatosk']) {
      const parent = repository2014.getRace(parentId)
      expect(parent?.requiresSubrace, parentId).toBe(true)
      expect((parent?.subraceIds.length ?? 0), parentId).toBeGreaterThan(0)
      for (const subraceId of parent?.subraceIds ?? []) {
        expect(repository2014.getRace(subraceId)?.parentRaceId, subraceId).toBe(parentId)
      }
    }
  })

  it('授予法术与技能引用可解析', () => {
    const bad: string[] = []
    for (const race of ebtRaces) {
      for (const skillId of race.skillProficiencies ?? []) {
        if (!repository2014.getOption(skillId)) bad.push(`${race.id}:skill:${skillId}`)
      }
      for (const skillId of race.skillProficiencyChoices?.optionIds ?? []) {
        if (!repository2014.getOption(skillId)) bad.push(`${race.id}:skillChoice:${skillId}`)
      }
      for (const grant of race.spellGrants ?? []) {
        if (!repository2014.getSpell(grant.spellId)) bad.push(`${race.id}:spell:${grant.spellId}`)
      }
    }
    expect(bad).toEqual([])
  })
})
