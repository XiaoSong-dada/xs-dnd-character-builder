import type { CharacterDraft, RulesetId } from '@/types/character'
import type { RulesRepository } from '@/types/rules'

/** 2024 标准语言表（OC-012）：通用语默认掌握，另从本表选 2 种。 */
export const STANDARD_LANGUAGES_2024 = [
  '通用手语',
  '龙语',
  '矮人语',
  '精灵语',
  '巨人语',
  '侏儒语',
  '地精语',
  '半身人语',
  '兽人语',
] as const

/** 2014 起源页可选语言（含 2014 特有语言）。 */
export const LEGACY_LANGUAGE_OPTIONS_2014 = [
  '矮人语',
  '精灵语',
  '巨人语',
  '侏儒语',
  '地精语',
  '半身人语',
  '兽人语',
  '龙语',
  '炼狱语',
  '天界语',
] as const

/** 语言候选池：2024 用标准表；2014 用起源页既有候选。 */
export function getLanguageOptions(ruleset: RulesetId): readonly string[] {
  return ruleset === '5e-2024' ? STANDARD_LANGUAGES_2024 : LEGACY_LANGUAGE_OPTIONS_2014
}

/** 必选语言数量：2024 固定 2；2014 取背景的语言选择数量（变体优先）。 */
export function getRequiredLanguageCount(
  draft: Pick<CharacterDraft, 'ruleset' | 'backgroundId' | 'backgroundVariantId'>,
  repository: RulesRepository,
): number {
  if (draft.ruleset === '5e-2024') return 2
  const backgroundId = draft.backgroundVariantId ?? draft.backgroundId
  return backgroundId ? repository.getBackground(backgroundId)?.languageChoices ?? 0 : 0
}
