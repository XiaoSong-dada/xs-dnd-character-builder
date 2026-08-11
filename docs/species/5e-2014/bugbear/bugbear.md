# 熊地精（Bugbear）— 5e-2014

[返回种族总索引](../../../dnd-species.md)

## 基础资料

| 字段 | 内容 |
| --- | --- |
| 稳定 ID | `race-2014-bugbear` |
| 中文名 | 熊地精 |
| 英文名 | Bugbear |
| 规则集 | `5e-2014` |
| 生物类型 | 类人生物（地精类人） |
| 体型 | 中型 |
| 速度 | 30 尺 |
| 感官 | 60 尺黑暗视觉 |
| 语言 | 通用语、地精语 |
| 种族属性提升 | 力量 +2、敏捷 +1 |
| 来源 | Volo's Guide to Monsters |
| 版权边界 | 商业规则内容，只记录元数据与原创摘要 |

官方来源：[Volo's Guide to Monsters](https://www.dndbeyond.com/sources/vgtm/race-of-the-week-bugbears)

## 玩法定位与创建选择

先手突袭型近战种族：长臂使回合内近战触及 +5 尺，突袭首回合命中附加 2d6（每场战斗一次）。配合隐匿熟练适合潜行开局。与哥布林、大地精同属地精类人。

## 快速索引

| 等级 | 特性 | 特性 ID | 核心效果 |
| --- | --- | --- | --- |
| 1 | 属性提升 | `race-2014-bugbear-ability-score-increase` | 力量 +2、敏捷 +1 |
| 1 | 黑暗视觉 | `race-2014-bugbear-darkvision` | 60 尺黑暗视觉 |
| 1 | 长臂 | `race-2014-bugbear-long-limbed` | 回合内近战攻击触及 +5 尺 |
| 1 | 强力体格 | `race-2014-bugbear-powerful-build` | 载重/推拉举按大体型计算 |
| 1 | 隐秘 | `race-2014-bugbear-sneaky` | 隐匿技能熟练 |
| 1 | 突袭 | `race-2014-bugbear-surprise-attack` | 突袭命中额外 2d6；每场战斗一次 |

## 特性详解

### 1级：长臂

- 特性 ID：`race-2014-bugbear-long-limbed`
- 动作或触发：进行近战攻击时。
- 资源与恢复：无。
- 效果：你的回合内，近战攻击的触及范围增加 5 尺。
- 实现与校验：仅限自己回合内的攻击；借机攻击等回合外攻击不适用。

### 1级：突袭

- 特性 ID：`race-2014-bugbear-surprise-attack`
- 动作或触发：战斗首回合对被你突袭的生物造成伤害时。
- 资源与恢复：每场战斗一次。
- 效果：该次伤害额外增加 2d6。
- 实现与校验：需满足突袭条件（目标处于惊骇状态）；每场遭遇重置一次。

## 兼容边界

- 不获得 MPMM 重制版的 Fey Ancestry 与“目标未行动即附加 2d6”规则。
- 与 2024 熊地精不共享任何特性或数值。
- 核验日期：2026-08-11（dnd5e.wikidot.com 与 5e.tools 交叉核验）。
