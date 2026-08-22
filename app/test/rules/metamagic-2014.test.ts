import { describe, expect, it } from 'vitest'

import { METAMAGIC_OPTION_IDS, metamagicOptions2014 } from '@/rules/data/metamagic-2014'
import { rulesRepository } from '@/rules/repository'

describe('2014 术士超魔选项', () => {
  it('登记 10 项超魔：ID 唯一、前缀正确、全部核验为 implemented', () => {
    expect(METAMAGIC_OPTION_IDS).toHaveLength(10)
    expect(new Set(METAMAGIC_OPTION_IDS).size).toBe(10)
    expect(METAMAGIC_OPTION_IDS.every((id) => id.startsWith('metamagic-'))).toBe(true)
    expect(metamagicOptions2014).toHaveLength(METAMAGIC_OPTION_IDS.length)
    for (const option of metamagicOptions2014) {
      expect(option.status).toBe('implemented')
      expect(option.name.length).toBeGreaterThan(0)
      expect(option.englishName?.length ?? 0).toBeGreaterThan(0)
      expect(option.description.length).toBeGreaterThan(0)
      expect(option.sourceIds.length).toBeGreaterThan(0)
    }
  })

  it('超魔选项全部注册进规则库 options 且可解析', () => {
    for (const id of METAMAGIC_OPTION_IDS) {
      const option = rulesRepository.getOption(id)
      expect(option?.name).toBeTruthy()
      expect(option?.description).toBeTruthy()
    }
  })
})
