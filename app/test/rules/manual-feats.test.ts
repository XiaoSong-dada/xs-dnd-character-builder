import { describe, expect, it } from 'vitest'

import { deriveCharacter } from '@/rules/derive'
import {
  buildManualFeatChoiceCheckpoints,
  collectFeatSkillSelections,
  getFeatStructuredEffectLabels,
  listFeatGrants,
  manualFeatParentCheckpointId,
} from '@/rules/feats'
import { rulesRepository2024 } from '@/rules/repositories'
import { getAlwaysPreparedSpellIds, getSpellFreeCastings } from '@/rules/spellcasting'
import { validateDraft } from '@/rules/validate'
import type { CharacterDraft, ManualFeatGrant } from '@/types/character'
import { draft2024, selection } from '../fixtures/draft-2024'

function grant(instanceId: string, featId: string): ManualFeatGrant {
  return { instanceId, featId, addedAt: '2026-09-30T00:00:00.000Z' }
}

function withManualFeats(grants: readonly ManualFeatGrant[], selections: CharacterDraft['selections'] = []): CharacterDraft {
  const base = draft2024({ targetLevel: 4 })
  return {
    ...base,
    selections,
    manualEdits: { ...base.manualEdits, addedFeats: grants },
  }
}

describe('手动专长规则联动', () => {
  it('无子选择的结构化专长与系统专长走同一生命值派生', () => {
    const base = withManualFeats([])
    const tough = withManualFeats([grant('manual-tough', 'feat-2024-tough')])
    expect(deriveCharacter(tough).hitPoints.value - deriveCharacter(base).hitPoints.value).toBe(8)
    expect(listFeatGrants(tough, rulesRepository2024)).toContainEqual(expect.objectContaining({
      instanceId: 'manual-tough', featId: 'feat-2024-tough', sourceKind: 'manual',
    }))
  })

  it('可重复专长的子选择按实例隔离，只让已配置实例生效', () => {
    const first = grant('manual-skilled-a', 'feat-2024-skilled')
    const second = grant('manual-skilled-b', 'feat-2024-skilled')
    const checkpoints = buildManualFeatChoiceCheckpoints([first, second], rulesRepository2024, 4)
    expect(checkpoints).toHaveLength(2)
    expect(new Set(checkpoints.map((item) => item.id)).size).toBe(2)
    const firstCheckpoint = checkpoints.find((item) => item.parentCheckpointId === manualFeatParentCheckpointId(first.instanceId))!
    const draft = withManualFeats([first, second], [selection(firstCheckpoint.id, ['skill-arcana', 'skill-history', 'skill-nature'])])
    const skills = collectFeatSkillSelections(draft, rulesRepository2024)
    expect([...skills.proficiencies]).toEqual(['skill-arcana', 'skill-history', 'skill-nature'])
    expect(validateDraft(draft)).toContainEqual(expect.objectContaining({
      id: expect.stringContaining(manualFeatParentCheckpointId(second.instanceId)),
      severity: 'warning',
      step: 'sheet',
    }))
  })

  it('手动魔法学徒的法术选择、始终准备和免费施法自动生效', () => {
    const magicInitiate = grant('manual-magic-initiate', 'feat-2024-magic-initiate')
    const parent = manualFeatParentCheckpointId(magicInitiate.instanceId)
    const child = (choiceId: string) => `feat-child:${parent}:feat-2024-magic-initiate:${choiceId}`
    const draft = withManualFeats([magicInitiate], [
      selection(child('ability'), ['feat-bonus-int-1']),
      selection(child('list'), ['spell-list-wizard']),
      selection(child('cantrips'), ['spell-2024-fire-bolt', 'spell-2024-mage-hand']),
      selection(child('spell'), ['spell-2024-magic-missile']),
    ])
    expect(getAlwaysPreparedSpellIds(draft)).toContain('spell-2024-magic-missile')
    expect(getSpellFreeCastings(draft)).toContainEqual(expect.objectContaining({
      spellId: 'spell-2024-magic-missile', count: 1, ability: 'int',
    }))
  })

  it('移除手动实例后，残留子选择不会继续产生效果', () => {
    const parent = manualFeatParentCheckpointId('manual-skilled')
    const orphan = selection(`feat-child:${parent}:feat-2024-skilled:proficiencies`, ['skill-arcana', 'skill-history', 'skill-nature'])
    const draft = withManualFeats([], [orphan])
    expect([...collectFeatSkillSelections(draft, rulesRepository2024).proficiencies]).toEqual([])
  })

  it('只有自然语言说明的专长保持仅展示，不虚构派生数值', () => {
    const alert = rulesRepository2024.getFeat('feat-2024-alert')!
    const base = withManualFeats([])
    const withAlert = withManualFeats([grant('manual-alert', alert.id)])
    expect(getFeatStructuredEffectLabels(alert)).toEqual([])
    expect(deriveCharacter(withAlert)).toEqual(deriveCharacter(base))
  })
})
