import type { SubclassFeature, SubclassFeatureKind, SubclassRule } from '@/types/rules'

/** 《胧忆岛》第三方子职（2014 口径）。仅登记选择与展示所需元数据与原创中文摘要，效果不进入自动计算。 */

const OBOJIMA = ['tp-obojima-index'] as const

/** 2014 各职业的子职选择等级。 */
const SELECTION_LEVELS: Readonly<Record<string, number>> = {
  barbarian: 3, bard: 3, druid: 2, fighter: 3, monk: 3, paladin: 3,
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
    slug: 'mask',
    classSlug: 'bard',
    name: '面具学院',
    englishName: 'College of Masks',
    summary: '以注入魔法的面具完全沉浸于角色的戏剧演员，继承了胧忆岛古老的独演戏法。佩戴并随时更换面具即可借用面具所描绘角色的特质，在社交、探索与战斗中切换定位，是灵活多变的支援型吟游诗人。',
    features: [
      { slug: 'tools-of-performance', name: '能艺之具', englishName: 'Tools of Performance', level: 3, kind: 'choice', summary: '3级起可制作佩戴魔法面具，初始两副，7、11、15级各增一副，可随时换面。', description: '3级起你能将奥术恩惠织入面具：初始自选两副面具，7、11、15级各再添一副，每次制作时还可替换一副已有面具；戴或换面具用动作或附赠动作，面具要求豁免时以你的吟游诗人法术豁免DC结算。可选面具按等级分档：3级有鱼面、狐面、翁面、主角面、海胆面、石面，7级起增加般若面、傀儡面、灵面，11级起增加鸟妖面。' },
      { slug: 'copycat', name: '拟形换影', englishName: 'Copycat', level: 3, kind: 'action', summary: '3级起可用动作消耗一次诗人激励施展变身术改变外貌，并获得5点临时生命值。', description: '3级起，你能以一个动作消耗一次诗人激励施展变身术，只能选用「改变外貌」选项，把自身变成见过的类人生物。此法无需专注（仍可随时终止），并获得5点临时生命值，临时生命值耗尽或你死亡时法术提前结束；你会得到目标相关的衣物、护甲与武器等装备，但均为非魔法版本，而你原本携带的装备会融入新形态且无法使用。' },
      { slug: 'many-masked-performance', name: '千面之演', englishName: 'Many-Masked Performance', level: 6, kind: 'action', summary: '6级起用1分钟表演使至多等于诗人等级的听众魅惑、恐慌或昏迷，每次长休一次。', description: '6级起，你可以用1分钟进行一场摄人心魄的表演，选择60尺内至多等于你吟游诗人等级、能听到你表演的生物，并指定使其被魅惑、恐慌或昏迷。表演结束时每个目标进行一次对抗你法术豁免DC的感知豁免，失败者陷入所选状态。使用后必须完成一次长休才能再次使用。' },
      { slug: 'gift-of-theatre', name: '传艺授面', englishName: 'Gift of Theatre', level: 14, kind: 'action', summary: '14级起可用动作把面具借给5尺内盟友使用1分钟，借出后需短休或长休才能再用。', description: '14级起，你能以一个动作暂时解除面具与你之间的绑定咒语，把它交给5尺内的盟友佩戴。面具可如此使用1分钟，且同一时间只能指定一名其他生物使用。赠予结束后，你必须完成一次短休或长休，才能再次使用此特性。' },
    ],
  },

  // ============ 圣武士 paladin ============
  {
    slug: 'river',
    classSlug: 'paladin',
    name: '川流之誓',
    englishName: 'Oath of the River',
    summary: '从流水变迁与水中之灵寻得启示的誓言：先走阻力最小的路，必要时以决然之势冲破险阻。子职兼顾治疗与团队增益，并用水流灵光限制敌人走位、把敌人推入不利位置。',
    features: [
      { slug: 'oath-spells', name: '圣誓法术', englishName: 'Oath Spells', level: 3, kind: 'resource', summary: '3级起随圣武士等级获得川流之誓的圣誓法术，始终准备且不占准备数量。', description: '立下此誓后，你在相应圣武士等级自动获得下列圣誓法术并始终准备：3级祝福术、潮覆武器；5级寻获坐骑、次等复原术；9级水下呼吸、水上行走；13级行动自如、操控水体；17级群体疗伤术、潜渡术。这些法术属于誓言赋予的固定列表，不占用你的准备法术数量。' },
      { slug: 'channel-divinity', name: '引导神力', englishName: 'Channel Divinity', level: 3, kind: 'resource', summary: '3级获得两种引导神力：急流冲击推开周身敌人，祝福之池治疗远处盟友。', description: '第3级选择本誓言时，你获得两种引导神力选项，使用时消耗引导神力次数。急流冲击以一个动作在自身20尺半径内激起水浪，范围内由你选定的大型或更小生物须通过力量豁免，否则被推离5尺；祝福之池以一个附赠动作激励盟友，选择30尺内至多等于你魅力调整值两倍（最少2个）的可见生物，各恢复2d6点生命值。' },
      { slug: 'aura-of-the-river', name: '川流灵光', englishName: 'Aura of the River', level: 7, kind: 'passive', summary: '7级起10尺灵光对他人是困难地形，命中后可用灵光推敌10尺，18级扩至30尺。', description: '第7级起，你周身10尺范围对其他生物视为困难地形，你可无需动作指定任意数量可见生物免受影响。你的回合中首次用近战攻击命中大型或更小生物时，可用灵光把目标移入10尺内你选择的未占据空间。18级时灵光扩大为30尺。' },
      { slug: 'shielding-spirit', name: '护卫之灵', englishName: 'Shielding Spirit', level: 15, kind: 'reaction', summary: '15级起敏捷豁免时可用反应把该次伤害减半，并可消耗法术位让10尺内盟友共享。', description: '从15级起，你进行敏捷豁免时可用反应使该效应造成的伤害减半；此时你还可消耗一个法术位，让10尺内数量等于所消耗法术位等级的可见生物同样从中受益，各自受到的该次伤害减半。' },
      { slug: 'form-of-the-river', name: '身化长川', englishName: 'Form of the River', level: 20, kind: 'bonus-action', summary: '20级起附赠动作化身长川1分钟：泳速60尺、全豁免优势，灵光推敌可补2d8伤害。', description: '从20级起，你可用一个附赠动作显现河流之灵，持续1分钟：获得60尺游泳速度、步行速度增加15尺，所有豁免检定具有优势，且每当你用灵光成功移动一个生物时，可选择对其造成2d8点钝击伤害。使用后须完成一次长休才能再次使用，也可消耗一个5环法术位再启。' },
    ],
  },

  // ============ 德鲁伊 druid ============
  {
    slug: 'petal',
    classSlug: 'druid',
    name: '落英结社',
    englishName: 'Circle of the Petal',
    summary: '与花瓣之舞心神合一、从胧忆精魂与岛风中汲取力量的自然卫士。他们把繁花化为治愈、庇护与花之怒火，以花瓣云稳定输出与减伤，并能召唤兽灵协同作战。',
    features: [
      { slug: 'petal-dance', name: '飞花漫舞', englishName: 'Petal Dance', level: 2, kind: 'bonus-action', summary: '2级起以附赠动作消耗荒野变形召出花瓣云1小时：AC+1、可远程花刃与反应减伤。', description: '2级起，你能以附赠动作消耗一次荒野变形，召出持续1小时、形制由你选择的花瓣云。被花瓣云环绕时AC+1，并可用附赠动作对30尺内可见生物发动远程法术攻击，命中造成1d6挥砍伤害（5级2d6、11级3d6、17级4d6）；你或10尺内可见生物受伤时，可用反应把伤害减少德鲁伊等级＋感知调整值，随后花瓣云消散。' },
      { slug: 'petal-beast-mimicry', name: '落英化兽', englishName: 'Petal Beast Mimicry', level: 6, kind: 'action', summary: '6级起可用动作召出兽灵替你作战，生命值为德鲁伊等级三倍，长休恢复全部次数。', description: '6级起，你能以一个动作唤出灵魄化作自选野兽外形（使用兽灵数据）：生命值为德鲁伊等级三倍，攻击加值同你的法术攻击加值，拥有20尺飞行与悬浮，可把其他生物占据的空间视作困难地形，出现在30尺内未占据空间并在你回合中行动，只能疾跑或攻击。此特性2次使用（11级3次、16级4次，长休恢复），11级起可花2次召出两只。' },
      { slug: 'spirit-of-obojima', name: '胧忆之灵', englishName: 'Spirit of Obojima', level: 10, kind: 'action', summary: '10级起求生检定有优势，并能以动作召出最长60尺的花瓣墙，持续德鲁伊等级分钟。', description: '10级起，风会以白色花瓣为你指路，使你进行感知（求生）检定寻找路径或生物时具有优势；也能以动作召出旋转花瓣墙：宽1尺、高15尺、最长60尺，可任意朝向、悬空或置于固体表面，出现时穿过生物则把它推到由你选择的一侧；除你指定的生物外无人能物理穿过，墙免疫所有伤害并持续等于你德鲁伊等级的分钟数，用后须长休才能再用。' },
      { slug: 'winds-of-revival', name: '复苏之风', englishName: 'Winds of Revival', level: 14, kind: 'reaction', summary: '14级起生命值降到0时改为回复一半生命，并可用反应推开来敌并造成2d8伤害。', description: '14级起，当你的生命值降至0时，你改为获得一半生命值并在花瓣中站起；你随即可用反应从自身吹起强风，以你为中心10尺半径内每个生物须通过对抗你法术豁免DC的力量豁免，失败者被推离15尺并受到2d8点挥砍伤害。使用后须完成一次长休才能再次使用。' },
    ],
  },

  // ============ 战士 fighter ============
  {
    slug: 'bound-spirit',
    classSlug: 'fighter',
    name: '附灵',
    englishName: 'Spirit-Fused',
    summary: '体内寄宿着消散灵类精华的战士，能把灵能注入武器与随身物件，催生奇异的异能或强力的打击。核心资源精华骰可强化攻击检定或伤害，引灵选项则提供大量工具化的战术手段。',
    features: [
      { slug: 'arcane-quirk', name: '奥能异象', englishName: 'Arcane Quirk', level: 3, kind: 'choice', summary: '3级起为角色挑选一至多个无实际加成的怪异表现，用于刻画灵能外溢的戏剧效果。', description: '作为强大灵类的宿主，你体内的魔力偶会自行迸发，此特性不带来数值收益，只用于塑造角色：从资料所列表现中选择一个或多个，例如使用子职特性时周围的初代科技设备失控、武器攻击时随身播放器响起音乐、受伤时咳出泡泡、昏迷时身体漂浮离地1尺，或重击时头部变成怪异面目；与DM确认后固定下来。' },
      { slug: 'channel-essence', name: '引精注灵', englishName: 'Channel Essence', level: 3, kind: 'resource', summary: '3级获得4枚d6精华骰，可在武器攻击检定或伤害上消耗，短休或长休全部恢复。', description: '从3级起，你拥有4枚d6精华骰。进行武器攻击检定时，你可消耗池中一枚骰子把结果加到攻击检定或伤害上，可在掷骰前或后决定，但必须在结果生效前声明。7级增至5枚、10级6枚、15级7枚、18级8枚；完成一次短休或长休后恢复全部已消耗的精华骰。' },
      { slug: 'object-channeling', name: '引灵御物', englishName: 'Object Channeling', level: 3, kind: 'choice', summary: '3级起学会一个自选引灵选项并配一件引导物品，同时获得回收技能熟练。', description: '从3级起，你能把体内灵能注入物体并产生各种效果：从引灵选项中自选一个（如气囊包裹、缠绕绳索、寻物感知、初代坐骑、护镜视觉、跃进球鞋、口袋声音、喷射推进），并获得一件用来引导该选项的自选物品。使用后须完成一次短休或长休才能再次使用。你同时获得「回收」技能熟练。7级起可再学一个选项，使用次数提升为熟练加值。' },
      { slug: 'spirit-battery', name: '聚灵之躯', englishName: 'Spirit Battery', level: 7, kind: 'passive', summary: '7级习得改良电击术并以体质施法，每回合可将武器伤害替换为电击术伤害。', description: '7级起你习得戏法电击术，但以机器为目标时供能时间变为1小时（而非18秒），其法术攻击调整值改用体质调整值＋熟练加值。在你的每个回合中，以攻击动作进行的武器攻击命中时，你可每回合一次改用电击术的伤害骰（造成闪电伤害）替代武器伤害骰，此时不能获得其他特性或法术提供的额外攻击伤害加值。你的生物类型视为灵类。' },
      { slug: 'improved-object-channeling', name: '强效引灵', englishName: 'Improved Object Channeling', level: 7, kind: 'passive', summary: '7级再学一个引灵选项，引灵御物的使用次数提升为等于熟练加值，短休恢复。', description: '7级时，你从引灵选项中再学会一个额外的选项，并且引灵御物的使用次数提升为等于你的熟练加值。完成一次短休或长休后，你恢复所有已消耗的使用次数。' },
      { slug: 'improvised-armor', name: '御灵护体', englishName: 'Improvised Armor', level: 10, kind: 'reaction', summary: '10级起被攻击命中时可用反应掷一枚精华骰，把结果加到对抗该次攻击的AC上。', description: '从10级起，你能把能量注入随身物品使其瞬间硬如钢铁。当你被一次攻击命中时，可以使用反应投掷一枚精华骰，并把掷出的数值加到你的AC上以对抗该次攻击，这可能让该攻击失手；精华骰照常消耗，休息后恢复。' },
      { slug: 'backup-battery', name: '灵能充注', englishName: 'Backup Battery', level: 15, kind: 'resource', summary: '15级获得一次额外回气次数，生命值低于战士等级时可立即免费使用回气。', description: '15级时，你获得一次额外的回气使用次数。当你的生命值降到低于你战士等级，且仍有可用的回气次数时，你可以选择立即使用一次回气，此使用无需动作。' },
      { slug: 'junk-master', name: '废品大师', englishName: 'Junk Master', level: 18, kind: 'passive', summary: '18级从引灵御物再获一个引导选项，先攻掷骰且次数用尽时自动回复两次使用。', description: '18级起，你从引灵御物特性中获得一个额外的引导选项。此外，当你进行先攻掷骰且引灵御物已没有剩余使用次数时，你立刻恢复该特性的两次使用次数。' },
    ],
  },

  // ============ 术士 sorcerer ============
  {
    slug: 'ghost-blood',
    classSlug: 'sorcerer',
    name: '鬼之血脉',
    englishName: 'Oni Bloodline',
    summary: '血脉与鬼有着古老联系的术士：术法点消耗得越多，鬼之力就越明显地显现在肉体与奥术之上。玩法围绕术法点驱动的自我强化展开，最终可完全拥抱血脉、化身真正的鬼。',
    features: [
      { slug: 'arcane-prison', name: '奥术囚笼', englishName: 'Arcane Prison', level: 1, kind: 'passive', summary: '1级起消耗术法点会依数量显现鬼之力，长休后消退，恢复术法点可能失去特征。', description: '第1级起，你体内封印的最初之鬼会随术法点消耗而显现：消耗0—1点显双眼、2—4点显双角、5—9点显皮肤、10—14点显舌头、15点及以上显头发，特征可叠加并持续到你完成一次长休，恢复术法点时可能失去部分特征。五项鬼之力：魅惑之眼、以双角引导戏法并追加1d6穿刺、施法后按环阶回复生命、迫使目标远离或倒地、AC获得+2。' },
      { slug: 'ogre-manipulation', name: '食人掌控', englishName: 'Ogre Manipulation', level: 6, kind: 'bonus-action', summary: '6级起以附赠动作提前获得一项鬼之力1分钟，无需消耗术法点，每次长休一次。', description: '从6级开始，你能以附赠动作提前显现一项鬼之力，无论你已消耗多少术法点。该特征持续1分钟；若在此期间你并未通过正常消耗术法点的方式获得该特征，则它在时限结束时消失。此特性一经使用，直到你完成一次长休为止不能再次使用。' },
      { slug: 'boiling-power', name: '沸腾之力', englishName: 'Boiling Power', level: 14, kind: 'passive', summary: '14级起鬼之力全面强化：诚实之域、双角1d12、加倍回血与更强舌头效果。', description: '14级时你的鬼之力产生强化：双眼可免费施展诚实之域（仅影响60尺内你指定的一名生物，且目标每回合开始须再豁免）；双角的额外伤害由1d6提升为1d12；皮肤的回复量变为法术环阶的两倍＋体质调整值；舌头在施展五环或更高环阶法术时可改为让目标被动察觉降至5、且面对非你来源的攻击AC−5，持续到你下回合开始。' },
      { slug: 'transformation', name: '变身', englishName: 'Transformation', level: 18, kind: 'action', summary: '18级起以动作一次性激活全部鬼之力1分钟，获得非魔法伤害抗性且免疫魅惑恐慌。', description: '从18级开始，你可用一个动作立即激活全部鬼之力，无需消耗术法点。持续1分钟期间，你获得对非魔法攻击的钝击、穿刺、挥砍伤害抗性，并且不会被魅惑或恐慌。效应结束后，你失去任何未通过正常方式获得的鬼之力。此特性一经使用直到完成长休不能再用，也可消耗5点术法点再次使用。' },
    ],
  },

  // ============ 武僧 monk ============
  {
    slug: 'dragonsheep',
    classSlug: 'monk',
    name: '绵龙牧者',
    englishName: 'Sheep Dragon Shepherd',
    summary: '与游荡绵龙一同生活修行的牧者，把同伴视作需要守护的牧群，深谙集体协作与何时撤离。子职以气驱策盟友走位、以气流远击敌人，并用守望与偏转为队友提供保护。',
    features: [
      { slug: 'herding-sheep', name: '羊羔牧者', englishName: 'Herding Sheep', level: 3, kind: 'bonus-action', summary: '3级起以附赠动作耗气驱策60尺内盟友移动，不引发借机攻击；5级起可多指定目标。', description: '3级起，你能以一个附赠动作花费1点或更多气，令60尺内一名可见的自愿生物朝你或任意方向移动，该移动不引发借机攻击。向你移动时每点气可移动至多15尺，向其他方向则每点气至多10尺，且单次移动不超过该生物的移动力。5级可指定2名、10级3名、15级4名生物。' },
      { slug: 'wind-shot', name: '劲风射击', englishName: 'Wind Shot', level: 6, kind: 'action', summary: '6级起徒手打击可改为60尺喷射气流攻击，命中后可耗1点气击倒或推离目标。', description: '6级起，你发动徒手打击时可改为喷出压缩气流，进行一次射程60尺的远程武器攻击，使用与徒手打击相同的攻击加值与伤害骰。命中后你可选择花费1点气，迫使目标进行对抗你气豁免DC的力量豁免，失败时由你选择将其击倒或朝远离你的方向推离10尺。' },
      { slug: 'intercepting-maneuver', name: '灵活截击', englishName: 'Intercepting Maneuver', level: 6, kind: 'reaction', summary: '6级起可耗1点气并以反应，为10尺内被命中的盟友减少一枚武艺骰＋敏捷的伤害。', description: '同样在6级，当10尺内的友方生物被一次攻击命中时，你可以消耗1点气并使用反应，使该生物受到的这次伤害减少一枚武艺骰＋你的敏捷调整值的数值。' },
      { slug: 'take-to-the-skies', name: '腾风', englishName: 'Take to the Skies', level: 11, kind: 'passive', summary: '11级起使用飞檐走壁时获得等于步行速度的飞行速度至回合结束，并兼得撤离与疾走。', description: '11级起，你使用飞檐走壁时会获得等于你步行速度的飞行速度，该飞行速度持续到你的回合结束。同时，使用飞檐走壁时你视为一并执行了撤离与疾走动作。' },
      { slug: 'guide-to-the-herd', name: '牧人指引', englishName: 'Guide to the Herd', level: 17, kind: 'reaction', summary: '17级起以坚强防御获得闪避时可额外耗1点气，让30尺内一名盟友同步获得闪避。', description: '17级起，每当你使用坚强防御获得闪避动作的效益时，你可以额外消耗1点气，令30尺内一名能看见或听见你的友方生物立即以反应同步获得闪避动作的效果，持续到你的下回合开始。' },
    ],
  },

  // ============ 法师 wizard ============
  {
    slug: 'origami',
    classSlug: 'wizard',
    name: '折纸魔法师',
    englishName: 'Origami Mages',
    summary: '把普通纸张折成元素之力、神秘造物与奇幻生灵的法师，用精确的折痕替代传统法术成分。子职通过折纸构装为队友提供多样增益，并以折纸魔宠与仆役承担侦察与杂务。',
    features: [
      { slug: 'an-arcane-art', name: '奥术纸艺', englishName: 'An Arcane Art', level: 2, kind: 'choice', summary: '2级起以附赠动作折出并绑定折纸构装，形态可选鸟、猫、蟹、龙、蛙，次数为熟练加值。', description: '2级起，你能以附赠动作折出纸制构装并注入生命，形态可选鸟、猫、蟹、龙、蛙，绑定给你自己或60尺内一名可见生物，绑定者获得该构装的效应，同一生物不能同时绑定两个相同构装。构装持续你法师等级一半的小时数，AC等于你的法术豁免DC，免疫毒素与心灵伤害，一旦受到伤害即被摧毁。使用次数等于熟练加值，长休后恢复。' },
      { slug: 'origami-familiar', name: '折纸魔宠', englishName: 'Origami Familiar', level: 2, kind: 'passive', summary: '2级起始终准备寻获魔宠，魔宠为免疫毒素与心灵伤害的构装，可伪装、扑击或侦察。', description: '2级起，你习得并始终准备寻获魔宠，且不占每日可准备法术数量。魔宠以折纸形态出现，是构装而非天族、妖精或邪魔，并免疫毒素与心灵伤害；除常规数据外它还能化为扁平纸张伪装（被检查者须通过对抗你法术豁免DC的调查检定）、以动作扑向目标使其目盲1分钟（效应结束时魔宠被摧毁），或用1分钟记录15尺内的声音带回情报。' },
      { slug: 'binding-release', name: '绑定解放', englishName: 'Binding Release', level: 6, kind: 'bonus-action', summary: '6级起可用附赠动作把一只折纸构装转移给30尺内另一名可见生物绑定。', description: '6级起，你可以使用一个附赠动作，将你的一只折纸构装转移给位于其30尺内、你能看见的一个生物。转移后构装与原先的绑定者脱离，改由该生物成为新的绑定者，并为其提供该构装的效应。' },
      { slug: 'paper-path', name: '纸途传递', englishName: 'Paper Path', level: 6, kind: 'passive', summary: '6级起施放触碰距离的法术时，可由100尺内的折纸构装代为传递该法术。', description: '同样在6级起，当你施展一道施法距离为触碰的法术时，你100尺内的折纸构装可以如同它自己施展该法术一样代替你传递；若该法术需要攻击检定，则使用你的攻击加值进行检定。' },
      { slug: 'origami-servant', name: '折纸侍仆', englishName: 'Origami Servant', level: 10, kind: 'passive', summary: '10级起始终准备隐形仆役且可不耗法术位施展，仆役呈折纸形态并有诸多强化。', description: '10级起，你习得并始终准备隐形仆役，不占用每日可准备法术数量，还能不消耗法术位施展，同时维持数量至多等于法师等级的一半（向上取整）。仆役以可见折纸形态出现，免疫毒素与心灵伤害，持续时间为熟练加值小时，能穿过1寸宽缝隙、看见隐形生物与物件；你还可借其视角观察（自身目盲耳聋），并用一个附赠动作给各仆役分别下令。' },
      { slug: 'arcane-refresh', name: '秘法回溯', englishName: 'Arcane Refresh', level: 14, kind: 'reaction', summary: '14级起构装被摧毁时可选回复10点生命或一个二环以下法术位，并能以反应抵消伤害。', description: '14级起，你的折纸构装被摧毁时会返还赋予它们生命时借出的魔法：你可选择恢复10点生命值，或恢复一个二环或更低环阶的法术位。此外，当一个折纸构装即将受到伤害时，你可以使用反应完全抵消该次伤害；一旦如此使用，你必须完成一次长休才能再次使用该能力。' },
    ],
  },

  // ============ 游侠 ranger ============
  {
    slug: 'eroding',
    classSlug: 'ranger',
    name: '侵蚀行者',
    englishName: 'Corrupted Ranger',
    summary: '被名为「侵蚀」的污秽魔法感染、身体逐渐被可怖力量接替的游侠。以受伤积累的诅咒标记换取爆发伤害，并在高等级选择一项病症作为力量的代价，是一套高风险高回报的战斗风格。',
    features: [
      { slug: 'first-manifestation', name: '第一性状', englishName: '1st Manifestation', level: 3, kind: 'passive', summary: '3级起受伤累积诅咒标记，武器命中时全部消耗并每个额外造成1d4暗蚀伤害。', description: '自3级开始，你每次受到伤害便获得1个诅咒标记（受重击则2个），标记持续到你下个回合结束，一次至多积攒2个。以武器攻击命中生物时，你持有的标记会立刻全部消耗，每个额外造成1d4点暗蚀伤害；你也可以用附赠动作立刻获得当前可持有的最大标记数。可持有上限随等级提升：5级3个、11级4个、17级5个。' },
      { slug: 'second-manifestation', name: '第二性状', englishName: '2nd Manifestation', level: 3, kind: 'passive', summary: '3级起可将力量或敏捷检定结果替换为10＋游侠等级，次数为熟练加值的一半。', description: '3级起，当你进行力量或敏捷检定时，你可以选择把结果替换为10＋你的游侠等级。你可以在掷出d20之后、DM宣布检定成功或失败之前再决定是否使用；使用次数等于你熟练加值的一半（向上取整），完成一次长休后全部恢复。' },
      { slug: 'third-manifestation', name: '第三性状', englishName: '3rd Manifestation', level: 7, kind: 'passive', summary: '7级起武器攻击可耗1个标记加1d4攻击检定，还能以反应减伤一次（需休息恢复）。', description: '自7级开始，你对生物发动武器攻击时可以花费1个诅咒标记并掷1d4，把结果加到这次攻击检定上，可在掷骰前后决定，但一回合只能如此消耗1个标记。此外，无论何时受到伤害，你都可用反应把伤害量减少等于你游侠等级的数值；一旦以此法减伤，你须完成一次短休或长休才能再次使用。' },
      { slug: 'fourth-manifestation', name: '第四性状', englishName: '4th Manifestation', level: 11, kind: 'choice', summary: '11级起从灰视、坏肺、丧感中选择一项病症，获得对应的感知或攻防强化。', description: '11级时你选择并获得一项病症：灰视给予15尺盲视，并能自动识破DC不高于你施法DC的视觉幻象；坏肺可以动作夺走可见生物的下一次呼吸，使其倒地且不能反应到你下回合开始，并消耗全部标记各造成1d4暗蚀伤害，也能以反应给予他人敏捷豁免优势；丧感以附赠动作指定60尺内可见生物，此后标记对其造成1d6而非1d4暗蚀伤害。' },
      { slug: 'fifth-manifestation', name: '第五性状', englishName: '5th Manifestation', level: 15, kind: 'bonus-action', summary: '15级起以附赠动作爆发：移速翻倍、AC+2、攻击动作多两次攻击，视为持有满标记。', description: '15级起，你能以附赠动作唤起侵蚀：步行速度翻倍，AC获得+2加值，执行攻击动作时可发动两次额外攻击，所有攻击都视作持有最大数量标记，效果持续到你下个回合开始。两次长休之间你可无副作用地使用一次；若在长休前第二次使用，则你还会获得1级力竭、在自己回合开始时生命值降至1点，且此后须长休才能再用。' },
    ],
  },

  // ============ 游荡者 rogue ============
  {
    slug: 'waxwork',
    classSlug: 'rogue',
    name: '蜡艺师',
    englishName: 'Waxwork Rogue',
    summary: '把灵界魔法与蜡、火焰结合的速递队游荡者，以层出不穷的机关巧术出入险地。烛心点驱动的魔艺覆盖侦查、封锁、治疗与爆发伤害，第九级起还能在偷袭时点燃白焰。',
    features: [
      { slug: 'conjure-flame', name: '咒唤炽焰', englishName: 'Conjure Flame', level: 3, kind: 'passive', summary: '3级习得舞光术（光源形似漂浮蜡烛）与燃火术两个戏法作为魔蜡技艺的基础。', description: '3级时，你习得戏法舞光术与燃火术，前者造出的光源形似漂浮的蜡烛。这两个戏法可随时施展，用于照明、引燃物品或远程灼烧目标，也是后续魔蜡技艺的基础。' },
      { slug: 'wax-enchantments', name: '魔蜡技艺', englishName: 'Wax Enchantments', level: 3, kind: 'choice', summary: '3级起自选三种魔艺并获得3点烛心点，魔艺消耗烛心点，短休或长休恢复。', description: '3级起，你习得魔蜡技艺，其资源为烛心点：初始3点，此后每提升一个游荡者等级+1点，消耗后须短休或长休才能恢复。你从魔艺列表中自选三种习得（如绽光明烛、噼啪蜜蜡、守御蜡封、蜡灵、烛芯长鞭等），5、10、15级各再学两种，且每次学新魔艺时可替换一种已知魔艺；需要豁免的魔艺按8＋熟练加值＋智力或魅力调整值算DC。' },
      { slug: 'burn-cycle', name: '白焰连击', englishName: 'Burn Cycle', level: 9, kind: 'passive', summary: '9级起造成偷袭伤害时可消耗烛心点，每点追加1d6火焰伤害，至多4d6。', description: '9级起，当你在自己回合内造成偷袭伤害时，你可以引燃武器并花费烛心点对目标追加火焰伤害：每消耗1点烛心点额外造成1d6点伤害，单次至多消耗4点、即至多4d6。' },
      { slug: 'advanced-enchantments', name: '强化魔艺', englishName: 'Advanced Enchantments', level: 13, kind: 'passive', summary: '13级起部分魔艺获得强化版本；若尚未习得对应魔艺，可改为直接习得一种。', description: '13级时你的部分魔艺变得更强，可使用资料列出的替换版本：绽光明烛持续8小时；延时燃烧可把效果延迟1轮至1小时；噼啪蜜蜡影响目标及其5尺内每个生物；美味佳烛治疗1d12且可同时持有4根；魔匠印击取消每回合限制；守御蜡封可同时生效三个；蜡灵改为花3点烛心点一次召唤两只。若你尚未习得上述某魔艺，可改为直接习得其中一种。' },
      { slug: 'spirit-flame', name: '灵界烛焰', englishName: 'Spirit Flame', level: 17, kind: 'bonus-action', summary: '17级起以附赠动作点燃粉蜡蜡烛1分钟：魔艺省1点、免疫火焰、灵类攻击有劣势。', description: '17级时，你能以粉蜡制作一根特殊蜡烛，并以附赠动作点燃，燃烧1分钟。持有点燃蜡烛期间你获得三项好处：施展魔艺所花费的烛心点减少1点、免疫火焰伤害、灵类生物对你的攻击检定具有劣势。若持烛时陷入倒地，须通过DC15的敏捷豁免否则蜡烛提前熄灭；此特性用后须完成一次长休才能再次使用。' },
    ],
  },

  // ============ 野蛮人 barbarian ============
  {
    slug: 'brewed',
    classSlug: 'barbarian',
    name: '腹酿道途',
    englishName: 'Path of the Belly Brewer',
    summary: '把工坊搬进肚子里的野蛮人：吞下特定食材即可在体内即兴酿造出类似魔药的效果。进入狂暴时选择战斗、实用或妙想精酿获得不同增益，后期还能借用普通魔药的效力。',
    features: [
      { slug: 'belly-concoction', name: '腹中精酿', englishName: 'Belly Concoction', level: 3, kind: 'choice', summary: '3级起每次进入狂暴可从战斗、实用、妙想三种精酿中重选一种并获得其效果。', description: '从3级开始，你能在体内酿造魔法药剂，每次进入狂暴时从战斗、实用、妙想三种精酿中重选一种：战斗令肉体如橡胶，被远程攻击命中时可用反应大幅减伤（1d12＋体质＋野蛮人等级）并延长触及、追加伤害；实用可用附赠动作吞下物件并消耗生命骰治疗，次数为熟练加值；妙想每回合开始随机获得短距传送、以暗蚀伤害换取检定加值或立即协助。' },
      { slug: 'side-effects', name: '副作用', englishName: 'Side Effects', level: 3, kind: 'passive', summary: '3级起因长期摄入魔法原料而习得魔法伎俩与奇术两个戏法。', description: '从3级开始，由于你已经摄入了不计其数的魔法原料，你因而受到一些魔法副作用的影响：你习得戏法魔法伎俩与奇术，可随时施展它们制造细微的魔法效果。' },
      { slug: 'quick-brew', name: '快速酿造', englishName: 'Quick Brew', level: 6, kind: 'bonus-action', summary: '6级起选定一种普通品质魔药，可用附赠动作启动其效应，每次长休一次。', description: '从6级开始，你学会更好地控制腹中精酿：选择一种你通常会饮用的普通品质魔药，并可用一个附赠动作启动该魔药的效应。一旦启动，你须完成一次长休才能再次使用。若魔药的效应要求豁免，其DC等于8＋你的熟练加值＋你的体质调整值。每当你在此职业提升一级，你可以把所选魔药更换为另一种。' },
      { slug: 'lingering-effects', name: '长时药效', englishName: 'Lingering Effects', level: 10, kind: 'passive', summary: '10级起每次长休后选定一种状态，你在对抗该状态的豁免中具有优势。', description: '10级时，你腹中恒久存在的秘酿效力即使在你不处于狂暴状态时也会带来好处。当你完成一次长休后，从目盲、魅惑、力竭、恐慌、麻痹、石化、中毒、倒地、束缚、震慑中选择一种状态；在你以此特性改选其他状态之前，你在对抗该状态的豁免检定中具有优势。' },
      { slug: 'mighty-quick-brew', name: '强力快速酿造', englishName: 'Mighty Quick Brew', level: 14, kind: 'passive', summary: '14级起使用快速酿造时额外习得一种普通魔药与一种非普通魔药。', description: '自14级开始，你在使用快速酿造特性时额外习得一种普通品质魔药和一种非普通品质魔药，可选的启动效果随之扩充。每当你在此职业提升一级，你可以把所选魔药更换为另一种。' },
    ],
  },

  // ============ 魔契师 warlock ============
  {
    slug: 'lantern',
    classSlug: 'warlock',
    name: '灯笼',
    englishName: 'The Lantern',
    summary: '与强大灵界生物缔约、以燃烧宗主精粹的灯笼为标志的魔契师。灵辉会随契约赋予一系列光明系能力：强化盟友豁免、灼烧敌人、揭示隐形与照亮前路，是支援与控制兼备的魔契师。',
    features: [
      { slug: 'spells', name: '法术', englishName: 'Spells', level: 1, kind: 'resource', summary: '1级起获得灯笼宗主的扩展法术列表，法术随魔契师等级逐步可用。', description: '与灯笼宗主缔约后，你在相应魔契师等级获得下列扩展法术并纳入可选法术列表：一环妖火、鉴定术；二环物件定位术、魔力吞噬；三环昼明术、回避侦测；四环信仰守卫、生物定位术；五环灵之列车站、谭冈的盛宴之火。它们是宗主赋予的固定法术，随等级提升逐步可选。' },
      { slug: 'illuminating-aura', name: '启明灵光', englishName: 'Illuminating Aura', level: 1, kind: 'bonus-action', summary: '1级起以附赠动作点亮灯笼1分钟：强化盟友豁免，微光内敌人豁免失败受光耀伤害。', description: '1级起，宗主精粹灌注入灯笼，你可把它当作施展魔契师法术的法器。你能以附赠动作激活灯笼，发出20尺明亮光照与额外20尺微光，持续1分钟或直到松开灯笼。期间你可反应令明亮光照内生物的豁免获得等于你魅力调整值（最低+1）的加值；微光光照内的敌对生物豁免失败时受到你魔契师等级一半的光耀伤害。用后须短休或长休才能再用。' },
      { slug: 'revealing-light', name: '揭示之光', englishName: 'Revealing Light', level: 1, kind: 'action', summary: '1级起以动作让灯笼发出10尺褐红光芒1小时，照亮范围内的隐形生物与物件。', description: '1级起，你可以使用一个动作令灯笼照射出鲜艳的褐红色光芒，发出10尺半径明亮光照以及额外10尺微光光照。处于灯笼明亮光照范围内的隐形生物和物件会因此显形。灯笼以这种方式发光1小时，或直到你以附赠动作提前熄灭。此特性用后须完成一次短休或长休才能再次使用。' },
      { slug: 'dangerous-tool', name: '危险器具', englishName: 'Dangerous Tool', level: 6, kind: 'passive', summary: '6级起启明灵光不再因松手结束，不持握时可将灯笼当作灵体武器使用。', description: '6级起，你的启明灵光不再因你松开灯笼而提前结束。当你没有持握灯笼时，你可以魔法性地控制它1分钟，把它当作二环版本的灵体武器使用；在此期间灯笼仍可作为你的法器。该灵体武器的环阶随职业等级提升，10级为四环、15级为六环。以此方式控制灯笼后须完成一次长休才能再次这么做，也可消耗一枚魔契师法术位（无需动作）再次控制它。' },
      { slug: 'oracle-illumination', name: '神谕之辉', englishName: 'Oracle Illumination', level: 6, kind: 'action', summary: '6级起以动作把心智连到一处光源10分钟，使其如鹰眼术传感器般运作。', description: '6级起，你可以使用一个动作将心智魔法性地连接到一个你可见或熟悉的光源（例如蜡烛或火把）。该光源如同法术鹰眼术创造的传感器般运作，赋予你相同的增益。你可以如此使用该光源持续10分钟，或直至你再次使用此特性。一旦你对某个光源使用了此特性，则直到你完成一次长休前，你无法对该光源再次使用它。' },
      { slug: 'brilliant-illumination', name: '炽耀之辉', englishName: 'Brilliant Illumination', level: 10, kind: 'action', summary: '10级起启明灵光激活时，可以动作迸发闪光：范围内生物体质豁免失败受伤并目盲。', description: '10级起，启明灵光激活时，你可以使用一个动作令灯笼光芒迸发耀眼闪光。除你之外，每个被灯笼明亮或微光光照（由你选择）照亮的生物都必须进行一次对抗你魔契师法术豁免DC的体质豁免：失败者受到2d8＋你魔契师等级的光耀伤害并陷入目盲直到你的下一回合结束，成功者仅受一半伤害且不会目盲。用后须短休或长休才能再次使用。' },
      { slug: 'brighter-still', name: '愈加璀璨', englishName: 'Brighter Still', level: 14, kind: 'passive', summary: '14级起可随意激活启明灵光，并能以动作让灯笼照出通往熟悉地点的奥术路径。', description: '14级起，你可以随意激活灯笼的启明灵光，不再受使用次数限制；与启明灵光协同的特性（如危险器具、炽耀之辉）仍受各自次数限制。此外，持握灯笼期间你可以使用一个动作令其照射出苍白蓝光，揭示一条通往你熟悉地点的发光奥术路径，如同施展法术寻路术。以此方式使用灯笼后，须完成一次长休才能再次这么做。' },
    ],
  },
]

export const obojimaSubclasses2014: readonly SubclassRule[] = seeds.map((seed) => {
  const id = `subclass-2014-tp-obojima-${seed.classSlug}-${seed.slug}`
  const features: readonly SubclassFeature[] = seed.features.map((feature) => ({
    id: `tp-obojima-${seed.classSlug}-${seed.slug}-${feature.slug}`,
    subclassId: id,
    name: feature.name,
    englishName: feature.englishName,
    level: feature.level,
    summary: feature.summary,
    description: feature.description,
    kind: feature.kind,
    status: 'selectable',
    sourceIds: OBOJIMA,
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
    sourceIds: OBOJIMA,
    features,
  }
})
