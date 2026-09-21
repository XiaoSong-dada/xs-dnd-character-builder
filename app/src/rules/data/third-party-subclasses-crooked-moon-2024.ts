import type { SubclassFeature, SubclassFeatureKind, SubclassRule } from '@/types/rules'

/**
 * G3-I2：《歪曲之月》（Crooked Moon）第三方子职（2024 口径，15 条）。
 * 仅登记选择与展示所需元数据与原创中文摘要，效果不进入自动计算；
 * 来源 `source-2024-tp-crooked-moon` 为第三方合作内容，来源默认关闭、需 DM 同意。
 *
 * 登记口径：
 * - 2024 口径：全部子职选择等级为 3 级，职业挂载 id 形如 `class-2024-<classSlug>`；
 * - 特性中英文名、等级取自 CHM v2026.09.13 第三章对应小节正文，未回译、未改写专名；
 * - features 按等级升序列出资料中出现的全部等级特性，含「子职法术／领域法术」这类法术授予特性，
 *   特性内的等级增强项并入所属特性，不拆条；
 * - 法术授予类特性 kind 一律记 `resource`；其余 kind 按主要触发方式登记：资料明示动作／附赠动作／反应者照记，
 *   有限的可用次数与骰池、结晶池等资源池记 `resource`，需玩家在若干选项中挑选者记 `choice`，
 *   常驻增益与对既有能力的改写记 `passive`；
 * - 表格（漫游观览、邪恶宿敌、猩红起源、疫病症状、植入物形式等）、法术清单与噩兆数据卡不登记为特性；
 * - 需要玩家选择的选项不建立 RuleOption、不设 optionIds／requiresChoice，只在 description 内说明可选范围。
 */

const CROOKED_MOON = ['source-2024-tp-crooked-moon'] as const

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
    slug: 'whistle',
    classSlug: 'bard',
    name: '灵哨学院',
    englishName: 'College of Whistles',
    summary: '把「向逝者吹哨会引来亡魂」的古老迷信炼成真正魔法的吟游诗人学院。他们以口哨吹奏吟游魔法，把漂泊的精魂召唤到受激励的同伴身边，并顺着幽灵列车的轨道往返于曾到访之地。',
    features: [
      { slug: 'handy-haints', name: '助人祟魂', englishName: 'Handy Haints', level: 3, kind: 'passive', summary: '以诗人激励鼓舞他人时召出祟魂灵光，形态三选一并各赋予反应选项。', description: '当你用诗人激励鼓舞一个生物时，可召出漂浮其周的祟魂，在15尺光环内发出灵光1分钟。形态三选一：牢骚鬼令光环内生物威吓与力量豁免有优势，可用反应把激励骰＋魅力加为伤害；冒失鬼令受激励者与盟友对抗远程攻击时视为半身掩护，可用反应等量减伤；捣蛋鬼令在光环内开始回合者速度＋10尺，可用反应让失败豁免重掷d20。' },
      { slug: 'whistling-wanderer', name: '漫游吹哨人', englishName: 'Whistling Wanderer', level: 3, kind: 'passive', summary: '长休时把普通容器变成魔法行囊，并可用口哨替代吟游诗人法术的言语成分。', description: '旅者行囊：每次完成长休时，你可触碰一个非魔法背包、麻袋或类似容器，将其变为效果等同霍华德便利袋的魔法行囊；若再造一个、行囊离你超过1里或你死亡，魔法失效并把内装物倾倒到最近未占据空间。灵哨法术：你可以用口哨声替代吟游诗人法术的言语成分；不熟悉这一传统的观察者须通过DC15的智力（奥秘）检定，才能仅凭口哨识破你在施法。' },
      { slug: 'homeward-bound', name: '陌路归途', englishName: 'Homeward Bound', level: 6, kind: 'resource', summary: '长休时留下目的地标记，可用以施展传送法阵召唤幽灵列车；9级起始终准备该法术。', description: '完成长休时，你可以用颜料、粉笔或雕刻等方式在一处地点留下可擦除的标记。此后你可用此特性施展传送法阵并以该标记为目的地，让幽灵列车接走踏入法阵的生物；如此使用后须长休才能再次使用。你同时保有的标记至多等于魅力调整值（至少1个），超出时放弃一个旧标记。9级起你始终准备传送法阵，并可用任意已标记地点作为其目的地。' },
      { slug: 'ride-the-rails', name: '幽轨急行', englishName: 'Ride the Rails', level: 6, kind: 'action', summary: '魔法动作吹哨召出幽灵火车头，携盟友沿线疾驰并震慑途中生物，长休恢复。', description: '以魔法动作吹哨召出幽灵火车头，沿长120尺、宽5尺的线状区域疾驰并穿过物件与生物。你与30尺内至多6个自愿生物登车，传送到区域内未占据空间；区域内其他生物须对抗你法术豁免DC进行感知豁免，失败者耳聋至你下回合开始、被推离源点至多10尺，并受激励骰掷三次总值的心理伤害。用后须长休，也可耗三环以上法术位（无需动作）恢复。' },
      { slug: 'last-stop', name: '终点站', englishName: 'Last Stop', level: 14, kind: 'action', summary: '魔法动作吹响300尺可闻的口哨，诅咒至多6个生物，令其受伤时恐慌且易伤。', description: '以魔法动作吹响300尺内可闻的口哨；该范围内至多6个所选可见生物须对抗你法术豁免DC进行魅力豁免，失败则被诅咒。被诅咒目标受到心灵伤害时会对来源恐慌至其下回合结束；它第一次受到心灵伤害时对心灵伤害具有易伤。它每回合结束可重复该豁免，成功即终止，1分钟后自动成功。用后须长休，也可耗七环以上法术位（无需动作）恢复。' },
    ],
  },

  // ============ 圣武士 paladin ============
  {
    slug: 'castigation',
    classSlug: 'paladin',
    name: '惩戒之誓',
    englishName: 'Oath of Castigation',
    summary: '以「烧尽疑虑、涤罪净恶」为信条的圣武士誓言，认定邪恶虽古旧却并非无穷，誓要将其连根焚尽。他们用烈焰镣铐锁缚罪人、以诘问迫出谎言，并让灵光内的同伴无视火焰与光耀抗性。',
    features: [
      { slug: 'castigate', name: '惩奸除恶', englishName: 'Castigate', level: 3, kind: 'action', summary: '魔法动作耗引导神力，以烈焰镣铐锁住30尺内多名生物，可附赠引爆2d6火焰。', description: '你可以使用魔法动作消耗一次引导神力次数，选择30尺内至多等于你魅力调整值（至少1个）的可见生物，以烈焰镣铐将其锁缚。每个目标须进行力量豁免，失败者被锁缚且速度减为0；你可用附赠动作令镣铐爆发炽焰，所有被锁缚生物各受2d6火焰伤害。被锁缚生物在其回合结束时重复该豁免，成功即终止，1分钟后自动成功。' },
      { slug: 'incite', name: '诘问真心', englishName: 'Incite', level: 3, kind: 'action', summary: '魔法动作耗引导神力，10分钟内洞悉与调查有优势，可附赠动作使目标恐慌且无法说谎。', description: '你可以使用魔法动作消耗一次引导神力次数，在接下来的10分钟内，你的感知（洞悉）与智力（调查）检定具有优势。持续期间，你还可以用附赠动作选择10尺内一个可见生物，目标须通过魅力豁免，失败则陷入恐慌1分钟，且在此期间不能故意说谎；目标受到伤害或你再次使用该附赠动作时，此效应提前结束。' },
      { slug: 'oath-spells', name: '惩戒之誓法术', englishName: 'Oath of Castigation Spells', level: 3, kind: 'resource', summary: '3／5／9／13／17级按惩戒之誓法术表始终准备对应法术，不占准备数量。', description: '誓言具有的魔法使你始终准备特定法术：3级神恩、致伤术；5级判罪锁链、定身类人；9级法术反制、死者交谈；13级薪火焚身、生物定位术；17级焰击术、定身怪物。到达表中对应的圣武士等级即自动获得并始终准备，不计入你的准备法术数量，其中判罪锁链与薪火焚身为本书新增法术。' },
      { slug: 'kindling-aura', name: '火种灵光', englishName: 'Kindling Aura', level: 7, kind: 'passive', summary: '灵光内你与盟友无视火焰与光耀抗性，可改用火焰伤害，洞悉与调查另加魅力加值。', description: '你和你的守护灵光内的盟友无视生物对火焰与光耀伤害的抗性；受此影响的生物用武器攻击命中时，可以选择造成火焰伤害而非该武器的通常伤害类型。此外，你和灵光内受影响的生物可以把你的魅力调整值（至少＋1）加到感知（洞悉）与智力（调查）检定上。' },
      { slug: 'fervent-inquisitor', name: '炽诚审判', englishName: 'Fervent Inguisitor', level: 15, kind: 'reaction', summary: '生物伤害你或30尺内盟友时可反应，使你对它的下次攻击有优势，并能察觉其近期谎言。', description: '当一个生物对你或你30尺内一个可见盟友造成伤害时，你可以使用反应，使你对该生物的下一次攻击检定具有优势。此外，当你对处于浴血状态的生物造成火焰或光耀伤害时，你会察觉到该生物在过去24小时内曾自愿且故意对你说过的任何谎言。' },
      { slug: 'fire-and-brimstone', name: '硫磺烈火', englishName: 'Fire and Brimstone', level: 20, kind: 'bonus-action', summary: '附赠动作化身涤罪之焰10分钟：免疫火焰、触及＋10尺、借机攻击可令敌人倒地。', description: '你可以使用附赠动作化身涤罪之焰，持续10分钟或直到你提前结束。期间你免疫火焰伤害，触及范围增加10尺且近战攻击无视半身与四分之三掩护；当你以借机攻击命中一个生物，或敌对生物在你的触及范围内结束回合时，它须通过魅力豁免，否则倒地且速度减为0直至其下回合开始。用后须长休，也可消耗五环法术位（无需动作）重置。' },
    ],
  },

  // ============ 德鲁伊 druid ============
  {
    slug: 'old-ways',
    classSlug: 'druid',
    name: '旧途结社',
    englishName: 'Circle of the Old Ways',
    summary: '与至暗森林腹地的远古森林融为一体的德鲁伊结社，与寄居古树的妖精族亡魂沟通，唤来真正原始的力量。他们以长老木强化武具、树化自身，成为最古老蛮荒之地的守护者。',
    features: [
      { slug: 'circle-spells', name: '旧途结社法术', englishName: 'Circle of the Old Ways Spells', level: 3, kind: 'resource', summary: '3／5／7／9级按旧途结社法术表始终准备对应法术，不占准备数量。', description: '当你到达旧途结社法术表中特定的德鲁伊等级时，就始终准备表中对应的法术：3级橡棍术、先祖授慧、虔诚护盾、树肤术、荆棘丛生；5级防护法阵、植物滋长；7级行动自如、魔邓肯私人密室；9级启蒙术、树跃术。这些法术由结社直接赋予，不计入你的准备法术数量，其中先祖授慧为本书新增法术。' },
      { slug: 'bough-and-branch', name: '主干与分枝', englishName: 'Bough and Branch', level: 3, kind: 'passive', summary: '施展橡棍术时可在空手中长出木盾，并可用强化武器作德鲁伊法器、免姿势成分。', description: '在你的手中，最低微的武器也能引导古老森林的威能。施展橡棍术时，你可以在空闲的手中长出一面扭曲木材制成的盾牌（无需动作即可穿戴），该盾牌在法术结束时消失；除非你陷入失能，否则无法被迫放下受该法术影响的武器或盾牌。法术持续期间，你无视德鲁伊法术的姿势成分，并可将被强化的武器用作德鲁伊法器。' },
      { slug: 'wood-wose', name: '树灵化身', englishName: 'Wood Wose', level: 3, kind: 'bonus-action', summary: '附赠动作或随橡棍术消耗荒野变形，10分钟内获得树皮AC、汁液牵制与力体豁免优势。', description: '你可以用附赠动作，或在施展橡棍术的同时消耗一次荒野变形次数，以原始森林的力量浸润自身10分钟，也可随时解除。期间未着装护甲时你的基础AC为10＋敏捷调整值＋感知调整值；以橡棍术强化的武器命中时，目标被长老木汁液包裹至你下回合开始，对除你以外的目标攻击具有劣势；你在力量与体质豁免中具有优势。' },
      { slug: 'oak-and-thorn', name: '橡木与荆棘', englishName: 'Oak and Thorn', level: 6, kind: 'passive', summary: '树灵化身期间攻击动作可攻击两次，且每回合一次近战命中额外造成1d6穿刺伤害。', description: '长老木的怒火驱使你惩罚敌人。当你激活树灵化身特性时，在持续时间内额外获得两项增益：橡木圣拳让你在自己回合执行攻击动作时可以攻击两次而非一次；缠结荆棘让你每回合一次在以武器进行近战攻击命中生物时，额外造成1d6穿刺伤害。' },
      { slug: 'deepwood-elder', name: '深林长者', englishName: 'Deepwood Elder', level: 10, kind: 'passive', summary: '树灵化身期间获得倒地摔绊、荆棘反伤与每回合的临时生命值三项增益。', description: '你与长老木的联系愈发紧密。激活树灵化身期间，你额外获得三项增益：每回合一次以近战攻击命中时，可迫使目标通过对抗你法术豁免DC的力量豁免，失败则倒地；5尺内的生物以近战攻击命中你时受到1d8穿刺伤害（每回合至多一次）；激活该特性时以及之后你的每个回合开始时，你获得等于熟练加值＋感知调整值的临时生命值。' },
      { slug: 'ancient-protector', name: '远古守卫', englishName: 'Ancient Protector', level: 14, kind: 'passive', summary: '树灵化身期间体型可变为大型、触及＋5尺，获得钝击穿刺抗性并可反应反击。', description: '当你唤醒自己与长老木之间的联结时，将成为其远古威能的化身。激活树灵化身期间，若有足够空间，你的体型连同穿着携带之物一同变为大型，触及范围增加5尺；你对钝击与穿刺伤害具有抗性；当你触及范围内一个被长老木汁液覆盖的生物进行攻击检定时，你可以使用反应对它进行一次近战攻击。' },
    ],
  },
  {
    slug: 'wicker',
    classSlug: 'druid',
    name: '柳艺结社',
    englishName: 'Circle of Wicker',
    summary: '把魔法编织进柳条人偶与塑像的德鲁伊结社，以护佑符咒与惩戒誓言守护乡土。他们让塑像的灵光赐福友军或降祸敌人，并通过柳编符咒把触碰法术送到远方。',
    features: [
      { slug: 'bewitched-effigy', name: '巫咒塑像', englishName: 'Bewitched Effigy', level: 3, kind: 'bonus-action', summary: '附赠动作耗荒野变形造出柳条塑像，30尺灵光内可选祭焰、慰灵或结界。', description: '以附赠动作耗一次荒野变形，在30尺内造出柳条塑像：小型物件（AC15、HP＝等级×5、火焰易伤、免疫毒素与心灵），持续1分钟并在其30尺光环内发出所选灵光。三选一：祭焰，灵光内生物受伤时可用反应造成1d8＋感知火焰伤害；慰灵，创造时与后续回合可用附赠动作治疗灵光内一个生物1d6生命值；结界，灵光内你与盟友AC＋1。' },
      { slug: 'circle-spells', name: '柳艺结社法术', englishName: 'Circle of Wicker Spells', level: 3, kind: 'resource', summary: '3／5／7／9级按柳艺结社法术表始终准备对应法术，不占准备数量。', description: '当你达到柳艺结社法术列表中提及的德鲁伊等级时，便始终准备列出的法术：3级灾祸术、祝福术、夏日之风、诚实之域；5级降咒、李欧蒙小屋；7级防死结界、牧人圣所；9级定身怪物、幸运符。它们由结社直接赋予并始终准备，不占用你的准备法术数量，其中夏日之风、牧人圣所与幸运符为本书新增法术。' },
      { slug: 'wicker-token', name: '柳编符咒', englishName: 'Wicker Token', level: 3, kind: 'passive', summary: '长休时造出熟练加值数量的柳编符咒，可对携带符咒者施展触碰距离的法术。', description: '你可以编织带有自身魔法的柳编符咒：每次完成长休时创造数量等于你熟练加值的符咒（微型物件，AC5、HP1、免疫毒素与心灵伤害），它们在你完成下一次长休时消失。当你和携带你符咒的生物处于同一存在位面时，你可以对它施展施法距离为触碰的法术，无需靠近即可传递。' },
      { slug: 'wicker-rising', name: '精进柳艺', englishName: 'Wicker Rising', level: 6, kind: 'passive', summary: '塑像三种灵光全面强化：祭焰2d8、慰灵1d8并可解状态、结界给伤害抗性。', description: '你通过柳条塑像引导的能量变得更为强大：祭焰的火焰伤害提升为2d8＋你的感知调整值；慰灵的治疗提升为1d8，且你可消耗塑像5点生命值移除目标身上魅惑、恐慌、麻痹、中毒、震慑之一；结界改为由你选择一种除力场外的伤害类型，身处灵光内的你与盟友对该类型伤害具有抗性。' },
      { slug: 'soulbound-poppet', name: '缚魂娃娃', englishName: 'Soulbound Poppet', level: 10, kind: 'action', summary: '魔法动作耗荒野变形，为60尺内可见生物造出娃娃，令其被攻击劣势且承伤加重。', description: '你可以使用魔法动作消耗一次荒野变形次数，选择60尺内一个可见生物，创造出与目标外观相似的柳条娃娃（微型物件，AC10、HP10、火焰易伤、免疫毒素与心灵伤害），1分钟后或生命值归零时消失。娃娃存在期间，目标对携带娃娃者的攻击检定具有劣势，且携带者每回合首次对目标造成伤害时，目标额外受到2d10暗蚀伤害。' },
      { slug: 'wicker-zenith', name: '极境柳艺', englishName: 'Wicker Zenith', level: 14, kind: 'passive', summary: '回合开始可更换塑像灵光，且祭焰升至3d8、慰灵解除魅惑恐慌、结界给豁免优势。', description: '你的柳条塑像已达力量极致。在你的回合开始时，你可以把塑像的灵光改为另一种；所有灵光同时强化：祭焰的火焰伤害提升为3d8＋你的感知调整值；当你或盟友在灵光内开始自己回合时，可终止其身上的魅惑或恐慌状态（由目标选择）；结界改为选择一项属性，身处灵光内的你与盟友以该属性进行的豁免检定具有优势。' },
    ],
  },

  // ============ 战士 fighter ============
  {
    slug: 'tomb-warden',
    classSlug: 'fighter',
    name: '陵墓守卫',
    englishName: 'Barrow Guard',
    summary: '承载亡者能量、驾驭幽冥之力的战士，多为死而复生者或神圣墓穴的哨兵。他们以尸鬼骰驱动幽灵坐骑、减伤与夺魂之手，确保亡者无论生前善恶皆得安息。',
    features: [
      { slug: 'death-knight', name: '死亡骑士', englishName: 'Death Knight', level: 3, kind: 'resource', summary: '获得尸鬼骰池，可召幽灵坐骑、反应减伤与远程夺魂，短休回1枚长休回满。', description: '逝去之灵的残留意志化作尸鬼骰：3级4枚d6，随等级增大增多，短休恢复1枚、长休恢复全部。幽冥骑士：附赠动作召出仅你可骑的幽灵坐骑，疾走时耗骰使速度＋骰值×5尺。守墓陵卫：受伤时以反应耗骰，减伤骰值＋体质调整值。灵魂收割：攻击动作中放弃一次攻击，令60尺内生物力量豁免，失败受骰值＋体质暗蚀伤害并受擒1分钟。' },
      { slug: 'siphoning-souls', name: '摄魂夺魄', englishName: 'Siphoning Souls', level: 7, kind: 'passive', summary: '30尺内敌人死亡可用反应取回一枚尸鬼骰，属性检定可耗骰加入结果。', description: '你学会捕捉灵魂逝去时流溢的精华。尘世残痕：当你30尺内一个非构装、非亡灵的敌人死亡时，你可以使用反应恢复一枚已消耗的尸鬼骰。逝者低语：当你进行属性检定时，可以消耗并掷出一枚尸鬼骰，把骰值加入结果总值。' },
      { slug: 'tomb-castellan', name: '镇墓使', englishName: 'Tomb Castellan', level: 10, kind: 'passive', summary: '坐骑可传送并造成范围暗蚀伤害，守墓陵卫反伤，灵魂收割的受擒者持续受伤。', description: '你的死亡骑士特性全面提升：幻影战骑让坐骑无视困难地形，并可在坐骑疾走、撤离或回避时耗骰将其传送至60尺内未占据空间（带你同行），出现时10尺内你所选生物体质豁免失败受骰值＋体质暗蚀伤害；断魂丧钟让守墓陵卫的伤害来源额外受减伤值一半的心灵伤害；幽声尖啸让灵魂收割的受擒者每回合开始受熟练加值的心灵伤害，你可再耗骰加值。' },
      { slug: 'grave-lord', name: '冥墓尊主', englishName: 'Grave Lord', level: 15, kind: 'passive', summary: '坐骑可载他人并穿过固体，守墓陵卫给伤害抗性，受擒者同时陷入束缚。', description: '你成为幽冥之力的主宰。苍白之骑：使用幽冥骑士时可准许一个自选生物同乘，坐骑疾走中耗骰时可穿过生物与固体物件；若坐骑回合结束时仍在固体内，坐骑与骑乘者各受1d10力场伤害并被挤出。冢灵护盾：用守墓陵卫时选定触发伤害类型，你对该类型有抗性至下回合开始。死魂扼缚：受擒于灵魂收割的生物同时陷入束缚，直到擒抱终止。' },
      { slug: 'might-of-the-necropolis', name: '幽都加冕', englishName: 'Might of the Necropolis', level: 18, kind: 'passive', summary: '不再受衰老影响且无需空气饮食睡眠，掷先攻时尸鬼骰不足3枚即补足。', description: '你对所传授秘密的掌控已臻化境。永夜守望：你不再受衰老影响，无法被魔法性地变老，也不会因年老而死，并且不再需要空气、饮食与睡眠。不眠亡者：当你掷先攻时，若你拥有的尸鬼骰少于3枚，则恢复已消耗的尸鬼骰直到你具有3枚。' },
    ],
  },

  // ============ 术士 sorcerer ============
  {
    slug: 'crimson',
    classSlug: 'sorcerer',
    name: '猩红术法',
    englishName: 'Crimson Sorcery',
    summary: '操纵血液与生命精华的古老术法，力量或来自血脉，或得自黑暗仪式与残酷遭遇。他们用血源强化伤害与治疗，能化作血池潜行，也能把敌人的生机据为己有。',
    features: [
      { slug: 'blood-well', name: '血源', englishName: 'Blood Well', level: 3, kind: 'resource', summary: '获得血源储备，造成伤害或治疗时可消耗它加1d8，长休或单次10点暗蚀伤害后重置。', description: '你拥有一份名为血源的生命能量储备，用来增强魔法并驱动该子职的其他能力。当你对一个生物造成伤害或恢复其生命值时，可以消耗血源，为该次结果总值加上1d8。完成一次长休，或你一次性对一名生物造成10点或更多暗蚀伤害时，你重置已消耗的血源。' },
      { slug: 'crimson-spells', name: '猩红法术', englishName: 'Crimson Spells', level: 3, kind: 'resource', summary: '3／5／7／9级按猩红法术表始终准备对应法术，不占准备数量。', description: '当你达到猩红法术表中所述的相应术士等级时，视为始终准备了列出的法术：3级血蚀箭、疗伤术、致伤术、援助术、血祭；5级血腥丰获、汲血之触；7级防死结界、牺牲虹吸；9级收割场、群体疗伤术。它们不占用你的准备法术数量，其中血蚀箭、血祭、血腥丰获、牺牲虹吸与收割场为本书新增法术。' },
      { slug: 'pool-of-blood', name: '身化血池', englishName: 'Pool of Blood', level: 6, kind: 'bonus-action', summary: '附赠动作耗血源溶解为血池1小时：速度10尺、可攀爬穿缝、多项抗性与豁免优势。', description: '以附赠动作消耗血源，把自身与携带物溶解为一滩血池，持续1小时，生命值降至0或你提前结束时终止。期间速度变为10尺并获得等值攀爬与游泳速度，可在难攀表面（含天花板）免检定攀爬；具有钝击穿刺挥砍抗性，免疫倒地，力敏体豁免有优势；能穿小洞窄缝并进入其他生物空间，但不能放下或使用随身物品，也不能说话、操作物件、攻击或施法。' },
      { slug: 'scarlet-vigor', name: '殷红生机', englishName: 'Scarlet Vigor', level: 6, kind: 'passive', summary: '获得暗蚀伤害抗性，并可在短休时消耗血源降低一级力竭。', description: '你对暗蚀伤害具有抗性。此外，当你完成一次短休时，你可以消耗血源，使你身上的力竭等级降低1级（须确实处于力竭状态）。血源需靠长休或单次造成10点以上暗蚀伤害重置，因此短休疗愈往往要求你提前保留储备。' },
      { slug: 'vital-siphoning', name: '汲命', englishName: 'Vital Siphoning', level: 14, kind: 'bonus-action', summary: '附赠动作消耗一枚生命骰，选择重置血源或免费应用一次超魔法。', description: '你能汲取自身的生命精粹为魔法供能。你可以使用附赠动作消耗一枚生命骰，并从两项增益中选择其一：沸血——你重置血源的使用权；猩红脉动——你消耗血源，使你在本回合内应用的下一次超魔法选项不消耗术法点。' },
      { slug: 'sanguine-feast', name: '血宴', englishName: 'Sanguine Feast', level: 18, kind: 'action', summary: '魔法动作放出鲜血触须，30尺内所选生物体质豁免失败受5d8暗蚀，并为你回复生命。', description: '你对生命精华的渴求已无法满足。你可以使用魔法动作释放鲜血触须，鞭打30尺内你所选的任意生物：目标须通过体质豁免，失败受5d8暗蚀伤害，成功则只受一半；若你的血源已被消耗，目标在该豁免中具有劣势。只要至少一个生物受到伤害，你就恢复等于伤害掷骰结果的生命值。用后须长休，也可消耗5点术法点重置使用权。' },
    ],
  },

  // ============ 武僧 monk ============
  {
    slug: 'plague',
    classSlug: 'monk',
    name: '疫障武者',
    englishName: 'Warrior of the Pestilent Haze',
    summary: '把瘟疫引入自身、与之共融，使疾病成为自我的一部分的武僧。他们常伴随甚至先于疫病浪潮而行，以利爪与毒瘴疫病惩戒敌人，只在自己认定的该扑杀之处释放疫病。',
    features: [
      { slug: 'contagious-discipline', name: '疫病之道', englishName: 'Contagious Discipline', level: 3, kind: 'passive', summary: '指甲化为利爪可改打挥砍，疾风连击追加暗蚀，并可耗1点功力施加毒瘴疫病。', description: '疠爪：指甲长成害兽利爪，徒手打击命中时可造成挥砍而非钝击伤害，以疾风连击命中时额外造成等于武艺骰暗蚀伤害。毒瘴疫病：徒手打击命中时可耗1点功力迫使目标体质豁免，失败则被诅咒1分钟，期间中毒且你的徒手打击额外造成等于武艺骰暗蚀伤害（每回合至多一次）；它每回合结束可重复该豁免。若放弃疠爪的额外伤害，可免耗功力使用毒瘴疫病。' },
      { slug: 'gift-of-pestilence', name: '疫赐感悟', englishName: 'Gift of Pestilence', level: 3, kind: 'passive', summary: '抗毒抗暗蚀并优势抵抗中毒，可与害兽沟通，并能以感知施展动物信使一次。', description: '预防接种：你为避免或终止中毒与魔法疫病而作的豁免具有优势，并对毒素与暗蚀伤害具有抗性。害兽亲缘：你能以声音和手势向老鼠、鸽子、昆虫等害兽传达简单概念，也能解读它们的叫声与动作，友好的害兽可转述近期见闻。此外，你可以用感知作为施法属性施展动物信使，目标为一个被视为害兽的微型野兽；如此施展后须完成长休才能再次施展。' },
      { slug: 'potent-plague', name: '烈性瘟疫', englishName: 'Potent Plague', level: 6, kind: 'passive', summary: '你造成暗蚀或毒素伤害时，忽略目标对这些伤害类型的抗性。', description: '你的瘟疫毒株变得更加剧毒和致命。当你造成暗蚀或毒素伤害时，你忽略目标对这些伤害类型的抗性（如果有），因此此类伤害不再被抗性削弱。' },
      { slug: 'tolling-censer', name: '报丧香炉', englishName: 'Tolling Censer', level: 6, kind: 'action', summary: '魔法动作耗2点功力，在20尺光环内释放瘴气，令所选生物受伤并被疫病诅咒。', description: '你可以使用魔法动作消耗2点功力，在源自你的20尺光环区域中释放一团瘴气。该区域内所有你选择的生物都必须进行一次体质豁免，失败则受到等于两枚你武艺骰总值的暗蚀伤害并被你的毒瘴疫病诅咒，成功则只受一半伤害。' },
      { slug: 'miasmic-contagion', name: '致病毒瘴', englishName: 'Miasmic Contagion', level: 11, kind: 'passive', summary: '对抗毒瘴疫病的体质豁免具有劣势，且疾步如风期间靠近敌人即可传播诅咒。', description: '你的毒瘴疫病威力增强。窒息毒瘴：为对抗你的毒瘴疫病而进行的体质豁免具有劣势。迅速传播：当你消耗1点功力使用疾步如风时，直至该回合结束，如果你进入你所选任意生物5尺内的空间，它必须进行一次体质豁免，失败即被你的毒瘴疫病诅咒；一个生物每回合只进行一次此豁免。' },
      { slug: 'epidemic', name: '疫劫降临', englishName: 'Epidemic', level: 17, kind: 'passive', summary: '毒瘴疫病无视中毒免疫，且你对被诅咒目标造成暗蚀伤害时额外追加一枚武艺骰。', description: '你的瘟疫已达到效力顶峰，症状能迅速折磨敌人。你的毒瘴疫病无视目标对中毒状态的免疫。此外，当你对一个被你的毒瘴疫病诅咒的目标造成暗蚀伤害时，它额外受到等于你武艺骰的暗蚀伤害。' },
    ],
  },

  // ============ 法师 wizard ============
  {
    slug: 'occultist',
    classSlug: 'wizard',
    name: '神秘学者',
    englishName: 'Occultist',
    summary: '窥探宇宙帷幕、吞噬禁忌秘闻的法师，把施法技艺的理解推向撕裂现实的极限。他们以不断增大的侵扰骰赌取异星之力，并任由彼方的存在借自己的法术侵入现实。',
    features: [
      { slug: 'forbidden-knowledge', name: '禁忌学识', englishName: 'Forbidden Knowledge', level: 3, kind: 'resource', summary: '习得深渊语或自选语言，并始终准备一道自选的1环魔契师法术，长休可更换。', description: '在探索禁忌力量的过程中，你掌握了深渊语，或一门由你选择的其他语言。此外，你可以从魔契师法术列表中选择一道1环法术并始终准备；每次完成长休时，你都可以更改所选的这道法术。' },
      { slug: 'intrusion', name: '侵扰', englishName: 'Intrusion', level: 3, kind: 'resource', summary: '获得随使用升降的侵扰骰，掷1则现实破裂，另可以风险换取法术强化。', description: '你拥有一枚侵扰骰，初始为d6，上限随法师等级提升（5级d8、11级d10、17级d12）。用带侵扰风险的特性时投掷：掷出2以上则无事且骰子降一级；掷出1则骰子升一级并触发侵扰表的现实破裂效应。短休时骰子升一级，长休重置为初始尺寸。此外，用法术位施法时可冒险令目标首次豁免劣势或自身首次攻击检定优势。' },
      { slug: 'reality-tear', name: '现实撕裂', englishName: 'Reality Tear', level: 6, kind: 'resource', summary: '始终准备一道自选的3环以下魔契师法术，可冒险免专注，或引发侵扰免费施展。', description: '你从魔契师法术列表中选择一道3环或更低环阶的法术并始终准备，长休时可更改选择。施展该法术时，你可以冒着侵扰风险移除其专注需求，法术将在1分钟或正常持续时间（取较短者）后结束。此外，你可以引发一次自动侵扰并让侵扰骰升一级（不超过初始尺寸），从而不消耗法术位地施展该法术一次，长休后重获这种施法能力。' },
      { slug: 'occult-presence', name: '玄秘显现', englishName: 'Occult Presence', level: 10, kind: 'choice', summary: '引发侵扰时可掷两次侵扰表取其一，或以1级力竭抵消，并可选一项异星增益。', description: '当你引发侵扰时，可在侵扰表上投掷两次并选用其中一个结果，也可以通过获得1级力竭来抵消此次侵扰。此外，你从异星神智（免疫魅惑与恐慌、无法被附身）、宇宙抗性（暗蚀与心灵抗性）、空间支配（获得等速飞行并能悬浮）中选择一项增益，长休时可更换；你也可以用附赠动作引发一次自动侵扰（侵扰骰升一级），来更改所选的增益。' },
      { slug: 'beyond-space', name: '超越空间', englishName: 'Beyond Space', level: 14, kind: 'resource', summary: '始终准备探知，施展时可取身体部分级联系或改为动作施法，并能带人传送。', description: '距离与位置的本质被揭露为虚幻的谎言：你始终准备着法术探知。施展探知时，你可冒着侵扰风险选择全知（与目标的联系程度视为你持有其身体部分）或全视（改用动作施展该法术）。此外，施展探知期间，你可引发一次自动侵扰（侵扰骰随之升一级），把自己与10尺内的自愿生物传送至探知传感器可见的未占据空间；如此传送后须完成长休才能再次使用。' },
    ],
  },
  {
    slug: 'sage',
    classSlug: 'wizard',
    name: '贤者',
    englishName: 'Philosopher',
    summary: '把奥术研究聚焦于存在与现实的根本性质，并以炼金术实践操控这些力量的法师。他们分解万物取得精粹结晶，用结晶代替材料、提升法术环阶，最终提炼出贤者之石。',
    features: [
      { slug: 'alchemical-knowledge', name: '炼金学识', englishName: 'Alchemical Knowledge', level: 3, kind: 'passive', summary: '获得炼金工具及熟练，可用炼金工具作奥术法器并替代常规工具制作魔法物品。', description: '你获得一套炼金工具并拥有炼金工具熟练，可以将它用作施展法师法术的奥术法器。此外，你可以使用炼金工具代替常规工具来制作魔法物品，从而把炼金术直接用于你的奥术研究与实践。' },
      { slug: 'quintessence', name: '精粹结晶', englishName: 'Quintessence', level: 3, kind: 'resource', summary: '习得瓦解术，分解生物或物件可得精粹结晶，可代材料、辅助抄录或改伤害为力场。', description: '你掌握「分解」原理并习得戏法瓦解术：用它把生物或物件的生命值降至0时目标被摧毁，若为小型或更大则分解出1份精粹结晶，你同时持有的上限为智力调整值两倍（至少2份）。使用正在触碰的结晶可以：代替价值100GP的法术材料成分；在抄录法术或制作魔法物品时各代替50GP材料；施展伤害法术时消耗1份，把一种伤害改为力场伤害。' },
      { slug: 'albedo', name: '白化之炼', englishName: 'Albedo', level: 6, kind: 'passive', summary: '使用法术位施法时可消耗1份精粹结晶，使该法术位环阶提升一环，至多九环。', description: '你可以纯化精粹结晶来增幅法术：当你使用法术位施展一道法术时，可以消耗1份精粹结晶作为额外材料成分，使该法术位的环阶提升一环，最高不超过九环。你在任意一道法术上以此方式消耗的结晶上限为熟练加值的一半（向上取整）。' },
      { slug: 'citrinitas', name: '黄化之境', englishName: 'Citrinitas', level: 10, kind: 'resource', summary: '始终准备造物术与鬼斧神工，各可免费施展一次，并可用结晶延长造物术持续。', description: '你如今能以精粹结晶进行创造：你始终准备法术造物术与鬼斧神工，并可各不消耗法术位地施展一次，长休后重获这种施法能力，也能照常用合适的法术位施展它们。以此特性施展时，你可以改用动作施展。此外，施展造物术时你可消耗至多等于智力调整值（至少1份）的结晶，使该法术的持续时间乘以1＋所消耗数量。' },
      { slug: 'rubedo', name: '红化之极', englishName: 'Rubedo', level: 14, kind: 'passive', summary: '短休或长休时耗10份结晶造出贤者之石，提供法术DC增幅、强制成功与不死。', description: '完成短休或长休时，你可以消耗10份精粹结晶创造一块贤者之石（微型魔法物件，AC19、HP20、免疫除力场外伤害，造第二块时第一块消失）。携带它期间你获得：施法时消耗至多2份结晶，使该法术豁免DC提升相同数值；豁免失败时以反应消耗5份结晶改为成功；停止衰老且不受衰老影响；对探知与复活法术而言它视为你身体的一部分。' },
    ],
  },

  // ============ 游侠 ranger ============
  {
    slug: 'grim-harbinger',
    classSlug: 'ranger',
    name: '噩兆先驱',
    englishName: 'Grim Harbinger',
    summary: '游走于死亡曾触及之地，既是死者的守望者，也是生命将尽之人的末日预兆。他们以死兆封定敌人的末日，并让名为噩兆的精魂守卫协助履行共同的庄严职责。',
    features: [
      { slug: 'grim-harbinger-spells', name: '噩兆先驱法术', englishName: 'Grim Harbinger Spells', level: 3, kind: 'resource', summary: '3／5／9／13／17级按噩兆先驱法术表始终准备对应法术，不占准备数量。', description: '当你到达噩兆先驱法术表中特定的游侠等级时，你就始终准备表中对应的法术：3级灾祸术；5级定身类人；9级恐惧术；13级绝望侵袭；17级托梦术。这些法术由子职赋予，不计入你的准备法术数量，其中绝望侵袭为本书新增法术。' },
      { slug: 'omen-of-doom', name: '死兆星闪', englishName: 'Omen of Doom', level: 3, kind: 'bonus-action', summary: '附赠动作封定90尺内一个生物的末日1小时，命中时每回合追加1d6暗蚀并召出噩兆。', description: '以附赠动作封定90尺内一个可见生物的末日1小时：每回合一次，你命中它时额外造成1d6暗蚀伤害。同时召出幽灵般的噩兆于目标30尺内的未占据空间，它听从你的命令，你也可放弃一次攻击命它死兆撕裂。噩兆在你或目标死亡、其生命值归零或你再次使用时消失；次数等于感知调整值（至少1次），短休或长休回满，也可耗法术位（无需动作）恢复。' },
      { slug: 'harbinger-of-doom', name: '灾劫使者', englishName: 'Harbinger of Doom', level: 7, kind: 'passive', summary: '噩兆撕咬追加1d6暗蚀、可把伤害改为暗蚀，且你与噩兆的暗蚀伤害无视抗性。', description: '你对厄运的操控日趋强大：噩兆的死兆撕裂命中时额外造成1d6暗蚀伤害；当你对被死兆星闪封定厄运的生物造成伤害时，可以把伤害类型改为暗蚀伤害；你或噩兆造成的暗蚀伤害无视抗性。' },
      { slug: 'grave-bond', name: '墓契相连', englishName: 'Grave Bond', level: 11, kind: 'passive', summary: '噩兆获得物理抗性、你获得暗蚀抗性，并可迫使封印目标以劣势重掷成功豁免。', description: '你从墓穴中汲取更深层的力量：噩兆对钝击、穿刺与挥砍伤害具有抗性；你对暗蚀伤害具有抗性；当你的死兆星闪目标豁免成功时，你可以使用反应迫使它以劣势重掷该豁免并使用新结果，一旦由此导致一次豁免失败，在当前死兆星闪结束前你无法再次使用该增益。' },
      { slug: 'sealed-fate', name: '宿命已定', englishName: 'Sealed Fate', level: 15, kind: 'passive', summary: '噩兆撕裂追加伤害累计至2d6，死兆星闪时可迫使目标魅力豁免失败而承受易伤。', description: '你的死兆星闪力量达到巅峰，在其激活期间：噩兆的死兆撕裂命中时额外造成1d6暗蚀伤害（累计2d6）；当你使用死兆星闪时，可以迫使目标进行一次对抗你法术豁免DC的魅力豁免，失败则直至当前死兆星闪结束，目标对噩兆造成的伤害以及你通过死兆星闪造成的额外伤害具有易伤。后者用后须长休，也可耗四环以上法术位（无需动作）重置。' },
    ],
  },

  // ============ 游荡者 rogue ============
  {
    slug: 'sinner',
    classSlug: 'rogue',
    name: '罪人',
    englishName: 'Sinner',
    summary: '与罪恶和黑暗力量绑定、以咒术与厄运魔法骗取运气的游荡者。他们通过偷袭骰释放厄运伎俩，把赌具或手铳炼成施咒的媒介，在关键时刻扭转命中、豁免与敌人的命运。',
    features: [
      { slug: 'hex-slinger', name: '降咒客', englishName: 'Hex Slinger', level: 3, kind: 'resource', summary: '偷袭时指定两枚偷袭骰按其总和触发厄运效果，次数等于魅力调整值，短休恢复。', description: '当你以偷袭对一个生物造成伤害时，可以释放厄运伎俩：掷偷袭骰前指定其中两枚（分别投掷或用两枚异色骰），两骰总和决定降咒客厄运表上的效果，涵盖限制目标行动、迫使恐慌逃离、打落持握物、减速、弱化检定、施加减值与强化你的下次攻击等。可用次数等于你的魅力调整值，完成短休后恢复全部已消耗的次数。' },
      { slug: 'get-jinxed', name: '厄艺傍身', englishName: 'Get Jinxed', level: 3, kind: 'passive', summary: '获得两种赌具熟练，可制作以手铳结算的厄运武器造成力场伤害，并习得一个戏法。', description: '你学会厄运伎俩的秘密技艺：获得两种自选赌具熟练；用一套赌具进行1小时仪式，可制作一件引导厄运伎俩的武器，它以手铳或赌具外观呈现（用手铳数据），对你而言无视装填并自造力场弹药，也可把一件你熟练的武器变为厄运武器，造第二件时前者失效。此外，你从舞光术、法师之手、次级幻象、莫测仪容与魔法伎俩中选学一个戏法，施法属性为魅力。' },
      { slug: 'borrowed-luck', name: '借来好运', englishName: 'Borrowed Luck', level: 9, kind: 'passive', summary: '使用降咒客时若没有英雄激励则获得它，已有则可消耗它代替一次使用次数。', description: '当你使用降咒客时，你会带走目标的部分运气：如果你没有英雄激励，你立即获得英雄激励；如果你已具有英雄激励，你可以消耗它来代替消耗一次降咒客的使用次数。' },
      { slug: 'pick-your-poison', name: '任君自取', englishName: 'Pick Your Poison', level: 13, kind: 'passive', summary: '使用降咒客时两枚骰可掷两次取其一，同点追加伤害，总和为2或12则不消耗次数。', description: '当你使用降咒客时，你可以把所指定的偷袭骰投掷两次，并选择使用哪一次的掷骰总和。若所选结果是两枚骰子点数相同，目标额外受到等于你等级一半的心灵伤害；若所选总和为2或12，则本次不消耗降咒客的使用次数。' },
      { slug: 'the-other-side', name: '彼岸相助', englishName: 'The Other Side', level: 17, kind: 'passive', summary: '失手、豁免失败或被命中时，可消耗任意数量偷袭骰加入结果，下次偷袭后恢复。', description: '你呼唤下层位面的异界朋友改变概率：当你攻击检定失手或豁免失败时，可以消耗并投掷任意数量的偷袭骰（掷前选定数量），把总和加入该攻击或豁免，可能将失手改为命中、失败变为成功；当一个生物的攻击命中你时，也可同样消耗并投掷偷袭骰，把总和加入你对抗该次攻击的AC，可能将命中改为失手。以此消耗的骰子会在你下次使用偷袭后恢复。' },
    ],
  },

  // ============ 牧师 cleric ============
  {
    slug: 'harvest',
    classSlug: 'cleric',
    name: '丰收领域',
    englishName: 'Harvest Domain',
    summary: '神圣力量源自播种、生长与收割循环的领域，侍奉农耕与作物神祇的牧师常扮演循环的牧者。他们随阶段切换领域法术，用丰饶之角与英雄激励滋养同伴，并在收割中降下灾祸。',
    features: [
      { slug: 'community-almanac', name: '地方历法', englishName: 'Community Almanac', level: 3, kind: 'passive', summary: '获得草药工具及熟练，并获得自然或求生技能熟练二选一。', description: '你获得一套草药工具并拥有草药工具的熟练项，可用它照料作物、辨认可食植物或调配草药。此外，你从自然与求生技能中选择一项获得熟练，以应对耕作与乡野间的劳作。' },
      { slug: 'domain-spells', name: '丰收领域法术', englishName: 'Harvest Domain Spells', level: 3, kind: 'resource', summary: '短休或长休时选定播种／生长／收割阶段，按阶段始终准备对应等级的领域法术。', description: '每次完成短休或长休时，你选择丰收循环的一个阶段，并在到达特定牧师等级时始终准备该阶段对应法术，全部不占你的准备数量：播种为德鲁伊伎俩、神莓术、次等复原术、丰收月辉、防死结界、启蒙术；生长为神导术、纠缠术、夏日清风、植物滋长、牧人圣所、群体疗伤术；收割为颤栗之触、致伤术、定身类人、剔肉镰刀、薪火焚身、收割场。' },
      { slug: 'cornucopia', name: '丰饶之角', englishName: 'Cornucopia', level: 3, kind: 'resource', summary: '短休开始时造出丰饶之角，喂养两倍熟练加值的生物并分配牧师等级枚d4恢复生命。', description: '当你开始一次短休且未陷入失能时，你可以魔法性地创造一个丰饶之角，其中装满足以供给数量等于你熟练加值两倍生物食用的食物。食用这些食物的生物完成短休时，你可以把数量等于你牧师等级的d4骰分配给它们，各生物立刻掷出所分配的d4并恢复等于总值的生命值。短休结束时丰饶之角与未食用的食物消失；此特性用后须完成长休才能再次使用。' },
      { slug: 'bountiful-harvest', name: '五谷丰登', englishName: 'Bountiful Harvest', level: 3, kind: 'action', summary: '魔法动作耗引导神力，令60尺内至多6个生物获英雄激励并按丰收阶段获得增益。', description: '以魔法动作展示圣徽并耗一次引导神力，令60尺内至多6个自选生物获得英雄激励（同一生物须长休后才能再得）。同时赋予所有目标与丰收阶段对应的增益，必要时改变阶段：播种给予熟练＋感知调整值的临时生命值；生长让目标直至你下回合结束在攻击与属性检定中加1d4；收割让目标在你下回合结束前首次伤害生物时额外造成熟练加值暗蚀伤害。' },
      { slug: 'blessing-of-the-seasons', name: '四时祝福', englishName: 'Blessing of the Seasons', level: 6, kind: 'reaction', summary: '30尺内生物未通过特定豁免时可用反应令其重掷并回血，次数等于感知调整值。', description: '你可以引导丰收循环之力化解灾难：当你30尺内一个可见生物失败于一次豁免检定时（类型随阶段：播种为敏捷与魅力，生长为体质与智力，收割为力量与感知），你使用反应让它重掷该d20并使用新结果；随后无论结果如何，掷数量等于你熟练加值的d4，目标恢复等于总值的生命值。使用次数等于你的感知调整值（至少1次），完成长休后恢复全部。' },
      { slug: 'eternal-wheel', name: '永恒之轮', englishName: 'Eternal Wheel', level: 17, kind: 'passive', summary: '使用五谷丰登时按阶段额外赋予再生、豁免优势或三种伤害抗性，长休一次。', description: '当你使用五谷丰登时，你可以唤起生死轮回的无尽循环，为自己与受该次引导神力影响的生物按当前丰收阶段附加增益：播种使目标获得再生术效应1分钟；生长使目标在豁免与属性检定中具有优势1小时；收割使目标获得暗蚀、心灵与毒素伤害抗性1小时。此特性用后须完成长休，也可消耗七环以上法术位（无需动作）恢复。' },
    ],
  },

  // ============ 野蛮人 barbarian ============
  {
    slug: 'experiment',
    classSlug: 'barbarian',
    name: '实验道途',
    englishName: 'Path of the Experiment',
    summary: '以炼金合剂为怒火添薪的野蛮人，任由配方通过植入的注射器与导管注入血管。他们进入狂暴时选择血清与化合物获得不同增益，最终把多种配方整合进同一具躯体。',
    features: [
      { slug: 'alchemical-experiments', name: '炼金实验', englishName: 'Alchemical Experiments', level: 3, kind: 'passive', summary: '获得炼金工具及熟练，可用炼金工具代替草药工具制作治疗药水。', description: '你获得一套炼金工具并拥有炼金工具的熟练项，用以调配注入体内的合剂。此外，你可以使用炼金工具代替草药工具来制作治疗药水，让自制的药剂成为你持续实验的一部分。' },
      { slug: 'volatile-serum', name: '不稳定血清', englishName: 'Volatile Serum', level: 3, kind: 'choice', summary: '进入狂暴时选择注入一种血清（狂怒、怪兽或复原），可用附赠动作中途改选。', description: '进入狂暴时选择一种血清，持续至该次狂暴结束或你用附赠动作改选。狂怒让你无视困难地形，近战武器或徒手打击命中时可额外激活精通词条横扫；怪兽让你触及＋5尺、体型可增至大型，且每回合一次可在力量攻击失手时加入狂暴伤害加值；复原让你在激活时与每回合开始时耗掷一枚生命骰，恢复骰值＋体质调整值生命值，超出上限部分转为临时生命值。' },
      { slug: 'augmentation-compounds', name: '强化化合物', englishName: 'Augmentation Compounds', level: 6, kind: 'choice', summary: '进入狂暴或更换血清时，可另选一种化合物：锐化感官、狂乱烟雾或腐蚀喷射。', description: '进入狂暴或改变血清时可额外激活一种化合物，持续至狂暴结束或改选。锐化感官：获得30尺盲视。狂乱烟雾：皮肤渗出30尺光环烟雾，敌人身处其中速度减半，开始回合时须通过感知豁免，否则攻击他人有劣势至下回合开始。腐蚀喷射：可把一次攻击换为15尺锥或30尺×5尺线喷射，区域内生物敏捷豁免失败受狂暴伤害加值枚d8强酸，成功半伤。' },
      { slug: 'reaction-catalyst', name: '应激催化', englishName: 'Reaction Catalyst', level: 10, kind: 'reaction', summary: '受伤或陷入目盲耳聋中毒震慑时，可用反应提前进入狂暴并结束这些状态。', description: '你的植入物会对危险应激反应敏感并注入刺激性化学物质：当你受到伤害，或陷入目盲、耳聋、中毒、震慑状态时，你可以使用反应，在该伤害或状态生效前进入狂暴；你进入狂暴时，身上这些状态（包括触发它的那一个）立即终止。此外，狂暴激活期间你在体质豁免中具有优势。' },
      { slug: 'biochemical-admixture', name: '生化融合', englishName: 'Biochemical Admixture', level: 14, kind: 'passive', summary: '激活不稳定血清时可同时选择两种血清，且狂暴中被近战伤害时反伤1d12强酸。', description: '你的身体聚集并整合了多种血清的力量：当你激活不稳定血清特性时，你激活两个选项而不是一个。此外，狂暴激活期间，当你5尺范围内的一个生物以近战攻击伤害你时，它受到1d12强酸伤害，一个生物每回合至多受到一次该伤害。' },
    ],
  },

  // ============ 魔契师 warlock ============
  {
    slug: 'great-fool',
    classSlug: 'warlock',
    name: '愚神宗主',
    englishName: 'Great Fool Patron',
    summary: '与以愉悦狂欢为本的异界愚神缔约的魔契师，其力量源自宗主令人无法理解的扭曲幽默。他们用讥讽与诅咒羞辱傲慢强者，以荒诞的戏法扰乱敌人，把危难化为一场狂欢。',
    features: [
      { slug: 'great-fool-spells', name: '愚神法术', englishName: 'Great Fool Spells', level: 3, kind: 'resource', summary: '3／5／7／9级按愚神法术表始终准备对应法术，不占准备数量。', description: '宗主赐予的魔法使你始终准备特定法术：3级恶言相加、易容术、塔莎狂笑术、魔绳术、灵体武器；5级闪现术、臭云术；7级魅影杀手、傀儡掌控；9级毕格比之手、假象术。到达表中对应的魔契师等级即自动获得，不计入你的准备法术数量，其中傀儡掌控为本书新增法术。' },
      { slug: 'killing-joke', name: '致命玩笑', englishName: 'Killing Joke', level: 3, kind: 'reaction', summary: '60尺内可见生物受伤或豁免失败时可用反应施展恶言相加，次数等于魅力调整值。', description: '你能洞察万物中的幽默——尤其是在其终结之时。当你60尺内一个可见生物受到伤害或豁免检定失败时，你可以使用反应对该生物施展恶言相加。使用此反应的次数等于你的魅力调整值（至少1次），完成短休时恢复1次已消耗的次数，完成长休时恢复全部。' },
      { slug: 'jesters-japes', name: '弄臣戏谑', englishName: "Jester's Japes", level: 6, kind: 'action', summary: '魔法动作迫使60尺内可见生物魅力豁免，失败则承受四种戏谑诅咒之一1分钟。', description: '以魔法动作迫使60尺内一个可见生物对抗你法术豁免DC进行魅力豁免，失败则承受你选的诅咒：花朵喷雾使其目盲；小丑之履使其速度减半、敏捷检定与豁免劣势；吱哒喇叭让其移动发出100尺可闻声响且无法从隐形受益；滑稽兵器使其武器伤害减半。诅咒持续1分钟，目标每回合结束可重复豁免，成功即终止；用后须短休或长休才能再次使用。' },
      { slug: 'mocking-banter', name: '讽刺戏语', englishName: 'Mocking Banter', level: 10, kind: 'reaction', summary: '生物对你造成伤害时，可用反应迫使其感知豁免，失败受等量心灵伤害。', description: '你辛辣刻薄的调侃已能直击心灵。当一个生物对你造成伤害时，你可以使用反应迫使该生物进行一次对抗你法术豁免DC的感知豁免：失败则它受到等于你所受触发伤害的心灵伤害，成功则只受一半。此反应一经使用，须完成一次短休或长休才能再次使用。' },
      { slug: 'send-in-the-clowns', name: '丑角登场', englishName: 'Send in the Clowns', level: 14, kind: 'action', summary: '魔法动作召出三个幽灵小丑，对60尺生物至多三次攻击，命中2d10心灵并附加状态。', description: '你可以使用魔法动作召唤三个幽灵小丑（外貌为丑角、弄臣或类似艺人），对60尺内生物进行至多三次近战法术攻击；命中则目标受到2d10心灵伤害，并陷入恐慌直到其下回合结束，或陷入倒地（由你选择）。你可以在后续回合使用动作重复这些攻击。小丑持续1分钟，或在你失能、死亡时消失；此特性用后须完成一次长休才能再次使用。' },
    ],
  },
  {
    slug: 'horned-king',
    classSlug: 'warlock',
    name: '角之王宗主',
    englishName: 'Horned King Patron',
    summary: '在角之王书上签名、以鲜血与堕落灵魂缔约的魔契师，力量来自最深邃林地与最黑暗内心中的野兽。他们精进古老仪式、编织恶咒，在诅咒他人中愈发接近自己的宗主。',
    features: [
      { slug: 'horned-king-spells', name: '角之王法术', englishName: 'Horned King Spells', level: 3, kind: 'resource', summary: '3／5／7／9级按角之王法术表始终准备对应法术，不占准备数量。', description: '宗主赐予的魔法使你始终准备特定法术：3级化兽为友、灾祸术、荆棘丛生、暗示术；5级降咒、飞行术；7级魅影杀手、变形术；9级支配类人、探知。到达表中对应的魔契师等级即自动获得，不计入你的准备法术数量。' },
      { slug: 'witch-mark', name: '巫印', englishName: 'Witch Mark', level: 3, kind: 'passive', summary: '长休时把一道已准备的魔契师法术注入持握的微型物件，持握者可耗魔法动作施展它。', description: '当你完成长休时，你可以把魔法注入一个正在持握的非魔法微型物件，并选择一道施法时间为动作、你已准备的魔契师法术。任何持握该巫印物件的生物都可以使用魔法动作施展这道法术，使用你的魅力调整值、法术攻击加值与法术豁免DC。巫印会在该法术被从中施展后，或你完成下次长休时消散。' },
      { slug: 'malediction', name: '咒怨', englishName: 'Malediction', level: 3, kind: 'action', summary: '魔法动作或反应诅咒60尺内生物，按苦痛、憎恨、腐烂三选一施加劣势与额外伤害。', description: '呼唤角之王的恶意操纵机运：魔法动作诅咒60尺内一个可见生物至其下回合结束，或以反应诅咒一个以你为目标的生物。三选一：苦痛，目标下次攻击或维持专注的体质豁免具有劣势；憎恨，目标下次智力、感知或魅力豁免具有劣势；腐烂，目标下次受伤时额外受1d10暗蚀伤害，且至下回合结束无法回血。次数＝魅力调整值，长休回满。' },
      { slug: 'spiteful-curse', name: '怨毒诅咒', englishName: 'Spiteful Curse', level: 6, kind: 'passive', summary: '使用咒怨时可同时免费施展降咒：射程60尺、持续1分钟、无需专注，长休恢复。', description: '当你使用咒怨时，作为该特性的动作或反应的一部分，你可以不消耗法术位地施展降咒，并在完成长休后重获以此方式施法的能力。以此施展时，该法术射程变为60尺、持续1分钟且无需专注；若目标为对抗该法术的豁免检定成功，则改为承受你从咒怨中选择的一项诅咒，且不消耗咒怨的使用次数。' },
      { slug: 'crown-of-horns', name: '角之王冠', englishName: 'Crown of Horns', level: 10, kind: 'bonus-action', summary: '附赠动作显化角之王威严1分钟：每回合追加1d8暗蚀，20尺灵光内可施加三种状态。', description: '以附赠动作显化角之王威严1分钟。黑暗之心：每回合一次，你造成伤害时目标额外受1d8暗蚀。万物之王：20尺光环内散发灵光，激活时与每回合开始可选灵光内一个生物，它须对抗你法术豁免DC进行魅力豁免，失败则受你选的效应至下回合开始：惑心令其被魅惑，不义令攻击与属性检定劣势，惧怖令其恐慌远离。用后须长休，也可耗契约法术位恢复。' },
      { slug: 'gather-the-coven', name: '密会集结', englishName: 'Gather the Coven', level: 14, kind: 'passive', summary: '1小时仪式联结至多六个生物，共享咒怨反应、传送与国王之手的额外伤害。', description: '把角之王的力量分给认可者：以1小时仪式联结至多六个生物，可解除，死亡时结束。联结提供：巫咒之术，从咒怨中选一项诅咒，被联结者各可用一次，长休后重获；翔于夜空，以附赠动作传送到同一位面某个被联结者身旁，用后须短休或长休恢复，角之王冠激活时不消耗；国王之手，角之王冠激活期间被联结者每回合首次伤害他人时额外造成1d10暗蚀。' },
    ],
  },
]

export const crookedMoonSubclasses2024: readonly SubclassRule[] = seeds.map((seed) => {
  const id = `subclass-2024-tp-cm-${seed.classSlug}-${seed.slug}`
  const features: readonly SubclassFeature[] = seed.features.map((feature) => ({
    id: `tp-cm-${seed.classSlug}-${seed.slug}-${feature.slug}`,
    subclassId: id,
    name: feature.name,
    englishName: feature.englishName,
    level: feature.level,
    summary: feature.summary,
    description: feature.description,
    kind: feature.kind,
    status: 'selectable',
    sourceIds: CROOKED_MOON,
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
    sourceIds: CROOKED_MOON,
    features,
  }
})
