import type { RaceRule } from '@/types/rules'

/**
 * 第三方 2014 写法种族 · 第一批（G3 批次 G3-I1 第二批）：
 * 《胧忆岛：蒿野物语》（OBO）2 条 + 《谦卑林》两册（HW／HWT）11 条。
 *
 * 登记口径：
 * - 2014 写法（`属性值加成Ability Score Increase`），登记进 `5e-2014` 仓库；
 * - 名字与全部特质取自 CHM v2026.09.13 对应 `第三方_胧忆岛_种族_*.md` 与
 *   `第三方_谦卑林_种族_*.md` 原文，逐条转述；
 * - 自选加值用 `flexibleBonusCount`／`flexibleBonusValue`（如达良人／鸣玉族「一项 +2、另一项 +1」）；
 * - 亚种用 `parentRaceId` + 父种族 `subraceIds` + `requiresSubrace`；
 * - 种族授予的法术登记 `spellGrants`（2014 侧按固定属性施法，故不设 `spellcastingAbilityChoices`）；
 * - 来源默认关闭、需 DM 同意。
 */
const obojima = ['tp-obojima-index'] as const
const humblewood = ['tp-humblewood-index'] as const

const race2014 = (
  slug: string,
  name: string,
  englishName: string,
  summary: string,
  description: string,
  extra: Partial<RaceRule> = {},
  sources: readonly string[] = obojima,
): RaceRule => ({
  id: `race-2014-tp-${slug}`,
  ruleset: '5e-2014',
  name,
  englishName,
  summary,
  description,
  subraceIds: [],
  fixedAbilityBonuses: {},
  recommendedClassIds: [],
  status: 'selectable',
  sourceIds: sources,
  ...extra,
})

// ===== 胧忆岛 =====
export const obojimaRaces2014: readonly RaceRule[] = [
  race2014('dara', '达良人', 'Dara',
    '自选 +2／+1、三项技能，并能制作符纸与读写印记。',
    '属性值加成：选择一项属性 +2，另一项属性 +1。体型取决于达良人类型：小型（红色）或中型（蓝色）；基础步行速度小型 25 尺、中型 30 尺。语言：通用语与任意一门自选语言。觉醒技能：获得三项自选技能熟练。制作符纸：以一个动作制作一枚魔法符纸（存在 1 小时或在被激活时消失），制作时选择形式之一——阳符：持有者可用附赠动作激活，获得撤离或疾走动作的效果；地符：持有者生命值降至 0 但未立即死亡时自动激活，使其生命值变为 1；阴符：可用一个动作置于武器上，该武器下次命中时激活，造成等同于你等级的额外光耀伤害；使用此特质后须完成长休才能再次使用。圣印启示：以一个动作触碰并吸收遍布全岛的印记中储存的信息（从简单讯息到复杂技能）。知识传承：达良人文化中能死前留下印记者受崇敬；10 级起你获得通过达良印记传递信息的能力——以一个动作在任意表面创造独属于你的指纹状印记，创造时可诵读一段信息储存其中；此印记只有达良人可见，且可通过圣印启示吸收。',
    {
      sizeChoices: ['small', 'medium'],
      flexibleBonusGroups: [{ count: 1, value: 2 }, { count: 1, value: 1 }],
      skillProficiencyChoices: { count: 3 },
    }),
  race2014('nakudama', '鸣玉族', 'Nakudama',
    '小型两栖族：游泳 30 尺、远跳与双舌。',
    '属性值加成：选择一项属性 +2，另一项属性 +1。体型：小型（成年身高 2—3 尺）。基础步行速度 25 尺，游泳速度 30 尺。两栖：可在水中与空气中呼吸。远跳：无论是否助跑，都能跳跃至多 20 尺远或 15 尺高。语言：通用语与鸣鸣语。捕物舌：可以附赠动作将舌头伸向 15 尺内可见的、重量不超过 5 磅的物体并将其拉向自己（用手接住或任其落在脚边）；若该物体被生物穿戴或携带，该生物须通过一次力量检定对抗，否则物体被拉走。附着舌：可以附赠语将舌头附着在比你大至少一级的表面或生物上，借此将自己拉向目标（目标须在 15 尺内）。',
    {
      size: 'small',
      speed: 25,
      swimSpeed: 30,
      flexibleBonusGroups: [{ count: 1, value: 2 }, { count: 1, value: 1 }],
    }),
]

// ===== 谦卑林 =====
const hw = (slug: string, name: string, englishName: string, summary: string, description: string, extra: Partial<RaceRule> = {}) =>
  race2014(slug, name, englishName, summary, description, extra, humblewood)

export const humblewoodRaces2014: readonly RaceRule[] = [
  hw('mapach', '浣熊族', 'Mapach',
    '感知 +2 体质 +1，攀爬 20 尺与拾荒艺术。',
    '属性值加成：感知 +2、体质 +1。中型体型；基础步行速度 30 尺。黑暗视觉 60 尺。攀爬专家：拥有 20 尺攀爬速度。抗性：对抗毒素的豁免具有优势，并拥有毒素伤害抗性。拾荒艺术：拥有工匠工具（修补工具）熟练；可花费 10 分钟用周围材料把不超过 30 gp 的工具或冒险用品做成粗糙但可用的版本（工具与易损品如铁蒺藜、箭矢在首次使用后失效，其余 1 小时后自动解体）；若有合适材料，可再花 8 小时把该物品变为永久版本；也能用于修理损坏的装备（能维持多久由 DM 裁定）。鬼鬼祟祟：昏暗或黑暗环境中敏捷（隐匿）检定具有优势。语言：鸟族语与浣熊语。',
    { darkvision: 60, climbSpeed: 20, damageResistances: ['poison'], fixedAbilityBonuses: { wis: 2, con: 1 }, skillProficiencies: ['skill-stealth'] }),
  hw('vulpin', '狡狐族', 'Vulpin',
    '智力 +2 魅力 +1，啮咬与反射躲闪。',
    '属性值加成：智力 +2、魅力 +1。中型体型；基础步行速度 30 尺。黑暗视觉 60 尺。啮咬：尖牙可作徒手打击，造成 1d6 穿刺伤害，攻击与伤害可用力量或敏捷调整值。反射躲闪：所有敏捷豁免检定获得等于你智力调整值的加值。迷人诡计：可免费施展 1 次一环「魅惑类人」；3 级起可免费施展 1 次二环「伏击猎物」；5 级起可免费施展 1 次三环「恐惧术」；完成长休后重获免费施展权；相关施法关键属性为智力。语言：鸟族语与狡狐语。',
    {
      darkvision: 60,
      fixedAbilityBonuses: { int: 2, cha: 1 },
      spellGrants: [
        { spellId: 'spell-2014-charm-person', minimumLevel: 1, freeCastings: 1, recovery: 'long-rest' },
        { spellId: 'spell-2014-ambush-prey', minimumLevel: 3, freeCastings: 1, recovery: 'long-rest' },
        { spellId: 'spell-2014-fear', minimumLevel: 5, freeCastings: 1, recovery: 'long-rest' },
      ],
    }),
  hw('hedge', '猬族', 'Hedge',
    '魅力 +2 感知 +1，掘穴 15 尺与蜷缩AC 19。',
    '属性值加成：魅力 +2、感知 +1。小型体型；基础步行速度 25 尺。天生掘穴者：拥有 15 尺掘穴速度（仅能在松软泥土中掘穴）。多刺的羽发：基础 AC 为 14 + 敏捷调整值，且**不能穿戴任何护甲**（持盾仍可获益）。蜷缩：可以用一个动作蜷缩，蜷缩期间不能移动、攻击或施展需要姿势成分的法术，基础 AC 提升至 19（敏捷调整值不计入，盾牌仍可用）；任何生物以近战攻击你而未命中时受到 2d4 穿刺伤害；若敌人在你蜷缩时命中你，你在回合结束时于自身空间内倒地；你可在自己回合任何时候伸展身体。森林魔法：习得戏法「德鲁伊伎俩」；可免费施展 1 次二环「动物信使」，短休或长休后重获；相关施法关键属性为魅力。虫类交谈：可与生物类型为野兽的昆虫、蜘蛛、蠕虫等爬虫交流简单想法（不限体型）。语言：鸟族语与猬族语。',
    {
      size: 'small',
      speed: 25,
      burrowSpeed: 15,
      fixedAbilityBonuses: { cha: 2, wis: 1 },
      spellGrants: [
        { spellId: 'spell-2014-druidcraft', minimumLevel: 1 },
        { spellId: 'spell-2014-animal-messenger', minimumLevel: 1, freeCastings: 1, recovery: 'short-rest' },
      ],
    }),
  hw('jerbeen', '跳鼠族', 'Jerbeen',
    '敏捷 +2 魅力 +1，立定跳远 30 尺与团体战术。',
    '属性值加成：敏捷 +2、魅力 +1。小型体型；基础步行速度 30 尺。立定跳远：基础跳远距离 30 尺、跳高 15 尺，且无需助跑。灵巧：可穿越任何体型比你大的生物所在空间。振作：力量豁免具有优势；只要与盟友相距 5 尺内、彼此能看见听见且该盟友未恐慌或失能，你对抗恐慌的豁免也具有优势。团体战术：能以附赠动作执行协助动作。语言：鸟族语与跳鼠语。',
    { size: 'small', fixedAbilityBonuses: { dex: 2, cha: 1 } }),
  hw('cervan', '鹿族', 'Cervan',
    '体质 +2，注重实践与活力澎湃；分林地鹿／叉角鹿。',
    '属性值加成：体质 +2。中型体型；基础步行速度 30 尺。注重实践：获得运动、医药、自然或生存之一的技能熟练。活力澎湃：若一次攻击造成的伤害超过你当前剩余生命值的一半（即使生命值被降至 0），你立即恢复 1d12 + 体质调整值的生命值；完成长休前不能再次使用。语言：鸟族语与鹿族语（鹿族语无书写文字）。亚种：须选择林地鹿或叉角鹿之一。',
    {
      fixedAbilityBonuses: { con: 2 },
      requiresSubrace: true,
      subraceIds: ['race-2014-tp-cervan-grove', 'race-2014-tp-cervan-pronghorn'],
      skillProficiencyChoices: { count: 1, optionIds: ['skill-athletics', 'skill-medicine', 'skill-nature', 'skill-survival'] },
    }),
  hw('cervan-grove', '林地鹿', 'Grove Cervan',
    '鹿族亚种：敏捷 +1，速度 35 尺与灵敏步法。',
    '鹿族亚种（林地鹿）：敏捷 +1。迅捷：基础步行速度提升至 35 尺。立定跳远：基础跳远 30 尺、跳高 15 尺，无需助跑。灵敏步法：针对你的借机攻击具有劣势。',
    { parentRaceId: 'race-2014-tp-cervan', speed: 35, fixedAbilityBonuses: { dex: 1 } }),
  hw('cervan-pronghorn', '叉角鹿', 'Pronghorn Cervan',
    '鹿族亚种：力量 +1，负重翻倍与鹿角冲锋。',
    '鹿族亚种（叉角鹿）：力量 +1。身强力壮：计算负重及拖、拉、拽重量时负重翻倍。鹿角：拥有一副大而结实的鹿角，可用于毁灭性的冲锋攻击（徒手打击，具体数值按原书）。',
    { parentRaceId: 'race-2014-tp-cervan', fixedAbilityBonuses: { str: 1 } }),
  hw('raptor', '隼族', 'Raptor',
    '敏捷 +2，滑翔、利爪与林地猎手；分海隼／风隼。',
    '属性值加成：敏捷 +2。小型体型；基础步行速度 25 尺。滑翔（鸟族共有）：坠落时可用反应展开羽毛手臂，使翅膀羽毛变硬以减缓下坠——以此法每轮下降 60 尺，降落不受坠落伤害；每下降 10 尺可向任意方向前进等于你移动速度的距离；不能向上移动，但可在停止移动的空间着陆；持有重型武器或盾牌、或穿戴重甲／受妨碍时不能滑翔（展开手臂的同时可丢下手中物品）。利爪：徒手打击造成 1d4 穿刺伤害；攀爬时若爪子能抓住表面，力量（运动）检定具有优势。敏锐感官：察觉技能熟练。林地猎手：将 3/4 掩护视为半身掩护、半身掩护视为无掩护。猎手训练：拥有长弓、短弓与矛的熟练（长弓对你不再视为重型武器）。语言：鸟族语与通用语，能听懂风族语但天生无法说出。亚种：须选择海隼族或风隼族之一。',
    {
      size: 'small',
      speed: 25,
      fixedAbilityBonuses: { dex: 2 },
      skillProficiencies: ['skill-perception'],
      requiresSubrace: true,
      subraceIds: ['race-2014-tp-raptor-maran', 'race-2014-tp-raptor-mistral'],
      weaponArmorProficiencies: ['longbow', 'shortbow', 'spear'],
    }),
  hw('raptor-maran', '海隼族', 'Maran Raptor',
    '隼族亚种：智力 +1，游泳 25 尺与耐心。',
    '隼族亚种（海隼族）：智力 +1。游泳家：拥有 25 尺游泳速度。耐心：以反应执行预备动作时，作为该动作一部分的第一次攻击检定、技能检定或属性检定具有优势。',
    { parentRaceId: 'race-2014-tp-raptor', swimSpeed: 25, fixedAbilityBonuses: { int: 1 } }),
  hw('raptor-mistral', '风隼族', 'Mistral Raptor',
    '隼族亚种：感知 +1，灵巧与空中防御。',
    '隼族亚种（风隼族）：感知 +1。灵巧：运动技能熟练。空中防御：当你处于下落、飞行、滑翔或跳跃状态时，攻击你的生物在对抗你的攻击检定上具有劣势。',
    { parentRaceId: 'race-2014-tp-raptor', fixedAbilityBonuses: { wis: 1 }, skillProficiencies: ['skill-athletics'] }),
  hw('gallus', '雉族', 'Gallus',
    '感知 +2，襟翼、社区文化与民兵训练；分靓雉／野雉。',
    '属性值加成：感知 +2。中型体型；基础步行速度 30 尺。滑翔（鸟族共有，规则同隼族）。襟翼：以一个附赠动作用臂上襟翼推动自身向上移动等于你移动速度一半的距离；不能在滑翔时使用。社区文化：进行与自身种族／文化／社区历史相关的智力（历史）检定时视为拥有历史熟练，并可加双倍熟练加值。民兵训练：获得简易武器熟练。人民一员：获得酿酒工具、木匠工具或铁匠工具之一的熟练。语言：鸟族语与通用语，能听懂风族语但天生无法说出。亚种：须选择靓雉族或野雉族之一。',
    {
      fixedAbilityBonuses: { wis: 2 },
      requiresSubrace: true,
      subraceIds: ['race-2014-tp-gallus-bright', 'race-2014-tp-gallus-huden'],
      weaponArmorProficiencies: ['weapon-simple'],
      toolProficiencyChoices: { count: 1 },
    }),
  hw('gallus-bright', '靓雉族', 'Bright Gallus',
    '雉族亚种：魅力 +1，激励人心与洞悉熟练。',
    '雉族亚种（靓雉族）：魅力 +1。激励人心：以一个动作给予建议或鼓励，可激励一名能看见并听见你的盟友，其可掷 1d4 并加到下一次属性检定、攻击检定或豁免检定中。感同身受：洞悉技能熟练。',
    { parentRaceId: 'race-2014-tp-gallus', fixedAbilityBonuses: { cha: 1 }, skillProficiencies: ['skill-insight'] }),
  hw('gallus-huden', '野雉族', 'Huden Gallus',
    '雉族亚种：敏捷 +1，林地之子与种子之语。',
    '雉族亚种（野雉族）：敏捷 +1。林地之子：自然技能熟练。种子之语：通过言语与触摸可与活着的植物传递简单想法并解释其回答；森林中的植物不靠视觉感知，但多数能感知温度变化、描述触碰过它们的东西、听到周围的震动（包括说话）。',
    { parentRaceId: 'race-2014-tp-gallus', fixedAbilityBonuses: { dex: 1 }, skillProficiencies: ['skill-nature'] }),
  hw('corvum', '鸦族', 'Corvum',
    '智力 +2，滑翔、善学与评估之眼；分昏鸦／煽鸦。',
    '属性值加成：智力 +2。中型体型；基础步行速度 30 尺。滑翔（鸟族共有，规则同隼族）。利爪：徒手打击 1d4 穿刺；攀爬时爪子能抓住表面则力量（运动）检定具有优势。善学：获得奥秘、历史、自然或宗教之一的技能熟练。评估之眼：花费一个动作检查任何物品，可确定其魔法属性、如何使用或激发以及大致市场价格；使用后须完成长休或短休才能再次使用。语言：鸟族语与通用语，能听懂风族语但天生无法说出。亚种：须选择昏鸦族或煽鸦族之一。',
    {
      fixedAbilityBonuses: { int: 2 },
      requiresSubrace: true,
      subraceIds: ['race-2014-tp-corvum-dusk', 'race-2014-tp-corvum-kindled'],
      skillProficiencyChoices: { count: 1, optionIds: ['skill-arcana', 'skill-history', 'skill-nature', 'skill-religion'] },
    }),
  hw('corvum-dusk', '昏鸦族', 'Dusk Corvum',
    '鸦族亚种：敏捷 +1，鬼鬼祟祟与街头智慧。',
    '鸦族亚种（昏鸦族）：敏捷 +1。比起森林的荒野，你更适合在社会的喧嚣中生活，了解微妙的社会暗示就像猎人了解猎物一样，也很快学会利用自己的优势。鬼鬼祟祟：昏暗或黑暗环境中，你的敏捷（隐匿）检定具有优势。街头智慧：你拥有洞悉技能的熟练项。',
    { parentRaceId: 'race-2014-tp-corvum', fixedAbilityBonuses: { dex: 1 }, skillProficiencies: ['skill-insight'] }),
  hw('corvum-kindled', '煽鸦族', 'Kindled Corvum',
    '鸦族亚种：魅力 +1，令人信服与敏锐思维。',
    '鸦族亚种（煽鸦族）：魅力 +1。令人信服：拥有欺瞒与游说技能熟练；当检定是为说服他人相信你在所选「善学」话题（奥秘／历史／自然／宗教）上拥有杰出知识时，所有魅力相关检定具有优势。敏锐思维：可再学一门自选语言、获得一项自选工具熟练，并能非常清晰地回忆起过去一个月里看到或听到的任何事物。',
    { parentRaceId: 'race-2014-tp-corvum', fixedAbilityBonuses: { cha: 1 }, skillProficiencies: ['skill-deception', 'skill-persuasion'], toolProficiencyChoices: { count: 1 } }),
  hw('strig', '鸮族', 'Strig',
    '力量 +2，滑翔、利爪与图纹羽毛；分敦实鸮／迅疾鸮。',
    '属性值加成：力量 +2。中型体型；基础步行速度 30 尺。滑翔（鸟族共有，规则同隼族）。利爪：徒手打击 1d4 穿刺；攀爬时爪子能抓住表面则力量（运动）检定具有优势。黑暗视觉 60 尺。图纹羽毛：森林环境中敏捷（隐匿）检定具有优势。语言：鸟族语与通用语，能听懂风族语但天生无法说出。亚种：须选择敦实鸮或迅疾鸮之一。',
    {
      darkvision: 60,
      fixedAbilityBonuses: { str: 2 },
      requiresSubrace: true,
      subraceIds: ['race-2014-tp-strig-stout', 'race-2014-tp-strig-swift'],
    }),
  hw('strig-stout', '敦实鸮', 'Stout Strig',
    '鸮族亚种：体质 +1，威严满满与格斗家。',
    '鸮族亚种（敦实鸮）：体质 +1。你是如此的健壮，能够经受住艰难困苦，并将你的意志加于你周围的世界。威严满满：你拥有威吓技能的熟练项。格斗家：当你使用利爪成功命中目标时，可以用附赠动作擒抱目标。',
    { parentRaceId: 'race-2014-tp-strig', fixedAbilityBonuses: { con: 1 }, skillProficiencies: ['skill-intimidation'] }),
  hw('strig-swift', '迅疾鸮', 'Swift Strig',
    '鸮族亚种：敏捷 +1，速度 35 尺与生存大师。',
    '鸮族亚种（迅疾鸮）：敏捷 +1。你是森林中的一股强大力量，足迹遍及四面八方而从未停歇；当你沉浸在森林里的时候最为才能出众。迅捷：你的基础步行速度提升至 35 尺。生存大师：你拥有求生技能的熟练项。',
    { parentRaceId: 'race-2014-tp-strig', speed: 35, fixedAbilityBonuses: { dex: 1 }, skillProficiencies: ['skill-survival'] }),
  hw('luma', '鸽族', 'Luma',
    '魅力 +2，滑翔、襟翼与命中注定；分黑鸽／艳鸽。',
    '属性值加成：魅力 +2。小型体型；基础步行速度 25 尺。滑翔（鸟族共有，规则同隼族）。襟翼：以一个附赠动作用臂上襟翼推动自身向上移动等于你移动速度一半的距离；不能在滑翔时使用。神经兮兮：从术士法术列表中选择一个戏法，其施法属性为魅力。命中注定：每天 1 次，可选择重掷任何攻击检定、技能检定或豁免检定；可在掷骰之后决定，但必须在结果确定前声明。语言：鸟族语与通用语，能听懂风族语但天生无法说出。亚种：须选择黑鸽族或艳鸽族之一。',
    {
      size: 'small',
      speed: 25,
      fixedAbilityBonuses: { cha: 2 },
      requiresSubrace: true,
      subraceIds: ['race-2014-tp-luma-sable', 'race-2014-tp-luma-sera'],
    }),
  hw('luma-sable', '黑鸽族', 'Sable Luma',
    '鸽族亚种：体质 +1，难以捉摸与坚韧。',
    '鸽族亚种（黑鸽族）：体质 +1。难以捉摸：他人对你进行感知（洞悉）检定时具有劣势；针对非鸽族时你的魅力（欺瞒）检定具有优势。坚韧：对抗毒素的豁免具有优势，并拥有毒素伤害抗性。',
    { parentRaceId: 'race-2014-tp-luma', fixedAbilityBonuses: { con: 1 }, damageResistances: ['poison'] }),
  hw('luma-sera', '艳鸽族', 'Sera Luma',
    '鸽族亚种：感知 +1，万众瞩目与鸣禽。',
    '鸽族亚种（艳鸽族）：感知 +1。万众瞩目：表演技能熟练。鸣禽：每长休 1 次，可无需任何姿势成分施展「魅惑类人」，相关施法关键属性为魅力。',
    {
      parentRaceId: 'race-2014-tp-luma',
      fixedAbilityBonuses: { wis: 1 },
      skillProficiencies: ['skill-performance'],
      spellGrants: [{ spellId: 'spell-2014-charm-person', minimumLevel: 1, freeCastings: 1, recovery: 'long-rest' }],
    }),
]
