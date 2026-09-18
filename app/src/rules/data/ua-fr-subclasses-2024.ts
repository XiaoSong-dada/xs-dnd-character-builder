import type { RuleOption, SubclassFeature, SubclassRule } from '@/types/rules'

/**
 * 破解奥秘：被遗忘的国度书-子职（UA）。
 * 8 个子职；来源 `source-2024-ua-fr-subclasses`，默认关闭、状态 selectable。
 */

const sourceIds = ['source-2024-ua-fr-subclasses'] as const

const ARTISAN_TOOLS: readonly { readonly slug: string; readonly name: string }[] = [
  { slug: 'alchemist', name: '炼金工具' },
  { slug: 'brewer', name: '酿酒工具' },
  { slug: 'calligrapher', name: '书法工具' },
  { slug: 'carpenter', name: '木匠工具' },
  { slug: 'cartographer', name: '制图工具' },
  { slug: 'cobbler', name: '鞋匠工具' },
  { slug: 'cook', name: '厨师工具' },
  { slug: 'glassblower', name: '玻璃匠工具' },
  { slug: 'jeweler', name: '珠宝匠工具' },
  { slug: 'leatherworker', name: '皮匠工具' },
  { slug: 'mason', name: '石匠工具' },
  { slug: 'painter', name: '画家工具' },
  { slug: 'potter', name: '陶匠工具' },
  { slug: 'smith', name: '铁匠工具' },
  { slug: 'tinker', name: '修补工具' },
  { slug: 'weaver', name: '织布工具' },
  { slug: 'woodcarver', name: '木雕工具' },
]

const FR_TOOL_OPTION_IDS: readonly string[] = ARTISAN_TOOLS.map((item) => `ua-fr-2024-tool-${item.slug}`)

const option = (id: string, name: string, englishName: string, description: string): RuleOption => ({
  id, name, englishName, description, status: 'selectable', sourceIds,
})

export const uaFrSubclassOptions2024: readonly RuleOption[] = [
  ...ARTISAN_TOOLS.map((item) => option(`ua-fr-2024-tool-${item.slug}`, item.name, item.name, `选择${item.name}熟练（知识领域·知识祝福）。`)),
  option('ua-fr-2024-moon-tale-life', '生命传说', 'Tale of Life', '月影群岛之故事：为生物恢复生命值时消耗一枚诗人激励骰，增加等于骰值的治疗量（每回合一次）。'),
  option('ua-fr-2024-moon-tale-gloam', '雾纱传说', 'Tale of Gloam', '月影群岛之故事：以附赠动作给予诗人激励骰时，可同时执行撤离或躲藏动作。'),
  option('ua-fr-2024-moon-tale-mirth', '欢欣传说', 'Tale of Mirth', '月影群岛之故事：60 尺内可见敌人豁免成功时，反应消耗一枚诗人激励骰并从结果中减去骰值。'),
  option('ua-fr-2024-genie-dao', '土巨灵之碾压', "Dao's Crush", '元素斩：目标受擒（逃脱 DC＝法术豁免 DC），受擒期间束缚。'),
  option('ua-fr-2024-genie-djinni', '气巨灵之遁形', "Djinni's Escape", '元素斩：传送至 30 尺内可见未占据空间并化为雾状形态，持续至下回合结束；免疫受擒、倒地、束缚。'),
  option('ua-fr-2024-genie-efreeti', '火巨灵之狂怒', "Efreeti's Fury", '元素斩：目标额外受到 2d4 火焰伤害。'),
  option('ua-fr-2024-genie-marid', '水巨灵之激流', "Marid's Surge", '元素斩：目标与 10 尺光环内你指定的生物力量豁免失败则被推开 15 尺并倒地。'),
  option('ua-fr-2024-scion-bane', '班恩', 'Bane', '敬怖之忠：心灵伤害抗性；施展次级幻象（智力施法）。'),
  option('ua-fr-2024-scion-bhaal', '巴尔', 'Bhaal', '敬怖之忠：毒素伤害抗性；施展剑刃防护（智力施法）。'),
  option('ua-fr-2024-scion-myrkul', '米尔寇', 'Myrkul', '敬怖之忠：暗蚀伤害抗性；施展颤栗之触（智力施法）。'),
]

export const uaFrSubclassFeatures2024: readonly SubclassFeature[] = [
  // ============ 月亮学院（吟游诗人） ============
  {
    id: 'ua-fr-2024-moon-folktales', subclassId: 'subclass-2024-ua-bard-moon', name: '月影群岛之故事', englishName: 'Moonshae Folktales', level: 3,
    summary: '魔法动作呼唤一种传说（生命／雾纱／欢欣），持续到你再次使用；各传说提供不同增益。',
    description: '以一个魔法动作，你呼唤民间传说的力量充盈自身，直到你再次使用。选择一种传说：生命——为生物恢复生命值时消耗一枚诗人激励骰，增加等量恢复（每回合一次）；雾纱——以附赠动作给予诗人激励骰时，可同时执行撤离或躲藏；欢欣——60 尺内可见敌人豁免成功时，反应消耗一枚诗人激励骰并从结果中减去骰值。',
    kind: 'action', optionIds: ['ua-fr-2024-moon-tale-life', 'ua-fr-2024-moon-tale-gloam', 'ua-fr-2024-moon-tale-mirth'], status: 'selectable', sourceIds,
  },
  {
    id: 'ua-fr-2024-moon-primal-lorist', subclassId: 'subclass-2024-ua-bard-moon', name: '原初颂者', englishName: 'Primal Lorist', level: 3,
    summary: '习得德鲁伊语与一项德鲁伊戏法；从 6 项技能中选择 1 项获得熟练。',
    description: '你习得德鲁伊语和一个德鲁伊法术列表中的戏法（视为诗人法术，不计入已知戏法数量）。此外，你从驯兽、洞悉、医药、自然、察觉、求生中选择一项获得熟练。',
    kind: 'choice', requiresChoice: true,
    optionIds: ['skill-animal-handling', 'skill-insight', 'skill-medicine', 'skill-nature', 'skill-perception', 'skill-survival'],
    minSelections: 1, maxSelections: 1, status: 'selectable', sourceIds,
  },
  {
    id: 'ua-fr-2024-moon-druid-cantrip', subclassId: 'subclass-2024-ua-bard-moon', name: '德鲁伊戏法', englishName: 'Druid Cantrip', level: 3,
    summary: '从德鲁伊戏法中选择一个；本实现按始终准备登记，不计入已知戏法数量。',
    description: '你从德鲁伊法术列表中选择一个戏法。它对你视为诗人法术，不计入你的已知戏法数量。本实现将其登记为始终准备以便展示与导出。',
    kind: 'choice', requiresChoice: true, candidateKind: 'spell-pool',
    spellPool: { level: 0, classIds: ['class-2024-druid'] },
    spellGrant: { alwaysPrepared: true },
    minSelections: 1, maxSelections: 1, status: 'selectable', sourceIds,
  },
  {
    id: 'ua-fr-2024-moon-moonwells', subclassId: 'subclass-2024-ua-bard-moon', name: '月井之祝福', englishName: 'Blessing of the Moonwells', level: 6,
    summary: '始终准备月华之光；附赠动作可免费施展一次（长休恢复，可用 3 环以上法术位重置）。',
    description: '你始终准备月华之光。以一个附赠动作，你可以不消耗法术位施展月华之光；维持专注期间你散发光芒（5 尺微光），且每当生物失败于该法术豁免，你可令 60 尺内可见生物恢复 2d4 生命值。使用后需完成长休才能再次使用；也可消耗一个 3 环或更高法术位重置（无需动作）。',
    kind: 'resource', status: 'selectable', sourceIds,
    grantedSpells: [{ spellId: 'spell-2024-moonbeam', alwaysPrepared: true, freeCastings: 1, recovery: 'long-rest' }],
    resource: { maxByLevel: [0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], recovery: 'long-rest', note: '可消耗 3 环以上法术位重置' },
  },
  {
    id: 'ua-fr-2024-moon-bolstered-folktales', subclassId: 'subclass-2024-ua-bard-moon', name: '踵事增华', englishName: 'Bolstered Folktales', level: 14,
    summary: '生命与欢欣传说可用 1d6 代替诗人激励骰且不消耗；雾纱传说附带 30 尺传送。',
    description: '生命传说与欢欣传说：可投 1d6 并用此替代你的诗人激励骰（不消耗激励骰）。雾纱传说：作为该附赠动作的一部分，你还可以传送到 30 尺内可见的未占据空间。',
    kind: 'passive', status: 'selectable', sourceIds,
  },

  // ============ 知识领域（牧师） ============
  {
    id: 'ua-fr-2024-knowledge-tool', subclassId: 'subclass-2024-ua-cleric-knowledge', name: '知识祝福·工具', englishName: 'Blessing of Knowledge: Tool', level: 3,
    summary: '选择一种工匠工具获得熟练。',
    description: '你选择一种工匠工具并获得其熟练。',
    kind: 'choice', requiresChoice: true, optionIds: FR_TOOL_OPTION_IDS, minSelections: 1, maxSelections: 1, status: 'selectable', sourceIds,
  },
  {
    id: 'ua-fr-2024-knowledge-skills', subclassId: 'subclass-2024-ua-cleric-knowledge', name: '知识祝福·技能专精', englishName: 'Blessing of Knowledge: Expertise', level: 3,
    summary: '从奥秘、历史、自然、宗教中选择 2 项获得专精。',
    description: '你从奥秘、历史、自然、宗教中选择两项技能并获得其专精。',
    kind: 'choice', requiresChoice: true,
    optionIds: ['skill-arcana', 'skill-history', 'skill-nature', 'skill-religion'],
    minSelections: 2, maxSelections: 2, grantsExpertiseInChosenSkills: true, status: 'selectable', sourceIds,
  },
  {
    id: 'ua-fr-2024-knowledge-spells', subclassId: 'subclass-2024-ua-cleric-knowledge', name: '知识领域法术', englishName: 'Knowledge Domain Spells', level: 3,
    summary: '3／5／7／9 级按领域表始终准备法术。',
    description: '达到对应牧师等级时，你始终准备知识领域法术表中的法术；这些法术不计入准备上限。',
    kind: 'passive', status: 'selectable', sourceIds,
  },
  {
    id: 'ua-fr-2024-knowledge-mind-magic', subclassId: 'subclass-2024-ua-cleric-knowledge', name: '思维魔法', englishName: 'Mind Magic', level: 3,
    summary: '魔法动作消耗一次引导神力，施展一个已准备的知识领域法术（无法术位与材料成分）。',
    description: '以一个魔法动作，你可以花费一次引导神力使用次数，从知识领域法术表中选择一个你已经准备的法术并施展它，无需消耗法术位，也无需材料成分。',
    kind: 'action', status: 'selectable', sourceIds,
  },
  {
    id: 'ua-fr-2024-knowledge-unfettered-mind', subclassId: 'subclass-2024-ua-cleric-knowledge', name: '无拘心智', englishName: 'Unfettered Mind', level: 6,
    summary: '60 尺心灵感应（至多智力调整值名生物）；智力检定总值可用感知值替代。',
    description: '你获得 60 尺心灵感应，使用时可同时与至多等于你智力调整值名生物（至少一名）联结。此外，如果你进行的智力检定总值低于你的感知属性值，你可以使用感知属性值替代该检定总值。',
    kind: 'passive', status: 'selectable', sourceIds,
  },
  {
    id: 'ua-fr-2024-knowledge-divine-foreknowledge', subclassId: 'subclass-2024-ua-cleric-knowledge', name: '神之预知', englishName: 'Divine Foreknowledge', level: 17,
    summary: '附赠动作获得 1 小时 d20 检定优势；长休恢复，可用 6 环以上法术位重置。',
    description: '以一个附赠动作，你扩展思维于未来的诸多可能性：1 小时内你获得 d20 检定优势。使用后需完成长休才能再次使用；也可消耗一个 6 环或更高法术位重置（无需动作）。',
    kind: 'bonus-action', status: 'selectable', sourceIds,
    resource: { maxByLevel: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1], recovery: 'long-rest', note: '可消耗 6 环以上法术位重置' },
  },

  // ============ 紫龙骑士（战士） ============
  {
    id: 'ua-fr-2024-pdk-envoy', subclassId: 'subclass-2024-ua-fighter-purple-dragon-knight', name: '骑士使节', englishName: 'Knightly Envoy', level: 3,
    summary: '额外习得一门语言；能以仪式施展通晓语言（智力施法）。',
    description: '你从语言表中选择并习得一门语言。此外，你能以仪式施展通晓语言，施法属性为智力。',
    kind: 'passive', status: 'selectable', sourceIds, languageChoices: 1,
  },
  {
    id: 'ua-fr-2024-pdk-companion', subclassId: 'subclass-2024-ua-fighter-purple-dragon-knight', name: '紫晶龙伴', englishName: 'Purple Dragon Companion', level: 3,
    summary: '与一条小紫晶龙连结；战斗中听令行动，死亡 1 小时内可用回气或 1 小时仪典复活。',
    description: '你与一条刚出壳的小紫晶龙连结（小型龙类，AC 13＋智力调整值，HP 4＋4×战士等级；撕裂与重力吐息 2/日；坚实联结）。战斗中它在你的回合行动，需你用附赠动作命令其执行动作，否则回避。若它死亡不超过 1 小时，你可消耗一次回气以魔法动作使其在 1 分钟后满生命值复活；也可进行 1 小时仪典（可并入短休或长休）复活。龙伴数据未接入自动战斗结算。',
    kind: 'resource', status: 'selectable', sourceIds,
    resource: { maxByLevel: [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], recovery: 'long-rest', unit: '只', note: '复活消耗回气或 1 小时仪典' },
  },
  {
    id: 'ua-fr-2024-pdk-rider', subclassId: 'subclass-2024-ua-fighter-purple-dragon-knight', name: '龙骑士', englishName: 'Dragon Rider', level: 7,
    summary: '龙伴成长为中型可骑乘；重力吐息扩至 30 尺并附加 2d6 力场；回气同时治疗龙伴。',
    description: '龙伴成长为中型，体型中型或更小的你可将其作为坐骑（骑乘时仅靠飞行速度悬空并结束回合会坠落；上下坐骑只花 5 尺移动力）。重力吐息变为 30 尺锥形，豁免失败额外受到 2d6 力场伤害。你使用回气时，龙伴恢复 1d6＋战士等级生命值并重获一次重力吐息。',
    kind: 'passive', status: 'selectable', sourceIds,
  },
  {
    id: 'ua-fr-2024-pdk-rallying-surge', subclassId: 'subclass-2024-ua-fighter-purple-dragon-knight', name: '号令万军', englishName: 'Rallying Surge', level: 10,
    summary: '使用动作如潮时指定 30 尺内至多 3 名盟友，各以反应前攻或后撤。',
    description: '当你使用动作如潮时，你可以指定源自你的 30 尺光环内至多三名盟友。每名盟友可用反应选择：前攻——用武器或徒手打击发动一次攻击（若为龙伴则发动撕裂）；后撤——移动等于速度一半的距离且不引发借机攻击。',
    kind: 'passive', status: 'selectable', sourceIds,
  },
  {
    id: 'ua-fr-2024-pdk-pinnacle', subclassId: 'subclass-2024-ua-fighter-purple-dragon-knight', name: '紫晶升华', englishName: 'Amethyst Pinnacle', level: 15,
    summary: '龙伴成长为大型（速度 40 尺、飞行 40 尺、不再坠落）；攻击动作可换龙伴撕裂或重力吐息。',
    description: '龙伴成长为大型，速度与飞行速度各提升至 40 尺，且你骑乘时不再因滞空结束回合坠落。你在自己回合执行攻击动作时，可以放弃一次攻击命令龙伴发动撕裂，或放弃两次攻击令其使用重力吐息。',
    kind: 'passive', status: 'selectable', sourceIds,
  },
  {
    id: 'ua-fr-2024-pdk-enduring', subclassId: 'subclass-2024-ua-fighter-purple-dragon-knight', name: '不折将官', englishName: 'Enduring Commander', level: 18,
    summary: '你与龙伴获得力场与心灵伤害抗性。',
    description: '你与你的小紫晶龙获得对力场伤害和心灵伤害的抗性。',
    kind: 'passive', status: 'selectable', sourceIds,
  },

  // ============ 巨灵贵族之誓（圣武士） ============
  {
    id: 'ua-fr-2024-genies-smite', subclassId: 'subclass-2024-ua-paladin-noble-genies', name: '元素斩', englishName: 'Elemental Smite', level: 3,
    summary: '释放至圣斩后可消耗一次引导神力触发元素效应：碾压／遁形／狂怒／激流。',
    description: '在你释放至圣斩后，你可以立即消耗一次引导神力使用次数并触发一种效应：土巨灵之碾压（目标受擒并束缚，逃脱 DC＝法术豁免 DC）；气巨灵之遁形（传送 30 尺并化雾，持续至下回合结束，免疫受擒／倒地／束缚）；火巨灵之狂怒（目标额外受 2d4 火焰伤害）；水巨灵之激流（目标与 10 尺光环内选定生物力量豁免失败则被推开 15 尺并倒地）。',
    kind: 'passive', optionIds: ['ua-fr-2024-genie-dao', 'ua-fr-2024-genie-djinni', 'ua-fr-2024-genie-efreeti', 'ua-fr-2024-genie-marid'], status: 'selectable', sourceIds,
  },
  {
    id: 'ua-fr-2024-genies-spells', subclassId: 'subclass-2024-ua-paladin-noble-genies', name: '巨灵法术', englishName: 'Genie Spells', level: 3,
    summary: '3／5／9／13／17 级按巨灵法术表始终准备法术。',
    description: '达到对应圣武士等级时，你始终准备巨灵法术表中的法术；这些法术不计入准备上限。',
    kind: 'passive', status: 'selectable', sourceIds,
  },
  {
    id: 'ua-fr-2024-genies-splendor', subclassId: 'subclass-2024-ua-paladin-noble-genies', name: '巨灵之辉', englishName: "Genie's Splendor", level: 3,
    summary: '未着中甲或重甲时 AC 获得魅力调整值加值（至少 +1）；从 4 项技能选 1 获得熟练。',
    description: '若你未着装任何中甲或重甲，你的 AC 获得等于你魅力调整值的加值（至少 +1）。你从特技、威吓、表演、游说中选择一项获得熟练。',
    kind: 'choice', requiresChoice: true,
    optionIds: ['skill-acrobatics', 'skill-intimidation', 'skill-performance', 'skill-persuasion'],
    minSelections: 1, maxSelections: 1, status: 'selectable', sourceIds,
  },
  {
    id: 'ua-fr-2024-genies-aura', subclassId: 'subclass-2024-ua-paladin-noble-genies', name: '元素护盾灵光', englishName: 'Aura of Elemental Shielding', level: 7,
    summary: '你和守护灵光内盟友获得所选伤害类型（强酸／寒冷／火焰／闪电／雷鸣）抗性；每回合可更换。',
    description: '选择强酸、寒冷、火焰、闪电或雷鸣之一；你和你守护灵光内的盟友获得该伤害类型抗性。每个你的回合开始时，你可以无需动作更改此特性影响的伤害类型。',
    kind: 'passive', status: 'selectable', sourceIds,
  },
  {
    id: 'ua-fr-2024-genies-rebuke', subclassId: 'subclass-2024-ua-paladin-noble-genies', name: '元素叱喝', englishName: 'Elemental Rebuke', level: 15,
    summary: '被命中时反应减半伤害并迫使攻击者敏捷检定，失败受 4d10＋魅力调整值元素伤害；次数＝魅力调整值。',
    description: '当你被一次攻击检定命中时，你可以使用反应使该次攻击伤害减半（向下取整），并迫使攻击者进行一次对抗你法术豁免 DC 的敏捷检定：失败受到 4d10＋你魅力调整值的伤害（强酸／寒冷／火焰／闪电／雷鸣任选），成功则减半。使用次数等于你的魅力调整值（至少 1 次），长休后恢复。',
    kind: 'reaction', status: 'selectable', sourceIds,
    resource: { maxFromAbility: { ability: 'cha', minimum: 1 }, recovery: 'long-rest' },
  },
  {
    id: 'ua-fr-2024-genies-scion', subclassId: 'subclass-2024-ua-paladin-noble-genies', name: '贵族使徒', englishName: 'Noble Scion', level: 20,
    summary: '附赠动作 10 分钟：60 尺飞行与悬浮；反应将你或灵光内盟友的一次 d20 失败改为成功。长休恢复或 5 环重置。',
    description: '以一个附赠动作，你获得持续 10 分钟的增益（可提前终止）：飞行——60 尺飞行速度并可悬浮；次级祈愿术——当你或守护灵光内的盟友在一次 d20 检定中失败时，你可以用反应将该次检定改为成功。使用后需完成长休才能再次使用；也可消耗一个 5 环法术位重置（无需动作）。',
    kind: 'bonus-action', status: 'selectable', sourceIds,
    resource: { maxByLevel: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], recovery: 'long-rest', note: '可消耗 5 环法术位重置' },
  },

  // ============ 寒冬行者（游侠） ============
  {
    id: 'ua-fr-2024-winter-frigid-explorer', subclassId: 'subclass-2024-ua-ranger-winter-walker', name: '冰霜探索者', englishName: 'Frigid Explorer', level: 3,
    summary: '寒冷抗性；武器命中每回合一次追加寒冷伤害（3 级 1d4、11 级 1d6），无视寒冷抗性。',
    description: '你具有寒冷伤害抗性。当你用武器命中一个生物时，你可以对其额外造成 1d4 寒冷伤害（每个生物每回合限一次；11 级提升为 1d6）。该额外伤害无视目标对寒冷伤害的抗性。',
    kind: 'passive', status: 'selectable', sourceIds,
  },
  {
    id: 'ua-fr-2024-winter-hunters-rime', subclassId: 'subclass-2024-ua-ranger-winter-walker', name: '猎人雾凇', englishName: "Hunter's Rime", level: 3,
    summary: '施展猎人印记时获得 1d10＋游侠等级临时生命；被标记生物不能撤离。',
    description: '当你施展猎人印记时，你获得等于 1d10＋你游侠等级的临时生命值。此外，被你的猎人印记标记的生物无法执行撤离动作。',
    kind: 'passive', status: 'selectable', sourceIds,
  },
  {
    id: 'ua-fr-2024-winter-spells', subclassId: 'subclass-2024-ua-ranger-winter-walker', name: '寒冬行者法术', englishName: 'Winter Walker Spells', level: 3,
    summary: '3／5／9／13／17 级各习得一道始终准备的寒冬行者法术。',
    description: '达到对应游侠等级时，你习得并始终准备寒冬行者法术表中的法术；这些法术不计入准备上限。',
    kind: 'passive', status: 'selectable', sourceIds,
  },
  {
    id: 'ua-fr-2024-winter-fortify-soul', subclassId: 'subclass-2024-ua-ranger-winter-walker', name: '灵魂强化', englishName: 'Fortify Soul', level: 7,
    summary: '短休时选择至多感知调整值名可见生物：恢复 1d10＋游侠等级生命，1 小时内抗恐慌豁免优势；每次长休 1 次。',
    description: '当你完成一次短休时，你可以选择至多等于你感知调整值（至少 1 名）的可见生物。所选生物恢复等于 1d10＋你游侠等级的生命值，并在接下来 1 小时内为避免或结束恐慌状态的豁免中具有优势。此特性每次长休只能使用一次。',
    kind: 'resource', status: 'selectable', sourceIds,
    resource: { maxByLevel: [0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], recovery: 'long-rest', note: '在短休时触发' },
  },
  {
    id: 'ua-fr-2024-winter-chilling-retribution', subclassId: 'subclass-2024-ua-ranger-winter-walker', name: '恶寒惩戒', englishName: 'Chilling Retribution', level: 11,
    summary: '被命中时反应迫使攻击者感知豁免，失败恐慌且速度 0 至你下回合结束；次数＝感知调整值。',
    description: '当有生物以攻击检定命中你时，你可以使用反应迫使该生物进行一次对抗你法术豁免 DC 的感知豁免。失败则目标陷入恐慌状态直至你的下个回合结束，且期间其移动速度降为 0。使用次数等于你的感知调整值（至少 1 次），长休后恢复。',
    kind: 'reaction', status: 'selectable', sourceIds,
    resource: { maxFromAbility: { ability: 'wis', minimum: 1 }, recovery: 'long-rest' },
  },
  {
    id: 'ua-fr-2024-winter-frozen-haunt', subclassId: 'subclass-2024-ua-ranger-winter-walker', name: '冰之恶灵', englishName: 'Frozen Haunt', level: 15,
    summary: '施展猎人印记时化身为冰雪形态：免疫寒冷、15 尺灵光每回合 2d4 寒冷、部分虚化；长休恢复或 4 环重置。',
    description: '当你施展猎人印记时，你可以化身为幽灵般的冰雪形态，持续至该法术结束。处于该形态：你免疫寒冷伤害；你变身时及后续每个回合开始，以你为源 15 尺光环内你选择的生物各受 2d4 寒冷伤害；你免疫受擒、倒地与束缚，可如困难地形般穿过生物与物件，但若在生物或物件内停下则受 1d10 力场伤害，形态结束时若仍在其中则被弹出至最近未占据空间。使用后需长休恢复，或消耗一个 4 环以上法术位重置（无需动作）。',
    kind: 'resource', status: 'selectable', sourceIds,
    resource: { maxByLevel: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1], recovery: 'long-rest', note: '可消耗 4 环以上法术位重置' },
  },

  // ============ 三之门徒（游荡者） ============
  {
    id: 'ua-fr-2024-scion-bloodthirst', subclassId: 'subclass-2024-ua-rogue-scion-of-the-three', name: '嗜血', englishName: 'Bloodthirst', level: 3,
    summary: '偷袭命中浴血生物追加伤害（游荡者等级一半向上取整）；敌人倒下时反应传送 30 尺并近战攻击，次数＝智力调整值。',
    description: '若你的偷袭攻击命中一名浴血生物，目标还将受到等于你游荡者等级一半（向上取整）的额外伤害，伤害类型与武器相同。此外，当一名你可见的敌人生命值降至 0 时，你可以用反应传送至 30 尺内可见的未占据空间，然后发动一次近战攻击。使用次数等于你的智力调整值（至少 1 次），长休后恢复。',
    kind: 'resource', status: 'selectable', sourceIds,
    resource: { maxFromAbility: { ability: 'int', minimum: 1 }, recovery: 'long-rest', note: '仅用于敌人倒下时的反应传送与攻击' },
  },
  {
    id: 'ua-fr-2024-scion-dread-allegiance', subclassId: 'subclass-2024-ua-rogue-scion-of-the-three', name: '敬怖之忠', englishName: 'Dread Allegiance', level: 3,
    summary: '选择班恩（心灵／次级幻象）、巴尔（毒素／剑刃防护）或米尔寇（暗蚀／颤栗之触）；长休可更换。',
    description: '选择死亡三神中的一位：班恩——心灵伤害抗性，施展次级幻象；巴尔——毒素伤害抗性，施展剑刃防护；米尔寇——暗蚀伤害抗性，施展颤栗之触。戏法施法属性为智力。完成长休时你可以重新选择一位神明。',
    kind: 'choice', requiresChoice: true,
    optionIds: ['ua-fr-2024-scion-bane', 'ua-fr-2024-scion-bhaal', 'ua-fr-2024-scion-myrkul'],
    minSelections: 1, maxSelections: 1, status: 'selectable', sourceIds,
  },
  {
    id: 'ua-fr-2024-scion-strike-fear', subclassId: 'subclass-2024-ua-rogue-scion-of-the-three', name: '袭杀恐惧', englishName: 'Strike Fear', level: 9,
    summary: '诡诈打击新增震怖（1d6）：感知豁免失败则恐慌 1 分钟，每回合结束可重复豁免。',
    description: '你获得诡诈打击选项“震怖”（花费 1d6）：目标必须成功通过一次感知豁免，否则陷入恐慌状态，持续 1 分钟；恐慌目标在其每个回合结束时重复豁免，成功则终止效应。',
    kind: 'passive', status: 'selectable', sourceIds,
  },
  {
    id: 'ua-fr-2024-scion-aura', subclassId: 'subclass-2024-ua-rogue-scion-of-the-three', name: '恶毒灵光', englishName: 'Aura of Malevolence', level: 13,
    summary: '每回合开始，10 尺灵光内选定生物受等于智力调整值（至少 1）的选定抗性类型伤害，无视抗性；失能时失效。',
    description: '你的每个回合开始时，每个处于源自你的 10 尺光环内且由你选择的生物受到等于你智力调整值（至少 1）的伤害，伤害类型与你敬怖之忠赋予的抗性类型相同，且无视抗性。你陷入失能期间此灵光失效。',
    kind: 'passive', status: 'selectable', sourceIds,
  },
  {
    id: 'ua-fr-2024-scion-dread-incarnate', subclassId: 'subclass-2024-ua-rogue-scion-of-the-three', name: '恐怖化身', englishName: 'Dread Incarnate', level: 17,
    summary: '对恐慌状态生物攻击具有优势；偷袭伤害骰的 1 与 2 均视为 3。',
    description: '你对陷入恐慌状态的生物发动的攻击具有优势。当你投掷偷袭伤害时，你可以将伤害骰投出的 1 和 2 都视为 3。',
    kind: 'passive', status: 'selectable', sourceIds,
  },

  // ============ 咒火术法（术士） ============
  {
    id: 'ua-fr-2024-spellfire-burst', subclassId: 'subclass-2024-ua-sorcerer-spellfire', name: '咒火迸发', englishName: 'Spellfire Burst', level: 3,
    summary: '回合内消耗术法点时，可释放炽焰鼓舞（临时生命）或辉耀之火（1d6 火焰／光耀）；每回合一次。',
    description: '当你在你的回合中以魔法动作或附赠动作的一部分消耗至少 1 术法点时，你可以释放一种效应（每回合一次）：炽焰鼓舞——你或 30 尺内可见生物获得 1d4＋魅力调整值临时生命值；辉耀之火——30 尺内可见生物敏捷豁免失败则受到 1d6 火焰或光耀伤害（由你选择）。14 级时临时生命值额外加术士等级，辉耀之火提升为 3d6。',
    kind: 'passive', status: 'selectable', sourceIds,
  },
  {
    id: 'ua-fr-2024-spellfire-spells', subclassId: 'subclass-2024-ua-sorcerer-spellfire', name: '咒火法术', englishName: 'Spellfire Spells', level: 3,
    summary: '3／5／7／9 级按咒火法术表始终准备法术。',
    description: '达到对应术士等级时，你始终准备咒火法术表中的法术；这些法术不计入准备上限。',
    kind: 'passive', status: 'selectable', sourceIds,
  },
  {
    id: 'ua-fr-2024-spellfire-absorb', subclassId: 'subclass-2024-ua-sorcerer-spellfire', name: '汲纳法术', englishName: 'Absorb Spells', level: 6,
    summary: '始终准备法术反制；目标对抗你的法术反制失败时，重获 1d4 术法点。',
    description: '你始终准备法术反制。此外，每当一个目标在对抗你所施展的法术反制的豁免中失败时，你重获 1d4 术法点。',
    kind: 'passive', status: 'selectable', sourceIds,
    grantedSpells: [{ spellId: 'spell-2024-counterspell', alwaysPrepared: true }],
  },
  {
    id: 'ua-fr-2024-spellfire-honed', subclassId: 'subclass-2024-ua-sorcerer-spellfire', name: '砥砺咒火', englishName: 'Honed Spellfire', level: 14,
    summary: '炽焰鼓舞额外加术士等级；辉耀之火提升为 3d6。',
    description: '你的咒火迸发更精进：炽焰鼓舞的临时生命值额外加入等于你术士等级的数值；辉耀之火的 1d6 提升为 3d6。',
    kind: 'passive', status: 'selectable', sourceIds,
  },
  {
    id: 'ua-fr-2024-spellfire-crown', subclassId: 'subclass-2024-ua-sorcerer-spellfire', name: '咒火冠冕', englishName: 'Crown of Spellfire', level: 18,
    summary: '附赠动作 1 分钟：消耗生命骰减伤、60 尺飞行与悬浮、法术闪避；长休恢复或 7 术法点重置。',
    description: '以一个附赠动作，你获得持续 1 分钟的增益（可提前终止）：燃尽——每回合一次，被攻击命中时可消耗至多魅力调整值枚生命骰，伤害减少掷骰结果＋术士等级；飞行——60 尺飞行速度并可悬浮；法术闪避——受允许豁免减半伤害的法术或魔法效应影响时，豁免成功免伤、失败减半（失能时失效）。使用后需长休恢复，或消耗 7 点术法点重置（无需动作）。',
    kind: 'bonus-action', status: 'selectable', sourceIds,
    resource: { maxByLevel: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1], recovery: 'long-rest', note: '可消耗 7 点术法点重置' },
  },

  // ============ 剑咏者（法师） ============
  {
    id: 'ua-fr-2024-bladesinger-bladesong', subclassId: 'subclass-2024-ua-wizard-bladesinger', name: '剑歌', englishName: 'Bladesong', level: 3,
    summary: '附赠动作唤起剑歌 1 分钟：AC 加智力调整值（至少 +1）、速度 +10、智力代替力量／敏捷攻击、专注豁免加智力；次数＝智力调整值。',
    description: '以一个附赠动作（未着装护甲或使用盾牌时），你唤起剑歌持续 1 分钟，提前终止于失能、着装护甲或盾牌、或双手并用一把武器攻击。剑歌激活期间：轻敏——AC 获得等于你智力调整值的加值（至少 +1），速度 +10 尺；剑法——使用熟练武器攻击时可用智力调整值代替力量或敏捷；集中——维持专注的体质豁免可加入智力调整值。次数等于智力调整值（至少 1 次），长休后恢复。',
    kind: 'bonus-action', status: 'selectable', sourceIds,
    resource: { maxFromAbility: { ability: 'int', minimum: 1 }, recovery: 'long-rest' },
  },
  {
    id: 'ua-fr-2024-bladesinger-training', subclassId: 'subclass-2024-ua-wizard-bladesinger', name: '战歌训练', englishName: 'Training in War and Song', level: 3,
    summary: '获得非双手、非重型近战军用武器熟练并可用作法师法器；从 4 项技能选 1 获得熟练。',
    description: '你获得所有不具有双手及重型词条的近战军用武器熟练，并可将熟练近战武器作为施展法师法术的法器。此外，你从特技、运动、表演、游说中选择一项获得熟练。',
    kind: 'choice', requiresChoice: true,
    optionIds: ['skill-acrobatics', 'skill-athletics', 'skill-performance', 'skill-persuasion'],
    minSelections: 1, maxSelections: 1, status: 'selectable', sourceIds,
  },
  {
    id: 'ua-fr-2024-bladesinger-extra-attack', subclassId: 'subclass-2024-ua-wizard-bladesinger', name: '额外攻击', englishName: 'Extra Attack', level: 6,
    summary: '攻击动作可攻击两次；其中一次可替换为施展施法时间为动作的法师戏法。',
    description: '你在自己回合内执行攻击动作时，可以发动两次攻击而非一次。此外，你可以施展一道施法时间为动作的法师戏法以取代其中一次攻击。',
    kind: 'passive', status: 'selectable', sourceIds,
  },
  {
    id: 'ua-fr-2024-bladesinger-song-of-defense', subclassId: 'subclass-2024-ua-wizard-bladesinger', name: '守御之歌', englishName: 'Song of Defense', level: 10,
    summary: '剑歌激活期间被伤害时，反应消耗法术位使伤害减少环阶×5。',
    description: '剑歌激活期间，当你受到伤害时，你可以使用反应消耗一个法术位，将该伤害降低等同于该法术位环阶 5 倍的数值。',
    kind: 'reaction', status: 'selectable', sourceIds,
  },
  {
    id: 'ua-fr-2024-bladesinger-song-of-victory', subclassId: 'subclass-2024-ua-wizard-bladesinger', name: '胜利之歌', englishName: 'Song of Victory', level: 14,
    summary: '施展施法时间为动作的法术后，可附赠动作以武器攻击一次。',
    description: '在你施展了一道施法时间为动作的法术之后，你可以执行附赠动作用武器进行一次攻击。',
    kind: 'bonus-action', status: 'selectable', sourceIds,
  },
]

const featuresOf = (subclassId: string): readonly SubclassFeature[] =>
  uaFrSubclassFeatures2024.filter((feature) => feature.subclassId === subclassId)

export const uaFrSubclasses2024: readonly SubclassRule[] = [
  {
    id: 'subclass-2024-ua-bard-moon', classId: 'class-2024-bard', ruleset: '5e-2024', name: '月亮学院', englishName: 'College of the Moon', selectionLevel: 3,
    summary: '以月影群岛传说强化盟友：生命／雾纱／欢欣三种传说，6 级获得免费月华之光，14 级强化传说。',
    status: 'selectable', availability: 'player', sourceIds,
    features: featuresOf('subclass-2024-ua-bard-moon'),
  },
  {
    id: 'subclass-2024-ua-cleric-knowledge', classId: 'class-2024-cleric', ruleset: '5e-2024', name: '知识领域', englishName: 'Knowledge Domain', selectionLevel: 3,
    summary: '以工匠工具、技能专精与思维魔法破解秘密：3／5／7／9 级领域法术，6 级心灵感应，17 级神之预知。',
    status: 'selectable', availability: 'player', sourceIds,
    features: featuresOf('subclass-2024-ua-cleric-knowledge'),
    alwaysPreparedSpellIdsByLevel: {
      3: ['spell-2024-command', 'spell-2024-comprehend-languages', 'spell-2024-detect-magic', 'spell-2024-identify', 'spell-2024-detect-thoughts', 'spell-2024-mind-spike'],
      5: ['spell-2024-dispel-magic', 'spell-2024-nondetection', 'spell-2024-tongues'],
      7: ['spell-2024-arcane-eye', 'spell-2024-banishment', 'spell-2024-confusion'],
      9: ['spell-2024-legend-lore', 'spell-2024-scrying', 'spell-2024-synaptic-static'],
    },
  },
  {
    id: 'subclass-2024-ua-fighter-purple-dragon-knight', classId: 'class-2024-fighter', ruleset: '5e-2024', name: '紫龙骑士', englishName: 'Purple Dragon Knight', selectionLevel: 3,
    summary: '与小紫晶龙并肩作战：龙伴、龙骑士、号令万军与紫晶升华；18 级力场与心灵抗性。',
    status: 'selectable', availability: 'player', sourceIds,
    features: featuresOf('subclass-2024-ua-fighter-purple-dragon-knight'),
  },
  {
    id: 'subclass-2024-ua-paladin-noble-genies', classId: 'class-2024-paladin', ruleset: '5e-2024', name: '巨灵贵族之誓', englishName: 'Oath of the Noble Genies', selectionLevel: 3,
    summary: '以四元素巨灵之力战斗：元素斩、巨灵法术与巨灵之辉，7 级元素护盾灵光，20 级贵族使徒。',
    status: 'selectable', availability: 'player', sourceIds,
    features: featuresOf('subclass-2024-ua-paladin-noble-genies'),
    alwaysPreparedSpellIdsByLevel: {
      3: ['spell-2024-chromatic-orb', 'spell-2024-elementalism', 'spell-2024-thunderous-smite'],
      5: ['spell-2024-mirror-image', 'spell-2024-phantasmal-force'],
      9: ['spell-2024-fly', 'spell-2024-gaseous-form'],
      13: ['spell-2024-conjure-minor-elementals', 'spell-2024-summon-elemental'],
      17: ['spell-2024-banishing-smite', 'spell-2024-contact-other-plane'],
    },
  },
  {
    id: 'subclass-2024-ua-ranger-winter-walker', classId: 'class-2024-ranger', ruleset: '5e-2024', name: '寒冬行者', englishName: 'Winter Walker', selectionLevel: 3,
    summary: '极地猎手：寒冷抗性、猎人雾凇临时生命，7 级灵魂强化，11 级恶寒惩戒，15 级冰之恶灵。',
    status: 'selectable', availability: 'player', sourceIds,
    features: featuresOf('subclass-2024-ua-ranger-winter-walker'),
    alwaysPreparedSpellIdsByLevel: {
      3: ['spell-2024-ice-knife'],
      5: ['spell-2024-pass-without-trace'],
      9: ['spell-2024-remove-curse'],
      13: ['spell-2024-ice-storm'],
      17: ['spell-2024-cone-of-cold'],
    },
  },
  {
    id: 'subclass-2024-ua-rogue-scion-of-the-three', classId: 'class-2024-rogue', ruleset: '5e-2024', name: '三之门徒', englishName: 'Scion of the Three', selectionLevel: 3,
    summary: '死亡三神的代理人：嗜血、敬怖之忠、9 级震怖诡诈打击、13 级恶毒灵光与 17 级恐怖化身。',
    status: 'selectable', availability: 'player', sourceIds,
    features: featuresOf('subclass-2024-ua-rogue-scion-of-the-three'),
  },
  {
    id: 'subclass-2024-ua-sorcerer-spellfire', classId: 'class-2024-sorcerer', ruleset: '5e-2024', name: '咒火术法', englishName: 'Spellfire Sorcery', selectionLevel: 3,
    summary: '以魔网本源之力治疗与灼烧：咒火迸发、咒火法术，6 级汲纳法术，18 级咒火冠冕。',
    status: 'selectable', availability: 'player', sourceIds,
    features: featuresOf('subclass-2024-ua-sorcerer-spellfire'),
  },
  {
    id: 'subclass-2024-ua-wizard-bladesinger', classId: 'class-2024-wizard', ruleset: '5e-2024', name: '剑咏者', englishName: 'Bladesinger', selectionLevel: 3,
    summary: '剑术与奥法共舞：剑歌、战歌训练、6 级额外攻击、10 级守御之歌与 14 级胜利之歌。',
    status: 'selectable', availability: 'player', sourceIds,
    features: featuresOf('subclass-2024-ua-wizard-bladesinger'),
  },
]
