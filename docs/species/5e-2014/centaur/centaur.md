# 半人马（Centaur）— 5e-2014

[返回种族总索引](../../../dnd-species.md)

## 基础资料

| 字段 | 内容 |
| --- | --- |
| 稳定 ID | `race-2014-centaur` |
| 中文名 | 半人马 |
| 英文名 | Centaur |
| 规则集 | `5e-2014` |
| 生物类型 | 精类（Fey） |
| 体型 | 中型 |
| 速度 | 40 尺 |
| 感官 | 普通感官 |
| 语言 | 通用语、森林语 |
| 种族属性提升 | 力量 +2、感知 +1 |
| 来源 | Guildmaster's Guide to Ravnica |
| 版权边界 | 商业规则内容，只记录元数据与原创摘要 |

官方来源：[Guildmaster's Guide to Ravnica](https://www.dndbeyond.com/sources/ggr/player-options-centaurs)

## 玩法定位与创建选择

40 尺高速冲锋型种族，生物类型为精类（非类人生物，注意相关法术/效果差异）。直线冲锋后附赠动作蹄击。

## 快速索引

| 等级 | 特性 | 特性 ID | 核心效果 |
| --- | --- | --- | --- |
| 1 | 属性提升 | `race-2014-centaur-ability-score-increase` | 力量 +2、感知 +1 |
| 1 | 冲锋 | `race-2014-centaur-charge` | 直线移动至少 30 尺后近战命中，附赠动作蹄击 |
| 1 | 蹄 | `race-2014-centaur-hooves` | 天然武器，1d4 + 力量调整钝击 |
| 1 | 马形体格 | `race-2014-centaur-equine-build` | 载重/推拉举按大体型；手脚并用攀爬每尺多耗 4 尺移动 |
| 1 | 幸存者 | `race-2014-centaur-survivor` | 驯兽、医药、自然、求生四选一熟练 |

## 特性详解

### 1级：冲锋

- 特性 ID：`race-2014-centaur-charge`
- 动作或触发：附赠动作，需本回合直线移动至少 30 尺并以近战攻击命中。
- 资源与恢复：无次数限制（受附赠动作约束）。
- 效果：以蹄进行一次天然武器攻击。
- 实现与校验：前提条件（直线移动距离 + 命中）必须满足。

## 兼容边界

- 生物类型为精类，与类人生物相关的法术/效果不适用。
- 核验日期：2026-08-11（dnd5e.wikidot.com 与 5e.tools 交叉核验）。
