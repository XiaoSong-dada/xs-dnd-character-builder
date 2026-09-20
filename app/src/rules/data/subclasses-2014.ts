import type { RuleOption, SpellcastingConfig, SubclassRule } from '@/types/rules'
import { getSubclassFeatures2014 } from '@/rules/data/subclass-features-2014'
import { THIRD_CASTER_SPELL_SLOTS, thirdCasterMaximumSpellLevels } from '@/rules/data/spell-slots-2014'
import { spells2014 } from '@/rules/data/spells-2014'

type SubclassEntry = readonly [slug: string, name: string, englishName: string, sourceId: string, availability?: 'dm-only']

const sourceTitles: Readonly<Record<string, string>> = {
  'phb-2014-index': '《玩家手册》(2014)',
  'dmg-2014-index': '《地下城主指南》(2014)',
  'scag-2015-index': '《剑湾冒险者指南》',
  'xgte-2017-index': '《珊娜萨的万事指南》',
  'egtw-2020-index': '《荒洲探险者指南》',
  'tcoe-2020-index': '《塔莎的万事坩埚》',
  'vrgtr-2021-index': '《范·里希滕的鸦阁指南》',
  'ftd-2021-index': '《费兹班的巨龙宝库》',
  'dsotdq-2022-index': '《龙枪：龙后之影》',
  'bigby-2023-index': '《毕格比的巨人荣光》',
}

/**
 * 子职摘要覆盖：已按《5e 不全书》核验过的子职在此登记真实摘要（原创中文转述），
 * 未列出的子职沿用下方的通用说明。
 */
const subclassSummaryOverrides: Readonly<Record<string, string>> = {
  // ===== 邪术师宗主（v1.5.1）=====
  'subclass-2014-warlock-archfey': '宗主是一位妖精领主或女王，守护着凡人种族出现前就已被遗忘的秘密，行为往往难以理解。1 级获得扩展法术列表与妖精仪态；6 级雾遁；10 级斗转星移；14 级幻影黑幕。',
  'subclass-2014-warlock-fiend': '宗主是下层位面的强大邪魔（恶魔领主或大魔鬼），追求万物的堕落与毁灭，但你不必与之同流合污。1 级获得扩展法术列表与黑暗赐福；6 级黑暗强运；10 级邪魔体魄；14 级直坠噩梦。',
  'subclass-2014-warlock-great-old-one': '宗主的本质与现实结构格格不入，可能来自遥远国度或仅存于传说中的古神，其行为无法被凡人理解，也可能根本未意识到你的存在。1 级获得扩展法术列表与唤醒心灵；6 级熵光结界；10 级思维之盾；14 级创造奴仆。',

  // ===== 奇械师（TCoE）=====
  'subclass-2014-artificer-alchemist': 'Alchemist · TCoE · 把奇异原料混合成延续生命或夺走生命的物质，是奇械师最古老的技艺。3 级获得炼金工具熟练与始终准备的炼金师法术，并能以长休制造实验性灵药（治疗、疾速、韧性、气魄、飞行、变形六选一，6 级 2 瓶、15 级 3 瓶）；5 级炼金术掌握让法器施法的治疗或强酸／火焰／暗蚀／毒素伤害获得智力加值；9 级复原药剂为饮用者附加临时生命，并可免费施展次等复原术；15 级化学专家获得强酸与毒素抗性、免疫中毒，并各免费施展一次高级复原术与医疗术。',
  'subclass-2014-artificer-armorer': 'Armorer · TCoE · 把护甲变成第二层皮肤，以奥能装甲承载奇械师魔法。3 级获得重甲与铁匠工具熟练、始终准备的装甲师法术，可将护甲转为奥能装甲并选定装甲型号（守护者偏前线与临时生命／渗透者偏远程闪电与机动，短休或长休后可用铁匠工具更换）；5 级额外攻击；9 级装甲改造让奥能装甲的各部分分别承受注法并追加 2 个注法位；15 级完美装甲按型号强化攻击与防护。',
  'subclass-2014-artificer-artillerist': 'Artillerist · TCoE · 在战场上投射能量与爆炸物的专家，以魔能炮台构筑火力点。3 级获得木匠工具熟练与始终准备的魔炮师法术，能以动作召唤小型或微型魔能炮台并选定型号（投火机／力场弩炮／防御者），每回合可用附赠动作激活 60 尺内的炮台；5 级奥法枪械让魔杖、法杖或权杖成为法器并使法术伤害掷骰获得 d8 加值；9 级高爆炮台使伤害骰 +1d8 并可命令炮台自爆；15 级要塞阵地提供半身掩护并可同时维持两台炮台。',
  'subclass-2014-artificer-battle-smith': 'Battle Smith · TCoE · 守护者与医生的结合，携带自制的钢铁守卫重整战线。3 级获得铁匠工具与军用武器熟练、始终准备的战地匠师法术，可用智力替代力量或敏捷进行魔法武器攻击，并造出钢铁守卫（使用你的先攻、需附赠动作下达指令，伤害免疫毒素）；5 级额外攻击；9 级奥能震荡可在攻击命中时追加 2d6 力场伤害或为 30 尺内目标恢复 2d6 生命，次数等于智力调整值；15 级改良守卫把奥能震荡提升为 4d6，守卫 AC +2 且偏转攻击反伤。',

  // ===== 野蛮人原初道途 =====
  'subclass-2014-barbarian-berserker': 'Path of the Berserker · PHB · 以纯粹的暴怒作战，把狂暴推向极致。3 级狂乱可在狂暴期间以附赠动作追加一次近战武器攻击（结束后获得一层力竭）；6 级无我狂暴使狂暴期间免疫魅惑与恐慌；10 级恐吓气势可以动作使 30 尺内一名生物恐慌；14 级报复使你在狂暴期间被近战命中时可用反应反击。',
  'subclass-2014-barbarian-totem-warrior': 'Path of the Totem Warrior · PHB · 与猛兽之灵共鸣，按所选图腾获得对应的狂暴增益。3 级图腾精魄（熊／鹰／狼三选一）；6 级兽之形按同一图腾提供非狂暴期能力；10 级图腾行者可施展野兽知觉与野兽沟通仪式；14 级图腾协调按图腾提供更强效果。',
  'subclass-2014-barbarian-ancestral-guardian': 'Path of the Ancestral Guardian · XGtE · 以先祖精魂守护族人、削弱敌人。3 级先祖护卫在狂暴时召出精魂战士：你每回合首个命中的目标对你以外者攻击具有劣势，且其命中他人时该次伤害被减免；6 级精魂之盾可用反应为 30 尺内可见生物减少 2d6 伤害（10 级 3d6、14 级 4d6）；10 级问道精魂可无需法术位施展卜筮术或鹰眼术（感知施法）；14 级仇魂先祖使被精魂标记的目标受到反伤。',
  'subclass-2014-barbarian-battlerager': 'Path of the Battlerager · SCAG · 限定矮人的道途，披挂钉刺甲以身体冲撞作战。3 级战狂装甲使你在狂暴期间可附赠动作以钉刺甲对 5 尺内目标发动近战攻击（1d4 穿刺），并以攻击动作擒抱成功时造成 3 点穿刺伤害；6 级凶蛮无羁使鲁莽攻击时获得等于体质调整值的临时生命；10 级战狂冲锋可在狂暴期间以附赠动作疾走；14 级钉刺反冲让 5 尺内近战命中你的攻击者受到 3 点穿刺伤害。',
  'subclass-2014-barbarian-beast': 'Path of the Beast · TCoE · 点燃灵魂深处的兽性火花，狂暴时变形长出天生武器。3 级野兽之形在进入狂暴时选择啃咬（1d8 穿刺，半血以下命中可恢复生命）、爪击（1d6 挥砍，一回合追加一次）或尾击（1d8 穿刺，触及并可反应加 AC）；6 级兽性之魂使天生武器视为魔法武器，并在休息后选择泳速与水下呼吸、攀爬速度或延长跳跃；10 级狂怒之染让命中目标进行感知豁免，失败则被迫攻击同伴或受 2d12 心灵伤害；14 级狩猎之唤可激发盟友的凶性。',
  'subclass-2014-barbarian-giant': 'Path of the Giant · Bigby · 从巨人与元素同族汲取力量，狂暴时自身体型增大。3 级巨人之力获得巨人语并能习得德鲁伊伎俩或奇术（感知施法），巨人之灾让狂暴期间投掷武器附加狂暴伤害、触及 +5 尺且体型增至大型；6 级元素战刃可在狂暴时为持握武器注入强酸／寒冷／火焰／雷鸣／闪电并额外造成 1d6，武器获得投掷属性且脱手后立即回手；10 级伟力推动可用附赠动作把不超过中型的生物投向 30 尺内；14 级创世巨像使触及再增 10 尺、体型可至巨型并扩大投掷对象。',
  'subclass-2014-barbarian-storm-herald': 'Path of the Storm Herald · XGtE · 把愤怒化作环绕自身的原初风暴披风。3 级风暴灵光在狂暴时选择沙漠（火焰伤害）、海洋（闪电束）或冻原（削减目标伤害掷骰），形成 10 尺光环并可以附赠动作再次激活；6 级风暴之魂按已选环境提供火焰／闪电／寒冷抗性与对应小能力；10 级风暴之盾让光环内选定盟友获得同类型抗性；14 级狂怒风暴按环境强化光环效果。',
  'subclass-2014-barbarian-wild-magic': 'Path of Wild Magic · TCoE · 狂暴源自妖精荒野的狂野魔力，效果不受控。3 级魔法察觉可以动作感知 60 尺内的法术与魔法物品（次数等于熟练加值），狂暴时触发狂野浪潮（按 d8 表产生暗蚀卷须、传送、精魂爆炸等效果）；6 级魔法共鸣使狂暴期间的力量检定与豁免获得额外 1d3；10 级不稳定反冲可在受伤或失败时以反应重掷一次狂野浪潮；14 级控制乱流可在狂暴时指定狂野浪潮的结果。',
  'subclass-2014-barbarian-zealot': 'Path of the Zealot · XGtE · 以神祇之名狂战，死后仍可被复活。3 级神性之怒使狂暴期间每回合首次命中额外造成 1d6＋半个野蛮人等级的光耀或黯蚀伤害，神之勇者提供 4 枚 d12 的治疗池（6／12／17 级增至 5／6／7 枚，长休恢复）；6 级专心炽志每次狂暴可重骰一次失败的豁免并获得狂暴伤害加值；10 级狂热威仪以附赠动作让 60 尺内至多十名生物的攻击与豁免具有优势（每次长休一次，可消耗狂暴次数重置）；14 级神之狂暴可进入 1 分钟的圣斗士姿态，获得飞行等增益。',

  // ===== 吟游诗人学院 =====
  'subclass-2014-bard-lore': 'College of Lore · PHB · 以博学与机智拆解敌人的攻势。3 级附赠熟练获得任意三项技能熟练，语出惊人可用激励骰削减敌人的攻击、检定或伤害；6 级额外魔法奥秘从任意职业法术列表额外选取两个法术；14 级无双技艺可用激励骰强化自身的能力检定。',
  'subclass-2014-bard-valor': 'College of Valor · PHB · 以战歌鼓舞同伴并亲身上阵。3 级战斗激励让激励骰可用于武器伤害或提升 AC，并获中甲、盾牌与军用武器熟练；6 级额外攻击；14 级战斗魔法可在施展法术后以附赠动作发动一次武器攻击。',
  'subclass-2014-bard-glamour': 'College of Glamour · XGtE · 承袭妖精荒野的惑心魔法，把美好与恐怖织入歌舞。3 级惑心魔法始终准备魅惑类人与镜影术，施放惑控或幻术法术后可迫使 60 尺内一名生物感知豁免，失败则被魅惑或恐慌 1 分钟（每次长休一次，可消耗激励次数重置）；灵感织衣以附赠动作消耗激励骰，让至多等于魅力调整值名盟友获得双倍骰值的临时生命并立即移动；6 级威仪作锦始终准备命令术并可无需法术位施展，同时获得 1 分钟的超凡容貌；14 级不破威严让攻击你的敌人必须先行豁免。',
  'subclass-2014-bard-swords': 'College of Swords · XGtE · 刃锋以武器杂耍表演，同时是训练有素的战士。3 级附赠熟练获得中甲与弯刀熟练（并可用熟练的近战武器作为法器），战斗风格在决斗或双武器战斗中选择，剑舞可在攻击动作中以移动换取伤害或 AC 加成；6 级额外攻击；14 级剑舞大师使剑舞的移动换取效果进一步增强。',
  'subclass-2014-bard-whispers': 'College of Whispers · XGtE · 披着吟游诗人外衣收集秘密、制造恐惧。3 级心灵之刃在武器命中时消耗激励次数追加 2d6 心灵伤害（5 级 3d6、10 级 5d6、15 级 8d6），惊骇之语可在与类人生物交谈 1 分钟后迫使其感知豁免；6 级低语光环可窃取类人生物的外形；14 级阴暗学识可长期借用被窃取的外形。',
  'subclass-2014-bard-creation': 'College of Creation · TCoE · 引用创生圣言的造物之歌，让歌声具现为实体。3 级潜能微尘在给予诗人激励时附带一枚微尘，按激励骰的用途（属性检定／攻击检定／豁免检定）产生额外效果；6 级造物表演可以动作活化 30 尺内的物件或造出临时物品；14 级创造之赐在使用造物表演时可一次造出多件物品。',
  'subclass-2014-bard-eloquence': 'College of Eloquence · TCoE · 以无懈可击的逻辑与感染力说服听众。3 级巧舌如簧使魅力（游说）与魅力（欺瞒）检定掷出 9 或更低时视为 10，扰神之词以附赠动作消耗激励骰降低 60 尺内目标的下一次豁免；6 级不竭鼓舞让使用激励骰仍失败者可以保留该骰，统一言说使至多等于魅力调整值的生物听懂你的话语；14 级雄辩言辞使成功激励他人的效果向外扩散。',
  'subclass-2014-bard-spirits': 'College of Spirits · VRGtR · 以故事召引精魂，让传说化为力量。3 级呢喃指引额外习得戏法神导术（施法距离 60 尺，不占已知戏法），精魂法器允许用蜡烛、水晶球、头骨、通灵板或塔罗牌作为法器，彼岸故事以附赠动作消耗激励次数掷精魂故事表并保存故事；6 级精魂法器让通过法器施展的伤害或治疗法术获得一枚 d6 加值；14 级神秘连结使精魂故事更可控。',
}

const entriesByClass = {
  artificer: [
    ['alchemist', '炼金师', 'Alchemist', 'tcoe-2020-index'],
    ['armorer', '装甲师', 'Armorer', 'tcoe-2020-index'],
    ['artillerist', '魔炮师', 'Artillerist', 'tcoe-2020-index'],
    ['battle-smith', '战地匠师', 'Battle Smith', 'tcoe-2020-index'],
  ],
  barbarian: [
    ['berserker', '狂战士道途', 'Path of the Berserker', 'phb-2014-index'],
    ['totem-warrior', '图腾武者道途', 'Path of the Totem Warrior', 'phb-2014-index'],
    ['ancestral-guardian', '先祖守卫道途', 'Path of the Ancestral Guardian', 'xgte-2017-index'],
    ['battlerager', '战狂道途', 'Path of the Battlerager', 'scag-2015-index'],
    ['beast', '野兽道途', 'Path of the Beast', 'tcoe-2020-index'],
    ['giant', '巨人道途', 'Path of the Giant', 'bigby-2023-index'],
    ['storm-herald', '风暴先驱道途', 'Path of the Storm Herald', 'xgte-2017-index'],
    ['wild-magic', '狂野魔法道途', 'Path of Wild Magic', 'tcoe-2020-index'],
    ['zealot', '狂热者道途', 'Path of the Zealot', 'xgte-2017-index'],
  ],
  bard: [
    ['lore', '逸闻学院', 'College of Lore', 'phb-2014-index'],
    ['valor', '勇气学院', 'College of Valor', 'phb-2014-index'],
    ['glamour', '魅心学院', 'College of Glamour', 'xgte-2017-index'],
    ['swords', '剑舞学院', 'College of Swords', 'xgte-2017-index'],
    ['whispers', '低语学院', 'College of Whispers', 'xgte-2017-index'],
    ['creation', '创造学院', 'College of Creation', 'tcoe-2020-index'],
    ['eloquence', '雄辩学院', 'College of Eloquence', 'tcoe-2020-index'],
    ['spirits', '精魂学院', 'College of Spirits', 'vrgtr-2021-index'],
  ],
  cleric: [
    ['knowledge', '知识领域', 'Knowledge Domain', 'phb-2014-index'],
    ['life', '生命领域', 'Life Domain', 'phb-2014-index'],
    ['light', '光明领域', 'Light Domain', 'phb-2014-index'],
    ['nature', '自然领域', 'Nature Domain', 'phb-2014-index'],
    ['tempest', '风暴领域', 'Tempest Domain', 'phb-2014-index'],
    ['trickery', '诡术领域', 'Trickery Domain', 'phb-2014-index'],
    ['war', '战争领域', 'War Domain', 'phb-2014-index'],
    ['death', '死亡领域', 'Death Domain', 'dmg-2014-index', 'dm-only'],
    ['arcana', '奥秘领域', 'Arcana Domain', 'scag-2015-index'],
    ['forge', '锻造领域', 'Forge Domain', 'xgte-2017-index'],
    ['grave', '坟墓领域', 'Grave Domain', 'xgte-2017-index'],
    ['order', '秩序领域', 'Order Domain', 'tcoe-2020-index'],
    ['peace', '和平领域', 'Peace Domain', 'tcoe-2020-index'],
    ['twilight', '暮光领域', 'Twilight Domain', 'tcoe-2020-index'],
  ],
  druid: [
    ['land', '大地结社', 'Circle of the Land', 'phb-2014-index'],
    ['moon', '月亮结社', 'Circle of the Moon', 'phb-2014-index'],
    ['dreams', '梦境结社', 'Circle of Dreams', 'xgte-2017-index'],
    ['shepherd', '牧人结社', 'Circle of the Shepherd', 'xgte-2017-index'],
    ['spores', '孢子结社', 'Circle of Spores', 'tcoe-2020-index'],
    ['stars', '星辰结社', 'Circle of Stars', 'tcoe-2020-index'],
    ['wildfire', '野火结社', 'Circle of Wildfire', 'tcoe-2020-index'],
  ],
  fighter: [
    ['champion', '勇士', 'Champion', 'phb-2014-index'],
    ['battle-master', '战斗大师', 'Battle Master', 'phb-2014-index'],
    ['eldritch-knight', '奥法骑士', 'Eldritch Knight', 'phb-2014-index'],
    ['purple-dragon-knight', '紫龙骑士', 'Purple Dragon Knight', 'scag-2015-index'],
    ['arcane-archer', '魔射手', 'Arcane Archer', 'xgte-2017-index'],
    ['cavalier', '骑兵', 'Cavalier', 'xgte-2017-index'],
    ['samurai', '武士', 'Samurai', 'xgte-2017-index'],
    ['echo-knight', '回音骑士', 'Echo Knight', 'egtw-2020-index'],
    ['psi-warrior', '灵能武士', 'Psi Warrior', 'tcoe-2020-index'],
    ['rune-knight', '符文骑士', 'Rune Knight', 'tcoe-2020-index'],
  ],
  monk: [
    ['open-hand', '散打宗', 'Way of the Open Hand', 'phb-2014-index'],
    ['shadow', '暗影宗', 'Way of Shadow', 'phb-2014-index'],
    ['four-elements', '四象宗', 'Way of the Four Elements', 'phb-2014-index'],
    ['long-death', '永亡宗', 'Way of the Long Death', 'scag-2015-index'],
    ['sun-soul', '日魂宗', 'Way of the Sun Soul', 'scag-2015-index'],
    ['drunken-master', '醉拳宗', 'Way of the Drunken Master', 'xgte-2017-index'],
    ['kensei', '剑圣宗', 'Way of the Kensei', 'xgte-2017-index'],
    ['astral-self', '星我宗', 'Way of the Astral Self', 'tcoe-2020-index'],
    ['mercy', '命流宗', 'Way of Mercy', 'tcoe-2020-index'],
    ['ascendant-dragon', '神龙宗', 'Way of the Ascendant Dragon', 'ftd-2021-index'],
  ],
  paladin: [
    ['devotion', '奉献之誓', 'Oath of Devotion', 'phb-2014-index'],
    ['ancients', '古贤之誓', 'Oath of the Ancients', 'phb-2014-index'],
    ['vengeance', '复仇之誓', 'Oath of Vengeance', 'phb-2014-index'],
    ['oathbreaker', '破誓者', 'Oathbreaker', 'dmg-2014-index', 'dm-only'],
    ['crown', '王冠之誓', 'Oath of the Crown', 'scag-2015-index'],
    ['conquest', '征服之誓', 'Oath of Conquest', 'xgte-2017-index'],
    ['redemption', '救赎之誓', 'Oath of Redemption', 'xgte-2017-index'],
    ['glory', '荣耀之誓', 'Oath of Glory', 'tcoe-2020-index'],
    ['watchers', '守望之誓', 'Oath of the Watchers', 'tcoe-2020-index'],
  ],
  ranger: [
    ['hunter', '猎人', 'Hunter', 'phb-2014-index'],
    ['beast-master', '驯兽师', 'Beast Master', 'phb-2014-index'],
    ['gloom-stalker', '幽域追猎者', 'Gloom Stalker', 'xgte-2017-index'],
    ['horizon-walker', '边界行者', 'Horizon Walker', 'xgte-2017-index'],
    ['monster-slayer', '怪物杀手', 'Monster Slayer', 'xgte-2017-index'],
    ['fey-wanderer', '妖精漫游者', 'Fey Wanderer', 'tcoe-2020-index'],
    ['swarmkeeper', '集群牧者', 'Swarmkeeper', 'tcoe-2020-index'],
    ['drakewarden', '龙兽守卫', 'Drakewarden', 'ftd-2021-index'],
  ],
  rogue: [
    ['thief', '盗贼', 'Thief', 'phb-2014-index'],
    ['assassin', '刺客', 'Assassin', 'phb-2014-index'],
    ['arcane-trickster', '诡术师', 'Arcane Trickster', 'phb-2014-index'],
    ['mastermind', '策士', 'Mastermind', 'xgte-2017-index'],
    ['swashbuckler', '风流剑客', 'Swashbuckler', 'xgte-2017-index'],
    ['inquisitive', '调查员', 'Inquisitive', 'xgte-2017-index'],
    ['scout', '斥候', 'Scout', 'xgte-2017-index'],
    ['phantom', '鬼魅', 'Phantom', 'tcoe-2020-index'],
    ['soulknife', '魂刃', 'Soulknife', 'tcoe-2020-index'],
  ],
  sorcerer: [
    ['draconic-bloodline', '龙族血脉', 'Draconic Bloodline', 'phb-2014-index'],
    ['wild-magic', '狂野魔法', 'Wild Magic', 'phb-2014-index'],
    ['storm-sorcery', '风暴术法', 'Storm Sorcery', 'xgte-2017-index'],
    ['divine-soul', '神圣之魂', 'Divine Soul', 'xgte-2017-index'],
    ['shadow-magic', '幽影魔法', 'Shadow Magic', 'xgte-2017-index'],
    ['aberrant-mind', '畸变心智', 'Aberrant Mind', 'tcoe-2020-index'],
    ['clockwork-soul', '时械之魂', 'Clockwork Soul', 'tcoe-2020-index'],
    ['lunar-sorcery', '月之术法', 'Lunar Sorcery', 'dsotdq-2022-index'],
  ],
  warlock: [
    ['archfey', '至高妖精', 'The Archfey', 'phb-2014-index'],
    ['fiend', '邪魔', 'The Fiend', 'phb-2014-index'],
    ['great-old-one', '旧日支配者', 'The Great Old One', 'phb-2014-index'],
    ['undying', '不朽者', 'The Undying', 'scag-2015-index'],
    ['celestial', '天界', 'The Celestial', 'xgte-2017-index'],
    ['hexblade', '咒剑', 'The Hexblade', 'xgte-2017-index'],
    ['fathomless', '深海意志', 'The Fathomless', 'tcoe-2020-index'],
    ['genie', '巨灵', 'The Genie', 'tcoe-2020-index'],
    ['undead', '死灵', 'The Undead', 'vrgtr-2021-index'],
  ],
  wizard: [
    ['abjuration', '防护学派', 'School of Abjuration', 'phb-2014-index'],
    ['conjuration', '咒法学派', 'School of Conjuration', 'phb-2014-index'],
    ['divination', '预言学派', 'School of Divination', 'phb-2014-index'],
    ['enchantment', '惑控学派', 'School of Enchantment', 'phb-2014-index'],
    ['evocation', '塑能学派', 'School of Evocation', 'phb-2014-index'],
    ['illusion', '幻术学派', 'School of Illusion', 'phb-2014-index'],
    ['necromancy', '死灵学派', 'School of Necromancy', 'phb-2014-index'],
    ['transmutation', '变化学派', 'School of Transmutation', 'phb-2014-index'],
    ['bladesinging', '剑咏', 'Bladesinging', 'tcoe-2020-index'],
    ['war-magic', '战争魔法', 'War Magic', 'xgte-2017-index'],
    ['chronurgy', '时间魔法', 'Chronurgy Magic', 'egtw-2020-index'],
    ['graviturgy', '重力魔法', 'Graviturgy Magic', 'egtw-2020-index'],
    ['order-of-scribes', '书士会', 'Order of Scribes', 'tcoe-2020-index'],
  ],
} as const satisfies Readonly<Record<string, readonly SubclassEntry[]>>

const selectionLevels: Readonly<Record<string, number>> = {
  artificer: 3,
  barbarian: 3, bard: 3, cleric: 1, druid: 2, fighter: 3, monk: 3,
  paladin: 3, ranger: 3, rogue: 3, sorcerer: 1, warlock: 1, wizard: 2,
}

const implementedIds = new Set([
  'subclass-2014-fighter-battle-master',
  'subclass-2014-fighter-champion',
  'subclass-2014-fighter-eldritch-knight',
  'subclass-2014-barbarian-berserker',
  'subclass-2014-barbarian-totem-warrior',
  'subclass-2014-monk-open-hand',
  'subclass-2014-monk-shadow',
  'subclass-2014-rogue-thief',
  'subclass-2014-rogue-assassin',
  'subclass-2014-rogue-arcane-trickster',
  'subclass-2014-ranger-hunter',
  'subclass-2014-ranger-beast-master',
  'subclass-2014-paladin-devotion',
  'subclass-2014-paladin-ancients',
  'subclass-2014-paladin-vengeance',
  'subclass-2014-warlock-archfey',
  'subclass-2014-warlock-fiend',
  'subclass-2014-warlock-great-old-one',
  'subclass-2014-wizard-abjuration',
  'subclass-2014-wizard-conjuration',
  'subclass-2014-wizard-divination',
  'subclass-2014-wizard-enchantment',
  'subclass-2014-wizard-evocation',
  'subclass-2014-wizard-illusion',
  'subclass-2014-wizard-necromancy',
  'subclass-2014-wizard-transmutation',
  'subclass-2014-bard-lore',
  'subclass-2014-bard-valor',
  'subclass-2014-cleric-life',
  'subclass-2014-cleric-war',
  'subclass-2014-druid-land',
  'subclass-2014-druid-moon',
  'subclass-2014-sorcerer-draconic-bloodline',
  'subclass-2014-sorcerer-wild-magic',
  'subclass-2014-barbarian-ancestral-guardian',
  'subclass-2014-barbarian-battlerager',
  'subclass-2014-barbarian-beast',
  'subclass-2014-barbarian-giant',
  'subclass-2014-barbarian-storm-herald',
  'subclass-2014-barbarian-wild-magic',
  'subclass-2014-barbarian-zealot',
  'subclass-2014-bard-glamour',
  'subclass-2014-bard-swords',
  'subclass-2014-bard-whispers',
  'subclass-2014-bard-creation',
  'subclass-2014-bard-eloquence',
  'subclass-2014-bard-spirits',
  'subclass-2014-cleric-knowledge',
  'subclass-2014-cleric-light',
  'subclass-2014-cleric-nature',
  'subclass-2014-cleric-tempest',
  'subclass-2014-cleric-trickery',
  'subclass-2014-cleric-arcana',
  'subclass-2014-cleric-forge',
  'subclass-2014-cleric-grave',
  'subclass-2014-cleric-order',
  'subclass-2014-cleric-peace',
  'subclass-2014-cleric-twilight',
  'subclass-2014-druid-dreams',
  'subclass-2014-druid-shepherd',
  'subclass-2014-druid-spores',
  'subclass-2014-druid-stars',
  'subclass-2014-druid-wildfire',
  'subclass-2014-fighter-purple-dragon-knight',
  'subclass-2014-fighter-arcane-archer',
  'subclass-2014-fighter-cavalier',
  'subclass-2014-fighter-samurai',
  'subclass-2014-fighter-echo-knight',
  'subclass-2014-fighter-psi-warrior',
  'subclass-2014-fighter-rune-knight',
  'subclass-2014-monk-four-elements',
  'subclass-2014-monk-long-death',
  'subclass-2014-monk-sun-soul',
  'subclass-2014-monk-drunken-master',
  'subclass-2014-monk-kensei',
  'subclass-2014-monk-astral-self',
  'subclass-2014-monk-mercy',
  'subclass-2014-monk-ascendant-dragon',
  'subclass-2014-paladin-crown',
  'subclass-2014-paladin-conquest',
  'subclass-2014-paladin-redemption',
  'subclass-2014-paladin-glory',
  'subclass-2014-paladin-watchers',
  'subclass-2014-ranger-gloom-stalker',
  'subclass-2014-ranger-horizon-walker',
  'subclass-2014-ranger-monster-slayer',
  'subclass-2014-ranger-fey-wanderer',
  'subclass-2014-ranger-swarmkeeper',
  'subclass-2014-ranger-drakewarden',
  'subclass-2014-rogue-mastermind',
  'subclass-2014-rogue-swashbuckler',
  'subclass-2014-rogue-inquisitive',
  'subclass-2014-rogue-scout',
  'subclass-2014-rogue-phantom',
  'subclass-2014-rogue-soulknife',
  'subclass-2014-sorcerer-storm-sorcery',
  'subclass-2014-sorcerer-divine-soul',
  'subclass-2014-sorcerer-shadow-magic',
  'subclass-2014-sorcerer-aberrant-mind',
  'subclass-2014-sorcerer-clockwork-soul',
  'subclass-2014-sorcerer-lunar-sorcery',
  'subclass-2014-warlock-undying',
  'subclass-2014-warlock-celestial',
  'subclass-2014-warlock-hexblade',
  'subclass-2014-warlock-fathomless',
  'subclass-2014-warlock-genie',
  'subclass-2014-warlock-undead',
  'subclass-2014-wizard-bladesinging',
  'subclass-2014-wizard-war-magic',
  'subclass-2014-wizard-chronurgy',
  'subclass-2014-wizard-graviturgy',
  'subclass-2014-wizard-order-of-scribes',
])

/** 法师法术池（奥法骑士、诡术师从该列表选择已知法术）。 */
const wizardSpellIds: readonly string[] = spells2014
  .filter((spell) => spell.classIds.includes('class-2014-wizard'))
  .map((spell) => spell.id)

const spellIds = (...englishNames: readonly string[]): readonly string[] => englishNames.flatMap((name) => {
  const spell = spells2014.find((item) => item.englishName === name)
  return spell ? [spell.id] : []
})

/** EGtW 法师子职的秘迹学法术书候选（共享 6 条 + 时间／重力专属），仅对应子职可见。 */
const wizardSubclassSpellbookSpells: Readonly<Record<string, readonly string[]>> = {
  'subclass-2014-wizard-chronurgy': spellIds(
    'Sapping Sting', 'Fortune\'s Favor', 'Immovable Object', 'Wristpocket', 'Pulse Wave', 'Tether Essence',
    'Gift of Alacrity', 'Temporal Shunt', 'Reality Break', 'Time Ravage',
  ),
  'subclass-2014-wizard-graviturgy': spellIds(
    'Sapping Sting', 'Fortune\'s Favor', 'Immovable Object', 'Wristpocket', 'Pulse Wave', 'Tether Essence',
    'Magnify Gravity', 'Gravity Sinkhole', 'Gravity Fissure', 'Dark Star', 'Ravenous Void',
  ),
}

const artificerSubclassSpells: Readonly<Record<string, Readonly<Record<number, readonly string[]>>>> = {
  'subclass-2014-artificer-alchemist': {
    3: spellIds('Healing Word', 'Ray of Sickness'), 5: spellIds('Flaming Sphere', "Melf's Acid Arrow"),
    9: spellIds('Gaseous Form', 'Mass Healing Word'), 13: spellIds('Blight', 'Death Ward'),
    17: spellIds('Cloudkill', 'Raise Dead'),
  },
  'subclass-2014-artificer-armorer': {
    3: spellIds('Magic Missile', 'Thunderwave'), 5: spellIds('Mirror Image', 'Shatter'),
    9: spellIds('Hypnotic Pattern', 'Lightning Bolt'), 13: spellIds('Fire Shield', 'Greater Invisibility'),
    17: spellIds('Passwall', 'Wall of Force'),
  },
  'subclass-2014-artificer-artillerist': {
    3: spellIds('Shield', 'Thunderwave'), 5: spellIds('Scorching Ray', 'Shatter'),
    9: spellIds('Fireball', 'Wind Wall'), 13: spellIds('Ice Storm', 'Wall of Fire'),
    17: spellIds('Cone of Cold', 'Wall of Force'),
  },
  'subclass-2014-artificer-battle-smith': {
    3: spellIds('Heroism', 'Shield'), 5: spellIds('Branding Smite', 'Warding Bond'),
    9: spellIds('Aura of Vitality', 'Conjure Barrage'), 13: spellIds('Aura of Purity', 'Fire Shield'),
    17: spellIds('Banishing Smite', 'Mass Cure Wounds'),
  },
}

/** 三分之一施法者（奥法骑士、诡术师）戏法数量：3 级 2 个、10 级 3 个。 */
const THIRD_CASTER_CANTRIPS = [0, 0, 2, 2, 2, 2, 2, 2, 2, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3] as const
/** 三分之一施法者已知法术数量：3 级 3 个，4/7/8/10/11/14/16/19 级各 +1（共 11 个）。 */
const THIRD_CASTER_SPELLS_KNOWN = [0, 0, 3, 4, 4, 4, 5, 6, 6, 7, 8, 8, 8, 9, 9, 10, 10, 10, 11, 11] as const

/** 子职级施法配置：奥法骑士、诡术师（2014 三分之一施法者，智力施法，已知法术制）。 */
const subclassSpellcasting: Readonly<Record<string, SpellcastingConfig>> = {
  'subclass-2014-fighter-eldritch-knight': {
    ruleset: '5e-2014',
    mode: 'known',
    ability: 'int',
    startsAtLevel: 3,
    cantripsKnownByLevel: THIRD_CASTER_CANTRIPS,
    spellsKnownByLevel: THIRD_CASTER_SPELLS_KNOWN,
    maxSpellLevelByClassLevel: thirdCasterMaximumSpellLevels,
    slotsByClassLevel: THIRD_CASTER_SPELL_SLOTS,
    classSpellIds: wizardSpellIds,
  },
  'subclass-2014-rogue-arcane-trickster': {
    ruleset: '5e-2014',
    mode: 'known',
    ability: 'int',
    startsAtLevel: 3,
    cantripsKnownByLevel: THIRD_CASTER_CANTRIPS,
    spellsKnownByLevel: THIRD_CASTER_SPELLS_KNOWN,
    maxSpellLevelByClassLevel: thirdCasterMaximumSpellLevels,
    slotsByClassLevel: THIRD_CASTER_SPELL_SLOTS,
    classSpellIds: wizardSpellIds,
    requiredCantripSpellIds: ['spell-2014-mage-hand'],
  },
}

export const subclasses2014: readonly SubclassRule[] = Object.entries(entriesByClass).flatMap(([classSlug, entries]) =>
  entries.map(([slug, name, englishName, sourceId, availability]) => {
    const id = `subclass-2014-${classSlug}-${slug}`
    const dmOnly = availability === 'dm-only'
    return {
      id,
      classId: `class-2014-${classSlug}`,
      ruleset: '5e-2014' as const,
      name,
      englishName,
      selectionLevel: selectionLevels[classSlug] ?? 3,
      summary: dmOnly
        ? `${name}是仅供地下城主批准使用的子职业，本项目登记其索引但不开放普通车卡选择。`
        : subclassSummaryOverrides[id] ?? `${name}提供围绕其主题的职业发展路线；当前仅登记选择所需的原创摘要与来源。`,
      status: (() => {
        if (dmOnly) return 'dm-only' as const
        const features = getSubclassFeatures2014(id)
        const missingRequiredChoice = features.some((feature) => feature.requiresChoice && (feature.optionIds?.length ?? 0) === 0)
        if (features.length === 0 || missingRequiredChoice || features.some((feature) => feature.status === 'index-only')) return 'index-only' as const
        if (implementedIds.has(id) && features.every((feature) => feature.status === 'implemented')) return 'implemented' as const
        return 'selectable' as const
      })(),
      availability: dmOnly ? 'dm-only' as const : 'player' as const,
      sourceIds: [sourceId],
      features: getSubclassFeatures2014(id),
      spellcasting: subclassSpellcasting[id],
      alwaysPreparedSpellIdsByLevel: artificerSubclassSpells[id],
      spellbookSpellIds: wizardSubclassSpellbookSpells[id],
    }
  }),
)

export const subclassOptions2014: readonly RuleOption[] = subclasses2014.map((subclass) => ({
  id: subclass.id,
  name: subclass.name,
  englishName: subclass.englishName,
  description: `${subclass.englishName} · ${sourceTitles[subclass.sourceIds[0] ?? ''] ?? '2014 扩展资料'} · ${subclass.summary}`,
  status: subclass.status,
  sourceIds: subclass.sourceIds,
}))

export function getPlayerSubclassIds2014(classId: string): readonly string[] {
  return subclasses2014
    .filter((subclass) => subclass.classId === classId && subclass.availability === 'player')
    .map((subclass) => subclass.id)
}
