# 2014 邪术师实现说明

- 稳定 ID：`class-2014-warlock`
- 规则集：`5e-2014`
- 实现状态：基础职业时间线、契约施法选择与派生数值已实现；魔能祈唤 54 条与魔契恩泽 4 项已登记（`index-only`）

## 施法数据

- 1级开始契约施法，施法属性为魅力。
- 戏法与已知法术数量使用2014邪术师职业表。
- 1—9级契约法术位环级逐步提升，9级后最高为5环。
- 法术攻击与法术豁免 DC 分别使用魅力调整值。
- 6—9环玄奥秘法将在职业资源批次独立保存，不混入普通已知法术数量。

## 时间线

- 1级选择2项职业技能与异界宗主。
- 2级选择2项魔能祈唤；5、7、9、12、15、18级各新增1项，至18级累计8项。
- 3级选择魔契恩泽（链之、刃之、书之、符之魔契四选一）。
- 4、8、12、16、19级选择属性提升或专长。

宗主、祈唤与魔契恩泽已按《5e 不全书》逐条核验，状态为 `implemented`（可参与选择合法性与结构校验）；具体效果仍以原创摘要展示，不进入自动计算。时间线中这三类候选使用可展开卡片：折叠时只看名称与一行摘要，展开后可读完整效果、先决条件与来源。

## 魔能祈唤

数据文件：`app/src/rules/data/invocations-2014.ts`。译名基准为《5e 不全书》2026-09-13 版的**2014 章节**（PHB 3934／XGtE 4430／TCoE 1307），与 2024 侧各自独立、不强制统一（例如 2014 用「千面之脸／迷雾幻影／坟墓低语」，2024 用「千面之颜／幻象迷踪／坟茔殁语」）。

来源与条数：玩家手册 32 条、珊娜萨的万事指南（XGtE）14 条、塔莎的万事坩埚（TCoE）8 条，合计 **54 条**。

### 先决条件

先决条件是学习该祈唤的**必要条件与充分条件**，其中等级要求指**邪术师等级**；满足先决的同一等级即可学习。分四类：

| 类型 | 判定 | 条数 | 示例 |
| --- | --- | ---: | --- |
| 等级先决（仅等级） | 邪术师等级 ≥ N | 20 | 星移步法（9 级）、穹宇尽视（15 级） |
| 等级 + 魔契 | 两者同时满足 | 8 | 饮命者（12 级 + 刃之魔契）、卡瑟利之链（15 级 + 链之魔契） |
| 魔契先决（仅魔契） | 3 级已选定该魔契恩泽 | 7 | 远古奥秘之书（书之魔契）、缚主之音（链之魔契） |
| 法术先决 | 已习得戏法魔能爆 | 5 | 苦痛魔爆、魔能长枪、斥力魔爆、哈达之攫、怠惰之枪 |
| 等级 + 择一条件（提示级） | 等级照常校验；择一条件仅写入描述 | 2 | 癫狂巫咒（5 级）、残酷巫咒（7 级） |
| 无先决 | 任意等级可选 | 12 | 幽影护甲、魔鬼视界、魔能意志 |
| 合计 | | 54 | |
- 等级先决门槛集中在 5／7／9／12／15 级，与职业表节奏一致。
- 提升邪术师等级时可用新祈唤替换一条已学会的祈唤，但必须满足新祈唤的先决条件。

### 全量清单

| 祈唤 | 英文名 | 先决 | 来源 |
| --- | --- | --- | --- |
| 苦痛魔爆 | Agonizing Blast | 已习得戏法魔能爆 | PHB |
| 幽影护甲 | Armor of Shadows | — | PHB |
| 星移步法 | Ascendant Step | 9 级 | PHB |
| 野兽之语 | Beast Speech | — | PHB |
| 诱导话术 | Beguiling Influence | — | PHB |
| 惑人低语 | Bewitching Whispers | 7 级 | PHB |
| 远古奥秘之书 | Book of Ancient Secrets | 书之魔契 | PHB |
| 卡瑟利之链 | Chains of Carceri | 15 级 + 链之魔契 | PHB |
| 魔鬼视界 | Devil's Sight | — | PHB |
| 恐惧箴言 | Dreadful Word | 7 级 | PHB |
| 魔能视界 | Eldritch Sight | — | PHB |
| 魔能长枪 | Eldritch Spear | 已习得戏法魔能爆 | PHB |
| 符文守护者之眼 | Eyes of the Rune Keeper | — | PHB |
| 邪魔活力 | Fiendish Vigor | — | PHB |
| 共视感官 | Gaze of Two Minds | — | PHB |
| 饮命者 | Lifedrinker | 12 级 + 刃之魔契 | PHB |
| 千面之脸 | Mask of Many Faces | — | PHB |
| 万形之主 | Master of Myriad Forms | 15 级 | PHB |
| 混沌手下 | Minions of Chaos | 9 级 | PHB |
| 心灵泥沼 | Mire the Mind | 5 级 | PHB |
| 迷雾幻影 | Misty Visions | — | PHB |
| 融身入影 | One with Shadows | 5 级 | PHB |
| 超凡跳跃 | Otherworldly Leap | 9 级 | PHB |
| 斥力魔爆 | Repelling Blast | 已习得戏法魔能爆 | PHB |
| 重塑血肉 | Sculptor of Flesh | 7 级 | PHB |
| 凶兆符记 | Sign of Ill Omen | 5 级 | PHB |
| 五运窃贼 | Thief of Five Fates | — | PHB |
| 饥渴魔刃 | Thirsting Blade | 5 级 + 刃之魔契 | PHB |
| 穹宇尽视 | Visions of Distant Realms | 15 级 | PHB |
| 缚主之音 | Voice of the Chain Master | 链之魔契 | PHB |
| 坟墓低语 | Whispers of the Grave | 9 级 | PHB |
| 巫术视界 | Witch Sight | 15 级 | PHB |
| 月之仪态 | Aspect of the Moon | 书之魔契 | XGtE |
| 永生者赠礼 | Gift of the Ever-Living Ones | 链之魔契 | XGtE |
| 哈达之攫 | Grasp of Hadar | 已习得戏法魔能爆 | XGtE |
| 进阶契约武器 | Improved Pact Weapon | 刃之魔契 | XGtE |
| 怠惰之枪 | Lance of Lethargy | 已习得戏法魔能爆 | XGtE |
| 飞蝇斗篷 | Cloak of Flies | 5 级 | XGtE |
| 魔能斩 | Eldritch Smite | 5 级 + 刃之魔契 | XGtE |
| 深海馈赠 | Gift of the Depths | 5 级 | XGtE |
| 癫狂巫咒 | Maddening Hex | 5 级 + 择一条件 | XGtE |
| 莱维斯图斯之墓 | Tomb of Levistus | 5 级 | XGtE |
| 幽魂凝视 | Ghostly Gaze | 7 级 | XGtE |
| 残酷巫咒 | Relentless Hex | 7 级 + 择一条件 | XGtE |
| 诡术师的逃脱术 | Trickster's Escape | 7 级 | XGtE |
| 阴影环绕 | Shroud of Shadow | 15 级 | XGtE |
| 魔能意志 | Eldritch Mind | — | TCoE |
| 链主赋能 | Investment of the Chain Master | 链之魔契 | TCoE |
| 符令责斥 | Rebuke of the Talisman | 符之魔契 | TCoE |
| 遥远音讯 | Far Scribe | 5 级 + 书之魔契 | TCoE |
| 永恒奴役 | Undying Servitude | 5 级 | TCoE |
| 护符庇佑 | Protection of the Talisman | 7 级 + 符之魔契 | TCoE |
| 守护馈赠 | Gift of the Protectors | 9 级 + 书之魔契 | TCoE |
| 护符牵绊 | Bond of the Talisman | 12 级 + 符之魔契 | TCoE |

### 授予法术（免费施法）

以下 3 条按「无需法术位施展一次、每次长休恢复」登记为结构化授予，可进入跑团资源的免费施法结算：

| 祈唤 | 授予法术 |
| --- | --- |
| 深海馈赠 | 水下呼吸 |
| 诡术师的逃脱术 | 行动自如 |
| 永恒奴役 | 活化死尸 |

其余祈唤的「随意施展」（如幽影护甲、魔鬼视界一类的常驻效果）与「消耗契约法术位施展、长休后可再施展」（如惑人低语、恐惧箴言等 7 条）不属免费施法语义，仅以描述提示，不进入自动计算。

## 魔契恩泽

3 级职业特性，四项择一（数据见 `app/src/rules/data/arcane-casters-2014.ts`）：

| 选项 | 稳定 ID | 来源 | 说明 |
| --- | --- | --- | --- |
| 链之魔契 | `pact-chain` | PHB | 习得寻获魔宠；魔宠可选特殊形态，并可用一次攻击换取魔宠的反应攻击 |
| 刃之魔契 | `pact-blade` | PHB | 以动作创造契约武器，视为拥有熟练项且攻击具有魔法性 |
| 书之魔契 | `pact-tome` | PHB | 影之书含 3 个来自任意职业法术列表的戏法，持书时随意施展 |
| 符之魔契 | `pact-talisman` | TCoE | 护符使佩戴者属性检定失败时可加 1d4；次数等于熟练加值，长休后恢复 |

选项 ID 自首版沿用不变，旧草稿可继续解析；关闭 TCoE 来源时「符之魔契」及其 3 条依赖祈唤会退出候选。

## 边界说明

- 祈唤与魔契恩泽效果以原创中文摘要登记，未做战斗回合级模拟；除上表 3 条授予法术外不参与自动计算（`implemented` 仅表示条目数据完整、可参与选择合法性与结构校验）。
- 邪术师职业名保持「邪术师」，不采用新版不全书 2014 章节的「魔契师」称谓；魔契恩泽选项名则按不全书定稿。
- 本页与 [2024 魔契师](warlock.md) 数据完全隔离，四宗主与契约法术位规则互不影响。
