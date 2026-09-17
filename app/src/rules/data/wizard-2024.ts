import type { ChoiceCheckpoint, ClassFeature, ClassRule, SubclassFeature, SubclassRule } from '@/types/rules'
import { spells2024 } from '@/rules/data/spells-2024'

/**
 * 2024 法师与塑能师（B08-02）。
 *
 * 规则依据：B01《职业》CF-019—CF-032、《职业-全量》CV-003／CV-004、
 * `docs/classes/subclasses/wizard/wizard.md` 与 `wizard-evoker.md`。
 * 特性 `summary`／`description` 为原创中文转述，只提供选择、展示与校验元数据。
 */
const sourceIds = ['source-2024-phb'] as const

const WIZARD_SKILL_OPTION_IDS = [
  'skill-arcana',
  'skill-history',
  'skill-insight',
  'skill-investigation',
  'skill-medicine',
  'skill-nature',
  'skill-religion',
] as const

/** 学者专精候选：四项知识技能中选一项已熟练的获得专精。 */
const SCHOLAR_OPTION_IDS = ['skill-arcana', 'skill-history', 'skill-nature', 'skill-religion'] as const

// 2024 法师施法表（B01 CF-019 核对）：不复用 2014 常量，按版本独立登记。
const wizardPreparedCounts2024 = [4, 5, 6, 7, 9, 10, 11, 12, 14, 15, 16, 16, 17, 18, 19, 21, 22, 23, 24, 25] as const
const wizardCantrips2024 = [3, 3, 3, 4, 4, 4, 4, 4, 4, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5] as const
const wizardSpellbookCounts2024 = Array.from({ length: 20 }, (_, index) => 6 + index * 2)
const wizardMaxSpellLevels2024 = [1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 9, 9] as const
const wizardSpellSlots2024 = [
  [2],
  [3],
  [4, 2],
  [4, 3],
  [4, 3, 2],
  [4, 3, 3],
  [4, 3, 3, 1],
  [4, 3, 3, 2],
  [4, 3, 3, 3, 1],
  [4, 3, 3, 3, 2],
  [4, 3, 3, 3, 2, 1],
  [4, 3, 3, 3, 2, 1],
  [4, 3, 3, 3, 2, 1, 1],
  [4, 3, 3, 3, 2, 1, 1],
  [4, 3, 3, 3, 2, 1, 1, 1],
  [4, 3, 3, 3, 2, 1, 1, 1],
  [4, 3, 3, 3, 2, 1, 1, 1, 1],
  [4, 3, 3, 3, 3, 1, 1, 1, 1],
  [4, 3, 3, 3, 3, 2, 1, 1, 1],
  [4, 3, 3, 3, 3, 2, 2, 1, 1],
] as const

const wizardClassSpellIds2024 = spells2024
  .filter((spell) => spell.classIds.includes('class-2024-wizard'))
  .map((spell) => spell.id)

/** 奥术回想：可恢复的法术环级总量 = ceil(法师等级／2)，单槽不超过 5 环，每次长休 1 次。 */
const ARCANE_RECOVERY_BUDGET = [1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10] as const

/** 超限导能：14 级获得，每个长休周期首次无副作用，重复使用按环级累积反噬。 */
const OVERCHANNEL_MAX = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1] as const

/** N 级起每次长休 1 次（用于限次子职资源的等级表）。 */
const onceFromLevel = (level: number): readonly number[] =>
  Array.from({ length: 20 }, (_, index) => (index + 1 >= level ? 1 : 0))

export const wizardFeatures2024: readonly ClassFeature[] = [
  {
    id: 'wizard-2024-class-spellcasting', classId: 'class-2024-wizard', name: '施法', englishName: 'Spellcasting', level: 1,
    summary: '智力施法：1 级 3 戏法、法术书 6 道一环法术、准备 4 道；升级入书 2 道，抄录另计。',
    description: '施法属性为智力。1 级时掌握 3 个戏法，在法术书中写下 6 道一环法师法术，并从中准备 4 道。每升一级法师等级，可再往法术书中添加 2 道当前可用环级的法师法术；抄录所得的法术不计入该升级名额。戏法可在完成长休时替换一个；准备法术按职业表数量、完成长休后可更换。',
    kind: 'resource', status: 'implemented', sourceIds,
  },
  {
    id: 'wizard-2024-class-ritual-adept', classId: 'class-2024-wizard', name: '仪式学家', englishName: 'Ritual Adept', level: 1,
    summary: '可从法术书施展带仪式标签的法术，无需事先准备；施展时仍需阅读法术书。',
    description: '法术书中带仪式标签的法术可以不经准备直接以仪式方式施展；施展时需要阅读法术书，且不能替换其他职业的仪式资格。该能力只影响仪式施法，不改变准备数量。',
    kind: 'passive', status: 'implemented', sourceIds,
  },
  {
    id: 'wizard-2024-class-arcane-recovery', classId: 'class-2024-wizard', name: '奥术回想', englishName: 'Arcane Recovery', level: 1,
    summary: '短休后恢复若干法术位，总环级不超过 ceil(等级／2)，单槽不超过 5 环；每次长休 1 次。',
    description: '完成一次短休后，你可以恢复若干已消耗的法术位：所选法术位的环级总和不超过法师等级一半（向上取整），且任何单个法术位不得超过 5 环。使用后需完成长休才能再次使用；该能力恢复的是法术位，不恢复法术以外的资源。',
    kind: 'resource', status: 'implemented', sourceIds,
    resource: { maxByLevel: ARCANE_RECOVERY_BUDGET, recovery: 'long-rest', unit: '环级', note: '单槽不超过 5 环；每次长休可使用 1 次' },
  },
  {
    id: 'wizard-2024-class-scholar', classId: 'class-2024-wizard', name: '学者', englishName: 'Scholar', level: 2,
    summary: '从奥秘、历史、自然、宗教中选择一项已熟练的技能获得专精。',
    description: '从奥秘、历史、自然、宗教中选择一项你已熟练的技能获得专精：使用该技能进行的属性检定可加上双倍熟练加值。不能选择尚未熟练的技能，该选择也不额外授予技能熟练。',
    kind: 'choice', requiresChoice: true, checkpointIds: ['class-2024-wizard-scholar-2'], status: 'implemented', sourceIds,
  },
  {
    id: 'wizard-2024-class-subclass', classId: 'class-2024-wizard', name: '法师子职', englishName: 'Wizard Subclass', level: 3,
    summary: '选择一项法师子职，并在 3、6、10、14 级获得其特性。',
    description: '你在 3 级选择一项法师子职。此后获得该子职的能力，前提是所需等级不超过你的法师等级；法师特性表列出了子职提供新特性的等级。',
    kind: 'choice', requiresChoice: true, checkpointIds: ['class-2024-wizard-subclass-3'], status: 'implemented', sourceIds,
  },
  {
    id: 'wizard-2024-class-memorize-spell', classId: 'class-2024-wizard', name: '记忆法术', englishName: 'Memorize Spell', level: 5,
    summary: '短休后可把书中一道一环以上法术换入准备列表，替换一个已准备法术。',
    description: '完成一次短休后，你可以研读法术书，将其中一道一环或更高环级的法师法术替换掉你当前准备列表中的一道法术。该操作不改变法术书内容，也不等同于重新选择全部准备法术。',
    kind: 'passive', status: 'implemented', sourceIds,
  },
  {
    id: 'wizard-2024-class-spell-mastery', classId: 'class-2024-wizard', name: '法术精通', englishName: 'Spell Mastery', level: 18,
    summary: '从法术书中选一道一环与一道二环法术（须为动作施法），始终准备且最低环免费。',
    description: '从法术书中选择一道一环法术与一道二环法术，两者的施法时间都必须是动作。所选法术始终准备，并且可以不消耗法术位、以最低环级施展；以更高环级施展时仍需消耗相应法术位。完成长休后可以把其中一道替换为同环级、施法时间为动作的书中法术。',
    kind: 'choice', requiresChoice: true, checkpointIds: ['class-2024-wizard-spell-mastery-1', 'class-2024-wizard-spell-mastery-2'], status: 'implemented', sourceIds,
  },
  {
    id: 'wizard-2024-class-epic-boon', classId: 'class-2024-wizard', name: '传奇恩惠', englishName: 'Epic Boon', level: 19,
    summary: '获得一项传奇恩惠专长，或其他一项满足条件的专长。',
    description: '你获得一项传奇恩惠专长，或另一项你选择的、满足条件且适用的专长。该选择与其他属性提升／专长机会相互独立。',
    kind: 'choice', requiresChoice: true, checkpointIds: ['class-2024-wizard-feat-19'], status: 'implemented', sourceIds,
  },
  {
    id: 'wizard-2024-class-signature-spells', classId: 'class-2024-wizard', name: '招牌法术', englishName: 'Signature Spells', level: 20,
    summary: '从法术书中选两道三环法术，始终准备；各可免费施放一次，短休或长休后恢复。',
    description: '从法术书中选择两道三环法师法术，它们始终准备。每道法术各可不消耗法术位、以三环级免费施展一次；该次数在完成短休或长休后恢复，两道法术的次数彼此独立。以更高环级施展时仍需消耗法术位。',
    kind: 'choice', requiresChoice: true, checkpointIds: ['class-2024-wizard-signature-spells-20'], status: 'implemented', sourceIds,
  },
]

export const wizardRule2024: ClassRule = {
  id: 'class-2024-wizard',
  ruleset: '5e-2024',
  name: '法师',
  englishName: 'Wizard',
  summary: '2024版法术书施法者：戏法与准备分离，奥术回想、学者与招牌法术构成成长路线。',
  introduction: '以研究掌握奥术的施法者：法术书持续积累法术、每日更换准备列表，奥术回想补充施法能量，子职决定学派专精方向。',
  hitDie: 6,
  primaryAbilities: ['int'],
  playStyleTags: ['spellcaster', 'control', 'utility'],
  savingThrowAbilities: ['int', 'wis'],
  status: 'implemented',
  sourceIds,
  armorTraining: [],
  weaponTraining: { categories: ['simple'] },
  features: wizardFeatures2024,
  checkpoints: [
    {
      id: 'class-2024-wizard-skills-1', level: 1, step: 'timeline', kind: 'skills',
      title: '选择2项法师技能', description: '从法师技能列表中选择2项。',
      required: true, minSelections: 2, maxSelections: 2, optionIds: WIZARD_SKILL_OPTION_IDS,
    },
    ...([
      { id: 'class-2024-wizard-feat-4', level: 4 },
      { id: 'class-2024-wizard-feat-8', level: 8 },
      { id: 'class-2024-wizard-feat-12', level: 12 },
      { id: 'class-2024-wizard-feat-16', level: 16 },
    ] as const).map(({ id, level }): ChoiceCheckpoint => ({
      id, level, step: 'timeline', kind: 'ability-improvement',
      title: '属性提升或专长', description: '选择属性值提升专长或满足前置的专长。',
      required: true, minSelections: 1, maxSelections: 1, optionIds: [], featCategories: ['general'],
    })),
    {
      id: 'class-2024-wizard-scholar-2', level: 2, step: 'timeline', kind: 'expertise',
      title: '选择学者专精', description: '从奥秘、历史、自然、宗教中选择一项已熟练的技能获得专精。',
      required: true, minSelections: 1, maxSelections: 1, optionIds: SCHOLAR_OPTION_IDS,
    },
    {
      id: 'class-2024-wizard-spell-mastery-1', level: 18, step: 'timeline', kind: 'class-choice',
      title: '选择1个一环法术精通', description: '从法术书中选择一道施法时间为动作的一环法术：始终准备且最低环免费。',
      required: true, minSelections: 1, maxSelections: 1, optionIds: [],
      candidateKind: 'spellbook-level-1', spellCastingTime: '动作', spellGrant: { alwaysPrepared: true },
    },
    {
      id: 'class-2024-wizard-spell-mastery-2', level: 18, step: 'timeline', kind: 'class-choice',
      title: '选择1个二环法术精通', description: '从法术书中选择一道施法时间为动作的二环法术：始终准备且最低环免费。',
      required: true, minSelections: 1, maxSelections: 1, optionIds: [],
      candidateKind: 'spellbook-level-2', spellCastingTime: '动作', spellGrant: { alwaysPrepared: true },
    },
    {
      id: 'class-2024-wizard-feat-19', level: 19, step: 'timeline', kind: 'ability-improvement',
      title: '属性提升或专长', description: '19级可选择传奇恩惠或其他满足前置的专长。',
      required: true, minSelections: 1, maxSelections: 1, optionIds: [], featCategories: ['general', 'epic-boon'],
    },
    {
      id: 'class-2024-wizard-signature-spells-20', level: 20, step: 'timeline', kind: 'class-choice',
      title: '选择2个招牌法术', description: '从法术书中选择两道三环法术：始终准备，各可免费施放一次（短休／长休恢复）。',
      required: true, minSelections: 2, maxSelections: 2, optionIds: [],
      candidateKind: 'spellbook-level-3', spellGrant: { alwaysPrepared: true, freeCastings: 1, recovery: 'short-rest' },
    },
  ],
  spellcasting: {
    ruleset: '5e-2024',
    mode: 'spellbook',
    ability: 'int',
    startsAtLevel: 1,
    preparedCountByLevel: wizardPreparedCounts2024,
    cantripsKnownByLevel: wizardCantrips2024,
    spellbookSpellsByLevel: wizardSpellbookCounts2024,
    maxSpellLevelByClassLevel: wizardMaxSpellLevels2024,
    slotsByClassLevel: wizardSpellSlots2024,
    classSpellIds: wizardClassSpellIds2024,
    ritualCastingFromBook: true,
  },
}

export const wizardSubclassFeatures2024: readonly SubclassFeature[] = [
  {
    id: 'wizard-2024-evoker-evocation-savant', subclassId: 'subclass-2024-wizard-evoker', name: '塑能学者', englishName: 'Evocation Savant', level: 3,
    summary: '额外入书两道不高于二环的塑能系法师法术；此后每获得新环位再额外入书一道该环塑能法术。',
    description: '选择两道不高于二环的塑能系法师法术，免费写入法术书（不占升级入书名额）；此后每当你首次获得一个新的法术环位，再把一道该环级的塑能系法师法术免费写入法术书。额外入书的法术必须在法术步骤中从“塑能额外入书”区域选择，与升级名额、抄录所得分开计数。',
    kind: 'choice', status: 'implemented', sourceIds,
  },
  {
    id: 'wizard-2024-evoker-potent-cantrip', subclassId: 'subclass-2024-wizard-evoker', name: '强力戏法', englishName: 'Potent Cantrip', level: 3,
    summary: '你的伤害戏法即使失手或目标成功豁免，仍造成一半伤害（若有伤害掷骰）。',
    description: '当你施展一道造成伤害的戏法时，若攻击检定失手，或目标成功通过豁免，目标仍受到该戏法伤害的一半（向下取整）。该效果不施加戏法的其他附带效果，也不限于法师戏法。',
    kind: 'passive', status: 'implemented', sourceIds,
  },
  {
    id: 'wizard-2024-evoker-sculpt-spells', subclassId: 'subclass-2024-wizard-evoker', name: '法术塑形', englishName: 'Sculpt Spells', level: 6,
    summary: '施展塑能法术时，可选择至多 1＋法术环级个可见目标，使其自动通过豁免且不受伤害。',
    description: '当你施展一道影响其他生物的塑能法术时，选择数量至多等于 1＋该法术环级的可见生物；这些生物自动通过豁免检定，并在豁免成功通常仍受一半伤害时完全不受伤害。该效果只影响所选目标，其余生物照常结算。',
    kind: 'passive', status: 'implemented', sourceIds,
  },
  {
    id: 'wizard-2024-evoker-empowered-evocation', subclassId: 'subclass-2024-wizard-evoker', name: '强效塑能', englishName: 'Empowered Evocation', level: 10,
    summary: '施展塑能系法师法术时，可为该法术的一次伤害掷骰加上智力调整值。',
    description: '当你施展一道塑能系的法师法术时，可为该法术的其中一次伤害掷骰加上你的智力调整值。同一道法术只加一次，不重复加到每个伤害段；也不扩展到非塑能系的戏法或其他来源。',
    kind: 'passive', status: 'implemented', sourceIds,
  },
  {
    id: 'wizard-2024-evoker-overchannel', subclassId: 'subclass-2024-wizard-evoker', name: '超限导能', englishName: 'Overchannel', level: 14,
    summary: '以 1—5 环法术位施展伤害性法师法术时可使伤害最大化；每个长休周期首次无副作用。',
    description: '当你以 1—5 环的法术位施展一道造成伤害的法师法术时，可以使其伤害掷骰全部取最大值。每个长休周期内首次使用不产生副作用；在此之后、完成长休之前再次使用，则你在施展该法术时受到暗蚀伤害：第二次使用为每环 2d12，其后每次使用在前一次基础上每环再加 1d12。该伤害无视抗性与免疫。',
    kind: 'resource', status: 'implemented', sourceIds,
    resource: { maxByLevel: OVERCHANNEL_MAX, recovery: 'long-rest', note: '长休周期首次无副作用；重复使用按环级累积暗蚀反噬' },
  },

  // ============ 幻术师 ============
  {
    id: 'wizard-2024-illusionist-illusion-savant', subclassId: 'subclass-2024-wizard-illusionist', name: '幻术学者', englishName: 'Illusion Savant', level: 3,
    summary: '额外入书两道不高于二环的幻术系法师法术；此后每获得新环位再额外入书一道该环幻术法术。',
    description: '选择两道不高于二环的幻术系法师法术，免费写入法术书（不占升级入书名额）；此后每当你首次获得一个新的法术环位，再把一道该环级的幻术系法师法术免费写入法术书。额外入书与升级名额、抄录所得分开计数。',
    kind: 'choice', status: 'implemented', sourceIds,
  },
  {
    id: 'wizard-2024-illusionist-improved-illusions', subclassId: 'subclass-2024-wizard-illusionist', name: '强化幻术', englishName: 'Improved Illusions', level: 3,
    summary: '幻术法术施法距离+60 尺；幻术无须言语成分；可免费施展一次无声幻影。',
    description: '你施展施法距离至少 10 尺的幻术系法师法术时，其射程提升 60 尺；你施展幻术系法师法术时可以忽略言语成分；此外，你始终准备着无声幻影，并可无需法术位施展一次（每次长休恢复）。',
    kind: 'passive', status: 'implemented', sourceIds,
    grantedSpells: [{ spellId: 'spell-2024-silent-image', freeCastings: 1, recovery: 'long-rest' }],
  },
  {
    id: 'wizard-2024-illusionist-phantasmal-creatures', subclassId: 'subclass-2024-wizard-illusionist', name: '魅影生灵', englishName: 'Phantasmal Creatures', level: 6,
    summary: '始终准备野兽召唤术与妖精召唤术，可将其视为幻术学派；两道的幻术版本各可免费施展一次（长休恢复，召唤生物半血）。',
    description: '你总是准备了野兽召唤术与妖精召唤术。你施展其中任意一道法术时，可以选择将其学派变为幻术学派，这会使召唤出的生物变得虚幻。你可以不消耗法术位地施展这两道法术的幻术版本各一次，但以此法施展会使其召唤出的生物只有一半生命值。一旦你无需法术位地施展了其中任意一道法术，直至完成长休你都无法再以此法施展那道法术。召唤生物的数据卡未装配前，本条目只登记规则边界，不生成数值。',
    kind: 'passive', status: 'implemented', sourceIds,
    grantedSpells: [
      { spellId: 'spell-2024-summon-beast', freeCastings: 1, recovery: 'long-rest' },
      { spellId: 'spell-2024-summon-fey', freeCastings: 1, recovery: 'long-rest' },
    ],
  },
  {
    id: 'wizard-2024-illusionist-illusory-self', subclassId: 'subclass-2024-wizard-illusionist', name: '幻影化形', englishName: 'Illusory Self', level: 10,
    summary: '被攻击命中时可用反应创造幻影替身使攻击自动失手；每次长休 1 次，可消耗二环及以上法术位重置。',
    description: '当一次攻击检定命中你时，你可以用反应创造一个你自己的幻影替身，使该次攻击自动失手。此特性每次长休 1 次；你也可以消耗一个二环或更高环阶的法术位（无需动作）重置其使用权。',
    kind: 'reaction', status: 'implemented', sourceIds,
    resource: { maxByLevel: onceFromLevel(10), recovery: 'long-rest', note: '每次长休 1 次；可消耗一个二环及以上法术位重置（手动）' },
  },
  {
    id: 'wizard-2024-illusionist-illusory-reality', subclassId: 'subclass-2024-wizard-illusionist', name: '亦真亦幻', englishName: 'Illusory Reality', level: 14,
    summary: '施展幻术时可将其中一个非生物、非物质物件化为真实物件 1 分钟。',
    description: '当你施展一道幻术系法师法术时，可以选择法术中一个非魔法、非生物的物件，使其在法术持续时间内变为真实物件；该物件不能造成伤害或直接伤害他人。',
    kind: 'passive', status: 'implemented', sourceIds,
  },

  // ============ 防护师 ============
  {
    id: 'wizard-2024-abjurer-abjuration-savant', subclassId: 'subclass-2024-wizard-abjurer', name: '防护学者', englishName: 'Abjuration Savant', level: 3,
    summary: '额外入书两道不高于二环的防护系法师法术；此后每获得新环位再额外入书一道该环防护法术。',
    description: '选择两道不高于二环的防护系法师法术，免费写入法术书（不占升级入书名额）；此后每当你首次获得一个新的法术环位，再把一道该环级的防护系法师法术免费写入法术书。额外入书与升级名额、抄录所得分开计数。',
    kind: 'choice', status: 'implemented', sourceIds,
  },
  {
    id: 'wizard-2024-abjurer-arcane-ward', subclassId: 'subclass-2024-wizard-abjurer', name: '奥术守御', englishName: 'Arcane Ward', level: 3,
    summary: '消耗法术位施展防护法术时创造结界：生命值上限＝2×法师等级＋智力调整值；受伤时优先扣结界；防护法术与附赠动作可恢复（各次环级×2）。',
    description: '当你消耗法术位施展一道防护系法术时，可以同时创造一个魔法结界，持续至长休；结界生命值上限等于法师等级的两倍加智力调整值。你受伤时结界先代你承伤并计算你的抗性与易伤；若伤害使结界降至 0，溢出伤害由你承受。每当消耗法术位施展防护系法术时，结界恢复环级×2 的生命；也可以附赠动作消耗一个法术位恢复环级×2。结界一经创建，直至长休前无法再次创建。',
    kind: 'resource', status: 'implemented', sourceIds,
    resource: { maxByLevel: Array.from({ length: 20 }, (_, index) => (index + 1) * 2), abilityBonus: 'int', recovery: 'long-rest', unit: '点结界生命', note: '消耗法术位施展防护法术或附赠动作消耗法术位恢复（环级×2）' },
  },
  {
    id: 'wizard-2024-abjurer-projected-ward', subclassId: 'subclass-2024-wizard-abjurer', name: '投射守御', englishName: 'Projected Ward', level: 6,
    summary: '反应让 30 尺内可见生物受到伤害时由奥术守御吸收；溢伤与抗性按规则处理。',
    description: '当一个 30 尺内你可见的生物受到伤害时，你可以用反应让奥术守御吸收该伤害；若伤害使结界降至 0，被保护生物承受剩余伤害。被保护生物的抗性与易伤在计算结界承伤前先结算。',
    kind: 'reaction', status: 'implemented', sourceIds,
  },
  {
    id: 'wizard-2024-abjurer-spell-breaker', subclassId: 'subclass-2024-wizard-abjurer', name: '破法者', englishName: 'Spell Breaker', level: 10,
    summary: '解除魔法或法术反制成功时，被解除法术的能量可恢复奥术守御等同环级×2 的生命。',
    description: '当你以解除魔法或法术反制成功终止一个法术时，可以使该法术的魔力回流到奥术守御中，恢复等于该法术环级×2 的结界生命值。',
    kind: 'passive', status: 'implemented', sourceIds,
  },
  {
    id: 'wizard-2024-abjurer-spell-resistance', subclassId: 'subclass-2024-wizard-abjurer', name: '法术抗性', englishName: 'Spell Resistance', level: 14,
    summary: '对抗法术的豁免具有优势；对法术伤害具有抗性。',
    description: '你在对抗法术的豁免检定上具有优势；你具有对法术伤害的抗性。',
    kind: 'passive', status: 'implemented', sourceIds,
  },

  // ============ 预言师 ============
  {
    id: 'wizard-2024-diviner-divination-savant', subclassId: 'subclass-2024-wizard-diviner', name: '预言学者', englishName: 'Divination Savant', level: 3,
    summary: '额外入书两道不高于二环的预言系法师法术；此后每获得新环位再额外入书一道该环预言法术。',
    description: '选择两道不高于二环的预言系法师法术，免费写入法术书（不占升级入书名额）；此后每当你首次获得一个新的法术环位，再把一道该环级的预言系法师法术免费写入法术书。额外入书与升级名额、抄录所得分开计数。',
    kind: 'choice', status: 'implemented', sourceIds,
  },
  {
    id: 'wizard-2024-diviner-portent', subclassId: 'subclass-2024-wizard-diviner', name: '预兆', englishName: 'Portent', level: 3,
    summary: '每次长休后掷 2 个 d20 作为预兆骰（14 级高等预兆起 3 个）；可用一颗替换你或可见生物的 d20 检定（每回合一次，掷前决定）。',
    description: '预知未来的片段在你意识中闪过：每次长休后掷两次 d20 并记录为预兆骰。你可以用其中一颗替换你或你可见生物的 d20 检定；必须在检定前宣布，每回合只能替换一次，每颗预兆骰只能使用一次；长休时失去所有未使用的预兆骰。14 级获得高等预兆后，你改为掷三次 d20。',
    kind: 'resource', status: 'implemented', sourceIds,
    resource: { maxByLevel: Array.from({ length: 20 }, (_, index) => (index >= 13 ? 3 : 2)), recovery: 'long-rest', note: '长休后掷 2 个 d20（14 级高等预兆起 3 个）；每回合最多使用一次' },
  },
  {
    id: 'wizard-2024-diviner-expert-divination', subclassId: 'subclass-2024-wizard-diviner', name: '专业预言', englishName: 'Expert Divination', level: 6,
    summary: '以二环或更高法术位施展预言系法师法术时，可恢复一个低于该环级（不超过五环）的已消耗法术位。',
    description: '当你消耗法术位施展一个环阶为二环或更高的预言系法师法术时，可以恢复一个已消耗的法术位：所恢复法术位的环级必须低于你正施展的法术，且不高于五环。',
    kind: 'passive', status: 'implemented', sourceIds,
  },
  {
    id: 'wizard-2024-diviner-the-third-eye', subclassId: 'subclass-2024-wizard-diviner', name: '天眼通', englishName: 'The Third Eye', level: 10,
    summary: '附赠动作获得 120 尺黑暗视觉、读懂任何语言或识破隐形之一，持续至短休或长休；每次短休或长休 1 次。',
    description: '以一个附赠动作，你从以下增益中选择其一，持续至你开始一次短休或长休：黑暗视觉——你具有 120 尺黑暗视觉；高等通晓——你可以读懂任何语言；识破隐形——你可以不消耗法术位地施展识破隐形。此特性一经使用，直至完成短休或长休你都无法再次使用。',
    kind: 'bonus-action', status: 'implemented', sourceIds,
    resource: { maxByLevel: onceFromLevel(10), recovery: 'short-rest', note: '短休或长休后恢复' },
  },
  {
    id: 'wizard-2024-diviner-greater-portent', subclassId: 'subclass-2024-wizard-diviner', name: '高等预兆', englishName: 'Greater Portent', level: 14,
    summary: '每次长休后掷 3 个预兆骰（而非 2 个）。',
    description: '你的预兆能力增强：每次长休后掷三次 d20 并记录为预兆骰，使用规则与预兆相同。',
    kind: 'passive', status: 'implemented', sourceIds,
  },
]

export const wizardSubclasses2024: readonly SubclassRule[] = [{
  id: 'subclass-2024-wizard-evoker',
  classId: 'class-2024-wizard',
  ruleset: '5e-2024',
  name: '塑能师',
  englishName: 'Evoker',
  selectionLevel: 3,
  summary: '专精塑能伤害法术：稳定戏法输出、塑造范围安全区，并在高等级强化伤害与超限爆发。',
  status: 'implemented',
  availability: 'player',
  sourceIds,
  features: wizardSubclassFeatures2024.filter((feature) => feature.subclassId === 'subclass-2024-wizard-evoker'),
  spellbookExtraSpells: { base: 2, perNewSpellLevel: 1, schools: ['塑能'] },
}, {
  id: 'subclass-2024-wizard-illusionist',
  classId: 'class-2024-wizard',
  ruleset: '5e-2024',
  name: '幻术师',
  englishName: 'Illusionist',
  selectionLevel: 3,
  summary: '以幻术欺骗感官：额外入书幻术、强化幻术与幻影替身，高等级让幻象化为真实。',
  status: 'implemented',
  availability: 'player',
  sourceIds,
  features: wizardSubclassFeatures2024.filter((feature) => feature.subclassId === 'subclass-2024-wizard-illusionist'),
  spellbookExtraSpells: { base: 2, perNewSpellLevel: 1, schools: ['幻术'] },
}, {
  id: 'subclass-2024-wizard-abjurer',
  classId: 'class-2024-wizard',
  ruleset: '5e-2024',
  name: '防护师',
  englishName: 'Abjurer',
  selectionLevel: 3,
  summary: '以奥术守御吸收伤害：额外入书防护法术、投射守御与破法者，高等级获得法术抗性。',
  status: 'implemented',
  availability: 'player',
  sourceIds,
  features: wizardSubclassFeatures2024.filter((feature) => feature.subclassId === 'subclass-2024-wizard-abjurer'),
  spellbookExtraSpells: { base: 2, perNewSpellLevel: 1, schools: ['防护'] },
}, {
  id: 'subclass-2024-wizard-diviner',
  classId: 'class-2024-wizard',
  ruleset: '5e-2024',
  name: '预言师',
  englishName: 'Diviner',
  selectionLevel: 3,
  summary: '以预兆骰改写命运：额外入书预言法术、专业预言与天眼通，高等级增加预兆数量。',
  status: 'implemented',
  availability: 'player',
  sourceIds,
  features: wizardSubclassFeatures2024.filter((feature) => feature.subclassId === 'subclass-2024-wizard-diviner'),
  spellbookExtraSpells: { base: 2, perNewSpellLevel: 1, schools: ['预言'] },
}]
