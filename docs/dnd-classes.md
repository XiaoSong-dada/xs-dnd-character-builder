# D&D 职业、子职与职业特性资料

## 1. 文档定位

本文档用于记录项目支持的职业（Class）、职业分支/子职（Subclass）和职业特性（Class Feature），作为职业规则数据、车卡步骤和角色卡展示的专项依据。

本文档是**选择性加载资料**，不属于项目每次开发前的必读文档。仅在任务涉及职业、子职、职业特性、职业等级或相关规则数据时读取；目标职业明确时，只需读取通用约定和对应职业章节。

- 当前运行时完成度：13 个 2014 职业（含 TCoE 奇械师）与 118 个子职条目；116 个玩家子职进入时间线，2 个 DM 专用条目只作索引。2024 已完成全部 12 个基础职业、48 个核心子职与目标矩阵复核（B08-01—B08-14，60 条身份记录闭合），并已由 B09-01 开放车卡入口（第一页可选版本；资源结算与导出待 B10／B11）。0.7.0 审计矩阵见 `source-content-matrix-0.7.0.md`。
- 2024 扩展（破解奥秘 UA）：自 E02（2026-09-18）起奇械师（`class-2024-ua-artificer`）与 5 子职已接入，来源 `source-2024-ua-eberron` 默认关闭、状态 `selectable`；其他 UA 批次（E03—E07）待实施。

## 2. 资料边界

- 当前程序唯一规则集：`5e-2014`。
- 当前目标等级：1—20 级单职业。
- 每条职业资料必须标明规则集、来源和核验状态。
- 2014 与 2024 规则不得记录在同一条目中；兼容旧版时使用独立条目或独立章节。
- 只记录公开免费规则及许可范围内可使用的内容。
- 未经官方资料核验的内容标记为“待核验”，不得直接进入规则数据。
- 子职英文名以官方2024目录为准；当前中文名是项目暂译，后续取得可靠的官方中文译名时再统一替换。
- 对非开放商业内容只记录必要的索引、来源和项目内兼容说明，不复制完整规则正文。
- 现有 2024 文件按 B08 逐批接入 2024 仓库（职业数据、特性、检查点与子职）；未接入条目仍只作资料入口，不得当作可选项。产品入口由 `OPEN_RULESETS` 控制：自 B09-01 起 2014 与 2024 均开放，但 2024 声明范围限于车卡流程（资源结算与导出待 B10／B11）。
- 2024 扩展书与「破解奥秘（UA）」的职业／子职按 [2024 扩展内容引入盘点](需求文档/2024扩展内容引入-盘点/子职矩阵.md) 登记：研究编号不是运行时 ID，未接入前不得进入候选池；来源 ID、运行时 ID 前缀、默认开关与完成度上限见 [`rules.md`](rules.md)「2024 扩展登记约定」。
- 当前实现说明见 [2014 战士](classes/subclasses/fighter/fighter-2014.md)、[2014 战斗大师](classes/subclasses/fighter/fighter-battle-master-2014.md)、[2014 野蛮人](classes/subclasses/barbarian/barbarian-2014.md)、[2014 武僧](classes/subclasses/monk/monk-2014.md)、[2014 游荡者](classes/subclasses/rogue/rogue-2014.md)、[2014 圣武士](classes/subclasses/paladin/paladin-2014.md)、[2014 游侠](classes/subclasses/ranger/ranger-2014.md)、[2014 法师](classes/subclasses/wizard/wizard-2014.md)与[2014 邪术师](classes/subclasses/warlock/warlock-2014.md)。
- 职业基础等级特性：12 个 2014 基础职业已全量登记于 `app/src/rules/data/class-features-2014.ts`（升级增强项每个等级各登记一条；需玩家选择的特性标记 `requiresChoice`，角色卡展示“需选择”并沿用既有检查点入口），经 `repository` 挂载到 `ClassRule.features`，角色卡“能力”页签与时间线首个职业检查点展示。
- 子职覆盖：112 个玩家可用子职已按纵向切片接入车卡（等级特性注册表 `app/src/rules/data/subclass-features-2014.ts`、子职选择与互斥校验、子职派生钩子）；死亡领域与破誓者仍为 DM 专用索引。未核验的具体效果保持 `index-only`，不参与自动计算。

## 3. 数据字段约定

### 3.1 职业

每个职业至少记录：

- 稳定 ID、中文名、英文名；
- `ruleset` 与来源；
- 主要属性、生命骰；
- **职业介绍 `introduction`**（原创中文转述，1—3 句：职业定位、常见玩法与核心机制；不复制原书正文；2014 与 2024 文本必须独立）；
  - 登记位置：2014 统一在 `app/src/rules/data/classes-2014.ts` 的 `classPreviews2014`（13 条），2024 在各 `app/src/rules/data/<职业>-2024.ts` 的 `<职业>Rule2024`（12 条）；
  - 2014 装配时预览清单在前（`rules/repository.ts` 的 `{ ...item, ...classRule, features }`），不得改回 `{ ...classRule, ... }`，否则介绍会被完整规则覆盖；
  - 完整性由 `app/test/rules/class-introductions.test.ts` 固定（25 个职业非空、非占位、两版不重复）。
- **主要属性核对口径**：2024 取 5e 不全书 `玩家手册2024_角色职业_<职业>_<职业>.md` 的「主要属性 Primary Ability」字段，2014（含奇械师）取 `玩家手册_职业_<职业>.md`／`塔莎的万事坩埚_玩家选项_职业_奇械师.md` 的「快速建卡 Quick Build」最高属性建议；两者必须写进 `ClassRule.primaryAbilities`。
- 玩法标签 `playStyleTags`（推荐引擎专用，只影响推荐排序与理由，不参与派生计算；标签取值见 `app/src/types/rules.ts` 的 `PlayStyleTag`，中文名见 `app/src/rules/data/preferences-2014.ts`）；
- 护甲、武器、工具熟练；
- 导出攻击使用 `app/src/rules/weapon-attacks.ts` 的 2014 职业武器熟练登记：支持简易/军用类别与职业指定武器；种族/子种族的指定武器熟练同时参与判断。该登记只服务逐武器基础攻击派生，不扩展多职业或情境加值。
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
- 是否需要玩家选择（需要时给出选项与多选规格：`requiresChoice` + `optionIds`，多选特性额外记录 `minSelections`/`maxSelections`，缺省 1/1）；
- 使用次数、资源上限和恢复时机；
- 前置条件与互斥条件；
- 对属性、熟练、攻击、法术或其他派生值的影响；
- 是否产生新的动作、附赠动作、反应或特殊触发；
- 对应的数据实现与校验状态。

## 4. 核心职业索引

| ID | 中文名 | 英文名 | 职业资料 | 子职资料 | 核验状态 |
|---|---|---|---|---|---|
| `barbarian` | 野蛮人 | Barbarian | [野蛮人详细资料](classes/subclasses/barbarian/barbarian.md) | [狂战士道途](classes/subclasses/barbarian/barbarian-berserker.md)<br>[兽心道途](classes/subclasses/barbarian/barbarian-wild-heart.md)<br>[世界树道途](classes/subclasses/barbarian/barbarian-world-tree.md)<br>[狂热者道途](classes/subclasses/barbarian/barbarian-zealot.md) | 基础职业与 4 个核心道途已接入运行时（B08-03） |
| `bard` | 吟游诗人 | Bard | [吟游诗人详细资料](classes/subclasses/bard/bard.md) | [舞蹈学院](classes/subclasses/bard/bard-college-of-dance.md)<br>[魅心学院](classes/subclasses/bard/bard-college-of-glamour.md)<br>[逸闻学院](classes/subclasses/bard/bard-college-of-lore.md)<br>[勇气学院](classes/subclasses/bard/bard-college-of-valor.md) | 基础职业与 4 个学院已接入运行时（B08-08） |
| `cleric` | 牧师 | Cleric | [牧师详细资料](classes/subclasses/cleric/cleric.md) | [生命领域](classes/subclasses/cleric/cleric-life-domain.md)<br>[光明领域](classes/subclasses/cleric/cleric-light-domain.md)<br>[诡术领域](classes/subclasses/cleric/cleric-trickery-domain.md)<br>[战争领域](classes/subclasses/cleric/cleric-war-domain.md) | 基础职业与 4 个领域已接入运行时（B08-06） |
| `druid` | 德鲁伊 | Druid | [德鲁伊详细资料](classes/subclasses/druid/druid.md) | [大地结社](classes/subclasses/druid/druid-circle-of-the-land.md)<br>[月亮结社](classes/subclasses/druid/druid-circle-of-the-moon.md)<br>[海洋结社](classes/subclasses/druid/druid-circle-of-the-sea.md)<br>[星辰结社](classes/subclasses/druid/druid-circle-of-the-stars.md) | 基础职业与 4 个结社已接入运行时（B08-07） |
| `fighter` | 战士 | Fighter | [战士详细资料](classes/subclasses/fighter/fighter.md) | [战斗大师](classes/subclasses/fighter/fighter-battle-master.md)<br>[勇士](classes/subclasses/fighter/fighter-champion.md)<br>[奥法骑士](classes/subclasses/fighter/fighter-eldritch-knight.md)<br>[灵能战士](classes/subclasses/fighter/fighter-psi-warrior.md) | 基础职业与 4 个子职已接入运行时（B08-13） |
| `monk` | 武僧 | Monk | [武僧详细资料](classes/subclasses/monk/monk.md) | [命流武者](classes/subclasses/monk/monk-mercy.md)<br>[四象武者](classes/subclasses/monk/monk-elements.md)<br>[散打武者](classes/subclasses/monk/monk-open-hand.md)<br>[暗影武者](classes/subclasses/monk/monk-shadow.md) | 基础职业与 4 个子职已接入运行时（B08-05） |
| `paladin` | 圣武士 | Paladin | [圣武士详细资料](classes/subclasses/paladin/paladin.md) | [奉献之誓](classes/subclasses/paladin/paladin-oath-of-devotion.md)<br>[荣耀之誓](classes/subclasses/paladin/paladin-oath-of-glory.md)<br>[古贤之誓](classes/subclasses/paladin/paladin-oath-of-the-ancients.md)<br>[复仇之誓](classes/subclasses/paladin/paladin-oath-of-vengeance.md) | 基础职业与 4 个誓言已接入运行时（B08-11） |
| `ranger` | 游侠 | Ranger | [游侠详细资料](classes/subclasses/ranger/ranger.md) | [驯兽师](classes/subclasses/ranger/ranger-beast-master.md)<br>[妖精漫游者](classes/subclasses/ranger/ranger-fey-wanderer.md)<br>[幽域追猎者](classes/subclasses/ranger/ranger-gloom-stalker.md)<br>[猎人](classes/subclasses/ranger/ranger-hunter.md) | 基础职业与 4 个范型已接入运行时（B08-12） |
| `rogue` | 游荡者 | Rogue | [游荡者详细资料](classes/subclasses/rogue/rogue.md) | [诡术师](classes/subclasses/rogue/rogue-arcane-trickster.md)<br>[刺客](classes/subclasses/rogue/rogue-assassin.md)<br>[魂刃](classes/subclasses/rogue/rogue-soulknife.md)<br>[盗贼](classes/subclasses/rogue/rogue-thief.md) | 基础职业与 4 个子职已接入运行时（B08-04） |
| `sorcerer` | 术士 | Sorcerer | [术士详细资料](classes/subclasses/sorcerer/sorcerer.md) | [畸变术法](classes/subclasses/sorcerer/sorcerer-aberrant-sorcery.md)<br>[时械术法](classes/subclasses/sorcerer/sorcerer-clockwork-sorcery.md)<br>[龙族术法](classes/subclasses/sorcerer/sorcerer-draconic-sorcery.md)<br>[狂野术法](classes/subclasses/sorcerer/sorcerer-wild-magic-sorcery.md) | 基础职业与 4 个术法已接入运行时（B08-09） |
| `warlock` | 魔契师（旧稿：邪术师） | Warlock | [魔契师详细资料](classes/subclasses/warlock/warlock.md) | [至高妖精宗主](classes/subclasses/warlock/warlock-archfey-patron.md)<br>[天界宗主](classes/subclasses/warlock/warlock-celestial-patron.md)<br>[邪魔宗主](classes/subclasses/warlock/warlock-fiend-patron.md)<br>[旧日支配者宗主](classes/subclasses/warlock/warlock-great-old-one-patron.md) | 基础职业与 4 个宗主已接入运行时（B08-10） |
| `wizard` | 法师 | Wizard | [法师详细资料](classes/subclasses/wizard/wizard.md) | [防护师](classes/subclasses/wizard/wizard-abjurer.md)<br>[预言师](classes/subclasses/wizard/wizard-diviner.md)<br>[塑能师](classes/subclasses/wizard/wizard-evoker.md)<br>[幻术师](classes/subclasses/wizard/wizard-illusionist.md) | 基础职业与 4 个子职已接入运行时（B08-13） |

## 4.1 官方旧版与扩展子职索引

以下条目是基于 2014 职业框架发行的官方旧版或扩展子职。每个文件只记录来源、兼容边界与官方详情链接，不复制商业规则正文；其中 DM 选项不会进入默认玩家可选列表。

- **野蛮人**：[图腾武者道途](classes/subclasses/barbarian/barbarian-totem-warrior.md)、[战狂道途](classes/subclasses/barbarian/barbarian-battlerager.md)、[先祖守卫道途](classes/subclasses/barbarian/barbarian-ancestral-guardian.md)、[风暴先驱道途](classes/subclasses/barbarian/barbarian-storm-herald.md)、[狂野魔法道途](classes/subclasses/barbarian/barbarian-wild-magic.md)、[野兽道途](classes/subclasses/barbarian/barbarian-beast.md)、[巨人道途](classes/subclasses/barbarian/barbarian-giant.md)
- **吟游诗人**：[剑舞学院](classes/subclasses/bard/bard-college-of-swords.md)、[低语学院](classes/subclasses/bard/bard-college-of-whispers.md)、[创造学院](classes/subclasses/bard/bard-college-of-creation.md)、[雄辩学院](classes/subclasses/bard/bard-college-of-eloquence.md)、[精魂学院](classes/subclasses/bard/bard-college-of-spirits.md)
- **牧师**：[知识领域](classes/subclasses/cleric/cleric-knowledge-domain.md)、[自然领域](classes/subclasses/cleric/cleric-nature-domain.md)、[风暴领域](classes/subclasses/cleric/cleric-tempest-domain.md)、[奥秘领域](classes/subclasses/cleric/cleric-arcana-domain.md)、[锻造领域](classes/subclasses/cleric/cleric-forge-domain.md)、[坟墓领域](classes/subclasses/cleric/cleric-grave-domain.md)、[秩序领域](classes/subclasses/cleric/cleric-order-domain.md)、[和平领域](classes/subclasses/cleric/cleric-peace-domain.md)、[暮光领域](classes/subclasses/cleric/cleric-twilight-domain.md)、[死亡领域（DM 选项）](classes/subclasses/cleric/cleric-death-domain.md)
- **德鲁伊**：[梦境结社](classes/subclasses/druid/druid-circle-of-dreams.md)、[牧人结社](classes/subclasses/druid/druid-circle-of-the-shepherd.md)、[孢子结社](classes/subclasses/druid/druid-circle-of-spores.md)、[野火结社](classes/subclasses/druid/druid-circle-of-wildfire.md)
- **战士**：[紫龙骑士](classes/subclasses/fighter/fighter-purple-dragon-knight.md)、[奥法射手](classes/subclasses/fighter/fighter-arcane-archer.md)、[骑兵](classes/subclasses/fighter/fighter-cavalier.md)、[武士](classes/subclasses/fighter/fighter-samurai.md)、[回音骑士](classes/subclasses/fighter/fighter-echo-knight.md)、[符文骑士](classes/subclasses/fighter/fighter-rune-knight.md)
- **武僧**：[永亡宗](classes/subclasses/monk/monk-long-death.md)、[醉拳宗](classes/subclasses/monk/monk-drunken-master.md)、[剑圣宗](classes/subclasses/monk/monk-kensei.md)、[日魂宗](classes/subclasses/monk/monk-sun-soul.md)、[星我宗](classes/subclasses/monk/monk-astral-self.md)、[神龙宗](classes/subclasses/monk/monk-ascendant-dragon.md)
- **圣武士**：[王冠之誓](classes/subclasses/paladin/paladin-oath-of-the-crown.md)、[征服之誓](classes/subclasses/paladin/paladin-oath-of-conquest.md)、[救赎之誓](classes/subclasses/paladin/paladin-oath-of-redemption.md)、[守望之誓](classes/subclasses/paladin/paladin-oath-of-the-watchers.md)、[破誓者（DM 选项）](classes/subclasses/paladin/paladin-oathbreaker.md)
- **游侠**：[边界行者](classes/subclasses/ranger/ranger-horizon-walker.md)、[怪物杀手](classes/subclasses/ranger/ranger-monster-slayer.md)、[集群牧者](classes/subclasses/ranger/ranger-swarmkeeper.md)、[龙兽守卫](classes/subclasses/ranger/ranger-drakewarden.md)
- **游荡者**：[调查员](classes/subclasses/rogue/rogue-inquisitive.md)、[策士](classes/subclasses/rogue/rogue-mastermind.md)、[斥候](classes/subclasses/rogue/rogue-scout.md)、[风流剑客](classes/subclasses/rogue/rogue-swashbuckler.md)、[鬼魅](classes/subclasses/rogue/rogue-phantom.md)
- **术士**：[神圣之魂](classes/subclasses/sorcerer/sorcerer-divine-soul.md)、[幽影魔法](classes/subclasses/sorcerer/sorcerer-shadow-magic.md)、[风暴术法](classes/subclasses/sorcerer/sorcerer-storm-sorcery.md)、[月之术法](classes/subclasses/sorcerer/sorcerer-lunar-sorcery.md)
- **邪术师**：[不朽者](classes/subclasses/warlock/warlock-undying-patron.md)、[咒剑](classes/subclasses/warlock/warlock-hexblade-patron.md)、[深海意志](classes/subclasses/warlock/warlock-fathomless-patron.md)、[巨灵](classes/subclasses/warlock/warlock-genie-patron.md)、[死灵](classes/subclasses/warlock/warlock-undead-patron.md)
- **法师**：[咒法学派](classes/subclasses/wizard/wizard-conjuration.md)、[附魔学派](classes/subclasses/wizard/wizard-enchantment.md)、[死灵学派](classes/subclasses/wizard/wizard-necromancy.md)、[变化学派](classes/subclasses/wizard/wizard-transmutation.md)、[剑咏](classes/subclasses/wizard/wizard-bladesinging.md)、[战争魔法](classes/subclasses/wizard/wizard-war-magic.md)、[时间魔法](classes/subclasses/wizard/wizard-chronurgy-magic.md)、[重力魔法](classes/subclasses/wizard/wizard-graviturgy-magic.md)、[书士会](classes/subclasses/wizard/wizard-order-of-scribes.md)

产品主项目已将上述索引与 2014 核心子职收口为独立目录，共 114 项；其中 112 项可进入普通玩家时间线，死亡领域与破誓者仅作为 DM 专用索引登记。即使名称或主题与 2024 条目相近，2014 条目仍使用独立稳定 ID、独立来源和独立元数据，不再由 2024 条目承接。世界树道途、舞蹈学院和海洋结社仅属于 2024，不进入当前目录。

各职业目录数量为：野蛮人 9、吟游诗人 8、牧师 14、德鲁伊 7、战士 10、武僧 10、圣武士 9、游侠 8、游荡者 9、术士 8、邪术师 9、法师 13。商业扩展内容只记录选择所需的名称、英文名、来源与原创摘要；未经核验的具体规则效果不参与自动计算。

### 4.2 2024 扩展职业（破解奥秘 UA，已接入）

以下条目使用 2024 规则框架，来源于《破解奥秘：艾伯伦》（UA 游玩测试），默认关闭、需玩家在来源步骤显式启用；ID 使用 `class-2024-ua-*`／`subclass-2024-ua-*`，与 2014 同名内容完全隔离。

| ID | 中文名 | 英文名 | 子职 | 来源 | 状态 |
| --- | --- | --- | --- | --- | --- |
| `class-2024-ua-artificer` | 奇械师 | Artificer | 炼金师、装甲师、魔炮师、战地匠师、制图师 | `source-2024-ua-eberron` | `selectable`（E02，2026-09-18） |

被遗忘的国度 UA（`source-2024-ua-fr-subclasses`，E03，2026-09-18）已接入 8 个子职：月亮学院（吟游诗人）、知识领域（牧师）、紫龙骑士（战士）、巨灵贵族之誓（圣武士）、寒冬行者（游侠）、三之门徒（游荡者）、咒火术法（术士）、剑咏者（法师），ID 为 `subclass-2024-ua-<class>-<slug>`。

子职业更新 UA（`source-2024-ua-subclass-update`，E04，2026-09-18）已接入 5 个 2014 子职的 2024 版本：风暴先驱道途、精魂守卫道途（野蛮人）、骁骑士（战士）、醉拳武者（武僧）、破誓者（圣武士，DM 选项）；适配映射见 `app/src/rules/data/subclass-adaptations-2024.ts`。

其余 UA 子职（E05，2026-09-18）：可怖 7（`source-2024-ua-horror`）、奥术 9（`source-2024-ua-arcane`，奥术 II 取版）、浩劫 4（`source-2024-ua-cataclysm`），共 20 个唯一概念；同一概念只保留一个可选条目（可怖咒剑宗主不登记，采用奥术版）。

灵能 UA（`source-2024-ua-psion`，E06，2026-09-18）已接入灵能使（`class-2024-ua-psion`）：1—20 级、灵能骰 4d6→12d12（短休 1／长休全部）、11 项灵能才赋、4 子职（蜕变使／裂空使／念动使／传心使）、141 条职业法术与 17 道灵能 UA 法术。

- 奇械师 2024：d8 生命骰、智力准备施法、半施法位（向上取整）、1—20 级；81 条职业法术；仿制魔法物品方案 50 项（2+／6+／10+／14+），同时存在上限 2／3／4／5／6；起始装备 A（16 GP）／B（150 GP）。
- 子职特性：炼金师（实验性灵药）、装甲师（装甲型号）、魔炮师（魔能炮台）、战地匠师（钢铁守卫）、制图师（冒险者的地图匣）。
- 遗留：仿制物品的创造／绑定交互 UI；聚合物品（+1／+2 武器、护甲等）的基底选择按提示级处理。

## 5. 职业章节

以下章节先建立稳定锚点。资料完成后，应在对应章节内按照“职业基础 → 等级特性 → 子职 → 选择与校验 → 来源”的顺序记录。

### 5.1 野蛮人 Barbarian

- 职业 ID：`barbarian`
- 职业基础与等级特性：[野蛮人详细资料](classes/subclasses/barbarian/barbarian.md)
- 2024 子职：[狂战士道途](classes/subclasses/barbarian/barbarian-berserker.md)、[兽心道途](classes/subclasses/barbarian/barbarian-wild-heart.md)（旧稿：狂野之心道途）、[世界树道途](classes/subclasses/barbarian/barbarian-world-tree.md)、[狂热者道途](classes/subclasses/barbarian/barbarian-zealot.md)（旧稿：狂信者道途）
- 旧版与扩展子职：[图腾武者道途](classes/subclasses/barbarian/barbarian-totem-warrior.md)、[战狂道途](classes/subclasses/barbarian/barbarian-battlerager.md)、[先祖守卫道途](classes/subclasses/barbarian/barbarian-ancestral-guardian.md)、[风暴先驱道途](classes/subclasses/barbarian/barbarian-storm-herald.md)、[狂野魔法道途](classes/subclasses/barbarian/barbarian-wild-magic.md)、[野兽道途](classes/subclasses/barbarian/barbarian-beast.md)、[巨人道途](classes/subclasses/barbarian/barbarian-giant.md)
- 选择与校验：已记录技能、装备、武器精通（近战限定）、狂暴次数、无甲防御 AC、子职等级和旧版兼容边界
- 来源与核验：基础职业与 4 个核心道途已由 B08-03 按项目内 5e 不全书接入运行时；旧版与扩展子职仍沿用既有参考来源；最后核验日期 2026-09-14

### 5.2 吟游诗人 Bard

- 职业 ID：`bard`
- 职业基础与等级特性：[吟游诗人详细资料](classes/subclasses/bard/bard.md)
- 2024 子职：[舞蹈学院](classes/subclasses/bard/bard-college-of-dance.md)、[魅心学院](classes/subclasses/bard/bard-college-of-glamour.md)（旧稿：魅惑学院）、[逸闻学院](classes/subclasses/bard/bard-college-of-lore.md)（旧稿：博闻学院）、[勇气学院](classes/subclasses/bard/bard-college-of-valor.md)
- 旧版与扩展子职：[剑舞学院](classes/subclasses/bard/bard-college-of-swords.md)、[低语学院](classes/subclasses/bard/bard-college-of-whispers.md)、[创造学院](classes/subclasses/bard/bard-college-of-creation.md)、[雄辩学院](classes/subclasses/bard/bard-college-of-eloquence.md)、[精魂学院](classes/subclasses/bard/bard-college-of-spirits.md)
- 选择与校验：已记录技能（任选 3）、乐器（任选 3，10 种候选）、装备、戏法与准备法术、吟游诗人激励（次数＝魅力调整值，骰型 d6→d12）、两次专精（2／9 级）、魔法奥秘扩展法术池与子职等级；运行时的激励资源、乐器选择与魔法奥秘扩展已接入
- 来源与核验：基础职业与 4 个核心学院已由 B08-08 按项目内 5e 不全书接入运行时；旧版与扩展学院仍沿用既有参考来源；最后核验日期 2026-09-15

### 5.3 牧师 Cleric

- 职业 ID：`cleric`
- 职业基础与等级特性：[牧师详细资料](classes/subclasses/cleric/cleric.md)
- 2024 子职：[生命领域](classes/subclasses/cleric/cleric-life-domain.md)、[光明领域](classes/subclasses/cleric/cleric-light-domain.md)、[诡术领域](classes/subclasses/cleric/cleric-trickery-domain.md)、[战争领域](classes/subclasses/cleric/cleric-war-domain.md)
- 旧版与扩展子职：[知识领域](classes/subclasses/cleric/cleric-knowledge-domain.md)、[自然领域](classes/subclasses/cleric/cleric-nature-domain.md)、[风暴领域](classes/subclasses/cleric/cleric-tempest-domain.md)、[奥秘领域](classes/subclasses/cleric/cleric-arcana-domain.md)、[锻造领域](classes/subclasses/cleric/cleric-forge-domain.md)、[坟墓领域](classes/subclasses/cleric/cleric-grave-domain.md)、[秩序领域](classes/subclasses/cleric/cleric-order-domain.md)、[和平领域](classes/subclasses/cleric/cleric-peace-domain.md)、[暮光领域](classes/subclasses/cleric/cleric-twilight-domain.md)、[死亡领域（DM 选项）](classes/subclasses/cleric/cleric-death-domain.md)
- 选择与校验：已记录技能、装备、圣职（保护者／奇术使）、戏法与准备法术、引导神力、领域法术与子职等级；运行时的圣职、受祝击选择与领域法术始终准备已接入
- 来源与核验：基础职业与 4 个核心领域已由 B08-06 按项目内 5e 不全书接入运行时；旧版与扩展领域仍沿用既有参考来源；最后核验日期 2026-09-15

### 5.4 德鲁伊 Druid

- 职业 ID：`druid`
- 职业基础与等级特性：[德鲁伊详细资料](classes/subclasses/druid/druid.md)
- 2024 子职：[大地结社](classes/subclasses/druid/druid-circle-of-the-land.md)、[月亮结社](classes/subclasses/druid/druid-circle-of-the-moon.md)、[海洋结社](classes/subclasses/druid/druid-circle-of-the-sea.md)、[星辰结社](classes/subclasses/druid/druid-circle-of-the-stars.md)
- 旧版与扩展子职：[梦境结社](classes/subclasses/druid/druid-circle-of-dreams.md)、[牧人结社](classes/subclasses/druid/druid-circle-of-the-shepherd.md)、[孢子结社](classes/subclasses/druid/druid-circle-of-spores.md)、[野火结社](classes/subclasses/druid/druid-circle-of-wildfire.md)
- 选择与校验：已记录技能、装备、原初职能（术师／卫士）、戏法与准备法术、元素之怒（7 级）、荒野变形次数与形态边界、结社法术与子职等级；运行时的原初职能、元素之怒与大地结社地形选择已接入
- 来源与核验：基础职业与 4 个核心结社已由 B08-07 按项目内 5e 不全书接入运行时；旧版与扩展结社仍沿用既有参考来源；最后核验日期 2026-09-15

### 5.5 战士 Fighter

- 职业 ID：`fighter`
- 职业基础与等级特性：[战士详细资料](classes/subclasses/fighter/fighter.md)
- 2024子职：[战斗大师](classes/subclasses/fighter/fighter-battle-master.md)、[勇士](classes/subclasses/fighter/fighter-champion.md)、[奥法骑士](classes/subclasses/fighter/fighter-eldritch-knight.md)、[灵能战士](classes/subclasses/fighter/fighter-psi-warrior.md)
- 旧版与扩展子职：[紫龙骑士](classes/subclasses/fighter/fighter-purple-dragon-knight.md)、[奥法射手](classes/subclasses/fighter/fighter-arcane-archer.md)、[骑兵](classes/subclasses/fighter/fighter-cavalier.md)、[武士](classes/subclasses/fighter/fighter-samurai.md)、[回音骑士](classes/subclasses/fighter/fighter-echo-knight.md)、[符文骑士](classes/subclasses/fighter/fighter-rune-knight.md)
- 选择与校验：已记录技能、装备、战斗风格、武器精通、回气、动作如潮、不屈、额外攻击和旧版资源兼容边界
- 来源与核验：首批战士／勇士已按项目内5e不全书复核，且职业、勇士特性、武器精通与检查点已由 B08-01 接入运行时（其余子职待 B08-13）；其他子职仍沿用既有参考来源；最后核验日期 2026-09-14

### 5.6 武僧 Monk

- 职业 ID：`monk`
- 职业基础与等级特性：[武僧详细资料](classes/subclasses/monk/monk.md)
- 2024子职：[命流武者](classes/subclasses/monk/monk-mercy.md)（旧稿：慈悲宗）、[四象武者](classes/subclasses/monk/monk-elements.md)（旧稿：元素宗）、[散打武者](classes/subclasses/monk/monk-open-hand.md)（旧稿：敞手宗）、[暗影武者](classes/subclasses/monk/monk-shadow.md)（旧稿：暗影宗）
- 旧版与扩展子职：[永亡宗](classes/subclasses/monk/monk-long-death.md)、[醉拳宗](classes/subclasses/monk/monk-drunken-master.md)、[剑圣宗](classes/subclasses/monk/monk-kensei.md)、[日魂宗](classes/subclasses/monk/monk-sun-soul.md)、[星我宗](classes/subclasses/monk/monk-astral-self.md)、[神龙宗](classes/subclasses/monk/monk-ascendant-dragon.md)
- 选择与校验：已记录技能、工具或乐器、无甲条件、武艺骰、功力、移动、拨挡攻击、震慑拳、属性提升与传奇恩惠，以及旧版气点兼容边界
- 来源与核验：基础职业与 4 个核心子职已由 B08-05 按项目内 5e 不全书接入运行时；旧版与扩展子职仍沿用既有参考来源；最后核验日期 2026-09-15

### 5.7 圣武士 Paladin

- 职业 ID：`paladin`
- 当前2014实现：[2014圣武士实现说明](classes/subclasses/paladin/paladin-2014.md)
- 职业基础与等级特性：[圣武士详细资料](classes/subclasses/paladin/paladin.md)
- 2024子职：[奉献之誓](classes/subclasses/paladin/paladin-oath-of-devotion.md)、[荣耀之誓](classes/subclasses/paladin/paladin-oath-of-glory.md)、[古贤之誓](classes/subclasses/paladin/paladin-oath-of-the-ancients.md)、[复仇之誓](classes/subclasses/paladin/paladin-oath-of-vengeance.md)
- 旧版与扩展子职：[王冠之誓](classes/subclasses/paladin/paladin-oath-of-the-crown.md)、[征服之誓](classes/subclasses/paladin/paladin-oath-of-conquest.md)、[救赎之誓](classes/subclasses/paladin/paladin-oath-of-redemption.md)、[守望之誓](classes/subclasses/paladin/paladin-oath-of-the-watchers.md)、[破誓者（DM选项）](classes/subclasses/paladin/paladin-oathbreaker.md)
- 选择与校验：已记录技能、装备、武器精通（限熟练）、战斗风格、圣疗池、半施法准备、引导神力、誓言法术与灵光；运行时的圣疗、引导神力、圣武斩／信实坐骑与誓言法术已接入
- 来源与核验：基础职业与 4 个核心誓言已由 B08-11 按项目内 5e 不全书接入运行时；旧版与扩展誓言仍沿用既有参考来源；最后核验日期 2026-09-15

### 5.8 游侠 Ranger

- 职业 ID：`ranger`
- 当前2014实现：[2014游侠实现说明](classes/subclasses/ranger/ranger-2014.md)
- 职业基础与等级特性：[游侠详细资料](classes/subclasses/ranger/ranger.md)
- 2024子职：[驯兽师](classes/subclasses/ranger/ranger-beast-master.md)、[妖精漫游者](classes/subclasses/ranger/ranger-fey-wanderer.md)、[幽域追猎者](classes/subclasses/ranger/ranger-gloom-stalker.md)、[猎人](classes/subclasses/ranger/ranger-hunter.md)
- 旧版与扩展子职：[边界行者](classes/subclasses/ranger/ranger-horizon-walker.md)、[怪物杀手](classes/subclasses/ranger/ranger-monster-slayer.md)、[集群牧者](classes/subclasses/ranger/ranger-swarmkeeper.md)、[龙兽守卫](classes/subclasses/ranger/ranger-drakewarden.md)
- 选择与校验：已记录技能、装备、施法、宿敌（猎人印记免费施放）、武器精通（限熟练）、战斗风格、专精、范型法术与伙伴兼容边界；运行时的宿敌、半施法准备、武器精通与范型选择已接入
- 来源与核验：基础职业与 4 个核心范型已由 B08-12 按项目内 5e 不全书接入运行时；旧版与扩展范型仍沿用既有参考来源；最后核验日期 2026-09-15

### 5.9 游荡者 Rogue

- 职业 ID：`rogue`
- 职业基础与等级特性：[游荡者详细资料](classes/subclasses/rogue/rogue.md)
- 2024子职：[诡术师](classes/subclasses/rogue/rogue-arcane-trickster.md)（旧稿：奥法骗徒）、[刺客](classes/subclasses/rogue/rogue-assassin.md)、[魂刃](classes/subclasses/rogue/rogue-soulknife.md)、[盗贼](classes/subclasses/rogue/rogue-thief.md)
- 旧版与扩展子职：[调查员](classes/subclasses/rogue/rogue-inquisitive.md)、[策士](classes/subclasses/rogue/rogue-mastermind.md)、[斥候](classes/subclasses/rogue/rogue-scout.md)、[风流剑客](classes/subclasses/rogue/rogue-swashbuckler.md)、[鬼魅](classes/subclasses/rogue/rogue-phantom.md)
- 选择与校验：已记录技能、两次专精、偷袭骰池、武器精通（限熟练武器）、诡诈打击、诡术师三分之一施法、反应与旧版偷袭资格边界
- 来源与核验：基础职业与 4 个核心子职已由 B08-04 按项目内 5e 不全书接入运行时；旧版与扩展子职仍沿用既有参考来源；最后核验日期 2026-09-14

### 5.10 术士 Sorcerer

- 职业 ID：`sorcerer`
- 职业基础与等级特性：[术士详细资料](classes/subclasses/sorcerer/sorcerer.md)
- **2014 规则（当前车卡基线）**：[2014 术士](classes/subclasses/sorcerer/sorcerer-2014.md)（3 级获得超魔法，10/17 级强化；超魔选项 10 项登记于 `app/src/rules/data/metamagic-2014.ts`，选择链路与 2024 资料隔离）
- 2024子职：[畸变术法](classes/subclasses/sorcerer/sorcerer-aberrant-sorcery.md)（旧稿：异怪术法）、[时械术法](classes/subclasses/sorcerer/sorcerer-clockwork-sorcery.md)（旧稿：机关术法）、[龙族术法](classes/subclasses/sorcerer/sorcerer-draconic-sorcery.md)、[狂野术法](classes/subclasses/sorcerer/sorcerer-wild-magic-sorcery.md)（旧稿：狂野魔法术法）
- 旧版与扩展子职：[神圣之魂](classes/subclasses/sorcerer/sorcerer-divine-soul.md)、[幽影魔法](classes/subclasses/sorcerer/sorcerer-shadow-magic.md)、[风暴术法](classes/subclasses/sorcerer/sorcerer-storm-sorcery.md)、[月之术法](classes/subclasses/sorcerer/sorcerer-lunar-sorcery.md)
- 选择与校验：已记录施法、先天术法、术法点、2024 超魔法（2／10／17 级各选 2 项，不可重复）、法术位转换、常备法术与子职等级；运行时的术法点、2024 超魔选项与子职法术已接入
- 来源与核验：基础职业与 4 个核心术法已由 B08-09 按项目内 5e 不全书接入运行时；旧版与扩展子职仍沿用既有参考来源；最后核验日期 2026-09-15

### 5.11 魔契师 Warlock（旧稿：邪术师）

- 职业 ID：`warlock`
- 当前2014实现：[2014邪术师实现说明](classes/subclasses/warlock/warlock-2014.md)
- 2014魔能祈唤与魔契恩泽：魔能祈唤 54 条（PHB 32／XGtE 14／TCoE 8），按等级与依赖先决分级筛选（2 级 2 项，5／7／9／12／15／18 级各 +1，累计 8 项，跨等级不可重复）；魔契恩泽 4 项（链之／刃之／书之／符之魔契）；译名按《5e 不全书》2014 章节定稿；最后核验日期 2026-09-19
- 职业基础与等级特性：[魔契师详细资料](classes/subclasses/warlock/warlock.md)
- 2024子职：[至高妖精宗主](classes/subclasses/warlock/warlock-archfey-patron.md)、[天界宗主](classes/subclasses/warlock/warlock-celestial-patron.md)、[邪魔宗主](classes/subclasses/warlock/warlock-fiend-patron.md)、[旧日支配者宗主](classes/subclasses/warlock/warlock-great-old-one-patron.md)
- 旧版与扩展子职：[不朽者](classes/subclasses/warlock/warlock-undying-patron.md)、[咒剑](classes/subclasses/warlock/warlock-hexblade-patron.md)、[深海意志](classes/subclasses/warlock/warlock-fathomless-patron.md)、[巨灵](classes/subclasses/warlock/warlock-genie-patron.md)、[死灵](classes/subclasses/warlock/warlock-undead-patron.md)
- 选择与校验：已记录契约魔法、魔能祈唤（28 项，按等级与依赖先决筛选）、秘法回流、玄奥秘法（11／13／15／17 级四档）、宗主等级与旧版1级特性映射；运行时的契约施法、祈唤先决与玄奥秘法已接入
- 来源与核验：基础职业与 4 个核心宗主已由 B08-10 按项目内 5e 不全书接入运行时；旧版与扩展宗主仍沿用既有参考来源；最后核验日期 2026-09-15

### 5.12 法师 Wizard

- 职业 ID：`wizard`
- 当前2014实现：[2014法师实现说明](classes/subclasses/wizard/wizard-2014.md)
- 职业基础与等级特性：[法师详细资料](classes/subclasses/wizard/wizard.md)
- 2024子职：[防护师](classes/subclasses/wizard/wizard-abjurer.md)、[预言师](classes/subclasses/wizard/wizard-diviner.md)、[塑能师](classes/subclasses/wizard/wizard-evoker.md)、[幻术师](classes/subclasses/wizard/wizard-illusionist.md)
- 旧版与扩展子职：[咒法学派](classes/subclasses/wizard/wizard-conjuration.md)、[附魔学派](classes/subclasses/wizard/wizard-enchantment.md)、[死灵学派](classes/subclasses/wizard/wizard-necromancy.md)、[变化学派](classes/subclasses/wizard/wizard-transmutation.md)、[剑咏](classes/subclasses/wizard/wizard-bladesinging.md)、[战争魔法](classes/subclasses/wizard/wizard-war-magic.md)、[时间魔法](classes/subclasses/wizard/wizard-chronurgy-magic.md)、[重力魔法](classes/subclasses/wizard/wizard-graviturgy-magic.md)、[书士会](classes/subclasses/wizard/wizard-order-of-scribes.md)
- 选择与校验：已记录法术书、准备法术、抄录、仪式、奥术回想、法术精通、招牌法术和旧版2级特性映射
- 来源与核验：首批法师／塑能师已按项目内5e不全书复核，且职业、塑能师特性、学者专精、法术精通／招牌法术与额外入书已由 B08-02 接入运行时（其余子职待 B08-13）；其他子职仍沿用既有参考来源；最后核验日期 2026-09-14

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
