import type { SubclassFeature, SubclassFeatureKind, SubclassRule } from '@/types/rules'

/** G3-I2e：《花卉龙博考》(The Field Guide to Floral Dragons) 第三方子职（**2024 口径**）。
 *  来源 ID：`source-2024-tp-floral-dragons`；第三方合作内容，来源默认关闭、需 DM 同意；
 *  仅登记选择与展示所需元数据与原创中文摘要，效果不进入自动计算。
 *
 *  口径说明（G3-I2 普查勘误）：本书参考资料按 **2024 版式**标注等级 —— 德鲁伊「花苑形态／龙族荒野形态」
 *  与魔契师「扩展法术列表／扩散网络」均记为 **3 级起**（2014 版式应为德鲁伊 2 级、魔契师 1 级）。
 *  按「不把 2014 与 2024 规则数据隐式混用」的项目边界，本模块登记为 2024 子职，等级照参考资料原样登记，
 *  不做跨版归一；因此三个子职的 `selectionLevel` 均为 3。
 */
const FLORAL_DRAGONS = ['source-2024-tp-floral-dragons'] as const

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
  // ============ 德鲁伊 druid ============
  {
    slug: 'blossom',
    classSlug: 'druid',
    name: '繁花结社',
    englishName: 'Circle of Flowers',
    summary: '最初寻访花龙并与之建立联系的德鲁伊结社，他们仿效花龙的形体与那种动植物交融的存在方式。如今这些德鲁伊既守护当初启发自己的花龙，也守护着自然之美与凶暴并存的平衡。',
    features: [
      { slug: 'floral-form', name: '花苑形态', englishName: 'Floral Form', level: 3, kind: 'choice', summary: '3级起选定一种花型，身体呈现植物特征并获得该花型的增益与始终准备法术。', description: '自第3级选择该结社起，你的身体逐渐呈现植物特征，并从六类花型中选定一种：获得该花型的始终准备法术（神莓术、疗伤术、睡眠术、灾祸术、造水术或侦测毒性和疾病之一），以及毒素抗性、治疗额外1d4、优势抵抗中毒、免疫魔法睡眠、游泳速度或以附赠动作朝敌人疾走等增益。该法术不占每日准备上限，不在德鲁伊法术列表上时视为德鲁伊法术。' },
      { slug: 'draconic-wild-shape', name: '龙族荒野形态', englishName: 'Draconic Wild Shape', level: 3, kind: 'passive', summary: '3级起把花卉龙加入野兽形态列表，可无视挑战等级与游泳、飞行速度的限制变身。', description: '你与花龙的亲密关系使你能够化身为它们的形态：以下花卉龙加入你的野兽形态列表，你可以用荒野变形特性变身为它们，并无视基于挑战等级、游泳速度或飞行速度的限制。可变形等级为：2级铁线莲龙、蒲公英龙、杜鹃龙；4级映山红龙；8级苋龙、翡翠葛龙；12级赫蕉龙、睡莲龙；16级燕草龙、芍药龙。' },
      { slug: 'dendrology-defenses', name: '林木护御', englishName: 'Dendrology Defenses', level: 6, kind: 'passive', summary: '6级起每日一次无需法术位对自己施展树肤术，且施展树肤术无需维持专注。', description: '随着你与鲜花的联系加深，你获得了更多植物般的特征：你可以每日一次无需消耗法术位地对自己施展树肤术。此外，你施展树肤术时无需为该法术维持专注。' },
      { slug: 'flower-circle', name: '繁花结环', englishName: 'Flower Circle', level: 10, kind: 'passive', summary: '10级起短休时可在身边唤出花环，区域内同伴额外回血、免遭突袭并获毒素抗性。', description: '第10级起，你能在短休期间从大地中唤出鲜花：使以你为中心、半径15尺的地面区域绽放花朵，至少持续1小时，直到你失能或离开该区域。区域内由你选择的生物获得三项增益：消耗生命骰或受魔法治疗时额外恢复等于你熟练加值的生命值（每次短休只能获得一次）；无法被突袭；在区域内休息满1小时后，接下来8小时内获得毒素伤害抗性。' },
      { slug: 'full-bloom', name: '繁花盛放', englishName: 'Full Bloom', level: 14, kind: 'passive', summary: '14级起花卉形态融入龙类特征，按所选花型获得毒素免疫、飞行、额外治疗等强化。', description: '14级时，你的花卉形态融入龙类特征，依所选花型获得增益：乌头类近战命中额外1d8毒素并免疫毒素；苋类始终准备英雄宴且每十日免材料施展；映山红类治疗额外恢复1d8＋5；樱类始终准备以太化且每日免法术位施展；睡莲类泳速翻倍、可水下呼吸并免疫寒冷；杜鹃类始终准备魔邓肯之剑并可免材料施展；蒲公英类获得等于步行速度的飞行速度。' },
    ],
  },

  // ============ 游侠 ranger ============
  {
    slug: 'wildwarden',
    classSlug: 'ranger',
    name: '巡野客',
    englishName: 'Field Researcher',
    summary: '致力于调查并守护自然世界、保存与理解花卉龙类魔法的探索者。他们的本领足以漫游到研究所需的任何角落，而敏锐的观察力让他们在危险降临时既是难缠的对手，也是可靠的盟友。',
    features: [
      { slug: 'field-researcher-magic', name: '巡野客魔法', englishName: 'Field Researcher Magic', level: 3, kind: 'resource', summary: '3级起随游侠等级获得始终准备的巡野客法术，不占已准备法术数量。', description: '当你达到巡野客法术表指定的游侠等级时，你此后始终将所列法术视为已准备法术，且它们不占用你的已准备法术数量：3级侦测魔法；5级动植物定位术；9级植物滋长；13级操控水体；17级启蒙术。这些法术随你的游侠等级提升逐步可用。' },
      { slug: 'case-study', name: '案例剖析', englishName: 'Case Study', level: 3, kind: 'bonus-action', summary: '3级起以攻击命中生物后，可用附赠动作以同一把武器对其再攻击一次。', description: '你在战斗中的专注让你能把握完美的时机再度出击：当你用攻击命中一个生物时，你可以使用一个附赠动作，用同一把武器对该生物再进行一次攻击。该额外攻击不消耗其他资源，但每次命中后只能以此方式追加一次。' },
      { slug: 'research-skills', name: '专精研究', englishName: 'Research Skills', level: 3, kind: 'choice', summary: '3级起智力检定可加感知调整值（至少+1），并从历史、调查、自然中选一项熟练。', description: '你磨练了研究能力，在野外工作中如鱼得水：每当你进行智力检定时，你可以将你的感知调整值（至少为+1）作为加值加在该检定上。此外，你可以从历史、调查或自然中选择一项技能获得熟练项。' },
      { slug: 'research-team', name: '团队研讨', englishName: 'Research Team', level: 7, kind: 'reaction', summary: '7级起当你位于盟友身旁时，可用反应让该盟友的一次攻击或技能检定具有优势。', description: '你明白与团队合作才是成功进行实地研究的关键：当你位于一个盟友旁边时，你可以使用你的反应，让该盟友在其回合中进行的一次攻击检定或技能检定具有优势。此特性由反应驱动，因此一轮之内只能回应一次机会。' },
      { slug: 'hands-on-analysis', name: '实践研究', englishName: 'Hands-on Analysis', level: 11, kind: 'passive', summary: '11级起化兽为友等法术可作用于植物与龙类，为其治疗时额外回复熟练加值。', description: '你处理野生生物的能力使你得以和那些可能对他人有敌意的生物打交道：施展化兽为友、动物信使、野兽召唤术、动植物定位术或动物交谈时，除野兽外你也可以把植物与龙类作为目标或进行召唤，只要满足法术的其他所有要求。此外，当你使用一环或更高环阶的法术为植物或龙类恢复生命值时，该生物额外恢复等于你熟练加值的生命值。' },
      { slug: 'floral-collaboration', name: '花卉协作', englishName: 'Floral Collaboration', level: 15, kind: 'passive', summary: '15级起可免材料施展龙类召唤术，每日一次免法术位施展并可改召唤花卉龙或植物。', description: '得益于广泛研究，你确切知道该召唤什么来协助自己：你可以无需材料成分地施展法术龙类召唤术，还可以无需消耗法术位地施展该法术一次，并在完成长休时恢复以此法施展的能力。施展该法术时，你可以选择召唤一个挑战等级5或更低的花卉龙或植物来代替召唤巨龙灵魄；召唤花卉龙时，你可以选择以感知（驯兽）检定替代体质豁免来维持该法术的专注。' },
    ],
  },

  // ============ 魔契师 warlock ============
  {
    slug: 'mushroom',
    classSlug: 'warlock',
    name: '蘑契师',
    englishName: 'Fungus',
    summary: '与伟大真菌订立契约、把自己的肉体交给菌丝生长的魔契师。真菌的意志异于凡俗，契约者走得越远越能理解它的逻辑——那可能是渴望生长扩张、以腐朽令环境重焕生机，也可能是继承腐化者普琉罗萨根除花卉龙的复仇使命。',
    features: [
      { slug: 'expanded-spell-list', name: '扩展法术列表', englishName: 'Expanded Spell List', level: 3, kind: 'resource', summary: '3级起获得真菌宗主的扩展法术列表，随魔契师等级始终准备对应法术。', description: '宗主赐予的魔法使你始终准备着特定法术：当你到达真菌扩展法术表指定的魔契师等级时，你就始终准备着表中对应的法术，它们不占用你的已知法术数量。列表中一环纠缠术、虚假生命；二环安定心神、侦测思想；三环造粮术、植物滋长；四环艾伐黑触手、强迫术；五环通晓自然、疫病术。' },
      { slug: 'spread-the-network', name: '扩散网络', englishName: 'Spread the Network', level: 3, kind: 'passive', summary: '3级起以法术伤害生物可将其纳入网络1分钟，并能以附赠动作伤害网内其他生物。', description: '你的法术会留下无形脉络，把目标与你以及目标彼此连成脆弱的网络：当你用法术伤害一个生物时，可将它纳入网络，持续1分钟或直到你的专注被打断（如同专注法术）。当你用法术伤害网内生物时，可用附赠动作对网内所有其他生物造成1d4点暗蚀伤害。网络最多容纳等于熟练加值的生物，生物死亡即脱离；10级起伤害为2d4，17级起为3d4。' },
      { slug: 'mushroom-scouts', name: '蘑菇斥候', englishName: 'Mushroom Scouts', level: 6, kind: 'action', summary: '6级起以动作在触碰的表面造出监视蘑菇，可心灵感应听取它所听见的一切。', description: '你获得催生监视蘑菇的能力：你可以使用一个动作在你所能触碰的表面上创造一株蘑菇，创造时决定它的外观与种类。此后只要你和该蘑菇位于同一位面，你就可以通过心灵感应、不受距离限制地听见它所听见的一切（收听同样需要一个动作）。该效应持续到蘑菇被摧毁或你切断连接（无需动作），你同时可维持生效的蘑菇数量等于你的魅力调整值。' },
      { slug: 'seeing-unseen-threads', name: '洞悉无形之缕', englishName: 'Seeing Unseen Threads', level: 10, kind: 'passive', summary: '10级起获得暗蚀伤害抗性与15尺盲视，更能感知真菌巨网中的联系。', description: '你与真菌那张无形巨网的联系愈发深邃：你获得暗蚀伤害的抗性，以及15尺范围的盲视。这两项收益都是常驻效果，不需要动作，也不消耗任何资源。' },
      { slug: 'cycle-of-decay', name: '朽荣循环', englishName: 'Cycle of Decay', level: 14, kind: 'passive', summary: '14级起每当你对一个生物造成暗蚀伤害时，你获得2d6点临时生命值。', description: '你能从腐解中汲取活力：每当你对一个生物造成暗蚀伤害时，你获得2d6点临时生命值。该收益不需要动作，也不消耗资源，可随每次造成暗蚀伤害反复触发。' },
    ],
  },
]

export const floralDragonsSubclasses2024: readonly SubclassRule[] = seeds.map((seed) => {
  const id = `subclass-2024-tp-fgd-${seed.classSlug}-${seed.slug}`
  const features: readonly SubclassFeature[] = seed.features.map((feature) => ({
    id: `tp-fgd-${seed.classSlug}-${seed.slug}-${feature.slug}`,
    subclassId: id,
    name: feature.name,
    englishName: feature.englishName,
    level: feature.level,
    summary: feature.summary,
    description: feature.description,
    kind: feature.kind,
    status: 'selectable',
    sourceIds: FLORAL_DRAGONS,
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
    sourceIds: FLORAL_DRAGONS,
    features,
  }
})
