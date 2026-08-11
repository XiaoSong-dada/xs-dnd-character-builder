# 费兹本龙裔三型（Fizban Dragonborn）— 5e-2014

[返回 2014 龙裔](dragonborn.md) · [返回种族总索引](../../../dnd-species.md)

## 基础资料

| 字段 | 内容 |
| --- | --- |
| 稳定 ID | `race-2014-dragonborn-fizban` |
| 中文名 | 费兹本龙裔（三型可选替代规则） |
| 英文名 | Fizban's Dragonborn（Chromatic / Gem / Metallic） |
| 规则集 | `5e-2014` |
| 与 PHB 龙裔关系 | 2014 规则下作为 PHB 龙裔的**可选项（替换版本）**，需 DM 许可 |
| 生物类型、体型、速度 | 类人生物、中型、30 尺 |
| 感官 | 普通感官（**无黑暗视觉**） |
| 语言 | 通用语 + 一种你与 DM 同意的语言 |
| 属性提升 | 任选一项 +2、另一项不同属性 +1，或三项不同属性各 +1（三型相同，均为自选模式） |
| 来源 | Fizban's Treasury of Dragons（2021，2014 规则兼容） |
| 版权边界 | 商业规则内容，只记录元数据与原创摘要 |

官方来源：[Fizban's Treasury of Dragons](https://www.dndbeyond.com/sources/ftod/dragonborn)

## 玩法定位与创建选择

费兹本龙裔用“祖先类型 + 龙色”选择代替 PHB 龙裔的单一龙族祖先：先选类型（色龙/宝石/金属），再选该类型下的一种龙色；类型决定吐息形状与 5 级特性，龙色决定伤害类型与抗性。**三大类型均无黑暗视觉**；吐息武器改为“攻击动作中替换一次攻击”，次数 = 熟练加值、长休恢复。

## 类型与龙色选择表

### 色龙裔（Chromatic）

| 稳定选项 ID | 龙色 | 伤害类型 | 吐息形状 | 抗性 |
| --- | --- | --- | --- | --- |
| `race-2014-dragonborn-fizban-chromatic-black` | 黑龙 | 强酸 | 30 尺线形（5 尺宽），敏捷豁免 | 强酸 |
| `race-2014-dragonborn-fizban-chromatic-blue` | 蓝龙 | 闪电 | 30 尺线形（5 尺宽），敏捷豁免 | 闪电 |
| `race-2014-dragonborn-fizban-chromatic-green` | 绿龙 | 毒素 | 30 尺线形（5 尺宽），敏捷豁免 | 毒素 |
| `race-2014-dragonborn-fizban-chromatic-red` | 红龙 | 火焰 | 30 尺线形（5 尺宽），敏捷豁免 | 火焰 |
| `race-2014-dragonborn-fizban-chromatic-white` | 白龙 | 寒冷 | 30 尺线形（5 尺宽），敏捷豁免 | 寒冷 |

- 5 级特性 **色龙庇护（Chromatic Warding）**：动作，1 分钟内免疫对应伤害类型；长休恢复。

### 宝石龙裔（Gem）

| 稳定选项 ID | 龙色 | 伤害类型 | 吐息形状 | 抗性 |
| --- | --- | --- | --- | --- |
| `race-2014-dragonborn-fizban-gem-amethyst` | 紫晶龙 | 力场 | 15 尺锥形，敏捷豁免 | 力场 |
| `race-2014-dragonborn-fizban-gem-crystal` | 水晶龙 | 光耀 | 15 尺锥形，敏捷豁免 | 光耀 |
| `race-2014-dragonborn-fizban-gem-emerald` | 翡翠龙 | 心灵 | 15 尺锥形，敏捷豁免 | 心灵 |
| `race-2014-dragonborn-fizban-gem-sapphire` | 蓝宝石龙 | 雷鸣 | 15 尺锥形，敏捷豁免 | 雷鸣 |
| `race-2014-dragonborn-fizban-gem-topaz` | 黄玉龙 | 黯蚀 | 15 尺锥形，敏捷豁免 | 黯蚀 |

- 5 级特性 **心灵之念（Psionic Mind）**：与 30 尺内可见生物心灵感应交流（对方须懂至少一种语言）+ **宝石之翼（Gem Flight）**：附赠动作显化灵翼 1 分钟，获得等于步行速度的飞行速度且可悬停；长休恢复。

### 金属龙裔（Metallic）

| 稳定选项 ID | 龙色 | 伤害类型 | 吐息形状 | 抗性 |
| --- | --- | --- | --- | --- |
| `race-2014-dragonborn-fizban-metallic-brass` | 黄铜龙 | 火焰 | 15 尺锥形，敏捷豁免 | 火焰 |
| `race-2014-dragonborn-fizban-metallic-bronze` | 青铜龙 | 闪电 | 15 尺锥形，敏捷豁免 | 闪电 |
| `race-2014-dragonborn-fizban-metallic-copper` | 赤铜龙 | 强酸 | 15 尺锥形，敏捷豁免 | 强酸 |
| `race-2014-dragonborn-fizban-metallic-gold` | 金龙 | 火焰 | 15 尺锥形，敏捷豁免 | 火焰 |
| `race-2014-dragonborn-fizban-metallic-silver` | 银龙 | 寒冷 | 15 尺锥形，敏捷豁免 | 寒冷 |

- 5 级特性 **金属吐息（Metallic Breath Weapon）**：获得第二个吐息（15 尺锥形），每次从二选一：衰竭吐息（体质豁免否则失能至你下回合开始）/ 排斥吐息（力量豁免否则被推离 20 尺并倒地）；长休恢复。

## 快速索引

| 等级 | 特性 | 特性 ID | 核心效果 |
| --- | --- | --- | --- |
| 1 | 属性提升 | `race-2014-dragonborn-fizban-ability-score-increase` | 自选模式（+2/+1 或三项 +1） |
| 1 | 龙族祖先 | `race-2014-dragonborn-fizban-draconic-ancestry` | 类型 + 龙色选择，决定伤害/抗性/吐息形状 |
| 1 | 吐息武器 | `race-2014-dragonborn-fizban-breath-weapon` | 攻击动作中替换一次攻击；1d10（5 级 2d10、11 级 3d10、17 级 4d10）；次数 = 熟练加值，长休恢复 |
| 1 | 龙之抗性 | `race-2014-dragonborn-fizban-draconic-resistance` | 抵抗祖先对应伤害类型 |
| 5 | 类型特性 | 见各类型表 | 色龙庇护 / 心灵之念 + 宝石之翼 / 金属吐息 |

## 特性详解

### 1级：吐息武器

- 特性 ID：`race-2014-dragonborn-fizban-breath-weapon`
- 动作或触发：在你的回合采取攻击动作时，用吐息替换其中一次攻击。
- 资源与恢复：使用次数 = 熟练加值，长休恢复。
- 效果：区域内生物进行豁免（DC = 8 + 体质调整值 + 熟练加值）；伤害 1d10，5/11/17 级为 2d10/3d10/4d10；失败承受全额，成功一半。形状与豁免属性由类型/龙色表决定。
- 实现与校验：与 PHB 龙裔的“动作喷吐、短休恢复”机制完全不同；次数按熟练加值计算并随长休恢复。

## 兼容边界

- 三型均为 PHB 龙裔的可选替代版本，同一角色不能同时使用 PHB 龙裔与费兹本龙裔。
- 无黑暗视觉；无 2024 灵翼规则（宝石之翼是 5 级特性）。
- 不是 MotM lineage 版（MotM 版为可小型化、吐息 1 次/长休）。
- 核验日期：2026-08-11（dnd5e.wikidot.com 与 5e.tools 交叉核验）。
