import type { AbilityKey } from '@/types/character'
import type { RuleOption } from '@/types/rules'

const sourceIds = ['source-2024-phb'] as const

/** 魔法学徒（FT-005）可选择的法术表选项；运行时只用于该专长的子选择。 */
export const SPELL_LIST_OPTION_IDS = ['spell-list-cleric', 'spell-list-druid', 'spell-list-wizard'] as const

export const spellListOptions2024: readonly RuleOption[] = [
  {
    id: 'spell-list-cleric',
    name: '牧师法术表',
    description: '从牧师法术表中选择戏法与一环法术。',
    status: 'implemented',
    sourceIds,
  },
  {
    id: 'spell-list-druid',
    name: '德鲁伊法术表',
    description: '从德鲁伊法术表中选择戏法与一环法术。',
    status: 'implemented',
    sourceIds,
  },
  {
    id: 'spell-list-wizard',
    name: '法师法术表',
    description: '从法师法术表中选择戏法与一环法术。',
    status: 'implemented',
    sourceIds,
  },
]

/** `spell-list-<slug>` → `class-2024-<slug>`；非已知表返回 undefined。 */
export function classIdFromSpellListOption(optionId: string): string | undefined {
  const slug = optionId.replace(/^spell-list-/, '')
  return (SPELL_LIST_OPTION_IDS as readonly string[]).includes(optionId) ? `class-2024-${slug}` : undefined
}

/** 物种法术的施法属性选项（精灵、侏儒、提夫林等选择 INT／WIS／CHA）。 */
export const SPECIES_SPELL_ABILITY_OPTION_IDS = ['spell-ability-int', 'spell-ability-wis', 'spell-ability-cha'] as const

export const speciesSpellAbilityOptions2024: readonly RuleOption[] = [
  { id: 'spell-ability-int', name: '智力', description: '物种法术以智力为施法属性。', status: 'implemented', sourceIds },
  { id: 'spell-ability-wis', name: '感知', description: '物种法术以感知为施法属性。', status: 'implemented', sourceIds },
  { id: 'spell-ability-cha', name: '魅力', description: '物种法术以魅力为施法属性。', status: 'implemented', sourceIds },
]

export function abilityFromSpeciesSpellAbilityOption(optionId: string | undefined): AbilityKey | undefined {
  const match = /^spell-ability-(str|dex|con|int|wis|cha)$/.exec(optionId ?? '')
  return match ? match[1] as AbilityKey : undefined
}
