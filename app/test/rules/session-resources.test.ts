import { describe, expect, it } from 'vitest'

import { getRulesRepository } from '@/rules/repositories'
import { applyResourceChange, applyRestRecovery, getResourceUsed, getShortRestExhaustionReduction, listSessionResources } from '@/rules/session-resources'
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

  it('战士子职：卓越战技短休全部恢复；灵能骰池短休只回 1 枚', () => {
    const battleMaster = listSessionResources(draftFor('class-2024-fighter', 10, { subclassId: 'subclass-2024-fighter-battle-master' }), MODIFIERS)
    const superiority = battleMaster.find((item) => item.id === 'fighter-2024-battle-master-combat-superiority')
    expect(superiority).toMatchObject({ dice: true, unit: 'd10', recovery: 'short-rest', max: 5 })

    const psi = listSessionResources(draftFor('class-2024-fighter', 11, { subclassId: 'subclass-2024-fighter-psi-warrior' }), MODIFIERS)
    const psiPool = psi.find((item) => item.id === 'fighter-2024-psi-warrior-psionic-power')
    expect(psiPool).toMatchObject({ dice: true, recovery: 'short-rest', shortRestRecovery: 1, max: 8 })

    const spent = { ...createInitialSessionState('d4', 60), resourceUsage: { [superiority!.id]: 5, [psiPool!.id]: 3 } }
    const rested = applyRestRecovery(spent, battleMaster, 'short-rest')
    expect(getResourceUsed(rested, superiority!.id)).toBe(0)

    const psiSpent = { ...createInitialSessionState('d4b', 60), resourceUsage: { [psiPool!.id]: 3 } }
    expect(getResourceUsed(applyRestRecovery(psiSpent, psi, 'short-rest'), psiPool!.id)).toBe(2)
    expect(getResourceUsed(applyRestRecovery(psiSpent, psi, 'long-rest'), psiPool!.id)).toBe(0)
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

describe('B10-02 跑团资源结算（游荡者／游侠批次）', () => {
  it('游荡者：幸运一击 20 级起短休或长休恢复 1 次', () => {
    const at20 = listSessionResources(draftFor('class-2024-rogue', 20), MODIFIERS)
    const stroke = at20.find((item) => item.id === 'rogue-2024-class-stroke-of-luck')!
    expect(stroke).toMatchObject({ max: 1, recovery: 'short-rest' })

    const spent = { ...createInitialSessionState('r1', 100), resourceUsage: { [stroke.id]: 1 } }
    expect(getResourceUsed(applyRestRecovery(spent, at20, 'short-rest'), stroke.id)).toBe(0)
    expect(getResourceUsed(applyRestRecovery(spent, at20, 'long-rest'), stroke.id)).toBe(0)

    expect(listSessionResources(draftFor('class-2024-rogue', 19), MODIFIERS)
      .some((item) => item.id === stroke.id)).toBe(false)
  })

  it('魂刃：灵能骰池短休只回 1 枚、长休全部恢复', () => {
    const level3 = listSessionResources(
      draftFor('class-2024-rogue', 3, { subclassId: 'subclass-2024-rogue-soulknife' }),
      MODIFIERS,
    )
    const dice = level3.find((item) => item.id === 'rogue-2024-soulknife-psionic-power')!
    expect(dice).toMatchObject({ dice: true, unit: 'd6', recovery: 'short-rest', shortRestRecovery: 1, max: 4 })

    const level9 = listSessionResources(
      draftFor('class-2024-rogue', 9, { subclassId: 'subclass-2024-rogue-soulknife' }),
      MODIFIERS,
    ).find((item) => item.id === 'rogue-2024-soulknife-psionic-power')!
    expect(level9).toMatchObject({ unit: 'd8', max: 8 })

    const spent = { ...createInitialSessionState('r2', 80), resourceUsage: { [dice.id]: 3 } }
    expect(getResourceUsed(applyRestRecovery(spent, level3, 'short-rest'), dice.id)).toBe(2)
    expect(getResourceUsed(applyRestRecovery(spent, level3, 'long-rest'), dice.id)).toBe(0)
  })

  it('魂刃：灵能面纱与撕裂心智为长休 1 次（短休不回）', () => {
    const at13 = listSessionResources(
      draftFor('class-2024-rogue', 13, { subclassId: 'subclass-2024-rogue-soulknife' }),
      MODIFIERS,
    )
    const veil = at13.find((item) => item.id === 'rogue-2024-soulknife-psychic-veil')!
    expect(veil).toMatchObject({ max: 1, recovery: 'long-rest' })
    expect(at13.some((item) => item.id === 'rogue-2024-soulknife-rend-mind')).toBe(false)

    const at17 = listSessionResources(
      draftFor('class-2024-rogue', 17, { subclassId: 'subclass-2024-rogue-soulknife' }),
      MODIFIERS,
    )
    const rendMind = at17.find((item) => item.id === 'rogue-2024-soulknife-rend-mind')!
    expect(rendMind).toMatchObject({ max: 1, recovery: 'long-rest' })

    const spent = { ...createInitialSessionState('r3', 120), resourceUsage: { [veil.id]: 1, [rendMind.id]: 1 } }
    const shortRested = applyRestRecovery(spent, at17, 'short-rest')
    expect([veil, rendMind].map((item) => getResourceUsed(shortRested, item.id))).toEqual([1, 1])
    const longRested = applyRestRecovery(spent, at17, 'long-rest')
    expect([veil, rendMind].map((item) => getResourceUsed(longRested, item.id))).toEqual([0, 0])
  })

  it('游侠：宿敌次数按等级成长且仅长休恢复', () => {
    const resourcesAt = (level: number) => listSessionResources(draftFor('class-2024-ranger', level), MODIFIERS)
    const enemyAt = (level: number) => resourcesAt(level).find((item) => item.id === 'ranger-2024-class-favored-enemy')!
    expect([1, 5, 9, 13, 17].map((level) => enemyAt(level).max)).toEqual([2, 3, 4, 5, 6])
    expect(enemyAt(17).recovery).toBe('long-rest')

    const spent = { ...createInitialSessionState('r4', 80), resourceUsage: { [enemyAt(17).id]: 2 } }
    expect(getResourceUsed(applyRestRecovery(spent, resourcesAt(17), 'short-rest'), enemyAt(17).id)).toBe(2)
    expect(getResourceUsed(applyRestRecovery(spent, resourcesAt(17), 'long-rest'), enemyAt(17).id)).toBe(0)
  })

  it('游侠：感知型资源（不知疲倦、自然面纱、雾行漫游）按感知调整值且长休恢复', () => {
    const wisModifiers = { ...MODIFIERS, wis: 3 }
    const base = listSessionResources(draftFor('class-2024-ranger', 14), wisModifiers)
    const tireless = base.find((item) => item.id === 'ranger-2024-class-tireless')!
    const veil = base.find((item) => item.id === 'ranger-2024-class-natures-veil')!
    expect([tireless.max, veil.max]).toEqual([3, 3])

    const fey = listSessionResources(
      draftFor('class-2024-ranger', 15, { subclassId: 'subclass-2024-ranger-fey-wanderer' }),
      wisModifiers,
    )
    const misty = fey.find((item) => item.id === 'ranger-2024-fey-wanderer-misty-wanderer')!
    expect(misty).toMatchObject({ max: 3, recovery: 'long-rest' })

    const spent = { ...createInitialSessionState('r5', 90), resourceUsage: { [tireless.id]: 2, [veil.id]: 1, [misty.id]: 2 } }
    const resources = [...base, ...fey]
    const shortRested = applyRestRecovery(spent, resources, 'short-rest')
    expect([tireless, veil, misty].map((item) => getResourceUsed(shortRested, item.id))).toEqual([2, 1, 2])
    const longRested = applyRestRecovery(spent, resources, 'long-rest')
    expect([tireless, veil, misty].map((item) => getResourceUsed(longRested, item.id))).toEqual([0, 0, 0])
  })

  it('游侠：恐惧打击归幽域追猎者；妖精漫游者哀惧灵袭不再产生资源', () => {
    const wisModifiers = { ...MODIFIERS, wis: 2 }
    const gloom = listSessionResources(
      draftFor('class-2024-ranger', 3, { subclassId: 'subclass-2024-ranger-gloom-stalker' }),
      wisModifiers,
    )
    const dreadful = gloom.find((item) => item.id === 'ranger-2024-gloom-stalker-dread-ambusher')!
    expect(dreadful).toMatchObject({ max: 2, recovery: 'long-rest' })

    const fey = listSessionResources(
      draftFor('class-2024-ranger', 3, { subclassId: 'subclass-2024-ranger-fey-wanderer' }),
      wisModifiers,
    )
    expect(fey.some((item) => item.id === 'ranger-2024-fey-wanderer-dreadful-strikes')).toBe(false)
  })

  it('不知疲倦：2024 游侠短休额外降低力竭 1 级，其他职业与 2014 无此效果', () => {
    expect(getShortRestExhaustionReduction(draftFor('class-2024-ranger', 10))).toBe(1)
    expect(getShortRestExhaustionReduction(draftFor('class-2024-ranger', 9))).toBe(0)
    expect(getShortRestExhaustionReduction(draftFor('class-2024-fighter', 10))).toBe(0)
    const legacy: CharacterDraft = { ...draftFor('class-2024-ranger', 10), ruleset: '5e-2014', classId: 'class-2014-ranger' }
    expect(getShortRestExhaustionReduction(legacy)).toBe(0)
  })
})
