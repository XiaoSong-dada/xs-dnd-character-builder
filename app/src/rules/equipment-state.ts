import { collectArmorTrainings } from '@/rules/feats'
import { getDraftSpeciesRules } from '@/rules/origins'
import { getRulesRepository } from '@/rules/repositories'
import { isSourceEnabled } from '@/rules/source-books'
import type { CharacterDraft, ValidationIssue } from '@/types/character'
import type { EquipmentRule, RulesRepository } from '@/types/rules'

export function getActiveEquippedEquipment(draft: CharacterDraft, repository: RulesRepository = getRulesRepository(draft.ruleset)): readonly EquipmentRule[] {
  return draft.inventory.flatMap((entry) => {
    if (entry.equippedQuantity <= 0 || entry.quantity <= 0) return []
    const equipment = repository.getEquipment(entry.itemId)
    return equipment && isSourceEnabled(equipment.sourceIds, draft.enabledSourceIds, repository) ? [equipment] : []
  })
}

export function canBenefitFromShield(draft: CharacterDraft, repository: RulesRepository = getRulesRepository(draft.ruleset)): boolean {
  return draft.ruleset === '5e-2014' || collectArmorTrainings(draft, repository).includes('shield')
}

export function getEquipmentWarnings(draft: CharacterDraft, repository: RulesRepository = getRulesRepository(draft.ruleset)): readonly ValidationIssue[] {
  const equipment = getActiveEquippedEquipment(draft, repository)
  const shield = equipment.find((item) => item.category === 'shield')
  const issues: ValidationIssue[] = []
  if (equipment.some((item) => item.category === 'armor') && getDraftSpeciesRules(draft, repository).some((race) => race.naturalArmor?.forbidsArmor)) issues.push({ id: 'species-armor-forbidden', step: 'equipment', severity: 'warning', message: '龟人的天生护甲不允许穿戴轻甲、中甲或重甲，当前护甲记录不提供AC收益。', resolution: '请手动卸下护甲；背包物品与原记录不会被删除。' })
  if (!shield) return issues
  const twoHanded = equipment.filter((item) => item.category === 'weapon' && item.weaponProperties?.includes('two-handed'))
  if (twoHanded.length) {
    issues.push({
      id: 'shield-two-handed-conflict', step: 'equipment', severity: 'warning',
      message: `已同时装备${shield.name}与双手武器（${twoHanded.map((item) => item.name).join('、')}）。持盾时不能用这些武器进行双手攻击。`,
      resolution: '持盾 AC 按其他适用条件保留；请根据当前持用情况卸下盾牌或双手武器。',
    })
  }
  if (!canBenefitFromShield(draft, repository)) {
    issues.push({
      id: 'shield-training-required', step: 'equipment', severity: 'warning',
      message: '当前角色未受盾牌训练，已装备的盾牌不提供 AC 增益。',
      resolution: '获得盾牌训练后收益生效，或卸下盾牌；物品仍保留在背包中。',
    })
  }
  return issues
}
