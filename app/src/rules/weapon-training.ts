import type { EquipmentRule, WeaponTraining } from '@/types/rules'

/** 武器类别：按 `weaponKind` 前缀解析简易／军用。 */
export function weaponCategory(equipment: EquipmentRule): 'simple' | 'martial' | undefined {
  if (equipment.weaponKind?.startsWith('simple')) return 'simple'
  if (equipment.weaponKind?.startsWith('martial')) return 'martial'
  return undefined
}

/** 职业武器训练是否覆盖某件武器：指定 ID、类别，或按词条覆盖的军用武器。 */
export function isWeaponTrainingCovered(training: WeaponTraining | undefined, equipment: EquipmentRule): boolean {
  if (!training) return false
  if (training.itemIds?.includes(equipment.id)) return true
  const category = weaponCategory(equipment)
  if (category && training.categories?.includes(category)) return true
  if (
    category === 'martial'
    && training.martialProperties?.length
    && equipment.weaponProperties?.some((property) => training.martialProperties?.includes(property))
  ) return true
  return false
}
