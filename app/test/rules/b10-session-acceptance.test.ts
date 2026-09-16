import { describe, expect, it } from 'vitest'

import { getRulesRepository } from '@/rules/repositories'
import { applyResourceChange, applyRestRecovery, getResourceUsed, listSessionResources } from '@/rules/session-resources'
import { createInitialSessionState } from '@/rules/session-state'
import type { CharacterDraft } from '@/types/character'
import { draft2024 } from '../fixtures/draft-2024'

/** B10-05 整体验收：12 个 2024 职业、全部核心子职与 2014 行为不变。 */

const CLASS_IDS = [
  'class-2024-barbarian',
  'class-2024-bard',
  'class-2024-cleric',
  'class-2024-druid',
  'class-2024-fighter',
  'class-2024-monk',
  'class-2024-paladin',
  'class-2024-ranger',
  'class-2024-rogue',
  'class-2024-sorcerer',
  'class-2024-warlock',
  'class-2024-wizard',
] as const

const MODIFIERS = { str: 3, dex: 2, con: 2, int: 0, wis: 1, cha: 1 }

function draftFor(classId: string, subclassId?: string): CharacterDraft {
  return draft2024({ classId, ...(subclassId ? { subclassId } : {}), targetLevel: 20 })
}

describe('B10-05 跑团资源结算整体验收', () => {
  it('12 个 2024 职业在 20 级都有可结算资源，且条目合法不重复', () => {
    for (const classId of CLASS_IDS) {
      const resources = listSessionResources(draftFor(classId), MODIFIERS)
      expect(resources.length, classId).toBeGreaterThan(0)
      const ids = resources.map((item) => item.id)
      expect(new Set(ids).size, classId).toBe(ids.length)
      for (const resource of resources) {
        expect(resource.max, `${classId}:${resource.id}`).toBeGreaterThan(0)
        expect(['short-rest', 'long-rest'], `${classId}:${resource.id}`).toContain(resource.recovery)
      }
    }
  })

  it('每个资源都能完成“消耗→越界钳制→短休／长休回充”闭环', () => {
    for (const classId of CLASS_IDS) {
      const resources = listSessionResources(draftFor(classId), MODIFIERS)
      for (const resource of resources) {
        const label = `${classId}:${resource.id}`
        const state = createInitialSessionState(`acceptance-${classId}`, 120)
        const consumed = applyResourceChange(state, resource.id, resource.max, resource.max).state
        expect(getResourceUsed(consumed, resource.id), label).toBe(resource.max)
        expect(applyResourceChange(consumed, resource.id, 1, resource.max).clamped, label).toBe(true)

        expect(getResourceUsed(applyRestRecovery(consumed, resources, 'long-rest'), resource.id), label).toBe(0)
        if (resource.recovery === 'short-rest') {
          const regained = resource.shortRestRecovery ?? resource.max
          expect(getResourceUsed(applyRestRecovery(consumed, resources, 'short-rest'), resource.id), label)
            .toBe(Math.max(0, resource.max - regained))
        } else {
          expect(getResourceUsed(applyRestRecovery(consumed, resources, 'short-rest'), resource.id), label)
            .toBe(resource.max)
        }
      }
    }
  })

  it('全部 2024 核心子职在 20 级生成合法资源集合', () => {
    const repository = getRulesRepository('5e-2024')
    const subclasses = repository.subclasses.filter((subclass) => CLASS_IDS.includes(subclass.classId as (typeof CLASS_IDS)[number]))
    expect(subclasses.length).toBeGreaterThanOrEqual(48)
    for (const subclass of subclasses) {
      const resources = listSessionResources(draftFor(subclass.classId, subclass.id), MODIFIERS)
      const ids = resources.map((item) => item.id)
      expect(new Set(ids).size, subclass.id).toBe(ids.length)
      for (const resource of resources) {
        expect(resource.max, `${subclass.id}:${resource.id}`).toBeGreaterThan(0)
      }
    }
  })

  it('已登记结算数据的职业／子职特性都进入资源或免费施法列表', () => {
    const repository = getRulesRepository('5e-2024')
    const assertSettled = (ownerId: string, subclassId: string | undefined, features: readonly { id: string; resource?: unknown; dicePool?: { recovery?: string }; grantedSpells?: readonly { freeCastings?: number; freeCastingsFrom?: unknown }[] }[]) => {
      const resources = listSessionResources(draftFor(ownerId, subclassId), MODIFIERS)
      for (const feature of features) {
        const hasFreeCast = (feature.grantedSpells ?? []).some((grant) => (grant.freeCastings ?? 0) > 0 || grant.freeCastingsFrom !== undefined)
        const hasSettlement = Boolean(feature.resource)
          || Boolean(feature.dicePool?.recovery && feature.dicePool.recovery !== 'none')
          || hasFreeCast
        if (!hasSettlement) continue
        const found = resources.some((item) => item.id === feature.id || item.id.startsWith(`${feature.id}:`))
        expect(found, `${ownerId}:${feature.id}`).toBe(true)
      }
    }
    for (const classRule of repository.classes) {
      assertSettled(classRule.id, undefined, classRule.features)
      for (const subclass of repository.subclasses.filter((item) => item.classId === classRule.id)) {
        assertSettled(classRule.id, subclass.id, subclass.features)
      }
    }
  })

  it('2014 全职业不产生可结算资源（行为不变回归）', () => {
    const repository = getRulesRepository('5e-2014')
    for (const classRule of repository.classes) {
      const draft: CharacterDraft = { ...draft2024(), ruleset: '5e-2014', classId: classRule.id, targetLevel: 20 }
      expect(listSessionResources(draft, MODIFIERS), classRule.id).toEqual([])
    }
  })
})
