import { describe, expect, it } from 'vitest'

import { magicItems2024 } from '@/rules/data/magic-items-2024'
import { OPEN_RULESETS, getRulesRepository, rulesRepository2024 } from '@/rules/repositories'

/**
 * B12-01 开放集合与依赖闭合：以仓库数据为准核对 B00 最终目标集合，
 * 未完成条目不得作为正常候选（index-only 等）。
 */
describe('B12-01 2024 开放集合与依赖闭合', () => {
  const repository = rulesRepository2024

  it('两版规则集均开放且可解析', () => {
    expect(OPEN_RULESETS).toEqual(['5e-2014', '5e-2024'])
    expect(getRulesRepository('5e-2024')).toBe(repository)
    expect(getRulesRepository('5e-2014').ruleset).toBe('5e-2014')
  })

  it('12 职业与 48 子职全部 implemented，子职归属闭合', () => {
    const classes = repository.classes.filter((item) => item.sourceIds.includes('source-2024-phb'))
    expect(classes).toHaveLength(12)
    expect(classes.every((item) => item.status === 'implemented')).toBe(true)
    const coreClassIds = new Set(classes.map((item) => item.id))
    const subclasses = repository.subclasses.filter((item) => coreClassIds.has(item.classId) && item.sourceIds.includes('source-2024-phb'))
    expect(subclasses).toHaveLength(48)
    for (const subclass of subclasses) {
      expect(subclass.status, subclass.id).toBe('implemented')
      expect(repository.getClass(subclass.classId), subclass.id).toBeDefined()
    }
  })

  it('职业施法池、起始装备与子职始终准备法术全部可解析', () => {
    for (const classRule of repository.classes.filter((item) => item.id.startsWith('class-2024-'))) {
      const config = classRule.spellcasting
      for (const spellId of config?.classSpellIds ?? []) {
        expect(repository.getSpell(spellId), `${classRule.id}:${spellId}`).toBeDefined()
      }
      for (const level of Object.keys(config?.alwaysPreparedSpellIdsByLevel ?? {})) {
        for (const spellId of config?.alwaysPreparedSpellIdsByLevel?.[Number(level)] ?? []) {
          expect(repository.getSpell(spellId), `${classRule.id}:${spellId}`).toBeDefined()
        }
      }
      const equipment = repository.getClassStartingEquipment(classRule.id)
      const grants = [
        ...(equipment?.fixedGrants ?? []),
        ...(equipment?.groups ?? []).flatMap((group) => group.options.flatMap((option) => option.grants)),
      ]
      for (const grant of grants) {
        expect(repository.getEquipment(grant.itemId), `${classRule.id}:${grant.itemId}`).toBeDefined()
      }
    }
    for (const subclass of repository.subclasses.filter((item) => item.classId.startsWith('class-2024-'))) {
      for (const level of Object.keys(subclass.alwaysPreparedSpellIdsByLevel ?? {})) {
        for (const spellId of subclass.alwaysPreparedSpellIdsByLevel?.[Number(level)] ?? []) {
          expect(repository.getSpell(spellId), `${subclass.id}:${spellId}`).toBeDefined()
        }
      }
    }
  })

  it('16 核心背景、10 物种与 8 血统的引用全部闭合', () => {
    const backgrounds = repository.backgrounds.filter((item) => item.ruleset === '5e-2024')
    // 背景总数随批次增长（G 批次新增第三方背景），核心 16 条必须齐备。
    expect(backgrounds.filter((item) => item.sourceIds.includes('source-2024-phb'))).toHaveLength(16)
    for (const background of backgrounds) {
      // 固定起源专长为可选项（第三方背景含「任选起源专长」），声明时须可解析。
      if (background.originFeatId) {
        expect(repository.getFeat(background.originFeatId), `${background.id}:origin-feat`).toBeDefined()
      }
      for (const skillId of background.skillIds) {
        expect(repository.getOption(skillId), `${background.id}:${skillId}`).toBeDefined()
      }
      for (const toolId of background.toolIds) {
        expect(repository.getEquipment(toolId), `${background.id}:${toolId}`).toBeDefined()
      }
      for (const toolId of background.toolChoices?.optionIds ?? []) {
        expect(repository.getEquipment(toolId), `${background.id}:${toolId}`).toBeDefined()
      }
    }

    const species = repository.races.filter((item) => item.ruleset === '5e-2024' && !item.parentRaceId)
    const lineages = repository.races.filter((item) => item.ruleset === '5e-2024' && item.parentRaceId)
    expect(species).toHaveLength(10)
    expect(lineages).toHaveLength(8)
    for (const race of [...species, ...lineages]) {
      for (const grant of race.spellGrants ?? []) {
        expect(repository.getSpell(grant.spellId), `${race.id}:${grant.spellId}`).toBeDefined()
      }
      for (const skillId of race.skillProficiencies ?? []) {
        expect(repository.getOption(skillId), `${race.id}:${skillId}`).toBeDefined()
      }
    }
  })

  it('75 专长的法术授予与 391 道 2024 法术的职业归属闭合', () => {
    const feats = repository.feats.filter((item) => item.ruleset === '5e-2024' && item.sourceIds.includes('source-2024-phb'))
    expect(feats).toHaveLength(75)
    for (const feat of feats) {
      for (const grant of feat.grantedSpells ?? []) {
        expect(repository.getSpell(grant.spellId), `${feat.id}:${grant.spellId}`).toBeDefined()
      }
    }

    const spells = repository.spells.filter((item) => item.ruleset === '5e-2024')
    expect(spells.length).toBeGreaterThanOrEqual(391)
    for (const spell of spells) {
      for (const classId of spell.classIds) {
        expect(repository.getClass(classId), `${spell.id}:${classId}`).toBeDefined()
      }
    }
  })

  it('348 条 DMG 魔法物品按 209 selectable／139 index-only 分层，index-only 不进入起始装备', () => {
    expect(magicItems2024).toHaveLength(348)
    expect(magicItems2024.filter((item) => item.status === 'selectable')).toHaveLength(209)
    expect(magicItems2024.filter((item) => item.status === 'index-only')).toHaveLength(139)

    const referenced = new Set<string>()
    for (const classRule of repository.classes) {
      const equipment = repository.getClassStartingEquipment(classRule.id)
      for (const grant of [
        ...(equipment?.fixedGrants ?? []),
        ...(equipment?.groups ?? []).flatMap((group) => group.options.flatMap((option) => option.grants)),
      ]) {
        referenced.add(grant.itemId)
      }
    }
    for (const background of repository.backgrounds) {
      for (const itemId of background.startingEquipmentOptionA ?? []) referenced.add(itemId)
      for (const toolId of background.toolIds) referenced.add(toolId)
    }
    for (const itemId of referenced) {
      const item = repository.getEquipment(itemId)
      if (item) expect(item.status, itemId).not.toBe('index-only')
    }
  })
})
