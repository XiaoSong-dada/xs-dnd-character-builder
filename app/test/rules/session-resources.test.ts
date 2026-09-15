import { describe, expect, it } from 'vitest'

import { getRulesRepository } from '@/rules/repositories'
import { applyResourceChange, applyRestRecovery, getResourceUsed, listSessionResources } from '@/rules/session-resources'
import { createInitialSessionState } from '@/rules/session-state'
import type { CharacterDraft } from '@/types/character'
import { draft2024 } from '../fixtures/draft-2024'

const MODIFIERS = { str: 3, dex: 2, con: 2, int: 0, wis: 1, cha: 1 }

function draftFor(classId: string, targetLevel: number, overrides: Partial<CharacterDraft> = {}): CharacterDraft {
  return draft2024({ classId, targetLevel, ...overrides })
}

describe('B10-02 跑团资源结算（武职批次）', () => {
  it('野蛮人：狂暴短休只回 1 次、长休回满', () => {
    const draft = draftFor('class-2024-barbarian', 5)
    const resources = listSessionResources(draft, MODIFIERS)
    const rage = resources.find((item) => item.id === 'barbarian-2024-class-rage')
    expect(rage).toMatchObject({ max: 3, recovery: 'short-rest', shortRestRecovery: 1 })

    const spent = { ...createInitialSessionState('d1', 40), resourceUsage: { [rage!.id]: 3 } }
    const shortRested = applyRestRecovery(spent, resources, 'short-rest')
    expect(getResourceUsed(shortRested, rage!.id)).toBe(2)

    const longRested = applyRestRecovery(spent, resources, 'long-rest')
    expect(getResourceUsed(longRested, rage!.id)).toBe(0)
  })

  it('野蛮人：神之勇者（狂热者）为长休恢复的 d12 池', () => {
    const draft = draftFor('class-2024-barbarian', 5, { subclassId: 'subclass-2024-barbarian-path-of-the-zealot' })
    const resources = listSessionResources(draft, MODIFIERS)
    const zealot = resources.find((item) => item.id === 'barbarian-2024-zealot-warrior-of-the-gods')
    expect(zealot).toMatchObject({ recovery: 'long-rest', dice: false, unit: 'd12' })
    const spent = { ...createInitialSessionState('d2', 40), resourceUsage: { [zealot!.id]: 2 } }
    expect(getResourceUsed(applyRestRecovery(spent, resources, 'short-rest'), zealot!.id)).toBe(2)
    expect(getResourceUsed(applyRestRecovery(spent, resources, 'long-rest'), zealot!.id)).toBe(0)
  })

  it('战士：回气短休回 1、动作如潮短休回满、不屈长休回满', () => {
    const draft = draftFor('class-2024-fighter', 9)
    const resources = listSessionResources(draft, MODIFIERS)
    const secondWind = resources.find((item) => item.id === 'fighter-2024-class-second-wind')!
    const actionSurge = resources.find((item) => item.id === 'fighter-2024-class-action-surge')!
    const indomitable = resources.find((item) => item.id === 'fighter-2024-class-indomitable')!

    expect(secondWind.shortRestRecovery).toBe(1)
    expect(actionSurge.shortRestRecovery).toBeUndefined()
    expect(indomitable.recovery).toBe('long-rest')

    const spent = {
      ...createInitialSessionState('d3', 60),
      resourceUsage: { [secondWind.id]: 2, [actionSurge.id]: 1, [indomitable.id]: 1 },
    }
    const shortRested = applyRestRecovery(spent, resources, 'short-rest')
    expect(getResourceUsed(shortRested, secondWind.id)).toBe(1)
    expect(getResourceUsed(shortRested, actionSurge.id)).toBe(0)
    expect(getResourceUsed(shortRested, indomitable.id)).toBe(1)

    const longRested = applyRestRecovery(spent, resources, 'long-rest')
    expect([secondWind, actionSurge, indomitable].map((item) => getResourceUsed(longRested, item.id))).toEqual([0, 0, 0])
  })

  it('战士子职：卓越战技与灵能骰池短休全部恢复', () => {
    const battleMaster = listSessionResources(draftFor('class-2024-fighter', 10, { subclassId: 'subclass-2024-fighter-battle-master' }), MODIFIERS)
    const superiority = battleMaster.find((item) => item.id === 'fighter-2024-battle-master-combat-superiority')
    expect(superiority).toMatchObject({ dice: true, unit: 'd10', recovery: 'short-rest', max: 5 })

    const psi = listSessionResources(draftFor('class-2024-fighter', 11, { subclassId: 'subclass-2024-fighter-psi-warrior' }), MODIFIERS)
    const psiPool = psi.find((item) => item.id === 'fighter-2024-psi-warrior-psionic-power')
    expect(psiPool).toMatchObject({ dice: true, recovery: 'short-rest', max: 8 })

    const spent = { ...createInitialSessionState('d4', 60), resourceUsage: { [superiority!.id]: 5, [psiPool!.id]: 3 } }
    const rested = applyRestRecovery(spent, battleMaster, 'short-rest')
    expect(getResourceUsed(rested, superiority!.id)).toBe(0)
  })

  it('武僧：武功点短休全部恢复；武艺骰池（recovery none）不进入结算', () => {
    const resources = listSessionResources(draftFor('class-2024-monk', 5), MODIFIERS)
    const focus = resources.find((item) => item.id === 'monk-2024-class-monks-focus')!
    expect(focus).toMatchObject({ recovery: 'short-rest', max: 5 })
    expect(resources.some((item) => item.id === 'monk-2024-class-martial-arts')).toBe(false)

    const spent = { ...createInitialSessionState('d5', 40), resourceUsage: { [focus.id]: 4 } }
    expect(getResourceUsed(applyRestRecovery(spent, resources, 'short-rest'), focus.id)).toBe(0)
  })

  it('消耗与恢复钳制在 [0, max]，越界钳制到上限并标记', () => {
    const state = createInitialSessionState('d6', 40)
    const spent = applyResourceChange(state, 'rage', 1, 3).state
    expect(getResourceUsed(spent, 'rage')).toBe(1)

    const overflow = applyResourceChange(spent, 'rage', 5, 3)
    expect(overflow.clamped).toBe(true)
    expect(getResourceUsed(overflow.state, 'rage')).toBe(3)

    const underflow = applyResourceChange(spent, 'rage', -5, 3)
    expect(underflow.clamped).toBe(true)
    expect(getResourceUsed(underflow.state, 'rage')).toBe(0)

    const recovered = applyResourceChange(spent, 'rage', -1, 3).state
    expect(getResourceUsed(recovered, 'rage')).toBe(0)
  })

  it('2014 角色不产生可消耗资源（保持稳定）', () => {
    const legacy: CharacterDraft = { ...draftFor('class-2024-fighter', 9), ruleset: '5e-2014', classId: 'class-2014-fighter' }
    expect(listSessionResources(legacy, MODIFIERS)).toEqual([])
    expect(listSessionResources(legacy, MODIFIERS, getRulesRepository('5e-2014'))).toEqual([])
  })

describe('B10-02 跑团资源结算（神术批次）', () => {
  it('牧师：引导神力短休恢复 1 次、神圣干预仅长休', () => {
    const resources = listSessionResources(draftFor('class-2024-cleric', 10), MODIFIERS)
    const channel = resources.find((item) => item.id === 'cleric-2024-class-channel-divinity')!
    const intervention = resources.find((item) => item.id === 'cleric-2024-class-divine-intervention')!

    expect(channel).toMatchObject({ recovery: 'short-rest', shortRestRecovery: 1 })
    expect(intervention).toMatchObject({ recovery: 'long-rest' })

    const spent = {
      ...createInitialSessionState('c1', 60),
      resourceUsage: { [channel.id]: 2, [intervention.id]: 1 },
    }
    const shortRested = applyRestRecovery(spent, resources, 'short-rest')
    expect(getResourceUsed(shortRested, channel.id)).toBe(1)
    expect(getResourceUsed(shortRested, intervention.id)).toBe(1)

    const longRested = applyRestRecovery(spent, resources, 'long-rest')
    expect([channel, intervention].map((item) => getResourceUsed(longRested, item.id))).toEqual([0, 0])
  })

  it('圣武士：圣疗池按 5×等级、长休回满；引导神力短休恢复 1 次', () => {
    const resources = listSessionResources(draftFor('class-2024-paladin', 10), MODIFIERS)
    const layOnHands = resources.find((item) => item.id === 'paladin-2024-class-lay-on-hands')!
    const channel = resources.find((item) => item.id === 'paladin-2024-class-channel-divinity')!

    expect(layOnHands).toMatchObject({ max: 50, recovery: 'long-rest', unit: '点治疗量' })
    expect(channel.shortRestRecovery).toBe(1)

    const spent = { ...createInitialSessionState('p1', 70), resourceUsage: { [layOnHands.id]: 30, [channel.id]: 1 } }
    const shortRested = applyRestRecovery(spent, resources, 'short-rest')
    expect(getResourceUsed(shortRested, layOnHands.id)).toBe(30)
    expect(getResourceUsed(shortRested, channel.id)).toBe(0)
    expect(getResourceUsed(applyRestRecovery(spent, resources, 'long-rest'), layOnHands.id)).toBe(0)
  })

  it('圣武士（荣耀之誓）：辉煌防御按魅力调整值、长休回满', () => {
    const resources = listSessionResources(
      draftFor('class-2024-paladin', 15, { subclassId: 'subclass-2024-paladin-oath-of-glory' }),
      MODIFIERS,
    )
    const glory = resources.find((item) => item.id === 'paladin-2024-glory-glorious-defense')!
    expect(glory).toMatchObject({ max: Math.max(1, MODIFIERS.cha), recovery: 'long-rest' })

    const spent = { ...createInitialSessionState('p2', 90), resourceUsage: { [glory.id]: 1 } }
    expect(getResourceUsed(applyRestRecovery(spent, resources, 'short-rest'), glory.id)).toBe(1)
    expect(getResourceUsed(applyRestRecovery(spent, resources, 'long-rest'), glory.id)).toBe(0)
  })

  it('神术批次不把无上限条目误判为可消耗资源', () => {
    for (const resource of listSessionResources(draftFor('class-2024-paladin', 10), MODIFIERS)) {
      expect(resource.max).toBeGreaterThan(0)
      expect(['short-rest', 'long-rest']).toContain(resource.recovery)
    }
  })
})
})
