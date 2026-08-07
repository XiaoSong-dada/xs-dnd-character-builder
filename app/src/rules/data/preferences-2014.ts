import type { AbilityKey } from '@/types/character'
import type { PlayStyleTag } from '@/types/rules'

export const PLAYSTYLE_TAG_LABELS: Readonly<Record<PlayStyleTag, string>> = {
  frontline: '前线近战',
  ranged: '远程输出',
  spellcaster: '施法者',
  support: '支援辅助',
  durable: '耐久生存',
  control: '战场控制',
  striker: '爆发输出',
  utility: '多功能',
  skirmisher: '机动游击',
}

/** 玩法偏好 ID：持久化在 CharacterDraft.preferences，变更需兼容旧草稿。 */
export type PlayPreferenceId = 'melee' | 'ranged' | 'spellcasting' | 'support' | 'durable' | 'control'

export interface PlayPreferenceRule {
  readonly id: PlayPreferenceId
  readonly label: string
  readonly description: string
  /** 关联属性：与 ClassRule.primaryAbilities 求交作为属性信号。 */
  readonly relatedAbilityKeys: readonly AbilityKey[]
  /** 关联玩法标签：与 ClassRule.playStyleTags 求交作为标签信号。 */
  readonly relatedTags: readonly PlayStyleTag[]
}

export const playPreferences2014: readonly PlayPreferenceRule[] = [
  {
    id: 'melee',
    label: '近身作战',
    description: '以武器近身接敌，力量或敏捷为主。',
    relatedAbilityKeys: ['str', 'dex'],
    relatedTags: ['frontline'],
  },
  {
    id: 'ranged',
    label: '远程攻击',
    description: '在安全距离用武器或法术输出。',
    relatedAbilityKeys: ['dex'],
    relatedTags: ['ranged'],
  },
  {
    id: 'spellcasting',
    label: '施放法术',
    description: '用魔法解决问题，施法属性为主。',
    relatedAbilityKeys: ['int', 'wis', 'cha'],
    relatedTags: ['spellcaster'],
  },
  {
    id: 'support',
    label: '支援队友',
    description: '治疗、增益与保护同伴。',
    relatedAbilityKeys: ['wis', 'cha'],
    relatedTags: ['support'],
  },
  {
    id: 'durable',
    label: '高生存',
    description: '扛得住伤害，生命值与防御优先。',
    relatedAbilityKeys: ['str', 'con'],
    relatedTags: ['durable'],
  },
  {
    id: 'control',
    label: '战场控制',
    description: '限制敌人行动，掌控战局走向。',
    relatedAbilityKeys: ['int', 'wis', 'cha'],
    relatedTags: ['control'],
  },
]

export const PLAY_PREFERENCE_IDS: readonly PlayPreferenceId[] = playPreferences2014.map((item) => item.id)
