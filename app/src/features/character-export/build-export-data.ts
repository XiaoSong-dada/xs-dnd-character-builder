import { ABILITY_LABELS } from '@/rules/data/feats-2014'
import { rulesRepository } from '@/rules/repository'
import { getSelectedSpellIds, getSpellSlots } from '@/rules/spellcasting'
import type { XlsxExportData } from '@/services/export-xlsx'
import type { AbilityKey, CharacterDraft, DerivedCharacter, InventorySourceKind, ValueSource } from '@/types/character'
import type { SpellRule } from '@/types/rules'

/**
 * 角色导出数据组装（PDF 打印版面与 XLSX 自动卡共用同一事实源）。
 * 全部数值来自 rules 派生函数与草稿原始选择，不在此重复计算规则。
 */

const ABILITY_KEYS: readonly AbilityKey[] = ['str', 'dex', 'con', 'int', 'wis', 'cha']

type ExportRow = readonly (string | number)[]

function skillName(id: string): string {
  return rulesRepository.getOption(id)?.name ?? id
}

function sourceJoin(sources: readonly ValueSource[], mode: 'label' | 'detail'): string {
  return sources.map((source) => source[mode] || source.label).join(' + ')
}

function inventorySourceLabel(kind: InventorySourceKind): string {
  switch (kind) {
    case 'class':
    case 'background':
      return '起始装备'
    case 'adventure':
      return '冒险获得'
    case 'legacy':
      return '旧草稿'
  }
}

function spellRows(ids: readonly string[], note: string): ExportRow[] {
  return ids
    .map((id) => rulesRepository.getSpell(id))
    .filter((spell): spell is SpellRule => Boolean(spell))
    .map((spell) => [spell.name, spell.englishName, note] as const)
}

export function buildCharacterExportData(draft: CharacterDraft, derived: DerivedCharacter): XlsxExportData {
  const classRule = draft.classId ? rulesRepository.getClass(draft.classId) : undefined
  const subclass = draft.subclassId ? rulesRepository.getSubclass(draft.subclassId) : undefined
  const race = draft.raceId ? rulesRepository.getRace(draft.raceId) : undefined
  const subrace = draft.subraceId ? rulesRepository.getRace(draft.subraceId) : undefined
  const background = draft.backgroundId ? rulesRepository.getBackground(draft.backgroundId) : undefined
  const backgroundVariant = draft.backgroundVariantId ? rulesRepository.getBackground(draft.backgroundVariantId) : undefined

  const subtitle = [
    `${draft.targetLevel} 级`,
    classRule?.name,
    subclass?.name,
    subrace?.name ?? race?.name,
    backgroundVariant?.name ?? background?.name,
  ].filter(Boolean).join(' · ')

  const passivePerception = 10 + (derived.skills['skill-perception']?.value ?? 0)

  const spellcastingConfig = rulesRepository.getSpellcastingConfig(draft)
  const spellSlots = spellcastingConfig ? getSpellSlots(spellcastingConfig, draft.targetLevel) : []
  const spellSlotsLabel = spellSlots.length === 0
    ? ''
    : spellSlots[0]?.pact
      ? `契约法术位：${spellSlots[0].count} 个 ${spellSlots[0].level} 环（短休恢复）`
      : spellSlots.map((slot) => `${slot.level}环×${slot.count}`).join(' · ')

  const sections: { title: string; rows: ExportRow[] }[] = [
    {
      title: '基础信息',
      rows: [
        ['角色名', draft.name || '未命名角色', ''],
        ['职业', classRule?.name ?? '—', classRule?.englishName ?? ''],
        ['等级', draft.targetLevel, ''],
        ['子职', subclass?.name ?? '—', ''],
        ['种族', subrace?.name ?? race?.name ?? '—', ''],
        ['背景', backgroundVariant?.name ?? background?.name ?? '—', ''],
        ['阵营', draft.alignment || '—', ''],
        ['备注', draft.notes || '—', ''],
      ],
    },
    {
      title: '属性',
      rows: ABILITY_KEYS.map((key) => [
        ABILITY_LABELS[key],
        derived.abilities[key],
        `调整值 ${derived.modifiers[key] >= 0 ? '+' : ''}${derived.modifiers[key]}`,
      ]),
    },
    {
      title: '核心数值',
      rows: [
        ['熟练加值', `+${derived.proficiencyBonus.value}`, sourceJoin(derived.proficiencyBonus.sources, 'label')],
        ['生命值', derived.hitPoints.value, sourceJoin(derived.hitPoints.sources, 'label')],
        ['护甲等级', derived.armorClass.value, sourceJoin(derived.armorClass.sources, 'label')],
        ['先攻', `${derived.initiative.value >= 0 ? '+' : ''}${derived.initiative.value}`, sourceJoin(derived.initiative.sources, 'label')],
        ['速度', `${derived.speed.value} 尺`, derived.speed.sources[0]?.detail ?? ''],
        ['被动感知', passivePerception, '10 + 察觉'],
      ],
    },
    {
      title: '豁免',
      rows: ABILITY_KEYS.map((key) => [
        ABILITY_LABELS[key],
        `${derived.savingThrows[key].value >= 0 ? '+' : ''}${derived.savingThrows[key].value}`,
        sourceJoin(derived.savingThrows[key].sources, 'label'),
      ]),
    },
    {
      title: '技能',
      rows: Object.entries(derived.skills).map(([id, value]) => [
        skillName(id),
        `${value.value >= 0 ? '+' : ''}${value.value}`,
        sourceJoin(value.sources, 'detail'),
      ]),
    },
    {
      title: '攻击与法术',
      rows: [
        ['攻击加值', `+${derived.attackBonus.value}`, sourceJoin(derived.attackBonus.sources, 'label')],
        ['伤害加值', `+${derived.attackDamageBonus.value}`, sourceJoin(derived.attackDamageBonus.sources, 'label')],
        ['法术攻击', derived.spellAttackBonus ? `+${derived.spellAttackBonus.value}` : '—', derived.spellAttackBonus ? sourceJoin(derived.spellAttackBonus.sources, 'label') : '当前职业无施法能力'],
        ['法术豁免 DC', derived.spellSaveDc ? String(derived.spellSaveDc.value) : '—', derived.spellSaveDc ? sourceJoin(derived.spellSaveDc.sources, 'label') : '当前职业无施法能力'],
        ...(spellSlotsLabel ? [['法术位', spellSlotsLabel, ''] as const] : []),
      ],
    },
  ]

  const spellSections: { title: string; rows: ExportRow[] }[] = []
  const cantrips = draft.spellSelections.cantripIds
    .map((id) => rulesRepository.getSpell(id))
    .filter((spell): spell is SpellRule => Boolean(spell))
  if (cantrips.length) {
    spellSections.push({
      title: '戏法',
      rows: cantrips.map((spell) => [spell.name, spell.englishName, ''] as const),
    })
  }
  if (spellcastingConfig) {
    const selectedIds = getSelectedSpellIds(draft, spellcastingConfig)
    const byLevel = selectedIds
      .map((id) => rulesRepository.getSpell(id))
      .filter((spell): spell is SpellRule => Boolean(spell))
      .sort((left, right) => left.level - right.level)
    if (byLevel.length) {
      const levels = [...new Set(byLevel.map((spell) => spell.level))].sort((a, b) => a - b)
      for (const level of levels) {
        spellSections.push({
          title: `${level} 环法术`,
          rows: byLevel.filter((spell) => spell.level === level).map((spell) => [spell.name, spell.englishName, ''] as const),
        })
      }
    }
    if (spellcastingConfig.mode === 'spellbook' && draft.spellSelections.spellbookSpellIds.length) {
      spellSections.push({
        title: '法术书',
        rows: spellRows(draft.spellSelections.spellbookSpellIds, '在书中'),
      })
    }
  }

  sections.push(...spellSections)

  sections.push({
    title: '物品与金币',
    rows: [
      ...draft.inventory.map((entry) => [
        rulesRepository.getEquipment(entry.itemId)?.name ?? entry.itemId,
        `数量 ×${entry.quantity}（装备 ${entry.equippedQuantity}）`,
        inventorySourceLabel(entry.sourceKind),
      ] as const),
      ['持有金币（GP）', draft.currency.gp + draft.adventureGold, `起始 ${draft.currency.gp} · 冒险净增 ${draft.adventureGold >= 0 ? '+' : ''}${draft.adventureGold}`],
      ['铜币（CP）', draft.currency.cp, ''],
      ['银币（SP）', draft.currency.sp, ''],
      ['电金币（EP）', draft.currency.ep, ''],
      ['白金币（PP）', draft.currency.pp, ''],
    ],
  })

  return {
    title: draft.name || '未命名角色',
    subtitle,
    sections,
  }
}
