import type { RuleOption } from '@/types/rules'

/**
 * 2014 子职选择选项（Subclass Choice Options）。
 *
 * 覆盖全部 `requiresChoice` 子职特性的选项：战斗大师战技 11 项（ID 收录于
 * `SUBCLASS_CHOICE_OPTION_IDS`，选项数据由 `fighter.ts` 既有注册提供，效果摘要已升级核验）+
 * 其余 18 个特性（图腾精魂、猎人猎物、龙族祖先、野兽形态、巨人力量、
 * 风暴光环、精魂图腾、星体形态、奥术射击、符文雕刻者、元素纪律、
 * 剑圣之道、月之化身、巨灵容器等）的选项 72 项（去重后）。
 *
 * 每条登记稳定 ID、中英文名与原创中文摘要（效果要点转述，遵循版权约定）；
 * `status: 'implemented'` 表示名称与摘要已核验，选项本身不参与自动计算，
 * 具体数值效果以对应规则来源为准（部分条目沿用项目"仅索引"的保守表述）。
 * 剑舞学院复用的 `style-dueling` / `style-two-weapon` 已注册于战士战斗风格，
 * 不在本文件重复登记。
 *
 * 规则集：`5e-2014`。
 */
export const SUBCLASS_CHOICE_OPTION_IDS: readonly string[] = [
  // 战斗大师战技
  'maneuver-precision',
  'maneuver-trip',
  'maneuver-rally',
  'maneuver-menacing',
  'maneuver-riposte',
  'maneuver-pushing',
  'maneuver-disarming',
  'maneuver-commanders-strike',
  'maneuver-goading',
  'maneuver-maneuvering',
  'maneuver-sweeping',
  // 图腾精魂
  'totem-bear',
  'totem-eagle',
  'totem-wolf',
  // 猎物 / 防守战术 / 多重攻击 / 高效猎人防术
  'hunter-prey-colossus-slayer',
  'hunter-prey-giant-killer',
  'hunter-prey-horde-breaker',
  'hunter-tactic-escape-the-horde',
  'hunter-tactic-multiattack-defense',
  'hunter-tactic-steel-will',
  'hunter-multiattack-volley',
  'hunter-multiattack-whirlwind',
  'hunter-defense-stand-against-the-tide',
  'hunter-defense-uncanny-dodge',
  'hunter-defense-evasion',
  // 龙族祖先
  'dragon-black',
  'dragon-blue',
  'dragon-green',
  'dragon-red',
  'dragon-white',
  'dragon-brass',
  'dragon-bronze',
  'dragon-copper',
  'dragon-gold',
  'dragon-silver',
  // 野兽形态 / 巨人力量 / 风暴光环
  'beast-form-claws',
  'beast-form-bite',
  'beast-form-tail',
  'giant-power-cloud',
  'giant-power-fire',
  'giant-power-frost',
  'giant-power-hill',
  'giant-power-stone',
  'giant-power-storm',
  'storm-aura-desert',
  'storm-aura-sea',
  'storm-aura-tundra',
  // 精魂图腾 / 星体形态
  'spirit-totem-bear',
  'spirit-totem-eagle',
  'spirit-totem-unicorn',
  'starry-form-archer',
  'starry-form-chalice',
  'starry-form-dragon',
  // 奥术射击
  'arcane-shot-beguiling',
  'arcane-shot-bursting',
  'arcane-shot-enfeebling',
  'arcane-shot-grasping',
  'arcane-shot-piercing',
  'arcane-shot-seeking',
  'arcane-shot-shadow',
  'arcane-shot-banishing',
  // 符文雕刻者
  'rune-cloud',
  'rune-fire',
  'rune-frost',
  'rune-hill',
  'rune-stone',
  'rune-storm',
  // 元素纪律
  'discipline-fangs-of-fire',
  'discipline-fist-of-four-thunders',
  'discipline-mist-stance',
  'discipline-rush-of-gales',
  'discipline-sweeping-cinder',
  'discipline-wave-of-rolling-earth',
  // 剑圣武器 / 月之化身 / 巨灵容器
  'kensei-weapon-longsword',
  'kensei-weapon-longbow',
  'kensei-weapon-whip',
  'lunar-phase-new-moon',
  'lunar-phase-full-moon',
  'lunar-phase-crescent-moon',
  'genie-vessel-dao',
  'genie-vessel-djinni',
  'genie-vessel-efreeti',
  'genie-vessel-marid',
]

const phb = ['phb-2014-index'] as const
const xgte = ['xgte-2017-index'] as const
const tcoe = ['tcoe-2020-index'] as const
const bigby = ['bigby-2023-index'] as const
const dsotdq = ['dsotdq-2022-index'] as const

export const subclassChoiceOptions2014: readonly RuleOption[] = [
  // ============ 图腾精魂（PHB 2014） ============
  { id: 'totem-bear', name: '熊', englishName: 'Bear', description: '狂暴期间，除心灵伤害外的所有伤害对你减半（获得抗性）。', status: 'implemented', sourceIds: phb },
  { id: 'totem-eagle', name: '鹰', englishName: 'Eagle', description: '狂暴期间，感知（察觉）检定具有优势，并可看清 1.6 公里外的景象。', status: 'implemented', sourceIds: phb },
  { id: 'totem-wolf', name: '狼', englishName: 'Wolf', description: '狂暴期间，对 1.5 米内至少一名盟友正在围攻的目标发动近战攻击时具有优势。', status: 'implemented', sourceIds: phb },

  // ============ 猎人（PHB 2014） ============
  { id: 'hunter-prey-colossus-slayer', name: '巨人屠戮者', englishName: 'Colossus Slayer', description: '攻击命中已受伤目标时，额外造成 1d8 伤害（每回合一次）。', status: 'implemented', sourceIds: phb },
  { id: 'hunter-prey-giant-killer', name: '巨人杀手', englishName: 'Giant Killer', description: '大型或更大生物攻击你未命中时，可用反应对其发动一次攻击。', status: 'implemented', sourceIds: phb },
  { id: 'hunter-prey-horde-breaker', name: '破阵者', englishName: 'Horde Breaker', description: '攻击动作中命中目标后，可对 1.5 米内另一生物再发动一次攻击（每回合一次）。', status: 'implemented', sourceIds: phb },
  { id: 'hunter-tactic-escape-the-horde', name: '逃离兽群', englishName: 'Escape the Horde', description: '借机攻击对你具有劣势。', status: 'implemented', sourceIds: phb },
  { id: 'hunter-tactic-multiattack-defense', name: '多重攻击防御', englishName: 'Multiattack Defense', description: '被同一生物在一次攻击动作中多次攻击时，后续攻击的护甲等级 +4。', status: 'implemented', sourceIds: phb },
  { id: 'hunter-tactic-steel-will', name: '钢铁意志', englishName: 'Steel Will', description: '对恐慌豁免具有优势。', status: 'implemented', sourceIds: phb },
  { id: 'hunter-multiattack-volley', name: '齐射', englishName: 'Volley', description: '攻击动作中，对 3 米半径内可见的生物各进行一次远程武器攻击。', status: 'implemented', sourceIds: phb },
  { id: 'hunter-multiattack-whirlwind', name: '旋风攻击', englishName: 'Whirlwind Attack', description: '攻击动作中，对 1.5 米内所有可见的生物各进行一次近战武器攻击。', status: 'implemented', sourceIds: phb },
  { id: 'hunter-defense-stand-against-the-tide', name: '逆流而战', englishName: 'Stand Against the Tide', description: '被近战攻击未命中时，可用反应迫使该生物进行力量豁免，失败则倒地。', status: 'implemented', sourceIds: phb },
  { id: 'hunter-defense-uncanny-dodge', name: '直觉闪避', englishName: 'Uncanny Dodge', description: '被可见攻击者命中时，可用反应使该次攻击的伤害减半。', status: 'implemented', sourceIds: phb },
  { id: 'hunter-defense-evasion', name: '闪避', englishName: 'Evasion', description: '敏捷豁免成功时不受伤害，失败时伤害减半。', status: 'implemented', sourceIds: phb },

  // ============ 龙族祖先（PHB 2014，龙族血脉） ============
  { id: 'dragon-black', name: '黑龙', englishName: 'Black Dragon', description: '选择黑龙祖先：获得强酸伤害抗性并能说龙语；3 级起获得吐息武器（5×1.5 米线形强酸吐息，2d6 伤害，敏捷豁免减半，长休后恢复）。', status: 'implemented', sourceIds: phb },
  { id: 'dragon-blue', name: '蓝龙', englishName: 'Blue Dragon', description: '选择蓝龙祖先：获得闪电伤害抗性并能说龙语；3 级起获得吐息武器（5×1.5 米线形闪电吐息，2d6 伤害，敏捷豁免减半，长休后恢复）。', status: 'implemented', sourceIds: phb },
  { id: 'dragon-green', name: '绿龙', englishName: 'Green Dragon', description: '选择绿龙祖先：获得毒素伤害抗性并能说龙语；3 级起获得吐息武器（4.5 米锥形毒气吐息，2d6 伤害，体质豁免减半，长休后恢复）。', status: 'implemented', sourceIds: phb },
  { id: 'dragon-red', name: '红龙', englishName: 'Red Dragon', description: '选择红龙祖先：获得火焰伤害抗性并能说龙语；3 级起获得吐息武器（4.5 米锥形火焰吐息，2d6 伤害，敏捷豁免减半，长休后恢复）。', status: 'implemented', sourceIds: phb },
  { id: 'dragon-white', name: '白龙', englishName: 'White Dragon', description: '选择白龙祖先：获得冷冻伤害抗性并能说龙语；3 级起获得吐息武器（4.5 米锥形寒冰吐息，2d6 伤害，体质豁免减半，长休后恢复）。', status: 'implemented', sourceIds: phb },
  { id: 'dragon-brass', name: '黄铜龙', englishName: 'Brass Dragon', description: '选择黄铜龙祖先：获得火焰伤害抗性并能说龙语；3 级起获得吐息武器（5×1.5 米线形火焰吐息，2d6 伤害，敏捷豁免减半，长休后恢复）。', status: 'implemented', sourceIds: phb },
  { id: 'dragon-bronze', name: '青铜龙', englishName: 'Bronze Dragon', description: '选择青铜龙祖先：获得闪电伤害抗性并能说龙语；3 级起获得吐息武器（5×1.5 米线形闪电吐息，2d6 伤害，敏捷豁免减半，长休后恢复）。', status: 'implemented', sourceIds: phb },
  { id: 'dragon-copper', name: '铜龙', englishName: 'Copper Dragon', description: '选择铜龙祖先：获得强酸伤害抗性并能说龙语；3 级起获得吐息武器（5×1.5 米线形强酸吐息，2d6 伤害，敏捷豁免减半，长休后恢复）。', status: 'implemented', sourceIds: phb },
  { id: 'dragon-gold', name: '金龙', englishName: 'Gold Dragon', description: '选择金龙祖先：获得火焰伤害抗性并能说龙语；3 级起获得吐息武器（4.5 米锥形火焰吐息，2d6 伤害，敏捷豁免减半，长休后恢复）。', status: 'implemented', sourceIds: phb },
  { id: 'dragon-silver', name: '银龙', englishName: 'Silver Dragon', description: '选择银龙祖先：获得冷冻伤害抗性并能说龙语；3 级起获得吐息武器（4.5 米锥形寒冰吐息，2d6 伤害，体质豁免减半，长休后恢复）。', status: 'implemented', sourceIds: phb },

  // ============ 野兽形态（XGtE，野兽道途） ============
  { id: 'beast-form-claws', name: '野兽之爪', englishName: 'Claws', description: '狂暴期间长出利爪：徒手攻击视为武器，伤害 1d6 挥砍；攻击动作中可额外进行一次爪击。', status: 'implemented', sourceIds: xgte },
  { id: 'beast-form-bite', name: '野兽之牙', englishName: 'Bite', description: '狂暴期间长出獠牙：徒手攻击伤害 1d8 穿刺；命中时若生命值低于一半，获得等于体质调整值的临时生命。', status: 'implemented', sourceIds: xgte },
  { id: 'beast-form-tail', name: '野兽之尾', englishName: 'Tail', description: '狂暴期间长出长尾：徒手攻击伤害 1d8 钝击、触及 3 米；被攻击命中时可用反应使护甲等级 +1d8。', status: 'implemented', sourceIds: xgte },

  // ============ 巨人力量（BGG，巨人道途） ============
  { id: 'giant-power-cloud', name: '云巨人', englishName: 'Cloud Giant', description: '狂暴期间可用附赠动作向 3 米内喷出毒云：目标体质豁免失败则陷入中毒 1 轮（每回合一次）。', status: 'implemented', sourceIds: bigby },
  { id: 'giant-power-fire', name: '火巨人', englishName: 'Fire Giant', description: '狂暴期间可用附赠动作点燃 1.5 米内一名生物：敏捷豁免失败则受 1d10 火焰伤害（每回合一次）。', status: 'implemented', sourceIds: bigby },
  { id: 'giant-power-frost', name: '霜巨人', englishName: 'Frost Giant', description: '狂暴期间可用附赠动作冻结面前 4.5 米锥形地面：力量豁免失败的生物倒地（每回合一次）。', status: 'implemented', sourceIds: bigby },
  { id: 'giant-power-hill', name: '山丘巨人', englishName: 'Hill Giant', description: '狂暴期间跳跃距离提升，落地时可用附赠动作震慑 3 米内生物（体质豁免，每回合一次）。', status: 'implemented', sourceIds: bigby },
  { id: 'giant-power-stone', name: '石巨人', englishName: 'Stone Giant', description: '受到钝击、穿刺或挥砍伤害时，可用反应掷 1d10 减少该次伤害（每回合一次）。', status: 'implemented', sourceIds: bigby },
  { id: 'giant-power-storm', name: '风暴巨人', englishName: 'Storm Giant', description: '被 9 米内生物攻击命中时，可用反应使其受 1d10 雷鸣伤害（每回合一次）。', status: 'implemented', sourceIds: bigby },

  // ============ 风暴光环（XGtE，风暴先驱道途） ============
  { id: 'storm-aura-desert', name: '沙漠', englishName: 'Desert', description: '狂暴期间回合开始时，3 米内其他生物敏捷豁免失败则受 2 点火焰伤害（成功减半），豁免 DC 同狂暴触发值。', status: 'implemented', sourceIds: xgte },
  { id: 'storm-aura-sea', name: '海洋', englishName: 'Sea', description: '狂暴期间可用附赠动作，迫使 1.5 米内一名生物敏捷豁免失败则受 1d6 闪电或雷鸣伤害（自选）。', status: 'implemented', sourceIds: xgte },
  { id: 'storm-aura-tundra', name: '苔原', englishName: 'Tundra', description: '狂暴期间可用附赠动作，使 3 米内其他生物各获得 2 点临时生命。', status: 'implemented', sourceIds: xgte },

  // ============ 精魂图腾（XGtE，牧人结社） ============
  { id: 'spirit-totem-bear', name: '熊', englishName: 'Bear Spirit', description: '召唤熊精魂守护 9 米内盟友：范围内你与盟友每回合开始时获得等于德鲁伊等级的临时生命。', status: 'implemented', sourceIds: xgte },
  { id: 'spirit-totem-eagle', name: '鹰', englishName: 'Eagle Spirit', description: '召唤鹰精魂：你获得 18 米飞行速度；9 米内盟友对 9 米外可见生物的攻击检定具有优势。', status: 'implemented', sourceIds: xgte },
  { id: 'spirit-totem-unicorn', name: '独角兽', englishName: 'Unicorn Spirit', description: '召唤独角兽精魂：你施放治疗法术后，9 米内一名生物额外恢复等于德鲁伊等级的生命值。', status: 'implemented', sourceIds: xgte },

  // ============ 星体形态（TCoE，星辰结社） ============
  { id: 'starry-form-archer', name: '射手', englishName: 'Archer', description: '星图形态-射手：远程法术攻击命中造成 1d8 + 感知调整值光耀伤害。', status: 'implemented', sourceIds: tcoe },
  { id: 'starry-form-chalice', name: '圣杯', englishName: 'Chalice', description: '星图形态-圣杯：你施放治疗法术后掷 1d8，让 9 米内一名生物额外恢复等量生命值。', status: 'implemented', sourceIds: tcoe },
  { id: 'starry-form-dragon', name: '飞龙', englishName: 'Dragon', description: '星图形态-飞龙：智力检定与维持专注的豁免具有优势；9 米内敌人对你维持专注的豁免具有劣势。', status: 'implemented', sourceIds: tcoe },

  // ============ 奥术射击（XGtE，奥法射手） ============
  { id: 'arcane-shot-beguiling', name: '迷惑箭', englishName: 'Beguiling Arrow', description: '箭矢命中后额外 2d6 精神伤害；目标魅力豁免失败则被你魅惑，持续至你的下回合结束。', status: 'implemented', sourceIds: xgte },
  { id: 'arcane-shot-bursting', name: '爆裂箭', englishName: 'Bursting Arrow', description: '箭矢命中后额外 2d6 力场伤害；1.5 米内其他生物敏捷豁免失败则各受 2d6 力场伤害。', status: 'implemented', sourceIds: xgte },
  { id: 'arcane-shot-enfeebling', name: '衰弱箭', englishName: 'Enfeebling Arrow', description: '箭矢命中后额外 2d6 死灵伤害；目标下一次武器攻击造成的伤害减半。', status: 'implemented', sourceIds: xgte },
  { id: 'arcane-shot-grasping', name: '缠绕箭', englishName: 'Grasping Arrow', description: '箭矢命中后额外 2d6 穿刺伤害；目标被荆棘缠绕，移动时每 1.5 米受 1d6 穿刺，可用动作以力量检定挣脱。', status: 'implemented', sourceIds: xgte },
  { id: 'arcane-shot-piercing', name: '贯穿箭', englishName: 'Piercing Arrow', description: '射出 1.5 米宽 27 米长的箭幕：范围内生物敏捷豁免失败则受 2d6 穿刺伤害（成功减半）。', status: 'implemented', sourceIds: xgte },
  { id: 'arcane-shot-seeking', name: '追踪箭', englishName: 'Seeking Arrow', description: '攻击检定具有优势（目标处于全掩护时优势更强）；命中后额外 2d6 力场伤害，且你能获知其位置。', status: 'implemented', sourceIds: xgte },
  { id: 'arcane-shot-shadow', name: '暗影箭', englishName: 'Shadow Arrow', description: '箭矢命中后额外 2d6 精神伤害；目标视线受限（视同昏暗），持续至你的下回合结束。', status: 'implemented', sourceIds: xgte },
  { id: 'arcane-shot-banishing', name: '放逐箭', englishName: 'Banishing Arrow', description: '箭矢命中后额外 2d6 力场伤害；目标生命值低于 50 时被放逐至无害半位面，于你的下回合结束时返回。', status: 'implemented', sourceIds: xgte },

  // ============ 符文雕刻者（TCoE，符文骑士） ============
  { id: 'rune-cloud', name: '云符文', englishName: 'Cloud Rune', description: '雕刻后获得：你或 9 米内可见生物被攻击命中时，可用反应将该次攻击重定向至 9 米内另一生物。', status: 'implemented', sourceIds: tcoe },
  { id: 'rune-fire', name: '火符文', englishName: 'Fire Rune', description: '雕刻后获得：攻击命中时可用符文束缚目标，力量豁免失败则被魔法镣铐束缚并受 2d6 火焰伤害。', status: 'implemented', sourceIds: tcoe },
  { id: 'rune-frost', name: '霜符文', englishName: 'Frost Rune', description: '雕刻后威吓与驯兽检定优势；可激活冰之凝视，9 米内一名生物力量豁免失败则受 2d6 冷冻并被束缚 10 分钟。', status: 'implemented', sourceIds: tcoe },
  { id: 'rune-hill', name: '山丘符文', englishName: 'Hill Rune', description: '雕刻后力量检定与力量豁免优势；可激活巨人之力，1 分钟内获得对钝击、穿刺、挥砍伤害的抗性。', status: 'implemented', sourceIds: tcoe },
  { id: 'rune-stone', name: '石符文', englishName: 'Stone Rune', description: '雕刻后洞察检定优势；激活后 9 米内生物免疫魅惑与恐慌，且对你发动的感知检定具有劣势。', status: 'implemented', sourceIds: tcoe },
  { id: 'rune-storm', name: '风暴符文', englishName: 'Storm Rune', description: '雕刻后奥秘与历史检定优势；激活后洞察检定优势，且先攻检定具有优势，持续 1 分钟。', status: 'implemented', sourceIds: tcoe },

  // ============ 元素纪律（PHB 2014，四象宗） ============
  { id: 'discipline-fangs-of-fire', name: '火之獠牙', englishName: 'Fangs of the Fire Snake', description: '消耗气点：徒手攻击造成火焰伤害（1d10），触及 +3 米；命中后可用附赠动作追加 1d10 火焰伤害。', status: 'implemented', sourceIds: phb },
  { id: 'discipline-fist-of-four-thunders', name: '四雷之拳', englishName: 'Fist of Four Thunders', description: '消耗气点：拳头迸发雷鸣冲击，3 米内生物力量豁免失败则被推离 3 米并受雷鸣伤害。', status: 'implemented', sourceIds: phb },
  { id: 'discipline-mist-stance', name: '迷雾之姿', englishName: 'Mist Stance', description: '消耗气点：身体雾化移动，移动不引发借机攻击。', status: 'implemented', sourceIds: phb },
  { id: 'discipline-rush-of-gales', name: '狂风突进', englishName: 'Rush of the Gales', description: '消耗气点：化作狂风沿直线冲刺，路径上的生物力量豁免失败则被推开。', status: 'implemented', sourceIds: phb },
  { id: 'discipline-sweeping-cinder', name: '横扫余烬', englishName: 'Sweeping Cinder Strike', description: '消耗气点：近战攻击命中后横扫余烬，1.5 米内另一生物敏捷豁免失败则受火焰伤害。', status: 'implemented', sourceIds: phb },
  { id: 'discipline-wave-of-rolling-earth', name: '滚土之波', englishName: 'Wave of Rolling Earth', description: '消耗气点：近战攻击命中后地面涌动，9 米线内生物力量豁免失败则倒地。', status: 'implemented', sourceIds: phb },

  // ============ 剑圣武器（XGtE，剑圣宗） ============
  { id: 'kensei-weapon-longsword', name: '长剑', englishName: 'Longsword', description: '选择长剑作为剑圣武器：视为武僧武器并计入徒手攻击体系，可获得对应专精与强化。', status: 'implemented', sourceIds: xgte },
  { id: 'kensei-weapon-longbow', name: '长弓', englishName: 'Longbow', description: '选择长弓作为剑圣武器：视为武僧武器并计入徒手攻击体系，可获得对应专精与强化。', status: 'implemented', sourceIds: xgte },
  { id: 'kensei-weapon-whip', name: '长鞭', englishName: 'Whip', description: '选择长鞭作为剑圣武器：视为武僧武器并计入徒手攻击体系，可获得对应专精与强化。', status: 'implemented', sourceIds: xgte },

  // ============ 月之化身（Dragonlance，月之术法） ============
  { id: 'lunar-phase-new-moon', name: '新月', englishName: 'New Moon', description: '月之化身-新月：武器攻击与法术攻击检定 +1。', status: 'implemented', sourceIds: dsotdq },
  { id: 'lunar-phase-full-moon', name: '满月', englishName: 'Full Moon', description: '月之化身-满月：近战武器伤害 +1。', status: 'implemented', sourceIds: dsotdq },
  { id: 'lunar-phase-crescent-moon', name: '残月', englishName: 'Crescent Moon', description: '月之化身-残月：护甲等级 +1。', status: 'implemented', sourceIds: dsotdq },

  // ============ 巨灵容器（TCoE，巨灵宗主） ============
  { id: 'genie-vessel-dao', name: '土巨灵', englishName: 'Dao', description: '选择土巨灵宗主：获得可栖身的魔法容器与对应元素亲和，短休期间可进入容器休整；造成伤害时可附加钝击类元素效果（次数与恢复按规则）。', status: 'implemented', sourceIds: tcoe },
  { id: 'genie-vessel-djinni', name: '风巨灵', englishName: 'Djinni', description: '选择风巨灵宗主：获得可栖身的魔法容器与对应元素亲和，短休期间可进入容器休整；造成伤害时可附加雷鸣类元素效果（次数与恢复按规则）。', status: 'implemented', sourceIds: tcoe },
  { id: 'genie-vessel-efreeti', name: '火巨灵', englishName: 'Efreeti', description: '选择火巨灵宗主：获得可栖身的魔法容器与对应元素亲和，短休期间可进入容器休整；造成伤害时可附加火焰类元素效果（次数与恢复按规则）。', status: 'implemented', sourceIds: tcoe },
  { id: 'genie-vessel-marid', name: '水巨灵', englishName: 'Marid', description: '选择水巨灵宗主：获得可栖身的魔法容器与对应元素亲和，短休期间可进入容器休整；造成伤害时可附加冷冻类元素效果（次数与恢复按规则）。', status: 'implemented', sourceIds: tcoe },
]
