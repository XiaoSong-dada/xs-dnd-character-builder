# 歌利亚（Goliath）— 5e-2014

[返回种族总索引](../../../dnd-species.md)

## 基础资料

| 字段 | 内容 |
| --- | --- |
| 稳定 ID | `race-2014-goliath` |
| 中文名 | 歌利亚 |
| 英文名 | Goliath |
| 规则集 | `5e-2014` |
| 生物类型 | 类人生物（巨人血统） |
| 体型 | 中型 |
| 速度 | 30 尺 |
| 感官 | 普通感官 |
| 语言 | 通用语、巨人语 |
| 种族属性提升 | 力量 +2、体质 +1 |
| 来源 | Elemental Evil Player's Companion（VGM 重印，数值相同） |
| 版权边界 | 商业规则内容，只记录元数据与原创摘要 |

官方来源：[Elemental Evil Player's Companion](https://media.wizards.com/2015/downloads/dnd/EE_PlayersCompanion.pdf) · [Volo's Guide to Monsters](https://www.dndbeyond.com/sources/vgtm/race-of-the-week-goliaths)

## 玩法定位与创建选择

山地巨人血统的坚韧种族：石之耐力提供 1 级即可用的减伤反应，另有寒冷抗性、大体型载重与运动熟练，适合前线职业。

## 快速索引

| 等级 | 特性 | 特性 ID | 核心效果 |
| --- | --- | --- | --- |
| 1 | 属性提升 | `race-2014-goliath-ability-score-increase` | 力量 +2、体质 +1 |
| 1 | 天生运动员 | `race-2014-goliath-natural-athlete` | 运动技能熟练 |
| 1 | 石之耐力 | `race-2014-goliath-stones-endurance` | 反应：掷 d12 + 体质调整，减少等量伤害；短休/长休恢复 |
| 1 | 强力体格 | `race-2014-goliath-powerful-build` | 载重/推拉举按大体型计算 |
| 1 | 山地之子 | `race-2014-goliath-mountain-born` | 寒冷伤害抗性；自然适应高海拔 |

## 特性详解

### 1级：石之耐力

- 特性 ID：`race-2014-goliath-stones-endurance`
- 动作或触发：受到伤害时用反应触发。
- 资源与恢复：短休或长休后恢复一次。
- 效果：掷 d12 + 体质调整值，减少等量伤害。
- 实现与校验：在伤害结算前决定是否使用；减值不低于 0。

### 1级：山地之子

- 特性 ID：`race-2014-goliath-mountain-born`
- 动作或触发：被动。
- 资源与恢复：无。
- 效果：寒冷伤害抗性；对高海拔（含 20,000 英尺以上）的自然适应。
- 实现与校验：抗性按伤害类型注册；高海拔适应为叙事能力。

## 兼容边界

- 不获得 MPMM 重制版的“小巨人”合并规则。
- 核验日期：2026-08-11（dnd5e.wikidot.com 与 5e.tools 交叉核验）。
