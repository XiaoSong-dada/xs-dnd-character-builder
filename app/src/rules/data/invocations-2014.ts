import type { RuleOption } from '@/types/rules'

/**
 * 2014 邪术师魔能祈唤选项（Eldritch Invocations）。
 *
 * 规则：2 级获得 2 项，5／7／9／12／15／18 级各 +1，至 18 级累计 8 项；
 * 先决分三类——等级先决（`minimumLevel`）、魔契先决（`requiredOptionIds`，指向魔契恩泽）、
 * 法术先决（`requiredSpellIds`，如魔能爆系祈唤）；「习得脆弱诅咒、或具有可施加诅咒的特性」
 * 属择一条件，不做自动校验，原文写入描述。
 *
 * 来源：PHB（`phb-2014-index`）、XGtE（`xgte-2017-index`）、TCoE（`tcoe-2020-index`）。
 * 译名基准：《5e 不全书》2026-09-13 版 2014 章节（PHB 3934、XGtE 4430、TCoE 1307）。
 * 摘要为原创中文转述；具体效果以规则来源为准。
 *
 * 规则集：`5e-2014`。共 54 条（PHB 32 + XGtE 14 + TCoE 8）。
 */
const PHB = ['phb-2014-index'] as const
const XGE = ['xgte-2017-index'] as const
const TCE = ['tcoe-2020-index'] as const

/** 魔契恩泽选项 ID（3 级职业特性，与祈唤并列登记）。 */
const PACT_OF_THE_CHAIN = 'pact-chain'
const PACT_OF_THE_BLADE = 'pact-blade'
const PACT_OF_THE_TOME = 'pact-tome'
const PACT_OF_THE_TALISMAN = 'pact-talisman'

/** 法术先决：习得戏法魔能爆。 */
const ELDRITCH_BLAST = ['spell-2014-eldritch-blast'] as const

/** 古老祈唤的保留 ID：首版仅登记 3 条索引，ID 不可变更（旧草稿兼容）。 */
export const INVOCATION_2014_LEGACY_OPTION_IDS: readonly string[] = [
  'invocation-agonizing-blast',
  'invocation-devils-sight',
  'invocation-mask-of-many-faces',
]

export const INVOCATION_2014_OPTION_IDS: readonly string[] = [
  // PHB 2014（32）
  'invocation-agonizing-blast',
  'invocation-2014-armor-of-shadows',
  'invocation-2014-ascendant-step',
  'invocation-2014-beast-speech',
  'invocation-2014-beguiling-influence',
  'invocation-2014-bewitching-whispers',
  'invocation-2014-book-of-ancient-secrets',
  'invocation-2014-chains-of-carceri',
  'invocation-devils-sight',
  'invocation-2014-dreadful-word',
  'invocation-2014-eldritch-sight',
  'invocation-2014-eldritch-spear',
  'invocation-2014-eyes-of-the-rune-keeper',
  'invocation-2014-fiendish-vigor',
  'invocation-2014-gaze-of-two-minds',
  'invocation-2014-lifedrinker',
  'invocation-mask-of-many-faces',
  'invocation-2014-master-of-myriad-forms',
  'invocation-2014-minions-of-chaos',
  'invocation-2014-mire-the-mind',
  'invocation-2014-misty-visions',
  'invocation-2014-one-with-shadows',
  'invocation-2014-otherworldly-leap',
  'invocation-2014-repelling-blast',
  'invocation-2014-sculptor-of-flesh',
  'invocation-2014-sign-of-ill-omen',
  'invocation-2014-thief-of-five-fates',
  'invocation-2014-thirsting-blade',
  'invocation-2014-visions-of-distant-realms',
  'invocation-2014-voice-of-the-chain-master',
  'invocation-2014-whispers-of-the-grave',
  'invocation-2014-witch-sight',
  // XGtE（14）
  'invocation-2014-aspect-of-the-moon',
  'invocation-2014-gift-of-the-ever-living-ones',
  'invocation-2014-grasp-of-hadar',
  'invocation-2014-improved-pact-weapon',
  'invocation-2014-lance-of-lethargy',
  'invocation-2014-cloak-of-flies',
  'invocation-2014-eldritch-smite',
  'invocation-2014-gift-of-the-depths',
  'invocation-2014-maddening-hex',
  'invocation-2014-tomb-of-levistus',
  'invocation-2014-ghostly-gaze',
  'invocation-2014-relentless-hex',
  'invocation-2014-tricksters-escape',
  'invocation-2014-shroud-of-shadow',
  // TCoE（8）
  'invocation-2014-eldritch-mind',
  'invocation-2014-investment-of-the-chain-master',
  'invocation-2014-rebuke-of-the-talisman',
  'invocation-2014-far-scribe',
  'invocation-2014-undying-servitude',
  'invocation-2014-protection-of-the-talisman',
  'invocation-2014-gift-of-the-protectors',
  'invocation-2014-bond-of-the-talisman',
]

/** 各祈唤检查点的选择数量：2 级 2 项，其后 5／7／9／12／15／18 级各 +1，累计 8 项。 */
export const INVOCATION_2014_CHECKPOINTS: readonly { readonly level: number; readonly count: number }[] = [
  { level: 2, count: 2 },
  { level: 5, count: 1 },
  { level: 7, count: 1 },
  { level: 9, count: 1 },
  { level: 12, count: 1 },
  { level: 15, count: 1 },
  { level: 18, count: 1 },
]

/**
 * 祈唤检查点的稳定 ID：2 级沿用首版 ID（旧草稿兼容），其余按等级生成。
 * 检查点构建（`arcane-casters-2014.ts`）与职业特性 `checkpointIds` 共用本函数，避免 ID 逻辑分叉。
 */
export function invocationCheckpointId(level: number): string {
  return level === 2 ? 'warlock-2014-invocations-2' : `warlock-2014-invocations-${level}`
}

/** 7 个祈唤检查点的 ID。 */
export const INVOCATION_2014_CHECKPOINT_IDS: readonly string[] =
  INVOCATION_2014_CHECKPOINTS.map((item) => invocationCheckpointId(item.level))

export const invocations2014: readonly RuleOption[] = [
  // ============ PHB 2014（32 条） ============
  {
    id: 'invocation-agonizing-blast', name: '苦痛魔爆', englishName: 'Agonizing Blast',
    description: '【被动】施展魔能爆命中时，每次伤害掷骰加上你的魅力调整值。先决：已习得戏法魔能爆。',
    status: 'implemented', sourceIds: PHB, requiredSpellIds: ELDRITCH_BLAST,
  },
  {
    id: 'invocation-2014-armor-of-shadows', name: '幽影护甲', englishName: 'Armor of Shadows',
    description: '【任意施法】你可以随意以自身为目标施展法师护甲，无需法术位与材料成分。',
    status: 'implemented', sourceIds: PHB,
  },
  {
    id: 'invocation-2014-ascendant-step', name: '星移步法', englishName: 'Ascendant Step',
    description: '【任意施法】你可以随意以自身为目标施展浮空术，无需法术位与材料成分。',
    status: 'implemented', sourceIds: PHB, minimumLevel: 9,
  },
  {
    id: 'invocation-2014-beast-speech', name: '野兽之语', englishName: 'Beast Speech',
    description: '【任意施法】你可以随意施展动物交谈，无需法术位。',
    status: 'implemented', sourceIds: PHB,
  },
  {
    id: 'invocation-2014-beguiling-influence', name: '诱导话术', englishName: 'Beguiling Influence',
    description: '【被动】你获得欺瞒与游说技能的熟练项。',
    status: 'implemented', sourceIds: PHB,
  },
  {
    id: 'invocation-2014-bewitching-whispers', name: '惑人低语', englishName: 'Bewitching Whispers',
    description: '【长休一次】你可以消耗一枚契约法术位施展强迫术；再次施展须完成一次长休。',
    status: 'implemented', sourceIds: PHB, minimumLevel: 7,
  },
  {
    id: 'invocation-2014-book-of-ancient-secrets', name: '远古奥秘之书', englishName: 'Book of Ancient Secrets',
    description: '【仪式】影之书中记录两道自选的一环仪式法术（可来自任意职业法术列表，不计入已知法术数量）。持书即可将书中法术作为仪式施展。冒险途中可将环阶不超过邪术师等级一半（向上取整）的仪式法术抄录入书，每环耗时 2 小时与价值 50 gp 的珍稀墨水。',
    status: 'implemented', sourceIds: PHB, requiredOptionIds: [PACT_OF_THE_TOME],
  },
  {
    id: 'invocation-2014-chains-of-carceri', name: '卡瑟利之链', englishName: 'Chains of Carceri',
    description: '【任意施法】你可以随意施展定身怪物，但仅限天族、邪魔或元素生物，且无需法术位与材料成分；对同一生物再次使用须完成一次长休。',
    status: 'implemented', sourceIds: PHB, minimumLevel: 15, requiredOptionIds: [PACT_OF_THE_CHAIN],
  },
  {
    id: 'invocation-devils-sight', name: '魔鬼视界', englishName: "Devil's Sight",
    description: '【被动】你在黑暗中拥有 120 尺可视距离，无论其为魔法黑暗还是非魔法黑暗。',
    status: 'implemented', sourceIds: PHB,
  },
  {
    id: 'invocation-2014-dreadful-word', name: '恐惧箴言', englishName: 'Dreadful Word',
    description: '【长休一次】你可以消耗一枚契约法术位施展困惑术；再次施展须完成一次长休。',
    status: 'implemented', sourceIds: PHB, minimumLevel: 7,
  },
  {
    id: 'invocation-2014-eldritch-sight', name: '魔能视界', englishName: 'Eldritch Sight',
    description: '【任意施法】你可以随意施展侦测魔法，无需法术位。',
    status: 'implemented', sourceIds: PHB,
  },
  {
    id: 'invocation-2014-eldritch-spear', name: '魔能长枪', englishName: 'Eldritch Spear',
    description: '【被动】你施展魔能爆时，其射程提升为 300 尺。先决：已习得戏法魔能爆。',
    status: 'implemented', sourceIds: PHB, requiredSpellIds: ELDRITCH_BLAST,
  },
  {
    id: 'invocation-2014-eyes-of-the-rune-keeper', name: '符文守护者之眼', englishName: 'Eyes of the Rune Keeper',
    description: '【被动】你可以读懂任何文字。',
    status: 'implemented', sourceIds: PHB,
  },
  {
    id: 'invocation-2014-fiendish-vigor', name: '邪魔活力', englishName: 'Fiendish Vigor',
    description: '【任意施法】你可以随意施展一环法术虚假生命，无需法术位与材料成分。',
    status: 'implemented', sourceIds: PHB,
  },
  {
    id: 'invocation-2014-gaze-of-two-minds', name: '共视感官', englishName: 'Gaze of Two Minds',
    description: '【主动】以动作触碰一个自愿的类人生物建立感官连接，持续至你的下回合结束；其间可用动作维持连接。以对方感官观察时获得其全部特殊感官，但你对自身所处环境视为目盲与耳聋。',
    status: 'implemented', sourceIds: PHB,
  },
  {
    id: 'invocation-2014-lifedrinker', name: '饮命者', englishName: 'Lifedrinker',
    description: '【被动】你以契约武器命中生物时，额外造成等于你魅力调整值的暗蚀伤害（至少 1 点）。',
    status: 'implemented', sourceIds: PHB, minimumLevel: 12, requiredOptionIds: [PACT_OF_THE_BLADE],
  },
  {
    id: 'invocation-mask-of-many-faces', name: '千面之脸', englishName: 'Mask of Many Faces',
    description: '【任意施法】你可以随意施展易容术，无需法术位。',
    status: 'implemented', sourceIds: PHB,
  },
  {
    id: 'invocation-2014-master-of-myriad-forms', name: '万形之主', englishName: 'Master of Myriad Forms',
    description: '【任意施法】你可以随意施展变身术，无需法术位。',
    status: 'implemented', sourceIds: PHB, minimumLevel: 15,
  },
  {
    id: 'invocation-2014-minions-of-chaos', name: '混沌手下', englishName: 'Minions of Chaos',
    description: '【长休一次】你可以消耗一枚契约法术位施展元素咒唤术；再次施展须完成一次长休。',
    status: 'implemented', sourceIds: PHB, minimumLevel: 9,
  },
  {
    id: 'invocation-2014-mire-the-mind', name: '心灵泥沼', englishName: 'Mire the Mind',
    description: '【长休一次】你可以消耗一枚契约法术位施展缓慢术；再次施展须完成一次长休。',
    status: 'implemented', sourceIds: PHB, minimumLevel: 5,
  },
  {
    id: 'invocation-2014-misty-visions', name: '迷雾幻影', englishName: 'Misty Visions',
    description: '【任意施法】你可以随意施展无声幻影，无需法术位与材料成分。',
    status: 'implemented', sourceIds: PHB,
  },
  {
    id: 'invocation-2014-one-with-shadows', name: '融身入影', englishName: 'One with Shadows',
    description: '【主动】身处微光或黑暗环境时，你可以用动作进入隐形，效果持续至你移动、执行动作或执行反应时终止。',
    status: 'implemented', sourceIds: PHB, minimumLevel: 5,
  },
  {
    id: 'invocation-2014-otherworldly-leap', name: '超凡跳跃', englishName: 'Otherworldly Leap',
    description: '【任意施法】你可以随意以自身为目标施展跳跃术，无需法术位与材料成分。',
    status: 'implemented', sourceIds: PHB, minimumLevel: 9,
  },
  {
    id: 'invocation-2014-repelling-blast', name: '斥力魔爆', englishName: 'Repelling Blast',
    description: '【被动】你施展魔能爆命中生物时，可将其沿直线推离你至多 10 尺。先决：已习得戏法魔能爆。',
    status: 'implemented', sourceIds: PHB, requiredSpellIds: ELDRITCH_BLAST,
  },
  {
    id: 'invocation-2014-sculptor-of-flesh', name: '重塑血肉', englishName: 'Sculptor of Flesh',
    description: '【长休一次】你可以消耗一枚契约法术位施展变形术；再次施展须完成一次长休。',
    status: 'implemented', sourceIds: PHB, minimumLevel: 7,
  },
  {
    id: 'invocation-2014-sign-of-ill-omen', name: '凶兆符记', englishName: 'Sign of Ill Omen',
    description: '【长休一次】你可以消耗一枚契约法术位施展降咒；再次施展须完成一次长休。',
    status: 'implemented', sourceIds: PHB, minimumLevel: 5,
  },
  {
    id: 'invocation-2014-thief-of-five-fates', name: '五运窃贼', englishName: 'Thief of Five Fates',
    description: '【长休一次】你可以消耗一枚契约法术位施展灾祸术；再次施展须完成一次长休。',
    status: 'implemented', sourceIds: PHB,
  },
  {
    id: 'invocation-2014-thirsting-blade', name: '饥渴魔刃', englishName: 'Thirsting Blade',
    description: '【契约】你在自己回合内以契约武器执行攻击动作时，可以发动两次攻击而非一次。',
    status: 'implemented', sourceIds: PHB, minimumLevel: 5, requiredOptionIds: [PACT_OF_THE_BLADE],
  },
  {
    id: 'invocation-2014-visions-of-distant-realms', name: '穹宇尽视', englishName: 'Visions of Distant Realms',
    description: '【任意施法】你可以随意施展秘法眼，无需法术位。',
    status: 'implemented', sourceIds: PHB, minimumLevel: 15,
  },
  {
    id: 'invocation-2014-voice-of-the-chain-master', name: '缚主之音', englishName: 'Voice of the Chain Master',
    description: '【被动】只要你与魔宠处于同一位面，就可以用心灵感应与其交流并使用其感官感知世界；以魔宠感官观察时，你可以用自己的声音通过魔宠说话，不论魔宠本身能否说话。',
    status: 'implemented', sourceIds: PHB, requiredOptionIds: [PACT_OF_THE_CHAIN],
  },
  {
    id: 'invocation-2014-whispers-of-the-grave', name: '坟墓低语', englishName: 'Whispers of the Grave',
    description: '【任意施法】你可以随意施展死者交谈，无需法术位。',
    status: 'implemented', sourceIds: PHB, minimumLevel: 9,
  },
  {
    id: 'invocation-2014-witch-sight', name: '巫术视界', englishName: 'Witch Sight',
    description: '【被动】30 尺内你视线中的变形生物，以及由幻术与变化系魔法改变形态的生物，你都能直接看出其真实形态。',
    status: 'implemented', sourceIds: PHB, minimumLevel: 15,
  },

  // ============ XGtE（14 条） ============
  {
    id: 'invocation-2014-aspect-of-the-moon', name: '月之仪态', englishName: 'Aspect of the Moon',
    description: '【被动】你不再需要睡眠，也无法被以任何方式强制入睡。为获得长休的益处，你可以在 8 小时内进行阅读影之书、放哨等轻度活动。',
    status: 'implemented', sourceIds: XGE, requiredOptionIds: [PACT_OF_THE_TOME],
  },
  {
    id: 'invocation-2014-gift-of-the-ever-living-ones', name: '永生者赠礼', englishName: 'Gift of the Ever-Living Ones',
    description: '【被动】只要魔宠与你相距不超过 100 尺，所有决定你恢复生命值点数的骰都视为掷出最大值。',
    status: 'implemented', sourceIds: XGE, requiredOptionIds: [PACT_OF_THE_CHAIN],
  },
  {
    id: 'invocation-2014-grasp-of-hadar', name: '哈达之攫', englishName: 'Grasp of Hadar',
    description: '【被动】每个你的回合一次，当你以魔能爆命中一个生物时，可令其沿直线向你移动 10 尺。先决：已习得戏法魔能爆。',
    status: 'implemented', sourceIds: XGE, requiredSpellIds: ELDRITCH_BLAST,
  },
  {
    id: 'invocation-2014-improved-pact-weapon', name: '进阶契约武器', englishName: 'Improved Pact Weapon',
    description: '【契约】刃之魔契召唤出的武器可作为你施展邪术师法术的法器；若契约武器本身没有攻击检定与伤害加值，它获得 +1 加值；塑造新武器时还可选择短弓、长弓、轻弩或重弩。',
    status: 'implemented', sourceIds: XGE, requiredOptionIds: [PACT_OF_THE_BLADE],
  },
  {
    id: 'invocation-2014-lance-of-lethargy', name: '怠惰之枪', englishName: 'Lance of Lethargy',
    description: '【被动】每个你的回合一次，当你以魔能爆命中一个生物时，可令其速度降低 10 尺，持续至你的下回合结束。先决：已习得戏法魔能爆。',
    status: 'implemented', sourceIds: XGE, requiredSpellIds: ELDRITCH_BLAST,
  },
  {
    id: 'invocation-2014-cloak-of-flies', name: '飞蝇斗篷', englishName: 'Cloak of Flies',
    description: '【主动】以附赠动作唤起环绕自身的蚊蝇灵光（以你为中心 5 尺，不穿透全身掩护），持续至你失能或主动解消。灵光内你在魅力（威吓）检定上具有优势、其他魅力检定具有劣势；在灵光内开始回合的生物受到等于你魅力调整值的毒素伤害（最低 0 点）。使用后须完成一次短休或长休才能再次使用。',
    status: 'implemented', sourceIds: XGE, minimumLevel: 5,
  },
  {
    id: 'invocation-2014-eldritch-smite', name: '魔能斩', englishName: 'Eldritch Smite',
    description: '【契约】每回合一次，当你以契约武器命中生物时，可消耗一枚契约法术位，额外造成 1d8 加上每法术位等级 1d8 的力场伤害；目标体型不超过巨型时还可令其陷入倒地。',
    status: 'implemented', sourceIds: XGE, minimumLevel: 5, requiredOptionIds: [PACT_OF_THE_BLADE],
  },
  {
    id: 'invocation-2014-gift-of-the-depths', name: '深海馈赠', englishName: 'Gift of the Depths',
    description: '【被动】你可以在水下呼吸，并获得等于步行速度的游泳速度。此外可无需法术位施展一次水下呼吸，每次长休恢复。',
    status: 'implemented', sourceIds: XGE, minimumLevel: 5,
    grantedSpells: [{ spellId: 'spell-2014-water-breathing', freeCastings: 1, recovery: 'long-rest' }],
  },
  {
    id: 'invocation-2014-maddening-hex', name: '癫狂巫咒', englishName: 'Maddening Hex',
    description: '【主动】以附赠动作对受你法术脆弱诅咒或凶兆符记等诅咒效应的目标施加精神干扰：对目标及周围 5 尺内由你选定的生物造成等于你魅力调整值的心灵伤害（最低 1 点）。你必须能看到受咒目标且与其相距不超过 30 尺。先决：已习得法术脆弱诅咒，或具有可施加诅咒的邪术师特性。',
    status: 'implemented', sourceIds: XGE, minimumLevel: 5,
  },
  {
    id: 'invocation-2014-tomb-of-levistus', name: '莱维斯图斯之墓', englishName: 'Tomb of Levistus',
    description: '【反应】受到伤害时，你可以用反应将自身封锁在冰墓中至你的下回合结束：获得每邪术师等级 10 点临时生命值，优先抵消触发此反应的伤害；随后获得火焰伤害易伤、速度降为 0 且陷入失能，直至冰墓融解。使用后须完成一次短休或长休才能再次使用。',
    status: 'implemented', sourceIds: XGE, minimumLevel: 5,
  },
  {
    id: 'invocation-2014-ghostly-gaze', name: '幽魂凝视', englishName: 'Ghostly Gaze',
    description: '【主动】以动作获得看穿 30 尺内固态物件的能力；若你本无黑暗视觉，同时获得同范围的黑暗视觉。持续至多 1 分钟，需保持专注。使用后须完成一次短休或长休才能再次使用。',
    status: 'implemented', sourceIds: XGE, minimumLevel: 7,
  },
  {
    id: 'invocation-2014-relentless-hex', name: '残酷巫咒', englishName: 'Relentless Hex',
    description: '【主动】以附赠动作传送至受你法术脆弱诅咒或凶兆符记等诅咒效应的目标周围 5 尺内一处你可见且未被占据的空间，传送距离至多 30 尺。你必须能看到该受咒目标。先决：已习得法术脆弱诅咒，或具有可施加诅咒的邪术师特性。',
    status: 'implemented', sourceIds: XGE, minimumLevel: 7,
  },
  {
    id: 'invocation-2014-tricksters-escape', name: '诡术师的逃脱术', englishName: "Trickster's Escape",
    description: '【长休一次】你可以以自身为目标无需法术位施展一次行动自如，每次长休恢复。',
    status: 'implemented', sourceIds: XGE, minimumLevel: 7,
    grantedSpells: [{ spellId: 'spell-2014-freedom-of-movement', freeCastings: 1, recovery: 'long-rest' }],
  },
  {
    id: 'invocation-2014-shroud-of-shadow', name: '阴影环绕', englishName: 'Shroud of Shadow',
    description: '【任意施法】你可以随意施展隐形术，无需法术位。',
    status: 'implemented', sourceIds: XGE, minimumLevel: 15,
  },

  // ============ TCoE（8 条） ============
  {
    id: 'invocation-2014-eldritch-mind', name: '魔能意志', englishName: 'Eldritch Mind',
    description: '【被动】你为保持法术专注所进行的体质豁免具有优势。',
    status: 'implemented', sourceIds: TCE,
  },
  {
    id: 'invocation-2014-investment-of-the-chain-master', name: '链主赋能', englishName: 'Investment of the Chain Master',
    description: '【契约】施展寻获魔宠时向魔宠灌注魔能力量：其获得 40 尺飞行或游泳速度（由你选择）；你可以用附赠动作指挥它执行攻击动作；其武器攻击视为魔法性；其迫使的豁免检定使用你的法术豁免 DC；其受到伤害时你可使用反应给予它对该次伤害的抗性。',
    status: 'implemented', sourceIds: TCE, requiredOptionIds: [PACT_OF_THE_CHAIN],
  },
  {
    id: 'invocation-2014-rebuke-of-the-talisman', name: '符令责斥', englishName: 'Rebuke of the Talisman',
    description: '【反应】护符佩戴者被 30 尺内你能看见的攻击者命中时，你可以用反应对该攻击者造成等于你熟练加值的心灵伤害，并将其推离护符佩戴者至多 10 尺。',
    status: 'implemented', sourceIds: TCE, requiredOptionIds: [PACT_OF_THE_TALISMAN],
  },
  {
    id: 'invocation-2014-far-scribe', name: '遥远音讯', englishName: 'Far Scribe',
    description: '【被动】影之书中出现一张新书页：经你允许，一个生物可以用动作署名，页上可容纳的名字数量等于你的熟练加值。你可以页上署名的生物为目标施展短讯术，无需法术位与材料成分，但须将传讯写在书页上；对方的回复会出现在书页上并在 1 分钟后消失。你也可以用动作触摸书页，魔法性地抹去一个名字。',
    status: 'implemented', sourceIds: TCE, minimumLevel: 5, requiredOptionIds: [PACT_OF_THE_TOME],
  },
  {
    id: 'invocation-2014-undying-servitude', name: '永恒奴役', englishName: 'Undying Servitude',
    description: '【长休一次】你可以无需法术位施展一次活化死尸；以此方式施展后，须完成一次长休才能再次使用。',
    status: 'implemented', sourceIds: TCE, minimumLevel: 5,
    grantedSpells: [{ spellId: 'spell-2014-animate-dead', freeCastings: 1, recovery: 'long-rest' }],
  },
  {
    id: 'invocation-2014-protection-of-the-talisman', name: '护符庇佑', englishName: 'Protection of the Talisman',
    description: '【被动】护符佩戴者豁免检定失败时，可以在掷骰结果上增加一个 d4，这可能将失败变为成功。可使用的次数等于你的熟练加值，完成一次长休后全部恢复。',
    status: 'implemented', sourceIds: TCE, minimumLevel: 7, requiredOptionIds: [PACT_OF_THE_TALISMAN],
  },
  {
    id: 'invocation-2014-gift-of-the-protectors', name: '守护馈赠', englishName: 'Gift of the Protectors',
    description: '【契约】影之书中出现一张守护名录：经你允许，一个生物可以用动作署名，页上可容纳的名字数量等于你的熟练加值。当署名生物的生命值降为 0 但未立即死亡时，其生命值魔法性地变为 1；该效应一经触发，须待你完成一次长休才能再次触发。你也可以用动作触摸书页抹去一个名字。',
    status: 'implemented', sourceIds: TCE, minimumLevel: 9, requiredOptionIds: [PACT_OF_THE_TOME],
  },
  {
    id: 'invocation-2014-bond-of-the-talisman', name: '护符牵绊', englishName: 'Bond of the Talisman',
    description: '【被动】当护符由你以外的人佩戴时，只要你们处于同一位面，你可以用一个动作传送至其周围未被占据的空间；佩戴者也可以用自己的动作传送至你身边。该传送能力的可使用次数等于你的熟练加值，完成一次长休后全部恢复。',
    status: 'implemented', sourceIds: TCE, minimumLevel: 12, requiredOptionIds: [PACT_OF_THE_TALISMAN],
  },
]

/** 按邪术师等级筛选可选的魔能祈唤（等级先决）。 */
export function invocationIdsAt(level: number): readonly string[] {
  return invocations2014
    .filter((option) => (option.minimumLevel ?? 1) <= level)
    .map((option) => option.id)
}
