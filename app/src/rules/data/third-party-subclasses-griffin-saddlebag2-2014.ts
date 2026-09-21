import type { SubclassFeature, SubclassFeatureKind, SubclassRule } from '@/types/rules'

/** G3-I2：《狮鹫的鞍中珍宝Ⅱ》(The Griffin's Saddlebag Book 2) 第三方子职（2014 口径）。仅登记选择与展示所需元数据与原创中文摘要，效果不进入自动计算。 */

const GRIFFIN = ['tp-griffin-saddlebag2-index'] as const

/** 2014 各职业的子职选择等级。 */
const SELECTION_LEVELS: Readonly<Record<string, number>> = {
  barbarian: 3, bard: 3, cleric: 1, druid: 2, fighter: 3, monk: 3, paladin: 3,
  ranger: 3, rogue: 3, sorcerer: 1, warlock: 1, wizard: 2,
}

interface FeatureSeed {
  readonly slug: string
  readonly name: string
  readonly englishName: string
  readonly level: number
  readonly kind: SubclassFeatureKind
  readonly summary: string
  readonly description: string
}

interface SubclassSeed {
  readonly slug: string
  readonly classSlug: string
  readonly name: string
  readonly englishName: string
  readonly summary: string
  readonly features: readonly FeatureSeed[]
}

const seeds: readonly SubclassSeed[] = [
  // ============ 吟游诗人 bard ============
  {
    slug: 'mercantile',
    classSlug: 'bard',
    name: '交易学院',
    englishName: 'College of Mercantile',
    summary: '出身于商人、走私者与手艺人的吟游诗人学院，精通交易与杀敌的技艺，善于用巧妙的言辞和精明的算计激励盟友、颠覆对手。他们把一枚硬币当作法器与赌注，把诗人激励变成一场掷硬币的博弈，并在讨价还价与消耗品上占尽先机。',
    features: [
      { slug: 'coin-flip', name: '抛出硬币', englishName: 'Coin Flip', level: 3, kind: 'passive', summary: '3级起使用你给予的诗人激励骰的生物可改为抛硬币，正面取满值、反面归DM使用。', description: '3级加入交易学院后，使用你给予的诗人激励骰的生物可放弃掷骰改为抛硬币：正面可把该激励骰视为掷出最大值，反面则由DM取走，DM可用在其选择的其他生物的属性检定、攻击检定或豁免检定上。DM可持有多个此类激励骰，但每次检定只能添加一枚；你完成长休后DM失去全部。' },
      { slug: 'magic-coin', name: '魔法硬币', englishName: 'Magic Coin', level: 3, kind: 'action', summary: '3级起硬币可作吟游诗人法器，并能以动作投掷发动60尺攻击并造成雷鸣伤害。', description: '第3级起，任何至少值1铜币的硬币都可作你施展吟游诗人法术的法器。你还能用一个动作把硬币掷向60尺内的目标，以魅力调整值进行攻击检定，命中造成1点钝击与1d12点雷鸣伤害，硬币随即返回手中（6级2d12、14级3d12）。若对敌对生物的攻击检定掷出20且所用硬币非魔法，它返回时会魔法性地复制出一枚新硬币。' },
      { slug: 'money-talks', name: '钱说了算', englishName: 'Money Talks', level: 6, kind: 'action', summary: '6级起附魔硬币可实现语言互通，议价时游说有优势，还能借硬币远程视听。', description: '第6级起，你能以一个动作替手中的普通硬币附魔，持续10分钟或由你提前结束。持有它且懂至少一门语言的生物能听懂你的话，你也能听懂它的话；与持有或携带该硬币者议价时，你第一次魅力（游说）检定具有优势。你还能以一个动作借硬币看和听直到你下个回合开始，期间本体如同耳聋与目盲。次数等于魅力调整值（至少1次），长休后恢复。' },
      { slug: 'shrewd-consumer', name: '精明买家', englishName: 'Shrewd Consumer', level: 14, kind: 'passive', summary: '14级起材料、药水与卷轴有50%几率不被消耗，并可用附赠动作使用物件或饮用药水。', description: '从14级开始，每当你施展一个消耗材料成分的法术、饮用药水或使用价值不超过500GP的法术卷轴时，都有50%的机会使该材料、药水或卷轴不被消耗。此外，你可以用附赠动作执行「使用物件」动作或饮用药水。' },
    ],
  },

  // ============ 圣武士 paladin ============
  {
    slug: 'curse-drinker',
    classSlug: 'paladin',
    name: '饮咒之誓',
    englishName: 'Oath of the Spelldrinker',
    summary: '以肃清叛道法师、守护无辜者免受邪恶魔法的荼毒为使命的圣武士誓言，坚信凡俗力量与超凡力量之间必须维系平衡。他们遇事常选凡俗手段，却也是典范级的奥术大师：能亮出圣徽吸纳敌方法术化为己用，以灵光扰乱敌方施法者的专注。',
    features: [
      { slug: 'oath-spells', name: '圣誓法术', englishName: 'Oath Spells', level: 3, kind: 'resource', summary: '3级起随圣武士等级获得饮咒之誓的圣誓法术，始终准备且不占准备数量。', description: '立下此誓后，你在相应圣武士等级自动获得下列圣誓法术并始终准备：3级灾祸术、侦测魔法；5级涅斯图魔法灵光、定身类人；9级解除魔法、缓慢术；13级任意门、欧提路克弹力法球；17级支配类人、探知术。这些法术由誓言赋予，不占用你的准备法术数量。' },
      { slug: 'channel-divinity', name: '引导神力', englishName: 'Channel Divinity', level: 3, kind: 'resource', summary: '3级获得两种引导神力：吸收魔法可打断施法换取临时生命，迅捷指令助盟友机动。', description: '第3级时你获得两种引导神力选项，使用时消耗引导神力次数。吸收魔法：你可在看见30尺内生物施法时以反应亮出圣徽打断，若法术环阶不高于1＋圣武士等级÷3（向上取整，至多六环）则法术失败，并获得「魅力调整值＋5×环阶」临时生命值。迅捷指令：以附赠动作令30尺内至多等于魅力调整值名生物用附赠动作疾走或撤离至你下回合开始。' },
      { slug: 'bonus-proficiency', name: '附赠熟练', englishName: 'Bonus Proficiency', level: 3, kind: 'passive', summary: '3级起你获得奥秘技能的熟练项，可用智力检定辨识法术、魔法物品与奥术秘辛。', description: '第3级起，你获得奥秘技能的熟练项，可在涉及法术、魔法物品、奥术符号、秘教仪式与多元宇宙传说等问题上进行智力检定。作为以肃清叛道法师为使命的守护者，这份学识让你更容易看穿敌方法师的来历、手段与法术构成。' },
      { slug: 'aura-of-disruption', name: '乱法灵光', englishName: 'Aura of Disruption', level: 7, kind: 'passive', summary: '7级起10尺灵光迫使敌人过体质豁免以免失去专注，友方不被探知，18级扩至30尺。', description: '第7级起，你身周环绕着对敌方施法者而言极不稳定的奥术能量。每当敌对生物在你10尺内结束回合时，若它正专注于某个法术，必须成功通过一次DC等于你圣武士施法DC的体质豁免，否则失去专注。此外，你与位于你10尺内的友好生物都无法被魔法性的探知传感器感知到。第18级起，灵光的范围扩展至30尺。' },
      { slug: 'armored-focus', name: '铠装心智', englishName: 'Armored Focus', level: 15, kind: 'passive', summary: '15级起你专注于圣武士法术期间，专注不会因受到伤害而终止。', description: '第15级起，当你专注于圣武士法术期间，你的专注不会因受到伤害而终止，因而也无需为此进行维持专注的体质豁免。该保护只适用于圣武士法术，其他来源的法术仍须照常维持专注。' },
      { slug: 'arcane-conduit', name: '奥法挪移', englishName: 'Arcane Conduit', level: 20, kind: 'action', summary: '20级起以动作展开30尺魔法场1分钟，获得法术抗性与豁免优势并波及场内敌友。', description: '第20级起，你能以一个动作创造半径30尺的魔法场，持续1分钟。期间你对法术伤害具有抗性、对抗法术的豁免具有优势；生物用近战攻击命中你时受到等于你魅力调整值（至少1）的力场伤害；你每消耗一环或更高环阶的法术位，场内友方恢复、敌对生物受到等量（魅力调整值，至少1）生命值或力场伤害。用后须完成一次长休才能再次使用。' },
    ],
  },

  // ============ 德鲁伊 druid ============
  {
    slug: 'dragon',
    classSlug: 'druid',
    name: '巨龙结社',
    englishName: 'Circle of Dragons',
    summary: '严守传统、守护自然与龙族遗馈的古老德鲁伊教团，其成员影响着世界的政治、战争与文化，并与贵族王室有着延续数代的隐秘联系。他们像了解野兽与植物一样了解龙和龙族魔法，并借此把自己转变成独特而强大的龙形态。',
    features: [
      { slug: 'draconic-lore', name: '巨龙传说', englishName: 'Draconic Lore', level: 2, kind: 'passive', summary: '2级起会说读写龙语，与龙相关的智力（历史）检定可加熟练加值甚至双倍。', description: '2级起，你能说、读、写龙语。此外，你无论何时进行与龙的历史和传说相关的智力（历史）检定，都可以在检定结果中加入你的熟练加值；若你已经拥有历史技能的熟练项，则改为加入两倍的熟练加值。' },
      { slug: 'dragon-shape', name: '巨龙之姿', englishName: 'Dragon Shape', level: 2, kind: 'bonus-action', summary: '2级起以附赠动作消耗一次荒野变形化作中型龙类，可用啃咬与吐息武器。', description: '第2级起，你可以附赠动作消耗一次荒野变形化为中型龙类，持续德鲁伊等级一半小时数：AC13＋敏捷（上限2）、30尺步行与攀爬，变形时获得等于生命上限的临时生命，失能或归零即恢复。不能施法；每回合可啃咬（1d12＋力量或感知穿刺）或吐息（15尺锥形，敏捷豁免，2d6所选龙种伤害，成功减半，1分钟冷却）。吐息成长：6级3d6／20尺、10级4d6／25尺、14级5d6／30尺。' },
      { slug: 'improved-dragon-shape', name: '强化巨龙之姿', englishName: 'Improve Dragon Shape', level: 6, kind: 'passive', summary: '6级起巨龙之姿AC升至14＋敏捷，新增爪击，攻击动作可得一次啃咬加一次爪击。', description: '到第6级，你的巨龙之姿获得强化：AC变为14＋敏捷（上限＋2）；新增爪击，攻击与伤害可用感知替代力量，命中造成2d6＋力量或感知的挥砍伤害；你在自己回合执行攻击动作时可进行一次啃咬和一次爪击，这些攻击视为魔法攻击；你还获得60尺黑暗视觉（已有则再增加30尺）。' },
      { slug: 'draconic-magic', name: '巨龙魔法', englishName: 'Draconic Magic', level: 10, kind: 'passive', summary: '10级起龙姿下可施放三环以下德鲁伊法术，AC15＋敏捷并获30尺飞行与抗性。', description: '第10级起，你能在巨龙之姿形态下施展特定的德鲁伊法术：这些法术必须是三环及以下、且不需要任何材料成分的德鲁伊法术。同时形态进一步强化：AC变为15＋敏捷调整值（上限＋2），你对该形态所选龙种的伤害类型具有抗性，并获得30尺飞行速度。' },
      { slug: 'heart-of-a-dragon', name: '巨龙之心', englishName: 'Heart of a Dragon', level: 14, kind: 'passive', summary: '14级起即使不化龙也能使用吐息武器，且龙姿的AC、飞行与攻击次数再度提升。', description: '在第14级，即使你不在巨龙之姿形态也能使用吐息武器，但用后须完成一次长休才能再次使用。形态再度强化：AC变为16＋敏捷（上限＋2），飞行速度增至40尺，执行攻击动作时可进行三次攻击（一次啃咬和两次爪击）。变形时你还可以选择成为大型龙类，此时啃咬触及范围由5尺延长至10尺。' },
    ],
  },

  // ============ 战士 fighter ============
  {
    slug: 'steel-falcon',
    classSlug: 'fighter',
    name: '钢隼',
    englishName: 'Steel Hawk',
    summary: '来自天堂草原的强大而灵活的士兵范型，能以爆发性的速度跨越自身与远处威胁之间的遥远距离。他们虽常身着重甲，却像老练的刺客般飞跃出击，把弹跃的冲击力灌入枪骑与近战武器，化身为与称号相称的猛禽。',
    features: [
      { slug: 'launch', name: '跃空', englishName: 'Launch', level: 3, kind: 'bonus-action', summary: '3级起以附赠动作在坚固表面弹射至多15尺且不引发借机攻击，可强化随后的攻击。', description: '3级选择此范型时，你习得以附赠动作强力弹跃：站在坚固表面可水平、垂直或组合弹射至多15尺（7级30尺），速度为0时不能用；不触发借机攻击，随后坠落可少计至多30尺高度。次数3次（7级4次、15级5次），短休或长休恢复。跃空后立刻发动的近战攻击有优势，命中额外造成1d8点同类型伤害（10级1d10、12级1d12）。' },
      { slug: 'nimble-lancer', name: '迅猛枪兵', englishName: 'Nimble Lancer', level: 3, kind: 'passive', summary: '3级起未骑乘时骑枪视为多用武器，命中5尺内目标后可无借机攻击地后撤5尺。', description: '第3级起，你未骑乘坐骑时骑枪视为具有多用词条：单手持握命中造成1d8点穿刺伤害，双手握持造成1d12点；使用跃空特性后立刻以骑枪发动近战攻击时，骑枪视为由你双手握持。若你用骑枪命中5尺范围内的生物，可立即朝远离它的方向移动5尺且不触发其借机攻击，前提是你必须站立并保有剩余移动力。' },
      { slug: 'bird-caller', name: '唤鸟者', englishName: 'Bird Caller', level: 3, kind: 'passive', summary: '3级起可辨认鸟类，与天生飞行速度的野兽互动时驯兽有优势，并能仪式施展动物信使。', description: '同样在第3级，你学会通过叫声来辨认普通的鸟类，并且与任何具有天生飞行速度的野兽互动时，你所进行的感知（驯兽）检定具有优势。此外，你获得施展法术动物信使的能力，但只能用仪式来施展它，且只能以具有天生飞行速度的野兽为目标。' },
      { slug: 'steel-grace', name: '钢铁芭蕾', englishName: 'Steel Grace', level: 7, kind: 'reaction', summary: '7级起穿甲不再使敏捷（隐匿）有劣势，并可用反应跃空替代敏捷豁免。', description: '第7级起，穿戴护甲不会再使你的敏捷（隐匿）检定具有劣势。此外，当你需要进行一次敏捷豁免时，你可以用反应使用你的跃空特性；如此做时，你在豁免成功后不会受到该效应的伤害，豁免失败时也只受到一半伤害。' },
      { slug: 'eagle-eye', name: '鹰眼', englishName: 'Eagle Eye', level: 10, kind: 'passive', summary: '10级起跃空相关攻击掷出19或20即重击，命中飞行生物可令其速度归零。', description: '第10级起，你在跃空后立即发动、或在跃空中发动的攻击会在掷出19或20时造成重击。若该攻击命中一个飞行中的生物，目标须通过一次力量豁免（DC为8＋熟练加值＋力量调整值），否则直到其下个回合开始前移动速度归零。此外，若你尚未拥有察觉熟练则获得之，且你依赖视觉的感知（察觉）检定具有双倍熟练加值。' },
      { slug: 'predatory-instinct', name: '掠食本能', englishName: 'Predatory Instinct', level: 15, kind: 'passive', summary: '15级起先攻掷骰具有优势，且掷先攻时若跃空次数已用尽则立即获得一次。', description: '第15级起，你的先攻掷骰具有优势。此外，当你掷先攻时，若你已经没有剩余的跃空使用次数，你立即获得一次跃空使用次数，使你从战斗一开始就能弹射出击。' },
      { slug: 'improved-launch', name: '进阶跃空', englishName: 'Improved Launch', level: 18, kind: 'passive', summary: '18级起跃空攻击命中可迫使目标过力量豁免否则倒地，并能强化弹射至90尺。', description: '第18级起，你在跃空过程中或跃空后立即发动的近战武器攻击命中生物时，该生物须通过一次力量豁免（DC为8＋熟练＋力量调整值），否则受击倒地。此外，你可以在使用跃空时把自身推至极限：弹射距离上限由30尺提升为90尺，并免坠落伤害；如此使用后须完成短休或长休才能再用，且每次使用积累一级力竭，力竭2级或更多时不能以此法使用。' },
    ],
  },

  // ============ 术士 sorcerer ============
  {
    slug: 'desert-soul',
    classSlug: 'sorcerer',
    name: '荒漠之魂',
    englishName: 'Desert Soul',
    summary: '力量源自世界最严酷荒漠核心中永不停息、惩戒性的魔法，多在肆虐沙暴的混沌中或魔法绿洲的泉水旁觉醒。这股灼热魔力在体内盘旋成永恒的风暴，能把最坚强的敌人也化为砂砾，最终让术士自身化为虚无的沙尘。',
    features: [
      { slug: 'dunetreader', name: '踏沙者', englishName: 'Dunetreader', level: 1, kind: 'passive', summary: '1级起无视沙子造成的困难地形，且无需防护即可承受150华氏度的高温。', description: '从你在第1级选择该起源开始，你可以无视由沙子造成的困难地形，并且在没有任何防护的情况下就能承受高达150华氏度的高温环境。' },
      { slug: 'sandstorm', name: '飞沙走石', englishName: 'Sandstorm', level: 1, kind: 'bonus-action', summary: '1级起施放一环以上法术后可用附赠动作造5尺立方风暴，推开范围内生物并造成伤害。', description: '从1级起，你在自己回合施展1环或更高环阶的法术时，可以用附赠动作在30尺内一个可见位置创造5尺立方风暴。范围内大型或更小生物须过对抗你术士豁免DC的力量豁免：中型或更小体型失败时被你选择的方向推远10尺，大型被推5尺。6级起失败者额外受1d8钝击或火焰伤害（由你选择），14级升至2d8，18级升至3d8。' },
      { slug: 'mirage', name: '海市蜃楼', englishName: 'Mirage', level: 6, kind: 'passive', summary: '6级起学会镜影术且不占已知上限，可花2点术法点或法术位施展并有爆裂反伤。', description: '在第6级时，你学会镜影术；若你已经掌握此法术，则可改为学习另一个你选择的术士法术。此法术不计入你已知术士法术的数量上限，你可以花费2点术法点或消耗一枚法术位来施展它。若你使用术法点施展此法术，任何在你10尺范围内摧毁了法术幻象的生物都会受到等同于你术士等级一半的火焰伤害。' },
      { slug: 'desert-nomad', name: '沙暴行者', englishName: 'Desert Nomad', level: 14, kind: 'passive', summary: '14级起生物被飞沙走石推动后，可花2点术法点传送进风暴空间并隐身至回合结束。', description: '从14级起，你获得穿梭于你所创造旋风核心的能力。当一个生物被你的飞沙走石特性推动后，你可以立即消耗2点术法点传送到风暴所在的空间；若你在一个未占据空间创造风暴，也能用这种方式传送过去。当你以此方式传送时，你和你穿戴或携带的所有装备都将隐形，直到你的回合结束。' },
      { slug: 'sand-form', name: '飞沙形态', englishName: 'Sand Form', level: 18, kind: 'bonus-action', summary: '18级起以附赠动作耗5点术法点化为沙状形态1分钟，免擒抱且可穿缝、穿人。', description: '自18级起，你能以一个附赠动作消耗5点术法点化为沙状形态1分钟，或在失能、死亡或主动解除时提前结束。形态下你不会被擒抱，与随身装备可通过窄至1英寸的空间，能穿过任何生物占据的空间，困难地形也不额外消耗移动力。此外，当一个你能看见的攻击者命中你时，你可以用反应化为散沙，直到该回合结束你对所有伤害（含该次）具有抗性。' },
    ],
  },

  // ============ 武僧 monk ============
  {
    slug: 'wraith',
    classSlug: 'monk',
    name: '虚灵宗',
    englishName: 'Way of the Aether',
    summary: '以太是第五种元素，一切灵魂无论有无生命都包含着它；虚灵宗的武僧把气与以太在体内调和，将灵魂视为身体的延伸。他们的技法又称鬼灵拳法，以青色的灵魂能量远击敌人、超度不肯安息的不死生物，并像幽灵一般在两个位面间穿梭。',
    features: [
      { slug: 'spirit-strike', name: '灵魂打击', englishName: 'Spirit Strike', level: 3, kind: 'passive', summary: '3级起徒手打击可改为30尺灵魂打击，造成力场伤害且6级起可附带震慑拳。', description: '自你达到3级并选择虚灵宗起，你可以散发青色光芒并以灵魂能量攻击：每当你进行徒手打击时，可选择将其变为近战法术攻击。你视为熟练这种攻击方式，攻击范围为30尺，攻击与伤害掷骰加入感知调整值，伤害类型为力场，伤害骰为d4并随武僧等级按「武艺」一栏增大。自6级起，你用灵魂打击命中生物时，可选择在该次攻击中使用震慑拳。' },
      { slug: 'spirit-hand', name: '灵魂之手', englishName: 'Spirit Hand', level: 3, kind: 'passive', summary: '3级起习得法师之手，可用附赠动作施展或操控，且无需言语与姿势成分。', description: '自3级起，你习得戏法法师之手，并且可以用附赠动作施展或控制它；当你施展它时，无需言语与姿势成分。该法术生成的手的外观是你自己手部的一个青色灵体状复制。' },
      { slug: 'spectral-guide', name: '灵界指引', englishName: 'Spectral Guide', level: 6, kind: 'action', summary: '6级起可用动作花2点气施展遗体防腐或识破隐形，并能以疾风连击超度亡灵。', description: '自6级起，你不会被幽影等亡灵附身，并可用动作花2点气施展遗体防腐或识破隐形（无需材料），未掌握维生术则习得之。你还获得超度亡灵：以疾风连击击中亡灵时，可迫使它过一次对抗你气豁免DC的感知豁免，失败则灵魂离体安息，该生物死亡；挑战等级高于阈值的亡灵自动成功，阈值随等级为6级1/2、8级1、11级2、14级3、17级4。' },
      { slug: 'ghost-walker', name: '幽灵行者', englishName: 'Ghost Walker', level: 11, kind: 'bonus-action', summary: '11级起可附赠动作耗1点气隐形，或被命中时以反应减伤等于武僧等级的数值。', description: '自11级起，你能部分进入以太位面。以太步：以附赠动作花1点气隐形直到你下回合结束（攻击或施法时结束），也可在使用飞檐走壁时额外花1点气获得，此时只要保持隐形即可穿过敌对生物或厚度不超过4寸的固体。相位闪避：被攻击命中时可用反应部分进入边界以太，使该次伤害减少你武僧等级点；次数等于感知调整值（至少1次），长休后恢复。' },
      { slug: 'sight-beyond-sight', name: '超越视界', englishName: 'Sight Beyond Sight', level: 17, kind: 'action', summary: '17级起获得60尺真实视觉与心灵感应，并能以动作施展持续1分钟的以太化。', description: '在17级时，你开始能够清楚地看透这个世界，并使用以太与其中的灵魂建立联系：你获得60尺的真实视觉与心灵感应。此外，你可以用一个动作施展法术以太化，以此方式施展时该法术的持续时间为1分钟；当你以此特性施展了该法术，便不能再次使用此特性，直至你完成一次长休。' },
    ],
  },

  // ============ 法师 wizard ============
  {
    slug: 'ancient-wand',
    classSlug: 'wizard',
    name: '远古魔杖学',
    englishName: 'Wand Lore',
    summary: '把简单的棍子变成比刀剑更强大之物的法师传承：对魔杖工艺的丰富历史与传统的研究，让成员深信法师的真正力量要靠正确的工具来放大。他们亲手创造的精髓魔杖会随施法积蓄充能，用于强化检定、防御与输出，后期还能灌注与转化。',
    features: [
      { slug: 'core-wand', name: '精髓魔杖', englishName: 'Core Wand', level: 2, kind: 'resource', summary: '2级起创造专属法器精髓魔杖，随耗环积蓄至多7发充能，可加检定或AC。', description: '自2级起，你创造专属法器「精髓魔杖」，可用附赠动作召至手中，被毁可花8小时重造。魔杖最多有7发充能，每次长休后重置为1发；持握它时你每消耗法术位施展一环或更高环阶法术，即获得该环阶一半（至少1发）的充能。你可消耗任意数量充能提高一次攻击检定或豁免检定（掷d20后、DM宣判前决定），或在即将被命中时以反应获得等量AC。' },
      { slug: 'wand-savant', name: '魔杖学士', englishName: 'Wand Savant', level: 2, kind: 'passive', summary: '2级起可从法杖或魔杖抄录法师法术入书，并让触碰法术改以10尺内可见生物为目标。', description: '自2级起，你可以像其他法师一样解读卷轴和法术书；若你拥有的法杖或魔杖可以施展法师法术列表上的法术，你可以像从卷轴上复制法术一样把该法术复制到你的法术书中。此外，当你手持精髓魔杖施展施法距离为触碰的法师法术时，你可以改为选择一名你能看见、距离你10尺以内且未处于掩护后的生物；在你到达14级后，该距离改为30尺。' },
      { slug: 'arcane-battery', name: '奥术补给', englishName: 'Arcane Battery', level: 6, kind: 'passive', summary: '6级起使用奥术回想可回3发充能，并可耗至多3发充能提高单体法术的豁免DC。', description: '自6级起，当你使用奥术回想时，你的精髓魔杖会恢复3发已消耗的精髓充能。此外，你获得一项使用魔杖精髓能量的新选项：在你持用着精髓魔杖期间，当你施展一个只针对单一生物、且迫使该生物进行豁免检定的法术时，你可以消耗至多3发精髓充能，使本次豁免的DC提升等同于所消耗精髓充能数的数值。' },
      { slug: 'imbue-minor-wand', name: '次级魔杖灌注', englishName: 'Imbue Minor Wand', level: 10, kind: 'choice', summary: '10级起每次长休可把至多智力调整值个低环法术灌注进小物件制成魔杖。', description: '自10级起，每次长休后你可从法术书选至多等于智力调整值（至少1个）个法术，灌注进木棍等物件制成魔杖。所选法术限戏法至二环，施法时间1动作或1附赠动作，不需专注与有价值材料，且戏法无伤害。魔杖有等于智力调整值的充能（至少1发），可施展灌注的戏法（0充能）、一环（1充能）或二环法术（2充能），以你的DC施放，长休后失魔力。' },
      { slug: 'manifest-charges', name: '显化充能', englishName: 'Manifest Charges', level: 14, kind: 'passive', summary: '14级起充能可化为60尺内的力场光粒或减伤屏障，用尽最后一充能也无需掷骰。', description: '自14级起，你可把精髓充能转化为奥术能量，获得两种新用法：以附赠动作耗至少1发充能造出等量光粒，各冲向60尺内一个可见目标，造成「1d4＋智力调整值」点力场伤害；或当你或30尺内一个可见生物受伤时，以反应耗至少1发充能制造屏障，使该次伤害降低充能数的三倍。此外，用尽最后一发充能后无需掷d20，制作魔杖的金钱与时间减半。' },
    ],
  },

  // ============ 游侠 ranger ============
  {
    slug: 'skyroc',
    classSlug: 'ranger',
    name: '天鹏旅人',
    englishName: 'Rocborne',
    summary: '骑乘始祖鹏鸟遨游天空、旅遍世界的游牧者，坚信气与风是数不胜数的精魂在流动与牵引下产生的力量。他们如灵媒师倾听亡者之语般聆听风之语，以此获悉天气与前路的情报，也让风在战斗中修正自己的弹道，最终在身后展开鹏鸟般的灵体双翼。',
    features: [
      { slug: 'rocborne-magic', name: '天鹏旅人魔法', englishName: 'Rocborne Magic', level: 3, kind: 'resource', summary: '3级起随游侠等级习得羽落术、造风术、闪电束、冰风暴与通晓传奇等额外法术。', description: '自3级起，当你在游侠职业上达到特定等级时，你将习得一项额外的法术：3级羽落术、5级造风术、9级闪电束、13级冰风暴、17级通晓传奇。该法术对你而言视为游侠法术，但不会占用你可已知的游侠法术数量。' },
      { slug: 'guiding-wind', name: '指引之风', englishName: 'Guiding Wind', level: 3, kind: 'passive', summary: '3级起每回合可在命中追加1d4同类型伤害，或失手后转向原目标5尺内的另一敌人。', description: '自3级起，你发动攻击时可低语让风指引方向。在你的每个回合中，你从两项增益中选择一次获得：武器攻击命中时目标额外受到1d4点与武器同类型的伤害；或失手时改变轨迹打向另一敌人，新目标须在原目标周围5尺内且仍在武器攻击范围内，攻击检定沿用原结果并加感知调整值（至少+0）。11级起前者提升为1d10，后者范围扩大至15尺。' },
      { slug: 'whispers-of-knowledge', name: '知识之语', englishName: 'Whispers of Knowledge', level: 3, kind: 'action', summary: '3级起可花10分钟向精魂问询，临时获得一项技能或工具熟练，次数等于感知调整值。', description: '同样在3级起，你可以询问随风飘摇的精魂以寻得需要的知识：你用10分钟时间与行过的精魂交谈，让它们为你提供所见所闻，选择一项你还未具备其熟练的技能或工具并获得其熟练。在下一次你完成短休或长休后，这项熟练会消失。你可以使用此特性的次数等同于你的感知调整值（至少1次），完成一次长休时重获全部已消耗的使用。' },
      { slug: 'windswept', name: '行云之风', englishName: 'Windswept', level: 7, kind: 'passive', summary: '7级起步行速度＋5尺，无视强风的移动惩罚与推移，并获得寒冷抗性与高海拔适应。', description: '拜7级所赐，风将为你开辟前路：你的步行速度增加5尺，可以无视强风带来的所有移动惩罚，且若非你自愿，你将无法被强风推动。此外，你具有寒冷伤害的抗性，并且能够适应高海拔环境，包括海拔20000尺的环境。' },
      { slug: 'soar', name: '天鹏之翼', englishName: 'Soar', level: 11, kind: 'bonus-action', summary: '11级起助跑起跳后可以附赠动作展开灵体双翼，获得等于步行速度的飞行速度。', description: '在11级后，当你助跑起跳后，你可以立刻以附赠动作展开双翼：一对如鹏鸟般的灵体翅膀显现在你身后，持续存在至你的下个回合结束，或至你重新落回地上为止。在双翼存在期间，你拥有等同于你步行速度的飞行速度。' },
      { slug: 'hurricane', name: '飓风之护', englishName: 'Hurricane', level: 15, kind: 'reaction', summary: '15级起以反应为自身提供该次伤害抗性，并可震倒15尺内的敌人、顺带飞离30尺。', description: '15级起，你受伤可以用反应为自身提供该次伤害的抗性（坠落伤害则改为免受）。此时你还可选择15尺内任意数量生物各过一次力量豁免（DC为你的游侠豁免DC）：失败者受等于你游侠等级的钝击伤害并倒地，成功则伤害减半且不倒地。你还能让风之精魂立刻带你飞到30尺内一处可见的未占据空间而不引发借机攻击。用后须完成短休或长休才能再用。' },
    ],
  },

  // ============ 游荡者 rogue ============
  {
    slug: 'butcher-doctor',
    classSlug: 'rogue',
    name: '残戮行医',
    englishName: 'Grim Surgeon',
    summary: '对利刃、躯体与鲜血有着独特认知的游荡者范型：正如修补匠熟稔发条与齿轮，他们通晓人体构造的精妙，并以医学知识与诡谲的血魔法肢解敌人、治愈同伴。在动荡的城镇与村落中精于医术者可能遵循此道，也能像操纵木偶般控制他人的身躯。',
    features: [
      { slug: 'medic', name: '医者', englishName: 'Medic', level: 3, kind: 'bonus-action', summary: '3级起获得医药熟练且熟练加值翻倍，可用附赠动作稳定或治疗5尺内的生物。', description: '当你在3级选择此范型时，若你尚未拥有医药技能熟练则立即获得，且你用该技能进行的所有属性检定其熟练加值翻倍。此外，你可以用一个附赠动作魔法性地稳定5尺内一名昏迷生物的伤势；也可以用附赠动作消耗一次医疗包使用次数并将其作用于某生物，使其恢复1d4＋你熟练加值的生命值（同一生物须短休或长休后才能再次以此恢复生命）。' },
      { slug: 'transfusion', name: '汲血', englishName: 'Transfusion', level: 3, kind: 'passive', summary: '3级起对非构装或亡灵造成偷袭时获得等于感知调整值的临时生命，持续到下回合开始。', description: '自3级起，在你的每个回合中，当你对非构装或非亡灵的生物造成偷袭时，你获得等同于你感知调整值的临时生命值（至少为1），这些临时生命值持续至你的下个回合开始。达到13级后，你以此获得的临时生命值等同于你感知调整值的两倍。' },
      { slug: 'field-surgeon', name: '战地医师', englishName: 'Field Surgeon', level: 9, kind: 'passive', summary: '9级起可在短休开始时为触及内的自愿生物治疗，恢复量等于掷出的偷袭骰总值。', description: '自9级起，你的医疗造诣与血魔法让你能通过无痛的外科手段为盟友治疗创伤。此特性必须在短休开始时发动，选择一名你触及范围内自愿的生物：投掷你的偷袭骰并记录结果值，短休结束时该生物恢复等同于偷袭骰总值的生命值。通过此特性恢复过生命值的生物，都必须完成一次长休才能再次从中受益。' },
      { slug: 'toxic-shock', name: '败血休克', englishName: 'Toxic Shock', level: 13, kind: 'passive', summary: '13级起以汲血获得临时生命时，目标速度减10尺且下次攻击或属性检定有劣势。', description: '自13级起，当你通过汲血特性获得临时生命值时，被攻击的目标会被一股病潮侵袭：直到其下个回合结束，目标速度减少10尺，并且在其下个回合结束前进行的下一次攻击检定或属性检定具有劣势。' },
      { slug: 'bloodbound', name: '血盟', englishName: 'Bloodbound', level: 17, kind: 'passive', summary: '17级起偷袭野兽或类人后可迫使其过体质豁免，失败则受支配法术效应1分钟。', description: '自17级起，你能掌控特定生物体内的鲜血：当你对野兽或类人生物造成偷袭伤害后，可以立即迫使该生物进行一次体质豁免，其DC等于8＋你的熟练加值＋你的感知调整值。若豁免失败，该生物将受到支配野兽或支配类人的法术效应影响，持续1分钟或直至你主动终止效应（无需动作）。此特性一经使用，直至完成长休前你都无法再次使用。' },
    ],
  },

  // ============ 牧师 cleric ============
  {
    slug: 'festus',
    classSlug: 'cleric',
    name: '宴饮领域',
    englishName: 'Festus Domain',
    summary: '侍奉达格达、狄俄尼索斯等饮食之神的牧师领域：成员把用餐时间视为一种欢乐的礼拜方式，相信一顿丰盛的大餐足以平息大多数战祸。他们既是技艺娴熟的厨师，能把珍馐美馔的魔力化为治疗、防护与毒素打击，也能让食物与酒饮承载神赐的护佑。',
    features: [
      { slug: 'domain-spells', name: '宴饮领域法术', englishName: 'Festus Domain Spells', level: 1, kind: 'resource', summary: '1级起随牧师等级获得宴饮领域的领域法术，始终准备且不占准备数量。', description: '你将在到达特定牧师等级时，根据宴饮领域法术表习得对应的法术并始终准备：1级神莓术、净化饮食；3级灼热金属、防护毒素；5级造粮术、臭云术；7级枯萎术、操控水体；9级死云术、疫病术。这些法术由领域赋予，不占用你的准备法术数量。' },
      { slug: 'bonus-proficiencies', name: '额外熟练', englishName: 'Bonus Proficiencies', level: 1, kind: 'passive', summary: '1级起获得重甲与军用武器的熟练，以及酿酒工具和厨师工具的熟练项。', description: '自你在第1级选择此领域起，你获得重甲与军用武器的熟练项，同时也获得酿酒工具和厨师工具的熟练项，让你既能身披重甲挥动军用武器，也能亲手酿造酒饮、烹调餐食，以此实践本领域的礼拜方式。' },
      { slug: 'table-turner', name: '止杓献杯', englishName: 'Table-Turner', level: 1, kind: 'reaction', summary: '1级起被5尺内生物命中时可用反应迫使其过体质豁免，失败则中毒并受伤。', description: '自1级起，当一个位于你5尺内且你能看见的生物发动攻击并命中你时，你可以用反应迫使它进行一次对抗你牧师法术豁免DC的体质豁免。失败则它受到1d12点毒素伤害并陷入中毒，持续到其下个回合结束；成功则只受一半毒素伤害且不会中毒。使用次数等于你的感知调整值（至少1次），完成一次长休后全部恢复。' },
      { slug: 'create-healing-draft', name: '引导神力：制造疗愈原浆', englishName: 'Create Healing Draft', level: 2, kind: 'action', summary: '2级起可用引导神力以动作造出疗愈原浆，饮下者以附赠动作恢复2d6＋牧师等级生命。', description: '自2级起，你可以用一个动作消耗引导神力次数，制造出一小杯名为「疗愈原浆」的魔法药水，以小玻璃瓶的形式出现在你手中或脚边（由你决定）。任何生物都可以用一个附赠动作喝下一剂，为自己恢复「2d6＋你的牧师等级」点生命值。你完成一次短休或长休时，以此法创造的玻璃瓶及其中未喝下的原浆都会化作粉尘消失。' },
      { slug: 'strong-stomach', name: '饮啖兼人', englishName: 'Strong Stomach', level: 6, kind: 'passive', summary: '6级起抗毒豁免有优势且具强酸、毒素抗性，可把造粮术的水变成酒并压制醉酒中毒。', description: '自6级起，你抵抗毒药或避免中毒的豁免具有优势，且对强酸与毒素伤害具有抗性。此外，每当你施展造粮术，都能创造更美味的食物与饮料，可把该法术创造的至多5加仑水转化为麦芽酒或果酒，并决定其外观与口味。最后，若你处于醉酒或中毒状态，你可以用一个动作魔法性地压制这些效果1分钟；一旦使用，须完成一次长休才能再次使用。' },
      { slug: 'divine-strike', name: '神圣打击', englishName: 'Divine Strike', level: 8, kind: 'passive', summary: '8级起每回合一次武器命中可额外造成1d8强酸或毒素伤害，14级起提升为2d8。', description: '自8级起，你可以向你的武器中灌注神圣能量：在你的每回合内限一次，当你以一次武器攻击命中一个生物时，你可以令本次攻击额外造成1d8点强酸或毒素伤害（由你选择）。自14级起，该伤害提升至2d8。' },
      { slug: 'invigorating-feast', name: '餍口嘉肴', englishName: 'Invigorating Feast', level: 17, kind: 'action', summary: '17级起用餐前祈祷可保护一餐，食后获2d6＋10临时生命并免疫魅惑与魔法睡眠。', description: '自17级起，你可以在用餐前念诵一段特殊祷言，为距你30尺以内任意数量的食物施加保护性魔法。其后10分钟内吃过这些食物的生物获得2d6＋10点临时生命值，且不会被魅惑，也不会因魔法效应入睡；这些增益自10分钟结束时起持续8小时。只有你以及至多六名由你选择的自愿生物能靠这一餐获得增益。用后须完成一次长休才能再次使用。' },
    ],
  },

  // ============ 魔契师 warlock ============
  {
    slug: 'many-headed',
    classSlug: 'warlock',
    name: '众首',
    englishName: 'The Many',
    summary: '宗主是一位由众多头颅组成的强大存在：有的如多头蛇般具有再生之力，有的如美杜莎般拥有石化凝视，或以集群与蜂群意识的形式存在。缔约者可驱使自肩上生出的魔能之首换取伤害、威吓优势与死亡豁免，也能让众首撕裂现实发出狂啸。',
    features: [
      { slug: 'expanded-spell-list', name: '扩展法术列表', englishName: 'Expanded Spell List', level: 1, kind: 'resource', summary: '1级起众首宗主把纠缠术、魔法飞弹等法术加入你的魔契师法术列表供选择。', description: '学习魔契师法术时，你的众首宗主赐予你将以下列表加入魔契师法术列表进行选择的权力：一环纠缠术、魔法飞弹；二环灼热射线、识破隐形；三环闪现术、回避侦测；四环秘法眼、艾伐黑触手；五环假象术、拉瑞心灵联结。这些法术随你可用法术环阶的提升逐步进入可选范围。' },
      { slug: 'eldritch-heads', name: '魔能众首', englishName: 'Eldritch Heads', level: 1, kind: 'resource', summary: '1级起获得等于熟练加值的魔能之首，可消耗以增伤、威吓取优或转化死亡豁免。', description: '1级时你获得等于熟练加值的魔能之首，它们从你肩上生出，只有你与真实视觉者能看到。消耗一个众首可选择：每回合一次，令一次攻击命中额外造成1＋熟练加值的心灵伤害；令一次魅力（威吓）检定具有优势；把一次死亡豁免失败转为成功。长休后你恢复所有已消耗的众首；你还能以附赠动作祈求宗主恢复两个已消耗的众首，用后须完成长休才能再用。' },
      { slug: 'guarded', name: '众目守护', englishName: 'Guarded', level: 1, kind: 'passive', summary: '1级起只要还有至少一个魔能之首，你就不会被突袭，他人的身旁盟友优势也失效。', description: '从1级起，只要你还有至少一个魔能之首存在，你就不会被突袭。此外，若有生物因其盟友位于你身边5尺内而对你的攻击检定具有优势，该攻击检定将不再具有优势。' },
      { slug: 'improved-eldritch-heads', name: '众首精通', englishName: 'Improved Eldritch Heads', level: 6, kind: 'passive', summary: '6级起魔能之首可换2d6＋魅力的临时生命、一次额外反应，或重骰失败的豁免。', description: '6级时你掌握更多运用魔能之首的方式：你可以用附赠动作消耗一个众首并将其重新吸收，获得等同于2d6＋你魅力调整值的临时生命值；每回合一次，即使你已使用过反应也可消耗一个众首获得一次额外反应，但不能与正常反应同回合使用；当你为抵抗魔法造成的魅惑、恐慌或睡眠所做的豁免失败时，可以消耗一个众首重骰该豁免并采用新结果。' },
      { slug: 'groupthink', name: '众智同心', englishName: 'Groupthink', level: 10, kind: 'passive', summary: '10级起智力检定、感知（察觉）检定与智力豁免获得等于熟练加值一半的加值。', description: '从10级起，你的魔能之首始终支持着你的凡躯与凡智：你的智力检定、感知（察觉）检定和智力豁免获得等同于你熟练加值一半的加值。' },
      { slug: 'eldritch-frenzy', name: '众首狂啸', englishName: 'Eldritch Frenzy', level: 14, kind: 'action', summary: '14级起以动作恢复全部众首，并令60尺内等量生物过智力豁免，失败受4d8并失能。', description: '14级起，你可以用一个动作使已消耗的魔能之首在狂乱中复苏并恢复全部众首；它们在狂乱中对所有人可见，咆哮可传至300尺。你可选择距你60尺内至多等于此次恢复数量的生物，各进行一次对抗你魔契师法术豁免DC的智力豁免：失败者受4d8点心灵伤害并失能直到你下回合结束，成功则伤害减半且不失能。用后须完成长休才能再次使用。' },
    ],
  },

  // ============ 野蛮人 barbarian ============
  {
    slug: 'infernal',
    classSlug: 'barbarian',
    name: '炼狱道途',
    englishName: 'Path of the Infernal',
    summary: '比物质位面中任何事物都更可怕的力量来源：怒火燃烧自地狱本身，每次进入狂暴都会以一连串邪魔转变和火焰显现出来。这份力量可能来自瞥见下层位面的濒死经历、与强大魔鬼的灵魂束缚契约，或提夫林体内的地狱血脉。',
    features: [
      { slug: 'hellfire-claw', name: '狱火利爪', englishName: 'Hellfire Claw', level: 3, kind: 'passive', summary: '3级起狂暴时一手化为火焰利爪，每回合首次以火焰武器命中额外造成1d6火焰伤害。', description: '3级选择此道途起，你进入狂暴时一只手会变成巨大的火焰利爪。若用它持有武器，火焰会无害地包裹它，被这把武器每回合首次命中的目标额外受1d6点火焰伤害（6级1d8、10级1d10、14级1d12）。若该回合未以武器攻击造成此伤害，你可以用附赠动作在利爪不持物时发动徒手打击，造成钝击或挥砍伤害（你选择）与额外1d6火焰伤害。' },
      { slug: 'hellborn', name: '地狱之子', englishName: 'Hellborn', level: 3, kind: 'passive', summary: '3级起学会深渊语或炼狱语，与邪魔互动时威吓与游说可加力量调整值，10级起不限。', description: '第3级时，你学会说、读、写深渊语或炼狱语（由你选择）。此外，当你与邪魔互动时，你可以将你的力量调整值加入到所进行的任何魅力（威吓）或魅力（游说）检定中。当你在此职业达到10级时，你可以在与任何生物互动时都把力量调整值加入到任何魅力（威吓）检定中，而不再仅限于邪魔。' },
      { slug: 'infernal-warrior', name: '炼狱战士', englishName: 'Infernal Warrior', level: 6, kind: 'passive', summary: '6级起获得火焰伤害抗性，狂暴中擒抱成功可立即并每回合重复造成利爪火焰伤害。', description: '第6级时，你体内的地狱火即使在非狂暴状态下也依然炽热，你获得对火焰伤害的抗性。此外，当你在狂暴状态下使用攻击动作对生物进行擒抱时，如果你的擒抱检定成功，目标会立即受到你的狱火利爪的火焰伤害，并且只要该生物保持受擒状态，在其每次回合结束时都会再次受到该伤害。' },
      { slug: 'planar-conspirator', name: '异界密谋者', englishName: 'Planar Conspirator', level: 10, kind: 'action', summary: '10级起可以动作消耗2个生命骰（不回复生命）施展侦测思想，DC以体质结算。', description: '第10级时，你可以与某个感兴趣的大邪魔或类似的强大存在达成小交易，以窥探其他生物的内心并利用他们的恐惧：你可以用一个动作消耗2个生命骰（不回复任何生命值）来施展法术侦测思想。该法术的豁免DC等于8＋你的熟练加值＋你的体质调整值。' },
      { slug: 'incinerating-wrath', name: '焚烧怒火', englishName: 'Incinerating Wrath', level: 14, kind: 'reaction', summary: '14级起狂暴中受伤时可用反应以3环炼狱叱喝反击，每次狂暴可用两次。', description: '从14级开始，当你在狂暴状态下受到来自一个60尺内你能看见的生物的伤害时，你可以用反应从你的利爪中释放惩罚之火向它袭去，模仿法术炼狱叱喝的效果（3环版本，豁免DC为8＋你的熟练加值＋你的体质调整值）。每次狂暴期间你可以使用此能力两次。' },
    ],
  },
]

export const griffinSaddlebag2Subclasses2014: readonly SubclassRule[] = seeds.map((seed) => {
  const id = `subclass-2014-tp-gsb2-${seed.classSlug}-${seed.slug}`
  const features: readonly SubclassFeature[] = seed.features.map((feature) => ({
    id: `tp-gsb2-${seed.classSlug}-${seed.slug}-${feature.slug}`,
    subclassId: id,
    name: feature.name,
    englishName: feature.englishName,
    level: feature.level,
    summary: feature.summary,
    description: feature.description,
    kind: feature.kind,
    status: 'selectable',
    sourceIds: GRIFFIN,
  }))
  return {
    id,
    classId: `class-2014-${seed.classSlug}`,
    ruleset: '5e-2014',
    name: seed.name,
    englishName: seed.englishName,
    selectionLevel: SELECTION_LEVELS[seed.classSlug] ?? 3,
    summary: seed.summary,
    status: 'selectable',
    availability: 'player',
    sourceIds: GRIFFIN,
    features,
  }
})
