# 丘陵矮人（Hill Dwarf）— 5e-2014

[返回 2014 矮人](dwarf.md) · [返回种族总索引](../../../dnd-species.md)

## 基础资料

| 字段 | 内容 |
| --- | --- |
| 稳定 ID | `race-2014-dwarf-hill` |
| 规则集 | `5e-2014` |
| 父种族 | `race-2014-dwarf` |
| 生物类型、体型、速度、感官 | 继承矮人：类人生物、中型、25 尺、60 尺黑暗视觉 |
| 子种族属性提升 | 感知 +1 |
| 来源 | 2014 Basic Rules、SRD 5.1 |
| 版权边界 | 开放规则内容，整理到实现级 |

官方来源：[2014 Basic Rules：Races](https://www.dndbeyond.com/sources/dnd/basic-rules-2014/races)

## 快速索引

| 等级 | 特性 | 特性 ID | 核心效果 |
| --- | --- | --- | --- |
| 1 | 子种族属性提升 | `race-2014-dwarf-hill-ability-score-increase` | 感知 +1 |
| 1 | 矮人强健 | `race-2014-dwarf-hill-dwarven-toughness` | 生命值上限额外增加等于角色等级的数值 |

## 特性详解

### 1级：子种族属性提升

- 特性 ID：`race-2014-dwarf-hill-ability-score-increase`
- 动作或触发：创建角色。
- 资源与恢复：无。
- 效果：感知 +1。
- 实现与校验：与父种族体质 +2 分开记录。

### 1级：矮人强健

- 特性 ID：`race-2014-dwarf-hill-dwarven-toughness`
- 动作或触发：创建及每次升级。
- 资源与恢复：无。
- 效果：生命值上限增加 1，并在每次获得等级时再增加 1。
- 实现与校验：最终额外值等于角色等级，作为可重算来源而非逐次硬写。

## 兼容边界

- 与山地矮人互斥；不引用 2024 同名特性 ID。
- 核验日期：2026-07-27。
