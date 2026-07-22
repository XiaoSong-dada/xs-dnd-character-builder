# D&D 职业、子职与职业特性资料

## 1. 文档定位

本文档用于记录项目支持的职业（Class）、职业分支/子职（Subclass）和职业特性（Class Feature），作为职业规则数据、车卡步骤和角色卡展示的专项依据。

本文档是**选择性加载资料**，不属于项目每次开发前的必读文档。仅在任务涉及职业、子职、职业特性、职业等级或相关规则数据时读取；目标职业明确时，只需读取通用约定和对应职业章节。

## 2. 资料边界

- 默认规则集：`5e-2024`。
- 首期实现等级：1 级，但文档允许提前记录后续等级资料。
- 每条职业资料必须标明规则集、来源和核验状态。
- 2014 与 2024 规则不得记录在同一条目中；兼容旧版时使用独立条目或独立章节。
- 只记录公开免费规则及许可范围内可使用的内容。
- 未经官方资料核验的内容标记为“待核验”，不得直接进入规则数据。
- 子职英文名以官方2024目录为准；当前中文名是项目暂译，后续取得可靠的官方中文译名时再统一替换。
- 对非开放商业内容只记录必要的索引、来源和项目内兼容说明，不复制完整规则正文。
- 扩展子职目录仅表示“已建立资料入口”，不表示当前车卡程序已经实现；默认仍只启用 `5e-2024` 内容，旧版和扩展来源必须经团规则或 DM 明确允许。

## 3. 数据字段约定

### 3.1 职业

每个职业至少记录：

- 稳定 ID、中文名、英文名；
- `ruleset` 与来源；
- 主要属性、生命骰；
- 护甲、武器、工具熟练；
- 豁免熟练与技能选择；
- 1 级初始生命值公式；
- 初始装备选项；
- 施法方式（若有）；
- 各等级获得的职业特性；
- 子职获得等级；
- 车卡时需要玩家完成的选择；
- 规则前置条件和校验信息。

### 3.2 子职

每个子职至少记录：

- 稳定 ID、所属职业、中文名、英文名；
- `ruleset`、来源与可用范围；
- 选择子职的等级；
- 各等级提供的子职特性；
- 前置条件、互斥选择和额外资源；
- 对基础职业数据的新增或替换。

### 3.3 职业特性

每项职业特性至少记录：

- 稳定 ID、名称、来源职业或子职；
- 获得等级；
- 简要用途说明；
- 是否需要玩家选择；
- 使用次数、资源上限和恢复时机；
- 前置条件与互斥条件；
- 对属性、熟练、攻击、法术或其他派生值的影响；
- 是否产生新的动作、附赠动作、反应或特殊触发；
- 对应的数据实现与校验状态。

## 4. 核心职业索引

| ID | 中文名 | 英文名 | 职业资料 | 子职资料 | 核验状态 |
|---|---|---|---|---|---|
| `barbarian` | 野蛮人 | Barbarian | 待补充 | [狂战士道途](classes/subclasses/barbarian/barbarian-berserker.md)<br>[狂野之心道途](classes/subclasses/barbarian/barbarian-wild-heart.md)<br>[世界树道途](classes/subclasses/barbarian/barbarian-world-tree.md)<br>[狂信者道途](classes/subclasses/barbarian/barbarian-zealot.md) | 目录已核验 |
| `bard` | 吟游诗人 | Bard | 待补充 | [舞蹈学院](classes/subclasses/bard/bard-college-of-dance.md)<br>[魅惑学院](classes/subclasses/bard/bard-college-of-glamour.md)<br>[博闻学院](classes/subclasses/bard/bard-college-of-lore.md)<br>[勇气学院](classes/subclasses/bard/bard-college-of-valor.md) | 目录已核验 |
| `cleric` | 牧师 | Cleric | 待补充 | [生命领域](classes/subclasses/cleric/cleric-life-domain.md)<br>[光明领域](classes/subclasses/cleric/cleric-light-domain.md)<br>[诡术领域](classes/subclasses/cleric/cleric-trickery-domain.md)<br>[战争领域](classes/subclasses/cleric/cleric-war-domain.md) | 目录已核验 |
| `druid` | 德鲁伊 | Druid | 待补充 | [大地结社](classes/subclasses/druid/druid-circle-of-the-land.md)<br>[月亮结社](classes/subclasses/druid/druid-circle-of-the-moon.md)<br>[海洋结社](classes/subclasses/druid/druid-circle-of-the-sea.md)<br>[星辰结社](classes/subclasses/druid/druid-circle-of-the-stars.md) | 目录已核验 |
| `fighter` | 战士 | Fighter | 待补充 | [战斗大师](classes/subclasses/fighter/fighter-battle-master.md)<br>[勇士](classes/subclasses/fighter/fighter-champion.md)<br>[奥法骑士](classes/subclasses/fighter/fighter-eldritch-knight.md)<br>[灵能战士](classes/subclasses/fighter/fighter-psi-warrior.md) | 目录已核验 |
| `monk` | 武僧 | Monk | 待补充 | [慈悲宗](classes/subclasses/monk/monk-mercy.md)<br>[暗影宗](classes/subclasses/monk/monk-shadow.md)<br>[元素宗](classes/subclasses/monk/monk-elements.md)<br>[敞手宗](classes/subclasses/monk/monk-open-hand.md) | 目录已核验 |
| `paladin` | 圣武士 | Paladin | 待补充 | [奉献之誓](classes/subclasses/paladin/paladin-oath-of-devotion.md)<br>[荣耀之誓](classes/subclasses/paladin/paladin-oath-of-glory.md)<br>[古贤之誓](classes/subclasses/paladin/paladin-oath-of-the-ancients.md)<br>[复仇之誓](classes/subclasses/paladin/paladin-oath-of-vengeance.md) | 目录已核验 |
| `ranger` | 游侠 | Ranger | 待补充 | [驯兽师](classes/subclasses/ranger/ranger-beast-master.md)<br>[妖精漫游者](classes/subclasses/ranger/ranger-fey-wanderer.md)<br>[幽域追猎者](classes/subclasses/ranger/ranger-gloom-stalker.md)<br>[猎人](classes/subclasses/ranger/ranger-hunter.md) | 目录已核验 |
| `rogue` | 游荡者 | Rogue | 待补充 | [奥法骗徒](classes/subclasses/rogue/rogue-arcane-trickster.md)<br>[刺客](classes/subclasses/rogue/rogue-assassin.md)<br>[魂刃](classes/subclasses/rogue/rogue-soulknife.md)<br>[盗贼](classes/subclasses/rogue/rogue-thief.md) | 目录已核验 |
| `sorcerer` | 术士 | Sorcerer | 待补充 | [异怪术法](classes/subclasses/sorcerer/sorcerer-aberrant-sorcery.md)<br>[机关术法](classes/subclasses/sorcerer/sorcerer-clockwork-sorcery.md)<br>[龙族术法](classes/subclasses/sorcerer/sorcerer-draconic-sorcery.md)<br>[狂野魔法术法](classes/subclasses/sorcerer/sorcerer-wild-magic-sorcery.md) | 目录已核验 |
| `warlock` | 邪术师 | Warlock | 待补充 | [至高妖精宗主](classes/subclasses/warlock/warlock-archfey-patron.md)<br>[天界宗主](classes/subclasses/warlock/warlock-celestial-patron.md)<br>[邪魔宗主](classes/subclasses/warlock/warlock-fiend-patron.md)<br>[旧日支配者宗主](classes/subclasses/warlock/warlock-great-old-one-patron.md) | 目录已核验 |
| `wizard` | 法师 | Wizard | 待补充 | [防护师](classes/subclasses/wizard/wizard-abjurer.md)<br>[预言师](classes/subclasses/wizard/wizard-diviner.md)<br>[塑能师](classes/subclasses/wizard/wizard-evoker.md)<br>[幻术师](classes/subclasses/wizard/wizard-illusionist.md) | 目录已核验 |

## 4.1 官方旧版与扩展子职索引

以下条目是基于 2014 职业框架发行的官方旧版或扩展子职。每个文件只记录来源、兼容边界与官方详情链接，不复制商业规则正文；其中 DM 选项不会进入默认玩家可选列表。

- **野蛮人**：[战狂道途](classes/subclasses/barbarian/barbarian-battlerager.md)、[先祖守卫道途](classes/subclasses/barbarian/barbarian-ancestral-guardian.md)、[风暴先驱道途](classes/subclasses/barbarian/barbarian-storm-herald.md)、[狂野魔法道途](classes/subclasses/barbarian/barbarian-wild-magic.md)、[野兽道途](classes/subclasses/barbarian/barbarian-beast.md)、[巨人道途](classes/subclasses/barbarian/barbarian-giant.md)
- **吟游诗人**：[剑舞学院](classes/subclasses/bard/bard-college-of-swords.md)、[低语学院](classes/subclasses/bard/bard-college-of-whispers.md)、[创造学院](classes/subclasses/bard/bard-college-of-creation.md)、[雄辩学院](classes/subclasses/bard/bard-college-of-eloquence.md)、[精魂学院](classes/subclasses/bard/bard-college-of-spirits.md)
- **牧师**：[知识领域](classes/subclasses/cleric/cleric-knowledge-domain.md)、[自然领域](classes/subclasses/cleric/cleric-nature-domain.md)、[风暴领域](classes/subclasses/cleric/cleric-tempest-domain.md)、[奥秘领域](classes/subclasses/cleric/cleric-arcana-domain.md)、[锻造领域](classes/subclasses/cleric/cleric-forge-domain.md)、[坟墓领域](classes/subclasses/cleric/cleric-grave-domain.md)、[秩序领域](classes/subclasses/cleric/cleric-order-domain.md)、[和平领域](classes/subclasses/cleric/cleric-peace-domain.md)、[暮光领域](classes/subclasses/cleric/cleric-twilight-domain.md)、[死亡领域（DM 选项）](classes/subclasses/cleric/cleric-death-domain.md)
- **德鲁伊**：[梦境结社](classes/subclasses/druid/druid-circle-of-dreams.md)、[牧人结社](classes/subclasses/druid/druid-circle-of-the-shepherd.md)、[孢子结社](classes/subclasses/druid/druid-circle-of-spores.md)、[野火结社](classes/subclasses/druid/druid-circle-of-wildfire.md)
- **战士**：[紫龙骑士](classes/subclasses/fighter/fighter-purple-dragon-knight.md)、[奥法射手](classes/subclasses/fighter/fighter-arcane-archer.md)、[骑兵](classes/subclasses/fighter/fighter-cavalier.md)、[武士](classes/subclasses/fighter/fighter-samurai.md)、[回音骑士](classes/subclasses/fighter/fighter-echo-knight.md)、[符文骑士](classes/subclasses/fighter/fighter-rune-knight.md)
- **武僧**：[长死宗](classes/subclasses/monk/monk-long-death.md)、[醉拳宗](classes/subclasses/monk/monk-drunken-master.md)、[剑圣宗](classes/subclasses/monk/monk-kensei.md)、[日魂宗](classes/subclasses/monk/monk-sun-soul.md)、[星界灵体宗](classes/subclasses/monk/monk-astral-self.md)、[升龙宗](classes/subclasses/monk/monk-ascendant-dragon.md)
- **圣武士**：[王冠之誓](classes/subclasses/paladin/paladin-oath-of-the-crown.md)、[征服之誓](classes/subclasses/paladin/paladin-oath-of-conquest.md)、[救赎之誓](classes/subclasses/paladin/paladin-oath-of-redemption.md)、[守望之誓](classes/subclasses/paladin/paladin-oath-of-the-watchers.md)、[破誓者（DM 选项）](classes/subclasses/paladin/paladin-oathbreaker.md)
- **游侠**：[地平线行者](classes/subclasses/ranger/ranger-horizon-walker.md)、[怪物杀手](classes/subclasses/ranger/ranger-monster-slayer.md)、[集群牧者](classes/subclasses/ranger/ranger-swarmkeeper.md)、[龙兽守卫](classes/subclasses/ranger/ranger-drakewarden.md)
- **游荡者**：[审判官](classes/subclasses/rogue/rogue-inquisitive.md)、[策士](classes/subclasses/rogue/rogue-mastermind.md)、[斥候](classes/subclasses/rogue/rogue-scout.md)、[游荡剑客](classes/subclasses/rogue/rogue-swashbuckler.md)、[鬼魅](classes/subclasses/rogue/rogue-phantom.md)
- **术士**：[神圣之魂](classes/subclasses/sorcerer/sorcerer-divine-soul.md)、[幽影魔法](classes/subclasses/sorcerer/sorcerer-shadow-magic.md)、[风暴术法](classes/subclasses/sorcerer/sorcerer-storm-sorcery.md)、[月之术法](classes/subclasses/sorcerer/sorcerer-lunar-sorcery.md)
- **邪术师**：[不朽者宗主](classes/subclasses/warlock/warlock-undying-patron.md)、[咒剑宗主](classes/subclasses/warlock/warlock-hexblade-patron.md)、[深海意志宗主](classes/subclasses/warlock/warlock-fathomless-patron.md)、[巨灵宗主](classes/subclasses/warlock/warlock-genie-patron.md)、[死灵宗主](classes/subclasses/warlock/warlock-undead-patron.md)
- **法师**：[咒法学派](classes/subclasses/wizard/wizard-conjuration.md)、[附魔学派](classes/subclasses/wizard/wizard-enchantment.md)、[死灵学派](classes/subclasses/wizard/wizard-necromancy.md)、[变化学派](classes/subclasses/wizard/wizard-transmutation.md)、[剑咏者](classes/subclasses/wizard/wizard-bladesinging.md)、[战争魔法](classes/subclasses/wizard/wizard-war-magic.md)、[时间魔法](classes/subclasses/wizard/wizard-chronurgy-magic.md)、[重力魔法](classes/subclasses/wizard/wizard-graviturgy-magic.md)、[书士会](classes/subclasses/wizard/wizard-order-of-scribes.md)

未重复建立的旧名称：图腾武者对应 2024 的[狂野之心道途](classes/subclasses/barbarian/barbarian-wild-heart.md)；2014 的四元素、暗影、敞手以及术士、邪术师、法师的同源新版名称，继续由核心索引中的 2024 条目承接。

## 5. 职业章节

以下章节先建立稳定锚点。资料完成后，应在对应章节内按照“职业基础 → 等级特性 → 子职 → 选择与校验 → 来源”的顺序记录。

### 5.1 野蛮人 Barbarian

- 职业 ID：`barbarian`
- 职业基础：待补充
- 等级特性：待补充
- 子职：[狂战士道途](classes/subclasses/barbarian/barbarian-berserker.md)、[狂野之心道途](classes/subclasses/barbarian/barbarian-wild-heart.md)、[世界树道途](classes/subclasses/barbarian/barbarian-world-tree.md)、[狂信者道途](classes/subclasses/barbarian/barbarian-zealot.md)
- 选择与校验：待补充
- 来源与核验：待补充

### 5.2 吟游诗人 Bard

- 职业 ID：`bard`
- 职业基础：待补充
- 等级特性：待补充
- 子职：[舞蹈学院](classes/subclasses/bard/bard-college-of-dance.md)、[魅惑学院](classes/subclasses/bard/bard-college-of-glamour.md)、[博闻学院](classes/subclasses/bard/bard-college-of-lore.md)、[勇气学院](classes/subclasses/bard/bard-college-of-valor.md)
- 选择与校验：待补充
- 来源与核验：待补充

### 5.3 牧师 Cleric

- 职业 ID：`cleric`
- 职业基础：待补充
- 等级特性：待补充
- 子职：[生命领域](classes/subclasses/cleric/cleric-life-domain.md)、[光明领域](classes/subclasses/cleric/cleric-light-domain.md)、[诡术领域](classes/subclasses/cleric/cleric-trickery-domain.md)、[战争领域](classes/subclasses/cleric/cleric-war-domain.md)
- 选择与校验：待补充
- 来源与核验：待补充

### 5.4 德鲁伊 Druid

- 职业 ID：`druid`
- 职业基础：待补充
- 等级特性：待补充
- 子职：[大地结社](classes/subclasses/druid/druid-circle-of-the-land.md)、[月亮结社](classes/subclasses/druid/druid-circle-of-the-moon.md)、[海洋结社](classes/subclasses/druid/druid-circle-of-the-sea.md)、[星辰结社](classes/subclasses/druid/druid-circle-of-the-stars.md)
- 选择与校验：待补充
- 来源与核验：待补充

### 5.5 战士 Fighter

- 职业 ID：`fighter`
- 职业基础：待补充
- 等级特性：待补充
- 子职：[战斗大师](classes/subclasses/fighter/fighter-battle-master.md)、[勇士](classes/subclasses/fighter/fighter-champion.md)、[奥法骑士](classes/subclasses/fighter/fighter-eldritch-knight.md)、[灵能战士](classes/subclasses/fighter/fighter-psi-warrior.md)
- 选择与校验：待补充
- 来源与核验：待补充

### 5.6 武僧 Monk

- 职业 ID：`monk`
- 职业基础：待补充
- 等级特性：待补充
- 子职：[慈悲宗](classes/subclasses/monk/monk-mercy.md)、[暗影宗](classes/subclasses/monk/monk-shadow.md)、[元素宗](classes/subclasses/monk/monk-elements.md)、[敞手宗](classes/subclasses/monk/monk-open-hand.md)
- 选择与校验：待补充
- 来源与核验：待补充

### 5.7 圣武士 Paladin

- 职业 ID：`paladin`
- 职业基础：待补充
- 等级特性：待补充
- 子职：[奉献之誓](classes/subclasses/paladin/paladin-oath-of-devotion.md)、[荣耀之誓](classes/subclasses/paladin/paladin-oath-of-glory.md)、[古贤之誓](classes/subclasses/paladin/paladin-oath-of-the-ancients.md)、[复仇之誓](classes/subclasses/paladin/paladin-oath-of-vengeance.md)
- 选择与校验：待补充
- 来源与核验：待补充

### 5.8 游侠 Ranger

- 职业 ID：`ranger`
- 职业基础：待补充
- 等级特性：待补充
- 子职：[驯兽师](classes/subclasses/ranger/ranger-beast-master.md)、[妖精漫游者](classes/subclasses/ranger/ranger-fey-wanderer.md)、[幽域追猎者](classes/subclasses/ranger/ranger-gloom-stalker.md)、[猎人](classes/subclasses/ranger/ranger-hunter.md)
- 选择与校验：待补充
- 来源与核验：待补充

### 5.9 游荡者 Rogue

- 职业 ID：`rogue`
- 职业基础：待补充
- 等级特性：待补充
- 子职：[奥法骗徒](classes/subclasses/rogue/rogue-arcane-trickster.md)、[刺客](classes/subclasses/rogue/rogue-assassin.md)、[魂刃](classes/subclasses/rogue/rogue-soulknife.md)、[盗贼](classes/subclasses/rogue/rogue-thief.md)
- 选择与校验：待补充
- 来源与核验：待补充

### 5.10 术士 Sorcerer

- 职业 ID：`sorcerer`
- 职业基础：待补充
- 等级特性：待补充
- 子职：[异怪术法](classes/subclasses/sorcerer/sorcerer-aberrant-sorcery.md)、[机关术法](classes/subclasses/sorcerer/sorcerer-clockwork-sorcery.md)、[龙族术法](classes/subclasses/sorcerer/sorcerer-draconic-sorcery.md)、[狂野魔法术法](classes/subclasses/sorcerer/sorcerer-wild-magic-sorcery.md)
- 选择与校验：待补充
- 来源与核验：待补充

### 5.11 邪术师 Warlock

- 职业 ID：`warlock`
- 职业基础：待补充
- 等级特性：待补充
- 子职：[至高妖精宗主](classes/subclasses/warlock/warlock-archfey-patron.md)、[天界宗主](classes/subclasses/warlock/warlock-celestial-patron.md)、[邪魔宗主](classes/subclasses/warlock/warlock-fiend-patron.md)、[旧日支配者宗主](classes/subclasses/warlock/warlock-great-old-one-patron.md)
- 选择与校验：待补充
- 来源与核验：待补充

### 5.12 法师 Wizard

- 职业 ID：`wizard`
- 职业基础：待补充
- 等级特性：待补充
- 子职：[防护师](classes/subclasses/wizard/wizard-abjurer.md)、[预言师](classes/subclasses/wizard/wizard-diviner.md)、[塑能师](classes/subclasses/wizard/wizard-evoker.md)、[幻术师](classes/subclasses/wizard/wizard-illusionist.md)
- 选择与校验：待补充
- 来源与核验：待补充

## 6. 单项特性记录模板

新增职业特性时使用以下结构：

```text
特性 ID：
中文名：
英文名：
规则集：5e-2024
来源职业/子职：
获得等级：
用途摘要：
玩家选择：无 / 单选 / 多选 / 数值分配
资源与恢复：
前置条件：
互斥条件：
派生值影响：
动作类型：
规则来源：
核验状态：待核验 / 已核验 / 已实现 / 已测试
```

## 7. 更新检查

更新本文件时检查：

1. 条目是否明确属于 2014 或 2024 规则；
2. 职业、子职和特性 ID 是否稳定且唯一；
3. 是否记录来源和核验状态；
4. 是否明确玩家选择、前置条件、资源和恢复时机；
5. 是否需要同步更新 `docs/rules.md`；
6. 是否需要同步更新 `docs/frontend-architecture.md` 或 `app/src/rules`；
7. 是否只记录许可范围内允许使用的内容。
