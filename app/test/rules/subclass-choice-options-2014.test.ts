import { describe, expect, it } from 'vitest'

import { SUBCLASS_CHOICE_OPTION_IDS, subclassChoiceOptions2014 } from '@/rules/data/subclass-choice-options-2014'
import { rulesRepository } from '@/rules/repository'

describe('2014 子职选择选项数据', () => {
  it('登记 77 项子职选项（战技由 fighter.ts 提供）：ID 唯一、全部核验为 implemented', () => {
    expect(SUBCLASS_CHOICE_OPTION_IDS).toHaveLength(88)
    expect(new Set(SUBCLASS_CHOICE_OPTION_IDS).size).toBe(88)
    expect(subclassChoiceOptions2014).toHaveLength(77)
    for (const option of subclassChoiceOptions2014) {
      expect(option.status).toBe('implemented')
      expect(option.name.length).toBeGreaterThan(0)
      expect(option.englishName?.length ?? 0).toBeGreaterThan(0)
      expect(option.description.length).toBeGreaterThan(0)
      expect(option.sourceIds.length).toBeGreaterThan(0)
    }
    // 战技 11 项
    expect(SUBCLASS_CHOICE_OPTION_IDS.filter((id) => id.startsWith('maneuver-'))).toHaveLength(11)
  })

  it('装甲型号与魔能炮台型号 5 项可解析（批次 B／D2），译名以 5e 不全书为准', () => {
    const armorModels = ['artificer-armor-model-guardian', 'artificer-armor-model-infiltrator']
    const cannons = ['artificer-cannon-flamethrower', 'artificer-cannon-force-ballista', 'artificer-cannon-protector']
    for (const id of [...armorModels, ...cannons]) {
      expect(SUBCLASS_CHOICE_OPTION_IDS, id).toContain(id)
      expect(rulesRepository.getOption(id)?.name, id).toBeTruthy()
    }
    expect(rulesRepository.getOption('artificer-armor-model-guardian')?.name).toBe('守护者')
    // Q10：CHM 用字「渗透者」，不再使用旧标签「潜行者」
    expect(rulesRepository.getOption('artificer-armor-model-infiltrator')?.name).toBe('渗透者')
    expect(rulesRepository.getOption('artificer-cannon-protector')?.name).toBe('防御者')
  })

  it('不重复登记战斗风格选项（剑舞学院复用战士注册）', () => {
    expect(SUBCLASS_CHOICE_OPTION_IDS).not.toContain('style-dueling')
    expect(SUBCLASS_CHOICE_OPTION_IDS).not.toContain('style-two-weapon')
  })

  it('全部选项注册进规则库 options 且可解析', () => {
    for (const id of SUBCLASS_CHOICE_OPTION_IDS) {
      const option = rulesRepository.getOption(id)
      expect(option?.name).toBeTruthy()
      expect(option?.description).toBeTruthy()
    }
  })
})
