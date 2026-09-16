import { describe, expect, it } from 'vitest'

import { buildCharacterExportModel } from '@/features/character-export/build-export-data'
import { deriveCharacter } from '@/rules/derive'
import { formatFeatBonusOption } from '@/rules/feats'
import { getRulesRepository, rulesRepository2024 } from '@/rules/repositories'
import { buildTimeline } from '@/rules/timeline'
import { draft2024 } from '../fixtures/draft-2024'

const repository2014 = getRulesRepository('5e-2014')

/** 2024 5 级战士：4 级节点选择“敏锐心灵”，并完成其属性提升子选择。 */
function keenMindDraft() {
  return draft2024({
    classId: 'class-2024-fighter',
    targetLevel: 5,
    selections: [
      { checkpointId: 'class-2024-fighter-feat-4', optionIds: ['feat-2024-keen-mind'], confirmedAt: '' },
      { checkpointId: 'feat-child:class-2024-fighter-feat-4:feat-2024-keen-mind:ability', optionIds: ['feat-bonus-int-1'], confirmedAt: '' },
    ],
  })
}

describe('B09-09 专长属性提升子选项标签', () => {
  it('2024 仓库登记 feat-bonus 子选项的中文标签（不再回退原始 ID）', () => {
    expect(rulesRepository2024.getOption('feat-bonus-int-1')?.name).toBe('智力 +1')
    expect(rulesRepository2024.getOption('feat-bonus-cha-2')?.name).toBe('魅力 +2')
    expect(repository2014.getOption('feat-bonus-int-1')?.name).toBe('智力 +1')
  })

  it('formatFeatBonusOption 解码为中文标签，非该类型返回 undefined', () => {
    expect(formatFeatBonusOption(rulesRepository2024, 'feat-bonus-int-1')).toBe('智力 +1')
    expect(formatFeatBonusOption(repository2014, 'feat-bonus-str-1')).toBe('力量 +1')
    expect(formatFeatBonusOption(rulesRepository2024, 'feat-2024-keen-mind')).toBeUndefined()
    expect(formatFeatBonusOption(rulesRepository2024, 'asi-2024-int-2')).toBeUndefined()
  })

  it('时间线子检查点的选项可直接解析显示名', () => {
    const timeline = buildTimeline('class-2024-fighter', 5, {
      ruleset: '5e-2024',
      selections: [{ checkpointId: 'class-2024-fighter-feat-4', optionIds: ['feat-2024-keen-mind'], confirmedAt: '' }],
    })
    const child = timeline.find((checkpoint) => checkpoint.title === '敏锐心灵 · 属性提升')
    expect(child).toBeDefined()
    expect(child?.optionIds).toEqual(['feat-bonus-int-1'])
    expect(child?.optionIds.map((optionId) => rulesRepository2024.getOption(optionId)?.name)).toEqual(['智力 +1'])
  })

  it('角色卡与导出包含该子选项的可读条目', () => {
    const draft = keenMindDraft()
    const model = buildCharacterExportModel(draft, deriveCharacter(draft))
    const bonusFeature = model.features.find((feature) => feature.name === '智力 +1')
    expect(bonusFeature).toBeDefined()
    expect(bonusFeature?.summary).toContain('智力')
    expect(deriveCharacter(draft).abilities.int).toBeGreaterThan(draft.baseAbilities.int)
  })
})
