# D&D 5e 专长资料索引

> 本文档是专长、专长类别、前置条件与专长效果的选择性加载入口，不属于每次开发任务的立即加载文档。
> 当前已建立 2024/2014 双版本结构，并完成全部 2024 起源专长详细资料。

## 术语与版本边界

| 规则集 | 专长组织方式 | 常见获得方式 | 程序支持状态 |
| --- | --- | --- | --- |
| `5e-2024` | 起源、通用、战斗风格、传奇恩惠四类 | 出身、物种或职业特性、属性值提升、传奇恩惠 | 当前 MVP 只直接使用 1 级可取得的起源与战斗风格专长 |
| `5e-2014` | 不使用 2024 四分类 | 以属性值提升换取专长，或由变体人类等规则授予 | 独立参考层，必须启用专长可选规则 |

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
| 警觉 | Alert | [2024 警觉](feats/5e-2024/origin/alert/alert.md) | 开放规则；样例已完成 |
| 工匠 | Crafter | [2024 工匠](feats/5e-2024/origin/crafter/crafter.md) | 商业摘要 |
| 医者 | Healer | [2024 医者](feats/5e-2024/origin/healer/healer.md) | 商业摘要 |
| 幸运 | Lucky | [2024 幸运](feats/5e-2024/origin/lucky/lucky.md) | 商业摘要 |
| 魔法学徒 | Magic Initiate | [2024 魔法学徒](feats/5e-2024/origin/magic-initiate/magic-initiate.md) | 开放规则 |
| 音乐家 | Musician | [2024 音乐家](feats/5e-2024/origin/musician/musician.md) | 商业摘要 |
| 凶蛮攻击者 | Savage Attacker | [2024 凶蛮攻击者](feats/5e-2024/origin/savage-attacker/savage-attacker.md) | 开放规则 |
| 熟练 | Skilled | [2024 熟练](feats/5e-2024/origin/skilled/skilled.md) | 开放规则 |
| 酒馆斗殴者 | Tavern Brawler | [2024 酒馆斗殴者](feats/5e-2024/origin/tavern-brawler/tavern-brawler.md) | 商业摘要 |
| 强韧 | Tough | [2024 强韧](feats/5e-2024/origin/tough/tough.md) | 商业摘要 |

### 通用专长（43）

| 中文名 | 英文名 | 详细资料 |
| --- | --- | --- |
| 属性值提升 | Ability Score Improvement | 第三批建立 |
| 演员 | Actor | 第三批建立 |
| 运动健将 | Athlete | 第三批建立 |
| 冲锋者 | Charger | 第三批建立 |
| 厨师 | Chef | 第三批建立 |
| 弩箭专家 | Crossbow Expert | 第三批建立 |
| 粉碎者 | Crusher | 第三批建立 |
| 防御式决斗 | Defensive Duelist | 第三批建立 |
| 双持客 | Dual Wielder | 第三批建立 |
| 耐久 | Durable | 第三批建立 |
| 元素专精 | Elemental Adept | 第三批建立 |
| 妖精触碰 | Fey-Touched | 第三批建立 |
| 擒抱者 | Grappler | 第三批建立 |
| 巨武器大师 | Great Weapon Master | 第三批建立 |
| 重甲训练 | Heavily Armored | 第三批建立 |
| 重甲大师 | Heavy Armor Master | 第三批建立 |
| 激励领袖 | Inspiring Leader | 第三批建立 |
| 敏锐心灵 | Keen Mind | 第三批建立 |
| 轻甲训练 | Lightly Armored | 第三批建立 |
| 法师杀手 | Mage Slayer | 第三批建立 |
| 军用武器训练 | Martial Weapon Training | 第三批建立 |
| 中甲大师 | Medium Armor Master | 第三批建立 |
| 中甲训练 | Moderately Armored | 第三批建立 |
| 骑乘战斗 | Mounted Combatant | 第三批建立 |
| 观察者 | Observant | 第三批建立 |
| 穿刺者 | Piercer | 第三批建立 |
| 投毒者 | Poisoner | 第三批建立 |
| 长柄武器大师 | Polearm Master | 第三批建立 |
| 坚韧 | Resilient | 第三批建立 |
| 仪式施法者 | Ritual Caster | 第三批建立 |
| 哨兵 | Sentinel | 第三批建立 |
| 暗影触碰 | Shadow-Touched | 第三批建立 |
| 神射手 | Sharpshooter | 第三批建立 |
| 盾牌大师 | Shield Master | 第三批建立 |
| 技能专家 | Skill Expert | 第三批建立 |
| 潜伏者 | Skulker | 第三批建立 |
| 挥砍者 | Slasher | 第三批建立 |
| 迅捷 | Speedy | 第三批建立 |
| 法术狙击手 | Spell Sniper | 第三批建立 |
| 心灵遥控 | Telekinetic | 第三批建立 |
| 心灵感应 | Telepathic | 第三批建立 |
| 战地施法者 | War Caster | 第三批建立 |
| 武器大师 | Weapon Master | 第三批建立 |

### 战斗风格专长（10）

| 中文名 | 英文名 | 详细资料 |
| --- | --- | --- |
| 箭术 | Archery | 第四批建立 |
| 盲斗 | Blind Fighting | 第四批建立 |
| 防御 | Defense | 第四批建立 |
| 决斗 | Dueling | 第四批建立 |
| 巨武器战斗 | Great Weapon Fighting | 第四批建立 |
| 拦截 | Interception | 第四批建立 |
| 保护 | Protection | 第四批建立 |
| 投掷武器战斗 | Thrown Weapon Fighting | 第四批建立 |
| 双武器战斗 | Two-Weapon Fighting | 第四批建立 |
| 徒手战斗 | Unarmed Fighting | 第四批建立 |

### 传奇恩惠专长（12）

| 中文名 | 英文名 | 详细资料 |
| --- | --- | --- |
| 战斗技艺恩惠 | Boon of Combat Prowess | 第五批建立 |
| 次元旅行恩惠 | Boon of Dimensional Travel | 第五批建立 |
| 能量抗性恩惠 | Boon of Energy Resistance | 第五批建立 |
| 命运恩惠 | Boon of Fate | 第五批建立 |
| 坚韧恩惠 | Boon of Fortitude | 第五批建立 |
| 无阻攻势恩惠 | Boon of Irresistible Offense | 第五批建立 |
| 恢复恩惠 | Boon of Recovery | 第五批建立 |
| 技能恩惠 | Boon of Skill | 第五批建立 |
| 速度恩惠 | Boon of Speed | 第五批建立 |
| 法术回想恩惠 | Boon of Spell Recall | 第五批建立 |
| 夜之灵恩惠 | Boon of the Night Spirit | 第五批建立 |
| 真视恩惠 | Boon of Truesight | 第五批建立 |

## 2014《玩家手册》专长清单

2014 专长属于可选规则。以下 42 项核心专长不使用 2024 的四类标签；其中同名专长仍需单独记录旧版前置条件与效果。

| 中文名 | 英文名 | 详细资料 | 状态 |
| --- | --- | --- | --- |
| 演员 | Actor | 后续批次建立 | 商业摘要 |
| 警觉 | Alert | [2014 警觉](feats/5e-2014/alert/alert.md) | 样例已完成；商业摘要 |
| 运动健将 | Athlete | 后续批次建立 | 商业摘要 |
| 冲锋者 | Charger | 后续批次建立 | 商业摘要 |
| 弩箭专家 | Crossbow Expert | 后续批次建立 | 商业摘要 |
| 防御式决斗 | Defensive Duelist | 后续批次建立 | 商业摘要 |
| 双持客 | Dual Wielder | 后续批次建立 | 商业摘要 |
| 地城探索者 | Dungeon Delver | 后续批次建立 | 商业摘要 |
| 耐久 | Durable | 后续批次建立 | 商业摘要 |
| 元素专精 | Elemental Adept | 后续批次建立 | 商业摘要 |
| 擒抱者 | Grappler | 后续批次建立 | SRD 开放内容 |
| 巨武器大师 | Great Weapon Master | 后续批次建立 | 商业摘要 |
| 医者 | Healer | 后续批次建立 | 商业摘要 |
| 重甲训练 | Heavily Armored | 后续批次建立 | 商业摘要 |
| 重甲大师 | Heavy Armor Master | 后续批次建立 | 商业摘要 |
| 激励领袖 | Inspiring Leader | 后续批次建立 | 商业摘要 |
| 敏锐心灵 | Keen Mind | 后续批次建立 | 商业摘要 |
| 轻甲训练 | Lightly Armored | 后续批次建立 | 商业摘要 |
| 语言学家 | Linguist | 后续批次建立 | 商业摘要 |
| 幸运 | Lucky | 后续批次建立 | 商业摘要 |
| 法师杀手 | Mage Slayer | 后续批次建立 | 商业摘要 |
| 魔法学徒 | Magic Initiate | 后续批次建立 | 商业摘要 |
| 武术学徒 | Martial Adept | 后续批次建立 | 商业摘要 |
| 中甲大师 | Medium Armor Master | 后续批次建立 | 商业摘要 |
| 灵活移动 | Mobile | 后续批次建立 | 商业摘要 |
| 中甲训练 | Moderately Armored | 后续批次建立 | 商业摘要 |
| 骑乘战斗 | Mounted Combatant | 后续批次建立 | 商业摘要 |
| 观察者 | Observant | 后续批次建立 | 商业摘要 |
| 长柄武器大师 | Polearm Master | 后续批次建立 | 商业摘要 |
| 坚韧 | Resilient | 后续批次建立 | 商业摘要 |
| 仪式施法者 | Ritual Caster | 后续批次建立 | 商业摘要 |
| 凶蛮攻击者 | Savage Attacker | 后续批次建立 | 商业摘要 |
| 哨兵 | Sentinel | 后续批次建立 | 商业摘要 |
| 神射手 | Sharpshooter | 后续批次建立 | 商业摘要 |
| 盾牌大师 | Shield Master | 后续批次建立 | 商业摘要 |
| 熟练 | Skilled | 后续批次建立 | 商业摘要 |
| 潜伏者 | Skulker | 后续批次建立 | 商业摘要 |
| 法术狙击手 | Spell Sniper | 后续批次建立 | 商业摘要 |
| 酒馆斗殴者 | Tavern Brawler | 后续批次建立 | 商业摘要 |
| 强韧 | Tough | 后续批次建立 | 商业摘要 |
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
