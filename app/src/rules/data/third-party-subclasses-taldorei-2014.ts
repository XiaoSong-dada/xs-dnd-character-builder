import type { SubclassFeature, SubclassFeatureKind, SubclassRule } from '@/types/rules'

/**
 * G3-I2：《塔尔多雷》(Tal'Dorei Campaign Setting Reborn) 第三方子职（2014 口径，9 条）。
 * 仅登记选择与展示所需元数据与原创中文摘要，效果不进入自动计算；
 * 来源 `tp-taldorei-index` 为第三方合作内容，默认关闭、需 DM 同意。
 *
 * 收录口径：
 * - 子职名与特性名取自 CHM 资料正文（二级标题／粗体标题）写法，等级取资料给出的等级数字；
 * - 2014 版式下牧师子职自 1 级起、法师与德鲁伊子职自 2 级起；
 * - 法术清单与怪物数据卡只并入对应授予特性的说明，不拆成独立特性；
 * - 资料中无等级的「远洋之信条」等信条段落，以及「规则提示：能见度」类规则提示不登记为特性。
 */

const TAL_DOREI = ['tp-taldorei-index'] as const

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
    slug: 'tragedy',
    classSlug: 'bard',
    name: '悲剧学院',
    englishName: 'College of Tragedy',
    summary: '从哀伤与悲怆中取材的吟游诗人，相信失败与死亡和欢庆同样动人心魄。他们把独白、宿命与厄运编进台词与法术，让敌人亲身经历故事里最沉重的一页。子职围绕诗人激励的回收与放大展开，擅长削弱敌人，也能让同伴短暂成为悲剧英雄。',
    features: [
      { slug: 'poetry-in-misery', name: '惨中取意', englishName: 'Poetry in Misery', level: 3, kind: 'reaction', summary: '3级起你或30尺内盟友掷出1时可用反应配上独白，并回复一次诗人激励。', description: '3级加入悲剧学院后，你能在最糟糕的失手与挫折里找到韵脚：当你或30尺内一名盟友的攻击检定、属性检定或豁免检定掷出1时，你可以用反应为其配上一段独白，随后立刻恢复一次已消耗的诗人激励使用次数。该特性只跟随掷骰事件触发，不占用你的动作，也不消耗任何资源，一场战斗中可以反复生效。' },
      { slug: 'sorrowful-fate', name: '多舛命运', englishName: 'Sorrowful Fate', level: 3, kind: 'resource', summary: '3级起消耗一次诗人激励，把敌人正进行的豁免改成魅力豁免。', description: '自3级起，当由你或你能看见的盟友迫使某个生物进行豁免检定时，你可以消耗一次诗人激励，把这次豁免的类型改成魅力豁免。若目标豁免失败，你掷出诗人激励骰，它受到等值的心灵伤害并在1分钟内被悔恨缠绕；若它在此期间生命值降为0且能言语，还会被魔法迫使念出充满诗意的遗言。使用后须完成一次短休或长休才能再次使用。' },
      { slug: 'tales-of-hubris', name: '盛极必衰', englishName: 'Tales of Hubris', level: 6, kind: 'reaction', summary: '6级起敌人重击时可耗激励骰反应，使其1分钟内被武器攻击时18至20即重击。', description: '自6级起，当一个生物对你或你周围60尺内可见的盟友发动攻击并掷出重击时，你可以立刻用反应消耗一枚诗人激励骰，开始讲述攻击者因骄傲自大而疏忽大意的故事。接下来1分钟内，任何以该生物为目标的武器攻击掷出18至20即形成重击；期间它若被重击命中，效应提前结束。14级起这一重击范围扩大到17至20。' },
      { slug: 'impending-misfortune', name: '临头厄运', englishName: 'Impending Misfortune', level: 6, kind: 'resource', summary: '6级起可让一次攻击或豁免检定+10，代价是下次同类检定-10。', description: '同样自6级起，你能以未来失败的承诺换取当下的胜利：当你进行一次攻击检定或豁免检定时，可以让这次掷骰获得+10加值，但你在之后进行的下一次攻击检定或豁免检定将承受-10减值；若你此后不再进行这两类检定，该减值会在你完成一次短休或长休时消失。此特性用后须完成一次短休或长休才能再次使用，若你生命值被降为0则立即重获使用机会。' },
      { slug: 'nimbus-of-pathos', name: '悲怆光轮', englishName: 'Nimbus of Pathos', level: 14, kind: 'action', summary: '14级起以动作触碰自愿生物，使其1分钟内成为悲剧英雄，但结束时生命值归零。', description: '达到14级后，你能以一个动作触碰一名自愿生物，为其注入悲剧英雄的力量，持续1分钟：该生物AC获得+4加值，攻击检定与豁免检定具有优势，其武器攻击或法术攻击命中时目标额外受到1d10光耀伤害，而任何以它为目标的武器攻击掷出18至20即形成重击。效应结束时该生物生命值立刻降为0并陷入濒死。使用后须完成一次长休才能再次使用。' },
    ],
  },

  // ============ 圣武士 paladin ============
  {
    slug: 'open-sea',
    classSlug: 'paladin',
    name: '远洋之誓',
    englishName: 'Oath of Open Sea',
    summary: '向大海立誓、为自由与远方而战的圣武士，认为自由是所有人理应享有的至高呼唤。他们把劲风与浪涌视作预兆，替志同道合的旅者挺身而出，根除暴政与腐朽。子职擅长解除束缚、抹平水下作战的劣势，并以潮汐之力击退敌人。',
    features: [
      { slug: 'oath-spells', name: '圣誓法术', englishName: 'Oath Spells', level: 3, kind: 'resource', summary: '3级起随圣武士等级获得远洋之誓的圣誓法术，始终准备且不占准备数量。', description: '立下此誓后，你在相应圣武士等级自动获得下列圣誓法术并始终准备：3级造水术／枯水术、脚底抹油；5级卜筮术、迷踪步；9级召雷术、浪之自由；13级控制水体、行动自如；17级问道自然、风之自由。这些法术属于誓言赋予的固定列表，不占用你的准备法术数量，其中浪之自由与风之自由是本书新增法术。' },
      { slug: 'channel-divinity', name: '引导神力', englishName: 'Channel Divinity', level: 3, kind: 'resource', summary: '3级获得两种引导神力：海巡领域造出随行浓雾，浪涛之怒推敌并追加伤害。', description: '3级选择本誓言时你获得两种引导神力选项，使用时消耗引导神力次数。海巡领域以动作造出随你移动、半径20尺的球形浓雾，持续10分钟且无法被吹散，对你与周围5尺内的生物只算轻度遮蔽。浪涛之怒以附赠动作启动1分钟，每回合一次以武器攻击命中时可将目标向你推离10尺，撞上障碍物或生物时追加等于力量调整值的钝击伤害。' },
      { slug: 'aura-of-liberation', name: '解放灵光', englishName: 'Aura of Liberation', level: 7, kind: 'passive', summary: '7级起10尺灵光内你与自选生物免疫擒抱束缚并忽略水下惩罚，18级扩至30尺。', description: '7级起，只要你未处于失能状态，你与周围10尺内由你选择的生物就无法陷入擒抱或束缚，也忽略水下环境造成的移动与攻击惩罚；已陷入这类状态的生物进入灵光后，若造成该状态的效应并非魔法，便可花费5尺移动力自动脱身。你在此职业达到18级时，灵光范围扩大到30尺。' },
      { slug: 'stormy-water', name: '潮汐汹涌', englishName: 'Stormy Water', level: 15, kind: 'reaction', summary: '15级起生物进出你触及范围时可用反应造成1d12钝击伤害并将其击倒。', description: '15级起，当一个生物移动进入或离开你的触及范围时，你可以用反应召来汹涌的潮汐之力：该生物受到1d12点钝击伤害，并且必须通过一次对抗你法术豁免DC的力量豁免，否则应击倒地。该效果由反应驱动，因此一轮之内只能回应一次触发。' },
      { slug: 'mythic-swashbuckler', name: '神话浪客', englishName: 'Mythic Swashbuckler', level: 20, kind: 'action', summary: '20级起以动作化身传奇船长1分钟，获得攀爬、单挑优势与灵活身法。', description: '20级起，你能以动作拥抱大海上的种种魂灵，在1分钟内化身史诗冒险的完美典范：力量（运动）检定具有优势并获得等于步行速度的攀爬速度（已有则翻倍）；当你位于某生物5尺内且周围5尺内无其他生物时，对其攻击具有优势；你能以附赠动作疾跑或撤离；敏捷属性检定与对抗可见效应的敏捷豁免均具有优势。使用后须完成一次长休才能再次使用。' },
    ],
  },

  // ============ 德鲁伊 druid ============
  {
    slug: 'blight',
    classSlug: 'druid',
    name: '枯朽结社',
    englishName: 'Circle of The Blighted',
    summary: '圣所遭诅咒、自身也随之扭曲的德鲁伊结社，他们侍奉被污浊的自然，并把腐化当作武器。结社以污化土地持续削弱敌人、召唤枯萎幼苗协同作战，还能让召唤物带毒，最终把污染写进自己的肉体。',
    features: [
      { slug: 'defile-ground', name: '污化土地', englishName: 'Defile Ground', level: 2, kind: 'bonus-action', summary: '2级起以附赠动作腐化60尺内一片区域1分钟，敌人受困难地形与额外暗蚀伤害。', description: '自2级起，你能以附赠动作指定60尺内一点，使半径10尺的土地或水体腐化1分钟：区域内与你敌对的生物视其为困难地形，且一回合内首次因攻击或法术受伤时额外受1d4点暗蚀伤害，飞行生物不受影响；你还能以附赠动作移动该区域至多30尺。用后须短休或长休才能再用，10级半径增至20尺、伤害改为1d6，14级为d8。' },
      { slug: 'blighted-shape', name: '枯败之形', englishName: 'Blighted Shape', level: 2, kind: 'passive', summary: '2级起获得威吓熟练，荒野变形期间AC+2并获得60尺黑暗视觉。', description: '同样从2级起，腐化的影响开始显现在你的肉体上：皮肤浮出黑色纹路、生出多节而突出的骨刺，你因而获得魅力（威吓）技能的熟练。此外，你使用荒野变形时，扭曲的骨棘会从体内生出，变形期间你的AC获得+2加值，野兽形态获得60尺黑暗视觉；若它原本已有黑暗视觉，其范围再增加60尺。' },
      { slug: 'call-of-the-shadowseeds', name: '阴影之种的呼唤', englishName: 'Call of the Shadowseeds', level: 6, kind: 'reaction', summary: '6级起污化区域内生物受伤时可用反应召出枯萎幼苗并指挥它攻击。', description: '6级起，非不死非构装的生物在你用污化土地造出的区域内受伤时，你能用反应在该生物5尺内召出一只枯萎幼苗，并指挥它攻击周围5尺内的生物。幼苗在你的先攻值行动、听从口头指令，直到你完成长休、召唤另一株或生命值归0。AC为10＋熟练加值，生命值为你德鲁伊等级两倍，爪击造成2d4＋熟练加值穿刺伤害；次数等于熟练加值，长休恢复。' },
      { slug: 'foul-conjuration', name: '污秽召唤', englishName: 'Foul Conjuration', level: 10, kind: 'passive', summary: '10级起你召唤的野兽、妖精与植物免疫暗蚀毒素，死亡时爆散毒渣。', description: '10级起，你召唤或创造的野兽、妖精与植物都变得畸形带毒：它免疫暗蚀、毒素伤害与中毒状态；生命值降为0时爆散成毒渣，周围5尺内每个生物须通过一次对抗你法术豁免DC的体质豁免，失败者按其挑战等级受暗蚀伤害（1/4或更低1d4、1/2为1d6、更高每级1d8、无挑战等级为你熟练加值枚d6）。你也能以动作杀死召唤生物使其爆散。' },
      { slug: 'incarnation-of-corruption', name: '腐败化身', englishName: 'Incarnation of Corruption', level: 14, kind: 'passive', summary: '14级起获得暗蚀抗性与AC+2，在污化区域内开始回合可获临时生命。', description: '14级时，你的肉体彻底呈现所联结大地的污染特征：皮肤枯槁如死灰、双眼黯淡或完全苍白，骨棘与锯齿状倒刺从体内生出，赋予你对暗蚀伤害的抗性与AC上的+2加值。此外，每当你在自己污化土地造出的区域内开始回合时，你可以用一个附赠动作获得等于你熟练加值点的临时生命值。' },
    ],
  },

  // ============ 术士 sorcerer ============
  {
    slug: 'runechild',
    classSlug: 'sorcerer',
    name: '符文之子',
    englishName: 'Runechild',
    summary: '把世界径流的魔力以天生符文形式储存在身上的术士，身躯既是导管也是容器。符文随术士等级增多，消耗术法点即可令其蓄能，再用蓄能符文驱动防护、强化与化身等能力。玩法围绕术法点与蓄能符文的往复循环展开。',
    features: [
      { slug: 'essence-runes', name: '本源符文', englishName: 'Essence Runes', level: 1, kind: 'resource', summary: '1级获得一枚本源符文，每提升一级术士等级再加一枚并可蓄能。', description: '1级起，你天生的魔力以皮肤表面的符文显现：最初有1枚本源符文，此后每提升一级术士等级再得1枚。你的回合结束时，若该回合消耗过术法点，等量符文进入蓄能状态；你也能以附赠动作消耗1点术法点令两枚符文蓄能，若既无术法点也无蓄能符文，则能以动作令一枚蓄能。消耗蓄能符文使用子职特性后该符文失活，长休结束时所有蓄能符文一并失活。' },
      { slug: 'runic-magic', name: '符文魔法', englishName: 'Runic Magic', level: 1, kind: 'resource', summary: '1级起获得符文魔法额外法术，不占已知法术数量，升级时可同环替换。', description: '自1级起，你随术士等级习得符文魔法表中的额外法术，它们对你视为术士法术，不计入已知法术数量：1级大步奔行、防护善恶；3级次等复原术、防护毒素；5级守卫刻纹、防护法阵；7级防死结界、行动自如；9级高等复原术、心灵遥控。每当你提升术士等级时，可用同环阶新法术替换其中一个，新法术须出自术士、魔契师或法师列表的防护系或变化系。' },
      { slug: 'glyph-of-aegis', name: '坚盾刻文', englishName: 'Glyph of Aegis', level: 1, kind: 'reaction', summary: '1级起受伤时可用反应消耗蓄能符文掷d6减伤，6级还能预先为他人布防。', description: '1级起，你能释放符文中的奥法力量吸收或偏折攻击：受到伤害时，你可以用反应消耗任意数量的蓄能符文，掷等量d6并把结果之和从该次伤害中减去。6级起你还能以一个动作触碰一个生物并消耗至多3枚蓄能符文为其灌输防护，此后1小时内它下一次受到伤害时掷等量d6减伤；已在保护下的生物不能重复受此保护。14级时这些骰子由d6变为d8。' },
      { slug: 'sigilic-augmentation', name: '符印强化', englishName: 'Sigilic Augmentation', level: 6, kind: 'reaction', summary: '6级起可用反应消耗蓄能符文，为力量、敏捷或体质检定与豁免取得优势。', description: '6级起，你能引入符文之力临时强化肉体：当你进行一次力量、敏捷或体质检定时，可以用反应消耗1枚蓄能符文，使这次检定具有优势。当你被迫进行上述属性的豁免检定时，同样可以用反应消耗1枚蓄能符文让豁免具有优势，但只要你在豁免上如此使用过，就必须完成一次长休才能再次这样做。' },
      { slug: 'manifest-inscriptions', name: '显现刻印', englishName: 'Manifest Inscriptions', level: 6, kind: 'action', summary: '6级起以动作消耗蓄能符文，揭示60尺内隐藏的陷阱、符文与结界1分钟。', description: '同样从6级起，你能以一个动作消耗1枚蓄能符文，揭露周围60尺内隐藏或隐性的陷阱、伪装、符文、结界、探知器与刻文等，它们在接下来1分钟内发出半径5尺的微弱光芒。你在辨认以此方式发现的魔法时所作智力（奥秘）检定具有优势；若这些图像以你不知晓的语言记载内容，在发光期间你可如通晓该语言般理解它们。' },
      { slug: 'runic-torrent', name: '符文涌流', englishName: 'Runic Torrent', level: 14, kind: 'resource', summary: '14级起施法时可耗两枚蓄能符文改为力场伤害，并迫使目标倒地或被推离。', description: '达到14级后，你施展法术时可以消耗2枚蓄能符文，令该法术造成力场伤害而非原本的伤害类型。此外，所有被选为法术目标的生物以及身处法术区域效应内的生物，都必须成功通过一次DC等于你法术豁免DC的力量豁免，否则应击倒地，或被从法术源点推离至多15尺（由你选择）。此特性一经使用，直到你完成一次短休或长休前都无法再次使用。' },
      { slug: 'arcane-exemplar', name: '奥法化身', englishName: 'Arcane Exemplar', level: 18, kind: 'bonus-action', summary: '18级起以附赠动作耗1枚蓄能符文化作纯魔法存在，结束后陷入震慑。', description: '18级起，你能以一个附赠动作消耗1枚蓄能符文，使自己化作纯魔法存在：获得60尺飞行速度，对抗你术士法术的豁免具有劣势，你对法术造成的伤害具有抗性，施展1环或更高环阶法术时恢复等于该环阶的生命值。化身持续到你这回合结束，也可在回合结束时无需动作再耗1枚蓄能符文延至你的下回合结束；结束时你陷入震慑直到你的下个回合结束。' },
    ],
  },

  // ============ 武僧 monk ============
  {
    slug: 'cobalt-soul',
    classSlug: 'monk',
    name: '钴魂宗',
    englishName: 'Way of the Cobalt Soul',
    summary: '献身于追寻真理、守护知识的武僧宗派，以研究代替盲信，用精准打击破解敌人的秘密。他们借疾风连击分析对手、逼问真相，并在高阶把气与反应转化为看穿与削弱敌人的手段，战后还会把发现记录成册。',
    features: [
      { slug: 'extract-aspect', name: '问诊详情', englishName: 'Extract Aspect', level: 3, kind: 'reaction', summary: '3级起疾风连击命中即可分析敌人，被分析者攻击失手时可用反应反击。', description: '3级选择本宗派后，你击打对手时能连通多处穴位并提取关键信息：当你以疾风连击中的一次攻击命中一个生物时，你可以分析它；被分析的生物对你发动的攻击失手时，若它在你触及范围内，你能以反应对其发动一次徒手打击。这一增益持续到你完成一次短休或长休。此外，分析一个生物后，你会知晓它全部的伤害易伤、伤害抗性、伤害免疫与状态免疫信息。' },
      { slug: 'extort-truth', name: '勒问真相', englishName: 'Extort Truth', level: 6, kind: 'resource', summary: '6级起徒手打击命中可耗1点气逼其魅力豁免，失败则10分钟内无法说谎。', description: '6级起，你能精准击打一系列隐藏神经，让目标暂时无法隐藏真实想法：当你以徒手打击命中一个生物时，可以消耗1点气强制它进行一次魅力豁免。失败时该生物在接下来10分钟内无法有意说谎，且任何针对它的魅力检定具有优势；你会知道它的豁免成功与否。你也可以改为仅作触碰，令该次攻击不造成任何伤害。' },
      { slug: 'mystical-erudition', name: '神秘博学', englishName: 'Mystical Erudition', level: 6, kind: 'choice', summary: '6级起学会一门自选语言与一项技能熟练，已熟练者可改为双倍熟练加值。', description: '同样在6级，你已接受钴魂的通识训练：你学会一门自选语言，并获得奥秘、历史、调查、自然或宗教中一项技能的熟练；若你已熟练所选技能，则可以改为在该技能相关的属性检定中加入双倍熟练加值。11级与17级时你各再获得一门额外语言，以及上述列表中的另一项技能熟练，同样可以把已有熟练改为双倍熟练加值。' },
      { slug: 'mind-of-mercury', name: '水银之心', englishName: 'Mind of Mercury', level: 11, kind: 'resource', summary: '11级起一回合一次可在已用反应后耗1点气，换取一次额外反应。', description: '从11级起，你通过精神适性与模式识别磨炼了意识与反射：一回合一次，如果你已经使用过自己的反应，你可以在想要执行额外反应时消耗1点气来完成它。你仍然只能对同一次触发效应作出一次反应，因此这项能力扩大的是每回合可用的反应总量，而不是对单个事件的回应次数。' },
      { slug: 'debilitating-barrage', name: '衰弱连击', englishName: 'Debilitating Barrage', level: 17, kind: 'resource', summary: '17级起徒手打击命中可耗3点气，使目标对自选伤害类型易伤1分钟。', description: '17级起，你掌握了操控生物之气、削弱其肉体韧性的知识：当你以徒手打击命中一个生物时，可以消耗3点气让它获得由你选择的一种伤害类型的易伤，持续1分钟；若它受到该类型的伤害，易伤会在那一回合结束时提前结束。若目标原本对该类型具有抗性，则不会获得易伤，改为该抗性被压制1分钟；免疫该类型伤害的生物不受影响。' },
    ],
  },

  // ============ 法师 wizard ============
  {
    slug: 'blood-magic',
    classSlug: 'wizard',
    name: '血魔法',
    englishName: 'Blood Magic',
    summary: '以自身鲜血为媒介与代价的奥术传承，被多数社会视为禁忌，却能以生命力换取更强的法术。法师可以把身体当作法器、用暗蚀伤害替代昂贵耗材，也能把伤痛转移到攻击者身上，并在维持专注时护住自己。',
    features: [
      { slug: 'blood-channeling', name: '鲜血传导', englishName: 'Blood Channeling', level: 2, kind: 'passive', summary: '2级起生命值不满时可以身体作奥术法器，并能以暗蚀伤害替代耗材。', description: '2级选择此奥术传承时，你能用自己流出的生命精华传导法术：生命值低于最大值时，你可以自己的身体作为奥术法器。此外，施展需要有价值耗材的法术时，你能以承受暗蚀伤害代替这些成分，每替代50gp就受到1d10点无法被任何方式减免的暗蚀伤害（至少1d10）；若该伤害把你的生命值降为0，法术会失败，但法术位不会被消耗。' },
      { slug: 'sanguine-burst', name: '绯红爆发', englishName: 'Sanguine Burst', level: 2, kind: 'passive', summary: '2级起可为1环以上法术重骰伤害骰，代价是承受等于环阶的暗蚀伤害。', description: '同样自2级起，你学会把自己的生命精华编织进法术：当你为自己施展的1环或更高环阶法术投掷伤害时，你可以选择受到等于该法术环阶点的暗蚀伤害，以此重骰至多等于你智力调整值枚（最低1枚）的伤害骰。这一自我伤害无法被任何方式减少，且重骰后你必须采用新的结果。' },
      { slug: 'bond-of-mutual-suffering', name: '共苦之缚', englishName: 'Bond of Mutual Suffering', level: 6, kind: 'reaction', summary: '6级起被可见生物命中时可用反应，使攻击者受到与你相同的伤害。', description: '自6级起，当一个你能看见的生物以一次攻击命中你时，你可以用反应把自己的生命与攻击者维系在一起，强迫它分担你的痛楚，攻击者将受到与你相同的伤害。你无法对构装或亡灵生物使用这一特性；此特性使用一次后须完成一次短休或长休才能再次使用，14级起可以在两次休息之间使用两次。' },
      { slug: 'glyph-of-hemorrhaging', name: '操血刻印', englishName: 'Glyph of Hemorrhaging', level: 10, kind: 'resource', summary: '10级起法术造成伤害后可诅咒目标1分钟，使其被命中时额外受1d6暗蚀。', description: '10级起，当你的法术对一个生物造成伤害时，你可以诅咒它1分钟：诅咒期间，每当该生物被一次攻击命中，它都会额外受到1d6点暗蚀伤害；它可以在自己每个回合结束时进行一次对抗你法术豁免DC的体质豁免，成功则诅咒提前结束。你无法对构装或亡灵生物使用这一特性，且一经使用，直到你完成一次短休或长休前都不能再次使用。' },
      { slug: 'thicker-than-water', name: '血浓于水', englishName: 'Thicker Than Water', level: 14, kind: 'passive', summary: '14级起受魔法治疗时额外回复熟练加值点生命，专注法术时获伤害抗性。', description: '当你达到14级后，流淌在你血管中的鲜血已充满魔法的活力：当一个法术或魔法效应令你回复生命值时，你额外恢复等于你熟练加值点的生命值；此外，当你专注于一个法术期间，你获得对非魔法攻击造成的钝击、穿刺与挥砍伤害的抗性。两项收益都是常驻效果，不需要动作，也不消耗资源。' },
    ],
  },

  // ============ 牧师 cleric：月亮领域 ============
  {
    slug: 'moon',
    classSlug: 'cleric',
    name: '月亮领域',
    englishName: 'Moon Domain',
    summary: '崇拜艾桑椎亚双月、以光影与月相支配吉凶的牧师领域。织月者卡萨的微光带来护佑与启示，暗月茹蒂斯则象征厄运与忧惧。领域牧师既能以月光守护同伴的心智，也能召来月蚀，让敌人笼罩在恶兆之下。',
    features: [
      { slug: 'domain-spells', name: '领域法术', englishName: 'Domain Spells', level: 1, kind: 'resource', summary: '1级起获得月亮领域法术，始终准备且不占每日准备上限。', description: '1级起，你在相应牧师等级自动获得月亮领域法术并始终准备，它们不占用你每日可以准备的法术上限：1级妖火、无声幻影；3级隐形术、月华之光；5级催眠图纹、高级幻影；7级高等隐形术、幻景；9级托梦术、穿墙术。这些法术属于领域赋予的固定列表，随牧师等级提升逐步可用。' },
      { slug: 'clarity-of-catha', name: '银月明光', englishName: 'Clarity of Catha', level: 1, kind: 'reaction', summary: '1级起30尺内可见生物作感知豁免时可用反应给予优势，次数为熟练加值。', description: '在第1级选择该领域时，你学会在你想守护之人心智最危险的时刻向其中映射光亮，并以这光亮化作护盾：当你身边30尺内一个你能看见的生物进行感知豁免时，你可以用自己的反应令本次豁免获得优势。此特性的可用次数等于你的熟练加值，完成一次长休后你重获所有已消耗的使用次数。' },
      { slug: 'blessing-of-the-full-moon', name: '引导神力：满月祝福', englishName: 'Channel Divinity: Blessing of the Full Moon', level: 2, kind: 'resource', summary: '2级起用引导神力以动作向30尺内盟友灌输警觉或血染之月的祝福。', description: '第2级起，你能用引导神力为盟友注入野性之力：以动作从两种祝福中选一种，灌输给30尺内一个可见的自愿生物，并消耗引导神力次数。警觉之月的祝福持续1小时，被祝福者移动速度增加10尺，使用嗅觉或追踪时所作感知（察觉或生存）检定具有优势。血染之月的祝福持续10分钟，被祝福者攻击时若目标5尺内有未失能的盟友，其攻击检定具有优势。' },
      { slug: 'mind-of-two-moons', name: '引导神力：双月同心', englishName: 'Mind of Two Moons', level: 6, kind: 'resource', summary: '6级起可耗引导神力，在专注一个法术的同时再专注一个月亮领域法术。', description: '第6级开始，你能以引导神力引动艾桑椎亚双月的双重奥秘：消耗一次引导神力使用次数后，你可以在已经专注一个法术的情况下再施展并专注第二个法术，两个法术都必须处于你的月亮领域法术列表中。当你为维持这两个法术的专注而进行体质豁免时，该次豁免具有劣势；若豁免失败，你会同时失去对这两个法术的专注。' },
      { slug: 'empowered-spellcasting', name: '强力戏法', englishName: 'Empowered Spellcasting', level: 8, kind: 'passive', summary: '8级起牧师戏法造成伤害时再追加感知调整值（最低为1）。', description: '第8级起，你施展的牧师戏法在造成伤害时，可以再加上你的感知调整值（最小为1）。这是一项常驻增益，不需要动作或资源，也不限使用次数，只对属于牧师戏法的伤害生效。' },
      { slug: 'eclipse-of-ill-omen', name: '月蚀恶兆', englishName: 'Eclipse of Ill Omen', level: 17, kind: 'bonus-action', summary: '17级起以附赠动作召来月蚀1分钟，区域内生物豁免劣势并可诅咒目标。', description: '17级起，你能以附赠动作召来血月，让你周围60尺显现微红色微光，区域内生物豁免检定具有劣势；你可选任意数量生物不受影响。月蚀需你专注（同专注法术）至多1分钟，该专注对双月同心视为正专注的月亮领域法术。另外每回合一次，你对该区域内生物造成光耀伤害时可无需动作诅咒其中一名，直到月蚀结束它移动速度减半且无法回复生命值。' },
    ],
  },

  // ============ 牧师 cleric：鲜血领域 ============
  {
    slug: 'blood',
    classSlug: 'cleric',
    name: '鲜血领域',
    englishName: 'Blood Domain',
    summary: '由荒洲猩红结社开发、把体内生命之力拓展为神圣通道的牧师领域。领域牧师相信血即牺牲，是生与死的平衡，也是精魂在身躯中的锚点。他们从敌人的失血中强化法术，以鲜血连结侦测远方，甚至短暂驱使生者与死者。',
    features: [
      { slug: 'domain-spells', name: '领域法术', englishName: 'Domain Spells', level: 1, kind: 'resource', summary: '1级起获得鲜血领域法术，始终准备且不占每日准备上限。', description: '1级起，你在相应牧师等级自动获得鲜血领域法术并始终准备，它们不占用你每日可以准备的法术上限：1级虚假生命、睡眠术；3级定身类人、衰弱射线；5级加速术、缓慢术；7级枯萎术、石肤术；9级支配类人、定身怪物。这些法术属于领域赋予的固定列表，随牧师等级提升逐步可用。' },
      { slug: 'bonus-proficiencies', name: '附赠熟练项', englishName: 'Bonus Proficiencies', level: 1, kind: 'passive', summary: '1级起获得军用武器的熟练项，可用各类军用武器作战。', description: '在第1级选择该领域时，你获得军用武器的熟练项，可以使用各类军用武器作战。这是一项常驻收益，不需要做出选择，也不消耗任何资源或使用次数。' },
      { slug: 'bloodletting-focus', name: '失血凝集', englishName: 'Bloodletting Focus', level: 1, kind: 'passive', summary: '1级起立即法术伤害有血生物时，额外造成2＋法术环阶点暗蚀伤害。', description: '自第1级起，你的神圣魔法能从魔法造成的伤口中汲取血液，使敌人更加痛苦：当你施展一个持续时间为立即的1环或更高环阶法术时，任何受到该法术伤害且有血液的生物会额外受到2＋法术环阶点暗蚀伤害。这项追加伤害随所用法术位的环阶提升，不需要额外动作或资源。' },
      { slug: 'crimson-bond', name: '引导神力：猩红连结', englishName: 'Channel Divinity: Crimson Bond', level: 2, kind: 'resource', summary: '2级起可用引导神力与可见生物连结1小时，感知其方位、状态或感官。', description: '第2级起，你能以引导神力与可见生物或其血样原主建立最多1小时、失去专注即终止的连结。目标在10里内时，你可用动作得知它的方位、生命值与状态；也可用动作调谐其感官：你受2d6暗蚀伤害，目标作对抗你法术豁免DC的体质豁免，成功则连结结束，失败则你在感知调整值分钟数（至少1分钟）内借其感官视物或听物，自身相应目盲或耳聋。' },
      { slug: 'blood-puppet', name: '引导神力：缚血傀戏', englishName: 'Channel Divinity: Blood Puppet', level: 6, kind: 'resource', summary: '6级起可用引导神力操纵向60尺内有血生物或尸体，17级可及巨型。', description: '第6级起，你能以引导神力短暂操纵生物：以动作选择60尺内一个有血、大型或更小的生物或尸体，消耗使用次数。若为生物，须通过对抗你法术豁免DC的感知豁免，否则被你魅惑；昏迷者直接失败，尸体获得生命假象。你可无需动作命令它移动至多一半速度，并用自身动作交互物件、攻击或什么都不做。控制至多1分钟，17级可及巨型或更小目标。' },
      { slug: 'sanguine-recall', name: '殷红回想', englishName: 'Sanguine Recall', level: 6, kind: 'action', summary: '6级起以动作牺牲生命恢复法术位，总环阶不超过牧师等级一半。', description: '第6级开始，你能以一个动作牺牲自身一部分生命力来恢复已消耗的法术位，此特性每次长休只能使用一次。所恢复法术位的环阶总和不得大于你牧师等级的一半（向上取整），且任何一枚法术位的环阶都必须小于6环；每恢复1环你就承受1d8点无法用任何手段减免的暗蚀伤害。例如8级牧师最多恢复总环阶4的法术位，随后受到4d8点暗蚀伤害。' },
      { slug: 'divine-strike', name: '神圣打击', englishName: 'Divine Strike', level: 8, kind: 'passive', summary: '8级起每回合一次武器命中可额外造成1d8暗蚀伤害，14级提升为2d8。', description: '第8级起，你能让自己造成的物理伤口大量失血：你在自己每个回合一次，于用武器攻击命中某个生物时，使该攻击额外造成1d8点暗蚀伤害；14级时这一额外伤害提升到2d8。该效果不需要动作，也不消耗资源，但每回合只能触发一次。' },
      { slug: 'vascular-corruption-aura', name: '血裂灵光', englishName: 'Vascular Corruption Aura', level: 17, kind: 'action', summary: '17级起以动作散发30尺灵光1分钟，敌人进入或停留受3d6暗蚀且回血减半。', description: '17级起，你能以一个动作散发出令周遭敌人血管破裂流血的致命负能量灵光，持续1分钟。任何拥有血液的敌对生物在一个回合内首次进入你周围30尺范围，或在该区域内开始自己的回合时，都会受到3d6点暗蚀伤害；若拥有血液的敌对生物在灵光范围内恢复生命值，它只能回复该恢复量一半的生命值。此特性用后须完成一次长休才能再次使用。' },
    ],
  },

  // ============ 野蛮人 barbarian ============
  {
    slug: 'colossus',
    classSlug: 'barbarian',
    name: '巨像道途',
    englishName: 'Path of the Juggernaut',
    summary: '把愤怒化为不可阻挡的推进力的野蛮人原初道途，他们挥舞武器的力量足以把面前的一切击飞到一旁。道途以雷鸣猛推持续改写战场站位，又以山一般的稳固与坚不可移的姿态把自己钉在敌人面前。',
    features: [
      { slug: 'thunderous-blows', name: '雷鸣猛推', englishName: 'Thunderous Blows', level: 3, kind: 'passive', summary: '3级起狂暴中近战命中可把目标推开至多5尺，10级提升为至多10尺。', description: '当你3级选择此原初道途时，愤怒会为你注入冲破一切敌人的力量：在你狂暴期间，当你的近战攻击命中一个生物时，你能迫使该生物朝你选择的方向移动至多5尺。若被推动的生物体型为巨型或更大，它可以进行一次DC等于8＋你的熟练加值＋你的力量调整值的力量豁免，成功则不被推动。当你达到10级后，命中时可推动至多10尺而非5尺。' },
      { slug: 'spirit-of-the-mountain', name: '高山之魂', englishName: 'Spirit of the Mountain', level: 3, kind: 'passive', summary: '3级起狂暴中只要站在地面上，就不会被击倒或被强制移动。', description: '从3级起，你能利用愤怒把双脚牢牢锚定在大地上，化作一堵力量之墙：在你狂暴期间，只要你站在地面上，你就无法被非自愿地击入倒地状态，也无法被非自愿地强迫移动。该效果不消耗动作或资源，随狂暴状态自动生效。' },
      { slug: 'demolishing-might', name: '摧枯拉朽', englishName: 'Demolishing Might', level: 6, kind: 'passive', summary: '6级起近战武器攻击对构装生物额外造成1d8，对物件与建筑造成双倍伤害。', description: '自6级起，你的近战武器攻击对构装生物额外造成1d8点伤害，对物件和建筑物则造成双倍伤害。这项增益常驻生效，不需要动作或资源，与是否处于狂暴状态无关。' },
      { slug: 'resolute-stance', name: '坚不可移', englishName: 'Resolute Stance', level: 6, kind: 'passive', summary: '6级起可在自己回合开始时无需动作进入防御姿态，换取免擒抱与敌方劣势。', description: '同样自6级起，你能临时调配自己的战斗能力，让自己成为一堵防御之墙：在你的回合开始时（无需动作），你可以使自己进入防御姿态，持续到你的下个回合开始。姿态下你无法被擒抱，任何对你发动的攻击都具有劣势，不过你发动的武器攻击也同样具有劣势。' },
      { slug: 'hurricane-strike', name: '旋风打击', englishName: 'Hurricane Strike', level: 10, kind: 'reaction', summary: '10级起推动生物时可用反应跳到它身旁并可能将其击倒，盟友也能借机攻击。', description: '10级起，当你推动一个生物至少5尺时，你能紧随其后，用反应跳到与该生物相邻的未占据空间；若你如此做，该生物还须通过一次DC等于8＋熟练加值＋力量调整值的力量豁免，否则应击倒地，这次跳跃不消耗移动力也不触发借机攻击。此外，当你把一个生物推入盟友周围5尺内时，那位盟友能立刻用反应对该生物发动一次近战武器攻击。' },
      { slug: 'unstoppable', name: '势不可挡', englishName: 'Unstoppable', level: 14, kind: 'passive', summary: '14级起狂暴中速度无法被降低，并免疫恐慌、麻痹、倒地与震慑。', description: '当你达到14级后，战斗中的愤怒令你变得势不可挡：在你狂暴期间，你的速度无法被降低，且你免疫恐慌、麻痹、倒地与震慑状态。若你已处于恐慌、麻痹或震慑状态，你依旧可以以一个附赠动作进入狂暴（即使你已无法使用动作），狂暴后你不再受这些状态影响。' },
    ],
  },
]

export const taldoreiSubclasses2014: readonly SubclassRule[] = seeds.map((seed) => {
  const id = `subclass-2014-tp-tal-${seed.classSlug}-${seed.slug}`
  const features: readonly SubclassFeature[] = seed.features.map((feature) => ({
    id: `tp-tal-${seed.classSlug}-${seed.slug}-${feature.slug}`,
    subclassId: id,
    name: feature.name,
    englishName: feature.englishName,
    level: feature.level,
    summary: feature.summary,
    description: feature.description,
    kind: feature.kind,
    status: 'selectable',
    sourceIds: TAL_DOREI,
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
    sourceIds: TAL_DOREI,
    features,
  }
})
