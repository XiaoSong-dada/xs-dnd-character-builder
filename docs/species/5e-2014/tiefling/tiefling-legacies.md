# 提夫林九大炼狱血统（Tiefling Legacies）— 5e-2014

[返回 2014 提夫林](tiefling.md) · [返回种族总索引](../../../dnd-species.md)

## 基础资料

| 字段 | 内容 |
| --- | --- |
| 稳定 ID | `race-2014-tiefling-legacies`（各血统见下表） |
| 中文名 | 提夫林九大炼狱血统 |
| 英文名 | Tiefling Lineages / Legacies |
| 规则集 | `5e-2014` |
| 与 PHB 提夫林关系 | 以 PHB 提夫林为基础的可选血统：每个血统额外给一项 +1 属性，并以该血统的 Legacy 特性**替换** PHB 的炼狱传承（Asmodeus 血统即 PHB 默认） |
| 来源 | Mordenkainen's Tome of Foes |
| 版权边界 | 商业规则内容，只记录元数据与原创摘要 |

官方来源：[Mordenkainen's Tome of Foes](https://www.dndbeyond.com/sources/mtof/races-tieflings)

## 玩法定位与创建选择

九大血统共享 PHB 提夫林基础（魅力 +2、黑暗视觉 60 尺、火焰抗性、通用语 + 炼狱语），差别在额外 +1 属性与法术列表。每个血统的豁免/施法均以魅力为施法属性，各限次法术长休恢复。同一角色只能选择一个血统（或使用 PHB 默认炼狱传承）。

## 血统选择表

| 血统 | 稳定 ID | +1 属性 | 戏法 | 3 级（以 2 环施放） | 5 级 |
| --- | --- | --- | --- | --- | --- |
| 阿斯摩蒂尔斯 Asmodeus | `race-2014-tiefling-legacy-asmodeus` | 智力 | 奇术 | 炼狱叱喝 | 黑暗术 |
| 巴尔泽布 Baalzebul | `race-2014-tiefling-legacy-baalzebul` | 智力 | 奇术 | 疾病射线 | 疯狂冠冕 |
| 迪斯帕特 Dispater | `race-2014-tiefling-legacy-dispater` | 敏捷 | 奇术 | 易容术 | 侦测思想 |
| 菲尔娜 Fierna | `race-2014-tiefling-legacy-fierna` | 感知 | 交友术 | 魅惑人类 | 暗示术 |
| 格拉西亚 Glasya | `race-2014-tiefling-legacy-glasya` | 敏捷 | 次级幻影 | 易容术 | 隐身术 |
| 莱维斯图斯 Levistus | `race-2014-tiefling-legacy-levistus` | 体质 | 冷冻射线 | 阿加西护甲 | 黑暗术 |
| 玛蒙 Mammon | `race-2014-tiefling-legacy-mammon` | 智力 | 法师之手 | 坦瑟浮盘 | 秘法锁（无需材料成分） |
| 墨菲斯托菲里斯 Mephistopheles | `race-2014-tiefling-legacy-mephistopheles` | 智力 | 法师之手 | 燃烧之手 | 火焰之刃（以 3 环施放） |
| 扎瑞尔 Zariel | `race-2014-tiefling-legacy-zariel` | 力量 | 奇术 | 灼热打击 | 烙印打击（以 3 环施放） |

注：Mammon 的坦瑟浮盘短休或长休恢复；Mephistopheles 的火焰之刃与 Zariel 的烙印打击明确以 3 环施放。

## 快速索引

| 等级 | 特性 | 特性 ID | 核心效果 |
| --- | --- | --- | --- |
| 1 | 血统属性提升 | `race-2014-tiefling-legacy-ability-score-increase` | 魅力 +2 + 血统 +1（与 PHB 基础合并） |
| 1 | 血统戏法 | `race-2014-tiefling-legacy-cantrip` | 按血统表，魅力施法 |
| 3 | 血统法术 | `race-2014-tiefling-legacy-spell-3` | 按血统表以 2 环施放，长休一次 |
| 5 | 血统法术 | `race-2014-tiefling-legacy-spell-5` | 按血统表施放，长休一次 |

## 特性详解

### 1级：血统戏法与血统法术

- 特性 ID：`race-2014-tiefling-legacy-cantrip`（及 `-spell-3`、`-spell-5`）
- 动作或触发：按对应法术施放。
- 资源与恢复：戏法无限次；3 级、5 级法术各长休一次。
- 效果：以魅力为施法属性施放血统表法术；血统 Legacy 替换 PHB 炼狱传承（不叠加）。
- 实现与校验：血统选择必填且互斥；法术环位与等级门槛按血统表；Asmodeus 血统与 PHB 默认效果一致，可视为同一实现。

## 兼容边界

- 血统替换而非叠加 PHB 炼狱传承；同一角色只选一个血统。
- 不获得 2024 提夫林传承或施法属性三选一。
- 核验日期：2026-08-11（dnd5e.wikidot.com 与 5e.tools 交叉核验）。
