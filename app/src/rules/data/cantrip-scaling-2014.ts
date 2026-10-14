import type { CantripScalingRule } from '@/types/rules'

/**
 * 2014 戏法成长数据（MC-D05，决策 D4）。
 *
 * 数据来源：《5e 不全书》各书「法术详述」的戏法条目，按「角色总等级」推进：
 * 5 / 11 / 17 级各提升一次（2014 与 2024 同节点）。兼职角色按**角色总等级**取值（需求 §2.8）。
 *
 * 边界：
 * - 只登记「影响实际数值」的成长（伤害骰、射线数、骰型）；未登记条目不产出成长值。
 * - 法术位升环成长不在此字段（由法术位环级决定，与总等级无关）。
 * - 特殊分支（亡者丧钟的 d8/d12、轰雷剑与翠炎剑的两段伤害）用 note 记录，只作展示。
 */
export const cantripScaling2014: readonly CantripScalingRule[] = [
  { id: 'spell-2014-acid-splash', name: '酸液飞溅', sourceNote: '数据来源：玩家手册法术详述', steps: [{ level: 1, dice: '1d6' }, { level: 5, dice: '2d6' }, { level: 11, dice: '3d6' }, { level: 17, dice: '4d6' }] },
  { id: 'spell-2014-chill-touch', name: '颤栗之触', sourceNote: '数据来源：玩家手册法术详述', steps: [{ level: 1, dice: '1d8' }, { level: 5, dice: '2d8' }, { level: 11, dice: '3d8' }, { level: 17, dice: '4d8' }] },
  { id: 'spell-2014-eldritch-blast', name: '魔能爆', sourceNote: '数据来源：玩家手册法术详述', steps: [{ level: 1, count: 1 }, { level: 5, count: 2 }, { level: 11, count: 3 }, { level: 17, count: 4 }] },
  { id: 'spell-2014-fire-bolt', name: '火焰箭', sourceNote: '数据来源：玩家手册法术详述', steps: [{ level: 1, dice: '1d10' }, { level: 5, dice: '2d10' }, { level: 11, dice: '3d10' }, { level: 17, dice: '4d10' }] },
  { id: 'spell-2014-poison-spray', name: '毒气喷涌', sourceNote: '数据来源：玩家手册法术详述', steps: [{ level: 1, dice: '1d12' }, { level: 5, dice: '2d12' }, { level: 11, dice: '3d12' }, { level: 17, dice: '4d12' }] },
  { id: 'spell-2014-produce-flame', name: '燃火术', sourceNote: '数据来源：玩家手册法术详述', steps: [{ level: 1, dice: '1d8' }, { level: 5, dice: '2d8' }, { level: 11, dice: '3d8' }, { level: 17, dice: '4d8' }] },
  { id: 'spell-2014-ray-of-frost', name: '冷冻射线', sourceNote: '数据来源：玩家手册法术详述', steps: [{ level: 1, dice: '1d8' }, { level: 5, dice: '2d8' }, { level: 11, dice: '3d8' }, { level: 17, dice: '4d8' }] },
  { id: 'spell-2014-sacred-flame', name: '圣火术', sourceNote: '数据来源：玩家手册法术详述', steps: [{ level: 1, dice: '1d8' }, { level: 5, dice: '2d8' }, { level: 11, dice: '3d8' }, { level: 17, dice: '4d8' }] },
  { id: 'spell-2014-shillelagh', name: '橡棍术', sourceNote: '数据来源：玩家手册法术详述', steps: [{ level: 1, die: 'd8' }] },
  { id: 'spell-2014-shocking-grasp', name: '电爪', sourceNote: '数据来源：玩家手册法术详述', steps: [{ level: 1, dice: '1d8' }, { level: 5, dice: '2d8' }, { level: 11, dice: '3d8' }, { level: 17, dice: '4d8' }] },
  { id: 'spell-2014-thorn-whip', name: '荆棘之鞭', sourceNote: '数据来源：玩家手册法术详述', steps: [{ level: 1, dice: '1d6' }, { level: 5, dice: '2d6' }, { level: 11, dice: '3d6' }, { level: 17, dice: '4d6' }] },
  { id: 'spell-2014-vicious-mockery', name: '恶言相加', sourceNote: '数据来源：玩家手册法术详述', steps: [{ level: 1, dice: '1d4' }, { level: 5, dice: '2d4' }, { level: 11, dice: '3d4' }, { level: 17, dice: '4d4' }] },
  { id: 'spell-2014-frostbite', name: '霜噬', sourceNote: '数据来源：珊娜萨的万事指南法术详述', steps: [{ level: 1, dice: '1d6' }, { level: 5, dice: '2d6' }, { level: 11, dice: '3d6' }, { level: 17, dice: '4d6' }] },
  { id: 'spell-2014-infestation', name: '虫群孳生', sourceNote: '数据来源：珊娜萨的万事指南法术详述', steps: [{ level: 1, dice: '1d6' }, { level: 5, dice: '2d6' }, { level: 11, dice: '3d6' }, { level: 17, dice: '4d6' }] },
  { id: 'spell-2014-primal-savagery', name: '原初蛮击', sourceNote: '数据来源：珊娜萨的万事指南法术详述', steps: [{ level: 1, dice: '1d10' }, { level: 5, dice: '2d10' }, { level: 11, dice: '3d10' }, { level: 17, dice: '4d10' }] },
  { id: 'spell-2014-thunderclap', name: '鸣雷破', sourceNote: '数据来源：珊娜萨的万事指南法术详述', steps: [{ level: 1, dice: '1d6' }, { level: 5, dice: '2d6' }, { level: 11, dice: '3d6' }, { level: 17, dice: '4d6' }] },
  { id: 'spell-2014-toll-the-dead', name: '亡者丧钟', sourceNote: '数据来源：珊娜萨的万事指南法术详述', steps: [{ level: 1, dice: '1d8' }, { level: 5, dice: '2d8', note: '目标缺失生命值时用 d12' }, { level: 11, dice: '3d8', note: '目标缺失生命值时用 d12' }, { level: 17, dice: '4d8', note: '目标缺失生命值时用 d12' }] },
  { id: 'spell-2014-word-of-radiance', name: '光耀祷词', sourceNote: '数据来源：珊娜萨的万事指南法术详述', steps: [{ level: 1, dice: '1d6' }, { level: 5, dice: '2d6' }, { level: 11, dice: '3d6' }, { level: 17, dice: '4d6' }] },
  { id: 'spell-2014-create-bonfire', name: '创造篝火', sourceNote: '数据来源：珊娜萨的万事指南法术详述', steps: [{ level: 1, dice: '1d8' }, { level: 5, dice: '2d8' }, { level: 11, dice: '3d8' }, { level: 17, dice: '4d8' }] },
  { id: 'spell-2014-booming-blade', name: '轰雷剑', sourceNote: '数据来源：塔莎的万事坩埚法术详述', steps: [{ level: 1, dice: '1d8' }, { level: 5, dice: '2d8', note: '另一段伤害同时提升' }, { level: 11, dice: '3d8', note: '两段伤害各再 +1d8' }, { level: 17, dice: '4d8', note: '两段伤害各再 +1d8' }] },
  { id: 'spell-2014-green-flame-blade', name: '翠炎剑', sourceNote: '数据来源：塔莎的万事坩埚法术详述', steps: [{ level: 1, dice: '1d8' }, { level: 5, dice: '2d8', note: '另一段伤害同时提升' }, { level: 11, dice: '3d8', note: '两段伤害各再 +1d8' }, { level: 17, dice: '4d8', note: '两段伤害各再 +1d8' }] },
  { id: 'spell-2014-lightning-lure', name: '闪电牵引', sourceNote: '数据来源：塔莎的万事坩埚法术详述', steps: [{ level: 1, dice: '1d8' }, { level: 5, dice: '2d8' }, { level: 11, dice: '3d8' }, { level: 17, dice: '4d8' }] },
  { id: 'spell-2014-mind-sliver', name: '心灵之楔', sourceNote: '数据来源：塔莎的万事坩埚法术详述', steps: [{ level: 1, dice: '1d6' }, { level: 5, dice: '2d6' }, { level: 11, dice: '3d6' }, { level: 17, dice: '4d6' }] },
  { id: 'spell-2014-sword-burst', name: '剑刃爆发', sourceNote: '数据来源：塔莎的万事坩埚法术详述', steps: [{ level: 1, dice: '1d6' }, { level: 5, dice: '2d6' }, { level: 11, dice: '3d6' }, { level: 17, dice: '4d6' }] },
  { id: 'spell-2014-sapping-sting', name: '削弱芒刺', sourceNote: '数据来源：荒洲探险家指南法术详述', steps: [{ level: 1, dice: '1d4' }, { level: 5, dice: '2d4' }, { level: 11, dice: '3d4' }, { level: 17, dice: '4d4' }] },
]

/** 按法术 ID 取成长规则；未登记返回 undefined（调用方只展示、不推断）。 */
export function getCantripScaling2014(spellId: string): CantripScalingRule | undefined {
  return cantripScaling2014.find((item) => item.id === spellId)
}
