import type { SpellRule } from '@/types/rules'

/**
 * 破解奥秘：灵能（UA）新增／重印法术（以灵能 II 为有效期次）。
 * 部分条目为 2014 时代法术在灵能 UA 中的重印；本文件只登记必要机械字段与原创摘要。
 */

const sourceIds = ['source-2024-ua-psion'] as const

const spell = (
  slug: string,
  name: string,
  englishName: string,
  level: number,
  school: string,
  castingTime: string,
  range: string,
  duration: string,
  concentration: boolean,
  ritual: boolean,
  classIds: readonly string[],
  summary: string,
): SpellRule => ({
  id: `spell-2024-ua-${slug}`,
  ruleset: '5e-2024',
  name,
  englishName,
  level,
  ritual,
  classIds,
  summary,
  description: summary,
  status: 'selectable',
  sourceIds,
  school,
  castingTime,
  range,
  components: 'V、S（如有特殊材料成分以来源资料为准）',
  duration,
  concentration,
})

const PSION = 'class-2024-ua-psion'

export const psionSpells2024: readonly SpellRule[] = [
  spell('telekinetic-fling', '念力投掷', 'Telekinetic Fling', 0, '塑能', '动作', '60 尺', '立即', false, false, [PSION],
    '远程法术攻击；命中 1d10 力场并摧毁弹药；5／11／17 级各 +1d10。'),
  spell('life-siphon', '生命虹吸', 'Life Siphon', 1, '塑能', '动作', '120 尺', '立即', false, false, [PSION],
    '对 120 尺内可见生物汲取生命：体质豁免失败受 2d6 暗蚀（升环提升），你恢复其中一部分生命值。'),
  spell('ectoplasmic-trail', '灵质踪迹', 'Ectoplasmic Trail', 2, '死灵', '附赠动作', '自身', '立即', false, false, [PSION],
    '附赠动作留下灵质轨迹，短暂阻碍追踪者或提供位移辅助；具体效果以灵能 UA 正文为准。'),
  spell('ego-whip', '自我之鞭', 'Ego Whip', 2, '惑控', '反应', '120 尺', '立即', false, false, [PSION],
    '当 30 尺内可见生物进行基于魅力的检定或豁免时，反应对其造成心灵伤害并施加干扰。'),
  spell('tashas-mind-whip', '塔莎心灵鞭', "Tasha's Mind Whip", 2, '惑控', '动作', '90 尺', '立即', false, false, [PSION],
    '智力豁免失败受 3d6 心灵伤害，且直到下回合结束不能借机攻击；其下回合只能执行动作或附赠动作之一；升环可多选目标。'),
  spell('bleeding-darkness', '泣墨深暗', 'Bleeding Darkness', 3, '塑能', '动作', '60 尺', '专注，至多 1 分钟', true, false, [PSION],
    '制造具侵蚀性的魔法黑暗区域，区域内生物承受持续伤害或干扰；具体效果以灵能 UA 正文为准。'),
  spell('enemies-abound', '举目皆敌', 'Enemies Abound', 3, '惑控', '动作', '120 尺', '立即', false, false, [PSION],
    '智力豁免失败的目标将周围生物视为敌人，攻击就近目标；每回合结束可重复豁免。'),
  spell('intellect-fortress', '智能壁垒', 'Intellect Fortress', 3, '防护', '动作', '30 尺', '专注，至多 1 小时', true, false, [PSION],
    '目标获得心灵伤害抗性，且智力、感知、魅力豁免具有优势；升环可多选目标。'),
  spell('summon-astral-entity', '星光体召唤术', 'Summon Astral Entity', 3, '咒法', '动作', '90 尺', '专注，至多 1 小时', true, false, [PSION],
    '召唤一个星光体实体（数据随法术给定）；升环提高其数值。召唤数据未接入自动战斗结算。'),
  spell('telekinetic-crush', '念力碾压', 'Telekinetic Crush', 3, '变化', '动作', '120 尺', '立即', false, false, [PSION],
    '30 尺立方区域内生物力量豁免失败受 5d6 力场并倒地，成功减半；升环每环 +1d6。'),
  spell('life-inversion-field', '生命反转场域', 'Life Inversion Field', 4, '防护', '动作', '自身', '专注，至多 1 分钟', true, false, [PSION],
    '展开反转生命能量的场域：区域内治疗与伤害效应被削弱或反转；具体效果以灵能 UA 正文为准。'),
  spell('raulothims-psychic-lance', '劳洛希姆心灵长枪', "Raulothim's Psychic Lance", 4, '惑控', '动作', '120 尺', '立即', false, false, [PSION],
    '智力豁免失败受 7d6 心灵并失能至其下回合结束；可呼出目标名字使其豁免劣势。'),
  spell('mental-prison', '精神监狱', 'Mental Prison', 6, '幻术', '动作', '60 尺', '专注，至多 1 分钟', true, false, [PSION],
    '智力豁免失败受 5d10 心灵并被困于幻象牢笼（受擒／束缚与后续伤害）；成功减半。'),
  spell('psionic-blast', '灵能震爆', 'Psionic Blast', 6, '塑能', '动作', '自身', '立即', false, false, [PSION],
    '以自身为源释放心灵冲击波，范围内生物智力豁免失败受心灵伤害并被推开；具体范围与骰值以灵能 UA 正文为准。'),
  spell('thought-form', '灵思形态', 'Thought Form', 6, '变化', '附赠动作', '自身', '专注，至多 1 分钟', true, false, [PSION],
    '化身思绪形态：获得飞行、穿行与心灵伤害相关增益；具体效果以灵能 UA 正文为准。'),
  spell('abi-dalzims-horrid-wilting', '亚比达奇凋死术', "Abi-Dalzim's Horrid Wilting", 8, '死灵', '动作', '150 尺', '立即', false, false, [PSION],
    '30 尺立方区域内生物体质豁免失败受 12d8 暗蚀（构装与亡灵免疫），植物类生物豁免劣势；成功减半。'),
  spell('psychic-scream', '心灵尖啸', 'Psychic Scream', 9, '惑控', '动作', '90 尺', '立即', false, false, [PSION],
    '至多 10 名可见生物智力豁免失败受 14d6 心灵并昏迷；豁免成功减半。被此法术杀死的类人头部爆炸。'),
]
