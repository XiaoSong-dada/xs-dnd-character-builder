import type { CustomContentKind, CustomEntryKind } from '@/types/custom-content'

/** 内容类型选择项：新建弹层、列表筛选与编辑器标题共用同一份字典。 */
export interface CustomKindOption {
  readonly kind: CustomContentKind
  readonly label: string
  readonly description: string
}

export const CUSTOM_KIND_OPTIONS: readonly CustomKindOption[] = [
  {
    kind: 'expansion',
    label: '自定义扩展',
    description: '一本自制扩展书。其它内容必须先归入它，才能在车卡第 2 步按来源勾选。',
  },
  {
    kind: 'race',
    label: '自定义种族',
    description: '属性加值、速度、黑暗视觉、技能熟练与种族特性（特性仅展示）。',
  },
  {
    kind: 'class',
    label: '自定义职业',
    description: '生命骰、豁免熟练、护甲训练与职业特性；施法可引用已有职业的法术表。',
  },
  {
    kind: 'subclass',
    label: '自定义子职',
    description: '挂在某个职业下的子职；选择等级由该职业已有子职锁定，特性仅展示。',
  },
  {
    kind: 'feat',
    label: '自定义专长',
    description: '类别、前置与少量可自动结算的效果（生命/速度/护甲/授予法术）。',
  },
  {
    kind: 'spell',
    label: '自定义法术',
    description: '环级、学派、所属职业法术表与施法信息；会进入该职业第 8 步候选池。',
  },
] as const

const KIND_LABELS: Readonly<Record<CustomContentKind, string>> = {
  expansion: '自定义扩展',
  race: '自定义种族',
  class: '自定义职业',
  subclass: '自定义子职',
  feat: '自定义专长',
  spell: '自定义法术',
}

/** 列表筛选用的类型项（含「全部」）。 */
export interface CustomKindFilter {
  readonly value: CustomContentKind | 'all'
  readonly label: string
}

export const CUSTOM_KIND_FILTERS: readonly CustomKindFilter[] = [
  { value: 'all', label: '全部' },
  ...CUSTOM_KIND_OPTIONS.map((option) => ({ value: option.kind, label: KIND_LABELS[option.kind] })),
]

export function isCustomContentKind(value: string | undefined): value is CustomContentKind {
  return value === 'expansion' || value === 'race' || value === 'class' || value === 'subclass' || value === 'feat' || value === 'spell'
}

export function isCustomEntryKind(value: string | undefined): value is CustomEntryKind {
  return value === 'race' || value === 'class' || value === 'subclass' || value === 'feat' || value === 'spell'
}

export function customKindLabel(kind: CustomContentKind): string {
  return KIND_LABELS[kind]
}
