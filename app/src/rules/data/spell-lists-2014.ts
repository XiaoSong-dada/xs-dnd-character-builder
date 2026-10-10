import type { RuleOption } from '@/types/rules'

export const speciesSpellAbilityOptions2014: readonly RuleOption[] = [
  { id: 'spell-ability-int', name: '智力', description: '种族法术以智力为施法属性。', status: 'implemented', sourceIds: ['phb-2014-index'] },
  { id: 'spell-ability-wis', name: '感知', description: '种族法术以感知为施法属性。', status: 'implemented', sourceIds: ['phb-2014-index'] },
  { id: 'spell-ability-cha', name: '魅力', description: '种族法术以魅力为施法属性。', status: 'implemented', sourceIds: ['phb-2014-index'] },
]

export const SPELL_LIST_OPTION_IDS_2014 = [
  'spell-list-bard',
  'spell-list-cleric',
  'spell-list-druid',
  'spell-list-sorcerer',
  'spell-list-warlock',
  'spell-list-wizard',
] as const

const labels: Readonly<Record<string, string>> = {
  bard: '吟游诗人', cleric: '牧师', druid: '德鲁伊', sorcerer: '术士', warlock: '邪术师', wizard: '法师',
}

export const spellListOptions2014: readonly RuleOption[] = SPELL_LIST_OPTION_IDS_2014.map((id) => {
  const slug = id.replace('spell-list-', '')
  return {
    id,
    name: `${labels[slug]}法术表`,
    description: `从${labels[slug]}法术表中选择戏法与一环法术。`,
    status: 'implemented',
    sourceIds: ['phb-2014-index'],
  }
})
