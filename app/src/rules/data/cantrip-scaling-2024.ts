import type { CantripScalingRule } from '@/types/rules'

/**
 * 2024 戏法成长数据（MC-D05，决策 D4）。
 *
 * 数据来源：《5e 不全书》`玩家手册2024_法术详述_0环.md` 的「戏法强化」段，
 * 按**角色总等级**在 5 / 11 / 17 级各提升一次。未登记条目不产出成长值（决策 D12）。
 */
export const cantripScaling2024: readonly CantripScalingRule[] = [
  { id: 'spell-2024-acid-splash', name: '酸液飞溅', sourceNote: '数据来源：玩家手册2024 法术详述', steps: [{ level: 1, dice: '1d6' }, { level: 5, dice: '2d6' }, { level: 11, dice: '3d6' }, { level: 17, dice: '4d6' }] },
  { id: 'spell-2024-chill-touch', name: '颤栗之触', sourceNote: '数据来源：玩家手册2024 法术详述', steps: [{ level: 1, dice: '1d10' }, { level: 5, dice: '2d10' }, { level: 11, dice: '3d10' }, { level: 17, dice: '4d10' }] },
  { id: 'spell-2024-eldritch-blast', name: '魔能爆', sourceNote: '数据来源：玩家手册2024 法术详述', steps: [{ level: 1, count: 1 }, { level: 5, count: 2 }, { level: 11, count: 3 }, { level: 17, count: 4 }] },
  { id: 'spell-2024-fire-bolt', name: '火焰箭', sourceNote: '数据来源：玩家手册2024 法术详述', steps: [{ level: 1, dice: '1d10' }, { level: 5, dice: '2d10' }, { level: 11, dice: '3d10' }, { level: 17, dice: '4d10' }] },
  { id: 'spell-2024-mind-sliver', name: '心灵之楔', sourceNote: '数据来源：玩家手册2024 法术详述', steps: [{ level: 1, dice: '1d6' }, { level: 5, dice: '2d6' }, { level: 11, dice: '3d6' }, { level: 17, dice: '4d6' }] },
  { id: 'spell-2024-poison-spray', name: '毒气喷涌', sourceNote: '数据来源：玩家手册2024 法术详述', steps: [{ level: 1, dice: '1d12' }, { level: 5, dice: '2d12' }, { level: 11, dice: '3d12' }, { level: 17, dice: '4d12' }] },
  { id: 'spell-2024-produce-flame', name: '燃火术', sourceNote: '数据来源：玩家手册2024 法术详述', steps: [{ level: 1, dice: '1d8' }, { level: 5, dice: '2d8' }, { level: 11, dice: '3d8' }, { level: 17, dice: '4d8' }] },
  { id: 'spell-2024-ray-of-frost', name: '冷冻射线', sourceNote: '数据来源：玩家手册2024 法术详述', steps: [{ level: 1, dice: '1d8' }, { level: 5, dice: '2d8' }, { level: 11, dice: '3d8' }, { level: 17, dice: '4d8' }] },
  { id: 'spell-2024-sacred-flame', name: '圣火术', sourceNote: '数据来源：玩家手册2024 法术详述', steps: [{ level: 1, dice: '1d8' }, { level: 5, dice: '2d8' }, { level: 11, dice: '3d8' }, { level: 17, dice: '4d8' }] },
  { id: 'spell-2024-shillelagh', name: '橡棍术', sourceNote: '数据来源：玩家手册2024 法术详述', steps: [{ level: 1, die: 'd8' }, { level: 5, dice: '1d10', die: 'd10' }, { level: 11, dice: '1d12', die: 'd12' }, { level: 17, dice: '2d6', die: '2d6' }] },
  { id: 'spell-2024-shocking-grasp', name: '电爪', sourceNote: '数据来源：玩家手册2024 法术详述', steps: [{ level: 1, dice: '1d8' }, { level: 5, dice: '2d8' }, { level: 11, dice: '3d8' }, { level: 17, dice: '4d8' }] },
  { id: 'spell-2024-sorcerous-burst', name: '术法爆发', sourceNote: '数据来源：玩家手册2024 法术详述', steps: [{ level: 1, dice: '1d8' }, { level: 5, dice: '2d8' }, { level: 11, dice: '3d8' }, { level: 17, dice: '4d8' }] },
  { id: 'spell-2024-starry-wisp', name: '点点星芒', sourceNote: '数据来源：玩家手册2024 法术详述', steps: [{ level: 1, dice: '1d8' }, { level: 5, dice: '2d8' }, { level: 11, dice: '3d8' }, { level: 17, dice: '4d8' }] },
  { id: 'spell-2024-thorn-whip', name: '荆棘之鞭', sourceNote: '数据来源：玩家手册2024 法术详述', steps: [{ level: 1, dice: '1d6' }, { level: 5, dice: '2d6' }, { level: 11, dice: '3d6' }, { level: 17, dice: '4d6' }] },
  { id: 'spell-2024-thunderclap', name: '鸣雷破', sourceNote: '数据来源：玩家手册2024 法术详述', steps: [{ level: 1, dice: '1d6' }, { level: 5, dice: '2d6' }, { level: 11, dice: '3d6' }, { level: 17, dice: '4d6' }] },
  { id: 'spell-2024-true-strike', name: '克敌先击', sourceNote: '数据来源：玩家手册2024 法术详述', steps: [{ level: 1, dice: '1d6', note: '额外光耀伤害' }, { level: 5, dice: '1d6', note: '额外光耀伤害' }, { level: 11, dice: '2d6', note: '额外光耀伤害' }, { level: 17, dice: '3d6', note: '额外光耀伤害' }] },
  { id: 'spell-2024-vicious-mockery', name: '恶言相加', sourceNote: '数据来源：玩家手册2024 法术详述', steps: [{ level: 1, dice: '1d6' }, { level: 5, dice: '2d6' }, { level: 11, dice: '3d6' }, { level: 17, dice: '4d6' }] },
  { id: 'spell-2024-word-of-radiance', name: '光耀祷词', sourceNote: '数据来源：玩家手册2024 法术详述', steps: [{ level: 1, dice: '1d6' }, { level: 5, dice: '2d6' }, { level: 11, dice: '3d6' }, { level: 17, dice: '4d6' }] },
]

/** 按法术 ID 取 2024 戏法成长规则；未登记返回 undefined。 */
export function getCantripScaling2024(spellId: string): CantripScalingRule | undefined {
  return cantripScaling2024.find((item) => item.id === spellId)
}
