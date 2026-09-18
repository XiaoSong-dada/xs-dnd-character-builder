import type { RuleOption, SubclassFeature, SubclassRule } from '@/types/rules'

/**
 * 破解奥秘：奥术子职（UA）与奥术子职 II。以 II 期为唯一有效版本。
 * 9 个子职；来源 `source-2024-ua-arcane`，默认关闭、状态 selectable。
 */

const sourceIds = ['source-2024-ua-arcane'] as const

const option = (id: string, name: string, englishName: string, description: string): RuleOption => ({
  id, name, englishName, description, status: 'selectable', sourceIds,
})

export const uaArcaneOptions2024: readonly RuleOption[] = [
  option('ua-arcane-2024-shot-banishing', '放逐弹', 'Banishing Shot', '命中额外受一枚射击骰心灵伤害；魅力豁免失败则被放逐（失能、速度为 0）至其下回合结束。'),
  option('ua-arcane-2024-shot-beguiling', '欺诈弹', 'Beguiling Shot', '命中额外受两枚射击骰心灵伤害；感知豁免失败则魅惑至你下回合开始（魅惑源为你或 30 尺内盟友）。'),
  option('ua-arcane-2024-shot-bursting', '爆裂弹', 'Bursting Shot', '目标与源自其 10 尺内生物立即受两枚射击骰力场伤害。'),
  option('ua-arcane-2024-shot-enfeebling', '虚弱弹', 'Enfeebling Shot', '命中额外受两枚射击骰暗蚀；体质豁免失败则中毒至其下回合结束，命中时伤害减一枚射击骰。'),
  option('ua-arcane-2024-shot-grasping', '缠绕弹', 'Grasping Shot', '命中额外受一枚射击骰挥砍；力量豁免失败则束缚 1 分钟（可用动作力量运动检定对抗 DC 解除）。'),
  option('ua-arcane-2024-shot-piercing', '穿梭弹', 'Piercing Shot', '无需攻击检定：1 尺宽 30 尺长线状区域穿越固体，每生物敏捷豁免失败受正常伤害＋两枚射击骰穿刺，成功减半。'),
  option('ua-arcane-2024-shot-seeking', '追踪弹', 'Seeking Shot', '无需攻击检定：追踪 1 分钟内见过的生物，忽视半身／四分之三掩护；敏捷豁免失败受正常伤害＋两枚射击骰力场并知晓其位置，成功减半。'),
  option('ua-arcane-2024-shot-shadow', '遮影弹', 'Shadow Shot', '命中额外受一枚射击骰心灵；感知豁免失败则目盲至其下回合结束。'),
  option('ua-arcane-2024-tattoo-bat', '蝙蝠', 'Bat', '知晓舞光术；消耗功力使用坚强防御或疾步如风时额外获得 1 分钟 10 尺盲视。'),
  option('ua-arcane-2024-tattoo-butterfly', '蝴蝶', 'Butterfly', '知晓光亮术；跳高可用敏捷调整值代替力量计算。'),
  option('ua-arcane-2024-tattoo-crane', '白鹤', 'Crane', '知晓神导术；疾风连击失手后，本次剩余的徒手打击攻击检定具有优势。'),
  option('ua-arcane-2024-tattoo-horse', '骏马', 'Horse', '知晓传讯术；消耗功力使用疾步如风时速度 +10 尺至下回合开始。'),
  option('ua-arcane-2024-tattoo-tortoise', '乌龟', 'Tortoise', '知晓维生术；消耗功力使用坚强防御时 AC +1 至下回合开始。'),
  option('ua-arcane-2024-tattoo-comet', '彗星', 'Comet', '搜索动作可消耗 1 点功力，把武艺骰结果加入感知检定。'),
  option('ua-arcane-2024-tattoo-eclipse', '天蚀', 'Eclipse', '躲藏动作可消耗 1 点功力，把武艺骰结果加入敏捷（隐匿）检定。'),
  option('ua-arcane-2024-tattoo-sunburst', '旭日', 'Sunburst', '研究动作可消耗 1 点功力，把武艺骰结果加入智力检定。'),
  option('ua-arcane-2024-tattoo-sea-storm', '洋流', 'Sea Storm', '获得寒冷／闪电／雷鸣之一抗性；短休、长休或使用运转周天时可更换。'),
  option('ua-arcane-2024-tattoo-volcano', '火山', 'Volcano', '获得强酸／火焰／毒素之一抗性；短休、长休或使用运转周天时可更换。'),
  option('ua-arcane-2024-tattoo-beholder', '眼魔', 'Beholder', '回合开始可花 1 点功力获得等同速度的飞行 10 分钟；魔法动作消耗 1 点功力射出 4 道光束（120 尺，武艺骰＋感知力场伤害）。'),
  option('ua-arcane-2024-tattoo-chromatic-dragon', '色彩龙', 'Chromatic Dragon', '攻击动作中可把一次攻击替换为 30 尺锥状能量，敏捷豁免失败受两枚武艺骰＋感知伤害，成功减半。'),
  option('ua-arcane-2024-tattoo-displacer-beast', '移位兽', 'Displacer Beast', '消耗功力使用疾风连击或疾步如风时，可再花 1 点功力作为该附赠动作的一部分施展镜影术。'),
  option('ua-arcane-2024-tattoo-troll', '巨魔', 'Troll', '浴血且尚有 1 生命时，每回合开始恢复 5＋感知调整值生命；缺失肢体在短休或长休后再生。'),
  option('ua-arcane-2024-stone-darkvision', '黑暗视觉', 'Darkvision', '变化师之石：持有者获得 60 尺黑暗视觉（已有则再扩展 60 尺）。'),
  option('ua-arcane-2024-stone-speed', '速度', 'Speed', '变化师之石：持有者速度 +10 尺。'),
  option('ua-arcane-2024-stone-resistance', '抗性', 'Resistance', '变化师之石：持有者获得强酸／寒冷／闪电／火焰／毒素／雷鸣之一抗性。'),
  option('ua-arcane-2024-stone-mighty-build', '强健身形', 'Mighty Build', '变化师之石（10 级新增）：持有者力量豁免优势，载重按大一级体型计算。'),
  option('ua-arcane-2024-stone-tremorsense', '震颤感知', 'Tremorsense', '变化师之石（10 级新增）：持有者获得 30 尺震颤感知。'),
  option('ua-arcane-2024-modify-fortifying', '健体法术', 'Fortifying Spell', '修饰魔法：法术其中一个目标获得 2d8＋牧师等级临时生命。'),
  option('ua-arcane-2024-modify-tenacious', '稳固法术', 'Tenacious Spell', '修饰魔法：迫使豁免的法术中选一个目标，其本次豁免减去 1d6。'),
]

const ARCANE_SHOT_OPTION_IDS: readonly string[] = [
  'ua-arcane-2024-shot-banishing',
  'ua-arcane-2024-shot-beguiling',
  'ua-arcane-2024-shot-bursting',
  'ua-arcane-2024-shot-enfeebling',
  'ua-arcane-2024-shot-grasping',
  'ua-arcane-2024-shot-piercing',
  'ua-arcane-2024-shot-seeking',
  'ua-arcane-2024-shot-shadow',
]

export const uaArcaneFeatures2024: readonly SubclassFeature[] = [
  // ============ 奥秘领域（牧师） ============
  {
    id: 'ua-arcane-2024-arcana-spells', subclassId: 'subclass-2024-ua-cleric-arcana', name: '奥秘领域法术', englishName: 'Arcane Domain Spells', level: 3,
    summary: '3／5／7／9 级按奥秘领域法术表始终准备法术。',
    description: '达到对应牧师等级时，你始终准备奥秘领域法术表中的法术；这些法术不计入准备上限。',
    kind: 'passive', status: 'selectable', sourceIds,
  },
  {
    id: 'ua-arcane-2024-arcana-initiate', subclassId: 'subclass-2024-ua-cleric-arcana', name: '奥术传承', englishName: 'Arcane Initiate', level: 3,
    summary: '获得奥秘技能熟练与专精；习得两道法师戏法（每次升级可换一道）。',
    description: '若你此前没有奥秘技能熟练，则获得它；你还获得奥秘技能的专精。你习得两道你所选择的法师戏法，每当获得牧师等级时可将其一道替换为另一道法师戏法。',
    kind: 'choice', requiresChoice: true, candidateKind: 'spell-pool',
    spellPool: { level: 0, classIds: ['class-2024-wizard'] },
    spellGrant: { alwaysPrepared: true },
    minSelections: 2, maxSelections: 2, status: 'selectable', sourceIds,
  },
  {
    id: 'ua-arcane-2024-arcana-modify', subclassId: 'subclass-2024-ua-cleric-arcana', name: '修饰魔法', englishName: 'Modify Magic', level: 3,
    summary: '施法时消耗引导神力：健体法术（2d8＋牧师等级临时生命）或稳固法术（目标豁免 −1d6）。',
    description: '当你施展一道法术时，你可以消耗一次引导神力使用次数（无需动作）修改它：健体法术——本法术其中一个目标获得 2d8＋你牧师等级的临时生命值；稳固法术——选择本法术一个目标，其本次豁免检定减去 1d6。',
    kind: 'passive', optionIds: ['ua-arcane-2024-modify-fortifying', 'ua-arcane-2024-modify-tenacious'], status: 'selectable', sourceIds,
  },
  {
    id: 'ua-arcane-2024-arcana-recovery', subclassId: 'subclass-2024-ua-cleric-arcana', name: '驱法复原', englishName: 'Dispelling Recovery', level: 6,
    summary: '施展消耗环位且治疗或终止状态的法术后，可附赠动作免费为同一生物施展解除魔法；次数＝感知调整值。',
    description: '在你施展了一道消耗环位且为其他生物恢复生命值或终止状态的法术后，你可以立即用一个附赠动作，不消耗法术位地为该生物施展解除魔法。使用次数等于你的感知调整值（至少 1 次），长休恢复。',
    kind: 'resource', status: 'selectable', sourceIds,
    resource: { maxFromAbility: { ability: 'wis', minimum: 1 }, recovery: 'long-rest' },
  },
  {
    id: 'ua-arcane-2024-arcana-mastery', subclassId: 'subclass-2024-ua-cleric-arcana', name: '奥术精通', englishName: 'Arcane Mastery', level: 17,
    summary: '习得六、七、八、九环法师法术各一道并始终准备；升级可替换同环法师法术。',
    description: '你习得四道法师法术（六、七、八、九环各一道）并始终准备它们；每当获得牧师等级时，你可以将这些法术替换为同环位的另一道法师法术。',
    kind: 'passive', status: 'selectable', sourceIds,
  },

  // ============ 魔射手（战士，奥术 II） ============
  {
    id: 'ua-arcane-2024-archer-lore', subclassId: 'subclass-2024-ua-fighter-arcane-archer', name: '魔箭学识', englishName: 'Arcane Archer Lore', level: 3,
    summary: '习得德鲁伊伎俩或魔法伎俩（智力施法）；获得奥秘与自然熟练（已熟练则改选其他技能）。',
    description: '你知晓德鲁伊伎俩或魔法伎俩其一，施法属性为智力。你获得奥秘与自然技能熟练；若已熟练其中之一，则改为获得一个你选择的其他技能熟练（两者都熟练时获得两个）。',
    kind: 'passive', status: 'selectable', sourceIds,
  },
  {
    id: 'ua-arcane-2024-archer-shot', subclassId: 'subclass-2024-ua-fighter-arcane-archer', name: '奥术射击', englishName: 'Arcane Shot', level: 3,
    summary: '选择两种奥术射击选项（7／10／15／18 级各再学一种）；每回合一次远程攻击附选项，次数＝智力调整值（短休或长休恢复），射击骰 d6→d12。',
    description: '你习得两种奥术射击选项；7／10／15／18 级各再习得一种，并可替换已知选项。每回合一次，当你用具有弹药词条的武器发动远程攻击时，可将一种已知选项赋予该次攻击（命中并造成伤害时决定，除非选项无需攻击检定）。使用次数等于你的智力调整值（至少 1 次），短休或长休恢复。射击骰初始 d6，10 级 d8、15 级 d10、18 级 d12；豁免 DC＝8＋智力调整值＋熟练加值。',
    kind: 'choice', requiresChoice: true,
    optionIds: ARCANE_SHOT_OPTION_IDS,
    minSelections: 2, maxSelections: 2, uniqueGroup: 'arcane-archer-shots', status: 'selectable', sourceIds,
    resource: { maxFromAbility: { ability: 'int', minimum: 1 }, recovery: 'short-rest' },
  },
  ...[7, 10, 15, 18].map((level): SubclassFeature => ({
    id: `ua-arcane-2024-archer-shot-${level}`, subclassId: 'subclass-2024-ua-fighter-arcane-archer', name: '奥术射击（新增）', englishName: 'Arcane Shot', level,
    summary: `再习得一种奥术射击选项（第 ${level} 级）；已知选项可替换。`,
    description: '你习得一种新的奥术射击选项，也可将已知选项替换为另一种。',
    kind: 'choice', requiresChoice: true, optionIds: ARCANE_SHOT_OPTION_IDS,
    minSelections: 1, maxSelections: 1, uniqueGroup: 'arcane-archer-shots', status: 'selectable', sourceIds,
  })),
  {
    id: 'ua-arcane-2024-archer-curving', subclassId: 'subclass-2024-ua-fighter-arcane-archer', name: '曲线射击', englishName: 'Curving Shot', level: 7,
    summary: '远程攻击失手时附赠动作偏折至 60 尺内另一目标并重新攻击。',
    description: '当你用具有弹药词条的武器攻击失手时，你可以用一个附赠动作使该次射击偏折向你可见的另一个目标（须在你武器射程内且在原目标 60 尺内），并对其重新进行一次攻击检定。',
    kind: 'bonus-action', status: 'selectable', sourceIds,
  },
  {
    id: 'ua-arcane-2024-archer-ammunition', subclassId: 'subclass-2024-ua-fighter-arcane-archer', name: '魔箭之矢', englishName: 'Magical Ammunition', level: 7,
    summary: '魔法动作把非魔法弹药注魔为暗幕弹／敲击弹／蔓生弹；每次短休或长休恢复，或消耗一次回气重置。',
    description: '以一个魔法动作，你可以将一枚非魔法弹药注入魔法效应并射向武器射程内的固体表面：暗幕弹——15 尺内阴影 1 分钟（熄灭非魔法火焰，察觉被动与检定 −5）；敲击弹——15 尺内魔法能量解开普通锁、松开卡死物、打开门闩（声响 300 尺）；蔓生弹——长出 60 尺藤蔓供攀爬，10 分钟后枯萎。每次短休或长休恢复；也可消耗一次回气使用次数恢复。',
    kind: 'action', status: 'selectable', sourceIds,
  },
  {
    id: 'ua-arcane-2024-archer-ever-ready', subclassId: 'subclass-2024-ua-fighter-arcane-archer', name: '有箭无患', englishName: 'Ever-Ready Shot', level: 10,
    summary: '投掷先攻时恢复一次奥术射击使用次数。',
    description: '当你投掷先攻时，你恢复一次奥术射击的使用次数。',
    kind: 'passive', status: 'selectable', sourceIds,
  },
  {
    id: 'ua-arcane-2024-archer-burst', subclassId: 'subclass-2024-ua-fighter-arcane-archer', name: '秘法震爆', englishName: 'Arcane Burst', level: 15,
    summary: '使用不屈时，10 尺内所选生物力量豁免失败被直线推离 20 尺。',
    description: '当你使用不屈特性时，源自你的 10 尺光环内由你选择的每个生物必须通过一次力量豁免对抗你的奥术射击 DC，否则被从你身边直线推离 20 尺。',
    kind: 'passive', status: 'selectable', sourceIds,
  },
  {
    id: 'ua-arcane-2024-archer-masterful', subclassId: 'subclass-2024-ua-fighter-arcane-archer', name: '宗师射术', englishName: 'Masterful Shots', level: 18,
    summary: '可见生物攻击你失手时，反应移动半速并对其远程攻击一次。',
    description: '当一个你可见的生物对你攻击失手时，你可以用反应移动至多等于你速度一半的距离（不引发借机攻击），随后作为该反应的一部分，若攻击者仍在你的武器射程内，你可以对其发动一次远程攻击。',
    kind: 'reaction', status: 'selectable', sourceIds,
  },

  // ============ 纹身武者（武僧，奥术 II） ============
  {
    id: 'ua-arcane-2024-tattoo-magic', subclassId: 'subclass-2024-ua-monk-tattoo-warrior', name: '魔法文身', englishName: 'Magic Tattoos', level: 3,
    summary: '文身效应豁免 DC＝8＋感知调整值＋熟练；文身法术以感知施法；每次长休可重塑一项文身。',
    description: '你通过本子职获得多项魔法文身（位置自定，不影响功能）。文身效应需要豁免时 DC＝8＋感知调整值＋熟练加值；文身授予法术的施法属性为感知。每当你完成长休，你可以重塑一项文身，令其选项改为同一列表中的另一选项。',
    kind: 'passive', status: 'selectable', sourceIds,
  },
  {
    id: 'ua-arcane-2024-tattoo-beast', subclassId: 'subclass-2024-ua-monk-tattoo-warrior', name: '百兽之文身', englishName: 'Beast Tattoos', level: 3,
    summary: '选择两项动物文身：蝙蝠／蝴蝶／白鹤／骏马／乌龟。',
    description: '你获得两个动物文身，从蝙蝠、蝴蝶、白鹤、骏马、乌龟中选择两项；每项提供一道戏法与一项功力联动增益。',
    kind: 'choice', requiresChoice: true,
    optionIds: ['ua-arcane-2024-tattoo-bat', 'ua-arcane-2024-tattoo-butterfly', 'ua-arcane-2024-tattoo-crane', 'ua-arcane-2024-tattoo-horse', 'ua-arcane-2024-tattoo-tortoise'],
    minSelections: 2, maxSelections: 2, uniqueGroup: 'tattoo-warrior-beast', status: 'selectable', sourceIds,
  },
  {
    id: 'ua-arcane-2024-tattoo-celestial', subclassId: 'subclass-2024-ua-monk-tattoo-warrior', name: '天象之文身', englishName: 'Celestial Tattoo', level: 6,
    summary: '选择彗星、天蚀或旭日：对应动作可消耗功力把武艺骰加入检定。',
    description: '你获得一个天体现象文身，从彗星（搜索动作，感知）、天蚀（躲藏动作，敏捷隐匿）、旭日（研究动作，智力）中选择一个。',
    kind: 'choice', requiresChoice: true,
    optionIds: ['ua-arcane-2024-tattoo-comet', 'ua-arcane-2024-tattoo-eclipse', 'ua-arcane-2024-tattoo-sunburst'],
    minSelections: 1, maxSelections: 1, status: 'selectable', sourceIds,
  },
  {
    id: 'ua-arcane-2024-tattoo-nature', subclassId: 'subclass-2024-ua-monk-tattoo-warrior', name: '山海之文身', englishName: 'Nature Tattoo', level: 11,
    summary: '选择洋流（寒冷／闪电／雷鸣）或火山（强酸／火焰／毒素）抗性；可随休息或运转周天更换。',
    description: '你获得一个自然现象文身，从洋流（寒冷／闪电／雷鸣之一抗性）或火山（强酸／火焰／毒素之一抗性）中选择一个；短休、长休或使用运转周天时可更改所选伤害类型。',
    kind: 'choice', requiresChoice: true,
    optionIds: ['ua-arcane-2024-tattoo-sea-storm', 'ua-arcane-2024-tattoo-volcano'],
    minSelections: 1, maxSelections: 1, status: 'selectable', sourceIds,
  },
  {
    id: 'ua-arcane-2024-tattoo-monster', subclassId: 'subclass-2024-ua-monk-tattoo-warrior', name: '魍魉之文身', englishName: 'Monster Tattoo', level: 17,
    summary: '选择眼魔、色彩龙、移位兽或巨魔文身。',
    description: '你获得一个强大生物文身，从眼魔、色彩龙、移位兽、巨魔中选择一个。',
    kind: 'choice', requiresChoice: true,
    optionIds: ['ua-arcane-2024-tattoo-beholder', 'ua-arcane-2024-tattoo-chromatic-dragon', 'ua-arcane-2024-tattoo-displacer-beast', 'ua-arcane-2024-tattoo-troll'],
    minSelections: 1, maxSelections: 1, status: 'selectable', sourceIds,
  },

  // ============ 咒法师（法师，奥术 II） ============
  {
    id: 'ua-arcane-2024-conjurer-transposition', subclassId: 'subclass-2024-ua-wizard-conjurer', name: '王车易位', englishName: 'Benign Transposition', level: 3,
    summary: '附赠动作传送 30 尺；或与自愿的中型及以下生物交换位置；次数＝智力调整值，长休恢复。',
    description: '以一个附赠动作，你传送至多 30 尺至一处可见的未占据空间；或者选择距离内一处被中型或更小生物占据的空间，若该生物自愿，你们交换位置。使用次数等于你的智力调整值（至少 1 次），长休恢复。6 级起距离增至 60 尺，且短休或长休恢复。',
    kind: 'bonus-action', status: 'selectable', sourceIds,
    resource: { maxFromAbility: { ability: 'int', minimum: 1 }, recovery: 'long-rest' },
  },
  {
    id: 'ua-arcane-2024-conjurer-savant', subclassId: 'subclass-2024-ua-wizard-conjurer', name: '咒法学者', englishName: 'Conjuration Savant', level: 3,
    summary: '两道不高于二环的咒法法术免费入书；每获得新环位再免费入书一道咒法法术。',
    description: '从法师法术列表选择两道不高于二环的咒法学派法术免费加入法术书；每当获得一个新环阶法术位时，可再免费将一道法师咒法学派法术加入法术书。',
    kind: 'passive', status: 'selectable', sourceIds,
  },
  {
    id: 'ua-arcane-2024-conjurer-durable', subclassId: 'subclass-2024-ua-wizard-conjurer', name: '强韧召唤', englishName: 'Durable Summons', level: 6,
    summary: '咒法召唤／创造的生物首次出现获得 2×法师等级临时生命；期间获得除力场／心灵／暗蚀／光耀外全抗性。',
    description: '当你消耗法术位施展咒法学派法术召唤或创造生物时，该生物首次出现获得等于你法师等级两倍的临时生命值；其拥有这些临时生命值期间，获得对除力场、心灵、暗蚀、光耀之外所有伤害类型的抗性。',
    kind: 'passive', status: 'selectable', sourceIds,
  },
  {
    id: 'ua-arcane-2024-conjurer-focused', subclassId: 'subclass-2024-ua-wizard-conjurer', name: '潜神咒唤', englishName: 'Focused Conjuration', level: 10,
    summary: '对咒法学派法术的专注不会因受伤而中断。',
    description: '你对咒法学派法术的专注不会因受到伤害而中断。',
    kind: 'passive', status: 'selectable', sourceIds,
  },
  {
    id: 'ua-arcane-2024-conjurer-splintered', subclassId: 'subclass-2024-ua-wizard-conjurer', name: '裂分召唤', englishName: 'Splintered Summons', level: 14,
    summary: '施展指定召唤法术时改为召唤两名（生命值减半）；长休恢复，或消耗 5 环以上法术位重置。',
    description: '当你消耗法术位施展异怪召唤术、构装召唤术、龙类召唤术、元素召唤术或妖精召唤术时，你可以调整法术使其召唤两名而非一名生物：种类相同、生命值减半、出现在施法范围内不同未占据空间。使用后需长休恢复，或消耗一个五环及以上法术位重置（无需动作）。',
    kind: 'passive', status: 'selectable', sourceIds,
  },

  // ============ 惑控师（法师，奥术 II） ============
  {
    id: 'ua-arcane-2024-enchanter-conversationalist', subclassId: 'subclass-2024-ua-wizard-enchanter', name: '惑心交谈者', englishName: 'Enchanting Conversationalist', level: 3,
    summary: '获得欺瞒／威吓／游说之一熟练；所选技能检定加智力调整值（至少 +1）。',
    description: '你获得欺瞒、威吓或游说之一的熟练；当你进行所选技能的属性检定时，获得等于你智力调整值的加值（至少 +1）。',
    kind: 'choice', requiresChoice: true,
    optionIds: ['skill-deception', 'skill-intimidation', 'skill-persuasion'],
    minSelections: 1, maxSelections: 1, status: 'selectable', sourceIds,
  },
  {
    id: 'ua-arcane-2024-enchanter-savant', subclassId: 'subclass-2024-ua-wizard-enchanter', name: '惑控学者', englishName: 'Enchanter Savant', level: 3,
    summary: '两道不高于二环的惑控法术免费入书；每获得新环位再免费入书一道惑控法术。',
    description: '从法师法术列表选择两道不高于二环的惑控学派法术免费加入法术书；每当获得一个新环阶法术位时，可再免费将一道法师惑控学派法术加入法术书。',
    kind: 'passive', status: 'selectable', sourceIds,
  },
  {
    id: 'ua-arcane-2024-enchanter-hypnotic', subclassId: 'subclass-2024-ua-wizard-enchanter', name: '催眠仪态', englishName: 'Hypnotic Presence', level: 3,
    summary: '魔法动作令 10 尺内可见生物感知豁免失败则魅惑（失能、速度为 0）；长休恢复，或消耗 1+ 环法术位恢复。',
    description: '以一个魔法动作，指定你 10 尺内一个可见生物；若其能看见或听见你，必须通过一次对抗你法术豁免 DC 的感知豁免，否则陷入魅惑 1 分钟（或直到你的专注中止、目标离你超过 10 尺、不能看见／听见你、或受到伤害）。魅惑期间目标失能且速度为 0。使用后需长休恢复，或消耗一个 1 环及以上法术位恢复。',
    kind: 'action', status: 'selectable', sourceIds,
  },
  {
    id: 'ua-arcane-2024-enchanter-split', subclassId: 'subclass-2024-ua-wizard-enchanter', name: '分裂惑控', englishName: 'Split Enchantment', level: 6,
    summary: '可通过升环选择额外目标的惑控法术有效环阶 +1；次数＝智力调整值，长休恢复。',
    description: '当你施展一道可通过升环施法选择额外生物为目标的惑控系法术时，该法术的有效环阶提升一环。使用次数等于你的智力调整值，长休恢复。',
    kind: 'resource', status: 'selectable', sourceIds,
    resource: { maxFromAbility: { ability: 'int', minimum: 1 }, recovery: 'long-rest' },
  },
  {
    id: 'ua-arcane-2024-enchanter-instinctive', subclassId: 'subclass-2024-ua-wizard-enchanter', name: '直觉魅惑', englishName: 'Instinctive Charm', level: 10,
    summary: '30 尺内可见生物命中你时，反应迫使其感知豁免；失败则攻击改为失手并可转向其攻击范围内其他生物；长休恢复，或以惑控法术恢复。',
    description: '当一个你 30 尺内可见的生物以攻击命中你时，你可以用反应迫使攻击者进行对抗你法术豁免 DC 的感知豁免。失败时该攻击改为失手；若攻击者攻击范围内有其他生物，该攻击改为以该生物为目标（由你选择），使用相同攻击检定。使用后需长休恢复，或以一枚法术位施展惑控系法术恢复。',
    kind: 'reaction', status: 'selectable', sourceIds,
  },
  {
    id: 'ua-arcane-2024-enchanter-alter-memories', subclassId: 'subclass-2024-ua-wizard-enchanter', name: '编演记忆', englishName: 'Alter Memories', level: 14,
    summary: '始终准备篡改记忆；施展时可额外指定法术范围内第二个生物为目标。',
    description: '你始终准备篡改记忆；当你施展该法术时，若法术范围内有第二个生物，你可以指定它为目标。',
    kind: 'passive', status: 'selectable', sourceIds,
    grantedSpells: [{ spellId: 'spell-2024-modify-memory', alwaysPrepared: true }],
  },

  // ============ 死灵师（法师，奥术 II） ============
  {
    id: 'ua-arcane-2024-necromancer-savant', subclassId: 'subclass-2024-ua-wizard-necromancer', name: '死灵学者', englishName: 'Necromancy Savant', level: 3,
    summary: '两道不高于二环的死灵法术免费入书；每获得新环位再免费入书一道死灵法术。',
    description: '从法师法术列表选择两道不高于二环的死灵学派法术免费加入法术书；每当获得一个新环阶法术位时，可再免费将一道法师死灵学派法术加入法术书。',
    kind: 'passive', status: 'selectable', sourceIds,
  },
  {
    id: 'ua-arcane-2024-necromancer-spellbook', subclassId: 'subclass-2024-ua-wizard-necromancer', name: '死灵魔典', englishName: 'Necromancy Spellbook', level: 3,
    summary: '暗蚀抗性；以法术位施展死灵法术时可令 60 尺内亡灵恢复环阶＋法师等级生命；寻获魔宠可召唤骷髅或丧尸。',
    description: '你获得暗蚀伤害抗性。当你使用法术位施展死灵学派法术时，你可以选择 60 尺内一名亡灵恢复等于所消耗法术环阶＋你法师等级的生命值。寻获魔宠加入你的法术书，施展时可选择骷髅或丧尸作为特殊形态。',
    kind: 'passive', status: 'selectable', sourceIds,
  },
  {
    id: 'ua-arcane-2024-necromancer-grave-power', subclassId: 'subclass-2024-ua-wizard-necromancer', name: '坟冢之力', englishName: 'Grave Power', level: 6,
    summary: '持握法术书时：奥术回想使力竭 −1；法师法术与特性的暗蚀伤害无视抗性。',
    description: '持握你的法术书期间：当你使用奥术回想时，你的力竭等级（若有）降低 1 级；你的法师法术与法师特性造成的暗蚀伤害无视暗蚀伤害抗性。',
    kind: 'passive', status: 'selectable', sourceIds,
  },
  {
    id: 'ua-arcane-2024-necromancer-thralls', subclassId: 'subclass-2024-ua-wizard-necromancer', name: '亡灵仆役', englishName: 'Undead Thralls', level: 6,
    summary: '始终准备活化死尸并可免费施展一次（可调整升 1 环）；召唤亡灵获得环阶＋智力调整值生命与智力调整值额外暗蚀。',
    description: '你始终准备活化死尸，并可无需法术位施展一次；每次施展时可调整法术使其有效环位提升 1 环。此外，每当你使用法术位施展创造或召唤亡灵的死灵法术时，该亡灵在持续时间内最大与当前生命值增加（所用法术位环阶＋智力调整值），且其攻击命中时额外造成等于你智力调整值的暗蚀伤害（至少 1）。',
    kind: 'passive', status: 'selectable', sourceIds,
    grantedSpells: [{ spellId: 'spell-2024-animate-dead', alwaysPrepared: true, freeCastings: 1, recovery: 'long-rest' }],
  },
  {
    id: 'ua-arcane-2024-necromancer-harvest', subclassId: 'subclass-2024-ua-wizard-necromancer', name: '收割亡灵', englishName: 'Harvest Undead', level: 10,
    summary: '浴血后反应将一名受控亡灵降至 0 生命并恢复法师等级生命。',
    description: '当你因受伤进入浴血但未被直接杀死后，你可以立即用一个反应将一名由你控制的可见亡灵降至 0 生命值，随后恢复等于你法师等级的生命值。',
    kind: 'reaction', status: 'selectable', sourceIds,
  },
  {
    id: 'ua-arcane-2024-necromancer-master', subclassId: 'subclass-2024-ua-wizard-necromancer', name: '死之主', englishName: "Death's Master", level: 14,
    summary: '持握法术书时：附赠动作给自造亡灵法师等级临时生命（每个 24 小时一次）；可见亡灵降至 0 时可引爆（未受控需反应与 5 环位）。',
    description: '持握法术书期间：以一个附赠动作，指定 60 尺内任意数量由你用死灵法术创造或召唤的亡灵，各获得等于你法师等级的临时生命值（每个亡灵 24 小时内只能获得一次）；当一名你可见的亡灵降至 0 生命值时，你可以使其爆发出暗蚀能量——掷该生物未消耗生命骰数量一半（向上取整，至少 1）的 d6，源自其 10 尺光环内生物敏捷豁免失败受等量暗蚀且下回合开始前不能执行反应，成功减半；若该亡灵不受你控制，你必须用反应并消耗一个五环及以上法术位。',
    kind: 'passive', status: 'selectable', sourceIds,
  },

  // ============ 变化师（法师，奥术 II） ============
  {
    id: 'ua-arcane-2024-transmuter-savant', subclassId: 'subclass-2024-ua-wizard-transmuter', name: '变化学者', englishName: 'Transmutation Savant', level: 3,
    summary: '两道不高于二环的变化法术免费入书；每获得新环位再免费入书一道变化法术。',
    description: '从法师法术列表选择两道不高于二环的变化学派法术免费加入法术书；每当获得一个新环阶法术位时，可再免费将一道法师变化学派法术加入法术书。',
    kind: 'passive', status: 'selectable', sourceIds,
  },
  {
    id: 'ua-arcane-2024-transmuter-stone', subclassId: 'subclass-2024-ua-wizard-transmuter', name: '变化师之石', englishName: "Transmuter's Stone", level: 3,
    summary: '长休创造变化师之石（法器）：持有者体质豁免熟练＋黑暗视觉／速度／抗性之一；施展变化法术后可更换。',
    description: '每当你完成长休后，你可以创造一颗变化师之石（微型物件，可作法师法器）直到你再次使用此特性。持有者获得体质豁免熟练，以及由你在创造时选择的一项增益：黑暗视觉（60 尺，已有则再扩展 60 尺）；速度（+10 尺）；抗性（强酸／寒冷／闪电／火焰／毒素／雷鸣之一）。当你消耗法术位施展一道变化系法术后，你可以改变该增益。10 级起可选择两个增益（抗性可选两次但伤害类型须不同），并新增强健身形与震颤感知选项。',
    kind: 'choice', requiresChoice: true,
    optionIds: ['ua-arcane-2024-stone-darkvision', 'ua-arcane-2024-stone-speed', 'ua-arcane-2024-stone-resistance'],
    minSelections: 1, maxSelections: 1, status: 'selectable', sourceIds,
  },
  {
    id: 'ua-arcane-2024-transmuter-wondrous', subclassId: 'subclass-2024-ua-wizard-transmuter', name: '妙法化形', englishName: 'Wondrous Alteration', level: 3,
    summary: '始终准备变身术并可免费施展一次（长休恢复）；变形期间三项选项各获额外增益。',
    description: '你始终准备变身术，并可无需法术位施展一次（长休恢复）。变身术效应期间：水栖适应——水下可用附赠动作疾走；改变面容——魅力（欺瞒）检定优势；天生武器——伤害提升至 2d6 且维持专注的体质豁免优势。',
    kind: 'passive', status: 'selectable', sourceIds,
    grantedSpells: [{ spellId: 'spell-2024-alter-self', alwaysPrepared: true, freeCastings: 1, recovery: 'long-rest' }],
  },
  {
    id: 'ua-arcane-2024-transmuter-empowered', subclassId: 'subclass-2024-ua-wizard-transmuter', name: '强力变化', englishName: 'Empowered Transmutation', level: 6,
    summary: '施展非伤害变化法术时可升 1 环施展；次数＝智力调整值，长休恢复。',
    description: '当你施展一道不造成伤害的变化系法术并消耗法术位时，你可以将其以比所消耗法术位高一环的形式施展。使用次数等于你的智力调整值（至少 1 次），长休恢复。',
    kind: 'resource', status: 'selectable', sourceIds,
    resource: { maxFromAbility: { ability: 'int', minimum: 1 }, recovery: 'long-rest' },
  },
  {
    id: 'ua-arcane-2024-transmuter-shapechanger', subclassId: 'subclass-2024-ua-wizard-transmuter', name: '变形生物', englishName: 'Shapechanger', level: 10,
    summary: '始终准备变形术并可免费施展一次；对自身施展时可保留生物类型／智力感知魅力／职业特性与语言并能施展变化法术。',
    description: '你始终准备变形术并可无需法术位施展一次（长休恢复）。当你将自身作为该法术目标时，你可以调整它：保留你的生物类型、记忆与说话能力，以及智力、感知、魅力属性值、职业特性、语言和专长；并可在变形期间正常施展变化系法术（需有价值或消耗材料成分者除外）。此调整每次长休后恢复。',
    kind: 'passive', status: 'selectable', sourceIds,
    grantedSpells: [{ spellId: 'spell-2024-polymorph', alwaysPrepared: true, freeCastings: 1, recovery: 'long-rest' }],
  },
  {
    id: 'ua-arcane-2024-transmuter-master', subclassId: 'subclass-2024-ua-wizard-transmuter', name: '变化宗师', englishName: 'Master Transmutation', level: 14,
    summary: '持石时魔法动作耗尽石中魔力：大变化师／万灵秘药／起死回生／返老还童；可消耗 5 环以上法术位防止石头破碎。',
    description: '当你携带着变化师之石时，以一个魔法动作，你可以耗尽石中魔力并选择：大变化师——触碰一件非魔法物件 10 分钟，将其变为大小重量相似、价值相近或更低的非魔法物件；万灵秘药——触碰一名生物，恢复其最大生命值一半（向下取整），治愈全部魔法疫病与诅咒（含诅咒物品同调），终止中毒或石化；起死回生——无需法术位施展死者复活并用石头代替耗材；返老还童——触碰自愿生物，力竭归 0，外貌年轻 3d10 岁（不低于刚成年）。作为该魔法动作的一部分，你可以消耗一个五环及以上法术位防止石头破碎。',
    kind: 'action', status: 'selectable', sourceIds,
  },

  // ============ 咒剑宗主（魔契师，奥术一期有效版） ============
  {
    id: 'ua-arcane-2024-hexblade-spells', subclassId: 'subclass-2024-ua-warlock-hexblade', name: '咒剑法术', englishName: 'Hexblade Spells', level: 3,
    summary: '3／5／7／9 级按咒剑法术表始终准备法术。',
    description: '达到对应魔契师等级时，你始终准备咒剑法术表中的法术；这些法术不计入准备上限。',
    kind: 'passive', status: 'selectable', sourceIds,
  },
  {
    id: 'ua-arcane-2024-hexblade-curse', subclassId: 'subclass-2024-ua-warlock-hexblade', name: '咒剑诅咒', englishName: "Hexblade's Curse", level: 3,
    summary: '附赠动作诅咒 30 尺内可见生物 1 分钟：目标死亡时治疗 1d8＋魅力；未着甲且未持盾时在目标 10 尺内 AC +2；次数＝魅力调整值。',
    description: '以一个附赠动作，你可以选择 30 尺内可见的一个生物作为目标，诅咒它 1 分钟（再次使用、主动解除或你死亡时提前结束）：饥渴诅咒——每当目标生命值降至 0，你恢复 1d8＋魅力调整值的生命值；咒缚护盾——当你未穿戴护甲且未持盾牌时，你在目标 10 尺内期间 AC 获得 +2 加值。使用次数等于你的魅力调整值（至少 1 次），长休恢复。当你使用法术位施展对目标施加诅咒的法术时，可同时发动咒剑诅咒（不消耗附赠动作），持续时间取两者更长者。',
    kind: 'bonus-action', status: 'selectable', sourceIds,
    resource: { maxFromAbility: { ability: 'cha', minimum: 1 }, recovery: 'long-rest' },
  },
  {
    id: 'ua-arcane-2024-hexblade-will', subclassId: 'subclass-2024-ua-warlock-hexblade', name: '不屈意志', englishName: 'Unyielding Will', level: 3,
    summary: '维持专注成功时 10 尺内所选生物受 2d6 暗蚀（每回合一次）；专注失败时可改为成功并获得 1d10＋魔契师等级临时生命（每次长休一次）。',
    description: '当你在维持专注的豁免中成功时，源自你的 10 尺光环内由你指定的每个生物受到 2d6 暗蚀伤害；此增益一经使用，直到你下回合开始前不能再次使用。此外，当你在维持专注的豁免中失败时，你可以将其改为成功，并获得 1d10＋魔契师等级的临时生命值；此效果每次长休后恢复。',
    kind: 'passive', status: 'selectable', sourceIds,
  },
  {
    id: 'ua-arcane-2024-hexblade-brutality', subclassId: 'subclass-2024-ua-warlock-hexblade', name: '恶毒暴行', englishName: 'Malign Brutality', level: 6,
    summary: '施一环以上动作法术后可附赠动作武器攻击；命中诅咒目标时其下次豁免劣势；目标在 30 尺外结束回合时可向其移动。',
    description: '你获得三项增益：折磨巫咒——施展一环及以上、施法时间为动作的法术后，你可以用一个附赠动作以武器进行一次攻击；妨害诅咒——当你以攻击命中咒剑诅咒目标时，目标在你下回合开始前的下一次豁免检定具有劣势；紧咬巫咒——当你的咒剑诅咒目标在距你 30 尺或更远处结束回合时，你可以朝目标直线移动至多等于你速度的距离。',
    kind: 'passive', status: 'selectable', sourceIds,
  },
  {
    id: 'ua-arcane-2024-hexblade-armor', subclassId: 'subclass-2024-ua-warlock-hexblade', name: '巫咒护甲', englishName: 'Armor of Hexes', level: 10,
    summary: '受到咒剑诅咒目标伤害时，反应减少魔契师等级数值。',
    description: '当你受到来自咒剑诅咒目标的伤害时，你可以用反应令该次伤害减少，数值等于你的魔契师等级。',
    kind: 'reaction', status: 'selectable', sourceIds,
  },
  {
    id: 'ua-arcane-2024-hexblade-master', subclassId: 'subclass-2024-ua-warlock-hexblade', name: '巫咒大师', englishName: 'Masterful Hex', level: 14,
    summary: '对诅咒目标 19—20 即重击；引爆诅咒 3d6 并减速度（长休或契约位重置）；短休或秘法回流恢复一次咒剑诅咒。',
    description: '你获得三项增益：咒缚重击——你对咒剑诅咒目标的攻击检定掷出 19 或 20 即重击；爆裂巫咒——你对诅咒目标造成伤害时可引爆诅咒，目标与源自其 10 尺光环内所选生物受 3d6 暗蚀／心灵／光耀伤害（由你选择）且速度 −10 尺至你下回合开始（每次长休后恢复，或消耗一个契约法术位重置）；巫咒回响——完成短休或使用秘法回流时恢复一次已消耗的咒剑诅咒次数。',
    kind: 'passive', status: 'selectable', sourceIds,
  },

  // ============ 先祖术法（术士，奥术一期） ============
  {
    id: 'ua-arcane-2024-ancestral-lore', subclassId: 'subclass-2024-ua-sorcerer-ancestral', name: '先祖学识', englishName: "Ancestor's Lore", level: 3,
    summary: '智力检定加魅力调整值（至少 +1）；从奥秘／历史／调查／自然／宗教选 1 熟练。',
    description: '当你进行智力检定时，获得等于你魅力调整值的加值（至少 +1）。此外，你从奥秘、历史、调查、自然、宗教中选择一项获得熟练。',
    kind: 'choice', requiresChoice: true,
    optionIds: ['skill-arcana', 'skill-history', 'skill-investigation', 'skill-nature', 'skill-religion'],
    minSelections: 1, maxSelections: 1, status: 'selectable', sourceIds,
  },
  {
    id: 'ua-arcane-2024-ancestral-spells', subclassId: 'subclass-2024-ua-sorcerer-ancestral', name: '先祖法术', englishName: 'Ancestral Spells', level: 3,
    summary: '3／5／7／9 级按血脉法术表始终准备法术。',
    description: '达到对应术士等级时，你始终准备血脉法术表中的法术；这些法术不计入准备上限。',
    kind: 'passive', status: 'selectable', sourceIds,
  },
  {
    id: 'ua-arcane-2024-ancestral-visage', subclassId: 'subclass-2024-ua-sorcerer-ancestral', name: '先祖面相', englishName: 'Visage of the Ancestor', level: 3,
    summary: '先天术法激活期间显现先祖形态，影响动作的技能检定具有优势。',
    description: '选择你的先祖所显现的形态。你的先天术法特性激活期间，此形态以灵体幻影笼罩你，且你在进行影响动作所使用的技能检定中具有优势。',
    kind: 'passive', status: 'selectable', sourceIds,
  },
  {
    id: 'ua-arcane-2024-ancestral-disruption', subclassId: 'subclass-2024-ua-sorcerer-ancestral', name: '高阶扰魔', englishName: 'Superior Spell Disruption', level: 6,
    summary: '始终准备法术反制与解除魔法；先天术法激活期间各免费施展一次（法术反制使目标体质豁免劣势、解除魔法的检定优势）。',
    description: '你始终准备法术反制与解除魔法。你的先天术法特性激活期间，你可以不消耗法术位施展这两道法术各一次；以此施展法术反制时目标体质豁免具有劣势，施展解除魔法时你在终止法术效应的检定中具有优势。每次长休后恢复相应法术的免费施展。',
    kind: 'passive', status: 'selectable', sourceIds,
    grantedSpells: [
      { spellId: 'spell-2024-counterspell', alwaysPrepared: true, freeCastings: 1, recovery: 'long-rest' },
      { spellId: 'spell-2024-dispel-magic', alwaysPrepared: true, freeCastings: 1, recovery: 'long-rest' },
    ],
  },
  {
    id: 'ua-arcane-2024-ancestral-majesty', subclassId: 'subclass-2024-ua-sorcerer-ancestral', name: '先祖威仪', englishName: 'Ancestral Majesty', level: 14,
    summary: '先天术法激活期间 5 尺灵光：生物进入或结束回合时魅力豁免失败则倒地或恐慌（由你选择）至你下回合结束。',
    description: '你的先天术法特性激活期间，你被 5 尺光环的魔法灵光环绕。每当一名你可见的生物进入光环或在其内结束回合时，你可以迫使它进行魅力豁免；失败则陷入倒地或恐慌状态（由你选择）直至你的下回合结束。每个生物每回合只进行一次该豁免。',
    kind: 'passive', status: 'selectable', sourceIds,
  },
  {
    id: 'ua-arcane-2024-ancestral-steady', subclassId: 'subclass-2024-ua-sorcerer-ancestral', name: '八风不动', englishName: 'Steady Spellcaster', level: 14,
    summary: '对术士法术的专注不会因受伤被打断。',
    description: '你对术士法术的专注不会因受到伤害而被打断。',
    kind: 'passive', status: 'selectable', sourceIds,
  },
  {
    id: 'ua-arcane-2024-ancestral-ward', subclassId: 'subclass-2024-ua-sorcerer-ancestral', name: '先祖护佑', englishName: "Ancestor's Ward", level: 18,
    summary: '先天术法激活期间对抗法术的豁免具有优势；每次激活可一次把失败改为成功。',
    description: '你的先天术法特性激活期间，你在对抗法术的豁免检定上具有优势。此外，每次先天术法特性激活期间一次，当你失败于一道法术的豁免检定时，你可以将其改为豁免成功。',
    kind: 'passive', status: 'selectable', sourceIds,
  },
]

const featuresOf = (subclassId: string): readonly SubclassFeature[] =>
  uaArcaneFeatures2024.filter((feature) => feature.subclassId === subclassId)

export const uaArcaneSubclasses2024: readonly SubclassRule[] = [
  {
    id: 'subclass-2024-ua-cleric-arcana', classId: 'class-2024-cleric', ruleset: '5e-2024', name: '奥秘领域', englishName: 'Arcana Domain', selectionLevel: 3,
    summary: '奥术与信仰结合：领域法术、奥术传承（法师戏法与奥秘专精）、修饰魔法、驱法复原与奥术精通。',
    status: 'selectable', availability: 'player', sourceIds,
    features: featuresOf('subclass-2024-ua-cleric-arcana'),
    alwaysPreparedSpellIdsByLevel: {
      3: ['spell-2024-detect-magic', 'spell-2024-magic-missile', 'spell-2024-magic-weapon', 'spell-2024-ua-nystuls-magic-aura'],
      5: ['spell-2024-counterspell', 'spell-2024-dispel-magic'],
      7: ['spell-2024-arcane-eye', 'spell-2024-leomund-s-secret-chest'],
      9: ['spell-2024-bigby-s-hand', 'spell-2024-teleportation-circle'],
    },
  },
  {
    id: 'subclass-2024-ua-fighter-arcane-archer', classId: 'class-2024-fighter', ruleset: '5e-2024', name: '魔射手', englishName: 'Arcane Archer', selectionLevel: 3,
    summary: '以魔法箭矢作战：8 种奥术射击、曲线射击、魔箭之矢、有箭无患、秘法震爆与宗师射术。',
    status: 'selectable', availability: 'player', sourceIds,
    features: featuresOf('subclass-2024-ua-fighter-arcane-archer'),
  },
  {
    id: 'subclass-2024-ua-monk-tattoo-warrior', classId: 'class-2024-monk', ruleset: '5e-2024', name: '纹身武者', englishName: 'Tattooed Warrior', selectionLevel: 3,
    summary: '以魔法文身作战：百兽、天象、山海与魍魉文身提供多样增益。',
    status: 'selectable', availability: 'player', sourceIds,
    features: featuresOf('subclass-2024-ua-monk-tattoo-warrior'),
  },
  {
    id: 'subclass-2024-ua-wizard-conjurer', classId: 'class-2024-wizard', ruleset: '5e-2024', name: '咒法师', englishName: 'Conjurer', selectionLevel: 3,
    summary: '空间与召唤专家：王车易位、强韧召唤、潜神咒唤与裂分召唤。',
    status: 'selectable', availability: 'player', sourceIds,
    features: featuresOf('subclass-2024-ua-wizard-conjurer'),
    spellbookExtraSpells: { base: 2, perNewSpellLevel: 1, schools: ['咒法'] },
  },
  {
    id: 'subclass-2024-ua-wizard-enchanter', classId: 'class-2024-wizard', ruleset: '5e-2024', name: '惑控师', englishName: 'Enchanter', selectionLevel: 3,
    summary: '操控心智：催眠仪态、分裂惑控、直觉魅惑与编演记忆。',
    status: 'selectable', availability: 'player', sourceIds,
    features: featuresOf('subclass-2024-ua-wizard-enchanter'),
    spellbookExtraSpells: { base: 2, perNewSpellLevel: 1, schools: ['惑控'] },
  },
  {
    id: 'subclass-2024-ua-wizard-necromancer', classId: 'class-2024-wizard', ruleset: '5e-2024', name: '死灵师', englishName: 'Necromancer', selectionLevel: 3,
    summary: '生死之力：死灵魔典、坟冢之力、亡灵仆役、收割亡灵与死之主。',
    status: 'selectable', availability: 'player', sourceIds,
    features: featuresOf('subclass-2024-ua-wizard-necromancer'),
    spellbookExtraSpells: { base: 2, perNewSpellLevel: 1, schools: ['死灵'] },
  },
  {
    id: 'subclass-2024-ua-wizard-transmuter', classId: 'class-2024-wizard', ruleset: '5e-2024', name: '变化师', englishName: 'Transmuter', selectionLevel: 3,
    summary: '重塑物质与能量：变化师之石、妙法化形、强力变化、变形生物与变化宗师。',
    status: 'selectable', availability: 'player', sourceIds,
    features: featuresOf('subclass-2024-ua-wizard-transmuter'),
    spellbookExtraSpells: { base: 2, perNewSpellLevel: 1, schools: ['变化'] },
  },
  {
    id: 'subclass-2024-ua-warlock-hexblade', classId: 'class-2024-warlock', ruleset: '5e-2024', name: '咒剑宗主', englishName: 'Hexblade Patron', selectionLevel: 3,
    summary: '与诅咒之剑缔约：咒剑诅咒、不屈意志、恶毒暴行、巫咒护甲与巫咒大师。',
    status: 'selectable', availability: 'player', sourceIds,
    features: featuresOf('subclass-2024-ua-warlock-hexblade'),
    alwaysPreparedSpellIdsByLevel: {
      3: ['spell-2024-hex', 'spell-2024-shield', 'spell-2024-wrathful-smite', 'spell-2024-arcane-vigor'],
      5: ['spell-2024-conjure-barrage', 'spell-2024-bestow-curse'],
      7: ['spell-2024-freedom-of-movement', 'spell-2024-staggering-smite'],
      9: ['spell-2024-animate-objects', 'spell-2024-steel-wind-strike'],
    },
  },
  {
    id: 'subclass-2024-ua-sorcerer-ancestral', classId: 'class-2024-sorcerer', ruleset: '5e-2024', name: '先祖术法', englishName: 'Ancestral Sorcery', selectionLevel: 3,
    summary: '承载先祖之力：先祖学识、血脉法术、先祖面相、高阶扰魔与先祖护佑。',
    status: 'selectable', availability: 'player', sourceIds,
    features: featuresOf('subclass-2024-ua-sorcerer-ancestral'),
    alwaysPreparedSpellIdsByLevel: {
      3: ['spell-2024-guidance', 'spell-2024-resistance', 'spell-2024-command', 'spell-2024-protection-from-evil-and-good', 'spell-2024-locate-object', 'spell-2024-spiritual-weapon'],
      5: ['spell-2024-magic-circle', 'spell-2024-spirit-guardians'],
      7: ['spell-2024-divination', 'spell-2024-locate-creature'],
      9: ['spell-2024-legend-lore'],
    },
  },
]
