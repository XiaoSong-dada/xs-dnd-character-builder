# D&D 5e 专长资料索引

> 本文档是专长、专长类别、前置条件与专长效果的选择性加载入口，不属于每次开发任务的立即加载文档。
> 当前已建立 2024/2014 双版本结构，并完成全部 2024 起源专长详细资料。

0.7.0 的 2014 可编辑仓库登记 72 个专长：PHB 42、XGtE 种族专长 15、TCoE 专长 15。扩展专长前置与半专长、技能/专精等子选择结构化保存；2024 专长不进入 2014 候选池。

## 术语与版本边界

| 规则集 | 专长组织方式 | 常见获得方式 | 程序支持状态 |
| --- | --- | --- | --- |
| `5e-2024` | 起源、通用、战斗风格、传奇恩惠四类 | 出身、物种或职业特性、属性值提升、传奇恩惠 | 当前 MVP 只直接使用 1 级可取得的起源与战斗风格专长 |
| `5e-2014` | 不使用 2024 四分类 | 以属性值提升换取专长，或由变体人类等规则授予 | 运行时支持 PHB、XGtE、TCoE 来源过滤与结构化前置 |

- 角色只能从与自身 `ruleset` 一致的候选集中取得专长。
- 2014 与 2024 的同名专长必须使用不同 ID 和独立文件；不得因名称相同而共享前置条件、数值或触发时机。
- 2024 起源专长没有默认等级前置，可以在规则明确授予起源专长时选择；通用专长通常要求至少 4 级，传奇恩惠通常要求至少 19 级。
- 战斗风格专长只有在职业或其他规则明确授予“战斗风格专长”时才可选择，不能作为任意 1 级起源专长取得。
- 每项专长默认只能取得一次；只有条目明确标记“可重复”时才能再次取得，并需分别保存每次选择。
- 前置条件必须在取得专长时校验。2014 角色后来失去前置条件时，专长保留但暂时不能使用；2024 条目按对应规则文本处理。

## 文档目录与字段约定

2024 专长按规则类别分目录，每个专长使用独立文件夹和同名主文件：

```text
docs/feats/5e-2024/origin/<feat-id>/<feat-id>.md
docs/feats/5e-2024/general/<feat-id>/<feat-id>.md
docs/feats/5e-2024/fighting-style/<feat-id>/<feat-id>.md
docs/feats/5e-2024/epic-boon/<feat-id>/<feat-id>.md
```

2014 不套用新版类别，直接按专长建立独立目录：

```text
docs/feats/5e-2014/<feat-id>/<feat-id>.md
```

每个专长文件至少记录：

- 稳定 ID、中文名、英文名、`ruleset`、类别、来源与版权边界。
- 等级、属性、职业、熟练或施法等前置条件。
- 获得方式、是否可重复，以及重复取得时必须改变的选择。
- 玩家必选项、动作或触发时机、使用次数、恢复方式和效果摘要。
- 对属性、熟练、攻击、伤害、AC、HP、先攻、法术与资源的影响来源。
- 非法选择的中文原因、版本兼容边界与实现校验提示。

稳定 ID 使用版本前缀：

```text
feat-2024-alert
feat-2024-fighting-style-archery
feat-2024-epic-boon-combat-prowess
feat-2014-alert
```

## 2024《玩家手册》专长清单

2024《玩家手册》共收录 75 项专长，分为 10 项起源专长、43 项通用专长、10 项战斗风格专长和 12 项传奇恩惠。开放免费规则可整理到实现级；只见于商业规则书的条目只记录机械索引、原创摘要、选择提示和官方入口。

### 起源专长（10）

| 中文名 | 英文名 | 详细资料 | 开放状态 |
| --- | --- | --- | --- |
| 警戒 | Alert | [2024 警戒](feats/5e-2024/origin/alert/alert.md) | 开放规则；样例已完成 |
| 巧匠 | Crafter | [2024 巧匠](feats/5e-2024/origin/crafter/crafter.md) | 商业摘要 |
| 医疗师 | Healer | [2024 医疗师](feats/5e-2024/origin/healer/healer.md) | 商业摘要 |
| 幸运 | Lucky | [2024 幸运](feats/5e-2024/origin/lucky/lucky.md) | 商业摘要 |
| 魔法学徒 | Magic Initiate | [2024 魔法学徒](feats/5e-2024/origin/magic-initiate/magic-initiate.md) | 开放规则 |
| 音乐家 | Musician | [2024 音乐家](feats/5e-2024/origin/musician/musician.md) | 商业摘要 |
| 凶蛮打手 | Savage Attacker | [2024 凶蛮打手](feats/5e-2024/origin/savage-attacker/savage-attacker.md) | 开放规则 |
| 熟习 | Skilled | [2024 熟习](feats/5e-2024/origin/skilled/skilled.md) | 开放规则 |
| 酒馆斗殴者 | Tavern Brawler | [2024 酒馆斗殴者](feats/5e-2024/origin/tavern-brawler/tavern-brawler.md) | 商业摘要 |
| 健壮 | Tough | [2024 健壮](feats/5e-2024/origin/tough/tough.md) | 商业摘要 |

### 通用专长（43）

| 中文名 | 英文名 | 详细资料 |
| --- | --- | --- |
| 属性值提升 | Ability Score Improvement | 第三批建立 |
| 演员 | Actor | 第三批建立 |
| 运动精英 | Athlete | 第三批建立 |
| 冲锋手 | Charger | 第三批建立 |
| 大厨 | Chef | 第三批建立 |
| 强弩专家 | Crossbow Expert | 第三批建立 |
| 粉碎者 | Crusher | 第三批建立 |
| 防御式决斗 | Defensive Duelist | 第三批建立 |
| 双持客 | Dual Wielder | 第三批建立 |
| 耐性 | Durable | 第三批建立 |
| 元素掌控 | Elemental Adept | 第三批建立 |
| 妖精触碰 | Fey-Touched | 第三批建立 |
| 擒抱者 | Grappler | 第三批建立 |
| 巨武器大师 | Great Weapon Master | 第三批建立 |
| 重甲运用 | Heavily Armored | 第三批建立 |
| 重甲大师 | Heavy Armor Master | 第三批建立 |
| 领袖之证 | Inspiring Leader | 第三批建立 |
| 敏锐心灵 | Keen Mind | 第三批建立 |
| 轻甲运用 | Lightly Armored | 第三批建立 |
| 巫师杀手 | Mage Slayer | 第三批建立 |
| 军用武器训练 | Martial Weapon Training | 第三批建立 |
| 中甲大师 | Medium Armor Master | 第三批建立 |
| 中甲运用 | Moderately Armored | 第三批建立 |
| 骑乘斗士 | Mounted Combatant | 第三批建立 |
| 观察力 | Observant | 第三批建立 |
| 穿刺者 | Piercer | 第三批建立 |
| 毒师 | Poisoner | 第三批建立 |
| 长柄武器大师 | Polearm Master | 第三批建立 |
| 强健身心 | Resilient | 第三批建立 |
| 仪式施法者 | Ritual Caster | 第三批建立 |
| 哨兵 | Sentinel | 第三批建立 |
| 影界触碰 | Shadow-Touched | 第三批建立 |
| 神射手 | Sharpshooter | 第三批建立 |
| 盾牌大师 | Shield Master | 第三批建立 |
| 技艺专家 | Skill Expert | 第三批建立 |
| 隐伏者 | Skulker | 第三批建立 |
| 劈砍者 | Slasher | 第三批建立 |
| 飙速跑者 | Speedy | 第三批建立 |
| 法术射手 | Spell Sniper | 第三批建立 |
| 念动力 | Telekinetic | 第三批建立 |
| 心电感应 | Telepathic | 第三批建立 |
| 战地施法者 | War Caster | 第三批建立 |
| 武器大师 | Weapon Master | 第三批建立 |

### 战斗风格专长（10）

| 中文名 | 英文名 | 详细资料 |
| --- | --- | --- |
| 箭术 | Archery | 第四批建立 |
| 盲斗 | Blind Fighting | 第四批建立 |
| 防御 | Defense | 第四批建立 |
| 对决 | Dueling | 第四批建立 |
| 巨武器战斗 | Great Weapon Fighting | 第四批建立 |
| 拦截 | Interception | 第四批建立 |
| 守护 | Protection | 第四批建立 |
| 投掷武器战斗 | Thrown Weapon Fighting | 第四批建立 |
| 双武器战斗 | Two-Weapon Fighting | 第四批建立 |
| 徒手战斗 | Unarmed Fighting | 第四批建立 |

### 传奇恩惠专长（12）

| 中文名 | 英文名 | 详细资料 |
| --- | --- | --- |
| 英勇战斗之恩惠 | Boon of Combat Prowess | 第五批建立 |
| 次元旅行之恩惠 | Boon of Dimensional Travel | 第五批建立 |
| 能量抗性之恩惠 | Boon of Energy Resistance | 第五批建立 |
| 扭曲命运之恩惠 | Boon of Fate | 第五批建立 |
| 超凡强韧之恩惠 | Boon of Fortitude | 第五批建立 |
| 无敌攻势之恩惠 | Boon of Irresistible Offense | 第五批建立 |
| 强力恢复之恩惠 | Boon of Recovery | 第五批建立 |
| 博学多才之恩惠 | Boon of Skill | 第五批建立 |
| 神行无拘之恩惠 | Boon of Speed | 第五批建立 |
| 法术溯回之恩惠 | Boon of Spell Recall | 第五批建立 |
| 暗夜精魂之恩惠 | Boon of the Night Spirit | 第五批建立 |
| 真实视觉之恩惠 | Boon of Truesight | 第五批建立 |

## 2014《玩家手册》专长清单

2014 专长属于可选规则。以下 42 项核心专长不使用 2024 的四类标签；其中同名专长仍需单独记录旧版前置条件与效果。

程序实现状态：42 项专长已在 `app/src/rules/data/feats-2014.ts` 全部登记**原创中文详细效果**（`FeatRule.detail`，仅展示不参与自动计算）并标记 `implemented`，时间线选择时可展开查看"专长效果"；角色卡"能力"页签的"专长与属性提升"区块展示已选专长并可展开详情。下表"状态"列反映资料文档核验情况。

| 中文名 | 英文名 | 详细资料 | 状态 |
| --- | --- | --- | --- |
| 演员 | Actor | 后续批次建立 | 商业摘要 |
| 警觉 | Alert | [2014 警觉](feats/5e-2014/alert/alert.md) | 样例已完成；商业摘要 |
| 运动员 | Athlete | 后续批次建立 | 商业摘要 |
| 冲锋手 | Charger | 后续批次建立 | 商业摘要 |
| 强弩专家 | Crossbow Expert | 后续批次建立 | 商业摘要 |
| 防御式决斗 | Defensive Duelist | 后续批次建立 | 商业摘要 |
| 双持客 | Dual Wielder | 后续批次建立 | 商业摘要 |
| 地城探索者 | Dungeon Delver | 后续批次建立 | 商业摘要 |
| 耐性 | Durable | 后续批次建立 | 商业摘要 |
| 元素导师 | Elemental Adept | 后续批次建立 | 商业摘要 |
| 擒抱者 | Grappler | 后续批次建立 | SRD 开放内容 |
| 巨武器大师 | Great Weapon Master | 后续批次建立 | 商业摘要 |
| 医疗师 | Healer | 后续批次建立 | 商业摘要 |
| 重甲运用 | Heavily Armored | 后续批次建立 | 商业摘要 |
| 重甲大师 | Heavy Armor Master | 后续批次建立 | 商业摘要 |
| 领袖之证 | Inspiring Leader | 后续批次建立 | 商业摘要 |
| 敏锐心灵 | Keen Mind | 后续批次建立 | 商业摘要 |
| 轻甲运用 | Lightly Armored | 后续批次建立 | 商业摘要 |
| 语言学家 | Linguist | 后续批次建立 | 商业摘要 |
| 幸运 | Lucky | 后续批次建立 | 商业摘要 |
| 巫师杀手 | Mage Slayer | 后续批次建立 | 商业摘要 |
| 魔法学徒 | Magic Initiate | 后续批次建立 | 商业摘要 |
| 战技专家 | Martial Adept | 后续批次建立 | 商业摘要 |
| 中甲大师 | Medium Armor Master | 后续批次建立 | 商业摘要 |
| 灵活移动 | Mobile | 后续批次建立 | 商业摘要 |
| 中甲运用 | Moderately Armored | 后续批次建立 | 商业摘要 |
| 骑乘战斗 | Mounted Combatant | 后续批次建立 | 商业摘要 |
| 观察力 | Observant | 后续批次建立 | 商业摘要 |
| 长柄武器大师 | Polearm Master | 后续批次建立 | 商业摘要 |
| 强健身心 | Resilient | 后续批次建立 | 商业摘要 |
| 仪式施法者 | Ritual Caster | 后续批次建立 | 商业摘要 |
| 凶蛮打手 | Savage Attacker | 后续批次建立 | 商业摘要 |
| 哨兵 | Sentinel | 后续批次建立 | 商业摘要 |
| 神射手 | Sharpshooter | 后续批次建立 | 商业摘要 |
| 盾牌大师 | Shield Master | 后续批次建立 | 商业摘要 |
| 熟习 | Skilled | 后续批次建立 | 商业摘要 |
| 隐伏者 | Skulker | 后续批次建立 | 商业摘要 |
| 法术射手 | Spell Sniper | 后续批次建立 | 商业摘要 |
| 斗殴高手 | Tavern Brawler | 后续批次建立 | 商业摘要 |
| 健壮 | Tough | 后续批次建立 | 商业摘要 |
| 战地施法者 | War Caster | 后续批次建立 | 商业摘要 |
| 武器大师 | Weapon Master | 后续批次建立 | 商业摘要 |

## 取得与校验顺序

1. 先确定角色规则集、当前等级和专长来源。
2. 根据来源限定候选类别，例如出身只授予其固定起源专长，战斗风格特性只授予战斗风格专长。
3. 检查等级、属性、职业、熟练、施法能力和其他前置条件。
4. 检查该专长是否已经取得；仅在条目标记可重复时允许再次选择。
5. 完成法术、属性、技能、工具、武器等内部选项，并保存每项选择的来源。
6. 将专长效果作为独立来源参与派生计算，不直接覆盖角色的原始属性或职业数据。
7. 返回具体中文错误，例如“该专长要求角色至少 4 级”或“你已经选择过这个法术列表的魔法学徒”。

## 来源与版权边界

- 2024 开放内容依据 [2024 Free Rules：Feats](https://www.dndbeyond.com/sources/dnd/br-2024/feats) 与 SRD 5.2.1，可用项目原创表述整理到实现级。
- 2024《玩家手册》确认共含 75 项专长，并分为起源、通用、战斗风格和传奇恩惠四类；商业独占条目只做机械摘要，不复制规则书原文。
- 2014 专长通则依据 [2014 Basic Rules：Customization Options](https://www.dndbeyond.com/sources/dnd/basic-rules-2014/customization-options)；2014 SRD 开放条目可整理到实现级，其余《玩家手册》条目只做商业摘要。
- 中文名用于项目展示；若官方简体中文译名与当前常用译名不同，应保留英文名和稳定 ID，并在核验后统一调整显示名。

## 当前完成状态

- 建立日期：2026-07-29。
- 当前完成范围：总索引、全部 10 项 2024 起源专长、2014 警觉样例，共 12 个 Markdown 文件。
- 后续按“2024 通用 → 2024 战斗风格 → 2024 传奇恩惠 → 2014 核心专长”的批次补全。
- 新增资料后必须检查文件数量、索引覆盖、本地链接、稳定 ID 唯一性、规则集隔离、类别前置和版权边界。
