import type { RuleOption } from '@/types/rules'

/**
 * 2024 魔契师魔能祈唤选项（Eldritch Invocations）。
 *
 * 规则：1 级获得 1 项，2／5／7／9／12／15／18 级逐步增加至 10 项；
 * 每项可带等级先决与依赖先决（如魔能斩需先选刃之魔契）；复选祈唤可多次选取。
 * 摘要为原创中文转述；具体效果以《玩家手册（2024）》为准。
 *
 * 规则集：`5e-2024`。
 */
const sourceIds = ['source-2024-phb'] as const

const PACT_OF_THE_BLADE = 'invocation-2024-pact-of-the-blade'
const PACT_OF_THE_CHAIN = 'invocation-2024-pact-of-the-chain'
const PACT_OF_THE_TOME = 'invocation-2024-pact-of-the-tome'
const THIRSTING_BLADE = 'invocation-2024-thirsting-blade'

export const INVOCATION_2024_OPTION_IDS: readonly string[] = [
  'invocation-2024-armor-of-shadows',
  'invocation-2024-eldritch-mind',
  'invocation-2024-pact-of-the-blade',
  'invocation-2024-pact-of-the-chain',
  'invocation-2024-pact-of-the-tome',
  'invocation-2024-agonizing-blast',
  'invocation-2024-devils-sight',
  'invocation-2024-eldritch-spear',
  'invocation-2024-fiendish-vigor',
  'invocation-2024-lessons-of-the-first-ones',
  'invocation-2024-mask-of-many-faces',
  'invocation-2024-misty-visions',
  'invocation-2024-otherworldly-leap',
  'invocation-2024-repelling-blast',
  'invocation-2024-ascendant-step',
  'invocation-2024-eldritch-smite',
  'invocation-2024-gaze-of-two-minds',
  'invocation-2024-gift-of-the-depths',
  'invocation-2024-investment-of-the-chain-master',
  'invocation-2024-master-of-myriad-forms',
  'invocation-2024-one-with-shadows',
  'invocation-2024-thirsting-blade',
  'invocation-2024-whispers-of-the-grave',
  'invocation-2024-lifedrinker',
  'invocation-2024-gift-of-the-protectors',
  'invocation-2024-visions-of-distant-realms',
  'invocation-2024-devouring-blade',
  'invocation-2024-witch-sight',
]

export const invocations2024: readonly RuleOption[] = [
  {
    id: 'invocation-2024-armor-of-shadows', name: '幽影护甲', englishName: 'Armor of Shadows',
    description: '【任意施法】你可以随意以自身为目标施展法师护甲，且无需消耗法术位。',
    status: 'implemented', sourceIds,
  },
  {
    id: 'invocation-2024-eldritch-mind', name: '魔能意志', englishName: 'Eldritch Mind',
    description: '【被动】你为保持专注所进行的体质豁免具有优势。',
    status: 'implemented', sourceIds,
  },
  {
    id: 'invocation-2024-pact-of-the-blade', name: '刃之魔契', englishName: 'Pact of the Blade',
    description: '【契约】附赠动作召唤或连结一把契约武器（简易或军用近战武器）：拥有其熟练、可用作法器，攻击检定与伤害可用魅力代替力量／敏捷，并可改为暗蚀、心灵或光耀伤害；连结结束或死亡时解除。',
    status: 'implemented', sourceIds,
  },
  {
    id: 'invocation-2024-pact-of-the-chain', name: '链之魔契', englishName: 'Pact of the Chain',
    description: '【契约】习得寻获魔宠并可以魔法动作无需法术位施展；魔宠可额外选择小魔鬼、伪龙、小恶魔、骷髅、史拉蟾蝌蚪、求索斯芬克斯、小仙灵或毒蛇等特殊形态；执行攻击动作时可放弃一次攻击让魔宠以反应攻击。',
    status: 'implemented', sourceIds,
  },
  {
    id: 'invocation-2024-pact-of-the-tome', name: '书之魔契', englishName: 'Pact of the Tome',
    description: '【契约】短休或长休结束时咒唤影之书：书中包含你选择的 3 道戏法与 2 道带仪式标签的一环法术（可来自任意职业列表，不能是你已准备的法术），携带时始终准备并视为魔契师法术；书册可作施法法器。',
    status: 'implemented', sourceIds,
  },
  {
    id: 'invocation-2024-agonizing-blast', name: '苦痛魔爆', englishName: 'Agonizing Blast',
    description: '【被动】选择一道已知的造成伤害的魔契师戏法，其每次伤害掷骰加上你的魅力调整值。复选：每次须选择不同戏法。',
    status: 'implemented', sourceIds, minimumLevel: 2, repeatable: true,
  },
  {
    id: 'invocation-2024-devils-sight', name: '魔鬼视界', englishName: "Devil's Sight",
    description: '【被动】你在黑暗与微光中拥有 120 尺可视距离，无论其为魔法或非魔法。',
    status: 'implemented', sourceIds, minimumLevel: 2,
  },
  {
    id: 'invocation-2024-eldritch-spear', name: '魔能长枪', englishName: 'Eldritch Spear',
    description: '【被动】选择一道已知的造成伤害且射程至少 10 尺的魔契师戏法，其射程增加等于魔契师等级 30 倍的尺数。复选：每次须选择不同戏法。',
    status: 'implemented', sourceIds, minimumLevel: 2, repeatable: true,
  },
  {
    id: 'invocation-2024-fiendish-vigor', name: '邪魔活力', englishName: 'Fiendish Vigor',
    description: '【任意施法】你可以无需法术位施展虚假生命，且以该方式施展时临时生命自动取最大值。',
    status: 'implemented', sourceIds, minimumLevel: 2,
  },
  {
    id: 'invocation-2024-lessons-of-the-first-ones', name: '原初之一的教习', englishName: 'Lessons of the First Ones',
    description: '【被动】习得一项由你选择的起源专长。复选：每次须选择不同的起源专长。',
    status: 'implemented', sourceIds, minimumLevel: 2, repeatable: true,
  },
  {
    id: 'invocation-2024-mask-of-many-faces', name: '千面之颜', englishName: 'Mask of Many Faces',
    description: '【任意施法】你可以无需法术位施展易容术。',
    status: 'implemented', sourceIds, minimumLevel: 2,
  },
  {
    id: 'invocation-2024-misty-visions', name: '幻象迷踪', englishName: 'Misty Visions',
    description: '【任意施法】你可以无需法术位施展无声幻影。',
    status: 'implemented', sourceIds, minimumLevel: 2,
  },
  {
    id: 'invocation-2024-otherworldly-leap', name: '超凡跳跃', englishName: 'Otherworldly Leap',
    description: '【任意施法】你可以以自身为目标无需法术位施展跳跃术。',
    status: 'implemented', sourceIds, minimumLevel: 2,
  },
  {
    id: 'invocation-2024-repelling-blast', name: '斥力魔爆', englishName: 'Repelling Blast',
    description: '【被动】选择一道需攻击检定的已知魔契师戏法；命中不超过大型的生物时可将其推离至多 10 尺。复选：每次须选择不同戏法。',
    status: 'implemented', sourceIds, minimumLevel: 2, repeatable: true,
  },
  {
    id: 'invocation-2024-ascendant-step', name: '星移步法', englishName: 'Ascendant Step',
    description: '【任意施法】你可以随意以自身为目标无需法术位施展浮空术。',
    status: 'implemented', sourceIds, minimumLevel: 5,
  },
  {
    id: 'invocation-2024-eldritch-smite', name: '魔能斩', englishName: 'Eldritch Smite',
    description: '【契约】每回合一次，契约武器命中时可消耗一枚契约法术位，额外造成 1d8＋每环阶 1d8 力场伤害；目标不超过巨型时可令其倒地。',
    status: 'implemented', sourceIds, minimumLevel: 5, requiredOptionIds: [PACT_OF_THE_BLADE],
  },
  {
    id: 'invocation-2024-gaze-of-two-minds', name: '共视感官', englishName: 'Gaze of Two Minds',
    description: '【被动】附赠动作触碰一个自愿生物建立感官连接（可用附赠动作延续）：获得其特殊感官；距离不超过 60 尺时可如同在其位置般施法。',
    status: 'implemented', sourceIds, minimumLevel: 5,
  },
  {
    id: 'invocation-2024-gift-of-the-depths', name: '深海馈赠', englishName: 'Gift of the Depths',
    description: '【被动】你可在水下呼吸并获得等于速度的游泳速度；还可无需法术位施展一次水下呼吸，每次长休恢复。',
    status: 'implemented', sourceIds, minimumLevel: 5,
  },
  {
    id: 'invocation-2024-investment-of-the-chain-master', name: '链主赋能', englishName: 'Investment of the Chain Master',
    description: '【契约】施展寻获魔宠时注能魔宠：40 尺飞行或游泳速度、附赠动作指挥攻击、伤害可改为光耀／暗蚀、使用你的法术豁免 DC，并可用反应给予伤害抗性。',
    status: 'implemented', sourceIds, minimumLevel: 5, requiredOptionIds: [PACT_OF_THE_CHAIN],
  },
  {
    id: 'invocation-2024-master-of-myriad-forms', name: '万形之主', englishName: 'Master of Myriad Forms',
    description: '【任意施法】你可以无需法术位施展变身术。',
    status: 'implemented', sourceIds, minimumLevel: 5,
  },
  {
    id: 'invocation-2024-one-with-shadows', name: '融身入影', englishName: 'One with Shadows',
    description: '【任意施法】身处微光或黑暗时，可以无需法术位对自身施展隐形术。',
    status: 'implemented', sourceIds, minimumLevel: 5,
  },
  {
    id: 'invocation-2024-thirsting-blade', name: '饥渴魔刃', englishName: 'Thirsting Blade',
    description: '【契约】获得额外攻击特性（仅限契约武器）：执行攻击动作时可用该武器攻击两次。',
    status: 'implemented', sourceIds, minimumLevel: 5, requiredOptionIds: [PACT_OF_THE_BLADE],
  },
  {
    id: 'invocation-2024-whispers-of-the-grave', name: '坟茔殁语', englishName: 'Whispers of the Grave',
    description: '【任意施法】你可以无需法术位施展死者交谈。',
    status: 'implemented', sourceIds, minimumLevel: 7,
  },
  {
    id: 'invocation-2024-lifedrinker', name: '饮命者', englishName: 'Lifedrinker',
    description: '【契约】每回合一次，契约武器命中时额外造成 1d6 暗蚀／心灵／光耀伤害（任选），可投掷并消耗一颗生命骰，恢复骰值＋体质调整值（至少 1）的生命。',
    status: 'implemented', sourceIds, minimumLevel: 9, requiredOptionIds: [PACT_OF_THE_BLADE],
  },
  {
    id: 'invocation-2024-gift-of-the-protectors', name: '守护馈赠', englishName: 'Gift of the Protectors',
    description: '【契约】影之书中出现一页守护名录：至多等于魅力调整值数量的生物可署名；署名者生命降至 0 且未立即死亡时生命变为 1（每次长休至多触发一次）。可用魔法动作触摸移除名字。',
    status: 'implemented', sourceIds, minimumLevel: 9, requiredOptionIds: [PACT_OF_THE_TOME],
  },
  {
    id: 'invocation-2024-visions-of-distant-realms', name: '穹宇尽视', englishName: 'Visions of Distant Realms',
    description: '【任意施法】你可以无需法术位施展秘法眼。',
    status: 'implemented', sourceIds, minimumLevel: 9,
  },
  {
    id: 'invocation-2024-devouring-blade', name: '灭世魔刃', englishName: 'Devouring Blade',
    description: '【契约】饥渴魔刃提供的额外攻击次数提升为两次（合计每回合三次契约武器攻击）。',
    status: 'implemented', sourceIds, minimumLevel: 12, requiredOptionIds: [THIRSTING_BLADE],
  },
  {
    id: 'invocation-2024-witch-sight', name: '巫术视界', englishName: 'Witch Sight',
    description: '【被动】你具有 30 尺真实视觉。',
    status: 'implemented', sourceIds, minimumLevel: 15,
  },
]
