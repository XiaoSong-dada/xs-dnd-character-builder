import type { FeatRule } from '@/types/rules'

/**
 * 《瓦尔达的秘密尖塔》(Valda's Spire of Secrets) 第三方专长（2024 口径，14 条）。
 *
 * 收录范围（依本批候选清单）：
 * - 玩家包Ⅰ 4 条：残暴之握、战地指挥、专注重击、铁血英雄；
 * - 玩家包Ⅱ 8 条：魔宠守护者、灵活施法者、魔法技师、代谢魔法、纵火狂、突击队员、表演家、秘法剑使；
 * - 铳士章节 3 条：神射吉运、魔枪掌控、铁血英雄。
 * 「铁血英雄」在玩家包Ⅰ与铳士两处重复且正文一致，仅登记一次，故合计 14 条。
 * 「突击队员 Shock Trooper」初次标题抽取时因加粗标记未同行闭合而遗漏，本次按同一口径补入。
 *
 * 登记口径：
 * - 14 条在原书均标注「通用专长 General Feats」，故 `category` 一律为 `general`、`tags` 一律为「通用」；
 * - 来源 `source-2024-tp-valdas-spire` 为第三方内容，默认关闭、需 DM 同意，条目状态统一 `selectable`；
 * - 稳定 ID 前缀 `feat-2024-tp-vss-`，与 PHB／UA 及其他第三方专长 ID 隔离；
 * - `description` 为 20—40 字一句话概括；`detail` 为 60—160 字原创中文转述，
 *   写清前置、属性值提升、关键数值、可用次数与恢复方式，不逐句照抄资料；
 * - 前置按资料登记：等级下限 4 级一律登记，属性下限 13 登记进 `abilityMinimum`，
 *   「施法特性」「施法或契约魔法特性」分别登记为 `spellcasting` 与 `spellcasting-or-pact`；资料未写者省略；
 * - 表格、清单页与专长清单引导语不登记为条目；
 * - 需玩家取舍的内容不建 RuleOption、不设 `choices`／`optionIds`，只写入 `detail`：
 *   戏法自选（秘法剑使、魔枪掌控）、「扩展法术列表中选择熟练加值道法术始终准备」（魔枪掌控）、
 *   以及施法属性的三选一；「远程军用武器熟练」现有 `weaponTraining` 只能按整个军用类别或指定武器 ID 表达，
 *   无法只覆盖远程军用武器，为避免超授熟练同样只写入 `detail`；
 * - 固定授予的法术用 `grantedSpells` 登记，且只引用 2024 法术 ID（本批为 `spell-2024-find-familiar`、
 *   `spell-2024-fire-bolt`、`spell-2024-burning-hands`、`spell-2024-scorching-ray`）；
 *   本书自有的铳士与剑刃系法术在项目内只登记于 2014 法术目录（`spells-2014.ts`），不跨版式引用，故只写入 `detail`。
 */

const VALDAS_SPIRE = ['source-2024-tp-valdas-spire'] as const

interface FeatSeed {
  readonly slug: string
  readonly name: string
  readonly englishName: string
  readonly description: string
  readonly detail: string
  readonly prerequisite?: FeatRule['prerequisite']
  readonly grantedSpells?: FeatRule['grantedSpells']
}

const level4 = { minimumLevel: 4 } as const

const seeds: readonly FeatSeed[] = [
  // ===== 玩家包Ⅰ =====
  {
    slug: 'brutal-grip',
    name: '残暴之握',
    englishName: 'Brutal Grip',
    description: '力量 +1；你能单手持用双手武器，并把持用的多用武器视为轻型武器。',
    detail: '通用专长（先决：等级 4+，力量 13+）。属性值提升：力量提升 1，至多 20。重武决斗者：具有双手词条的近战武器，你也能仅以单手持用并正常攻击。多用双持者：你单手持用具有多用词条的近战武器期间，该武器对你而言具有轻型词条，因而能用于双武器战斗。',
    prerequisite: { ...level4, abilityMinimum: { anyOf: ['str'], score: 13 } },
  },
  {
    slug: 'field-commander',
    name: '战地指挥',
    englishName: 'Field Commander',
    description: '魅力 +1；以动作命令盟友用反应行动，与盟友并肩时敌人攻击你无优势。',
    detail: '通用专长（先决：等级 4+，魅力 13+）。属性值提升：魅力提升 1，至多 20。临阵指挥：你能以动作命令 60 尺内一名能听见你的盟友，其立即以反应执行一次攻击（仅限一次攻击）、疾走、回避、躲藏、影响、搜索、研究或操作动作。严密阵型：当你位于两名或更多未失能盟友的 5 尺内时，敌人对你的攻击检定不能具有优势。',
    prerequisite: { ...level4, abilityMinimum: { anyOf: ['cha'], score: 13 } },
  },
  {
    slug: 'focused-critical',
    name: '专注重击',
    englishName: 'Focused Critical',
    description: '力量或敏捷 +1；以武器或徒手打击的攻击检定掷出 19 或 20 即为重击。',
    detail: '通用专长（先决：等级 4+）。属性值提升：力量或敏捷提升 1，至多 20。强化重击：你使用武器和徒手打击进行的攻击检定，只要 d20 掷出 19 或 20 即可造成重击，你的重击范围由此扩大一档。',
    prerequisite: level4,
  },
  {
    slug: 'iron-hero',
    name: '铁血英雄',
    englishName: 'Iron Hero',
    description: '力量或敏捷 +1；面对更强敌人时 AC 提高，可为盟友复仇并阻止传奇动作。',
    detail: '通用专长（先决：等级 4+）。属性值提升：力量或敏捷 +1（上限 20）。弱者决心：攻击你的生物挑战等级高于你时，你对抗该次攻击的护甲等级 +2。复仇打击：若生物在你上个回合结束后使你一名盟友生命值降为 0，你对其攻击检定具有优势。英雄干预：可见的敌人执行传奇动作时，你能以反应阻止该动作，次数等于熟练加值，长休后重获。',
    prerequisite: level4,
  },

  // ===== 玩家包Ⅱ =====
  {
    slug: 'familiar-keeper',
    name: '魔宠守护者',
    englishName: 'Familiar Keeper',
    description: '智力、感知或魅力 +1；始终准备寻获魔宠，可选特殊形态并干扰敌人攻击。',
    detail: '通用专长（先决：等级 4+）。属性值提升：智力、感知或魅力 +1（上限 20）。寻获魔宠：始终准备；你可用魔法动作免法术位与材料施展一次，长休后才能再用，施法属性自选。扩展选项：可选小魔鬼、伪龙、小恶魔、求索斯芬克斯或小仙灵。魔宠干扰：魔宠 5 尺内的生物攻击时，你可反应令该攻击具有劣势，次数等于熟练加值，长休后恢复。',
    prerequisite: level4,
    grantedSpells: [{ spellId: 'spell-2024-find-familiar', alwaysPrepared: true, freeCastings: 1, recovery: 'long-rest' }],
  },
  {
    slug: 'flex-caster',
    name: '灵活施法者',
    englishName: 'Flex Caster',
    description: '智力、感知或魅力 +1；可额外耗法术位提升环阶，也能降环施法换回一环位。',
    detail: '通用专长（先决：等级 4+，施法特性）。属性值提升：智力、感知或魅力 +1，至多 20。升环施法：施展法术时，你可额外消耗一个法术位，使该法术的有效环阶提高 1，最高至九环。降环施法：当你以高于基础环阶的法术位施展法术时，可改为按基础环阶生效并回收多余能量，恢复一个已消耗的一环法术位。',
    prerequisite: { ...level4, requiredCapability: 'spellcasting' },
  },
  {
    slug: 'magitechnician',
    name: '魔法技师',
    englishName: 'Magitechnician',
    description: '智力、感知或魅力 +1；提高魔法物品豁免 DC，并可在短休为其充能。',
    detail: '通用专长（先决：等级 4+）。属性值提升：智力、感知或魅力 +1（上限 20）。魔法物品专家：你的魔法物品若要求豁免，其 DC 取 8 + 本专长提升属性的调整值 + 熟练加值，且不低于原 DC。魔法物品充能：完成短休时，你可为一件恢复充能或特性的魔法物品充能，视同下个黎明已至；此增益一经使用，须完成长休才能再次使用。',
    prerequisite: level4,
  },
  {
    slug: 'metabolic-magic',
    name: '代谢魔法',
    englishName: 'Metabolic Magic',
    description: '智力、感知或魅力 +1；可耗法术位为失败检定加值，或以生命骰换回法术位。',
    detail: '通用专长（先决：等级 4+，施法或契约魔法特性）。属性值提升：智力、感知或魅力 +1（上限 20）。奥术技艺：你一次 D20 检定失败时，可消耗一个法术位使该检定获得 2 + 该法术位环阶的加值。生命燃料：短休时你可消耗至多等于熟练加值数量的生命骰，恢复环阶总和不高于所耗骰数的法术位；此增益用后须完成长休才能再用。',
    prerequisite: { ...level4, requiredCapability: 'spellcasting-or-pact' },
  },
  {
    slug: 'pyromaniac',
    name: '纵火狂',
    englishName: 'Pyromaniac',
    description: '智力、感知或魅力 +1；习得火焰戏法与两道火焰法术，火焰伤害骰可滚雪球。',
    detail: '通用专长（先决：等级 4+）。属性值提升：智力、感知或魅力 +1（上限 20）。纵火魔法：习得戏法火焰箭，始终准备燃烧之手与灼热射线；后两者各可免法术位施展一次，长休后才能对同一法术再用，也能以相应环阶法术位施展；施法属性为所提升属性。烈焰爆发：造成火焰伤害时，伤害骰掷出最大值即可再掷一枚累加，追加骰数不超过熟练加值。',
    prerequisite: level4,
    grantedSpells: [
      { spellId: 'spell-2024-fire-bolt', alwaysPrepared: true },
      { spellId: 'spell-2024-burning-hands', alwaysPrepared: true, freeCastings: 1, recovery: 'long-rest' },
      { spellId: 'spell-2024-scorching-ray', alwaysPrepared: true, freeCastings: 1, recovery: 'long-rest' },
    ],
  },
  {
    slug: 'shock-trooper',
    name: '突击队员',
    englishName: 'Shock Trooper',
    description: '力量或敏捷 +1；先攻时可抽出武器立即攻击，战斗首轮速度翻倍。',
    detail: '通用专长（先决：等级 4+，力量或敏捷 13+）。属性值提升：力量或敏捷提升 1，至多提升至 20。先发制人：当你为先攻掷骰且该检定不具有劣势时，可抽出一把武器并用它进行一次攻击。快速推进：每场战斗的第一轮中，你的速度翻倍。',
    prerequisite: { ...level4, abilityMinimum: { anyOf: ['str', 'dex'], score: 13 } },
  },
  {
    slug: 'showman',
    name: '表演家',
    englishName: 'Showman',
    description: '魅力 +1；获得表演熟练或专精，并可以附赠动作嘲讽 15 尺内的敌人。',
    detail: '通用专长（先决：等级 4+，魅力 13+）。属性值提升：魅力提升 1，至多 20。表演专家：你获得表演技能熟练；若已熟练，则改为获得该技能的专精。嘲讽：你能以附赠动作嘲讽 15 尺内一名生物，若目标能听见你（无需听懂），其在下个回合结束前对除你以外生物的下一次攻击检定具有劣势；可用次数等于熟练加值，完成长休后全部重获。',
    prerequisite: { ...level4, abilityMinimum: { anyOf: ['cha'], score: 13 } },
  },
  {
    slug: 'spellblade',
    name: '秘法剑使',
    englishName: 'Spellblade',
    description: '智力、感知或魅力 +1；习得两道剑刃戏法，可用戏法替换攻击并强化命中。',
    detail: '通用专长（先决：等级 4+，智力／感知／魅力 13+）。属性值提升：上述属性之一 +1（上限 20）。剑刃戏法：从疾电剑、烈焰剑、凛霜剑、克敌先击中选两道习得并定施法属性。奥术打击：攻击动作中可用一次攻击施展该戏法。引导攻击：以熟练武器发动力／敏攻击时，检定加所选施法属性调整值，至少 +1，次数等于熟练加值，长休重获。',
    prerequisite: { ...level4, abilityMinimum: { anyOf: ['int', 'wis', 'cha'], score: 13 } },
  },

  // ===== 铳士章节（「铁血英雄」与玩家包Ⅰ重复，已在上方登记，此处不再重复）=====
  {
    slug: 'marksmans-luck',
    name: '神射吉运',
    englishName: "Marksman's Luck",
    description: '敏捷 +1；远程伤害骰可翻面取值，远程重击可令目标速度归零。',
    detail: '通用专长（先决：等级 4+，敏捷 13+）。属性值提升：敏捷提升 1，至多 20。翻转骰面：每回合一次，你以远程武器进行伤害掷骰时，可把其中一枚伤害骰翻为其底面取值（顶面与底面之和比该骰最大值大 1），d4 不可翻转。强化重击：你以远程武器重击命中时，目标速度变为 0，直至其下个回合结束。',
    prerequisite: { ...level4, abilityMinimum: { anyOf: ['dex'], score: 13 } },
  },
  {
    slug: 'gun-mage-adept',
    name: '魔枪掌控',
    englishName: 'Gun-Mage Adept',
    description: '敏捷 +1；获得军用远程武器熟练，习得手指枪并扩充铳士法术列表。',
    detail: '通用专长（先决：等级 4+，施法或契约魔法特性）。属性值提升：敏捷 +1，至多 20。远程武器熟练：你获得军用远程武器熟练。戏法：你习得戏法手指枪。扩展法术列表：反弹道场、斩击弹、加农炮击、咒唤掩体、除你武器、叶忒罗的自动换弹与贯星一条加入你的法术列表；你可从中选择数量等于熟练加值的法术始终准备，升级时可替换一道。',
    prerequisite: { ...level4, requiredCapability: 'spellcasting-or-pact' },
  },
]

export const valdasSpireFeats2024: readonly FeatRule[] = seeds.map((seed) => ({
  id: `feat-2024-tp-vss-${seed.slug}`,
  ruleset: '5e-2024',
  name: seed.name,
  englishName: seed.englishName,
  description: seed.description,
  detail: seed.detail,
  tags: ['通用'],
  category: 'general',
  status: 'selectable',
  sourceIds: VALDAS_SPIRE,
  ...(seed.prerequisite ? { prerequisite: seed.prerequisite } : {}),
  ...(seed.grantedSpells ? { grantedSpells: seed.grantedSpells } : {}),
}))
