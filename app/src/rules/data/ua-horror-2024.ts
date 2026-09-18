import type { RuleOption, SubclassFeature, SubclassRule } from '@/types/rules'

/**
 * 破解奥秘：可怖子职（UA）。7 个子职（咒剑宗主由奥术版承接）。
 * 来源 `source-2024-ua-horror`，默认关闭、状态 selectable。
 */

const sourceIds = ['source-2024-ua-horror'] as const

const option = (id: string, name: string, englishName: string, description: string): RuleOption => ({
  id, name, englishName, description, status: 'selectable', sourceIds,
})

const spiritTale = (n: number, name: string, englishName: string, description: string): RuleOption =>
  option(`ua-horror-2024-tale-${n}`, `${n}·${name}`, englishName, description)

export const uaHorrorOptions2024: readonly RuleOption[] = [
  spiritTale(1, '心上人', 'Paramour', '目标恢复一枚诗人激励骰＋魅力调整值的生命值。'),
  spiritTale(2, '神射手', 'Sharpshooter', '目标受到一枚诗人激励骰＋魅力调整值的力场伤害。'),
  spiritTale(3, '复仇者', 'Avenger', '到你的下回合结束前，以近战命中目标的生物受一枚激励骰的力场伤害。'),
  spiritTale(4, '叛徒', 'Traitor', '目标传送到 30 尺内可见的未占据空间。'),
  spiritTale(5, '算命师', 'Fortune Teller', '到你的下回合结束前，目标的 d20 掷骰具有优势。'),
  spiritTale(6, '旅者', 'Traveler', '目标获得一枚激励骰＋游荡者等级的临时生命，期间速度 +10 尺。'),
  spiritTale(7, '魔术师', 'Magician', '目标感知豁免失败受两枚激励骰心灵伤害并魅惑至你下回合开始，成功减半。'),
  spiritTale(8, '幽灵', 'Ghost', '目标隐形至你下回合结束或攻击／造成伤害／施法；结束时 5 尺内生物体质豁免失败受两枚激励骰暗蚀。'),
  spiritTale(9, '纵火犯', 'Arsonist', '目标敏捷豁免失败受四枚激励骰火焰伤害，成功减半。'),
  spiritTale(10, '懦夫', 'Coward', '目标与 30 尺内所选生物感知豁免失败则恐慌至你下回合结束，速度减半且只能动作或附赠动作之一。'),
  spiritTale(11, '畜生', 'Brute', '目标与 30 尺内所选生物力量豁免失败受三枚激励骰雷鸣伤害并倒地，成功减半。'),
  spiritTale(12, '控制连结', 'Conniving Spirit', '选择表中其他一行作为精魂效应。'),
  option('ua-horror-2024-reanimator-arcana-conduit', '奥术联结', 'Arcana Conduit', '伴兵可作施法原点（仍用你的感官）；每回合一次，塑能／死灵奇械师法术造成伤害时若伴兵在 120 尺内，加入智力调整值。'),
  option('ua-horror-2024-reanimator-ferocity', '凶残', 'Ferocity', '命令伴兵执行恐怖横扫时，它使用两次该动作。'),
  option('ua-horror-2024-reanimator-bloated', '肿胀', 'Bloated', '伴兵体型可选中型或大型；恐怖横扫命中大型及以下生物可推离 10 尺；自爆可加智力调整值。'),
  option('ua-horror-2024-reanimator-gaunt', '畏怖', 'Gaunt', '伴兵速度 45 尺＋等同速度的攀爬速度（含天花板）；10 尺灵光内所选生物感知豁免失败恐慌至其下回合开始。'),
  option('ua-horror-2024-reanimator-moist', '潮湿', 'Moist', '伴兵获得等同速度的游泳速度；被其 10 尺内生物命中时，攻击者受智力调整值强酸伤害。'),
]

export const uaHorrorFeatures2024: readonly SubclassFeature[] = [
  // ============ 精魂学院（吟游诗人） ============
  {
    id: 'ua-horror-2024-spirits-channeler', subclassId: 'subclass-2024-ua-bard-spirits', name: '通灵师', englishName: 'Channeler', level: 3,
    summary: '习得神导术（射程 60 尺）；获得一副赌具（纸牌）熟练，可用纸牌／水晶／法球／蜡烛／墨水笔作为吟游诗人法器。',
    description: '你习得戏法神导术，对你而言其施法距离为 60 尺。你获得一副赌具（纸牌）及其熟练；你可以用这副牌、奥术法器（水晶或法球）、蜡烛或墨水笔作为吟游诗人法术的施法法器。',
    kind: 'passive', status: 'selectable', sourceIds,
  },
  {
    id: 'ua-horror-2024-spirits-tales', subclassId: 'subclass-2024-ua-bard-spirits', name: '彼岸故事', englishName: 'Tales from Beyond', level: 3,
    summary: '附赠动作消耗一枚诗人激励并掷骰，按远方之魂表决定精魂效应，目标为你 30 尺内可见生物。',
    description: '持握施法法器期间，你可以以一个附赠动作消耗一枚诗人激励并呼唤精魂：投掷激励骰并按“远方之魂表”（d12）决定精魂，随后选择你 30 尺内可见的一个生物作为目标，精魂立即产生效应。若需要豁免，DC＝你的法术豁免 DC。14 级起可投两次并选择其一。',
    kind: 'bonus-action', optionIds: [...Array(12)].map((_, index) => `ua-horror-2024-tale-${index + 1}`), status: 'selectable', sourceIds,
  },
  {
    id: 'ua-horror-2024-spirits-empowered', subclassId: 'subclass-2024-ua-bard-spirits', name: '超力链接', englishName: 'Empowered Channeling', level: 6,
    summary: '每回合一次，伤害或治疗法术可加一枚 d6；始终准备灵体卫士并可免费施展一次（长休恢复）。',
    description: '每回合一次，当你施展造成伤害或恢复生命值的吟游诗人法术时，投 1d6 并将结果加入其中一次伤害掷骰或治疗总量。你始终准备灵体卫士，并可免费施展一次（长休后恢复）。施展该法术时可修改为灵体提供半身掩护，此修改每次短休或长休后恢复。',
    kind: 'passive', status: 'selectable', sourceIds,
    grantedSpells: [{ spellId: 'spell-2024-spirit-guardians', alwaysPrepared: true, freeCastings: 1, recovery: 'long-rest' }],
  },
  {
    id: 'ua-horror-2024-spirits-mystical', subclassId: 'subclass-2024-ua-bard-spirits', name: '非凡沟通', englishName: 'Mystical Connection', level: 14,
    summary: '投掷远方之魂表时投两次并选择其一。',
    description: '你熟练掌控召唤出的精魂：投掷远方之魂表时投掷两次并选择使用其中一种效应。',
    kind: 'passive', status: 'selectable', sourceIds,
  },

  // ============ 苏生师（奇械师） ============
  {
    id: 'ua-horror-2024-reanimator-spells', subclassId: 'subclass-2024-ua-artificer-reanimator', name: '苏生师法术', englishName: 'Reanimator Spells', level: 3,
    summary: '3／5／9／13／17 级按苏生师法术表始终准备法术。',
    description: '达到对应奇械师等级时，你始终准备苏生师法术表中的法术；这些法术不计入准备上限。',
    kind: 'passive', status: 'selectable', sourceIds,
  },
  {
    id: 'ua-horror-2024-reanimator-jolt', subclassId: 'subclass-2024-ua-artificer-reanimator', name: '电颤复律', englishName: 'Jolt to Life', level: 3,
    summary: '以维生术调整：目标恢复 1 生命；其 10 尺内生物敏捷豁免失败受 1d4＋半奇械师等级闪电伤害。次数＝智力调整值，长休恢复。',
    description: '当你施展维生术时，你可以调整该法术：目标恢复 1 生命值，且源自其 10 尺光环内每名生物进行对抗你法术豁免 DC 的敏捷豁免，失败受 1d4＋你奇械师等级一半（向下取整）的闪电伤害，成功减半。使用次数等于你的智力调整值，长休恢复。',
    kind: 'resource', status: 'selectable', sourceIds,
    resource: { maxFromAbility: { ability: 'int', minimum: 1 }, recovery: 'long-rest' },
  },
  {
    id: 'ua-horror-2024-reanimator-companion', subclassId: 'subclass-2024-ua-artificer-reanimator', name: '再起伴兵', englishName: 'Reanimated Companion', level: 3,
    summary: '动作创造再起伴兵（小型亡灵，自爆 2d6 暗蚀、闪电吸收、恐怖横扫）；同一时间一只，长休或耗法术位重造。',
    description: '你可以用一个动作使用修补工具或其他熟练的奇械工具创造一名再起伴兵（小型亡灵，AC 10＋智力调整值，HP 4＋4×奇械师等级；自爆——死亡时 10 尺内敏捷豁免失败受 2d6 暗蚀；闪电吸收；恐怖横扫——命中 1d4＋2＋智力调整值暗蚀且目标下回合前不能借机攻击）。伴兵持续至长休或你以魔法动作解散；你死亡时它立即死亡并自爆。同一时间只能有一只；创造后需长休或消耗法术位才能再次创造。伴兵数据未接入自动战斗结算。',
    kind: 'resource', status: 'selectable', sourceIds,
    resource: { maxByLevel: [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], recovery: 'long-rest', unit: '只' },
  },
  {
    id: 'ua-horror-2024-reanimator-modifications', subclassId: 'subclass-2024-ua-artificer-reanimator', name: '怪异修正', englishName: 'Strange Modifications', level: 5,
    summary: '创造伴兵时选择奥术联结或凶残。',
    description: '每当你创造一名再起伴兵时，你从以下选项中选择一项令其获得：奥术联结——你可以如同身处伴兵所在空间一样施展法术（仍需你的感官），每回合一次，若你施展塑能或死灵奇械师法术造成伤害且伴兵位于你 120 尺内，将你的智力调整值加入其中一枚伤害骰；凶残——当你命令伴兵执行恐怖横扫时，它使用两次该动作。',
    kind: 'choice', requiresChoice: true, optionIds: ['ua-horror-2024-reanimator-arcana-conduit', 'ua-horror-2024-reanimator-ferocity'], minSelections: 1, maxSelections: 1, status: 'selectable', sourceIds,
  },
  {
    id: 'ua-horror-2024-reanimator-improved', subclassId: 'subclass-2024-ua-artificer-reanimator', name: '强化再起', englishName: 'Improved Reanimation', level: 9,
    summary: '创造伴兵时选择肿胀、畏怖或潮湿。',
    description: '每当你创造一名再起伴兵时，你从肿胀、畏怖、潮湿中选择一项令其获得。',
    kind: 'choice', requiresChoice: true, optionIds: ['ua-horror-2024-reanimator-bloated', 'ua-horror-2024-reanimator-gaunt', 'ua-horror-2024-reanimator-moist'], minSelections: 1, maxSelections: 1, status: 'selectable', sourceIds,
  },
  {
    id: 'ua-horror-2024-reanimator-promethean', subclassId: 'subclass-2024-ua-artificer-reanimator', name: '盗火者之生', englishName: 'Promethean Reanimation', level: 15,
    summary: '回生术／死者复活材料减半；伴兵自爆 4d6 且暗蚀无视抗性；反应令伴兵死亡并恢复奇械师等级生命。',
    description: '你获得三项增益：便捷复活——施展回生术或死者复活时所需材料成分减半；伴兵提升——伴兵自爆伤害提升至 4d6，其暗蚀伤害无视抗性；性命流转——当你受到伤害时，你可以用反应令再起伴兵降至 0 生命值（触发自爆）并恢复等于你奇械师等级的生命值。',
    kind: 'passive', status: 'selectable', sourceIds,
  },

  // ============ 坟墓领域（牧师） ============
  {
    id: 'ua-horror-2024-grave-mortality', subclassId: 'subclass-2024-ua-cleric-grave', name: '生死轮回', englishName: 'Circle of Mortality', level: 3,
    summary: '每回合一次对浴血生物追加 1d4 暗蚀；为 0 生命生物治疗时骰子取最大值。',
    description: '每回合一次，当你对浴血生物施展法术或攻击命中并造成伤害时，该生物额外受到 1d4 暗蚀伤害。当你用法术或引导神力为生命值为 0 的生物掷治疗骰时，不使用掷骰结果，改为取每个骰子的最大值。',
    kind: 'passive', status: 'selectable', sourceIds,
  },
  {
    id: 'ua-horror-2024-grave-spells', subclassId: 'subclass-2024-ua-cleric-grave', name: '坟墓领域法术', englishName: 'Grave Domain Spells', level: 3,
    summary: '3／5／7／9 级按坟墓领域法术表始终准备法术。',
    description: '达到对应牧师等级时，你始终准备坟墓领域法术表中的法术；这些法术不计入准备上限。',
    kind: 'passive', status: 'selectable', sourceIds,
  },
  {
    id: 'ua-horror-2024-grave-path', subclassId: 'subclass-2024-ua-cleric-grave', name: '往墓之途', englishName: 'Path to the Grave', level: 3,
    summary: '附赠动作消耗引导神力诅咒 30 尺内可见生物：其攻击与豁免劣势；命中时可中止诅咒并追加 1d8＋牧师等级暗蚀或光耀。',
    description: '以一个附赠动作，你展示圣徽并消耗一次引导神力诅咒 30 尺内可见的一个生物，直到你下回合开始：诅咒期间其攻击检定与豁免检定具有劣势。当你或你能看见的盟友命中被诅咒目标时，你可以提前中止诅咒（无需动作），该次攻击额外造成 1d8＋你牧师等级的暗蚀或光耀伤害（由你选择）。',
    kind: 'bonus-action', status: 'selectable', sourceIds,
  },
  {
    id: 'ua-horror-2024-grave-sentinel', subclassId: 'subclass-2024-ua-cleric-grave', name: '死之门的哨卫', englishName: "Sentinel at Death's Door", level: 6,
    summary: '你或 30 尺内可见浴血生物被命中时，反应减半该次伤害；次数＝感知调整值，长休恢复。',
    description: '当你或你 30 尺内可见的一个浴血生物被一次攻击命中时，你可以用反应减半该次攻击的伤害。使用次数等于你的感知调整值（至少 1 次），长休恢复。',
    kind: 'reaction', status: 'selectable', sourceIds,
    resource: { maxFromAbility: { ability: 'wis', minimum: 1 }, recovery: 'long-rest' },
  },
  {
    id: 'ua-horror-2024-grave-reaper', subclassId: 'subclass-2024-ua-cleric-grave', name: '死之神使', englishName: 'Divine Reaper', level: 17,
    summary: '消耗引导神力让单体死灵／领域法术多选一个目标；60 尺内敌人死亡时可让一名生物恢复三倍牧师等级生命（每次短休或长休 1 次）。',
    description: '当你以单一生物为目标施展五环或更低的死灵学派法术或坟墓领域法术时，你可以花费一次引导神力使其以施法距离内第二个生物为目标（需为每个目标提供材料成分）。此外，当一个敌人在你 60 尺内死亡时，你或你 60 尺内可见的一个生物恢复等于三倍你牧师等级的生命值；此效果每次短休或长休后恢复，失能时不可用。',
    kind: 'resource', status: 'selectable', sourceIds,
    resource: { maxByLevel: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1], recovery: 'short-rest', note: '引魂持灯者；每次短休或长休恢复' },
  },

  // ============ 鬼魅（游荡者） ============
  {
    id: 'ua-horror-2024-phantom-wails', subclassId: 'subclass-2024-ua-rogue-phantom', name: '墓地泣音', englishName: 'Wails from the Grave', level: 3,
    summary: '偷袭后可选 30 尺内另一生物，投一半偷袭骰（向上取整）造成暗蚀；次数＝敏捷调整值。',
    description: '当你在你的回合造成偷袭伤害后，你可以立即选择该生物 30 尺内另一个可见生物，投掷一半数量的偷袭骰（基于游荡者等级，向上取整），新目标受投掷结果之和的暗蚀伤害。使用次数等于你的敏捷调整值（至少 1 次），长休恢复。',
    kind: 'resource', status: 'selectable', sourceIds,
    resource: { maxFromAbility: { ability: 'dex', minimum: 1 }, recovery: 'long-rest' },
  },
  {
    id: 'ua-horror-2024-phantom-whispers', subclassId: 'subclass-2024-ua-rogue-phantom', name: '亡者余声', englishName: 'Whispers of the Dead', level: 3,
    summary: '短休或长休时选择一项缺乏熟练的技能获得熟练（更换时旧熟练消失）。',
    description: '每当完成短休或长休时，你可以选择一项你缺乏熟练的技能，获得其熟练；当你用此能力获得另一项熟练时，失去之前选择的熟练。',
    kind: 'choice', requiresChoice: true, candidateKind: 'all-skills', minSelections: 1, maxSelections: 1, status: 'selectable', sourceIds,
  },
  {
    id: 'ua-horror-2024-phantom-tokens', subclassId: 'subclass-2024-ua-rogue-phantom', name: '逝者遗物', englishName: 'Tokens of the Departed', level: 9,
    summary: '长休获得 2 件灵魂饰品（13／17 级为 3／4 件）；可用于丧钟、生命精华、灵魂问询；敌人死亡时反应重获。',
    description: '每当你完成长休时获得两件灵魂饰品（13 级三件、17 级四件），微型物件并在下次长休消失；与饰品距离超过 30 尺时它自动传送到你身上。用途：丧钟——造成偷袭伤害时消耗一件，免费使用墓地泣音；生命精华——至少持有一件时死亡豁免与体质豁免具有优势；灵魂问询——魔法动作消耗一件施展卜筮术（无需成分，敏捷施法）。当 30 尺内可见生物死亡时，你可以用反应重获一件已消耗的饰品。',
    kind: 'resource', status: 'selectable', sourceIds,
    resource: { maxByLevel: [0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4], recovery: 'long-rest', unit: '件' },
  },
  {
    id: 'ua-horror-2024-phantom-voice', subclassId: 'subclass-2024-ua-rogue-phantom', name: '死亡之声', englishName: 'Voice of Death', level: 9,
    summary: '无需法术位与成分施展死者交谈（敏捷施法）；每次短休或长休恢复。',
    description: '你可以无需法术位与任何法术成分施展死者交谈，施法属性为敏捷。完成一次短休或长休后恢复使用。',
    kind: 'resource', status: 'selectable', sourceIds,
    resource: { maxByLevel: [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], recovery: 'short-rest' },
  },
  {
    id: 'ua-horror-2024-phantom-walk', subclassId: 'subclass-2024-ua-rogue-phantom', name: '幽灵漫步', englishName: 'Ghost Walk', level: 13,
    summary: '附赠动作 10 分钟灵体形态：10 尺飞行与悬浮、攻击劣势、虚体移动；长休恢复或消耗灵魂饰品重置。',
    description: '以一个附赠动作，你化为灵体形态持续 10 分钟（可提前结束）：获得 10 尺飞行速度并可悬浮；以你为目标的攻击检定具有劣势；你可以如困难地形般穿过已占据空间，但若回合结束时停在其中则受 1d10 力场伤害。使用后需长休恢复，或消耗并销毁一件灵魂饰品重置（无需动作）。',
    kind: 'bonus-action', status: 'selectable', sourceIds,
    resource: { maxByLevel: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1], recovery: 'long-rest', note: '可消耗一件灵魂饰品重置' },
  },
  {
    id: 'ua-horror-2024-phantom-friend', subclassId: 'subclass-2024-ua-rogue-phantom', name: '死亡之友', englishName: "Death's Friend", level: 17,
    summary: '墓地泣音可同时伤害主目标与新目标；无饰品时掷先攻重获一件。',
    description: '你获得两项增益：丧悼——使用墓地泣音时可同时对主目标与新目标造成该暗蚀伤害；死者归引——若你已无灵魂饰品，掷先攻时重获一件。',
    kind: 'passive', status: 'selectable', sourceIds,
  },

  // ============ 幽影术法（术士） ============
  {
    id: 'ua-horror-2024-shadow-spells', subclassId: 'subclass-2024-ua-sorcerer-shadow', name: '幽影法术', englishName: 'Shadow Spells', level: 3,
    summary: '3／5／7／9 级按幽影法术表始终准备法术。',
    description: '达到对应术士等级时，你始终准备幽影法术表中的法术；这些法术不计入准备上限。',
    kind: 'passive', status: 'selectable', sourceIds,
  },
  {
    id: 'ua-horror-2024-shadow-eyes', subclassId: 'subclass-2024-ua-sorcerer-shadow', name: '幽暗之瞳', englishName: 'Eyes of the Dark', level: 3,
    summary: '120 尺黑暗视觉与 10 尺盲视；可看穿你自己法术制造的黑暗。',
    description: '你具有 120 尺黑暗视觉与 10 尺盲视。此外，若一个由你施展的法术制造了黑暗区域，你能如常看穿该法术制造的黑暗。',
    kind: 'passive', status: 'selectable', sourceIds,
  },
  {
    id: 'ua-horror-2024-shadow-spirits', subclassId: 'subclass-2024-ua-sorcerer-shadow', name: '凶兆精魂', englishName: 'Spirits of Ill Omen', level: 6,
    summary: '无需材料施展亡灵召唤术，并可免费施展一次（长休恢复）；可修改为无需专注（持续 1 分钟）。',
    description: '你可以无需材料成分施展亡灵召唤术，并可无需法术位施展一次（长休恢复）。每次开始施展时，你可以修改该法术使其无需专注；此时持续时间变为 1 分钟，再次施展时提前结束。',
    kind: 'resource', status: 'selectable', sourceIds,
    grantedSpells: [{ spellId: 'spell-2024-summon-undead', freeCastings: 1, recovery: 'long-rest' }],
  },
  {
    id: 'ua-horror-2024-shadow-walk', subclassId: 'subclass-2024-ua-sorcerer-shadow', name: '幽影漫步', englishName: 'Shadow Walk', level: 14,
    summary: '身处微光或黑暗时，附赠动作传送至多 120 尺至同样位于微光或黑暗的可见空间。',
    description: '当你处于微光或黑暗环境时，你可以用一个附赠动作将自己传送至多 120 尺，到一处未被占据、同样位于微光或黑暗的可见空间。',
    kind: 'bonus-action', status: 'selectable', sourceIds,
  },
  {
    id: 'ua-horror-2024-shadow-umbral', subclassId: 'subclass-2024-ua-sorcerer-shadow', name: '幽暗之形', englishName: 'Umbral Form', level: 18,
    summary: '附赠动作 1 分钟：虚体移动、除力场／光耀外全抗性、濒死时魅力豁免成功则生命值改为三倍术士等级；长休恢复或 6 术法点重置。',
    description: '以一个附赠动作，你启用幽影形态 1 分钟（可提前结束）：虚体移动——可如困难地形般穿过已占据空间，若回合结束仍在内则受 1d10 力场伤害；幽影坚韧——获得除力场与光耀之外所有伤害类型的抗性；终焉之力——若你降至 0 生命值且未直接死亡，可进行魅力豁免（DC＝5＋所受伤害的一半），成功则生命值改为三倍你的术士等级。使用后需长休恢复，或消耗 6 术法点重置。',
    kind: 'bonus-action', status: 'selectable', sourceIds,
    resource: { maxByLevel: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1], recovery: 'long-rest', note: '可消耗 6 术法点重置' },
  },

  // ============ 死灵宗主（魔契师） ============
  {
    id: 'ua-horror-2024-undead-spells', subclassId: 'subclass-2024-ua-warlock-undead', name: '死灵法术', englishName: 'Undead Spells', level: 3,
    summary: '3／5／7／9 级按死灵法术表始终准备法术。',
    description: '达到对应魔契师等级时，你始终准备死灵法术表中的法术；这些法术不计入准备上限。',
    kind: 'passive', status: 'selectable', sourceIds,
  },
  {
    id: 'ua-horror-2024-undead-form', subclassId: 'subclass-2024-ua-warlock-undead', name: '战栗形态', englishName: 'Form of Dread', level: 3,
    summary: '附赠动作 1 分钟：临时生命 1d10＋魔契师等级、免疫恐慌、每回合一次命中可令目标恐慌；次数＝魅力调整值，长休恢复。',
    description: '以一个附赠动作，你化为你宗主可怖力量的化身 1 分钟（可提前结束）：获得 1d10＋魔契师等级的临时生命；免疫恐慌状态；每回合一次，当你以攻击命中一个生物时，可迫使它进行对抗你法术豁免 DC 的感知豁免，失败则恐慌至你下回合结束。使用次数等于你的魅力调整值（至少 1 次），长休恢复。',
    kind: 'bonus-action', status: 'selectable', sourceIds,
    resource: { maxFromAbility: { ability: 'cha', minimum: 1 }, recovery: 'long-rest' },
  },
  {
    id: 'ua-horror-2024-undead-grave', subclassId: 'subclass-2024-ua-warlock-undead', name: '坟冢之触', englishName: 'Grave Touched', level: 6,
    summary: '暗蚀伤害无视抗性；战栗形态期间每回合一次可把伤害类型改为暗蚀；不需睡眠，不会因脱水／饥饿／窒息获得力竭。',
    description: '你施展法术或攻击命中造成暗蚀伤害时，该伤害无视暗蚀伤害抗性；战栗形态期间每回合一次，你施展造成伤害的法术时可将其伤害类型替换为暗蚀。此外，你不会因脱水、饥饿或窒息获得力竭等级，不需要睡眠，魔法也无法使你入睡。',
    kind: 'passive', status: 'selectable', sourceIds,
  },
  {
    id: 'ua-horror-2024-undead-husk', subclassId: 'subclass-2024-ua-warlock-undead', name: '死疽躯壳', englishName: 'Necrotic Husk', level: 10,
    summary: '暗蚀抗性（战栗形态期间免疫）；濒死时爆发 2d10＋魔契师等级暗蚀，生命值改为 10×魅力调整值并获得 1 级力竭；每次短休或长休 1 次。',
    description: '你获得暗蚀伤害抗性；战栗形态期间改为暗蚀伤害免疫。若你降至 0 生命值且未直接死亡，你可以使身体爆发出死亡能量：源自你的 30 尺光环内由你选择的生物进行对抗你法术豁免 DC 的体质豁免，失败受 2d10＋魔契师等级暗蚀伤害，成功减半；随后你的生命值变为 10×魅力调整值（至少 10），并获得 1 级力竭。此特性每次短休或长休后恢复。',
    kind: 'resource', status: 'selectable', sourceIds,
    resource: { maxByLevel: [0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], recovery: 'short-rest' },
  },
  {
    id: 'ua-horror-2024-undead-superior', subclassId: 'subclass-2024-ua-warlock-undead', name: '超凡恐惧', englishName: 'Superior Dread', level: 14,
    summary: '战栗形态期间：等同速度的飞行与悬浮、咒法／死灵法术免言语姿势材料、每回合一次造成暗蚀伤害时恢复魅力调整值生命。',
    description: '战栗形态期间你获得：飞行——等于你速度的飞行速度并可悬浮；亵渎施法——施展咒法或死灵学派的魔契师法术时无需言语、姿势或材料成分（被消耗或注明价格的材料除外）；活力虹吸——每回合一次，当你对一个生物造成暗蚀伤害时，恢复等于你魅力调整值的生命值（至少 1）。',
    kind: 'passive', status: 'selectable', sourceIds,
  },

  // ============ 幽邃戍卫（游侠） ============
  {
    id: 'ua-horror-2024-hollow-magic', subclassId: 'subclass-2024-ua-ranger-hollow-warden', name: '幽邃戍卫魔法', englishName: 'Hollow Warden Magic', level: 3,
    summary: '3／5／9／13／17 级按幽邃戍卫法术表始终准备法术。',
    description: '达到对应游侠等级时，你始终准备幽邃戍卫法术表中的法术；这些法术不计入准备上限。',
    kind: 'passive', status: 'selectable', sourceIds,
  },
  {
    id: 'ua-horror-2024-hollow-wrath', subclassId: 'subclass-2024-ua-ranger-hollow-warden', name: '荒野之怒', englishName: 'Wrath of the Wild', level: 3,
    summary: '施展猎人印记时变身：AC 加感知调整值（至少 +1）；10 尺灵光内敌人回合开始感知豁免失败则本回合只能动作或附赠动作之一。',
    description: '当你施展猎人印记时，你的身形变化，法术持续期间获得：远古护甲——AC 获得等于你感知调整值（至少 +1）的加值；悚然灵光——当一个敌人在源自你的 10 尺灵光内开始回合时，它必须进行对抗你法术豁免 DC 的感知豁免，失败则本回合只能在动作或附赠动作中采取一种。',
    kind: 'passive', status: 'selectable', sourceIds,
  },
  {
    id: 'ua-horror-2024-hollow-might', subclassId: 'subclass-2024-ua-ranger-hollow-warden', name: '渴血予力', englishName: 'Hungering Might', level: 7,
    summary: '体质豁免加感知调整值（至少 +1）；浴血时每回合一次荒野之怒下命中可恢复 1d10＋感知调整值生命。',
    description: '你将感知调整值（至少 +1）加到体质豁免结果中。此外，若你处于浴血状态，每回合一次，当你处于荒野之怒变身下攻击命中一个生物时，你恢复 1d10＋感知调整值的生命值。',
    kind: 'passive', status: 'selectable', sourceIds,
  },
  {
    id: 'ua-horror-2024-hollow-rot', subclassId: 'subclass-2024-ua-ranger-hollow-warden', name: '枯朽残虐', englishName: 'Rot and Violence', level: 11,
    summary: '荒野之怒下：悚然灵光豁免失败额外受游侠等级伤害（暗蚀／毒素／心灵，无视抗性）；武器命中可额外应用削弱或缓速精通。',
    description: '当你使用荒野之怒变形时获得：诡异灵光——生物在对抗悚然灵光的豁免失败时，额外受到等于你游侠等级的暗蚀、毒素或心灵伤害（由你选择，无视抗性）；索命根须——武器攻击命中时，除武器自身精通词条外，你还可以为其应用削弱或缓速词条。',
    kind: 'passive', status: 'selectable', sourceIds,
  },
  {
    id: 'ua-horror-2024-hollow-endurance', subclassId: 'subclass-2024-ua-ranger-hollow-warden', name: '亘古不息', englishName: 'Ancient Endurance', level: 15,
    summary: '荒野之怒下濒死可用 4 环以上法术位把生命值改为环阶×5；免疫恐慌？——免疫的是力竭状态。',
    description: '你获得两项增益：不息狂猎——若你在荒野之怒变身期间生命值降至 0 且未立即死亡，你可以消耗一个四环及以上法术位（无需动作），生命值变为所消耗环阶的 5 倍；永不安眠——你免疫力竭状态。',
    kind: 'passive', status: 'selectable', sourceIds,
  },
]

const featuresOf = (subclassId: string): readonly SubclassFeature[] =>
  uaHorrorFeatures2024.filter((feature) => feature.subclassId === subclassId)

export const uaHorrorSubclasses2024: readonly SubclassRule[] = [
  {
    id: 'subclass-2024-ua-bard-spirits', classId: 'class-2024-bard', ruleset: '5e-2024', name: '精魂学院', englishName: 'College of Spirits', selectionLevel: 3,
    summary: '以通灵工具呼唤精魂：彼岸故事按 d12 表产生即时效应，6 级免费灵体卫士，14 级双投选择。',
    status: 'selectable', availability: 'player', sourceIds,
    features: featuresOf('subclass-2024-ua-bard-spirits'),
    alwaysPreparedSpellIdsByLevel: { 6: ['spell-2024-spirit-guardians'] },
  },
  {
    id: 'subclass-2024-ua-artificer-reanimator', classId: 'class-2024-ua-artificer', ruleset: '5e-2024', name: '苏生师', englishName: 'Reanimator', selectionLevel: 3,
    summary: '缝合并复生亡者：再起伴兵、怪异修正、强化再起与盗火者之生。',
    status: 'selectable', availability: 'player', sourceIds,
    features: featuresOf('subclass-2024-ua-artificer-reanimator'),
    alwaysPreparedSpellIdsByLevel: {
      3: ['spell-2024-false-life', 'spell-2024-spare-the-dying', 'spell-2024-witch-bolt'],
      5: ['spell-2024-blindness-deafness', 'spell-2024-enhance-ability'],
      9: ['spell-2024-animate-dead', 'spell-2024-lightning-bolt'],
      13: ['spell-2024-blight', 'spell-2024-death-ward'],
      17: ['spell-2024-antilife-shell', 'spell-2024-raise-dead'],
    },
  },
  {
    id: 'subclass-2024-ua-cleric-grave', classId: 'class-2024-cleric', ruleset: '5e-2024', name: '坟墓领域', englishName: 'Grave Domain', selectionLevel: 3,
    summary: '守护生死边界：生死轮回、往墓之途、死之门的哨卫与死之神使。',
    status: 'selectable', availability: 'player', sourceIds,
    features: featuresOf('subclass-2024-ua-cleric-grave'),
    alwaysPreparedSpellIdsByLevel: {
      3: ['spell-2024-bane', 'spell-2024-chill-touch', 'spell-2024-detect-evil-and-good', 'spell-2024-gentle-repose', 'spell-2024-ray-of-enfeeblement'],
      5: ['spell-2024-revivify', 'spell-2024-vampiric-touch'],
      7: ['spell-2024-blight', 'spell-2024-dispel-evil-and-good'],
      9: ['spell-2024-hold-monster', 'spell-2024-raise-dead'],
    },
  },
  {
    id: 'subclass-2024-ua-rogue-phantom', classId: 'class-2024-rogue', ruleset: '5e-2024', name: '鬼魅', englishName: 'Phantom', selectionLevel: 3,
    summary: '在生死之间穿行：墓地泣音、亡者余声、逝者遗物、死亡之声与幽灵漫步。',
    status: 'selectable', availability: 'player', sourceIds,
    features: featuresOf('subclass-2024-ua-rogue-phantom'),
  },
  {
    id: 'subclass-2024-ua-sorcerer-shadow', classId: 'class-2024-sorcerer', ruleset: '5e-2024', name: '幽影术法', englishName: 'Shadow Sorcery', selectionLevel: 3,
    summary: '以堕影冥界之力作战：幽暗之瞳、凶兆精魂、幽影漫步与幽暗之形。',
    status: 'selectable', availability: 'player', sourceIds,
    features: featuresOf('subclass-2024-ua-sorcerer-shadow'),
    alwaysPreparedSpellIdsByLevel: {
      3: ['spell-2024-bane', 'spell-2024-darkness', 'spell-2024-inflict-wounds', 'spell-2024-pass-without-trace'],
      5: ['spell-2024-hunger-of-hadar', 'spell-2024-summon-undead'],
      7: ['spell-2024-greater-invisibility', 'spell-2024-phantasmal-killer'],
      9: ['spell-2024-contagion', 'spell-2024-creation'],
    },
  },
  {
    id: 'subclass-2024-ua-warlock-undead', classId: 'class-2024-warlock', ruleset: '5e-2024', name: '死灵宗主', englishName: 'Undead Patron', selectionLevel: 3,
    summary: '以亵渎之力拒斥死亡：战栗形态、坟冢之触、死疽躯壳与超凡恐惧。',
    status: 'selectable', availability: 'player', sourceIds,
    features: featuresOf('subclass-2024-ua-warlock-undead'),
    alwaysPreparedSpellIdsByLevel: {
      3: ['spell-2024-blindness-deafness', 'spell-2024-false-life', 'spell-2024-phantasmal-force', 'spell-2024-ray-of-sickness'],
      5: ['spell-2024-speak-with-dead', 'spell-2024-vampiric-touch'],
      7: ['spell-2024-death-ward', 'spell-2024-phantasmal-killer'],
      9: ['spell-2024-antilife-shell', 'spell-2024-cloudkill'],
    },
  },
  {
    id: 'subclass-2024-ua-ranger-hollow-warden', classId: 'class-2024-ranger', ruleset: '5e-2024', name: '幽邃戍卫', englishName: 'Hollow Warden', selectionLevel: 3,
    summary: '从古老荒野汲取力量：荒野之怒、渴血予力、枯朽残虐与亘古不息。',
    status: 'selectable', availability: 'player', sourceIds,
    features: featuresOf('subclass-2024-ua-ranger-hollow-warden'),
    alwaysPreparedSpellIdsByLevel: {
      3: ['spell-2024-wrathful-smite'],
      5: ['spell-2024-spike-growth'],
      9: ['spell-2024-phantom-steed'],
      13: ['spell-2024-hallucinatory-terrain'],
      17: ['spell-2024-awaken'],
    },
  },
]
