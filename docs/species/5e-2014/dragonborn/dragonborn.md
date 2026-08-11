# 龙裔（Dragonborn）— 5e-2014

[返回种族总索引](../../../dnd-species.md)

## 基础资料

| 字段 | 内容 |
| --- | --- |
| 稳定 ID | `race-2014-dragonborn` |
| 规则集 | `5e-2014` |
| 生物类型 | 类人生物 |
| 体型 | 中型 |
| 速度 | 30 尺 |
| 感官 | 普通感官 |
| 语言 | 通用语、龙语 |
| 种族属性提升 | 力量 +2、魅力 +1 |
| 来源 | 2014 Basic Rules、SRD 5.1 |
| 版权边界 | 开放规则内容，整理到实现级 |

官方来源：[2014 Basic Rules：Races](https://www.dndbeyond.com/sources/dnd/basic-rules-2014/races)

## 玩法定位与创建选择

龙裔以短休恢复的范围吐息和对应抗性为核心。创建时必须选择一种龙族祖先；选择同时决定伤害类型、吐息形状和豁免属性。

| 祖先 | 稳定选项 ID | 伤害 | 吐息 |
| --- | --- | --- | --- |
| 黑龙 | `race-2014-dragonborn-ancestry-black` | 强酸 | 5×30尺线形，敏捷豁免 |
| 蓝龙 | `race-2014-dragonborn-ancestry-blue` | 闪电 | 5×30尺线形，敏捷豁免 |
| 黄铜龙 | `race-2014-dragonborn-ancestry-brass` | 火焰 | 5×30尺线形，敏捷豁免 |
| 青铜龙 | `race-2014-dragonborn-ancestry-bronze` | 闪电 | 5×30尺线形，敏捷豁免 |
| 赤铜龙 | `race-2014-dragonborn-ancestry-copper` | 强酸 | 5×30尺线形，敏捷豁免 |
| 金龙 | `race-2014-dragonborn-ancestry-gold` | 火焰 | 15尺锥形，敏捷豁免 |
| 绿龙 | `race-2014-dragonborn-ancestry-green` | 毒素 | 15尺锥形，体质豁免 |
| 红龙 | `race-2014-dragonborn-ancestry-red` | 火焰 | 15尺锥形，敏捷豁免 |
| 银龙 | `race-2014-dragonborn-ancestry-silver` | 寒冷 | 15尺锥形，体质豁免 |
| 白龙 | `race-2014-dragonborn-ancestry-white` | 寒冷 | 15尺锥形，体质豁免 |

## 快速索引

| 等级 | 特性 | 特性 ID | 核心效果 |
| --- | --- | --- | --- |
| 1 | 属性提升 | `race-2014-dragonborn-ability-score-increase` | 力量 +2、魅力 +1 |
| 1 | 龙族祖先 | `race-2014-dragonborn-draconic-ancestry` | 选择伤害、范围与豁免参数 |
| 1 | 吐息武器 | `race-2014-dragonborn-breath-weapon` | 动作喷吐，2d6起并随等级成长 |
| 1 | 伤害抗性 | `race-2014-dragonborn-damage-resistance` | 抵抗祖先对应伤害 |

## 特性详解

### 1级：属性提升

- 特性 ID：`race-2014-dragonborn-ability-score-increase`
- 动作或触发：创建角色。
- 资源与恢复：无。
- 效果：力量 +2、魅力 +1。
- 实现与校验：两项分别记录种族来源。

### 1级：龙族祖先

- 特性 ID：`race-2014-dragonborn-draconic-ancestry`
- 动作或触发：创建时选择。
- 资源与恢复：无。
- 效果：决定吐息伤害类型、固定形状与豁免属性，并决定抗性。
- 实现与校验：`ancestryId` 必填且互斥；所有参数从表派生。

### 1级：吐息武器

- 特性 ID：`race-2014-dragonborn-breath-weapon`
- 动作或触发：使用动作。
- 资源与恢复：一次，短休或长休恢复。
- 效果：区域内生物进行祖先表指定豁免，DC 为 `8 + 体质调整值 + 熟练加值`；失败承受全额，成功一半。伤害为 2d6，角色 6、11、16 级变为 3d6、4d6、5d6。
- 实现与校验：形状不能按次切换；按角色总等级成长，不能采用 2024 的攻击替换或次数公式。

### 1级：伤害抗性

- 特性 ID：`race-2014-dragonborn-damage-resistance`
- 动作或触发：承受祖先对应伤害。
- 资源与恢复：无。
- 效果：获得对应伤害抗性。
- 实现与校验：从祖先选择派生，同类抗性不叠加。

## 兼容边界

- 不获得 2024 黑暗视觉、灵翼或可变吐息形状。
- PHB 龙裔之外，2014 规则下还有费兹本龙裔三型（色龙/宝石/金属，自选属性、攻击替换式吐息），见 [费兹本龙裔三型](dragonborn-fizban.md)；同一角色不能同时使用两套龙裔规则。
- 核验日期：2026-07-27；2026-08-11 补充费兹本三型条目。

