import { ABILITY_LABELS } from '@/rules/data/feats-2014'
import { SUBCLASS_CHOICE_OPTION_IDS } from '@/rules/data/subclass-choice-options-2014'
import { decodeAbilityImprovement } from '@/rules/feats'
import { rulesRepository } from '@/rules/repository'
import { getAvailableSpells, getMagicalSecretsSpellIds, getSpellSlots } from '@/rules/spellcasting'
import { deriveWeaponAttack } from '@/rules/weapon-attacks'
import type { AbilityKey, CharacterDraft, DerivedCharacter } from '@/types/character'

export type ExportDiagnosticCode =
  | 'missing-rule-data'
  | 'missing-template-field'
  | 'unsupported-template-field'
  | 'invalid-template-target'
  | 'content-truncated'
  | 'formula-not-recalculated'

export interface ExportDiagnostic {
  readonly code: ExportDiagnosticCode
  readonly severity: 'warning' | 'error'
  readonly field: string
  readonly message: string
}

export interface ExportAbility {
  readonly key: AbilityKey
  readonly label: string
  readonly score: number
  readonly modifier: number
  readonly savingThrow: number
  readonly savingThrowProficient: boolean
}

export interface ExportSkill {
  readonly id: string
  readonly name: string
  readonly value: number
  readonly proficiency: 'none' | 'proficient' | 'expertise'
}

export interface ExportAttack {
  readonly itemId: string
  readonly name: string
  readonly attackBonus: number
  readonly damage: string
  readonly note: string
}

export interface ExportFeature {
  readonly id: string
  readonly category: 'feat' | 'subclass' | 'class' | 'race' | 'background'
  readonly name: string
  readonly summary: string
  readonly priority: number
}

export interface ExportSpell {
  readonly id: string
  readonly name: string
  readonly level: number
  readonly prepared: boolean
}

export interface CharacterExportModel {
  readonly identity: {
    readonly characterName: string
    readonly className: string
    readonly level: number
    readonly classLevel: string
    readonly subclassName: string
    readonly raceName: string
    readonly backgroundName: string
    readonly alignment: string
    readonly playerName: string
    readonly experience: number
  }
  readonly abilities: Readonly<Record<AbilityKey, ExportAbility>>
  readonly combat: {
    readonly proficiencyBonus: number
    readonly armorClass: number
    readonly initiative: number
    readonly speed: number
    readonly hitPointMaximum: number
    readonly hitPointCurrent: number
    readonly hitPointTemporary: number
    readonly hitDice: string
    readonly passivePerception: number
  }
  readonly skills: readonly ExportSkill[]
  readonly proficiencies: { readonly languages: readonly string[]; readonly text: string }
  readonly attacks: readonly ExportAttack[]
  readonly inventory: readonly { readonly itemId: string; readonly name: string; readonly quantity: number; readonly equippedQuantity: number }[]
  readonly currency: { readonly cp: number; readonly sp: number; readonly ep: number; readonly gp: number; readonly pp: number }
  readonly features: readonly ExportFeature[]
  readonly spellcasting?: {
    readonly className: string
    readonly abilityLabel: string
    readonly saveDc: number
    readonly attackBonus: number
    readonly slots: readonly { readonly level: number; readonly count: number; readonly pact: boolean }[]
    readonly spells: readonly ExportSpell[]
  }
  readonly profile: { readonly backstory: string }
  readonly diagnostics: readonly ExportDiagnostic[]
}

const ABILITY_KEYS: readonly AbilityKey[] = ['str', 'dex', 'con', 'int', 'wis', 'cha']

function signed(value: number): string {
  return `${value >= 0 ? '+' : ''}${value}`
}

function optionName(id: string): string {
  return rulesRepository.getOption(id)?.name ?? id
}

function resolveSelectedFeatures(draft: CharacterDraft): ExportFeature[] {
  const features: ExportFeature[] = []
  for (const selection of draft.selections) {
    if (selection.invalidatedAt) continue
    for (const optionId of selection.optionIds) {
      const feat = rulesRepository.getFeat(optionId)
      if (feat) {
        features.push({ id: feat.id, category: 'feat', name: feat.name, summary: feat.detail, priority: 10 })
        continue
      }
      const abilityImprovement = decodeAbilityImprovement(optionId)
      if (abilityImprovement) {
        const summary = abilityImprovement.mode === 'single'
          ? `${ABILITY_LABELS[abilityImprovement.abilities[0]]} +2`
          : abilityImprovement.abilities.map((ability) => `${ABILITY_LABELS[ability]} +1`).join('、')
        features.push({ id: optionId, category: 'feat', name: '属性值提升', summary, priority: 10 })
        continue
      }
      // 已选选择类选项（超魔、战技与其余子职选项、法术专精/招牌法术）进入导出
      const isMetamagic = optionId.startsWith('metamagic-')
      const isSpellMasterySelection = selection.checkpointId.startsWith('wizard-2014-spell-mastery-')
        || selection.checkpointId.startsWith('wizard-2014-signature-spells-')
      if (isMetamagic || isSpellMasterySelection || SUBCLASS_CHOICE_OPTION_IDS.includes(optionId)) {
        const spell = rulesRepository.getSpell(optionId)
        if (spell) {
          features.push({ id: spell.id, category: 'class', name: spell.name, summary: spell.description, priority: 10 })
          continue
        }
        const option = rulesRepository.getOption(optionId)
        if (option) {
          features.push({
            id: option.id,
            category: isMetamagic ? 'class' : 'subclass',
            name: option.name,
            summary: option.description,
            priority: 10,
          })
        }
      }
    }
  }
  return features
}

function buildFeatures(draft: CharacterDraft): ExportFeature[] {
  const classRule = draft.classId ? rulesRepository.getClass(draft.classId) : undefined
  const subclass = draft.subclassId ? rulesRepository.getSubclass(draft.subclassId) : undefined
  const race = draft.raceId ? rulesRepository.getRace(draft.raceId) : undefined
  const subrace = draft.subraceId ? rulesRepository.getRace(draft.subraceId) : undefined
  const background = draft.backgroundVariantId
    ? rulesRepository.getBackground(draft.backgroundVariantId)
    : draft.backgroundId ? rulesRepository.getBackground(draft.backgroundId) : undefined
  return [
    ...resolveSelectedFeatures(draft),
    ...(subclass?.features ?? []).filter((feature) => feature.level <= draft.targetLevel).map((feature) => ({ id: feature.id, category: 'subclass' as const, name: feature.name, summary: feature.summary, priority: 20 })),
    ...(classRule?.features ?? []).filter((feature) => feature.level <= draft.targetLevel).map((feature) => ({ id: feature.id, category: 'class' as const, name: feature.name, summary: feature.summary, priority: 30 })),
    ...[race, subrace].filter((item): item is NonNullable<typeof item> => Boolean(item)).map((item) => ({ id: item.id, category: 'race' as const, name: item.name, summary: item.summary, priority: 40 })),
    ...(background ? [{ id: background.id, category: 'background' as const, name: background.featureName || background.name, summary: background.summary, priority: 50 }] : []),
  ].sort((left, right) => left.priority - right.priority)
}

function buildInventory(draft: CharacterDraft, diagnostics: ExportDiagnostic[]) {
  const grouped = new Map<string, { quantity: number; equippedQuantity: number }>()
  for (const entry of draft.inventory) {
    const current = grouped.get(entry.itemId) ?? { quantity: 0, equippedQuantity: 0 }
    current.quantity += entry.quantity
    current.equippedQuantity += entry.equippedQuantity
    grouped.set(entry.itemId, current)
  }
  return [...grouped.entries()].map(([itemId, totals]) => {
    const equipment = rulesRepository.getEquipment(itemId)
    if (!equipment) diagnostics.push({ code: 'missing-rule-data', severity: 'warning', field: `inventory.${itemId}`, message: `无法解析物品 ${itemId}，已使用原始 ID。` })
    return { itemId, name: equipment?.name ?? itemId, ...totals }
  })
}

function spellList(draft: CharacterDraft, diagnostics: ExportDiagnostic[]): readonly ExportSpell[] {
  const config = rulesRepository.getSpellcastingConfig(draft)
  if (!config) return []
  const baseIds = config.mode === 'spellbook'
    ? [...draft.spellSelections.cantripIds, ...draft.spellSelections.spellbookSpellIds]
    : config.mode === 'prepared'
      ? [...draft.spellSelections.cantripIds, ...getAvailableSpells(draft, config).filter((spell) => spell.level > 0).map((spell) => spell.id)]
      : [...draft.spellSelections.cantripIds, ...draft.spellSelections.knownSpellIds]
  const ids = [...new Set([...baseIds, ...getMagicalSecretsSpellIds(draft)])]
  const prepared = new Set(draft.spellSelections.preparedSpellIds)
  return ids.map((id) => {
    const spell = rulesRepository.getSpell(id)
    if (!spell) diagnostics.push({ code: 'missing-rule-data', severity: 'warning', field: `spell.${id}`, message: `无法解析法术 ${id}。` })
    return spell ? { id, name: spell.name, level: spell.level, prepared: prepared.has(id) } : undefined
  }).filter((spell): spell is ExportSpell => Boolean(spell)).sort((left, right) => left.level - right.level || left.name.localeCompare(right.name, 'zh-CN'))
}

export function buildCharacterExportModel(draft: CharacterDraft, derived: DerivedCharacter): CharacterExportModel {
  const diagnostics: ExportDiagnostic[] = []
  const classRule = draft.classId ? rulesRepository.getClass(draft.classId) : undefined
  const subclass = draft.subclassId ? rulesRepository.getSubclass(draft.subclassId) : undefined
  const race = draft.raceId ? rulesRepository.getRace(draft.raceId) : undefined
  const subrace = draft.subraceId ? rulesRepository.getRace(draft.subraceId) : undefined
  const background = draft.backgroundId ? rulesRepository.getBackground(draft.backgroundId) : undefined
  const backgroundVariant = draft.backgroundVariantId ? rulesRepository.getBackground(draft.backgroundVariantId) : undefined
  if (draft.classId && !classRule) diagnostics.push({ code: 'missing-rule-data', severity: 'error', field: 'identity.class', message: '无法解析角色职业。' })
  if (draft.raceId && !race) diagnostics.push({ code: 'missing-rule-data', severity: 'error', field: 'identity.race', message: '无法解析角色种族。' })

  const inventory = buildInventory(draft, diagnostics)
  const attacks = inventory.filter((entry) => entry.equippedQuantity > 0).flatMap((entry) => {
    const equipment = rulesRepository.getEquipment(entry.itemId)
    if (!equipment) return []
    const attack = deriveWeaponAttack(draft, derived, equipment)
    if (!attack) {
      if (equipment.category === 'weapon') diagnostics.push({ code: 'missing-rule-data', severity: 'warning', field: `attacks.${entry.itemId}`, message: `${equipment.name} 缺少可计算的基础武器结构，未生成攻击数据。` })
      return []
    }
    const damageBonus = attack.damageBonus === 0 ? '' : signed(attack.damageBonus)
    const notes = [attack.versatileDamageDice ? `双手 ${attack.versatileDamageDice}${damageBonus}` : '', attack.range ? `射程 ${attack.range[0]}/${attack.range[1]} 尺` : '', attack.proficient ? '' : '未熟练'].filter(Boolean)
    return [{ itemId: attack.itemId, name: attack.name, attackBonus: attack.attackBonus, damage: `${attack.damageDice}${damageBonus} ${attack.damageType}`, note: notes.join('；') }]
  })

  const abilities = Object.fromEntries(ABILITY_KEYS.map((key) => [key, {
    key,
    label: ABILITY_LABELS[key],
    score: derived.abilities[key],
    modifier: derived.modifiers[key],
    savingThrow: derived.savingThrows[key].value,
    savingThrowProficient: derived.savingThrows[key].sources.some((source) => source.label === '职业豁免熟练'),
  }])) as Record<AbilityKey, ExportAbility>
  const skills = Object.entries(derived.skills).map(([id, value]) => {
    const labels = value.sources.map((source) => source.label)
    return { id, name: optionName(id), value: value.value, proficiency: labels.includes('专精') ? 'expertise' as const : labels.includes('技能熟练') ? 'proficient' as const : 'none' as const }
  })
  const languages = draft.languages.map(optionName)
  const spellcastingConfig = rulesRepository.getSpellcastingConfig(draft)

  return {
    identity: {
      characterName: draft.name || '', className: classRule?.name ?? '', level: draft.targetLevel, classLevel: classRule ? `${classRule.name}（${draft.targetLevel}级）` : '',
      subclassName: subclass?.name ?? '', raceName: subrace?.name ?? race?.name ?? '', backgroundName: backgroundVariant?.name ?? background?.name ?? '',
      alignment: draft.alignment, playerName: '', experience: 0,
    },
    abilities,
    combat: {
      proficiencyBonus: derived.proficiencyBonus.value, armorClass: derived.armorClass.value, initiative: derived.initiative.value, speed: derived.speed.value,
      hitPointMaximum: derived.hitPoints.value, hitPointCurrent: derived.hitPoints.value, hitPointTemporary: 0,
      hitDice: classRule ? `d${classRule.hitDie}` : '', passivePerception: 10 + (derived.skills['skill-perception']?.value ?? 0),
    },
    skills,
    proficiencies: { languages, text: languages.join('、') },
    attacks,
    inventory,
    currency: { ...draft.currency, gp: draft.currency.gp + draft.adventureGold },
    features: buildFeatures(draft),
    ...(spellcastingConfig && derived.spellSaveDc && derived.spellAttackBonus ? {
      spellcasting: {
        className: classRule?.name ?? subclass?.name ?? '', abilityLabel: ABILITY_LABELS[spellcastingConfig.ability], saveDc: derived.spellSaveDc.value,
        attackBonus: derived.spellAttackBonus.value, slots: getSpellSlots(spellcastingConfig, draft.targetLevel).map((slot) => ({ ...slot, pact: Boolean(slot.pact) })),
        spells: spellList(draft, diagnostics),
      },
    } : {}),
    profile: { backstory: draft.notes },
    diagnostics,
  }
}

export function formatSigned(value: number): string {
  return signed(value)
}
