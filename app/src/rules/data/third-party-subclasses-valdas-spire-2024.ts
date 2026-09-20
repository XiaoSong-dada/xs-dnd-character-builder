import type { SubclassFeature, SubclassFeatureKind, SubclassRule } from '@/types/rules'

/**
 * G3-I2：《瓦尔达的秘密尖塔》(Valda's Spire of Secrets) 玩家包Ⅰ／Ⅱ 第三方子职（2024 口径，12 条）。
 * 仅登记选择与展示所需元数据与原创中文摘要，效果不进入自动计算；
 * 来源 `source-2024-tp-valdas-spire` 为第三方内容，默认关闭、需 DM 同意。
 * 同书的铳士职业及其 6 个子职依附项目未支持职业，不在本模块登记。
 *
 * 命名与收录口径：
 * - 子职名与特性名取自 CHM v2026.09.13 对应小节正文（二级标题／粗体标题），`englishName` 取正文英文名；
 * - 两处按任务总表口径取名：战士资料二级标题作「地城探险家 Dungeoneer」、魔契师作「未来的你宗主 Future You Patron」，
 *   此处登记为「地城探索家」「未来于你」，`englishName` 仍取 Dungeoneer／Future You Patron；
 * - 2024 口径下子职统一自 3 级获得，故 `selectionLevel` 一律为 3；资料未标注等级的特性按 3 级登记；
 * - kind 按主要触发方式登记：资料明示动作／魔法动作／附赠动作／反应者照记，消耗职业资源而未指明动作者记 `resource`，
 *   需要玩家在多个选项中选取者记 `choice`，其余常驻增益与随攻击、施法生效的改写型能力记 `passive`；
 * - 法术表、人格面具与个性特质等表格、怪物数据卡与魔宠数据不作为特性登记，只在所属特性的 description 内说明可选范围；
 *   特性内的等级增强项并入所属特性，不拆条；需要玩家选择的选项不建立 RuleOption、不设 optionIds。
 */

const VALDAS_SPIRE = ['source-2024-tp-valdas-spire'] as const

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
    slug: 'persona',
    classSlug: 'bard',
    name: '假面学院',
    englishName: 'College of Masks',
    summary: '相信所有人都在一出「伟大戏剧」中登场的吟游诗人学院：他们随身携带诸多人格面具，追求成为自己所扮演的角色，而不止于模仿。佩戴面具即可借用原型角色的特质，从军用武器熟练到始终准备的法术皆有，配合表演天赋与以魅力取代其他属性的检定，实现千面变化。',
    features: [
      { slug: 'persona-masks', name: '人格面具', englishName: 'Persona Masks', level: 3, kind: 'choice', summary: '3级起获得3副人格面具，6级增为4副、14级5副，长休可替换一副。', description: '3级起你学会制作魔法面具：从资料所列的面具（天使、大法师、魔鬼、巨龙、无面者、角斗士、圣职者、弄臣、贵族等）中选择3副获得，吟游诗人6级增至4副、14级增至5副，完成长休时可将一副替换为另一副。你可用附赠动作佩戴或切换面具，只有你能获得其效果，面具若要求豁免则以你的法术豁免DC结算；面具丢失或被盗时可在8小时内重制。' },
      { slug: 'thespian', name: '戏剧演员', englishName: 'Thespian', level: 3, kind: 'passive', summary: '3级起获得易容工具熟练，表演检定可免费加诗人激励骰而不消耗它。', description: '3级起，你的表演才能赋予两项增益：你获得易容工具的熟练项；每当你进行魅力（表演）检定时，你可以把你的诗人激励骰加到该检定上，而不需要消耗那枚激励骰。' },
      { slug: 'virtuoso-skill', name: '精湛技艺', englishName: 'Virtuoso Skill', level: 6, kind: 'resource', summary: '6级起每回合一次可把未用魅力的D20检定改为魅力，次数＝魅力调整值。', description: '6级起，每回合一次，当你进行一次D20检定时，若该检定尚未使用魅力属性，你可以选择改为使用魅力进行该检定。此特性的使用次数等于你的魅力调整值（至少1次），完成一次长休后恢复所有已消耗的次数。' },
      { slug: 'master-of-many-faces', name: '千面大师', englishName: 'Master of Many Faces', level: 14, kind: 'passive', summary: '14级起你可以同时佩戴两副面具并获得两者的全部增益。', description: '14级起，你可以同时佩戴两副人格面具，并同时获得这两副面具提供的全部增益；佩戴与切换面具仍按人格面具特性的规则以附赠动作进行。' },
    ],
  },

  // ============ 圣武士 paladin ============
  {
    slug: 'revelry',
    classSlug: 'paladin',
    name: '狂欢之誓',
    englishName: 'Oath of Revelry',
    summary: '把狂欢视为神圣职责的圣武士誓言：立誓者日夜欢庆、闯入每一场派对，把欢乐带给敌友。子职以引导神力咒唤酒杯为盟友提供临时生命与豁免优势，靠守护灵光为全队增加近战伤害，最终让灵光同时赋予英雄激励与多种状态免疫。',
    features: [
      { slug: 'oath-spells', name: '狂欢之誓法术', englishName: 'Oath of Revelry Spells', level: 3, kind: 'resource', summary: '3／5／9／13／17级按狂欢之誓法术表始终准备对应法术，不占准备数量。', description: '誓言的魔法使你始终准备着特定法术：3级魅惑类人、塔莎狂笑术；5级强化属性、宿醉感；9级创造食粮、催眠图纹；13级魅惑怪物、行动自如；17级指使术、拉瑞心灵联结。到达表中对应的圣武士等级即自动获得，且不计入你的准备法术数量。' },
      { slug: 'conjure-drink', name: '嗟，来饮！', englishName: 'Conjure Drink', level: 3, kind: 'action', summary: '3级起以魔法动作消耗一次引导神力，咒唤魅力调整值个酒杯供人饮下获益。', description: '3级起，你能以一个魔法动作消耗一次引导神力次数，在你30尺内的空间中咒唤至多等于你魅力调整值个（至少1杯）装满泡沫麦芽酒的杯子。生物可用附赠动作饮下：获得等于你魅力调整值的临时生命值，并在1分钟内进行豁免时具有优势；你完成长休时酒杯与残酒消失。' },
      { slug: 'aura-of-fraternity', name: '情谊灵光', englishName: 'Aura of Fraternity', level: 7, kind: 'passive', summary: '7级起你与守护灵光内的盟友以近战武器或徒手打击额外造成1d4伤害。', description: '第7级起，你和位于你守护灵光范围内的盟友以近战武器或徒手打击命中时，额外造成1d4点伤害；该增益随灵光自动生效，无需动作也不消耗资源，灵光范围以你的守护灵光特性为准。' },
      { slug: 'merrymaker', name: '快乐崇拜', englishName: 'Merrymaker', level: 15, kind: 'reaction', summary: '15级起以反应让30尺内生物的一次D20检定具有优势，次数＝魅力调整值。', description: '15级起，当你或位于你30尺内能看见或听见你的盟友进行D20检定时，你能以反应使该生物进行那次检定时具有优势。可用次数等于你的魅力调整值（至少1次），完成一次长休后重获所有已消耗的次数；若该生物那次检定仍然失败，则此次次数不被消耗。' },
      { slug: 'party-animal', name: '派对嗨客', englishName: 'Party Animal', level: 20, kind: 'bonus-action', summary: '20级起以附赠动作向守护灵光注入狂欢魔法10分钟，灵光伤害与免疫大幅强化。', description: '20级起，你能以一个附赠动作把狂欢魔法注入守护灵光，持续10分钟或直到你无需动作提前结束：情谊灵光的额外伤害提升为1d8；你的回合开始时可将英雄激励赋予灵光内一名盟友；你和灵光内的盟友免疫目盲、耳聋、力竭与中毒。此特性一经使用须完成长休才能再次使用，也可消耗一个五环法术位（无需动作）重置使用权。' },
    ],
  },

  // ============ 德鲁伊 druid ============
  {
    slug: 'city',
    classSlug: 'druid',
    name: '城市结社',
    englishName: 'Circle of the City',
    summary: '从建筑、街道与人群中汲取力量的都市德鲁伊：他们把家园设在庞大聚落之中，远离荒野同胞的领地。结社能把城市街道扭结成墙、与门窗墙壁交流获取情报，并以荒野变形化入物件，最终成为横行街巷的都市巨像。',
    features: [
      { slug: 'circle-spells', name: '城市结社法术', englishName: 'Circle of the City Spells', level: 3, kind: 'resource', summary: '3／5／7／9级按城市结社法术表始终准备对应法术，不占准备数量。', description: '当你到达城市结社法术表中特定的德鲁伊等级时，你就始终准备着表中对应的法术：3级油腻术、跳跃术、粉碎音波、蛛行术；5级融身入石、短讯术；7级鬼斧神工、塑石术；9级活化物件、穿墙术。这些法术由结社赋予，不计入你的准备法术数量。' },
      { slug: 'city-shape', name: '城市形态', englishName: 'City Shape', level: 3, kind: 'resource', summary: '3级起可消耗一次荒野形态次数，免法术位施展融身入石、穿墙术或塑石术。', description: '3级起，你可以消耗一次荒野形态的使用次数，无需法术位地施展融身入石、穿墙术或塑石术中的一道；施展时仍遵循各法术原本的施法时间、射程、成分与持续时间。' },
      { slug: 'urban-druid', name: '都市德鲁伊', englishName: 'Urban Druid', level: 3, kind: 'choice', summary: '3级起自选一项技能获得感知加值，且法术呈现城市景观面貌。', description: '3级起你的魔法与技能专精于城市生活：从特技、历史、威吓、调查、游说或隐匿中选择一项，使用该技能进行检定时获得等于你感知调整值的加值（至少+1），完成长休时可更改选择。此外你的法术在美学上呈现城市景观，如纠缠术、荆棘丛生表现为鹅卵石或碎玻璃，植物交谈、木遁术等可改以建筑物而非植物为目标。' },
      { slug: 'object-shape', name: '物件形态', englishName: 'Object Shape', level: 6, kind: 'passive', summary: '6级起荒野变形时可变为活化物件的形态，10级起可选巨型物件。', description: '6级起，当你化为荒野变形形态时，你可以选择变为法术活化物件所创造的活化物件形态，由你选择该物件的体型（至多为大型）；到德鲁伊10级时，你还可以变身为巨型物件。' },
      { slug: 'wall-warp', name: '墙体扭曲', englishName: 'Wall Warp', level: 10, kind: 'reaction', summary: '10级起以反应在60尺内受击者与攻击者之间升起石墙板块，长休恢复。', description: '10级起，当你周围60尺内一个你能看见的生物受到一次攻击的伤害时，你能以反应在其与攻击者之间施展石墙术：创造一块10尺×10尺、厚1英寸的方板块（AC15、HP30），由它承受该次攻击的伤害，并在你下个回合结束时消失，生命值降至0则提前消失。此特性一经使用须完成长休才能再用，也可消耗至少三环的法术位（无需动作）重置。' },
      { slug: 'urban-colossus', name: '都市巨像', englishName: 'Urban Colossus', level: 14, kind: 'passive', summary: '14级起活化物件形态下AC18，可减伤、双次猛击并穿越生物空间。', description: '14级起，你变形为活化物件形态时获得四项增益：离开该形态前AC等于18；每回合一次，从单次攻击或效应中受到少于10点伤害时可将其降低至0；执行攻击动作时可发动两次猛击；可穿越任何生物的空间而不额外消耗移动力且不停留其中，若该生物体型不比你大则进入其空间时使其受到2d6＋你感知调整值的钝击伤害并获得倒地状态，每回合一次。' },
    ],
  },

  // ============ 战士 fighter ============
  {
    slug: 'dungeon-delver',
    classSlug: 'fighter',
    name: '地城探索家',
    englishName: 'Dungeoneer',
    summary: '把地牢求生当作毕生学问的老练冒险者：他们既掌握无数最佳做法，也信奉一整套保命迷信。子职以先手优势与英雄激励奖励正确的判断，能在毫无准备时施展探索法术、对怪物类敌人追加伤害，并靠完美规避与资深经验在绝境中生还。',
    features: [
      { slug: 'kick-in-the-door', name: '破门突袭', englishName: 'Kick in the Door', level: 3, kind: 'passive', summary: '3级起你在战斗第一轮进行的攻击检定具有优势。', description: '从3级起，你在战斗的第一轮中进行的攻击检定具有优势，便于抢在敌人行动前先手压制；这是常驻增益，无需动作，也不消耗任何资源。' },
      { slug: 'heroic-superstition', name: '英雄迷信', englishName: 'Heroic Superstition', level: 3, kind: 'passive', summary: '3级起六类地城老手做法可让你获得英雄激励，如触发弱点或发现密门。', description: '3级起，当你做出下列任一行为时获得一次英雄激励：对生物造成其具有易伤类型的伤害；触发其特定弱点或造成阻止其再生的伤害；在看到生物之前猜中其种类（不能猜类人）；发现一扇密门；侦测或解除一个陷阱；找到价值100GP以上的宝藏或非普通以上魔法物品。' },
      { slug: 'dungeon-precautions', name: '地城预防措施', englishName: 'Dungeon Precautions', level: 7, kind: 'resource', summary: '7级起可无需法术位施展七种探索法术共5次，长休恢复，施法属性三选一。', description: '7级起，你能无需法术位施展警报术、通晓语言、侦测魔法、侦测毒素和疾病、寻找陷阱、鉴定术与净化食粮；施展这些法术时，你可以使用智力、感知或魅力作为施法属性（在施展法术时选择）。此特性共有5次使用次数，完成一次长休时恢复所有已消耗的次数。' },
      { slug: 'monster-kill', name: '怪物猎杀', englishName: 'Monster Kill', level: 10, kind: 'passive', summary: '10级起每回合一次，武器攻击命中特定类型怪物时额外造成1d10同类型伤害。', description: '10级起，每回合一次，当你使用武器攻击命中异怪、龙类、妖精、邪魔、怪兽、泥怪或亡灵时，你可以对目标额外造成1d10点伤害，该伤害的类型与武器造成的伤害类型相同。' },
      { slug: 'avoidance', name: '完美规避', englishName: 'Avoidance', level: 15, kind: 'passive', summary: '15级起成功豁免则完全免伤、失败仅受半伤，处于失能时失效。', description: '15级起，当你受到一个允许你进行一次力量、敏捷或体质豁免以只受一半伤害的效应时：若你豁免成功，则你不会受到伤害；若你豁免失败，则仅受一半伤害。如果你处于失能状态，则无法使用此特性。' },
      { slug: 'veteran-hero', name: '资深英雄', englishName: 'Veteran Hero', level: 18, kind: 'passive', summary: '18级起可耗英雄激励把D20骰值直接变为20，并能同时持有两个激励。', description: '18级起，你的地城探索专长带来两项增益：每回合一次，当你进行一次D20检定时，可以消耗英雄激励把掷骰结果变为20，而非重掷d20；你可以同时拥有两个英雄激励，但每次掷骰仍然只能使用一个英雄激励。' },
    ],
  },

  // ============ 术士 sorcerer ============
  {
    slug: 'heroic',
    classSlug: 'sorcerer',
    name: '英雄术法',
    englishName: 'Heroic Sorcery',
    summary: '据称是传说英雄转世的术士：古老战斗本能与体内魔力一同苏醒，使他们刀剑与魔法兼修。子职以术法点换取临时生命、在先天术法期间以魅力挥动熟练武器，能在攻击动作中多打一次，并以秘术战技与无需专注的加速术持续压制敌人。',
    features: [
      { slug: 'heroic-spells', name: '英雄法术', englishName: 'Heroic Spells', level: 3, kind: 'resource', summary: '3／5／7／9级按英雄法术表始终准备对应法术，不占准备数量。', description: '当你到达英雄法术表中特定的术士等级时，你就始终准备着表中对应的法术：3级疾电剑、烈焰剑、凛霜剑、英雄气概、护盾术、魔化武器、镜影术；5级加速术、魅影驹；7级防死结界、石肤术；9级通晓传奇、定身怪物。这些法术由子职赋予，不计入你的准备法术数量。' },
      { slug: 'martial-sorcery', name: '尚武术法', englishName: 'Martial Sorcery', level: 3, kind: 'passive', summary: '3级起可耗1术法点换临时生命，先天术法期间以魅力攻击，并获武术训练。', description: '3级起，你的英雄前世赋予三项增益：每个你的回合开始时，你可无需动作地消耗1术法点，获得1d6＋你术士等级的临时生命值；你的先天术法特性激活期间，当你使用熟练武器攻击时，可以使用魅力调整值替代力量或敏捷进行攻击检定与伤害掷骰；你获得军用武器熟练，以及轻甲、中甲与盾牌受训。' },
      { slug: 'extra-attack', name: '额外攻击', englishName: 'Extra Attack', level: 6, kind: 'passive', summary: '6级起攻击动作可攻击两次，其中一次可换为施法时间为动作的术士戏法。', description: '6级起，你在自己回合内执行攻击动作时可以进行两次攻击而非一次；此外，你可以把额外攻击中的一次替换为施展一道施法时间为动作的术士戏法。' },
      { slug: 'mystical-maneuvers', name: '秘术战技', englishName: 'Mystical Maneuvers', level: 14, kind: 'bonus-action', summary: '14级起附赠动作耗2术法点发动三种秘术战技，各使该次伤害增加2d8。', description: '14级起你可使用三种秘术战技，均需在以武器或徒手打击命中后以一个附赠动作消耗2术法点发动，并使该次伤害增加2d8：盲目攻击令目标体质豁免，失败则目盲1分钟（可每回合结束重试）；破甲打击使目标AC在你下回合结束前−3；创伤打击使目标无法恢复生命值，并在每回合开始按创伤数各受1d8无视抗性与免疫的暗蚀伤害，其可用动作止血。' },
      { slug: 'heroic-haste', name: '英勇加速', englishName: 'Heroic Haste', level: 18, kind: 'passive', summary: '18级起以自己为目标施展加速术时可使其无需专注，结束后也不失能。', description: '18级起，每当你开始施展以自己为目标的加速术时，你可以对其加以调整，使其不再需要专注；若你如此做，当法术结束时，你不会因此陷入失能状态，速度也不会变为0。' },
    ],
  },

  // ============ 武僧 monk ============
  {
    slug: 'streetfighter',
    classSlug: 'monk',
    name: '街霸武者',
    englishName: 'Warrior of the Street',
    summary: '源自城市生存需求的街头武学：这套迅如闪电的格斗风格在后巷斗殴与擂台比赛中磨砺成形，修习者对精神启迪与因果平衡兴趣寥寥，只求抓住瞬息万变的时机。子职以功力驱动连招、必杀技与凌空袭压制敌人，最终以一记K.O.终结对手。',
    features: [
      { slug: 'combo', name: '连招', englishName: 'Combo', level: 3, kind: 'resource', summary: '3级起徒手打击命中后可耗1点功力开启连招，检定加值由+2升至+6。', description: '3级起，当你以徒手打击命中一名生物并造成伤害时，你可以消耗1点功力开启一次连招：直至当前回合结束，你的徒手打击攻击检定获得+2加值，本回合中每次连续命中此加值再增加2，最高可达+6；若你受到伤害或攻击检定失手，该加值重置为+2。' },
      { slug: 'iron-fist', name: '铁拳', englishName: 'Iron Fist', level: 3, kind: 'passive', summary: '3级起你的徒手打击命中物件时，该次命中即视为重击命中。', description: '3级起，每当你以徒手打击命中一个物件时，该次命中即为重击命中，无需额外掷骰确认，也不消耗任何资源，使你更容易砸开门板、锁具与障碍物。' },
      { slug: 'special-moves', name: '必杀技', englishName: 'Special Moves', level: 6, kind: 'resource', summary: '6级起各耗1点功力施展波动拳、破防击与升龙霸三种必杀技。', description: '6级起你已熟记三种必杀技，各需消耗1点功力：在自己回合执行攻击动作时，可把一次攻击替换为波动拳，令60尺内一名可见生物敏捷豁免，失败受掷两次武艺骰总值的力场伤害、成功减半；徒手打击失手时可发动破防击，造成等于敏捷调整值的伤害且不重置连招；命中时可发动升龙霸，把不超过大型的目标推离至多5尺并使其倒地。' },
      { slug: 'air-dash', name: '凌空袭', englishName: 'Air Dash', level: 11, kind: 'resource', summary: '11级起耗1点功力获得等于速度的飞行速度至下回合结束，下次近战有优势。', description: '在你的回合中，你可以消耗1点功力以获得等于你速度的飞行速度，持续至你的下个回合结束（此使用无需动作）；你在当前回合结束前进行的下一次近战攻击具有优势。' },
      { slug: 'ko', name: 'K.O.', englishName: 'K.O.', level: 17, kind: 'resource', summary: '17级起每回合一次徒手命中可追加三次武艺骰伤害，血量不高于100则昏迷。', description: '17级起，每回合一次，当你以徒手打击命中一名生物时，你可以尝试将目标击倒：目标额外受到掷三次你的武艺骰总值的力场伤害；若你造成伤害后目标的生命值不高于100，则它陷入昏迷状态，持续10分钟。此特性一经使用须完成短休或长休才能再次使用，也可消耗5点功力（无需动作）重置使用权。' },
    ],
  },

  // ============ 法师 wizard ============
  {
    slug: 'magic-missile',
    classSlug: 'wizard',
    name: '飞弹魔法使',
    englishName: 'Magic Missile Mage',
    summary: '把魔法飞弹钻研到近乎痴狂的法师传承：他们剖析这道法术施法过程中的每一个细节，为它赋予全新的强化形态与更毁灭性的威能。子职随等级增加每次施法创造的飞弹数量，可免费施展并穿透护盾术等克制手段，还能让飞弹环绕自身防御或附加控制效应。',
    features: [
      { slug: 'magic-missile-savant', name: '飞弹学者', englishName: 'Magic Missile Savant', level: 3, kind: 'passive', summary: '3级起魔法飞弹免费入书，随等级增加飞弹数量，可免费施展并穿透防护。', description: '3级起，法术魔法飞弹免费加入你的法术书，并带来三项增益：额外飞弹——施展魔法飞弹时额外创造一枚飞弹，法师6级额外两枚、10级三枚、14级四枚；免费施法——你可无需法术位施展该法术，次数等于你的智力调整值（至少1次），短休恢复1次、长休恢复全部；穿透飞弹——你的魔法飞弹无视任何专门阻挡它的效应（如护盾术）。' },
      { slug: 'versatile-missiles', name: '百变飞弹', englishName: 'Versatile Missiles', level: 6, kind: 'passive', summary: '6级起施展魔法飞弹时可放弃飞弹，附加绊足、盲目或震慑效应。', description: '6级起，你施展魔法飞弹时可以把下列效应附加到被飞弹击中的目标身上，代价是放弃相应数量的飞弹：绊足飞弹消耗1枚，目标力量豁免失败则倒地；盲目飞弹消耗3枚，体质豁免失败则陷入目盲直至你下个回合开始；震慑飞弹消耗5枚，体质豁免失败则被震慑直至你下个回合开始。你可对不同目标附加不同效应，并分别支付各自的消耗。' },
      { slug: 'shield-of-missiles', name: '飞弹护盾', englishName: 'Shield of Missiles', level: 10, kind: 'passive', summary: '10级起施展魔法飞弹时可让飞弹环绕自身形成10尺光环，获得AC并反击。', description: '10级起，施展魔法飞弹时你可引导飞弹环绕自身形成10尺光环，至多持续1分钟：AC获得等于环绕飞弹数量的加值（最大+5）；120尺内生物攻击你失手时，一枚飞弹反击该攻击者并减少一枚；生物进入光环或在其中结束回合时，你可耗任意数量飞弹打击它（每回合一次）。此特性一经使用须长休才能再用，也可耗三环以上法术位恢复。' },
      { slug: 'giga-missile', name: '终极飞弹', englishName: 'Giga-Missile', level: 14, kind: 'passive', summary: '14级起施展魔法飞弹时，每枚飞弹追加等于智力调整值的力场伤害。', description: '14级起，你施展魔法飞弹时可以强化该法术的伤害：你的每一枚飞弹都将造成等于你智力调整值（至少为1）的额外力场伤害。此特性一经使用，直至你完成一次长休前都无法再次使用，也可消耗一个不低于六环的法术位（无需动作）重置使用权。' },
    ],
  },

  // ============ 游侠 ranger ============
  {
    slug: 'beast-dye',
    classSlug: 'ranger',
    name: '兽染',
    englishName: 'Beastborne',
    summary: '血液被兽化魔法感染的游侠：无论源于咬伤还是阴险的诅咒，凶暴的野兽形态都潜藏于皮肤之下，等待鲜血与狩猎的刺激。子职长于利爪、攀爬与黑暗视觉，随战斗推进不断累积兽性姿态等级换取伤害、速度与防御，久未杀敌则会逐渐平息。',
    features: [
      { slug: 'lycanthrope', name: '兽化人', englishName: 'Lycanthrope', level: 3, kind: 'passive', summary: '3级起长出利爪，可用敏捷作徒手打击，并获得攀爬速度与黑暗视觉。', description: '3级起你的真实形态是一种半兽混合体：你长出一对锋利的利爪用于徒手打击，可以敏捷调整值代替力量进行攻击检定与伤害掷骰，命中时造成1d6＋力量或敏捷调整值的挥砍伤害而非徒手打击原本的伤害；你获得等于步行速度的攀爬速度；你获得60尺黑暗视觉，若原本已有则增加60尺。' },
      { slug: 'bestial-aspect', name: '兽性姿态', englishName: 'Bestial Aspect', level: 3, kind: 'bonus-action', summary: '3级起附赠动作提升兽性姿态等级，按0—5级获得递增增益，1分钟无伤害归零。', description: '3级起你的兽性逐渐失控：兽性姿态等级初始为0，对敌人造成伤害后可用附赠动作提高1级（上限5级），并获得该级及以下的增益，1分钟未造成伤害则归零。1级杀戮：武器与徒手伤害+2；2级迅捷移动：速度+10尺；3级嗜血狂乱：对生命值未满者攻击有优势；4级皮糙肉厚：未持盾时AC+2；5级以牙还牙：5尺内生物伤害你时可用反应反击。' },
      { slug: 'feral-howl', name: '野性嚎叫', englishName: 'Feral Howl', level: 7, kind: 'passive', summary: '7级起投掷先攻时可掷一粒d4，把兽性姿态等级提升至该结果。', description: '7级起，当你投掷先攻时，你可以掷一粒d4，并把你的兽性姿态等级提升至该掷骰结果对应的数值，从而在战斗一开始就带着相应的野兽增益进入战场。' },
      { slug: 'bloodthirsty-fury', name: '嗜血狂怒', englishName: 'Bloodthirsty Fury', level: 11, kind: 'passive', summary: '11级起提升姿态时可同时施展猎人印记，且杀戮加值由+2提升为+3。', description: '11级起你已学会掌控自己的兽性狂怒：当你使用附赠动作提高兽性姿态等级时，你可以把施展法术猎人印记作为该附赠动作的一部分；你的杀戮增益提供的伤害加值由+2提高为+3。' },
      { slug: 'monstrous-resilience', name: '怪物韧性', englishName: 'Monstrous Resilience', level: 15, kind: 'passive', summary: '15级起每回合一次受到伤害时可减伤，减伤量为体质调整值加姿态等级。', description: '15级起，每回合一次，当你受到伤害时，你可以减少此次所受的伤害，最低可降至0；减少的伤害量等于你的体质调整值加上你当前的兽性姿态等级。' },
    ],
  },

  // ============ 游荡者 rogue ============
  {
    slug: 'webstalker',
    classSlug: 'rogue',
    name: '蛛网追猎者',
    englishName: 'Arachnoid Stalker',
    summary: '因命运事件、诅咒或变异蛛咬伤而获得蜘蛛属性的游荡者：掌心能分泌致命的毒素与蛛网，指尖可以攀附墙面与天花板。子职以织网完成位移、操作与施法，把偷袭伤害转为毒素，还能潜伏于屋顶，最终用麻痹毒液让敌人动弹不得。',
    features: [
      { slug: 'webbing', name: '织网', englishName: 'Webbing', level: 3, kind: 'bonus-action', summary: '3级起以附赠动作生成蛛网，可拉近自身、操作物件、制绳或施展蛛网术。', description: '3级起，你能以一个附赠动作从掌心生成1分钟后溶解的蛛网：向30尺内可见一点射网，把自己直线拉去且不引发借机攻击；以网线操纵30尺内未被穿戴或携带的物品，或制出60尺网绳并固定；也可免法术位施展蛛网术（DC＝8＋敏捷调整值＋熟练加值，范围改为5尺立方、持续1分钟）。此法施展蛛网术2次，短休恢复1次、长休全恢复。' },
      { slug: 'venomous-strike', name: '毒液打击', englishName: 'Venomous Strike', level: 3, kind: 'passive', summary: '3级起造成偷袭伤害时，可把偷袭骰改为d8毒素伤害而非d6。', description: '3级起，当你对一个生物造成偷袭伤害时，你可以选择把偷袭的伤害骰改为d8，并造成毒素伤害，而不是与武器类型相同的d6骰；是否改用由你在每次造成偷袭伤害时自行决定。' },
      { slug: 'wall-crawling', name: '爬墙', englishName: 'Wall Crawling', level: 9, kind: 'passive', summary: '9级起获得等于速度的攀爬速度，并能在天花板与垂直表面自由移动。', description: '9级起你已习惯像蜘蛛一样移动：你获得等于你速度的攀爬速度；若你在天花板上并处于轻度遮蔽，只要所有能看见你的敌人都在你下方，你就可以执行躲藏动作；你还能在垂直表面与天花板上向上向下、横跨移动，同时双手不受限制。' },
      { slug: 'spider-sense', name: '蜘蛛感应', englishName: 'Spider Sense', level: 13, kind: 'reaction', summary: '13级起在豁免并受到伤害时以反应执行直觉闪避，令该伤害减半。', description: '13级起，当你进行一次豁免并因此受到伤害时，你能够以反应执行一次直觉闪避（而非通常触发直觉闪避的攻击命中），使你受到的该次伤害减半（向下取整）。' },
      { slug: 'paralytic-venom', name: '麻痹毒液', englishName: 'Paralytic Venom', level: 17, kind: 'passive', summary: '17级起获得诡诈打击选项麻痹：花费4d6偷袭骰令目标体质豁免否则麻痹。', description: '17级起，你获得一项新的诡诈打击选项：麻痹（花费4d6）。当你以毒液打击造成毒素伤害时，你可以花费4个偷袭骰，令目标进行一次体质豁免，失败则陷入麻痹状态，直到你的下个回合结束。' },
    ],
  },

  // ============ 牧师 cleric ============
  {
    slug: 'dragon',
    classSlug: 'cleric',
    name: '巨龙领域',
    englishName: 'Dragon Domain',
    summary: '引导龙神伟力、具现巨龙面相与元素魔法的牧师领域：信徒既包括龙族，也包括任何渴望财富与力量之人，因而常被视作邪教徒。领域以五色亲和改写伤害类型，靠龙威光环魅惑或恐吓敌人，并以无需专注的龙息术与传奇动作展现古龙的威压。',
    features: [
      { slug: 'chromatic-affinity', name: '五色亲和', englishName: 'Chromatic Affinity', level: 3, kind: 'passive', summary: '3级起长休后选定一种伤害类型，可改写牧师暗蚀光耀伤害并追加伤害。', description: '3级起，你结束长休时从强酸、寒冷、火焰、闪电或毒素中选择一种伤害类型：你施展造成暗蚀或光耀伤害的牧师法术、或使用造成此类伤害的牧师特性时，可将该伤害改为所选类型；每轮一次，你对生物造成所选类型的伤害时可额外造成等于你牧师等级的该类型伤害，此额外伤害可用次数等于你的感知调整值（至少1次），长休结束时全部恢复。' },
      { slug: 'domain-spells', name: '巨龙领域法术', englishName: 'Dragon Domain Spells', level: 3, kind: 'resource', summary: '3／5／7／9级按巨龙领域法术表始终准备对应法术，不占准备数量。', description: '你与此神圣领域的链接使你始终准备着特定法术：3级繁彩球、命令术、黑暗视觉、龙息术；5级飞行术、防护能量；7级放逐术、魅惑怪物；9级支配类人、龙类召唤术。到达巨龙领域法术表中特定的牧师等级即自动获得，且不计入你的准备法术数量。' },
      { slug: 'draconic-majesty', name: '龙之威仪', englishName: 'Draconic Majesty', level: 3, kind: 'action', summary: '3级起以魔法动作消耗一次引导神力，30尺光环内生物感知豁免否则魅惑或恐慌。', description: '3级起，你能以一个魔法动作展示圣徽并消耗一次引导神力次数，以自身为源点显现30尺光环：在魅惑或恐慌中选择一种状态，光环范围内每个由你选择的生物都须成功通过一次感知豁免，否则在接下来1分钟内陷入所选状态；因此陷入该状态的生物可在其每回合结束时重复此豁免，成功则终止该状态。' },
      { slug: 'wyrms-blessing', name: '幼龙之祈', englishName: "Wyrm's Blessing", level: 6, kind: 'resource', summary: '6级起可消耗一次引导神力对自身施展龙息术或防护能量，且无需专注。', description: '6级起，你可以消耗一次你的引导神力的使用次数，对自身施展龙息术或防护能量，而不消耗法术位；以此法施展这些法术时它们无需专注，并会在你再次施展该法术、陷入失能状态或死亡时提前终止。' },
      { slug: 'legendary-aspect', name: '传奇面相', englishName: 'Legendary Aspect', level: 17, kind: 'resource', summary: '17级起每日3次，可在其他生物回合结束后执行撕裂、扫尾或振翅传奇动作。', description: '17级起，你能具现古龙的翅、爪或尾，可在其他生物回合结束后执行一项传奇动作：撕裂为移动至多速度后发动感知近战攻击或施展牧师戏法；扫尾令10尺内所选的每个大型或更小生物倒地；振翅为移动至多速度并获得等速飞行、不引发借机攻击。每日可用3次，长休恢复；同一动作执行后至你下回合开始前不能再用，也可消耗二环以上法术位恢复一次。' },
    ],
  },

  // ============ 野蛮人 barbarian ============
  {
    slug: 'muscle-mage',
    classSlug: 'barbarian',
    name: '肌肉法师道途',
    englishName: 'Path of the Muscle Wizard',
    summary: '坚称自己是法师、并以胸肌与拳头证明这一点的野蛮人道途：他们戴着笨重的巫师帽、抱着魔法书，用「温和」的方式提醒他人不要质疑自己的魔法造诣。子职把推、电、砸三种「戏法」与燃烧之手、魔法飞弹、护盾术等「法术」打成近身暴力，狂暴期间还免疫法术干扰。',
    features: [
      { slug: 'unarguable-wizardry', name: '法威难驳', englishName: 'Unarguable Wizardry', level: 3, kind: 'reaction', summary: '3级起威吓检定有优势，被质疑魔法造诣时可以反应立即进入狂暴。', description: '从3级开始，你那无可争议的资历和强健的胸肌使你在说服他人相信你确实是一名法师时进行的魅力（威吓）检定具有优势；此外，如果有任何人质疑你无可争辩的魔法造诣，你能够以反应立即进入狂暴，持续至你的下个回合结束。这种狂暴无法延长，且不消耗你的狂暴次数。' },
      { slug: 'cantrips', name: '「戏法」', englishName: 'Cantrips', level: 3, kind: 'passive', summary: '3级起每回合一次以力量攻击命中时，可选法师之手、电爪或克敌先击之一。', description: '3级起，每个你的回合一次，当你以基于力量的攻击命中目标时，可从三种「戏法」中任选其一：法师之手把不超过大型的目标直线推离至多5尺（狂暴中改为10尺）；电爪使目标无法发动借机攻击至当前回合结束（狂暴中至你下个回合开始）；克敌先击额外造成1d6点同类型伤害（狂暴中再加野蛮人等级的一半，向下取整）。' },
      { slug: 'spells', name: '「法术」', englishName: 'Spells', level: 6, kind: 'resource', summary: '6级起狂暴中可各用一次燃烧之手、魔法飞弹与护盾术，每项长休恢复。', description: '6级起，你在狂暴期间可以各使用一次下列「法术」，每项用后须长休才能再用：燃烧之手以动作对你触及范围内每名生物发动徒手打击，命中造成1d8＋力量调整值钝击伤害且目标下次攻击检定有劣势；魔法飞弹以动作用投掷武器发动三次具有优势的远程攻击；护盾术在被命中时以反应持盾，获得盾牌AC加值，若仍被命中则减少等于野蛮人等级的伤害。' },
      { slug: 'magic-resistance', name: '魔法抗性', englishName: 'Magic Resistance', level: 10, kind: 'passive', summary: '10级起狂暴激活期间，你对抗法术与其他魔法效应的豁免具有优势。', description: '到10级时，你已是如此厉害的法师，以至于其他法师都无法撼动你分毫：在你的狂暴激活期间，你对抗法术和其他魔法效应时进行的豁免检定具有优势。' },
      { slug: 'i-cast-fist', name: '大施拳法', englishName: 'I Cast Fist', level: 14, kind: 'passive', summary: '14级起狂暴中每次可将一次攻击换为重拳，造成6d6＋力量钝击并可能击倒。', description: '从14级起，在你的狂暴激活期间执行攻击动作时，你可以用终极「法术」替换其中一次攻击：发动一次具有优势的徒手打击，若命中，目标受到等于6d6＋你力量调整值的钝击伤害，且若目标不超过巨型则陷入倒地状态。每次激活狂暴，你可以使用此特性一次。' },
    ],
  },

  // ============ 魔契师 warlock ============
  {
    slug: 'future-you',
    classSlug: 'warlock',
    name: '未来于你',
    englishName: 'Future You Patron',
    summary: '宗主正是数十年后的你自己：未来的你为了让这段循环成立，必须保证你活下去。子职靠一个被记录的d20预知检定结果，以反应在关键时刻大幅抬升AC，先手更快、战斗首轮更具韧性，最终用祖父悖论把敌人困在相互冲突的时间线之间。',
    features: [
      { slug: 'future-you-quirks', name: '未来的你的怪癖', englishName: 'Future You Quirks', level: 3, kind: 'choice', summary: '与未来的你沟通后残留奇异影响，从六种个性特质中选择一项。', description: '在你与未来的你自己沟通之后，奇异的影响残留在了你身上：从资料所列六项个性特质中选择一项，例如经常用错时态或以复数自称、在对方自我介绍前就喊出其名字、身处绝境仍异常冷静、在特定光线下显得比实际年龄苍老、见到某些人还活着便泪流满面、穿搭品味与当下潮流格格不入。此特性不带来数值收益，仅用于塑造角色。' },
      { slug: 'expanded-spell-list', name: '扩展法术表', englishName: 'Expanded Spell List', level: 3, kind: 'resource', summary: '3／5／7／9级按未来的你法术表始终准备对应法术，不占准备数量。', description: '宗主赐予的魔法使你始终准备着特定法术：3级思忖一瞬、增能术／缓能术、回溯、延迟术、强化属性；5级防护能量、缓慢术；7级防死结界、凶兆预警；9级拉瑞心灵联结、通晓传奇。到达未来的你法术表中特定的魔契师等级即自动获得，且不计入你的准备法术数量。' },
      { slug: 'it-happened-like-this', name: '事情是这样发生的', englishName: 'It Happened Like This', level: 3, kind: 'passive', summary: '3级起每次休息后获得一个记录的d20，可替换自己或可见生物的一次检定。', description: '3级起，每当你完成一次短休或长休，DM会暗掷一个d20与一个d4并记录d20的结果：除非d4掷出4，否则DM如实告知该点数，掷出4则谎报。你可以无需动作地把你自己或你可见生物的任意D20检定替换为这个记录值，须在掷骰前决定且只能使用一次；若DM此前说谎，只在你替换检定之后才告知真实结果。' },
      { slug: 'fewer-scars', name: '我可不想再多几道伤疤', englishName: 'I Could Do With Fewer Scars', level: 6, kind: 'reaction', summary: '6级起被可见生物命中时以反应使AC+10对抗该次攻击，两次并短休恢复1次。', description: '6级起，当一个你能看见的生物以一次攻击检定命中你时，你能以反应使你的AC在抵挡这次攻击时获得+10加值，从而有可能令该攻击落空。此特性有2次使用次数：完成一次短休后恢复1次已消耗的次数，完成一次长休后恢复所有已消耗的次数。' },
      { slug: 'expect-an-ambush', name: '小心埋伏', englishName: 'Expect an Ambush', level: 10, kind: 'passive', summary: '10级起先攻掷骰具有优势，并在战斗第一轮获得对所有伤害的抗性。', description: '10级起，未来的你会提前提醒你提防伏击：你进行先攻掷骰时具有优势，并且在战斗的第一轮获得对所有伤害类型的抗性，无需动作也不消耗资源。' },
      { slug: 'grandfather-paradox', name: '祖父悖论', englishName: 'Grandfather Paradox', level: 14, kind: 'action', summary: '14级起以动作令60尺内生物智力豁免，失败受10d6心灵伤害并震慑1分钟。', description: '14级起，你能用一个动作挑衅60尺内能看见并听见你的生物，使其引发一次悖论：目标须进行一次对抗你法术豁免DC的智力豁免，失败则受到10d6点心灵伤害并因困于相互冲突的时间线之间而陷入震慑，持续1分钟；受震慑者可在每回合结束时重复该豁免以结束效应，成功则仅受一半伤害。此特性一经使用须完成长休才能再次使用。' },
    ],
  },
]

export const valdasSpireSubclasses2024: readonly SubclassRule[] = seeds.map((seed) => {
  const id = `subclass-2024-tp-vss-${seed.classSlug}-${seed.slug}`
  const features: readonly SubclassFeature[] = seed.features.map((feature) => ({
    id: `tp-vss-${seed.classSlug}-${seed.slug}-${feature.slug}`,
    subclassId: id,
    name: feature.name,
    englishName: feature.englishName,
    level: feature.level,
    summary: feature.summary,
    description: feature.description,
    kind: feature.kind,
    status: 'selectable',
    sourceIds: VALDAS_SPIRE,
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
    sourceIds: VALDAS_SPIRE,
    features,
  }
})
