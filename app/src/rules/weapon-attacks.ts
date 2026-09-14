import { getRulesRepository } from '@/rules/repositories'
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

function weaponCategory(equipment: EquipmentRule): 'simple' | 'martial' | undefined {
  if (equipment.weaponKind?.startsWith('simple')) return 'simple'
  if (equipment.weaponKind?.startsWith('martial')) return 'martial'
  return undefined
}

function isProficient(draft: CharacterDraft, equipment: EquipmentRule): boolean {
  const repository = getRulesRepository(draft.ruleset)
  const classRule = draft.classId ? repository.getClass(draft.classId) : undefined
  const category = weaponCategory(equipment)
  // 2024 使用职业数据中的武器训练；2014 回退兼容映射。
  const training = classRule?.weaponTraining
    ?? (draft.classId ? CLASS_WEAPON_PROFICIENCIES[draft.classId] : undefined)
  if (training?.itemIds?.includes(equipment.id) || (category && training?.categories?.includes(category))) return true
  const race = draft.raceId ? repository.getRace(draft.raceId) : undefined
  const subrace = draft.subraceId ? repository.getRace(draft.subraceId) : undefined
  return [race, subrace].some((item) => item?.weaponArmorProficiencies?.includes(equipment.id))
}

export function deriveWeaponAttack(
  draft: CharacterDraft,
  derived: DerivedCharacter,
  equipment: EquipmentRule,
): WeaponAttackResult | undefined {
  if (equipment.category !== 'weapon' || !equipment.weaponKind || !equipment.damageDice || !equipment.damageType) return undefined
  const isRanged = equipment.weaponKind.endsWith('ranged')
  const ability: AbilityKey = equipment.weaponProperties?.includes('finesse')
    ? derived.modifiers.dex >= derived.modifiers.str ? 'dex' : 'str'
    : isRanged ? 'dex' : 'str'
  const proficient = isProficient(draft, equipment)
  const magicBonus = equipment.magicBonus ?? 0
  const subclassAttackBonus = derived.attackBonus.sources.find((source) => source.id === 'subclass-attack')?.value ?? 0
  const subclassDamageBonus = derived.attackDamageBonus.sources.find((source) => source.id === 'subclass-damage')?.value ?? 0
  const manualAttackBonus = derived.attackBonus.sources.find((source) => source.id === 'manual-attack')?.value ?? 0
  const manualDamageBonus = derived.attackDamageBonus.sources.find((source) => source.id === 'manual-damage')?.value ?? 0
  return {
    itemId: equipment.id,
    name: equipment.name,
    ability,
    proficient,
    attackBonus: derived.modifiers[ability] + (proficient ? derived.proficiencyBonus.value : 0) + magicBonus + subclassAttackBonus + manualAttackBonus,
    damageBonus: derived.modifiers[ability] + magicBonus + subclassDamageBonus + manualDamageBonus,
    damageDice: equipment.damageDice,
    versatileDamageDice: equipment.versatileDamageDice,
    damageType: equipment.damageType,
    range: equipment.range,
  }
}
