import type { RuleOption, SubclassFeature, SubclassRule } from '@/types/rules'

/**
 * 破解奥秘：浩劫子职（UA）。4 个新子职。
 * 来源 `source-2024-ua-cataclysm`，默认关闭、状态 selectable。
 */

const sourceIds = ['source-2024-ua-cataclysm'] as const

const option = (id: string, name: string, englishName: string, description: string): RuleOption => ({
  id, name, englishName, description, status: 'selectable', sourceIds,
})

export const uaCataclysmOptions2024: readonly RuleOption[] = [
  option('ua-cataclysm-2024-preserve-bolster', '巩固', 'Bolster', '恩护之地：区域内结束回合的生物获得 1d4＋德鲁伊等级临时生命。'),
  option('ua-cataclysm-2024-preserve-purify', '净化', 'Purify', '恩护之地：终止该生物身上一个致其恐慌或中毒的效应。'),
  option('ua-cataclysm-2024-brutality-bleed', '放血', 'Bleed', '残虐凶暴：额外应用削弱精通；目标额外受魅力调整值伤害（至少 1），类型与武器一致。'),
  option('ua-cataclysm-2024-brutality-bluff', '诈巧', 'Bluff', '残虐凶暴：额外应用侵扰精通；你到下回合结束前下一次豁免具有优势。'),
  option('ua-cataclysm-2024-brutality-stumble', '摔绊', 'Stumble', '残虐凶暴：额外应用失衡精通；目标下回合只能执行动作或附赠动作之一。'),
  option('ua-cataclysm-2024-brutality-rive', '撕裂', 'Rive', '悍猛凶暴：额外应用横扫精通；额外攻击伤害可加属性调整值。'),
  option('ua-cataclysm-2024-brutality-rush', '突进', 'Rush', '悍猛凶暴：额外应用推离精通；你可移动至多等于速度的距离且不引发借机攻击。'),
  option('ua-cataclysm-2024-brutality-stagger', '断筋', 'Stagger', '悍猛凶暴：额外应用缓速精通；目标下回合结束前下一次豁免具有劣势。'),
]

export const uaCataclysmFeatures2024: readonly SubclassFeature[] = [
  // ============ 恩护结社（德鲁伊） ============
  {
    id: 'ua-cataclysm-2024-preserve-spells', subclassId: 'subclass-2024-ua-druid-preservation', name: '恩护结社法术', englishName: 'Circle of Preservation Spells', level: 3,
    summary: '3／5／7／9 级按恩护结社法术表始终准备法术。',
    description: '达到对应德鲁伊等级时，你始终准备恩护结社法术表中的法术；这些法术不计入准备上限。',
    kind: 'passive', status: 'selectable', sourceIds,
  },
  {
    id: 'ua-cataclysm-2024-preserve-land', subclassId: 'subclass-2024-ua-druid-preservation', name: '恩护之地', englishName: 'Preserved Land', level: 3,
    summary: '附赠动作消耗荒野形态：120 尺内 15 尺立方区域 1 分钟；生物结束回合时你可给予巩固或净化；可附赠动作移动 30 尺。',
    description: '以一个附赠动作，你可以消耗一次荒野形态使用次数，指定 120 尺内可见地面一点，在以该点为源点的 15 尺立方区域充盈活力能量，持续 1 分钟（或直至你失能、远离 120 尺、死亡）。当生物（含你自己）在区域内结束回合时，你可以给予它：巩固——1d4＋德鲁伊等级临时生命；净化——终止一个令其恐慌或中毒的效应。此后回合中，你可以用附赠动作将立方区域在你 120 尺内移动至多 30 尺。',
    kind: 'bonus-action', optionIds: ['ua-cataclysm-2024-preserve-bolster', 'ua-cataclysm-2024-preserve-purify'], status: 'selectable', sourceIds,
  },
  {
    id: 'ua-cataclysm-2024-preserve-student', subclassId: 'subclass-2024-ua-druid-preservation', name: '恩护学徒', englishName: 'Student of Preservation', level: 3,
    summary: '施展德鲁伊法术可免材料成分（有价／消耗除外）；消耗材料有 10% 概率不消耗；获得一种工匠工具熟练。',
    description: '当你施展德鲁伊法术时，你可以使其无需材料成分（除非该材料会被消耗或具有价值）；当你施展需要消耗材料成分的德鲁伊法术时，有 10% 概率该材料不被消耗。你获得一种你所选择的工匠工具的熟练（记录在角色卡；不进入自动检定）。',
    kind: 'passive', status: 'selectable', sourceIds,
  },
  {
    id: 'ua-cataclysm-2024-preserve-improved', subclassId: 'subclass-2024-ua-druid-preservation', name: '强效恩护', englishName: 'Improved Preservation', level: 6,
    summary: '区域内你与盟友体质豁免加感知调整值（至少 +1）；敌人进入或结束回合时感知豁免失败受 2d10 光耀并速度减半。',
    description: '身处你的恩护之地立方区域内时，你与盟友的体质豁免获得等于你感知调整值（至少 +1）的加值。当立方区域进入生物空间、生物进入区域或在其内结束回合时，该敌人必须进行对抗你法术豁免 DC 的感知豁免：失败受 2d10 光耀伤害且因植被阻碍速度减半至其下回合结束，成功减半；一名生物每回合只需进行一次该豁免。',
    kind: 'passive', status: 'selectable', sourceIds,
  },
  {
    id: 'ua-cataclysm-2024-preserve-restoration', subclassId: 'subclass-2024-ua-druid-preservation', name: '便捷复原', englishName: 'Facilitated Restoration', level: 10,
    summary: '无需法术位与成分施展次等复原术或高等复原术；次数＝感知调整值，长休恢复。',
    description: '你可以无需法术位与任何法术成分施展次等复原术与高等复原术。使用次数等于你的感知调整值（至少 1 次），长休恢复。',
    kind: 'resource', status: 'selectable', sourceIds,
    resource: { maxFromAbility: { ability: 'wis', minimum: 1 }, recovery: 'long-rest' },
  },
  {
    id: 'ua-cataclysm-2024-preserve-sacrosanct', subclassId: 'subclass-2024-ua-druid-preservation', name: '神圣之地', englishName: 'Sacrosanct Land', level: 14,
    summary: '立方区域增至 30 尺；区域内可见生物被命中时，反应减半该次伤害。',
    description: '你的恩护之地立方区域尺寸增加至 30 尺。此外，当该区域内一名你可见的生物被攻击检定命中时，你可以用一个反应使其受到的伤害减半。',
    kind: 'reaction', status: 'selectable', sourceIds,
  },

  // ============ 角斗士（战士） ============
  {
    id: 'ua-cataclysm-2024-gladiator-brutality', subclassId: 'subclass-2024-ua-fighter-gladiator', name: '残虐凶暴', englishName: 'Brutality', level: 3,
    summary: '每回合一次近战命中可施加放血／诈巧／摔绊；次数＝魅力调整值，短休或长休恢复。',
    description: '每回合一次，当你使用近战武器攻击命中一个生物时，你可以施加一种残暴效应：放血——额外应用削弱精通，目标额外受你魅力调整值的同类型伤害（至少 1）；诈巧——额外应用侵扰精通，你到下回合结束前下一次豁免具有优势；摔绊——额外应用失衡精通，目标下回合只能执行动作或附赠动作之一。使用次数等于你的魅力调整值（至少 1 次），短休或长休恢复。',
    kind: 'resource', optionIds: ['ua-cataclysm-2024-brutality-bleed', 'ua-cataclysm-2024-brutality-bluff', 'ua-cataclysm-2024-brutality-stumble'], status: 'selectable', sourceIds,
    resource: { maxFromAbility: { ability: 'cha', minimum: 1 }, recovery: 'short-rest' },
  },
  {
    id: 'ua-cataclysm-2024-gladiator-theatrics', subclassId: 'subclass-2024-ua-fighter-gladiator', name: '武斗演出', englishName: 'Combat Theatrics', level: 3,
    summary: '特技／运动检定加魅力调整值（至少 +1）；从特技、运动、欺瞒、威吓、表演选 1 熟练。',
    description: '当你进行敏捷（特技）或力量（运动）检定时，获得等于你魅力调整值的加值（至少 +1）。你从特技、运动、欺瞒、威吓、表演中选择一项获得熟练。',
    kind: 'choice', requiresChoice: true,
    optionIds: ['skill-acrobatics', 'skill-athletics', 'skill-deception', 'skill-intimidation', 'skill-performance'],
    minSelections: 1, maxSelections: 1, status: 'selectable', sourceIds,
  },
  {
    id: 'ua-cataclysm-2024-gladiator-parry', subclassId: 'subclass-2024-ua-fighter-gladiator', name: '华丽格挡', englishName: 'Flourish Parry', level: 7,
    summary: '被近战命中时反应加魅力调整值（至少 +1）AC；使攻击失手可反击并施加残暴效应；反击每次长休一次或消耗回气重置。',
    description: '当敌人以近战攻击命中你时，你可以用一个反应将魅力调整值（至少 +1）加到对抗该攻击的 AC 上，可能使其失手。若因此失手，作为该反应的一部分，你可以用近战武器对触发者进行一次反击；命中时可施加一项残暴效应且不消耗使用次数。反击每次长休后恢复，或消耗一次回气使用次数重置。',
    kind: 'reaction', status: 'selectable', sourceIds,
  },
  {
    id: 'ua-cataclysm-2024-gladiator-bolder', subclassId: 'subclass-2024-ua-fighter-gladiator', name: '悍猛凶暴', englishName: 'Bolder Brutalities', level: 10,
    summary: '残暴选项新增撕裂、突进、断筋。',
    description: '你的残暴选项新增：撕裂（横扫精通，额外攻击可加属性调整值）、突进（推离精通，可移动至多速度距离且不引发借机攻击）、断筋（缓速精通，目标下回合结束前下一次豁免劣势）。',
    kind: 'passive', optionIds: ['ua-cataclysm-2024-brutality-rive', 'ua-cataclysm-2024-brutality-rush', 'ua-cataclysm-2024-brutality-stagger'], status: 'selectable', sourceIds,
  },
  {
    id: 'ua-cataclysm-2024-gladiator-resurgence', subclassId: 'subclass-2024-ua-fighter-gladiator', name: '凶暴再临', englishName: 'Brutal Resurgence', level: 15,
    summary: '使用回气或动作如潮时各重获一次已消耗的残暴使用次数。',
    description: '每当你使用回气恢复生命值时，你重获一次已消耗的残暴使用次数；当你使用动作如潮时，你也重获一次。',
    kind: 'passive', status: 'selectable', sourceIds,
  },
  {
    id: 'ua-cataclysm-2024-gladiator-mutilate', subclassId: 'subclass-2024-ua-fighter-gladiator', name: '毁形残骨', englishName: 'Mutilate', level: 18,
    summary: '命中浴血生物时体质豁免（DC＝8＋熟练＋魅力）失败则伤残（每次攻击动作只能攻击一次）或迟滞（速度减半、AC −2），持续至恢复生命；每次长休一次。',
    description: '当你以攻击命中处于浴血的生物时，你可以尝试重创它：目标进行体质豁免（DC＝8＋你熟练加值＋魅力调整值），失败则承受伤残（执行攻击动作时只能发动一次攻击）或迟滞（速度减半且 AC −2），持续至目标恢复生命值。使用后需长休恢复。',
    kind: 'resource', status: 'selectable', sourceIds,
    resource: { maxByLevel: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1], recovery: 'long-rest' },
  },

  // ============ 亵渎术法（术士） ============
  {
    id: 'ua-cataclysm-2024-defiled-spells', subclassId: 'subclass-2024-ua-sorcerer-defiled', name: '亵渎者法术', englishName: 'Defiler Spells', level: 3,
    summary: '3／5／7／9 级按亵渎者法术表始终准备法术。',
    description: '达到对应术士等级时，你始终准备亵渎者法术表中的法术；这些法术不计入准备上限。',
    kind: 'passive', status: 'selectable', sourceIds,
  },
  {
    id: 'ua-cataclysm-2024-defiled-empower', subclassId: 'subclass-2024-ua-sorcerer-defiled', name: '亵渎，强化', englishName: 'Defile and Empower', level: 3,
    summary: '每回合一次消耗生命骰（至多环阶一半，向上取整）增加法术伤害；或窃取 30 尺内生物生命骰（其体质豁免失败；每次长休一次或 3 术法点重置）。',
    description: '每回合一次，当你为法术位施展的法术投掷伤害时，你可以汲取自己的生命能量强化它：投掷若干未消耗生命骰（至多所消耗法术位环阶的一半，向上取整，至少 1 颗），将骰值和加入该法术的一次伤害掷骰；这些生命骰被消耗。作为替代，你可以尝试窃取 30 尺内可见生物的生命力：其体质豁免对抗你法术豁免 DC（免疫力竭者自动通过），失败则由你投掷它的生命骰（至多环阶一半，向下取整，至少 1 颗），骰值和加入伤害且这些生命骰被消耗。一旦有生物失败于该豁免，你需长休才能再次窃取，或消耗 3 点术法点重置。',
    kind: 'passive', status: 'selectable', sourceIds,
  },
  {
    id: 'ua-cataclysm-2024-defiled-caster', subclassId: 'subclass-2024-ua-sorcerer-defiled', name: '污染施术', englishName: 'Corrupted Caster', level: 6,
    summary: '术法点转法术位时获得环阶数量 d6 的临时生命，期间被近战命中则攻击者受魅力调整值暗蚀或毒素；暗蚀／毒素伤害无视抗性。',
    description: '当你执行附赠动作将术法点转化为法术位时，你可用亵渎能量获得临时生命：投掷等于所创造法术位环阶数量的 d6，获得骰值和；拥有这些临时生命期间，若有生物以近战攻击命中你，该生物受到等于你魅力调整值的暗蚀或毒素伤害（由你选择）。此外，由你的术士法术或术士特性造成的伤害无视暗蚀与毒素伤害抗性。',
    kind: 'passive', status: 'selectable', sourceIds,
  },
  {
    id: 'ua-cataclysm-2024-defiled-aura', subclassId: 'subclass-2024-ua-sorcerer-defiled', name: '凋零灵光', englishName: 'Withering Aura', level: 14,
    summary: '先天术法激活期间 15 尺灵光：所受伤害减少魅力调整值；敌人死在灵光内重获 1d4 术法点（每次激活一次）。',
    description: '你的先天术法激活期间，源自你的 15 尺光环提供：亵渎环绕——当灵光内敌人以攻击命中你时，你可以减少其对你造成的伤害，减少量等于你的魅力调整值；命髓虹吸——当敌人死在灵光内时，你重获 1d4 术法点（每次激活先天术法只能生效一次）。18 级起光环扩大至 30 尺，且灵光内敌人无法重获生命值。',
    kind: 'passive', status: 'selectable', sourceIds,
  },
  {
    id: 'ua-cataclysm-2024-defiled-superior', subclassId: 'subclass-2024-ua-sorcerer-defiled', name: '卓越亵渎者', englishName: 'Superior Defiler', level: 18,
    summary: '免疫中毒与力竭；凋零灵光扩大至 30 尺且敌人无法回血。',
    description: '你免疫中毒状态与力竭状态。你的凋零灵光光环半径扩大至 30 尺；处于灵光内的敌人无法重获生命值。',
    kind: 'passive', status: 'selectable', sourceIds,
  },

  // ============ 巫王宗主（魔契师） ============
  {
    id: 'ua-cataclysm-2024-sorcerer-king-spells', subclassId: 'subclass-2024-ua-warlock-sorcerer-king', name: '巫王法术', englishName: 'Sorcerer-King Spells', level: 3,
    summary: '3／5／7／9 级按巫王法术表始终准备法术；施展该表法术可免材料与言语成分。',
    description: '达到对应魔契师等级时，你始终准备巫王法术表中的法术；这些法术不计入准备上限。当你施展巫王法术表中的法术时，你可以无需材料或言语成分（会被消耗或有具体价值的材料除外）。',
    kind: 'passive', status: 'selectable', sourceIds,
  },
  {
    id: 'ua-cataclysm-2024-sorcerer-king-herald', subclassId: 'subclass-2024-ua-warlock-sorcerer-king', name: '暴君传令官', englishName: "Tyrant's Herald", level: 3,
    summary: '威吓熟练与专精；附赠动作免费施展命令术，次数＝魅力调整值，长休恢复。',
    description: '若你无威吓技能熟练则获得之，并获得威吓专精。以一个附赠动作，你可以无需法术位施展命令术；使用次数等于你的魅力调整值（至少 1 次），长休恢复。',
    kind: 'resource', status: 'selectable', sourceIds,
    resource: { maxFromAbility: { ability: 'cha', minimum: 1 }, recovery: 'long-rest', note: '免费施展命令术' },
  },
  {
    id: 'ua-cataclysm-2024-sorcerer-king-edict', subclassId: 'subclass-2024-ua-warlock-sorcerer-king', name: '决断诏令', englishName: 'Decisive Edict', level: 6,
    summary: '使用契约法术位时，30 尺灵光内所选生物获得攻击优势或感知豁免失败恐慌；每次短休或长休一次（秘法回流也恢复）。',
    description: '当你使用契约法术位施展法术时，你可以在源自你的 30 尺光环内引发亵渎爆发，对区域内每个你可见的生物选择：统帅——其到下回合结束前攻击检定具有优势；压迫——其必须通过一次对抗你法术豁免 DC 的感知豁免，否则恐慌至其下回合结束。此特性每次短休或长休后恢复；当你使用秘法回流时也会恢复。',
    kind: 'resource', status: 'selectable', sourceIds,
    resource: { maxByLevel: [0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], recovery: 'short-rest' },
  },
  {
    id: 'ua-cataclysm-2024-sorcerer-king-rebuke', subclassId: 'subclass-2024-ua-warlock-sorcerer-king', name: '复仇叱喝', englishName: 'Vindictive Rebuke', level: 10,
    summary: '被命中时反应迫使攻击者重掷 d20 并使用新结果；若因此失手，其受魔契师等级心灵伤害；次数＝魅力调整值。',
    description: '当敌人以攻击命中你时，你可以用反应迫使它重掷该次 d20，且必须使用新结果。若因此攻击未命中，该生物受到等于你魔契师等级的心灵伤害。使用次数等于你的魅力调整值（至少 1 次），长休恢复。',
    kind: 'reaction', status: 'selectable', sourceIds,
    resource: { maxFromAbility: { ability: 'cha', minimum: 1 }, recovery: 'long-rest' },
  },
  {
    id: 'ua-cataclysm-2024-sorcerer-king-tyranny', subclassId: 'subclass-2024-ua-warlock-sorcerer-king', name: '绝对暴政', englishName: 'Absolute Tyranny', level: 14,
    summary: '施展命令术可多选一个目标；被你恐慌的生物对你的命令术自动失败。',
    description: '每当你施展命令术时，你能选择施法距离内一名额外生物作为目标。此外，被你恐慌的生物自动失败于你施展的任何命令术豁免。',
    kind: 'passive', status: 'selectable', sourceIds,
  },
]

const featuresOf = (subclassId: string): readonly SubclassFeature[] =>
  uaCataclysmFeatures2024.filter((feature) => feature.subclassId === subclassId)

export const uaCataclysmSubclasses2024: readonly SubclassRule[] = [
  {
    id: 'subclass-2024-ua-druid-preservation', classId: 'class-2024-druid', ruleset: '5e-2024', name: '恩护结社', englishName: 'Circle of Preservation', selectionLevel: 3,
    summary: '保护与恢复自然：恩护之地、强效恩护、便捷复原与神圣之地。',
    status: 'selectable', availability: 'player', sourceIds,
    features: featuresOf('subclass-2024-ua-druid-preservation'),
    alwaysPreparedSpellIdsByLevel: {
      3: ['spell-2024-bless', 'spell-2024-lesser-restoration', 'spell-2024-protection-from-poison', 'spell-2024-sanctuary'],
      5: ['spell-2024-beacon-of-hope', 'spell-2024-plant-growth'],
      7: ['spell-2024-aura-of-life', 'spell-2024-death-ward'],
      9: ['spell-2024-greater-restoration', 'spell-2024-hallow'],
    },
  },
  {
    id: 'subclass-2024-ua-fighter-gladiator', classId: 'class-2024-fighter', ruleset: '5e-2024', name: '角斗士', englishName: 'Gladiator', selectionLevel: 3,
    summary: '竞技场表演者：残虐凶暴、武斗演出、华丽格挡、悍猛凶暴与毁形残骨。',
    status: 'selectable', availability: 'player', sourceIds,
    features: featuresOf('subclass-2024-ua-fighter-gladiator'),
  },
  {
    id: 'subclass-2024-ua-sorcerer-defiled', classId: 'class-2024-sorcerer', ruleset: '5e-2024', name: '亵渎术法', englishName: 'Defiled Sorcery', selectionLevel: 3,
    summary: '汲取生命化作灾术：亵渎强化、污染施术、凋零灵光与卓越亵渎者。',
    status: 'selectable', availability: 'player', sourceIds,
    features: featuresOf('subclass-2024-ua-sorcerer-defiled'),
    alwaysPreparedSpellIdsByLevel: {
      3: ['spell-2024-inflict-wounds', 'spell-2024-ray-of-sickness', 'spell-2024-blindness-deafness', 'spell-2024-ray-of-enfeeblement'],
      5: ['spell-2024-bestow-curse', 'spell-2024-vampiric-touch'],
      7: ['spell-2024-blight', 'spell-2024-hallucinatory-terrain'],
      9: ['spell-2024-antilife-shell', 'spell-2024-contagion'],
    },
  },
  {
    id: 'subclass-2024-ua-warlock-sorcerer-king', classId: 'class-2024-warlock', ruleset: '5e-2024', name: '巫王宗主', englishName: 'Sorcerer-King Patron', selectionLevel: 3,
    summary: '暴君的传令官：巫王法术、暴君传令官、决断诏令、复仇叱喝与绝对暴政。',
    status: 'selectable', availability: 'player', sourceIds,
    features: featuresOf('subclass-2024-ua-warlock-sorcerer-king'),
    alwaysPreparedSpellIdsByLevel: {
      3: ['spell-2024-command', 'spell-2024-compelled-duel', 'spell-2024-wrathful-smite', 'spell-2024-hold-person', 'spell-2024-mind-spike'],
      5: ['spell-2024-fear', 'spell-2024-sending'],
      7: ['spell-2024-compulsion', 'spell-2024-staggering-smite'],
      9: ['spell-2024-dominate-person', 'spell-2024-synaptic-static'],
    },
  },
]
