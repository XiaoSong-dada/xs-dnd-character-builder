# 龙裔（Dragonborn）— 5e-2024

[返回物种总索引](../../../dnd-species.md)

## 基础资料

| 字段 | 内容 |
| --- | --- |
| 稳定 ID | `species-2024-dragonborn` |
| 中文名 | 龙裔 |
| 英文名 | Dragonborn |
| 规则集 | `5e-2024` |
| 生物类型 | 类人生物 |
| 体型 | 中型 |
| 速度 | 30 尺 |
| 感官 | 60 尺黑暗视觉 |
| 语言 | 不由物种提供 |
| 属性提升 | 不由物种提供；由出身提供 |
| 来源 | 2024 Free Rules、SRD 5.2.1 |
| 版权边界 | 开放规则内容，整理到实现级 |

官方来源：[2024 Free Rules：Character Origins](https://www.dndbeyond.com/sources/dnd/br-2024/character-origins)

## 玩法定位与创建选择

龙裔以可成长的范围吐息和对应伤害抗性为核心，5 级后获得短时飞行。创建时必须选择一种龙族祖先；该选择同时决定吐息伤害类型、抗性和灵翼外观。

| 祖先 | 稳定选项 ID | 伤害类型 |
| --- | --- | --- |
| 黑龙 | `species-2024-dragonborn-ancestry-black` | 强酸 |
| 蓝龙 | `species-2024-dragonborn-ancestry-blue` | 闪电 |
| 黄铜龙 | `species-2024-dragonborn-ancestry-brass` | 火焰 |
| 青铜龙 | `species-2024-dragonborn-ancestry-bronze` | 闪电 |
| 赤铜龙 | `species-2024-dragonborn-ancestry-copper` | 强酸 |
| 金龙 | `species-2024-dragonborn-ancestry-gold` | 火焰 |
| 绿龙 | `species-2024-dragonborn-ancestry-green` | 毒素 |
| 红龙 | `species-2024-dragonborn-ancestry-red` | 火焰 |
| 银龙 | `species-2024-dragonborn-ancestry-silver` | 寒冷 |
| 白龙 | `species-2024-dragonborn-ancestry-white` | 寒冷 |

## 快速索引

| 等级 | 特性 | 特性 ID | 核心效果 |
| --- | --- | --- | --- |
| 1 | 龙族祖先 | `species-2024-dragonborn-draconic-ancestry` | 选择祖先并派生伤害类型 |
| 1 | 吐息武器 | `species-2024-dragonborn-breath-weapon` | 以攻击中的一次攻击喷吐锥形或线形能量 |
| 1 | 伤害抗性 | `species-2024-dragonborn-damage-resistance` | 抵抗祖先对应伤害 |
| 1 | 黑暗视觉 | `species-2024-dragonborn-darkvision` | 60 尺黑暗视觉 |
| 5 | 龙翼飞行 | `species-2024-dragonborn-draconic-flight` | 每长休一次，附赠动作获得 10 分钟飞行 |

## 特性详解

### 1级：龙族祖先

- 特性 ID：`species-2024-dragonborn-draconic-ancestry`
- 动作或触发：创建角色时选择一次。
- 资源与恢复：无。
- 效果：从祖先表选择一项，决定吐息与抗性的伤害类型。
- 实现与校验：`ancestryId` 必填且只能有一个；伤害类型为派生值，不允许单独编辑。

### 1级：吐息武器

- 特性 ID：`species-2024-dragonborn-breath-weapon`
- 动作或触发：自己回合执行攻击动作时，以吐息替换其中一次攻击；每次选择 15 尺锥形或 30 尺长、5 尺宽线形。
- 资源与恢复：可用次数等于熟练加值，长休恢复全部。
- 效果：区域内生物进行敏捷豁免，DC 为 `8 + 体质调整值 + 熟练加值`；失败承受祖先类型的伤害，成功减半。伤害为 1d10，角色 5、11、17 级分别提升为 2d10、3d10、4d10。
- 实现与校验：仅在攻击动作中替换一次攻击；形状按每次使用选择；按角色总等级成长，不能按职业等级。

### 1级：伤害抗性

- 特性 ID：`species-2024-dragonborn-damage-resistance`
- 动作或触发：承受祖先对应伤害时。
- 资源与恢复：无。
- 效果：获得对应伤害抗性。
- 实现与校验：抗性从 `ancestryId` 派生；同类抗性不叠加。

### 1级：黑暗视觉

- 特性 ID：`species-2024-dragonborn-darkvision`
- 动作或触发：常驻感官。
- 资源与恢复：无。
- 效果：获得 60 尺黑暗视觉。
- 实现与校验：引用 2024 黑暗视觉规则。

### 5级：龙翼飞行

- 特性 ID：`species-2024-dragonborn-draconic-flight`
- 动作或触发：附赠动作启动；失能、主动收翼或 10 分钟结束。
- 资源与恢复：一次，长休恢复。
- 效果：获得等于自身速度的飞行速度。
- 实现与校验：5 级前隐藏或标为未解锁；飞行速度动态引用当前速度，不固化为 30 尺。

## 兼容边界

- 祖先选择不是独立血统文件；只改变表内参数。
- 不得混用 2014 龙裔的吐息形状、次数或成长公式。
- 核验日期：2026-07-27。

