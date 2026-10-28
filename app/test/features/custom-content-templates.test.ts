import { describe, expect, it } from 'vitest'

import { buildTemplateEntry, listCustomTemplateOptions } from '@/features/custom-content/templates'
import { getRulesRepository } from '@/rules/repositories'
import type { CustomClassEntry, CustomRaceEntry, CustomSpellEntry } from '@/types/custom-content'

const DEFAULTS = { expansionId: 'source-custom-test', ruleset: '5e-2014' as const }

describe('内容工坊：从内置条目复制为模板', () => {
  it('种族模板保留机制字段并加上「（自制）」后缀', () => {
    const repository = getRulesRepository('5e-2014')
    const entry = buildTemplateEntry(repository, 'race', 'race-2014-halfling', DEFAULTS) as CustomRaceEntry | undefined

    expect(entry?.kind).toBe('race')
    expect(entry?.name).toBe('半身人（自制）')
    expect(entry?.id).toBe('')
    expect(entry?.expansionId).toBe('source-custom-test')
    expect(entry?.speed).toBe(25)
    expect(entry?.fixedAbilityBonuses).toMatchObject({ dex: 2 })
  })

  it('缺少显式速度字段的内置种族复制后速度留空，由车卡按默认值处理', () => {
    const repository = getRulesRepository('5e-2014')
    // 2014 人类没有登记 speed 字段（描述里的 30 尺由派生默认值兜底）
    const entry = buildTemplateEntry(repository, 'race', 'race-2014-human', DEFAULTS) as CustomRaceEntry | undefined
    expect(entry?.speed).toBeUndefined()
    expect(entry?.fixedAbilityBonuses).toMatchObject({ str: 1, dex: 1, con: 1, int: 1, wis: 1, cha: 1 })
  })

  it('法术模板把 2014 的短职业键还原成完整职业 ID', () => {
    const repository = getRulesRepository('5e-2014')
    const entry = buildTemplateEntry(repository, 'spell', 'spell-2014-fire-bolt', DEFAULTS) as CustomSpellEntry | undefined

    expect(entry?.kind).toBe('spell')
    expect(entry?.name).toBe('火焰箭（自制）')
    expect(entry?.level).toBe(0)
    expect(entry?.classIds).toEqual(expect.arrayContaining(['class-2014-wizard', 'class-2014-sorcerer']))
    expect(entry?.classIds.every((id) => id.startsWith('class-2014-'))).toBe(true)
  })

  it('职业模板沿用自身法术表作为施法引用', () => {
    const repository = getRulesRepository('5e-2014')
    const entry = buildTemplateEntry(repository, 'class', 'class-2014-wizard', DEFAULTS) as CustomClassEntry | undefined

    expect(entry?.kind).toBe('class')
    expect(entry?.name).toBe('法师（自制）')
    expect(entry?.hitDie).toBe(6)
    expect(entry?.spellcastingSourceClassId).toBe('class-2014-wizard')
    expect(entry?.savingThrowAbilities).toEqual(['int', 'wis'])
    expect(entry?.features?.length ?? 0).toBeGreaterThan(0)
  })

  it('专长模板保留类别与结构化效果，模板 ID 为空', () => {
    const repository = getRulesRepository('5e-2024')
    const options = listCustomTemplateOptions(repository, 'feat')
    expect(options.length).toBeGreaterThan(0)
    const first = options[0]
    if (!first) throw new Error('feat template missing')

    const entry = buildTemplateEntry(repository, 'feat', first.id, {
      expansionId: 'source-custom-test',
      ruleset: '5e-2024',
    })
    expect(entry?.kind).toBe('feat')
    expect(entry?.name).toContain('（自制）')
    expect(entry?.id).toBe('')
  })

  it('模板候选排除子种族，且不包含归档条目', () => {
    const repository = getRulesRepository('5e-2014')
    const options = listCustomTemplateOptions(repository, 'race')
    expect(options.length).toBeGreaterThan(0)
    expect(options.some((option) => option.id === 'race-2014-elf')).toBe(true)
    // 子种族（parentRaceId 非空）不在候选里：变体人类、丘陵矮人都是子种族
    expect(options.some((option) => option.id === 'race-2014-human-variant')).toBe(false)
    expect(options.some((option) => option.id === 'race-2014-dwarf-hill')).toBe(false)
  })
})
