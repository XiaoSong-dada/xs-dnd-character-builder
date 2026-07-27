# 提夫林（Tiefling）— 5e-2024

[返回物种总索引](../../../dnd-species.md)

## 基础资料

| 字段 | 内容 |
| --- | --- |
| 稳定 ID | `species-2024-tiefling` |
| 中文名 | 提夫林 |
| 英文名 | Tiefling |
| 规则集 | `5e-2024` |
| 生物类型 | 类人生物 |
| 体型 | 小型或中型，创建时选择 |
| 速度 | 30 尺 |
| 感官 | 60 尺黑暗视觉 |
| 语言 | 不由物种提供 |
| 属性提升 | 不由物种提供；由出身提供 |
| 来源 | 2024 Free Rules、SRD 5.2.1 |
| 版权边界 | 开放规则内容，整理到实现级 |

官方来源：[2024 Free Rules：Character Origins](https://www.dndbeyond.com/sources/dnd/br-2024/character-origins)

## 玩法定位与创建选择

提夫林通过邪魔传承获得一项伤害抗性、戏法和 3/5 级法术。创建时必须选择体型、深渊/冥界/炼狱传承之一，以及智力、感知、魅力中的施法属性。

## 快速索引

| 等级 | 特性 | 特性 ID | 核心效果 |
| --- | --- | --- | --- |
| 1 | 黑暗视觉 | `species-2024-tiefling-darkvision` | 60 尺黑暗视觉 |
| 1 | 邪魔传承 | `species-2024-tiefling-fiendish-legacy` | 选择传承与施法属性，获得分级能力 |
| 1 | 异界风姿 | `species-2024-tiefling-otherworldly-presence` | 学会奇术并使用传承施法属性 |

## 特性详解

### 1级：黑暗视觉

- 特性 ID：`species-2024-tiefling-darkvision`
- 动作或触发：常驻。
- 资源与恢复：无。
- 效果：获得 60 尺黑暗视觉。
- 实现与校验：范围不与同类来源相加。

### 1级：邪魔传承

- 特性 ID：`species-2024-tiefling-fiendish-legacy`
- 动作或触发：创建时选择；3、5 级解锁对应法术。
- 资源与恢复：3、5 级法术各可每长休无位施放一次，也可使用合适法术位。
- 效果：选择一种传承及施法属性；传承法术始终视为已准备。
- 实现与校验：`legacyId` 和 `spellcastingAbility` 必填；无位次数按具体法术独立追踪；三个传承互斥。

### 1级：异界风姿

- 特性 ID：`species-2024-tiefling-otherworldly-presence`
- 动作或触发：按奇术施法时间。
- 资源与恢复：戏法，无次数消耗。
- 效果：学会奇术，使用邪魔传承选定的施法属性。
- 实现与校验：即使分支戏法不同，奇术也作为父物种共同法术保留。

## 传承索引

- [深渊传承](tiefling-abyssal-legacy.md)：毒素抗性与毒素主题法术。
- [冥界传承](tiefling-chthonic-legacy.md)：黯蚀抗性与衰弱、生存主题法术。
- [炼狱传承](tiefling-infernal-legacy.md)：火焰抗性与攻击、反击主题法术。

## 兼容边界

- 不继承 2014 提夫林的魅力/智力属性加值或固定炼狱法术包。
- 三种传承不得同时生效。
- 核验日期：2026-07-27。

