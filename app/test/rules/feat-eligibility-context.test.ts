import { describe, expect, it } from 'vitest'

import { getFeatEligibilityContext } from '@/rules/feat-eligibility'
import { getFeatEligibility } from '@/rules/feats'
import { getRulesRepository } from '@/rules/repositories'
import { validateDraft } from '@/rules/validate'
import type { CharacterDraft } from '@/types/character'
import { draft2024 } from '../fixtures/draft-2024'

const repository2024 = getRulesRepository('5e-2024')
const repository2014 = getRulesRepository('5e-2014')

/** 5 级 2024 战士：在第 4 级属性提升节点选择专长。 */
function fighter2024(overrides: Partial<CharacterDraft> = {}): CharacterDraft {
  return draft2024({
    classId: 'class-2024-fighter',
    targetLevel: 5,
    baseAbilities: { str: 15, dex: 14, con: 13, int: 8, wis: 12, cha: 10 },
    ...overrides,
  })
}

const contextAtFeat4 = (draft: CharacterDraft) => getFeatEligibilityContext(draft, {
  checkpointId: 'class-2024-fighter-feat-4',
  checkpointLevel: 4,
})

describe('B09-08 专长资格上下文（2024 等级与能力前置）', () => {
  it('5 级角色在 4 级节点可选中 4 级专长（缺陷回归）', () => {
    const draft = fighter2024()
    const feat = repository2024.getFeat('feat-2024-heavily-armored')
    if (!feat) throw new Error('缺少测试专长')
    const eligibility = getFeatEligibility(feat, contextAtFeat4(draft))
    expect(eligibility.reasons).not.toContain('需要4级')
    expect(eligibility.available).toBe(true)
  })

  it('等级不足时仍被拒绝：1 级起源节点不能选 4 级专长', () => {
    const feat = repository2024.getFeat('feat-2024-heavily-armored')!
    const eligibility = getFeatEligibility(feat, getFeatEligibilityContext(fighter2024(), {
      checkpointId: 'species-2024-human-origin-feat',
      checkpointLevel: 1,
    }))
    expect(eligibility.available).toBe(false)
    expect(eligibility.reasons).toContain('需要4级')
  })

  it('19 级传奇恩惠在 4 级节点仍不可选', () => {
    const feat = repository2024.getFeat('feat-2024-boon-of-combat-prowess')!
    const eligibility = getFeatEligibility(feat, contextAtFeat4(fighter2024()))
    expect(eligibility.available).toBe(false)
    expect(eligibility.reasons).toContain('需要19级')
  })

  it('护甲训练前置按 2024 职业训练判定（战士可选、法师不可选）', () => {
    const feat = repository2024.getFeat('feat-2024-heavily-armored')!
    const fighter = getFeatEligibility(feat, contextAtFeat4(fighter2024()))
    expect(fighter.available).toBe(true)

    const wizard = draft2024({ classId: 'class-2024-wizard', targetLevel: 5 })
    const wizardEligibility = getFeatEligibility(feat, getFeatEligibilityContext(wizard, {
      checkpointId: 'class-2024-wizard-feat-4',
      checkpointLevel: 4,
    }))
    expect(wizardEligibility.available).toBe(false)
    expect(wizardEligibility.reasons).toContain('需要中甲熟练')
  })

  it('与 validateDraft 同源：面板可选的 4 级专长不再触发前置错误，19 级恩惠仍报错', () => {
    const legal = fighter2024({ selections: [{ checkpointId: 'class-2024-fighter-feat-4', optionIds: ['feat-2024-heavily-armored'], confirmedAt: '' }] })
    expect(validateDraft(legal).some((issue) => issue.id.startsWith('feat-prerequisite-'))).toBe(false)

    const illegal = fighter2024({ selections: [{ checkpointId: 'class-2024-fighter-feat-4', optionIds: ['feat-2024-boon-of-combat-prowess'], confirmedAt: '' }] })
    const illegalIssues = validateDraft(illegal).filter((issue) => issue.id.startsWith('feat-prerequisite-'))
    expect(illegalIssues).toHaveLength(1)
    expect(illegalIssues[0]?.resolution).toContain('需要19级')
  })
})

describe('B09-08 专长资格上下文（2014 行为不变）', () => {
  it('2014 上下文不携带 2024 专属字段', () => {
    const draft: CharacterDraft = { ...draft2024(), ruleset: '5e-2014', classId: 'class-2014-fighter', targetLevel: 5 }
    const context = getFeatEligibilityContext(draft, { checkpointId: 'fighter-2014-asi-4', checkpointLevel: 4 })
    expect(context.level).toBeUndefined()
    expect(context.armorTrainings).toBeUndefined()
    expect(context.hasFightingStyle).toBeUndefined()
  })

  it('2014 专长资格与既有行为一致（护甲前置走职业映射）', () => {
    const feat = repository2014.feats.find((item) => item.prerequisite?.requiredCapability === 'armor-heavy')
    if (!feat) return
    const draft: CharacterDraft = { ...draft2024(), ruleset: '5e-2014', classId: 'class-2014-fighter', targetLevel: 5 }
    const fighter = getFeatEligibility(feat, getFeatEligibilityContext(draft, { checkpointId: 'fighter-2014-asi-4', checkpointLevel: 4 }))
    expect(fighter.available).toBe(true)

    const wizard: CharacterDraft = { ...draft, classId: 'class-2014-wizard' }
    const wizardEligibility = getFeatEligibility(feat, getFeatEligibilityContext(wizard, { checkpointId: 'wizard-2014-asi-4', checkpointLevel: 4 }))
    expect(wizardEligibility.available).toBe(false)
  })
})
