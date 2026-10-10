import { equipment2024 } from '@/rules/data/equipment-2024'
import { SKILL_IDS } from '@/rules/data/skill-ids'
import type { RaceFeature, RaceRule, RuleOption, SpeciesSpellGrant } from '@/types/rules'

const tools = equipment2024.filter((item) => item.category === 'tool' && !['equipment-2024-gaming-set', 'equipment-2024-musical-instrument'].includes(item.id)).map((item) => item.id)
const abilities = ['int', 'wis', 'cha'] as const
const proficiencyUses = { maxByLevel: [2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 6, 6, 6, 6], recovery: 'long-rest', unit: '次' } as const
const once = { maxByLevel: Array.from({ length: 20 }, () => 1), recovery: 'long-rest', unit: '次' } as const
type SpeciesChoice = NonNullable<RaceRule['choices']>[number]
function choice(id: string, title: string, optionIds: readonly string[], extra: Partial<SpeciesChoice> = {}): SpeciesChoice {
  return { id, title, description: title, level: 1, step: 'timeline', kind: 'class-choice', required: true, minSelections: 1, maxSelections: 1, optionIds, ...extra }
}
function cantrip(id: string, defaultSlug: string, classSlugs: readonly string[]): SpeciesChoice {
  return choice(`${id}-cantrip`, '当前戏法（长休后可更换）', [], { required: false, candidateKind: 'spell-pool', spellPool: { level: 0, classIds: classSlugs.map((slug) => `class-2024-${slug}`) }, defaultOptionIds: [`spell-2024-${defaultSlug}`], description: '未更换时使用默认戏法；更换须已完成长休，当前具体选择进入角色卡和导出。' })
}
function spell(slug: string, minimumLevel: number, extra: Partial<SpeciesSpellGrant> = {}): SpeciesSpellGrant {
  return { spellId: `spell-2024-${slug}`, minimumLevel, alwaysPrepared: true, canCastWithSpellSlots: true, ...(minimumLevel > 1 ? { freeCastings: 1, recovery: 'long-rest' as const } : {}), ...extra }
}
function species(book: 'efa' | 'rthw' | 'lfl', slug: string, name: string, englishName: string, description: string, fields: Partial<RaceRule> = {}): RaceRule {
  return { id: `species-2024-${book}-${slug}`, ruleset: '5e-2024', name, englishName, summary: description, description, sourceIds: [`source-2024-${book}`], status: 'implemented', fixedAbilityBonuses: {}, subraceIds: [], recommendedClassIds: [], sizeChoices: ['small', 'medium'], speed: 30, ...fields }
}
const khoravar = 'species-2024-efa-khoravar'
const shifter = 'species-2024-efa-shifter'
const reborn = 'species-2024-rthw-reborn'
const lorwynElf = 'species-2024-lfl-lorwyn-elf-lineage'
const branches = ['beasthide', 'longtooth', 'swiftstride', 'wildhunt'] as const
const fairySpells = [spell('druidcraft', 1), spell('faerie-fire', 3), spell('enlarge-reduce', 5)]

export const officialSpecies2024: readonly RaceRule[] = [
  species('efa', 'changeling', '幻身灵（奇械锻炉）', 'Changeling', '妖精；五技能选二。动作改变外貌和声音，可在小型与中型间变形；变形期间魅力检定优势；不能复制未见外貌，基本肢体结构不变，不改变装备和其他数据。', { skillProficiencyChoices: { count: 2, optionIds: ['skill-deception', 'skill-insight', 'skill-intimidation', 'skill-performance', 'skill-persuasion'] } }),
  species('efa', 'shifter', '化兽者（奇械锻炉）', 'Shifter', '类人生物；黑暗视觉60尺，兽性本能四选一，化兽四选一。', { darkvision: 60, skillProficiencyChoices: { count: 1, optionIds: ['skill-acrobatics', 'skill-athletics', 'skill-intimidation', 'skill-survival'] }, choices: [choice(`${shifter}-shifting-choice`, '选择化兽增益', branches.map((key) => `${shifter}-${key}`))] }),
  species('efa', 'warforged', '战俑（奇械锻炉）', 'Warforged', '构装；常驻AC+1、毒素抗性，中毒豁免优势。一技能与一具体工具。存活时护甲不能被非自愿卸下；6小时静止长休仍清醒，魔法不能催眠；不因脱水、饥饿或窒息获得力竭。', { armorClassBonus: 1, damageResistances: ['毒素'], skillProficiencyChoices: { count: 1 }, toolProficiencyChoices: { count: 1, optionIds: tools, required: true } }),
  species('efa', 'kalashtar', '离梦人', 'Kalashtar', '中型异怪；感知与魅力豁免优势，心灵抗性。心灵感应等级×10尺，魔法动作给予对方互连1小时，可魔法动作结束；不能成为托梦术目标。长休获得一项临时技能熟练，持续到下次长休，仅记录说明。', { sizeChoices: undefined, size: 'medium', damageResistances: ['心灵'] }),
  species('efa', 'khoravar', '科拉瓦', 'Khoravar', '类人生物；黑暗视觉60尺，魅惑豁免优势；妖精赠礼、昏睡抗力、多才多艺。', { darkvision: 60, spellcastingAbilityChoices: abilities, chosenCantripCheckpointId: `${khoravar}-cantrip`, choices: [cantrip(khoravar, 'friends', ['cleric', 'druid', 'wizard']), choice(`${khoravar}-versatility`, '多才多艺：技能或工具', [`${khoravar}-skill`, `${khoravar}-tool`], { description: '选择当前一项熟练，长休后可更换。' }), choice(`${khoravar}-skill-choice`, '当前技能（长休后可更换）', SKILL_IDS, { parentCheckpointId: `${khoravar}-versatility`, parentOptionId: `${khoravar}-skill`, grantsSkillProficiency: true }), choice(`${khoravar}-tool-choice`, '当前工具（长休后可更换）', tools, { parentCheckpointId: `${khoravar}-versatility`, parentOptionId: `${khoravar}-tool`, grantsToolProficiency: true })] }),
  species('rthw', 'lupin', '人狼裔', 'Lupin', '类人生物；黑暗视觉60尺，察觉、隐匿、求生选一；野性扑击与嚎叫。', { darkvision: 60, skillProficiencyChoices: { count: 1, optionIds: ['skill-perception', 'skill-stealth', 'skill-survival'] } }),
  species('rthw', 'dhampir', '半血裔（魔障深藏）', 'Dhampir', '类人生物；步行35尺、攀爬等于步行，黑暗视觉60尺，暗蚀抗性。徒手啮咬伤害为1d4+体质，命中规则不替换；强化只提示。', { speed: 35, climbSpeed: 35, darkvision: 60, damageResistances: ['暗蚀'] }),
  species('rthw', 'reborn', '复生者（魔障深藏）', 'Reborn', '类人生物；死亡豁免优势；4小时静止长休仍清醒，无需睡眠、魔法不能催眠；不因脱水、饥饿或窒息获得力竭。一项技能及一种抗性必选。', { skillProficiencyChoices: { count: 1 }, choices: [choice(`${reborn}-resistance`, '奇异耐性：选择抗性', ['cold', 'necrotic', 'poison'].map((key) => `${reborn}-${key}`), { grantsDamageResistance: { [`${reborn}-cold`]: '寒冷', [`${reborn}-necrotic`]: '暗蚀', [`${reborn}-poison`]: '毒素' } })] }),
  species('rthw', 'hexblood', '巫咒之子（魔障深藏）', 'Hexblood', '妖精；黑暗视觉60尺；神秘信物，易容术与脆弱诅咒各一次长休免费及合适法术位施放；智、感、魅必选，不免成分。', { darkvision: 60, spellcastingAbilityChoices: abilities, spellGrants: [spell('disguise-self', 1, { freeCastings: 1, recovery: 'long-rest' }), spell('hex', 1, { freeCastings: 1, recovery: 'long-rest' })] }),
  species('lfl', 'changeling', '洛温幻身灵', 'Lorwyn Changeling', '妖精；黑暗视觉120尺，表演或欺瞒熟练。动作塑造双足或四足外形；类人外形可穿同体型类人护甲。投先攻且无劣势时可立即移动半速；外形、装备限制与移动只提示。', { darkvision: 120, skillProficiencyChoices: { count: 1, optionIds: ['skill-performance', 'skill-deception'] } }),
  species('lfl', 'rimekin', '霜身', 'Rimekin', '类人生物；黑暗视觉60尺，寒冷抗性。冷冻射线、3级冰刃、5级火焰刀；后两者各一次长休免费及法术位施放。', { darkvision: 60, damageResistances: ['寒冷'], spellcastingAbilityChoices: abilities, spellGrants: [spell('ray-of-frost', 1), spell('ice-knife', 3), spell('flame-blade', 5, { castingNote: '仅通过冷火魔法施放时造成寒冷而非火焰伤害；职业同名法术不受影响。' })] }),
  species('lfl', 'boggart', '波尬', 'Boggart', '小型类人生物，也视为类地精；本书引用MotM地精适配，不提供种族属性或额外语言。黑暗视觉60尺、魅惑豁免优势、小不点之怒、灵巧逃脱。', { sizeChoices: undefined, size: 'small', darkvision: 60 }),
  species('lfl', 'faerie', '仙灵（洛温）', 'Faerie', '小型妖精；按本书引用的MotM仙灵适配。飞行等于步行，中甲或重甲不可飞行；妖精魔法。', { sizeChoices: undefined, size: 'small', flySpeed: 30, spellcastingAbilityChoices: abilities, spellGrants: fairySpells }),
  species('lfl', 'shadowmoor-faerie', '仙灵（影原）', 'Shadowmoor Faerie', '小型妖精；同洛温仙灵魔法及飞行限制，另有120尺黑暗视觉。', { sizeChoices: undefined, size: 'small', flySpeed: 30, darkvision: 120, spellcastingAbilityChoices: abilities, spellGrants: fairySpells }),
  species('lfl', 'flamekin', '炎身', 'Flamekin', '类人生物；本书引用MotM火元素裔适配。黑暗视觉60尺、火焰抗性、燃火术、3级燃烧之手、5级火焰刀。仅种族火焰刀免材料；烬身只是外观变化，不额外授予收益。', { darkvision: 60, damageResistances: ['火焰'], spellcastingAbilityChoices: abilities, spellGrants: [spell('produce-flame', 1), spell('burning-hands', 3), spell('flame-blade', 5, { waivesMaterialComponents: true })] }),
  species('lfl', 'kithkin', '洁英（洛温）', 'Kithkin', '小型类人生物；按2024半身人适配，幸运、勇气、半身人灵巧、天生隐匿。不从叙事推断心灵感应。', { sizeChoices: undefined, size: 'small' }),
  species('lfl', 'shadowmoor-kithkin', '洁英（影原）', 'Shadowmoor Kithkin', '小型类人生物；同2024半身人适配，另有120尺黑暗视觉。', { sizeChoices: undefined, size: 'small', darkvision: 120 }),
  species('lfl', 'lorwyn-elf-lineage', '洛温精灵血系', 'Lorwyn Elf Lineage', '2024精灵分支：默认荆棘之鞭，长休可换德鲁伊戏法；3级命令术、5级沉默术，各一次长休免费及法术位施放。', { parentRaceId: 'species-2024-elf', sizeChoices: undefined, speed: undefined, chosenCantripCheckpointId: `${lorwynElf}-cantrip`, choices: [cantrip(lorwynElf, 'thorn-whip', ['druid'])], spellGrants: [spell('command', 3), spell('silence', 5)] }),
  species('lfl', 'shadowmoor-elf-lineage', '影原精灵血系', 'Shadowmoor Elf Lineage', '2024精灵分支：黑暗视觉120尺，点点星芒、3级英雄气概、5级遗体防腐；后两者各一次长休免费及法术位施放。', { parentRaceId: 'species-2024-elf', sizeChoices: undefined, speed: undefined, darkvision: 120, spellGrants: [spell('starry-wisp', 1), spell('heroism', 3), spell('gentle-repose', 5)] }),
]

function feature(slug: string, key: string, name: string, description: string, fields: Partial<RaceFeature> = {}): RaceFeature {
  const owner = officialSpecies2024.find((item) => item.id === `species-2024-${slug}`)
  if (!owner) throw new Error(`Missing species ${slug}`)
  return { id: `${owner.id}-${key}`, raceId: owner.id, name, englishName: key, level: 1, kind: 'passive', summary: description, description, sourceIds: owner.sourceIds, status: 'implemented', ...fields }
}
export const officialSpeciesOptions2024: readonly RuleOption[] = [
  ...branches.map((key, index) => ({ id: `${shifter}-${key}`, name: ['兽皮', '长牙', '迅捷', '猎食'][index] ?? key, description: '化兽固定增益，临时效果只提示。', status: 'implemented' as const, sourceIds: ['source-2024-efa'] })),
  ...['skill', 'tool'].map((key) => ({ id: `${khoravar}-${key}`, name: key === 'skill' ? '技能熟练' : '工具熟练', description: '当前一项熟练，长休后可更换。', status: 'implemented' as const, sourceIds: ['source-2024-efa'] })),
  ...['cold', 'necrotic', 'poison'].map((key, index) => ({ id: `${reborn}-${key}`, name: `${['寒冷', '暗蚀', '毒素'][index]}抗性`, description: '只获得当前有效选项的抗性。', status: 'implemented' as const, sourceIds: ['source-2024-rthw'] })),
]
export const officialSpeciesFeatures2024: readonly RaceFeature[] = [
  ...officialSpecies2024.map((item) => feature(item.id.slice(13), 'traits', '物种特质', item.description)),
  feature('efa-shifter', 'shifting', '化兽', '附赠动作化兽1分钟，可附赠动作结束；获得2倍熟练临时HP及所选增益；熟练次数长休恢复。临时HP不自动修改。', { kind: 'bonus-action', resource: proficiencyUses, selectionRequirement: { checkpointId: `${shifter}-shifting-choice` } }),
  ...branches.map((key, index) => feature('efa-shifter', `branch-${key}`, ['兽皮', '长牙', '迅捷', '猎食'][index] ?? key, ['化兽时额外1d6临时HP，期间AC+1；不加入常驻AC。', '化兽时及之后化兽期间可附赠动作徒手打击；伤害可替换为1d6+力量穿刺。', '化兽期间速度+10；生物在5尺内结束回合时可反应移动10尺，不触发借机攻击。', '化兽期间感知检定优势；未失能时30尺内生物对自己的攻击不能具有优势。'][index] ?? '', { selectionRequirement: { checkpointId: `${shifter}-shifting-choice`, optionId: `${shifter}-${key}` } })),
  feature('efa-khoravar', 'lethargy-resilience', '昏睡抗力', '避免或结束昏迷的豁免失败时可改为成功；玩家掷1d4，完成相应次数长休后手动恢复。普通长休不自动回充。', { resource: { ...once, recovery: 'special' } }),
  feature('rthw-lupin', 'howl', '嚎叫', '附赠动作：15尺内选定生物感知豁免，失败则攻击与豁免劣势直到你的下回合开始。DC=8+熟练+体质；熟练次数长休恢复，不自动修改目标状态。', { kind: 'bonus-action', saveDc: { ability: 'con' }, resource: proficiencyUses }),
  feature('rthw-lupin', 'feral-pounce', '野性扑击', '徒手伤害改为挥砍；自己回合攻击动作的徒手打击命中时，可同时使用伤害与推撞选项，每回合一次。'),
  feature('rthw-dhampir', 'bite', '吸血啃咬', '徒手打击伤害可改为1d4+体质穿刺，不替换命中属性。命中非构装非亡灵可恢复等量穿刺伤害HP，或强化1分钟内下一检定/攻击；强化熟练次数长休恢复，伤害及治疗手动处理。', { resource: proficiencyUses }),
  feature('rthw-dhampir', 'spider-climb', '蛛行', '3级起可沿垂直表面及天花板移动，无需双手；攀爬等于步行。', { level: 3 }),
  feature('rthw-reborn', 'past-life', '往昔知识', '属性检定失败时可追加1d6，可能改为成功；熟练次数长休恢复，不自动添加常驻技能加值。', { resource: proficiencyUses }),
  feature('rthw-hexblood', 'token', '神秘信物', '附赠动作创造信物，一次长休；10里内魔法动作传递25词或遥视1分钟。遥视结束销毁，失能提前结束，未销毁也在长休消失；不建立物品或遥视状态。', { kind: 'bonus-action', resource: once }),
  feature('lfl-boggart', 'fury', '小不点之怒', '伤害大于自己体型的生物时可额外造成熟练加值伤害，每回合最多一次；熟练次数长休恢复。', { resource: proficiencyUses }),
  feature('lfl-boggart', 'escape', '灵巧逃脱', '可以附赠动作撤离或躲藏，不自动产生战斗状态。'),
  ...['kithkin', 'shadowmoor-kithkin'].map((slug) => feature(`lfl-${slug}`, 'halfling-traits', '半身人适配', 'd20检定掷出1时可重掷且用新结果；恐慌豁免优势；可穿过大于自己体型生物的空间；可在至少大一体型生物遮挡时躲藏。')),
]
export function withLorwynElfLineages(race: RaceRule): RaceRule {
  return race.id === 'species-2024-elf' ? { ...race, subraceIds: [...race.subraceIds, lorwynElf, 'species-2024-lfl-shadowmoor-elf-lineage'] } : race
}
