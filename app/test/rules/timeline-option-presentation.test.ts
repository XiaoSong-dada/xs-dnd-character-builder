import { describe, expect, it } from 'vitest'

import { getRulesRepository, OPEN_RULESETS } from '@/rules/repositories'
import { buildTimeline } from '@/rules/timeline'
import type { CharacterDraft } from '@/types/character'
import type { CheckpointKind } from '@/types/rules'

type RulesetId = CharacterDraft['ruleset']

/** 批次 A：静态选项检查点统一使用可展开卡片（子职选择、子职特性选项、技能、职业选择、专精、战斗风格、注法）。 */
const STATIC_OPTION_KINDS: readonly CheckpointKind[] = [
  'subclass',
  'subclass-feature',
  'skills',
  'class-choice',
  'expertise',
  'fighting-style',
  'infusion',
]

interface CheckpointSample {
  readonly ruleset: RulesetId
  readonly classId: string
  readonly subclassId: string
  readonly id: string
  readonly kind: CheckpointKind
  readonly options: number
  readonly presentation: string | undefined
  readonly candidateKind: string | undefined
}

/** 遍历两版规则集 × 全部职业 × 全部子职，采样每个去重检查点。 */
function collectCheckpoints(): readonly CheckpointSample[] {
  const samples = new Map<string, CheckpointSample>()
  for (const ruleset of OPEN_RULESETS) {
    const repository = getRulesRepository(ruleset)
    const enabledSourceIds = repository.sources.map((source) => source.id)
    for (const classRule of repository.classes) {
      const subclasses = repository.subclasses.filter((subclass) => subclass.classId === classRule.id)
      for (const subclass of subclasses) {
        const timeline = buildTimeline(classRule.id, 20, { ruleset, subclassId: subclass.id, enabledSourceIds })
        for (const checkpoint of timeline) {
          if (samples.has(checkpoint.id)) continue
          samples.set(checkpoint.id, {
            ruleset,
            classId: classRule.id,
            subclassId: subclass.id,
            id: checkpoint.id,
            kind: checkpoint.kind,
            options: checkpoint.optionIds.length,
            presentation: checkpoint.optionPresentation,
            candidateKind: checkpoint.candidateKind,
          })
        }
      }
    }
  }
  return [...samples.values()]
}

const SAMPLES = collectCheckpoints()

describe('时间线静态选项检查点的可展开口径（批次 A）', () => {
  it('静态选项种类且候选非空时一律标为 expandable', () => {
    const targets = SAMPLES.filter((sample) => STATIC_OPTION_KINDS.includes(sample.kind) && sample.options > 0)
    expect(targets.length).toBeGreaterThan(150)
    for (const sample of targets) {
      expect(sample.presentation, `${sample.ruleset} ${sample.id}`).toBe('expandable')
    }
  })

  it('子职选择在两版规则集全部职业上均可展开', () => {
    const subclassCheckpoints = SAMPLES.filter((sample) => sample.kind === 'subclass')
    // 2014 十三个职业 + 2024 十四个职业（含 UA）
    expect(subclassCheckpoints.length).toBe(27)
    for (const sample of subclassCheckpoints) {
      expect(sample.options, sample.id).toBeGreaterThan(0)
      expect(sample.presentation, sample.id).toBe('expandable')
    }
  })

  it('子职特性选项检查点在两版规则集上均可展开', () => {
    const featureCheckpoints = SAMPLES.filter((sample) => sample.kind === 'subclass-feature' && sample.options > 0)
    expect(featureCheckpoints.length).toBe(58)
    for (const sample of featureCheckpoints) {
      expect(sample.presentation, sample.id).toBe('expandable')
    }
  })

  it('能力提升与专长检查点不标注，继续由 FeatChoicePanel 渲染', () => {
    const abilityCheckpoints = SAMPLES.filter((sample) => sample.kind === 'ability-improvement')
    expect(abilityCheckpoints.length).toBeGreaterThan(100)
    for (const sample of abilityCheckpoints) {
      expect(sample.presentation, sample.id).toBeUndefined()
    }
  })

  it('动态候选池保持各自渲染路径，不标注', () => {
    const dynamicCheckpoints = SAMPLES.filter((sample) => Boolean(sample.candidateKind))
    expect(dynamicCheckpoints.length).toBeGreaterThan(10)
    for (const sample of dynamicCheckpoints) {
      expect(sample.options, sample.id).toBe(0)
      expect(sample.presentation, sample.id).toBeUndefined()
    }
  })

  it('2014 子职检查点在数据文件显式声明（Q1-A）', () => {
    const repository = getRulesRepository('5e-2014')
    for (const classRule of repository.classes) {
      const checkpoint = (classRule.checkpoints ?? []).find((item) => item.kind === 'subclass')
      expect(checkpoint, classRule.id).toBeDefined()
      expect(checkpoint?.optionPresentation, classRule.id).toBe('expandable')
    }
  })
})
