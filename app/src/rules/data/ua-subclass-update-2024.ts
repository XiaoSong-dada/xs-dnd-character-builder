import type { RuleOption, SubclassFeature, SubclassRule } from '@/types/rules'

/**
 * 破解奥秘：子职业更新（XGE／DMG 2014 子职的 2024 版本，UA）。
 * 5 个子职；来源 `source-2024-ua-subclass-update`，默认关闭、状态 selectable。
 * 破誓者沿用 DM 选项语义（availability: 'dm-only'）。
 */

const sourceIds = ['source-2024-ua-subclass-update'] as const

const option = (id: string, name: string, englishName: string, description: string): RuleOption => ({
  id, name, englishName, description, status: 'selectable', sourceIds,
})

export const uaSubclassUpdateOptions2024: readonly RuleOption[] = [
  option('ua-update-2024-storm-desert', '沙漠', 'Desert', '风暴灵光·沙漠：激活时按狂暴伤害加值投 d4，光环内生物敏捷豁免失败受等量火焰伤害；可选一名可见生物自动成功。'),
  option('ua-update-2024-storm-sea', '海洋', 'Sea', '风暴灵光·海洋：激活时按狂暴伤害加值投 d6，对光环内可见生物掷闪电束，敏捷豁免失败受等量闪电伤害、成功减半。'),
  option('ua-update-2024-storm-tundra', '冻原', 'Tundra', '风暴灵光·冻原：激活时按狂暴伤害加值投 d4，目标力量豁免失败则其下一次伤害掷骰减去骰值和。'),
  option('ua-update-2024-spirit-distract', '分神', 'Distract', '精魂护卫：目标到你的下回合开始前，对除你（或另一拥有此特性的野蛮人）以外的生物攻击检定具有劣势。'),
  option('ua-update-2024-spirit-guard', '守护', 'Guard', '精魂护卫：目标下次命中你以外的生物时，该生物获得那次伤害的抗性。'),
  option('ua-update-2024-spirit-strike', '袭击', 'Strike', '精魂护卫：目标受到 1d6 额外伤害（强酸／寒冷／火焰／力场／闪电／雷鸣任选）。'),
  option('ua-update-2024-brew-cinnamon-dragon', '桂魄狂龙', 'Cinnamon Dragon', '玄酒琼浆：魔法动作喷出 30 尺毒性酒焰，敏捷豁免失败受 4 个武艺骰火焰伤害并中毒至下回合结束，成功减半。'),
  option('ua-update-2024-brew-heavenly-spirit', '天韵灵酿', 'Heavenly Spirit', '玄酒琼浆：1 小时内获得心灵与光耀伤害抗性。'),
  option('ua-update-2024-brew-refreshing-dip', '沁爽啜饮', 'Refreshing Dip', '玄酒琼浆：1 小时内每次恢复生命值时额外恢复 1 个武艺骰。'),
  option('ua-update-2024-brew-blue-lightning', '苍蓝雷霆', 'Blue Lightning', '玄酒琼浆（11 级新增）：以反应执行非借机攻击／施法行动时，可作为该反应的一部分发动一次徒手打击。'),
  option('ua-update-2024-brew-drunkards-luck', '醉客奇缘', "Drunkard's Luck", '玄酒琼浆（11 级新增）：若未持有英雄激励则立即获得；掷先攻时若未持有也立即获得。'),
  option('ua-update-2024-conjure-undead-skeleton', '骷髅', 'Skeleton', '咒唤亡灵：召唤骷髅（属性见《玩家手册》附录 B）。'),
  option('ua-update-2024-conjure-undead-zombie', '丧尸', 'Zombie', '咒唤亡灵：召唤丧尸（属性见《玩家手册》附录 B）。'),
]

export const uaSubclassUpdateFeatures2024: readonly SubclassFeature[] = [
  // ============ 风暴先驱道途（野蛮人） ============
  {
    id: 'ua-update-2024-storm-aura', subclassId: 'subclass-2024-ua-barbarian-storm-herald', name: '风暴灵光', englishName: 'Storm Aura', level: 3,
    summary: '狂暴时选择沙漠／海洋／冻原并展开 10 尺灵光；每回合可用附赠动作再次激活，DC＝8＋熟练＋体质。',
    description: '每当你激活狂暴时，从沙漠、海洋、冻原中选择一种；狂暴持续期间你展开源自自身的 10 尺光环灵光。进入狂暴时灵光激活，之后每个你的回合可用附赠动作再次激活。灵光效果：沙漠——按狂暴伤害加值投 d4，光环内生物敏捷豁免失败受等量火焰伤害（可选一名可见生物自动成功）；海洋——按狂暴伤害加值投 d6，对光环内可见生物掷闪电束，敏捷豁免失败受等量闪电伤害、成功减半；冻原——按狂暴伤害加值投 d4，目标力量豁免失败则其下一次伤害掷骰减去骰值和。豁免 DC＝8＋熟练加值＋体质调整值。',
    kind: 'bonus-action', optionIds: ['ua-update-2024-storm-desert', 'ua-update-2024-storm-sea', 'ua-update-2024-storm-tundra'], status: 'selectable', sourceIds,
  },
  {
    id: 'ua-update-2024-storm-soul', subclassId: 'subclass-2024-ua-barbarian-storm-herald', name: '风暴之魂', englishName: 'Storm Soul', level: 6,
    summary: '按上次狂暴所选环境获得：沙漠火焰抗性与点燃、海洋闪电抗性／水下呼吸／游泳速度、冻原寒冷抗性与结冰。',
    description: '即使灵光未激活，风暴仍给予你基于上一次进入狂暴时所选环境的增益：沙漠——火焰伤害抗性；魔法动作点燃未被他人携带的易燃物。海洋——闪电伤害抗性；可在水下呼吸并获得等于速度的游泳速度。冻原——寒冷伤害抗性；魔法动作使水体结为 5 尺方块冰（1 分钟后融化；若该空间有生物则失效）。',
    kind: 'passive', status: 'selectable', sourceIds,
  },
  {
    id: 'ua-update-2024-storm-shielding', subclassId: 'subclass-2024-ua-barbarian-storm-herald', name: '风暴之盾', englishName: 'Shielding Storm', level: 10,
    summary: '你选择的风暴灵光内生物获得与风暴之魂相同类型的伤害抗性。',
    description: '你风暴灵光内由你选择的每名生物获得与你风暴之魂特性提供的类型相同的伤害抗性。',
    kind: 'passive', status: 'selectable', sourceIds,
  },
  {
    id: 'ua-update-2024-storm-raging', subclassId: 'subclass-2024-ua-barbarian-storm-herald', name: '狂怒风暴', englishName: 'Raging Storm', level: 14,
    summary: '按环境强化：沙漠点燃（每回合 1d4）、海洋闪电链、冻原 2d4 寒冷并减半速度。',
    description: '按你风暴灵光所选环境获得强化：沙漠——每回合一次，灵光豁免失败的可见生物燃烧 1 分钟或至你终止狂暴，其每回合开始额外受 1d4 火焰伤害（共 2d4）；海洋——无论目标豁免成败，闪电束可跳至第一个目标 30 尺内另一名你所选目标，同样进行敏捷豁免；冻原——每回合一次，灵光豁免失败的可见生物受 2d4 寒冷伤害并在其下回合结束前速度减半。',
    kind: 'passive', status: 'selectable', sourceIds,
  },

  // ============ 精魂守卫道途（野蛮人） ============
  {
    id: 'ua-update-2024-spirit-protectors', subclassId: 'subclass-2024-ua-barbarian-spiritual-guardian', name: '精魂护卫', englishName: 'Spiritual Protectors', level: 3,
    summary: '狂暴中用武器或徒手命中时标记目标，从分神／守护／袭击中选择一种后果。',
    description: '狂暴激活期间，当你以武器或徒手打击命中一个生物时，它会成为精魂的目标，你从以下选项中选择一种后果：分神——到你的下回合开始前，目标对除你（或另一拥有此特性的野蛮人）以外的生物攻击检定具有劣势；守护——到目标下回合结束前，其下一次命中你以外生物的攻击中，该生物获得那次伤害的抗性；袭击——目标受到 1d6 额外伤害（强酸、寒冷、火焰、力场、闪电或雷鸣任选）。',
    kind: 'passive', optionIds: ['ua-update-2024-spirit-distract', 'ua-update-2024-spirit-guard', 'ua-update-2024-spirit-strike'], status: 'selectable', sourceIds,
  },
  {
    id: 'ua-update-2024-spirit-shield', subclassId: 'subclass-2024-ua-barbarian-spiritual-guardian', name: '精魂之盾', englishName: 'Spirit Shield', level: 6,
    summary: '狂暴中 30 尺内可见生物受伤时，反应投等于狂暴伤害加值数量的 d6 并减少该伤害。',
    description: '在你的狂暴激活期间，当你 30 尺内的另一个可见生物受到伤害时，你可以用反应减少那次伤害：投掷等于你狂暴伤害加值数量的 d6，将其总和从伤害中减去。',
    kind: 'reaction', status: 'selectable', sourceIds,
  },
  {
    id: 'ua-update-2024-spirit-consult', subclassId: 'subclass-2024-ua-barbarian-spiritual-guardian', name: '问道精魂', englishName: 'Consult the Spirits', level: 10,
    summary: '无需法术位与材料施展卜筮术或鹰眼术（感知施法）；每次短休或长休恢复。',
    description: '你可以施展卜筮术或鹰眼术，无需法术位与材料成分，施法属性为感知；以此施展鹰眼术时，隐形守护精魂代替球形探测器出现在指定位置。每次短休或长休后恢复使用。',
    kind: 'resource', status: 'selectable', sourceIds,
    resource: { maxByLevel: [0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], recovery: 'short-rest' },
  },
  {
    id: 'ua-update-2024-spirit-vengeful', subclassId: 'subclass-2024-ua-barbarian-spiritual-guardian', name: '复仇精魂', englishName: 'Vengeful Spirits', level: 14,
    summary: '攻击动作中近战武器 d20 掷出 18—20 时，可用该武器额外攻击一次；每个你的回合限一次。',
    description: '当你在攻击动作中使用近战武器攻击并在 d20 上掷出 18—20 时，作为该动作的一部分，你可以用该武器额外进行一次攻击检定。此特性一经使用，直到你下个回合开始前不能再次使用。',
    kind: 'passive', status: 'selectable', sourceIds,
  },

  // ============ 骁骑士（战士） ============
  {
    id: 'ua-update-2024-cavalier-bonus', subclassId: 'subclass-2024-ua-fighter-cavalier', name: '附赠熟练', englishName: 'Bonus Proficiency', level: 3,
    summary: '从驯兽、历史、洞悉、表演、游说中选 1 项获得熟练；也可改为习得一门语言。',
    description: '你从驯兽、历史、洞悉、表演、游说中选择一项获得熟练；你也可以改为习得一门你选择的语言。',
    kind: 'choice', requiresChoice: true,
    optionIds: ['skill-animal-handling', 'skill-history', 'skill-insight', 'skill-performance', 'skill-persuasion'],
    minSelections: 1, maxSelections: 1, status: 'selectable', sourceIds,
  },
  {
    id: 'ua-update-2024-cavalier-saddle', subclassId: 'subclass-2024-ua-fighter-cavalier', name: '生于鞍上', englishName: 'Born to the Saddle', level: 3,
    summary: '防落马豁免优势；未失能时 10 尺内落地双脚着地；上下坐骑只花 5 尺移动力。',
    description: '你为避免从坐骑上跌落而进行的豁免具有优势。只要未陷入失能，当你从坐骑上跌落且下降高度不超过 10 尺时，你能双脚着陆。此外，你上下一名生物只需花费 5 尺移动力，而非速度的一半。',
    kind: 'passive', status: 'selectable', sourceIds,
  },
  {
    id: 'ua-update-2024-cavalier-mark', subclassId: 'subclass-2024-ua-fighter-cavalier', name: '果决印记', englishName: 'Unwavering Mark', level: 3,
    summary: '近战命中可标记目标至你下回合结束：目标 5 尺内对他人攻击劣势；若其命中他人，你下回合对其攻击具有优势。无次数限制。',
    description: '当你用近战武器命中一名生物时，可以用印记标记它，持续至你的下个回合结束（你失能、死亡或他人赋予印记时提前结束）。目标位于你 5 尺内期间，它对除你以外的生物的攻击检定具有劣势。此外，若被标记生物用攻击命中除你之外的生物，你在下个回合对被标记生物的攻击检定具有优势。',
    kind: 'passive', status: 'selectable', sourceIds,
  },
  {
    id: 'ua-update-2024-cavalier-warding', subclassId: 'subclass-2024-ua-fighter-cavalier', name: '守御战技', englishName: 'Warding Maneuver', level: 7,
    summary: '持用近战武器或盾牌时，反应为你／坐骑／5 尺内可见生物加 1d8 AC；仍命中则获得该伤害抗性；次数＝体质调整值。',
    description: '只要你持用近战武器或盾牌，当你、你的坐骑或你 5 尺内可见生物被一次攻击命中时，你可以用反应投 1d8 并将结果加入目标 AC；若该攻击仍命中，目标获得那次攻击伤害的抗性。使用次数等于你的体质调整值（至少 1 次），长休后恢复。',
    kind: 'reaction', status: 'selectable', sourceIds,
    resource: { maxFromAbility: { ability: 'con', minimum: 1 }, recovery: 'long-rest' },
  },
  {
    id: 'ua-update-2024-cavalier-hold', subclassId: 'subclass-2024-ua-fighter-cavalier', name: '坚守阵线', englishName: 'Hold the Line', level: 10,
    summary: '生物在你触及内移动 5 尺以上即触发借机攻击；借机攻击命中后目标本回合速度归 0。',
    description: '生物在你触及内期间，若其移动 5 尺或更多距离，则触发你的借机攻击。当你以借机攻击命中一名生物时，目标速度直至本回合结束变为 0。',
    kind: 'passive', status: 'selectable', sourceIds,
  },
  {
    id: 'ua-update-2024-cavalier-charger', subclassId: 'subclass-2024-ua-fighter-cavalier', name: '冲锋陷阵', englishName: 'Ferocious Charger', level: 15,
    summary: '每场战斗第一轮，你与坐骑速度 +10 尺且移动不触发借机攻击；移至生物 5 尺内可力量豁免推离或击倒。',
    description: '每次战斗的第一轮中，你和你坐骑的速度增加 10 尺，且本轮你的移动不会触发借机攻击。当你在这轮中移至一名生物 5 尺内时，该生物必须通过一次力量豁免（DC＝8＋力量调整值＋熟练加值），否则你将其推离 5 尺或使其倒地。一名生物一回合只能进行一次该豁免。',
    kind: 'passive', status: 'selectable', sourceIds,
  },
  {
    id: 'ua-update-2024-cavalier-vigilant', subclassId: 'subclass-2024-ua-fighter-cavalier', name: '警醒守卫', englishName: 'Vigilant Defender', level: 18,
    summary: '每名其他生物的回合中各获得一次特殊反应，仅能用于借机攻击；执行过常规反应的回合不可使用。',
    description: '战斗中你获得一种特殊反应：你在每名其他生物的回合中都能执行一次，且只能用于发动一次借机攻击。你在执行常规反应的那个回合不能执行该特殊反应。',
    kind: 'passive', status: 'selectable', sourceIds,
  },

  // ============ 醉拳武者（武僧） ============
  {
    id: 'ua-update-2024-intoxication-proficiencies', subclassId: 'subclass-2024-ua-monk-intoxication', name: '额外熟练', englishName: 'Bonus Proficiencies', level: 3,
    summary: '获得表演熟练（已有时改选武僧技能）与酿酒工具熟练。',
    description: '你获得表演技能熟练；若已拥有，则从武僧 1 级可获得的技能熟练中另选一项。此外，若你还没有酿酒工具熟练，则获得之。',
    kind: 'passive', status: 'selectable', sourceIds,
  },
  {
    id: 'ua-update-2024-intoxication-technique', subclassId: 'subclass-2024-ua-monk-intoxication', name: '醉拳技巧', englishName: 'Drunken Technique', level: 3,
    summary: '使用疾风连击时，速度 +10 尺且移动不触发借机攻击，直至本回合结束。',
    description: '每当你使用疾风连击时，直到本回合结束前你的速度增加 10 尺，且此期间的移动不会引发借机攻击。',
    kind: 'passive', status: 'selectable', sourceIds,
  },
  {
    id: 'ua-update-2024-intoxication-sway', subclassId: 'subclass-2024-ua-monk-intoxication', name: '醉态摇曳', englishName: 'Tipsy Sway', level: 6,
    summary: '倒地起身只花 5 尺移动力；近战攻击失手时消耗 1 点功力并反应将攻击转移给 5 尺内另一可见生物。',
    description: '你获得两项能力：鲤鱼打挺——处于倒地状态时，你可以花费 5 尺移动力起身，而非一半速度；斗转星移——当一个生物对你发动的近战攻击失手时，你可以花费 1 点功力并消耗反应，令该攻击改打你 5 尺内由你选择的除攻击者外的一名可见生物。',
    kind: 'reaction', status: 'selectable', sourceIds,
  },
  {
    id: 'ua-update-2024-intoxication-brew', subclassId: 'subclass-2024-ua-monk-intoxication', name: '玄酒琼浆', englishName: 'Mystic Brew', level: 6,
    summary: '短休或长休时用酿酒工具生成一种魔法酒水（桂魄狂龙／天韵灵酿／沁爽啜饮），喝下获得 1 小时增益；可消耗 1 点功力延长至 8 小时。',
    description: '当你携带酿酒工具并完成短休或长休时，你可以生成一种奇妙酒水（桂魄狂龙、天韵灵酿或沁爽啜饮）。只有你能获得其增益；花 1 分钟喝下至少一品脱后获得 1 小时增益：桂魄狂龙——魔法动作喷出 30 尺锥状毒性酒焰，敏捷豁免（DC＝8＋感知调整值＋熟练加值）失败受 4 个武艺骰火焰伤害并中毒至下回合结束，成功减半；天韵灵酿——获得心灵与光耀伤害抗性；沁爽啜饮——每次恢复生命值时额外恢复 1 个武艺骰。喝下时可消耗 1 点功力将增益延长至 8 小时。未使用的酒水在下次短休或长休时消失。',
    kind: 'resource', optionIds: ['ua-update-2024-brew-cinnamon-dragon', 'ua-update-2024-brew-heavenly-spirit', 'ua-update-2024-brew-refreshing-dip'], status: 'selectable', sourceIds,
    resource: { maxByLevel: [0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], recovery: 'short-rest', unit: '瓶', note: '短休或长休生成；可消耗 1 点功力延长增益' },
  },
  {
    id: 'ua-update-2024-intoxication-master-brewer', subclassId: 'subclass-2024-ua-monk-intoxication', name: '酒道宗师', englishName: 'Master Brewer', level: 11,
    summary: '玄酒琼浆新增苍蓝雷霆与醉客奇缘两种酒水。',
    description: '玄酒琼浆的选项新增：苍蓝雷霆——你以反应执行非借机攻击或施法的行动时，可作为该反应的一部分发动一次徒手打击；醉客奇缘——若你未持有英雄激励则立即获得，掷先攻时若未持有也立即获得。',
    kind: 'passive', optionIds: ['ua-update-2024-brew-blue-lightning', 'ua-update-2024-brew-drunkards-luck'], status: 'selectable', sourceIds,
  },
  {
    id: 'ua-update-2024-intoxication-frenzy', subclassId: 'subclass-2024-ua-monk-intoxication', name: '酣醉若狂', englishName: 'Intoxicated Frenzy', level: 17,
    summary: '疾风连击可额外发动 3 次徒手攻击（合计最多 6 次），每次须打向不同敌人。',
    description: '当你使用疾风连击时，你可以额外再发动 3 次徒手攻击（合计最多 6 次），但每次攻击必须打向不同的敌人。',
    kind: 'passive', status: 'selectable', sourceIds,
  },

  // ============ 破誓者（圣武士，DM 选项） ============
  {
    id: 'ua-update-2024-oathbreaker-conjure-undead', subclassId: 'subclass-2024-ua-paladin-oathbreaker', name: '咒唤亡灵', englishName: 'Conjure Undead', level: 3,
    summary: '附赠动作消耗引导神力，召唤至多魅力调整值一半（向上取整，至少 1）的骷髅或丧尸，持续 1 分钟。',
    description: '以一个附赠动作，你可以消耗一次引导神力，召唤数量等同于你魅力调整值一半（向上取整，至少 1 只）的亡灵，类型可选骷髅或丧尸（属性见《玩家手册》附录 B）。每只亡灵出现在你 30 尺内可见的未占据空间，受你控制 1 分钟后化为灰烬。亡灵与你共享先攻，在你的回合结束后立即行动，服从口头命令（无需动作），无命令时回避。亡灵数据未接入自动战斗结算。',
    kind: 'bonus-action', optionIds: ['ua-update-2024-conjure-undead-skeleton', 'ua-update-2024-conjure-undead-zombie'], status: 'selectable', sourceIds,
  },
  {
    id: 'ua-update-2024-oathbreaker-dread', subclassId: 'subclass-2024-ua-paladin-oathbreaker', name: '恐怖显现', englishName: 'Dreadful Aspect', level: 3,
    summary: '施展至圣斩后可立即消耗引导神力，10 尺灵光内选定生物感知豁免失败则恐慌 1 分钟（每回合末可复豁免）。',
    description: '在你施展至圣斩后，你可以立即消耗一次引导神力引发威压爆发：源自你的 10 尺光环内由你选择的每个生物必须通过一次感知豁免，否则陷入恐慌 1 分钟；恐慌生物在其每个回合结束时重复豁免，成功则终止。',
    kind: 'passive', status: 'selectable', sourceIds,
  },
  {
    id: 'ua-update-2024-oathbreaker-spells', subclassId: 'subclass-2024-ua-paladin-oathbreaker', name: '破誓者法术', englishName: 'Oathbreaker Spells', level: 3,
    summary: '3／5／9／13／17 级按破誓者法术表始终准备法术。',
    description: '达到对应圣武士等级时，你始终准备破誓者法术表中的法术；这些法术不计入准备上限。',
    kind: 'passive', status: 'selectable', sourceIds,
  },
  {
    id: 'ua-update-2024-oathbreaker-aura', subclassId: 'subclass-2024-ua-paladin-oathbreaker', name: '憎恨灵光', englishName: 'Aura of Hate', level: 7,
    summary: '你与守护灵光内的邪魔／亡灵盟友近战命中时，追加魅力调整值暗蚀伤害。',
    description: '你和你守护灵光内的任意邪魔或亡灵盟友用近战攻击命中一个生物时，该次攻击造成等同于你魅力调整值的额外暗蚀伤害。',
    kind: 'passive', status: 'selectable', sourceIds,
  },
  {
    id: 'ua-update-2024-oathbreaker-resistance', subclassId: 'subclass-2024-ua-paladin-oathbreaker', name: '超然抗性', englishName: 'Supernatural Resistance', level: 15,
    summary: '获得钝击、穿刺与挥砍伤害抗性。',
    description: '你获得对钝击、穿刺和挥砍伤害的抗性。',
    kind: 'passive', status: 'selectable', sourceIds,
  },
  {
    id: 'ua-update-2024-oathbreaker-dread-lord', subclassId: 'subclass-2024-ua-paladin-oathbreaker', name: '恐惧之王', englishName: 'Dread Lord', level: 20,
    summary: '附赠动作 10 分钟：守护灵光内魔法黑暗（你与盟友可看穿）、恐慌生物回合开始受 4d10 心灵、附赠动作暗影打击；长休恢复或 5 环重置。',
    description: '以一个附赠动作，你将亵渎幽暗注入守护灵光，持续 10 分钟（可提前终止）：黑暗——魔法黑暗充斥灵光，你与灵光内盟友可看穿；恐惧——每当恐慌生物在灵光内开始回合，受 4d10 心灵伤害；暗影打击——附赠动作进行一次近战法术攻击，以灵光内生物为目标，命中造成 3d10＋魅力调整值暗蚀伤害。使用后需长休恢复，或消耗一个 5 环法术位重置（无需动作）。',
    kind: 'bonus-action', status: 'selectable', sourceIds,
    resource: { maxByLevel: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], recovery: 'long-rest', note: '可消耗 5 环法术位重置' },
  },
]

const featuresOf = (subclassId: string): readonly SubclassFeature[] =>
  uaSubclassUpdateFeatures2024.filter((feature) => feature.subclassId === subclassId)

export const uaSubclassUpdate2024: readonly SubclassRule[] = [
  {
    id: 'subclass-2024-ua-barbarian-storm-herald', classId: 'class-2024-barbarian', ruleset: '5e-2024', name: '风暴先驱道途', englishName: 'Path of the Storm Herald', selectionLevel: 3,
    summary: '以沙漠／海洋／冻原灵光环绕自身，6 级获得环境抗性，10 级分享抗性，14 级强化风暴。',
    status: 'selectable', availability: 'player', sourceIds,
    features: featuresOf('subclass-2024-ua-barbarian-storm-herald'),
  },
  {
    id: 'subclass-2024-ua-barbarian-spiritual-guardian', classId: 'class-2024-barbarian', ruleset: '5e-2024', name: '精魂守卫道途', englishName: 'Path of the Spiritual Guardian', selectionLevel: 3,
    summary: '狂暴中召唤精魂护卫盟友：分神／守护／袭击、精魂之盾、问道精魂与复仇精魂。',
    status: 'selectable', availability: 'player', sourceIds,
    features: featuresOf('subclass-2024-ua-barbarian-spiritual-guardian'),
  },
  {
    id: 'subclass-2024-ua-fighter-cavalier', classId: 'class-2024-fighter', ruleset: '5e-2024', name: '骁骑士', englishName: 'Cavalier', selectionLevel: 3,
    summary: '骑术护卫：果决印记、守御战技、坚守阵线、冲锋陷阵与警醒守卫。',
    status: 'selectable', availability: 'player', sourceIds,
    features: featuresOf('subclass-2024-ua-fighter-cavalier'),
  },
  {
    id: 'subclass-2024-ua-monk-intoxication', classId: 'class-2024-monk', ruleset: '5e-2024', name: '醉拳武者', englishName: 'Warrior of Intoxication', selectionLevel: 3,
    summary: '以醉态游走与魔法酒水作战：醉拳技巧、醉态摇曳、玄酒琼浆与酣醉若狂。',
    status: 'selectable', availability: 'player', sourceIds,
    features: featuresOf('subclass-2024-ua-monk-intoxication'),
  },
  {
    id: 'subclass-2024-ua-paladin-oathbreaker', classId: 'class-2024-paladin', ruleset: '5e-2024', name: '破誓者', englishName: 'Oathbreaker', selectionLevel: 3,
    summary: '背叛誓言的圣武士：咒唤亡灵、恐怖显现、憎恨灵光、超然抗性与恐惧之王（DM 选项）。',
    status: 'selectable', availability: 'dm-only', sourceIds,
    features: featuresOf('subclass-2024-ua-paladin-oathbreaker'),
    alwaysPreparedSpellIdsByLevel: {
      3: ['spell-2024-hellish-rebuke', 'spell-2024-witch-bolt'],
      5: ['spell-2024-crown-of-madness', 'spell-2024-darkness'],
      9: ['spell-2024-fear', 'spell-2024-summon-undead'],
      13: ['spell-2024-blight', 'spell-2024-phantasmal-killer'],
      17: ['spell-2024-contagion', 'spell-2024-steel-wind-strike'],
    },
  },
]
