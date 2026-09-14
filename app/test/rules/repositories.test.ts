import { describe, expect, it } from 'vitest'

import { rulesRepository } from '@/rules/repository'
import {
  getRulesRepository,
  isRulesetId,
  rulesRepository2024,
  UnsupportedRulesetError,
} from '@/rules/repositories'

describe('versioned rules repositories', () => {
  it('keeps the compatibility repository bound to 2014', () => {
    expect(rulesRepository.ruleset).toBe('5e-2014')
    expect(getRulesRepository('5e-2014')).toBe(rulesRepository)
  })

  it('resolves the versioned 2024 repository', () => {
    const repository = getRulesRepository('5e-2024')
    expect(repository).toBe(rulesRepository2024)
    expect(repository.ruleset).toBe('5e-2024')
    expect(repository.getClass('class-2024-fighter')?.status).toBe('implemented')
    expect(repository.getClass('class-2024-wizard')?.status).toBe('unavailable')
    expect(repository.getClass('class-2024-fighter')?.hitDie).toBe(10)
    expect(repository.getClass('class-2024-wizard')?.primaryAbilities).toEqual(['int'])
    expect(repository.getClass('class-2024-wizard')?.sourceIds).toContain('source-2024-phb')
    expect(repository.getSubclass('subclass-2024-fighter-champion')?.status).toBe('implemented')
    expect(repository.getSubclass('subclass-2024-wizard-evoker')).toBeDefined()
    expect(repository.getRace('species-2024-human')).toBeDefined()
    expect(repository.getBackground('background-2024-sage')).toBeDefined()
    expect(repository.getFeat('feat-2024-alert')).toBeDefined()
    expect(repository.getSpell('spell-2024-magic-missile')).toBeDefined()
    expect(repository.getEquipment('equipment-2024-longsword')).toBeDefined()
    expect(repository.sources.every((source) => !source.selectable)).toBe(true)
  })

  it('does not resolve identifiers across versions', () => {
    expect(getRulesRepository('5e-2014').getClass('class-2024-fighter')).toBeUndefined()
    expect(getRulesRepository('5e-2024').getClass('class-2014-fighter')).toBeUndefined()
  })

  it.each([undefined, '', '5e-2025', 2024])('rejects an unsupported runtime ruleset: %s', (value) => {
    expect(isRulesetId(value)).toBe(false)
    expect(() => getRulesRepository(value)).toThrow(UnsupportedRulesetError)
  })
})
