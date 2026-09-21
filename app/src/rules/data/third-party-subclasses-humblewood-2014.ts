import type { SubclassFeature, SubclassFeatureKind, SubclassRule } from '@/types/rules'

/** G3-I2e：《谦卑林》(Humblewood) 与《谦卑林故事集》(Humblewood Tales) 第三方子职（2014 口径）。
 *  来源 ID：谦卑林 `tp-humblewood-index`、谦卑林故事集 `tp-humblewood-tales-index`（逐条各自登记）。
 *  第三方合作内容，来源默认关闭、需 DM 同意；仅登记选择与展示所需元数据与原创中文摘要，效果不进入自动计算。 */

const HUMBLEWOOD = ['tp-humblewood-index'] as const
const HUMBLEWOOD_TALES = ['tp-humblewood-tales-index'] as const

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
  /** 书简称：hw＝《谦卑林》，hwt＝《谦卑林故事集》，用于子职 id 与特性 id 前缀。 */
  readonly bookAbbr: 'hw' | 'hwt'
  /** 该子职自身的来源 ID（本模块跨两本书，故逐条指定）。 */
  readonly sourceId: readonly string[]
  readonly name: string
  readonly englishName: string
  readonly summary: string
  readonly features: readonly FeatureSeed[]
}

const seeds: readonly SubclassSeed[] = [
  // ============ 牧师 cleric（谦卑林） ============
  {
    slug: 'community',
    classSlug: 'cleric',
    bookAbbr: 'hw',
    sourceId: HUMBLEWOOD,
    name: '团队领域',
    englishName: 'Community Domain',
    summary: '把亲情、友情与代代相传的传统视作神性纽带的牧师领域，信奉众人互帮互助时汇聚起来的那股强大力量。领域牧师为同伴备好炉灶与盛宴，以警觉的恩惠守望队伍，并在武器上灌注惩戒恶行的神力。',
    features: [
      { slug: 'domain-spells', name: '团队领域法术', englishName: 'Community Domain Spells', level: 1, kind: 'resource', summary: '1级起随牧师等级获得团队领域法术，始终准备且不占每日准备上限。', description: '1级起，你在相应牧师等级自动获得下列团队领域法术并始终准备，它们不占用你每日可准备的法术数量：1级祝福术、神莓术；3级援助术、英雄气概；5级希望信标、灵体卫士；7级放逐术、魔邓肯忠犬；9级群体疗伤术、拉瑞心灵联结。这些法术属于领域赋予的固定列表，随牧师等级提升逐步可用。' },
      { slug: 'blessing-of-the-hearth', name: '炉灶祝福', englishName: 'Blessing of the Hearth', level: 1, kind: 'passive', summary: '1级起可随时召出炉灶，同营伙伴短休可重掷生命骰取高，并获得厨师工具熟练。', description: '第1级起，你能随时召唤一座带简易铁锅的小石板炉灶，为同伴取暖并在旅途中烹制食物。与你一同扎营的友好生物进行短休时，若它花费一枚或多枚生命骰恢复生命值，它可以重掷其中任意数量的骰子，并为每枚骰子在重掷前后取较高者计算恢复量。此外你获得厨师工具的熟练项。' },
      { slug: 'channel-divinity-magnificent-feast', name: '引导神力：宏伟盛宴', englishName: 'Channel Divinity: Magnificent Feast', level: 2, kind: 'resource', summary: '2级起用引导神力造出感知调整值份食物，食用可回血并解除恐慌或中毒。', description: '自2级起，你可以引导神力咒唤一场魔法盛宴，使用它需要花费10分钟。你造出数量等同于你感知调整值（至少1份）的简易食物，每份持续8小时（你完成一次休息后提前消失）且不会变质。食用一份食物需要一个动作，食用者恢复2d4＋你牧师等级点生命值，并消除其正遭受的恐慌或中毒状态之一（由食用者选择）。' },
      { slug: 'channel-divinity-community-watch', name: '引导神力：团队警戒', englishName: 'Channel Divinity: Community Watch', level: 6, kind: 'resource', summary: '6级起用引导神力给予至多感知调整值名盟友恩惠，每轮可掷d6加在检定上。', description: '自6级起，你可以引导神力唤起队伍的提防之心：你与至多等同于感知调整值名（至少1名）能看见你且位于你30尺内的盟友获得恩惠，持续等于你感知调整值轮（至少1轮）。每轮一次，受恩惠的生物进行属性检定、豁免检定或攻击检定时，若它能看见至少一名自己的盟友，就可以掷一枚d6并把结果加到该检定上。' },
      { slug: 'divine-strike', name: '神圣打击', englishName: 'Divine Strike', level: 8, kind: 'passive', summary: '8级起每回合一次武器命中可额外造成1d8心灵伤害，14级起提升为2d8。', description: '自8级起，每当你以武器攻击命中一个生物时，你可以每回合一次使该攻击额外造成1d8点心灵伤害——对方曾犯下的恶行会以幻象闪现在它眼前；若这次攻击把目标生命值降至0，你可以选择让它以伤势稳定的状态倒下，或直接死亡。14级起该额外伤害提升为2d8。' },
      { slug: 'paragon-of-the-people', name: '人民楷模', englishName: 'Paragon of the People', level: 17, kind: 'passive', summary: '17级起团队警戒恩惠每轮多掷一枚d6且免疫恐惧，盛宴食物翻倍并能解诅咒。', description: '17级起，受你团队警戒恩惠的生物每轮可以额外掷一枚d6，并在恩惠期间免疫恐惧。此外，你的宏伟盛宴造出的食物数量翻倍，且任何一份食物被食用后，还能额外消除食用者正遭受的一项诅咒或疾病（包括与被诅咒物品之间的同调）。' },
    ],
  },
  {
    slug: 'night',
    classSlug: 'cleric',
    bookAbbr: 'hw',
    sourceId: HUMBLEWOOD,
    name: '黑夜领域',
    englishName: 'Night Domain',
    summary: '以黑夜与阴影为神域的牧师领域，信奉唯有窥探黑暗、寻见隐藏之物才能寻得真理。领域牧师在昏暗中看得比谁都清楚，能以圣影遮蔽自身，也能熄灭光源、用夜幕让敌人目盲与恐慌。',
    features: [
      { slug: 'domain-spells', name: '黑夜领域法术', englishName: 'Night Domain Spells', level: 1, kind: 'resource', summary: '1级起随牧师等级获得黑夜领域法术，始终准备且不占每日准备上限。', description: '1级起，你在相应牧师等级自动获得下列黑夜领域法术并始终准备，它们不占用你每日可以准备的法术上限：1级睡眠术、黄昏之纱；3级黑暗术、月华之光；5级回避侦测、暮光法球；7级预言术、恒星之躯；9级托梦术、伪装术。其中黄昏之纱、暮光法球与恒星之躯为本书新增法术；这些法术属于领域赋予的固定列表，随牧师等级提升逐步可用。' },
      { slug: 'eye-of-twilight', name: '暮眼锐瞳', englishName: 'Eye of Twilight', level: 1, kind: 'passive', summary: '1级起在微光与黑暗中视物如常，6、8级扩大范围，17级可获黑暗中的真实视觉。', description: '第1级起，你如同在明亮环境下般看见60尺内微光中的事物，也能如微光环境般看见60尺内黑暗（不论是否魔法）中的事物，只是无法分辨颜色。6级时范围增至120尺，8级起还能如明亮环境般看清120尺内的黑暗。17级起你可呼唤神力获得120尺真实视觉，持续感知调整值分钟（至少1分钟），仅对黑暗中的事物生效，用后须长休才能再用。' },
      { slug: 'ward-of-shadows', name: '圣影庇护', englishName: 'Ward of Shadows', level: 1, kind: 'reaction', summary: '1级起30尺内生物攻击你时可用反应令该攻击具有劣势，次数为感知调整值。', description: '自1级起，你能以无数神圣阴影造出防护罩，从攻击者的视线中隐去身形：当你周围30尺内的一名生物向你发动攻击时，你可以用反应呼唤圣影笼罩自己，使该次攻击具有劣势。若攻击者无法陷入目盲状态，它也不受此特性影响。此特性的使用次数等于你的感知调整值（至少1次），完成一次长休后你重获全部已消耗的次数。' },
      { slug: 'channel-divinity-invocation-of-night', name: '引导神力：圣夜祈唤', englishName: 'Channel Divinity: Invocation of Night', level: 2, kind: 'resource', summary: '2级起用引导神力以动作熄灭30尺内光源，敌人豁免失败则目盲数轮。', description: '自2级起，你可以引导神力驾驭夜幕：以一个动作展示你的圣徽，使你周围30尺内的任何光源（不论平凡还是魔法）熄灭。此外，你周围30尺内每个敌对生物都必须通过一次体质豁免，失败者陷入目盲，持续等于你牧师等级的轮数；因此目盲的生物可在自己每个回合结束时重新豁免，成功则结束该状态。对你而言处于全身掩护的生物不受影响。' },
      { slug: 'improved-ward', name: '精通御影', englishName: 'Improved Ward', level: 6, kind: 'passive', summary: '6级起只要攻击者位于你30尺内，圣影庇护的反应也可用于它攻击其他生物时。', description: '自第6级起，你对圣影的掌控更加精细：即使攻击目标是另一个生物，只要发动攻击的攻击者位于你周围30尺范围内，你也可以对该攻击者使用你的圣影庇护反应，使这次攻击具有劣势。圣影庇护原有的使用次数与长休恢复规则不变。' },
      { slug: 'veil-of-dreams', name: '幻梦之纱', englishName: 'Veil of Dreams', level: 8, kind: 'passive', summary: '8级起睡眠术可加牧师等级提高影响上限，可自定顺序并令入睡者无法被唤醒。', description: '达到8级时你已完全精通魔法睡眠：施展睡眠术时，决定该法术能影响多少点生命值的那次掷骰可加上你的牧师等级，你也可以自由决定范围内生物受影响的顺序——生命值过高而未被影响的生物会被略过，法术继续尝试顺序中的下一个。此外，任何因此入睡的生物直到你下个回合开始前都无法被唤醒。' },
      { slug: 'creature-of-the-night', name: '暗影之兽', englishName: 'Creature of the Night', level: 17, kind: 'action', summary: '17级起以动作散发30尺黑暗与50尺阴影1分钟，范围内敌人恐慌，黑暗中目盲。', description: '自17级起，你能以一个动作激活象征深夜的超自然光环，持续1分钟，也可再用一个动作提前解除：以你为中心散发半径30尺的深邃黑暗，其外50尺形成幽暗阴影，覆盖并熄灭范围内一切光源，只有9环法术或类似强大效应造出的光亮才能驱散。身处阴影与黑暗中的敌人陷入恐慌，直到离开范围；处于黑暗中的敌人还陷入目盲，同样直到离开黑暗。' },
    ],
  },

  // ============ 吟游诗人 bard（谦卑林） ============
  {
    slug: 'road',
    classSlug: 'bard',
    bookAbbr: 'hw',
    sourceId: HUMBLEWOOD,
    name: '旅路学院',
    englishName: 'College of the Road',
    summary: '把旅途见闻与各路流浪冒险者的经验化为技艺的吟游诗人学院，他们靠理解力与洞察力把零散知识用成实用战术。旅者技艺簿提供大量跨职业手段，招牌技艺则让其中最顺手的一项随取随用。',
    features: [
      { slug: 'bonus-proficiencies', name: '附赠熟练项', englishName: 'Bonus Proficiencies', level: 3, kind: 'choice', summary: '3级起从赌具、军用武器、工具、技能或语言等选项中自选三项熟练。', description: '第3级加入旅路学院时，你从下列选项中自选三项（每个选项只能选择一次）：任意一套赌具的熟练项、任意一把军用武器的熟练项、草药工具的熟练项、盗贼工具的熟练项、任意一项技能的熟练项，或任意两门语言。所得熟练项永久生效，不消耗动作与资源。' },
      { slug: 'wanderers-lore', name: '流浪者的逸闻录', englishName: "Wanderer's Lore", level: 3, kind: 'passive', summary: '3级起持有你诗人激励骰的生物，奥秘、历史、自然与宗教检定具有优势。', description: '第3级起，你能把旅途中听来的趣闻讲给同伴，帮助他们从新的角度看待问题：只要一个生物持有由你提供的诗人激励骰，它进行的奥秘、历史、自然与宗教检定就具有优势。该生物仍可自行决定是否在检定中消耗这枚激励骰，因此只要不用掉它，这些检定就一直享有优势。' },
      { slug: 'travelers-tricks', name: '旅行者的技艺簿', englishName: "Traveler's Tricks", level: 3, kind: 'choice', summary: '3级自选两项旅者技艺，6级与14级各再学一项，使用多需附赠动作与激励次数。', description: '第3级起，你把旅途中学到的技巧与知识记成旅者技艺，从技艺选项中自选两项习得，6级与14级各再学一项。除非另有说明，使用旅者技艺需要一个附赠动作并消耗一次诗人激励使用次数；需要豁免的技艺以8＋熟练加值＋感知调整值作为DC。技艺涵盖近战、闪避、治疗、召唤与防护等多种跨职业手段。' },
      { slug: 'favorite-trick', name: '招牌技艺', englishName: 'Favorite Trick', level: 6, kind: 'passive', summary: '6级指定一项已知技艺为招牌技艺，掷先攻若无激励次数则重获一次供其使用。', description: '达到6级时，你已充分掌握一项旅者技艺，可以随时取用：指定一项你已习得的旅者技艺作为招牌技艺。若你在投掷先攻时已没有可用的诗人激励使用次数，你会重获一次使用次数，但以此获得的次数只能用于使用你所选的招牌技艺。14级时，你可以再指定第二项已习得的旅者技艺作为招牌技艺。' },
      { slug: 'improved-tricks', name: '精进技艺', englishName: 'Improved Tricks', level: 6, kind: 'passive', summary: '6级与14级起旅者技艺随掌握加深获得强化，具体强化内容见各技艺说明。', description: '在第6级与第14级，你对旅者技艺的掌握愈发精进：通过与更强大的冒险者交流心得，你已习得的旅者技艺会获得更强大的效果，具体强化内容随技艺而异（例如反射闪避教程、伤口包扎术、林地之精咒唤术在这两个等级各有追加效果）。此特性不消耗动作或资源，也不需要额外选择。' },
    ],
  },

  // ============ 战士 fighter（谦卑林） ============
  {
    slug: 'outlaw',
    classSlug: 'fighter',
    bookAbbr: 'hw',
    sourceId: HUMBLEWOOD,
    name: '法外狂徒',
    englishName: 'Scofflaw',
    summary: '信奉「规则就是用来打破的」的战士范型，为求胜利不择手段：用言语扰乱、用假动作诱敌，再趁其松懈一击致命。他们精通随手可得的临时武器，也擅长把恶名化为令敌人胆寒的威压。',
    features: [
      { slug: 'bonus-proficiency', name: '附赠熟练项', englishName: 'Bonus Proficiency', level: 3, kind: 'choice', summary: '3级起从欺骗、洞悉、威吓、巧手、隐匿中选一项熟练，或改学盗贼黑话。', description: '第3级选择此法外狂徒范型时，你从欺骗、洞悉、威吓、巧手、隐匿中选择一项技能并获得其熟练项；你也可以放弃这些技能熟练项，改为习得盗贼黑话。该选择一经做出便固定下来，不需要消耗动作或资源。' },
      { slug: 'intimidating-banter', name: '危言耸听', englishName: 'Intimidating Banter', level: 3, kind: 'passive', summary: '3级起只要身处战斗之中，魅力属性检定可改用力量或敏捷进行调整。', description: '达到第3级后，你把专业级的侮辱与大师级的讽刺融入战斗风格：只要你身处战斗之中，进行魅力属性检定时可以选择改用力量属性或敏捷属性来计算调整值。这是一项常驻收益，不需要动作，也不消耗资源或使用次数。' },
      { slug: 'brutal-brawler', name: '残暴斗殴', englishName: 'Brutal Brawler', level: 3, kind: 'passive', summary: '3级起熟练任何临时武器且视其具有灵巧，命中可耗附赠动作换取满值伤害骰。', description: '第3级起，你在酒馆混战中学会随手抓东西打伤害：你熟练于任何临时武器，且对你而言手持的临时武器视为具有灵巧属性。用临时武器命中时，你可消耗附赠动作换取满值伤害——武器会损坏，但本次伤害掷骰中它的所有伤害骰视为掷出最大值（额外骰子除外）。10级起被摧毁的武器基础伤害骰再加2d6，18级起你用临时武器发动的攻击具有优势。' },
      { slug: 'misdirection', name: '弄虚作假', englishName: 'Misdirection', level: 7, kind: 'bonus-action', summary: '7级起以附赠动作虚晃5尺内敌人，智力豁免失败则被迫用反应攻击其同伴。', description: '达到第7级后，你学会用言语与假动作诱使敌人误伤同伴：以一个附赠动作虚晃周围5尺内一名能看见、听见或理解你行为的生物，迫使它进行智力豁免（DC＝8＋熟练加值＋你的力量或敏捷调整值）。失败时它必须用自己的反应攻击其周围5尺内由你选择的另一个生物；若该范围内除你之外没有别的生物，它就浪费这次反应去攻击你曾占据过的空间。' },
      { slug: 'blindside', name: '涤瑕蹈隙', englishName: 'Blindside', level: 10, kind: 'passive', summary: '10级起可从三种时机发动弱点打击，命中追加5d6，15级7d6、18级9d6。', description: '达到第10级后，你擅长抓住敌人松懈的瞬间发动致命一击：对战斗中尚未进行回合的生物、同一回合中被你虚晃过的生物，或任何你以优势攻击的目标，本次命中额外造成5d6点伤害。使用后须完成一次短休或长休才能再次使用；15级起该伤害为7d6，18级起为9d6，且18级起若战斗开始时你已用尽此特性，你会重新获得一次使用权。' },
      { slug: 'infamy', name: '臭名远扬', englishName: 'Infamy', level: 15, kind: 'action', summary: '15级起攻击动作中可恐吓30尺内目标，感知豁免失败则恐慌1分钟。', description: '第15级起，你的恶名足以令对手心生畏惧：作为攻击动作的一部分，你可以恐吓周围30尺内一名能看见、听见或理解你行为的生物，迫使它进行感知豁免（DC＝8＋熟练加值＋你的力量或敏捷调整值），失败则陷入对你的恐慌1分钟。见过你残忍手段或听闻过你事迹的生物在此豁免上具有劣势；受恐慌者可在自己每回合结束时重复豁免，成功则提前结束。' },
      { slug: 'two-for-flinching', name: '一刀不够，两刀来凑', englishName: 'Two For Flinching', level: 18, kind: 'passive', summary: '18级起对被你虚晃或处于异常状态的敌人执行攻击动作时，可额外攻击一次。', description: '到达第18级时，你已把利用弱点的艺术练到极致：当你对本回合中成功被你虚晃过的敌人、或正遭受任何一种异常状态影响的敌人执行攻击动作时，你可以对该敌人额外发动一次攻击。每轮你只能使用此特性一次。' },
    ],
  },

  // ============ 德鲁伊 druid（谦卑林故事集） ============
  {
    slug: 'watch',
    classSlug: 'druid',
    bookAbbr: 'hwt',
    sourceId: HUMBLEWOOD_TALES,
    name: '守望结社',
    englishName: 'Circle of the Warden',
    summary: '充当自然平衡守卫的德鲁伊结社，以占卜与防护魔法预见可能的失衡，并在造成无可挽回的损害之前予以纠正。他们认为人类与动植物同属自然平衡的一部分，因而既救助受灾的乡民，也庇护林木与野兽。',
    features: [
      { slug: 'heartbeat-of-the-land', name: '大地心跳', englishName: 'Heartbeat of the Land', level: 2, kind: 'passive', summary: '2级起自然与洞悉熟练且用双倍熟练加值，可花10分钟感知3里内的自然状况。', description: '从第2级选择该结社起，你与自然建立联系并能感知它何时陷入危险：你获得自然与洞悉技能的熟练项，使用这两项技能时加入双倍熟练加值。你还可以花10分钟与自然交流，了解3里范围内该地区的状况——各项直接威胁的大致位置与严重程度，范围内是否存在天族、妖精、邪魔、元素或亡灵（不知其具体位置），以及最近元素位面传送门的大致方位。' },
      { slug: 'reclamation', name: '回收', englishName: 'Reclamation', level: 2, kind: 'reaction', summary: '2级起30尺内生物受元素伤害时可用反应给它抗性，也能以动作缩小元素效应范围。', description: '第2级起，你能吸收有害元素能量：30尺内生物受寒冷、火焰、闪电或雷鸣伤害时，你可用反应让它获得该伤害类型的抗性，自己承受等量伤害。此外你能以动作缩小30尺内持续造成寒冷、火焰或闪电伤害的自然或法术效应，每次移除20尺立方，每移除5尺你受同类型1d4伤害（法术则为每环阶1d4），伤害空间耗尽时法术被驱散。' },
      { slug: 'sympathetic-shield', name: '同情护盾', englishName: 'Sympathetic Shield', level: 6, kind: 'action', summary: '6级起以动作消耗荒野变形，为30尺内生物提供临时生命与AC+1，14级可反击。', description: '第6级起，你能把荒野变形转为护盾：以一个动作消耗一次荒野变形，为自己或30尺内盟友披上野兽精魂铠甲。受保护者获得每3级德鲁伊等级1d10点临时生命与AC+1，直到临时生命耗尽或被其他临时生命效应取代。14级起，受保护者被5尺内生物伤害时，铠甲对该生物造成1d8点魔法穿刺、挥砍或钝击伤害（类型由你选），每轮每目标限一次。' },
      { slug: 'aura-of-calm', name: '平静光环', englishName: 'Aura of Calm', level: 10, kind: 'passive', summary: '10级起10尺内盟友受法术治疗额外回血，光环还能压制植物造成的困难地形。', description: '第10级起，你散发出令人舒缓的自然魔法光环：每当你10尺内的友好生物受到法术治疗时，该法术额外恢复等于你德鲁伊等级一半的生命值。此外，光环内的非生物植物都会茂盛生长并恢复活力，对冒险者而言是安全的，光环可以抵消植物导致的困难地形（包括纠缠术或荆棘丛生等魔法效应），且为抵抗这类法术的有害效应所进行的豁免具有优势。' },
      { slug: 'bond-of-shelter', name: '庇护之绊', englishName: 'Bond of Shelter', level: 14, kind: 'action', summary: '14级起以动作造出半径30尺、高20尺的柱状保护区1小时，活化自然元素伤敌。', description: '第14级起，你可用动作造出半径30尺、高20尺、持续1小时且无法移动的柱状保护能量，区域内自然元素活化护主。非指定生物须通过你法术豁免DC的魅力豁免才能进入，自区域外的攻击具有劣势，你选定的生物免受魅惑、恐慌与附身；生物每回合首次进入或在内开始回合时受5d10魔法钝击伤害。你指定的生物免疫这些效应，用后须长休才能再用。' },
    ],
  },

  // ============ 法师 wizard（谦卑林故事集） ============
  {
    slug: 'leyline',
    classSlug: 'wizard',
    bookAbbr: 'hwt',
    sourceId: HUMBLEWOOD_TALES,
    name: '地脉魔法',
    englishName: 'Leyline Magic',
    summary: '通过调谐地脉汲取原始自然魔力的法师学派，能借地脉法术库获得额外法术、强化自己的法术，或干扰在领域中扎根的敌对魔法。学派中最强大的法师可以凭空织出新的地脉，把荒芜绝地逐步变成沃土。',
    features: [
      { slug: 'natural-attunement', name: '自然调谐', englishName: 'Natural Attunement', level: 2, kind: 'resource', summary: '2级起在自然环境中准备法术时可与一条地脉调谐，获得该地脉的始终准备法术。', description: '从第2级选择该学派起，你学会与贯穿自然的地脉同调：在自然环境中准备法术时，你可同时与附近的一条地脉调谐，并依据环境类型（寒带、海岸、荒漠、森林、草原、山地等）获得对应地脉法术，一次只能调谐一条。调谐期间你始终准备着列表中你满足等级要求的法术，它们不计入每日准备上限、也不加入法术书；不在法师列表上的法术对你视为法师法术。' },
      { slug: 'thrum-of-the-land', name: '大地丝弦', englishName: 'Thrum of the Land', level: 2, kind: 'passive', summary: '2级起在匹配环境中施放地脉法术可获攻击、豁免DC或专注方面的增益。', description: '第2级起，你能从地脉引导能量为法术注入力量：当你处于与所调谐地脉匹配的环境中时，施展地脉法术可从三项增益中选一——法术攻击检定+2、法术豁免DC+1，或维持该法术专注的体质豁免具有优势且专注时长可延长一倍。14级起只要环境匹配，六环或更高环阶的法术也能应用这些增益，但14级起一旦使用便须完成一次长休才能再次使用。' },
      { slug: 'biorhythm', name: '生理节律', englishName: 'Biorhythm', level: 6, kind: 'passive', summary: '6级起用奥术回想恢复法术位时每恢复一个位回复1d8生命，自然中短休可改换地脉。', description: '第6级起，你学会引导地脉能量增强身体的自然愈合：只要你与一条地脉保持调谐，每当你使用奥术回想特性恢复已消耗的法术位时，每恢复一个法术位就恢复1d8点生命值。此外，当你在自然环境中完成短休时，你可以按自然调谐的规则改为与另一种类型的地脉调谐。' },
      { slug: 'natural-disruption', name: '自然干扰', englishName: 'Natural Disruption', level: 10, kind: 'passive', summary: '10级起可不消耗法术位施展法术反制或解除法术，并按最高环阶结算，长休一次。', description: '从第10级起，你能从地脉中引导能量破坏他人的魔法：你可以不消耗法术位地施展法术反制或解除法术，并以你可施展的最高环阶法术位环阶来施展它们。使用此特性后，你须完成一次长休才能再次使用。' },
      { slug: 'leyline-weaving', name: '地脉编织', englishName: 'Leyline Weaving', level: 14, kind: 'action', summary: '14级起经1小时冥想就地织出新地脉1里，可自选地形调谐，用后须长休恢复。', description: '第14级起，你学会接入遥远的地脉网络：通过1小时冥想，你能借遥远地脉之力在当前位置暂时创造一条新地脉，并从地脉法术表中选择任意地形与之调谐（无需与当前地形匹配）。新地脉以冥想位置为中心影响半径1里，使该区域变为你调谐的地形，24小时后消失；若每日在同一位置重复并持续一年，该效应会成为永久效果。用后须长休才能再用。' },
    ],
  },

  // ============ 魔契师 warlock（谦卑林故事集） ============
  {
    slug: 'predator',
    classSlug: 'warlock',
    bookAbbr: 'hwt',
    sourceId: HUMBLEWOOD_TALES,
    name: '猎食者',
    englishName: 'The Predator',
    summary: '与受嗜血渴求驱动的原初野兽缔约的魔契师，宗主的野性之力会改写契约者的身体，让牙齿尖锐如荆棘、肢体长出具爪。他们能以野兽之形狩猎、从撕咬中汲取活力，并在受创的瞬间立刻还以獠牙。',
    features: [
      { slug: 'expanded-spell-list', name: '扩展法术表', englishName: 'Expanded Spell List', level: 1, kind: 'resource', summary: '1级起获得猎食者宗主的扩展法术列表，选学魔契师法术时可选范围更大。', description: '与猎食者宗主缔约后，你学习魔契师法术时可以从更大的列表中选择，下列法术加入你的法术列表：1环猎人印记、跳跃术；2环变身术、伏击猎物；3环闪现术、缓慢术；4环支配野兽、行动自如；5环疫病术、假象术。其中伏击猎物为本书新增法术，这些法术随你可用的法术环阶提升逐步可选。' },
      { slug: 'bonus-proficiencies', name: '额外熟练', englishName: 'Bonus Proficiencies', level: 1, kind: 'passive', summary: '1级起获得求生技能的专精，所有感知（求生）检定加入双倍熟练加值。', description: '自1级起，你的宗主赋予你更强的追踪本领：你获得求生技能的专精，你进行的所有感知（求生）检定都可以加入双倍的熟练加值。这是一项常驻收益，不需要动作，也不消耗资源。' },
      { slug: 'form-of-the-beast', name: '野兽之形', englishName: 'Form of the Beast', level: 1, kind: 'bonus-action', summary: '1级起以附赠动作化作野兽姿态：临时生命、敏锐感官与啃咬爪击，每次休息两次。', description: '自1级起，你可用附赠动作化作野兽姿态10分钟（6级起1小时）：获得魔契师等级两倍的临时生命（至多20点），追踪的隐匿、察觉与求生检定有优势，并长出熟练的利牙与兽爪：可用魅力调整值攻击，啃咬1d6穿刺、爪击1d4挥砍。啃咬后可用附赠动作爪击一次，5级起两次并可用附赠动作疾走或躲藏。每次短休或长休后可用两次。' },
      { slug: 'thrill-of-the-hunt', name: '狩猎狂热', englishName: 'Thrill of the Hunt', level: 6, kind: 'passive', summary: '6级起野兽之形下每回合一次啃咬追加3d6暗蚀并回复伤害一半生命，10级提升。', description: '6级起，处于野兽之形期间你能从敌人身上汲取活力：每回合一次，当你以啃咬攻击命中一个生物时，你可以令这次攻击额外造成3d6点暗蚀伤害，并恢复等同于该次攻击造成总伤害一半的生命值。一旦使用，你须以啃咬或爪击造成一次重击，或完成一次短休或长休，才能再次使用；10级起该额外暗蚀伤害提升为5d6。' },
      { slug: 'fearsome-presence', name: '惊惧威仪', englishName: 'Fearsome Presence', level: 10, kind: 'action', summary: '10级起以动作令30尺内可见敌人感知豁免，失败则恐慌，休息后恢复。', description: '第10级时，你学会引导某种骇人野兽的威仪，未变身时也能使用：以一个动作，使你30尺内你能看见的敌对生物各进行一次对抗你法术豁免DC的感知豁免，失败者陷入对你的恐慌（资料注明持续1分钟，并另述直至你下个回合结束）；恐慌者可在其每回合结束时重复该豁免，成功则结束效应。一旦使用，你须完成一次短休或长休才能再次使用。' },
      { slug: 'uncaged-beast', name: '脱笼困兽', englishName: 'Uncaged Beast', level: 14, kind: 'reaction', summary: '14级起被命中时可用反应立刻变身并反击5尺内敌人，变身期间受伤亦可反击。', description: '到达14级时，被逼至极限的你变得更加凶残：当一个你能看见的攻击者以一次攻击命中你时，你可以用反应立即变身为野兽之形，随后对你5尺范围内的一名敌人进行一次啃咬或爪击攻击。此外，在处于野兽之形期间，当你受到来自你5尺范围内某个生物的伤害时，你可以用反应对该生物进行一次啃咬或爪击攻击。' },
    ],
  },
]

export const humblewoodSubclasses2014: readonly SubclassRule[] = seeds.map((seed) => {
  const id = `subclass-2014-tp-${seed.bookAbbr}-${seed.classSlug}-${seed.slug}`
  const features: readonly SubclassFeature[] = seed.features.map((feature) => ({
    id: `tp-${seed.bookAbbr}-${seed.classSlug}-${seed.slug}-${feature.slug}`,
    subclassId: id,
    name: feature.name,
    englishName: feature.englishName,
    level: feature.level,
    summary: feature.summary,
    description: feature.description,
    kind: feature.kind,
    status: 'selectable',
    sourceIds: seed.sourceId,
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
    sourceIds: seed.sourceId,
    features,
  }
})
