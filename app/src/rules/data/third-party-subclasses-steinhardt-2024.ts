import type { SubclassFeature, SubclassFeatureKind, SubclassRule } from '@/types/rules'

/**
 * G3-I2：《斯坦哈德的诡怖猎杀指南》(Steinhardt's Guide to the Eldritch Hunt) 第三方子职（2024 口径，7 条）。
 * 仅登记选择与展示所需元数据与原创中文摘要，效果不进入自动计算；
 * 来源 `source-2024-tp-steinhardt` 为第三方合作内容，来源默认关闭、需 DM 同意。
 *
 * 命名与收录口径：
 * - 子职名、特性名与英文名取自 CHM v2026.09.13 子职各小节正文（二级标题／粗体标题），未回译、未改写专名；
 * - 2024 口径下子职统一自 3 级获得，故 `selectionLevel` 一律为 3；资料沿用 2014 式等级编号，特性等级照资料登记；
 * - 法术授予类特性（诡猎之誓法术、孽合结社法术）一律记 `resource`；资料明示动作／魔法动作／附赠动作／反应者照记；
 * - 需要玩家从选项列表中选取者记 `choice`；其余常驻增益与随攻击、进入狂暴等自身行动生效的改写型能力记 `passive`；
 * - 法术表、血戮打击选项、酷刑技法与嫁接等选项清单不作为特性登记，只在所属特性的 description 内说明可选范围；
 *   特性内的等级增强项并入所属特性，不拆条；需要玩家选择的选项不建立 RuleOption、不设 optionIds。
 */

const STEINHARDT = ['source-2024-tp-steinhardt'] as const

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
  // ============ 圣武士 paladin ============
  {
    slug: 'eldritch-hunt',
    classSlug: 'paladin',
    name: '诡猎之誓',
    englishName: 'Oath of the Eldritch Hunt',
    summary: '立誓肃清一切反自然、畸变与异质之物的猎手。他们以猎物的力量强化自己，又必须与随之而来的狂热饥渴对抗，因而猎杀昔日同袍并不罕见。子职以神圣狩猎标记猎物、借传送紧咬目标，并从猎物身上窃取超越凡人的感官与体魄。',
    features: [
      { slug: 'hunt-the-prey', name: '猎杀目标', englishName: 'Hunt the Prey', level: 3, kind: 'bonus-action', summary: '3级起附赠动作耗一次引导神力标记60尺内猎物1分钟，可再传送至其身旁。', description: '3级起，你能以附赠动作消耗一次引导神力次数唤起神圣的狩猎，把60尺内一名生物标记为你的猎物，持续1分钟。标记期间，你在使用该特性的当次或后续回合中可用附赠动作魔法传送至多30尺，落点须位于猎物5尺内、你可见的未占据空间，且你必须能看见该猎物。' },
      { slug: 'oath-spells', name: '诡猎之誓法术', englishName: 'Oath of the Eldritch Hunt Spells', level: 3, kind: 'resource', summary: '3级起按诡猎之誓法术表始终准备对应法术，随圣武士等级获得且不占准备数量。', description: '誓言具有的魔法使你始终准备特定法术，到达下列圣武士等级即自动获得，且不计入你的准备法术数量：3级妖火、幽灵切；5级定身类人、月华之光；9级易位肋口、幽灵狂怒；13级艾伐黑触手、骨处女；17级异界探知、定身怪物。' },
      { slug: 'stolen-eldritch-gift', name: '窃取邪恩', englishName: 'Stolen Eldritch Gift', level: 3, kind: 'passive', summary: '3级起身躯超脱凡人，进行运动、察觉与求生检定时可加入魅力调整值。', description: '3级起，你的身躯超脱了凡人的局限：在进行力量（运动）、感知（察觉）与感知（求生）检定时，你可以把你的魅力调整值加入检定结果。该增益随检定自动生效，不需要动作，也没有使用次数限制。' },
      { slug: 'sharpened-senses', name: '锐利感知', englishName: 'Sharpened Senses', level: 7, kind: 'passive', summary: '7级起守护灵光内生物的抗性、免疫与易伤对你透明，并获得等于灵光半径的盲视。', description: '7级起，你学会解读猎物、寻找其弱点：当一名生物位于你的守护灵光范围内时，你立即得知它所拥有的伤害免疫、抗性与易伤。此外，你获得等于你守护灵光半径的盲视，即使在黑暗或目盲状态下也能感知该范围内的环境。' },
      { slug: 'relentless-pursuit', name: '穷追不舍', englishName: 'Relentless Pursuit', level: 15, kind: 'passive', summary: '15级起借猎杀目标传送后立即命中标记猎物时，可免附赠动作施展至圣斩，每回合一次。', description: '15级起，当你在使用猎杀目标传送后立即以武器或徒手打击命中你的标记猎物时，你能无需使用附赠动作地施展至圣斩；法术位照常消耗，且你每回合只能以此方式施展该法术一次。该增益随命中自动可用，不额外消耗动作。' },
      { slug: 'perfect-hunter', name: '完美猎手', englishName: 'Perfect Hunter', level: 20, kind: 'bonus-action', summary: '20级附赠动作化身完美猎手10分钟：武器追伤1d8暗蚀、免疫受擒麻痹束缚并隐形。', description: '20级起，你能以附赠动作激活真正猎手的力量，持续10分钟：吞噬——武器攻击额外造成1d8暗蚀伤害，且该伤害忽略暗蚀抗性与免疫；斩离——你免疫受擒、麻痹与束缚状态；消散——你具有隐形状态。此特性一经使用，直至完成一次长休都无法再次使用。' },
    ],
  },

  // ============ 德鲁伊 druid ============
  {
    slug: 'symbiosis',
    classSlug: 'druid',
    name: '孽合结社',
    englishName: 'Circle of Symbiosis',
    summary: '以骨咒切除自身肢体、再接上自然造物的德鲁伊结社，坚信一切生灵终将与自然融合，否则只有消亡。他们让鹿腿、树枝与兽首成为身体的一部分，在战斗中化为骨枝巨兽撕碎敌人。随着年岁增长，嫁接物与人的界限逐渐模糊，人性被某种更执拗的东西取代。',
    features: [
      { slug: 'circle-spells', name: '孽合结社法术', englishName: 'Circle of Symbiosis Spells', level: 3, kind: 'resource', summary: '3级起按孽合结社法术表始终准备对应法术，随德鲁伊等级获得且不占准备数量。', description: '当你到达孽合结社法术表中特定的德鲁伊等级时，你就始终准备着表中对应的法术，且不计入你的准备法术数量：3级橡棍术、裂生骨甲、指骨钉枪、臂骨加农、钙化记忆；5级易位肋口、骨刺贯刑；7级悚骨人形、骨处女；9级惧骨之森、树跃术。' },
      { slug: 'grafted-powers', name: '接肢之力', englishName: 'Grafted Powers', level: 3, kind: 'choice', summary: '3级起从熊背、鹿头、羊蹄三项嫁接中自选其一，获得力量、感知或移动增益。', description: '3级起，你强行植入体内的自然力量在其他方面显现，你从三项中自选其一：熊背——计算载重与判断能否擒抱生物时视作大一级体型，力量检定时加入感知调整值；鹿头——感知（察觉）检定具有优势；羊蹄——为避免倒地而作的豁免具有优势，并获得等于速度的攀爬速度。嫁接可显现也可不可见，形式在获得时由你决定。' },
      { slug: 'wickerbone-behemoth', name: '骨枝巨兽', englishName: 'Wickerbone Behemoth', level: 3, kind: 'bonus-action', summary: '3级起未着甲持盾时，附赠动作耗一次荒野变形化身骨枝巨兽10分钟。', description: '3级起，未着甲且未持盾时，你可用附赠动作消耗一次荒野变形化为骨枝巨兽，持续10分钟（再次荒野变形则提前结束）：双臂视为受橡棍术强化的短棒并可用其精通词条；处于树肤术效应下且无需专注；被攻击致伤时5尺内由你选定的生物受1d4穿刺（10级起2d4）；每回合开始恢复上回合以来所受伤害一半的生命，至多五倍熟练加值。' },
      { slug: 'extra-attack', name: '额外攻击', englishName: 'Extra Attack', level: 6, kind: 'passive', summary: '6级起攻击动作可攻击两次，其中一次可替换为施展你的一道德鲁伊戏法。', description: '6级起，你在自己回合内执行攻击动作时，可以进行两次攻击而非一次；此外，你可以把这两次攻击中的一次替换为施展你的一道德鲁伊戏法。该增益无需动作，也不消耗任何资源。' },
      { slug: 'natures-wrath', name: '自然狂怒', englishName: "Nature's Wrath", level: 10, kind: 'passive', summary: '10级起永久处于树肤术效应下；骨枝巨兽期间变大型，攻击动作后获三系物理抗性。', description: '10级起，你的自然接肢屈从于骨咒之力：你永久处于树肤术的效应之下，且无需专注。此外，在你的骨枝巨兽特性激活期间，你的体型变为大型，且每当你执行攻击动作时，你获得钝击、穿刺与挥砍伤害的抗性，持续到你的下个回合结束；若你受到火焰伤害，这些抗性会提前失去。' },
      { slug: 'briarheart', name: '荆棘之心', englishName: 'Briarheart', level: 14, kind: 'bonus-action', summary: '14级起骨枝巨兽双臂追加迅击词条，攻击动作后可用附赠动作施展骨咒法术。', description: '14级时你的融合大功告成，心脏被替换为能完全引导自然怒火的新器官：在骨枝巨兽形态下，你的手臂除缓速词条外还能应用迅击武器精通词条。此外，若你在自己的回合执行了攻击动作，你能以附赠动作施展一道施法时间为动作的骨咒法术（如脆骨投掷、指骨钉枪、臂骨加农、骨处女、惧骨之森等）。' },
    ],
  },

  // ============ 战士 fighter ============
  {
    slug: 'blood-hound',
    classSlug: 'fighter',
    name: '恶血猎犬',
    englishName: 'Blood Hound',
    summary: '在奥比图斯学院的噩梦实验中以百样生物的血液炼焦、本不应存于世的受诅武者。他们把自身鲜血织入攻击，以无法减免的暗蚀自伤换取超凡战果。子职围绕自选的血戮打击展开，配合血犬内构的追猎本能与浸血武器的伤害类型改写。',
    features: [
      { slug: 'blood-strike', name: '血戮打击', englishName: 'Blood Strike', level: 3, kind: 'choice', summary: '3级起从九种血戮打击中自选三种，每回合一次附加于武器攻击，次数为1＋体质调整值。', description: '3级起你从着魅、沸血、晶血、血缚、流放、猎杀、幽血、雷脉、凋零九种血戮打击中自选三种，5、9、13、17级各再学一种。每回合一次，执行攻击动作并进行武器攻击时可在命中前后应用一种，使用后你承受其血液损耗的暗蚀伤害且无法被减少或防止。次数为1＋体质调整值（至少1次），短休或长休全部恢复；DC＝8＋体质＋熟练。' },
      { slug: 'blood-hound-anatomy', name: '血犬内构', englishName: 'Blood Hound Anatomy', level: 3, kind: 'passive', summary: '3级起免疫魔法疫病、具毒素抗性与抗中毒优势，并擅于追踪曾伤害过的有血生物。', description: '3级起，你的身体适应了体内的污血：你免疫魔法疫病，获得毒素伤害的抗性，并在为避免或终止中毒状态而进行的豁免检定上具有优势。此外，一旦你与某个生物战斗过，你便能感知其血液进行追踪——在寻找一个你曾对其造成过伤害的有血生物时，你的智力（调查）与感知（察觉、求生）检定具有优势。' },
      { slug: 'blood-armament', name: '鲜血武备', englishName: 'Blood Armament', level: 7, kind: 'passive', summary: '7级起持握武器且未失能时该武器成为浸血武器，可改造成强酸、暗蚀或毒素伤害。', description: '7级起，只要你正持握一把武器且并未处于失能状态，该武器就被视为浸血武器。此类武器可以选择造成强酸、暗蚀或毒素伤害，以取代其原本的伤害类型；伤害类型随你的每次攻击自由选择，不需要动作，也不消耗任何资源。' },
      { slug: 'blood-explosion', name: '爆血', englishName: 'Blood Explosion', level: 7, kind: 'bonus-action', summary: '7级起浸血武器攻击未命中时可用附赠动作引爆血液，令目标及5尺内生物体质豁免。', description: '7级起，当你使用浸血武器进行一次攻击检定且未命中时，你可以立即用一个附赠动作引爆血液：目标以及以目标为源点5尺光环区域内除你之外的每个生物必须进行一次体质豁免，豁免失败时目标受到如同被该武器命中的伤害，豁免成功则只受到一半伤害。' },
      { slug: 'blood-of-creation', name: '血液创生', englishName: 'Blood of Creation', level: 10, kind: 'passive', summary: '10级起为血戮打击掷血液损耗时可重掷取低，并可在每次长休替换一个已知打击。', description: '10级起，你对体内的恶血有了更深的洞悉：当你为血戮打击的血液损耗进行掷骰时，你可以重掷结果并选择较低的数值，以减少自身承受的暗蚀伤害。此外，每当你完成一次长休，你可以把你所知的一个血戮打击选项替换为另一个不同的选项。' },
      { slug: 'blood-symphony', name: '恶血和鸣', englishName: 'Blood Symphony', level: 15, kind: 'passive', summary: '15级起每次使用血戮打击恢复体质调整值生命；目标1分钟内死亡则返还一次次数。', description: '15级起，万般造物皆化于血：每当你使用血戮打击时，你恢复等于你体质调整值（至少为1）的生命值。此外，若目标在受到你的血戮打击伤害后的1分钟内死亡，你恢复一次已消耗的血戮打击使用次数。' },
      { slug: 'improved-blood-strike', name: '进阶血戮打击', englishName: 'Improved Blood Strike', level: 18, kind: 'passive', summary: '18级起全部血戮打击选项增强：额外伤害骰普遍翻倍，流放打击另加光耀伤害。', description: '18级起，你的血戮打击选项全部得到增强：着魅、沸血、幽血、雷脉与凋零打击的额外伤害由2d6提升至4d6；晶血打击的额外穿刺伤害由1d6提升至3d6；血缚打击的两段强酸伤害都提升至4d6；猎杀打击的额外伤害提升至2d6；流放打击额外造成2d6光耀伤害。' },
    ],
  },

  // ============ 法师 wizard ============
  {
    slug: 'bone',
    classSlug: 'wizard',
    name: '骸骨巫觋',
    englishName: 'Osteomancer',
    summary: '深谙从骨骼中榨取力量的受诅法师，其学识只敢在夜幕掩护下被低声谈起。他们像提线木偶大师一样弯折敌人，却最钟爱把自己当作傀儡——为粉碎仇敌不惜亵渎己身血肉。子职以骨质护甲自保、接管有骨生物的躯体，并重塑自身骨骼潜行与伪装。',
    features: [
      { slug: 'brittle-bone-armor', name: '脆骨护甲', englishName: 'Brittle Bone Armor', level: 3, kind: 'action', summary: '3级起以动作（需未着甲持盾）获两倍法师等级临时生命，且AC＋2，持续1小时。', description: '3级起，作为一个动作，若你未着装护甲且未持用盾牌，你能从体内催生骨质保护外壳：获得等于你法师等级两倍的临时生命值，持续1小时。持有这些临时生命值期间，你获得穿刺与挥砍伤害抗性，且AC获得＋2加值。此特性一经使用须完成长休才能再次使用，也可消耗一枚不低于二环的法术位（无需动作）重置使用权。' },
      { slug: 'anatomical-expert', name: '解剖专家', englishName: 'Anatomical Expert', level: 3, kind: 'passive', summary: '3级起获医药熟练，医药与求生检定加智力调整值，涉有骨生物时视为专精。', description: '3级起，对操骨术的钻研要求你研究无数生物的解剖结构：你获得医药技能熟练，并在进行感知（医药、求生）检定时获得等于你智力调整值的加值（至少＋1）。此外，当这些检定涉及拥有骨骼的生物时，你视为具有该技能的专精；即便你原本没有求生熟练，也能在该检定上加入双倍熟练加值。' },
      { slug: 'bone-puppetry', name: '御骨操偶', englishName: 'Bone Puppetry', level: 6, kind: 'action', summary: '6级起以魔法动作令60尺内有骨生物力量豁免，失败则由你操纵其行动至其下回合结束。', description: '6级起，你能以魔法动作指定60尺内一个你可见且有骨骼的生物，它须对抗你法术豁免DC作力量豁免。失败时你精准控制其骨骼：直至其下个回合结束，它只能执行你选择的动作，无法做未经你允许的事；它对盟友的攻击检定具有劣势，其盟友抵抗它引发效应的豁免具有优势。你同时只能控制一个生物，次数等于智力调整值（至少1次），长休恢复。' },
      { slug: 'skeletal-mastery', name: '御骨宗师', englishName: 'Skeletal Mastery', level: 10, kind: 'passive', summary: '10级起可免法术位、无专注地施展变身术伪装，并能以魔法动作无骨化穿过窄缝。', description: '10级起你已是自身躯体的主宰。形态万千：你可重塑自身骨骼（含面部）伪装成他人，无需法术位地施展变身术，该次施展无需专注且限选改变外貌或天生武器。御骨塑形：你能以魔法动作消解或重组自身骨骼，无骨时速度变为10尺，可穿过窄至1寸的空间，但视为倒地、无法用手、不能攻击或施法；你可用附赠动作重塑手骨进行精细操作至你下回合结束。' },
      { slug: 'improved-bone-puppetry', name: '进阶御骨操偶', englishName: 'Improved Bone Puppetry', level: 14, kind: 'passive', summary: '14级起御骨操偶控制延长至1分钟，目标每回合末可重豁免，可耗次数使其劣势。', description: '14级起你更精通骨骼操纵：生物对抗御骨操偶失败时，控制延长至1分钟，目标无法抗拒命令，且不再对其盟友的攻击检定具有劣势、其盟友抵抗相关效应时也不再具有豁免优势；目标每回合结束时可重豁免，成功则终止。你须维持专注（如同专注法术），但受伤不打断；目标重豁免时，你可额外消耗一次使用次数令其该次豁免具有劣势，须在见掷骰前决定。' },
    ],
  },

  // ============ 游侠 ranger ============
  {
    slug: 'torture',
    classSlug: 'ranger',
    name: '酷刑密会',
    englishName: 'Torturer Conclave',
    summary: '隐于卢亚纳哈辉光之下、以审讯技艺守护城垣安宁的游侠密会。他们在疫病征兆显露之前就找出并审问受害者，并把折磨之术带上战场。密会成员以酷刑工具配合魔法驱动的技法无情瓦解敌人，深知落在敌手的命运同样如此。',
    features: [
      { slug: 'tools-of-the-trade', name: '行当用具', englishName: 'Tools of the Trade', level: 3, kind: 'passive', summary: '3级起获得酷刑工具与洞悉技能的熟练，并在两者的检定上具有专精。', description: '3级起你学会审讯与使用刑讯工具：你获得酷刑工具与洞悉技能的熟练，并且在这两者的检定上具有专精（加入双倍熟练加值）。酷刑工具是一套以最大限度制造疼痛的小工具挎包（售价20金币、负重10磅）：对其具有熟练者持续使用1小时可令被束缚的目标获得一级力竭，此后你对目标进行的魅力（威吓）检定获得两倍熟练加值的加值。' },
      { slug: 'torturer-techniques', name: '酷刑技法', englishName: 'Torturer Techniques', level: 3, kind: 'resource', summary: '3级起习得六种魔法驱动的技法，每种每长休可用两次，并能以法术位赋能强化。', description: '3级起习得六种技法（梳毛、剜目、挑筋、神经剥离、割喉、击破鼓膜）。以近战武器或徒手打击命中且手持酷刑工具时，可作为攻击的一部分使用一种技法，每次攻击限一种。每技法两次，长休恢复，也可耗一次宿敌次数（无需动作）恢复一次。还能耗法术位赋能（无需动作），追加感知调整值伤害且目标豁免减1d4至5d4；豁免DC＝8＋感知＋熟练。' },
      { slug: 'depraved-mind', name: '堕落之心', englishName: 'Depraved Mind', level: 7, kind: 'passive', summary: '7级起免疫恐慌并有心灵伤害抗性；读心或强行心灵感应者须感知豁免，否则受伤。', description: '7级起你已见识过世间最极端的堕落，且亲手造就了其中大多数：你免疫恐慌状态，并获得心灵伤害抗性。此外，若有生物试图读取你的思想或违背你的意愿与你心灵感应，它须先进行一次对抗你技法豁免DC的感知豁免；失败时它将目睹你内心的恐怖景象，受到等于你等级的心灵伤害且无法与你沟通；成功则它可以这种方式与你互动1分钟，期间无需重豁免。' },
      { slug: 'veil-of-pain', name: '苦痛面纱', englishName: 'Veil of Pain', level: 11, kind: 'resource', summary: '11级起以技法造成伤害时可迫使目标感知豁免，失败则1分钟内视你为隐形。', description: '11级起，当你以酷刑技法对生物造成伤害时，可无需动作地尝试用痛苦动摇其心智：目标必须成功通过一次对抗你技法豁免DC的感知豁免，否则它的大脑拒绝承认剧痛，只把你视作一闪而过的幻觉剪影，你对该目标而言具有隐形状态，持续1分钟；目标每回合结束时可以重豁免，成功则终止该效应。次数等于你的感知调整值（至少1次），长休后全部恢复。' },
      { slug: 'mental-agony', name: '精神创痛', englishName: 'Mental Agony', level: 15, kind: 'reaction', summary: '15级起以反应令60尺内曾在你技法豁免中失败的生物的心智豁免减去1d10。', description: '15级起你深谙如何在肉体与精神上给予猎物双重痛苦：当一个位于你60尺内、且自你上个回合开始以来曾在你的一项酷刑技法豁免中失败的生物进行智力、感知或魅力豁免检定时，你可以用反应亮出刀片、露出微笑或做出诸如此类的惊悚举动，使该次豁免检定减去1d10。对恐慌状态免疫的生物对此效果免疫。' },
    ],
  },

  // ============ 游荡者 rogue ============
  {
    slug: 'radiant-blade',
    classSlug: 'rogue',
    name: '光辉之刃',
    englishName: 'Blade of Radiance',
    summary: '被公认为教会最致命骑士教团之一、又称钢铁圣徒的狂信武者。候选者在高墙内受试炼，视神职人员为新的亲族，彻底斩断尘世羁绊。他们挥动重型兵刃如若无物，把神圣能量灌入剑刃：以圣刃无视邪魔与亡灵的伤害抗性，并以神圣点冻结攻击者、重掷检定或让光辉剑刃如暴雨降临。',
    features: [
      { slug: 'sanctified-champion', name: '崇圣天选', englishName: 'Sanctified Champion', level: 3, kind: 'passive', summary: '3级起获军用武器熟练与中甲受训，并可在每次短休仪式圣化一把近战武器为圣刃。', description: '3级起你的严酷训练结出硕果：你获得军用武器熟练以及中甲受训。每当你完成一次短休，你可以对一把你具有熟练、且造成穿刺或挥砍伤害的近战武器执行一场仪式将其圣化，使其成为你的圣刃；你同一时间只能拥有一把圣刃。对你而言该剑刃具有灵巧词条，并且你使用它对异怪、邪魔以及亡灵发动的攻击无视其伤害抗性。' },
      { slug: 'divine-blessings', name: '神圣恩泽', englishName: 'Divine Blessings', level: 3, kind: 'resource', summary: '3级起获得上限为1＋感知调整值的神圣点，短休或长休全恢复，可换取三种效应。', description: '3级起你拥有神圣点池，上限为1＋感知调整值，短休或长休全恢复。神圣点可换取：虔信盔甲（被攻击时以反应耗1点，令攻击者感知豁免，失败则改选目标且至你下回合开始不能再选你）；蒙受神启（历史、宗教或洞悉检定耗1点重掷d20并加感知调整值）；斩裂渎圣（攻击动作后以附赠动作耗1点再作一次圣刃攻击）。豁免DC＝8＋感知＋熟练。' },
      { slug: 'righteous-armament', name: '正义武装', englishName: 'Righteous Armament', level: 9, kind: 'resource', summary: '9级起神圣点新增审判锁链、神圣反击与圣刃爆发三种用法。', description: '9级起神圣点新增三种用法：审判锁链——圣刃命中耗1点，目标力量豁免失败即受等于感知调整值的光耀伤害并束缚至你下回合结束；神圣反击——持圣刃被近战致伤时以反应耗1点反击，伤害加感知调整值；圣刃爆发——命中且可偷袭时放弃偷袭、耗2点，令目标及45尺长、5尺宽的线状区域内生物敏捷豁免，失败受等同偷袭伤害的光耀伤害，成功减半。' },
      { slug: 'saintly-revelations', name: '化圣天启', englishName: 'Saintly Revelations', level: 13, kind: 'resource', summary: '13级起习得两道牧师戏法并始终准备英雄气概、防护善恶与虔诚护盾，可随意施展。', description: '13级起神圣启示向你展示如何以神圣能量强化剑刃：你从牧师法术列表自选习得两道戏法；此外你始终准备法术英雄气概、防护善恶与虔诚护盾，并可借由此特性免法术位与成分地随意施展，但目标仅能为你自身，施法属性为感知。自17级起这些法术不再需要专注，但你同一时间只能保持一道激活，施展第二道时前一道立即结束。' },
      { slug: 'final-judgement', name: '最终审判', englishName: 'Final Judgement', level: 17, kind: 'passive', summary: '17级起圣刃可以魔法动作施展灵体卫士（每次长休一次），并能发光追加2d4光耀。', description: '17级起你的圣刃被注入神圣力量。圣灵降世：持用剑刃期间能以魔法动作免法术位与成分地施展灵体卫士，用后须长休才能再用，也可耗3神圣点恢复使用权；该法术区域内生物视为在你一名盟友5尺内。辉耀利刃：以命令语让剑刃发出30尺明亮光照与额外30尺微光，直至你再次下令或收刀；发光时视其为魔法武器，命中额外造成2d4光耀伤害。' },
    ],
  },

  // ============ 野蛮人 barbarian ============
  {
    slug: 'galvanic',
    classSlug: 'barbarian',
    name: '雷脉道途',
    englishName: 'Path of the Lightning Vessel',
    summary: '被司祭盎植入电极导棒、再经高强度电击疗法改造而成的凶兽，雷霆在体内满溢激荡。他们总能出人意料地降临——从高楼纵身跃下，或跨越不可思议的距离轰然砸落战场中央。子职以雷脉伤害与无羁风暴的放电选项支配战场，让逃跑成为奢望。',
    features: [
      { slug: 'galvanic-heart', name: '雷霆之心', englishName: 'Galvanic Heart', level: 3, kind: 'passive', summary: '3级起获闪电伤害抗性（已有则进一步减伤），并确定雷脉豁免DC与雷脉伤害。', description: '3级起，闪电已成为你的一部分：你获得闪电伤害的抗性；若你已经拥有此抗性，则可进一步减免所受的闪电伤害——掷数量等于你狂暴伤害加值的d6并相加，该减免在结算抗性之后应用。此子职需要豁免的特性使用雷脉豁免DC＝8＋你的体质调整值＋熟练加值；部分特性使用的雷脉伤害为掷数量等于你狂暴伤害加值的d4之和，且始终造成闪电伤害。' },
      { slug: 'unbound-storm', name: '无羁风暴', englishName: 'Unbound Storm', level: 3, kind: 'bonus-action', summary: '3级起狂暴中可用附赠动作释放闪电：驱雷缚锁、掣电强袭与雷光瞬步三选项。', description: '3级起，狂暴中你可通过以下选项释放闪电：驱雷缚锁——附赠动作以闪电锁链缠住武器，本回合下次命中时目标受雷脉伤害并被锚固至你下回合开始，其间移动须过力量检定；掣电强袭——近战命中后附赠动作召落雷，目标受雷脉伤害，其10尺光环内生物敏捷豁免失败也受同伤；雷光瞬步——附赠动作移动至多速度一半，结束在生物5尺内时以闪电击之。' },
      { slug: 'roaring-crash', name: '轰雷坠击', englishName: 'Roaring Crash', level: 6, kind: 'bonus-action', summary: '6级起进入狂暴时跃起砸向30尺内地面，10尺内生物敏捷豁免，失败受双倍雷脉伤害。', description: '6级起，作为进入狂暴的一部分，你可跃入半空并坠击砸向30尺内一处可见、未被巨型或更大生物占据的地面空间，源自该落点的10尺光环区域内每个生物须进行一次敏捷豁免，失败受两倍于你雷脉伤害的伤害，成功则减半。若落点原本有生物，它进行该豁免时具有劣势，并被推离至周围5尺内由其选择的未占据空间；若无可用空间，则它改为陷入倒地。' },
      { slug: 'lightning-reflexes', name: '神速反射', englishName: 'Lightning Reflexes', level: 10, kind: 'passive', summary: '10级起敏捷检定加体质调整值（至少＋1），狂暴中每回合可免费使用一次雷光瞬步。', description: '10级起，你所驾驭的闪电把反射神经强化到超出躯体原本的极限：你在进行敏捷检定时获得等于你体质调整值的加值（至少＋1），先攻检定属于敏捷检定因而同样受益。此外，在你的狂暴激活期间，你在自己的每个回合内都可以无需消耗附赠动作地使用一次雷光瞬步。' },
      { slug: 'electric-beast', name: '狂电凶兽', englishName: 'Electric Beast', level: 14, kind: 'passive', summary: '14级起雷脉伤害可加体质调整值，三种无羁风暴选项全面强化。', description: '14级起你与体内闪电融为一体：可将体质调整值加入雷脉伤害，且无羁风暴选项获得强化。驱雷缚锁：被锚固者移动5尺即须力量（运动）检定，失败则无法执行反应至你下回合开始。掣电强袭：落雷光环扩至20尺，你可指定至多等于体质调整值的生物在该豁免中自动成功。雷光瞬步：突进距离提升至速度，并可身化闪电，以传送替代本次移动。' },
    ],
  },
]

export const steinhardtSubclasses2024: readonly SubclassRule[] = seeds.map((seed) => {
  const id = `subclass-2024-tp-sh-${seed.classSlug}-${seed.slug}`
  const features: readonly SubclassFeature[] = seed.features.map((feature) => ({
    id: `tp-sh-${seed.classSlug}-${seed.slug}-${feature.slug}`,
    subclassId: id,
    name: feature.name,
    englishName: feature.englishName,
    level: feature.level,
    summary: feature.summary,
    description: feature.description,
    kind: feature.kind,
    status: 'selectable',
    sourceIds: STEINHARDT,
  }))
  return {
    id,
    classId: `class-2024-${seed.classSlug}`,
    ruleset: '5e-2024',
    name: seed.name,
    englishName: seed.englishName,
    selectionLevel: 3,
    summary: seed.summary,
    status: 'selectable',
    availability: 'player',
    sourceIds: STEINHARDT,
    features,
  }
})
