import type { RuleSource } from '@/types/character'

/**
 * 2024 核心来源表：PHB 2024 与 DMG 2024。
 * 两本均为 2024 规则集核心书，始终启用且不进入来源开关；后续批次按需追加扩展书条目。
 */
export const sources2024: readonly RuleSource[] = [
  {
    id: 'source-2024-phb',
    title: '玩家手册（2024）',
    shortTitle: 'PHB 2024',
    ruleset: '5e-2024',
    category: 'core',
    selectable: false,
  },
  {
    id: 'source-2024-dmg',
    title: '城主指南（2024）',
    shortTitle: 'DMG 2024',
    ruleset: '5e-2024',
    category: 'core',
    selectable: false,
  },
]
