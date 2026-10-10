import { getRulesRepository } from '@/rules/repositories'
import { isWeaponTrainingCovered } from '@/rules/weapon-training'
import { isSourceEnabled } from '@/rules/source-books'
import { normalizeManualEdits } from '@/rules/manual-edits'
import { getActiveEquippedEquipment } from '@/rules/equipment-state'
import { artificerInfusions2014 } from '@/rules/data/artificer-2014'
import { getSubclassDerivedEffects } from '@/rules/subclass-effects'
import type { AbilityKey, CharacterDraft, DerivedCharacter } from '@/types/character'
import type { EquipmentRule, WeaponTraining } from '@/types/rules'

export interface WeaponAttackResult {
  readonly itemId: string
  readonly name: string
  readonly ability: AbilityKey
  readonly proficient: boolean
  readonly attackBonus: number
  readonly damageBonus: number
  readonly damageDice: string
  readonly versatileDamageDice?: string
  readonly damageType: string
  readonly range?: readonly [number, number]
}

/** 2014 职业武器熟练映射；2024 改用 `ClassRule.weaponTraining`，此表仅作 2014 回退。 */
const CLASS_WEAPON_PROFICIENCIES: Readonly<Record<string, WeaponTraining>> = {
  'class-2014-barbarian': { categories: ['simple', 'martial'] },
  'class-2014-artificer': { categories: ['simple'] },
  'class-2014-bard': { categories: ['simple'], itemIds: ['hand-crossbow', 'longsword', 'rapier', 'shortsword'] },
  'class-2014-cleric': { categories: ['simple'] },
  'class-2014-druid': { itemIds: ['club', 'dagger', 'dart', 'javelin', 'mace', 'quarterstaff', 'scimitar', 'sickle', 'sling', 'spear'] },
  'class-2014-fighter': { categories: ['simple', 'martial'] },
  'class-2014-monk': { categories: ['simple'], itemIds: ['shortsword'] },
  'class-2014-paladin': { categories: ['simple', 'martial'] },
  'class-2014-ranger': { categories: ['simple', 'martial'] },
  'class-2014-rogue': { categories: ['simple'], itemIds: ['hand-crossbow', 'longsword', 'rapier', 'shortsword'] },
  'class-2014-sorcerer': { itemIds: ['dagger', 'dart', 'sling', 'quarterstaff', 'light-crossbow'] },
  'class-2014-warlock': { categories: ['simple'] },
  'class-2014-wizard': { itemIds: ['dagger', 'dart', 'sling', 'quarterstaff', 'light-crossbow'] },
}

function isProficient(draft: CharacterDraft, equipment: EquipmentRule): boolean {
  const repository = getRulesRepository(draft.ruleset)
  const classRule = draft.classId ? repository.getClass(draft.classId) : undefined
  // 2024 使用职业数据中的武器训练；2014 回退兼容映射。
  const classActive = classRule && isSourceEnabled(classRule.sourceIds, draft.enabledSourceIds, repository)
  const training = classActive ? classRule.weaponTraining
    ?? (draft.classId ? CLASS_WEAPON_PROFICIENCIES[draft.classId] : undefined)
    : undefined
  if (isWeaponTrainingCovered(training, equipment)) return true
  // 选择类特性可附带武器训练（如 2024 牧师圣职·保护者）。
  for (const selection of draft.selections) {
    if (selection.invalidatedAt) continue
    for (const optionId of selection.optionIds) {
      const option = repository.getOption(optionId)
      if (option && isSourceEnabled(option.sourceIds, draft.enabledSourceIds, repository) && isWeaponTrainingCovered(option.weaponTraining, equipment)) return true
    }
  }
  // 子职特性可授予武器训练（如 2024 勇气学院·战争训练）。
  const subclass = draft.subclassId ? repository.getSubclass(draft.subclassId) : undefined
  for (const feature of subclass?.features ?? []) {
    if (feature.level > draft.targetLevel) continue
    if (!subclass || subclass.classId !== draft.classId || !isSourceEnabled(subclass.sourceIds, draft.enabledSourceIds, repository)
      || !isSourceEnabled(feature.sourceIds, draft.enabledSourceIds, repository)) continue
    if (isWeaponTrainingCovered(feature.weaponTraining, equipment)) return true
  }
  const race = draft.raceId ? repository.getRace(draft.raceId) : undefined
  const subrace = draft.subraceId ? repository.getRace(draft.subraceId) : undefined
  return [race, subrace].some((item) => item && isSourceEnabled(item.sourceIds, draft.enabledSourceIds, repository) && item.weaponArmorProficiencies?.includes(equipment.id))
}

export function deriveWeaponAttack(
  draft: CharacterDraft,
  derived: DerivedCharacter,
  equipment: EquipmentRule,
): WeaponAttackResult | undefined {
  if (equipment.category !== 'weapon' || !equipment.weaponKind || !equipment.damageDice || !equipment.damageType) return undefined
  const repository = getRulesRepository(draft.ruleset)
  if (!isSourceEnabled(equipment.sourceIds, draft.enabledSourceIds, repository)) return undefined
  const activeEquipment = getActiveEquippedEquipment(draft, repository)
  const classRule = draft.classId ? repository.getClass(draft.classId) : undefined
  const classActive = classRule && isSourceEnabled(classRule.sourceIds, draft.enabledSourceIds, repository)
  const subclass = draft.subclassId ? repository.getSubclass(draft.subclassId) : undefined
  const subclassActive = classActive && subclass && subclass.classId === draft.classId && isSourceEnabled(subclass.sourceIds, draft.enabledSourceIds, repository)
  const infusion = classActive && draft.classId === 'class-2014-artificer'
    ? (draft.infusionAssignments ?? []).flatMap((assignment) => {
      const entry = draft.inventory.find((item) => item.id === assignment.inventoryEntryId && item.itemId === equipment.id && item.quantity > 0 && item.equippedQuantity > 0)
      const rule = artificerInfusions2014.find((item) => item.id === assignment.infusionId)
      const known = draft.selections.some((selection) => !selection.invalidatedAt && selection.optionIds.includes(assignment.infusionId))
      return entry && rule && known && rule.minimumLevel <= draft.targetLevel && rule.eligibleCategories.includes('weapon')
        && isSourceEnabled(rule.sourceIds, draft.enabledSourceIds, repository) ? [rule] : []
    })[0] : undefined
  const infusionBonus = infusion?.magicBonus
    ? draft.targetLevel >= 10 && infusion.id === 'infusion-2014-enhanced-weapon' ? 2 : infusion.magicBonus
    : 0
  const magicBonus = (equipment.magicBonus ?? 0) + infusionBonus
  const isMonkWeapon = (item: EquipmentRule): boolean => {
    if (!item.weaponKind?.endsWith('melee')) return false
    return draft.ruleset === '5e-2014'
      ? item.id === 'shortsword' || (item.weaponKind === 'simple-melee' && !item.weaponProperties?.some((property) => property === 'heavy' || property === 'two-handed'))
      : item.weaponKind === 'simple-melee' || (item.weaponKind === 'martial-melee' && Boolean(item.weaponProperties?.includes('light')))
  }
  const monkDexterity = classActive && ['class-2014-monk', 'class-2024-monk'].includes(draft.classId ?? '')
    && isMonkWeapon(equipment) && !activeEquipment.some((item) => item.category === 'armor' || item.category === 'shield'
      || (item.category === 'weapon' && !isMonkWeapon(item)))
  const isRanged = equipment.weaponKind.endsWith('ranged')
  const ability: AbilityKey = subclassActive && draft.subclassId === 'subclass-2014-artificer-battle-smith' && draft.targetLevel >= 3 && magicBonus > 0
    ? 'int' : equipment.weaponProperties?.includes('finesse') || monkDexterity
    ? derived.modifiers.dex >= derived.modifiers.str ? 'dex' : 'str'
    : isRanged ? 'dex' : 'str'
  const proficient = isProficient(draft, equipment)
  const effects = getSubclassDerivedEffects(subclassActive ? draft.subclassId : undefined, draft.targetLevel)
  const manual = normalizeManualEdits(draft.manualEdits).derivedAdjustments
  const manualAttackBonus = ability === 'str' ? manual.attackBonus ?? 0 : ability === 'dex' ? manual.dexterityAttackBonus ?? 0 : 0
  const manualDamageBonus = ability === 'str' ? manual.attackDamageBonus ?? 0 : ability === 'dex' ? manual.dexterityAttackDamageBonus ?? 0 : 0
  return {
    itemId: equipment.id,
    name: equipment.name,
    ability,
    proficient,
    attackBonus: derived.modifiers[ability] + (proficient ? derived.proficiencyBonus.value : 0) + magicBonus + effects.attackBonus + manualAttackBonus,
    damageBonus: derived.modifiers[ability] + magicBonus + effects.damageBonus + manualDamageBonus,
    damageDice: equipment.damageDice,
    versatileDamageDice: equipment.versatileDamageDice,
    damageType: equipment.damageType,
    range: equipment.range,
  }
}
