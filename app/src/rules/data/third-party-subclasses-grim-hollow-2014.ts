import type { SubclassFeature, SubclassFeatureKind, SubclassRule } from '@/types/rules'

/**
 * G3-I2：《鬼魅幽谷》(Grim Hollow) 玩家包第三方子职（2014 口径，6 条）。
 * 仅登记选择与展示所需元数据与原创中文摘要，效果不进入自动计算；
 * 来源 `tp-grim-hollow-index` 为第三方合作内容，默认关闭、需 DM 同意。
 *
 * 本书《玩家指南》的怪物猎人职业及其 4 个狩猎公会依附项目未支持职业，不在本模块登记。
 */

const GRIM_HOLLOW = ['tp-grim-hollow-index'] as const

/** 2014 各职业的子职选择等级。 */
const SELECTION_LEVELS: Readonly<Record<string, number>> = {
  barbarian: 3, bard: 3, cleric: 1, druid: 2, fighter: 3, monk: 3,
  paladin: 3, ranger: 3, rogue: 3, sorcerer: 1, warlock: 1, wizard: 2,
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
    slug: 'requiem',
    classSlug: 'bard',
    name: '安魂学院',
    englishName: 'College of Requiems',
    summary: '把死灵魔法编进曲目的吟游学院：不和谐的和弦与异常反调汇成唤醒骸骨的乐章，诗人借此操控并强化自己的亡灵大军。学院以诗人激励骰为纽带，既能让持骰者引爆暗蚀伤害或强行吊住性命，也能把激励骰分发给受你操控的亡灵。适合偏好召唤亡灵与黑暗支援风格的吟游诗人。',
    features: [
      { slug: 'chilling-melody', name: '寒颤旋律', englishName: 'Chilling Melody', level: 3, kind: 'passive', summary: '3级起从任意法术列表习得两个死灵学派戏法，视为诗人戏法且不占已知数量。', description: '第3级时，你从任意职业的法术列表中挑选两个死灵学派戏法习得：它们对你而言视为吟游诗人戏法，但不计入你已知的戏法总数。这两个戏法按通常规则施展，不额外消耗动作或资源，也不影响你此后以其他方式获得的戏法。' },
      { slug: 'pluck-the-heartstrings', name: '拨动心弦', englishName: 'Pluck the Heartstrings', level: 3, kind: 'passive', summary: '3级起持你激励骰者造成伤害时可耗骰追加暗蚀伤害，或在濒死时耗骰保命。', description: '自3级起，你获得用诗人激励拨动他人生命之弦的能力。持有你诗人激励骰的生物以武器攻击造成伤害时，可选择消耗并投掷这枚骰子，对攻击目标造成等于骰值的暗蚀伤害。此外，当一名持有你激励骰的活体生物生命值被降至0时，它可以用反应消耗这颗骰子，改为把生命值降至1点。两种用法均由持骰者自行决定，不需要你消耗动作。' },
      { slug: 'stir-the-bones', name: '唤醒骸骨', englishName: 'Stir the Bones', level: 6, kind: 'bonus-action', summary: '6级起习得活化死尸，授激励骰时可给60尺内至多熟练加值个亡灵各一枚挽歌骰。', description: '第6级起你习得法术活化死尸，它对你视为吟游诗人法术且不占已知数量。当你给予某生物诗人激励骰时，可同时挑选60尺内至多等于熟练加值个受你操控的亡灵，各给予一枚挽歌骰：用法同诗人激励骰，10分钟内未消耗即消失，若用于攻击检定并命中，还能把骰值加入该次伤害。你也能以同一附赠动作向所有受控亡灵下达精神指令。' },
      { slug: 'dance-of-the-dead', name: '灭亡之舞', englishName: 'Dance of the Dead', level: 14, kind: 'passive', summary: '14级起只以单一生物为目标的死灵法术可多指定一个目标，用后需短休或长休。', description: '自14级起，当你施展一道仅选择单一生物为目标的死灵学派法术时，你可以为它在施法距离内额外指定一个生物作为目标，此效果不消耗额外的法术成分。此特性一经使用，直至你完成一次短休或长休前都无法再次使用。' },
    ],
  },

  // ============ 圣武士 paladin ============
  {
    slug: 'zeal',
    classSlug: 'paladin',
    name: '狂热之誓',
    englishName: 'Oath of Zeal',
    summary: '由仇恨与宗教裁判驱动的誓言：立誓者不惜一切代价清除世上的危险分子与异端，为此摒弃同情与荣誉。子职以引导神力标记异端、洞悉堕落，用明晰灵光让同伴免于目盲与隐形的庇护，最终以天启般的威压审判敌人。',
    features: [
      { slug: 'oath-spells', name: '圣誓法术', englishName: 'Oath Spells', level: 3, kind: 'resource', summary: '3级起随圣武士等级获得狂热之誓的圣誓法术，始终准备且不占准备数量。', description: '立下此誓后，你在相应圣武士等级自动获得下列圣誓法术并始终准备：3级侦测善恶、猎人印记；5级侦测思想、敲击术；9级恐惧术、巧言术；13级预言术、生物定位术；17级疫病虫群、探知。这些法术由誓言固定授予，随等级提升逐步可用，且不占用你的准备法术数量。' },
      { slug: 'channel-divinity', name: '引导神力', englishName: 'Channel Divinity', level: 3, kind: 'resource', summary: '3级获得两种引导神力：附赠动作标记敌人，或短时间强化调查、洞悉与察觉。', description: '第3级选择本誓言时，你获得两种引导神力选项，使用时消耗引导神力次数。异端标记用一个附赠动作指定30尺内可见生物，1分钟内你对其发动武器攻击掷出19或20即造成重击，其回合开始时你还可用反应发动一次武器攻击；判罪之瞳同样用附赠动作，使你在10分钟内的智力（调查）、感知（洞悉）与感知（察觉）检定具有优势且不会被突袭。' },
      { slug: 'aura-of-clarity', name: '明晰灵光', englishName: 'Aura of Clarity', level: 7, kind: 'passive', summary: '7级起10尺灵光内你与友方免疫目盲，指定的生物与物件无法隐形，18级扩至30尺。', description: '第7级起，你与友方生物在你身边10尺内不会被目盲，提供该增益时你必须保持意识清醒。此外，由你选择的生物与物件处于灵光范围内时无法从隐形中获益。自第18级起，灵光的作用范围扩展至30尺。' },
      { slug: 'compel-confession', name: '强制告罪', englishName: 'Compel Confession', level: 15, kind: 'passive', summary: '15级起可无需法术位施展诚实之域，区域内豁免成功者每回合开始受1d4心灵伤害。', description: '第15级起，你可以不消耗法术位地施展诚实之域。以此特性施展该法术时，豁免成功的生物只要在受影响区域内开始其回合，就会受到1d4点心灵伤害。此特性不限使用次数，也不额外消耗动作；施展所需的施法时间、距离与持续时间按法术本身处理。' },
      { slug: 'apocalyptic-revelation', name: '末世天启', englishName: 'Apocalyptic Revelation', level: 20, kind: 'action', summary: '20级起以动作揭露敌人本性1分钟：120尺真实视觉、近身者可目盲、附赠标记弱点。', description: '第20级时，你能以一个动作揭露敌人的真实本性，持续1分钟：获得120尺真实视觉；生物进入你5尺内或在该区域内开始其回合时，你可迫使其进行一次对抗你法术豁免DC的体质豁免，失败则目盲至其下回合开始；每个你的回合你还能以附赠动作指定60尺内一名生物，直至你下个回合开始前对它发动的攻击检定具有优势。使用后须完成一次长休。' },
    ],
  },

  // ============ 战士 fighter ============
  {
    slug: 'breaker',
    classSlug: 'fighter',
    name: '破锋者',
    englishName: 'Blade Breaker',
    summary: '效仿破锋者传奇的战士立志成为变革的化身，以军争魔法把剑刃与战士之魂投射于现实之上。他们固执而好斗，宁可重塑世界也不肯向生活低头。子职围绕战技点与破锋架势展开，既能摧毁敌人的兵器与甲胄，也能以意志、潜能与伤后清明压倒对手。',
    features: [
      { slug: 'martial-maneuvers', name: '传承战技', englishName: 'Martial Maneuvers', level: 3, kind: 'choice', summary: '3级起自选三种破锋战技并获得战技点，5、9、13、17级各再学一种并替换旧战技。', description: '3级起你习得武技传承：从破锋战技列表自选三种战技（如绝意角竞、无血无痕、弧钢一闪、碎甲勇击、破锋强击等），5、9、13、17级各再学一种并可替换一种已知战技。施展战技消耗战技点，点数随战士等级递增（3级6点、20级40点），每回合只能使用一项战技，长休后全部恢复；豁免DC＝8＋熟练加值＋力量或敏捷调整值（由你选择）。' },
      { slug: 'stance-of-the-blade-breaker', name: '破锋架势', englishName: 'Stance of The Blade Breaker', level: 3, kind: 'choice', summary: '3级起自选一种架势，7、10、15级各再加一种，先攻时可摆出或以附赠动作切换。', description: '第3级起从架势列表自选一种姿势，7、10、15级各再获得一种；先攻时可摆出，或以附赠动作切换。精钢沉牛：以反应推开近战攻击者5尺（18级10尺）；铁血刑者：你的近战与对你的攻击均有优势（18级后近战额外2d6伤害）；铁铸长蛇：你的回合内触及+5尺（18级后不限回合）；轻灵秘银：敏捷豁免有优势（18级后可附赠回避）。' },
      { slug: 'unyielding-determination', name: '不毁决意', englishName: 'Unyielding Determination', level: 7, kind: 'passive', summary: '7级起在你的回合内进行的所有豁免检定具有优势。', description: '第7级起，不可撼动的意志让你能够跨越任何困难险阻：在你的回合中，你的豁免检定具有优势。该增益随回合自动生效，不需要动作，也不消耗战技点或其他资源。' },
      { slug: 'breaker-of-minds', name: '其上攻心', englishName: 'Breaker of Minds', level: 10, kind: 'bonus-action', summary: '10级起擒抱生物时可用附赠动作消耗至多3点战技点，每点造成1d6心灵伤害。', description: '第10级起，你摧毁兵器与甲胄的能力延伸到敌人的意志上：如果你正擒抱着一个生物，你可以用一个附赠动作消耗至多3点战技点；每消耗1点战技点，被擒抱者便受到1d6点心灵伤害。消耗的战技点照常从池中扣除，完成长休后恢复。' },
      { slug: 'adrenaline-rush', name: '潜能爆发', englishName: 'Adrenaline Rush', level: 15, kind: 'passive', summary: '15级起每当你使用回气，同时回复等于战士等级一半的战技点。', description: '第15级起，战斗的快感会在你体内引起魔法性的共鸣：每当你使用回气特性时，你同时回复等于你战士等级一半（向下取整）的战技点。该回复不需要额外动作，也不会让你在同一回合内突破每回合只用一项战技的限制。' },
      { slug: 'blooded-clarity', name: '血澄丹府', englishName: 'Blooded Clarity', level: 18, kind: 'passive', summary: '18级起生命值不足上限一半时，每回合首次攻击或豁免检定加d10，战技少耗1点。', description: '第18级起，负伤会增强你的感官并让你更加专注：当你的生命值低于生命值上限的一半时，你每个回合进行的第一次攻击检定或豁免检定获得d10加值；同时，你使用战技消耗战技点时会少消耗1点（至多减为1点）。' },
    ],
  },

  // ============ 游荡者 rogue ============
  {
    slug: 'doom-bringer',
    classSlug: 'rogue',
    name: '厄运使者',
    englishName: 'Misfortune Bringer',
    summary: '把不法嗜好与诅咒天赋结合的游荡者，其力量或来自鬼婆血统，或来自在妖精之间度过的时光，也可能学自乡野法师的血脉。他们以邪眼标记猎物，再用各式厄运让目标在关键时刻失手、失血或失能，甚至把敌人的好运直接夺走。许多厄运使者的双眼颜色截然不同，诅咒时只用其中一只注视目标。',
    features: [
      { slug: 'evil-eye', name: '邪眼', englishName: 'Evil Eye', level: 3, kind: 'bonus-action', summary: '3级起以附赠动作标记60尺内可见生物，1分钟内即便无优势也能对其偷袭。', description: '从3级获得这一范型起，你获得以注视施咒的能力：在你的回合内以一个附赠动作选择60尺内你能看见的一个生物，目标必须成功通过对抗你厄运豁免DC的魅力豁免，否则被你的邪眼标记。被标记期间，即使你对其攻击时不具有优势，你也能对它使用偷袭，但当你对它的攻击具有劣势时无法如此。标记持续1分钟，或直到你标记另一个生物为止。' },
      { slug: 'misfortunist', name: '厄运', englishName: 'Misfortunist', level: 3, kind: 'choice', summary: '3级起自选两种厄运并获得3点灾厄点，9、13、17级各再学一种，短休或长休恢复。', description: '3级起你学会为被邪眼标记的生物带来厄运：从厄运列表中自选两种（如衰弱、命定、无能、灾疫、惑心、恐惧、重伤、笨拙、丧感、困倦、不幸等诅咒，消耗1至3点灾厄点），9、13、17级各再学一种，长休时可将一种厄运换成另一种。你拥有3点灾厄点，13级时额外获得2点，消耗后须短休或长休恢复；厄运豁免DC＝8＋熟练加值＋魅力调整值。' },
      { slug: 'steal-luck', name: '偷窃幸运', englishName: 'Steal Luck', level: 9, kind: 'reaction', summary: '9级起以反应消去30尺内生物掷骰的优势并回复1点灾厄点，每休一次；17级3次。', description: '9级起，当30尺内一个你可见的生物进行具有优势的属性检定、攻击检定或豁免检定时，你可以使用反应从这次掷骰中消去优势；若你如此做，你恢复一个已消耗的灾厄点。此特性一经使用，直至你完成一次短休或长休前都无法再次使用；17级起你可以使用该特性3次，完成短休或长休后获得全部使用次数。' },
      { slug: 'curse-caster', name: '诅咒使者', englishName: 'Curse Caster', level: 13, kind: 'action', summary: '13级起可以动作消耗3点灾厄点施展降咒，以魅力为施法关键属性。', description: '13级起，你可以用一个动作消耗3点灾厄点施展法术降咒，魅力是你施展该法术的施法关键属性；豁免DC按你的厄运豁免DC计算（8＋熟练加值＋魅力调整值），施法时间、距离与持续时间按法术本身处理。消耗的灾厄点照常扣除，完成短休或长休后恢复。' },
    ],
  },

  // ============ 牧师 cleric：审判领域（资料为旧版口径） ============
  {
    slug: 'inquisition',
    classSlug: 'cleric',
    name: '审判领域',
    englishName: 'Inquisition Domain',
    summary: '体现多元宇宙秩序力量与邪恶魔法对抗的领域：只有神的意志才是纯粹而正义的，因此使用魔法的凡人理应受到控制。该领域的牧师多为狂热分子，致力于根除不可控的施法者。子职以军用武器与重甲、反制施法的打击和守护同伴的术法护盾为核心；资料页标题标注为「旧版」，本模块按该旧版口径登记。',
    features: [
      { slug: 'domain-spells', name: '审判领域法术', englishName: 'Domain Spells', level: 1, kind: 'resource', summary: '1级起随牧师等级获得审判领域法术，始终准备且不占每日准备数量。', description: '1级起，你获得一批始终准备的审判领域法术，且不占据你每日可以准备的法术数量：1级侦测魔法、鉴定术；3级识破隐形、沉默术；5级解除魔法、移除诅咒；7级秘法眼、生物定位术；9级造物术、圣居。它们随牧师等级提升逐步获得，无需额外选择。' },
      { slug: 'bonus-proficiencies', name: '额外熟练', englishName: 'Bonus Proficiencies', level: 1, kind: 'passive', summary: '1级起获得军用武器与重甲的熟练，可披挂重甲并以军用武器作战。', description: '第1级起，你获得军用武器和重甲的熟练：你能使用各类军用武器作战，也能穿着重甲而不受非熟练带来的惩罚。这是常驻收益，不需要选择，也不消耗任何资源。' },
      { slug: 'witch-hunters-strike', name: '猎巫打击', englishName: "Witch Hunter's Strike", level: 1, kind: 'passive', summary: '1级起武器命中可追加1d8力场伤害，对专注目标为2d8，次数等于感知调整值。', description: '第1级起，当你用武器命中一个生物时，你可以对其额外造成1d8点力场伤害；若该生物正处于法术专注，则改为造成2d8点力场伤害。若它因此次攻击失去专注，你获得等于所造成力场伤害的临时生命值。使用次数等于你的感知调整值（至少一次），完成长休后全部恢复；14级起基础伤害提升为2d8，对专注目标为3d8。' },
      { slug: 'spell-shield', name: '引导神力：术法护盾', englishName: 'Spell Shield', level: 2, kind: 'resource', summary: '2级起用引导神力以附赠动作给30尺内一名生物临时生命、法术抗性与豁免优势。', description: '第2级起，你能以引导神力赋予队友抵御奥术伤害的能力：以一个附赠动作展示你的圣徽，选择一名30尺内的生物（可以是你自己），该生物获得1d10＋你牧师等级的临时生命值。拥有这些临时生命值期间，它具有对法术伤害的抗性，并且在对抗法术与其他魔法效应时进行的豁免检定具有优势。1小时后，它会失去剩余的临时生命值。' },
      { slug: 'rebuke-invoker', name: '审判官', englishName: 'Rebuke Invoker', level: 6, kind: 'reaction', summary: '6级起以反应反制60尺内施法者，体质豁免失败按其法术环阶×d8＋感知受创。', description: '第6级起，当60尺内有生物施展一道法术时，你可以用一个反应迫使该目标进行一次体质豁免：失败则受到（法术环阶）×d8＋你感知调整值的力场伤害，成功则伤害减半；戏法被视作一环法术，即造成1d8。使用次数等于你的感知调整值（至少一次），完成长休后全部恢复。' },
      { slug: 'divine-strike', name: '神圣打击', englishName: 'Divine Strike', level: 8, kind: 'passive', summary: '8级起每回合一次武器命中额外造成1d8力场伤害，14级起提升为2d8。', description: '第8级起，你获得为武器注入秩序神力的能力：每个你的回合一次，当你以武器攻击命中一名生物时，额外造成1d8点力场伤害。该加值不需要动作，也不消耗资源；自14级起，这份额外伤害提升为2d8。' },
      { slug: 'supernal-safeguard', name: '神之守护', englishName: 'Supernal Safeguard', level: 17, kind: 'passive', summary: '17级起使用术法护盾时可改为选择至多等于感知调整值名生物（至少2名）。', description: '第17级起，你使用术法护盾时可以改为选择至多等于你感知调整值数量的生物（至少2名），而非原本的一名生物；每名被选中的生物各自获得相应的临时生命值、法术伤害抗性与对抗魔法效应的豁免优势。该强化不需要额外的引导神力次数，也不额外消耗动作。' },
    ],
  },

  // ============ 野蛮人 barbarian ============
  {
    slug: 'carrion',
    classSlug: 'barbarian',
    name: '腐鸦道途',
    englishName: 'Path of the Carrion Raven',
    summary: '支配着一只浑身是血、能言人语的渡鸦精魄的野蛮人，追随腐鸟弑杀棱彩古龙的古老传说。他们更愿意与野兽为伍，并从渡鸦不惜一切追逐力量与生存的哲学中领悟最高的荣耀。子职以战技点驱使自然之力，让狂暴中的野蛮人获得禽兽般的速度、感官与凶性。',
    features: [
      { slug: 'martial-maneuvers', name: '传承战技', englishName: 'Martial Maneuvers', level: 3, kind: 'choice', summary: '3级起自选三种腐鸦战技并获得战技点，6、10、13级各再学一种并替换旧战技。', description: '3级起你习得武技传承：从腐鸦战技列表自选三种战技（如鹰击长空、蛮野狂击、集群领袖、血猎犬嗅、狩心怒嚎、蝾螈再生、巨兽之形等），6、10、13级各再学一种并可替换一种已知战技。施展战技消耗战技点，点数随野蛮人等级递增（3级6点、20级40点），每回合只能使用一项战技，长休后全部恢复；豁免DC＝8＋熟练加值＋体质调整值。' },
      { slug: 'feral-celerity', name: '荒野神速', englishName: 'Feral Celerity', level: 3, kind: 'bonus-action', summary: '3级起作为进入狂暴的附赠动作的一部分可发动一次武器攻击，狂暴中也能专注战技。', description: '3级起，狂暴赋予你动物般的行动速度：作为进入狂暴的附赠动作的一部分，你能够发动一次武器攻击。此外，你获得即使在狂暴期间也可以专注于战技的能力；但你仍无法在狂暴期间维持对法术的专注。' },
      { slug: 'ravens-spirit', name: '鸦之魂', englishName: "Raven's Spirit", level: 6, kind: 'passive', summary: '6级起获得驯兽熟练（已熟练则改选运动、自然或求生），并能以仪式施展动物交谈。', description: '6级起，你与渡鸦精魄的联结让你更懂得与野兽相处：你获得驯兽技能的熟练；若你已熟练于该技能，则改为从运动、自然或求生中选择一项获得熟练。此外，你能够以仪式方式施展法术动物交谈，无需消耗法术位。' },
      { slug: 'ferocious-rage', name: '凶残狂暴', englishName: 'Ferocious Rage', level: 10, kind: 'passive', summary: '10级起进入狂暴时，10尺内能看见你的自选生物感知豁免失败则恐慌至其下回合结束。', description: '10级起，你进入狂暴时那份凶性会向外溢出：由你选择的、10尺内能看见你的生物必须成功通过一次感知豁免，对抗你的战技豁免DC（8＋熟练加值＋体质调整值）；豁免失败时，该生物陷入恐慌，直至其下个回合结束。该效应随你进入狂暴自动触发，不需要额外动作。' },
      { slug: 'violent-hunger', name: '死暴饥狂', englishName: 'Violent Hunger', level: 14, kind: 'passive', summary: '14级起武器伤害骰掷出最大值时可耗1点战技点追加一枚同类骰，每次攻击一次。', description: '14级起，当你以武器攻击对一名生物造成伤害，且伤害掷骰中的一枚骰子掷出最大值时，你可以消耗1点战技点，额外投掷一枚相同类型的骰子并把结果加入此次攻击造成的伤害中。每次攻击你仅能如此做一次；消耗的战技点按通常规则在长休后恢复。' },
    ],
  },
]

export const grimHollowSubclasses2014: readonly SubclassRule[] = seeds.map((seed) => {
  const id = `subclass-2014-tp-gh-${seed.classSlug}-${seed.slug}`
  const features: readonly SubclassFeature[] = seed.features.map((feature) => ({
    id: `tp-gh-${seed.classSlug}-${seed.slug}-${feature.slug}`,
    subclassId: id,
    name: feature.name,
    englishName: feature.englishName,
    level: feature.level,
    summary: feature.summary,
    description: feature.description,
    kind: feature.kind,
    status: 'selectable',
    sourceIds: GRIM_HOLLOW,
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
    sourceIds: GRIM_HOLLOW,
    features,
  }
})
