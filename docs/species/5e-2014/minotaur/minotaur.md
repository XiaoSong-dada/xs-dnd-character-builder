# 米诺陶（Minotaur）— 5e-2014

[返回种族总索引](../../../dnd-species.md)

## 基础资料

| 字段 | 内容 |
| --- | --- |
| 稳定 ID | `race-2014-minotaur` |
| 中文名 | 米诺陶 |
| 英文名 | Minotaur |
| 规则集 | `5e-2014` |
| 生物类型 | 类人生物 |
| 体型 | 中型 |
| 速度 | 30 尺 |
| 感官 | 普通感官 |
| 语言 | 通用语、米诺陶语 |
| 种族属性提升 | 力量 +2、体质 +1 |
| 来源 | Guildmaster's Guide to Ravnica |
| 版权边界 | 商业规则内容，只记录元数据与原创摘要 |

官方来源：[Guildmaster's Guide to Ravnica](https://www.dndbeyond.com/sources/ggr/player-options-minotaurs)

## 玩法定位与创建选择

角击冲锋型近战种族：冲刺后附赠动作角击，攻击命中后附赠动作推撞；角为天然武器。

## 快速索引

| 等级 | 特性 | 特性 ID | 核心效果 |
| --- | --- | --- | --- |
| 1 | 属性提升 | `race-2014-minotaur-ability-score-increase` | 力量 +2、体质 +1 |
| 1 | 角 | `race-2014-minotaur-horns` | 天然武器，无武装攻击 1d6 + 力量调整穿刺 |
| 1 | 冲角 | `race-2014-minotaur-goring-rush` | 本回合冲刺并移动至少 20 尺后，附赠动作角击一次 |
| 1 | 锤角 | `race-2014-minotaur-hammering-horns` | 攻击动作命中后附赠动作推撞（DC = 8 + 熟练 + 力量调整，至多 10 尺） |
| 1 | 慑人气势 | `race-2014-minotaur-imposing-presence` | 威吓或游说二选一熟练 |

## 特性详解

### 1级：冲角

- 特性 ID：`race-2014-minotaur-goring-rush`
- 动作或触发：附赠动作，需本回合采取冲刺动作并移动至少 20 尺。
- 资源与恢复：无次数限制（受附赠动作约束）。
- 效果：以角进行一次无武装攻击。
- 实现与校验：前提条件（冲刺 + 移动距离）必须满足。

### 1级：锤角

- 特性 ID：`race-2014-minotaur-hammering-horns`
- 动作或触发：攻击动作命中后，附赠动作。
- 资源与恢复：无次数限制（受附赠动作约束）。
- 效果：目标通过力量豁免（DC = 8 + 熟练加值 + 力量调整值），失败被推离至多 10 尺。
- 实现与校验：推撞距离目标可拒绝？按规则为目标豁免失败即被推离；体型差异按通用规则处理。

## 兼容边界

- 2014 Ravnica 版无 Powerful Build。
- 核验日期：2026-08-11（dnd5e.wikidot.com 与 5e.tools 交叉核验）。
