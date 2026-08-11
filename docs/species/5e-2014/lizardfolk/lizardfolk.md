# 蜥蜴人（Lizardfolk）— 5e-2014

[返回种族总索引](../../../dnd-species.md)

## 基础资料

| 字段 | 内容 |
| --- | --- |
| 稳定 ID | `race-2014-lizardfolk` |
| 中文名 | 蜥蜴人 |
| 英文名 | Lizardfolk |
| 规则集 | `5e-2014` |
| 生物类型 | 类人生物 |
| 体型 | 中型 |
| 速度 | 步行 30 尺、游泳 30 尺 |
| 感官 | 普通感官 |
| 语言 | 通用语、龙语 |
| 种族属性提升 | 体质 +2、感知 +1 |
| 来源 | Volo's Guide to Monsters |
| 版权边界 | 商业规则内容，只记录元数据与原创摘要 |

官方来源：[Volo's Guide to Monsters](https://www.dndbeyond.com/sources/vgtm/race-of-the-week-lizardfolk)

## 玩法定位与创建选择

生存与近战向种族：1 级即有 13 + 敏捷调整的天生护甲、1d6 撕咬、游泳速度与双技能熟练，适合前线与荒野生存定位。

## 快速索引

| 等级 | 特性 | 特性 ID | 核心效果 |
| --- | --- | --- | --- |
| 1 | 属性提升 | `race-2014-lizardfolk-ability-score-increase` | 体质 +2、感知 +1 |
| 1 | 撕咬 | `race-2014-lizardfolk-bite` | 天然武器，徒手打击 1d6 + 力量调整穿刺 |
| 1 | 巧手工匠 | `race-2014-lizardfolk-cunning-artisan` | 短休期间用兽骨皮制作盾/木棒/标枪/飞镖等 |
| 1 | 屏息 | `race-2014-lizardfolk-hold-breath` | 一次屏息最长 15 分钟 |
| 1 | 猎人学识 | `race-2014-lizardfolk-hunters-lore` | 自选两技能熟练（驯兽、自然、察觉、隐匿、生存） |
| 1 | 天生护甲 | `race-2014-lizardfolk-natural-armor` | 未穿甲时 AC = 13 + 敏捷调整 |
| 1 | 饥饿之颚 | `race-2014-lizardfolk-hungry-jaws` | 附赠动作特殊撕咬，命中获得临时 HP = 体质调整（至少 1）；短休/长休恢复 |

## 特性详解

### 1级：天生护甲

- 特性 ID：`race-2014-lizardfolk-natural-armor`
- 动作或触发：被动。
- 资源与恢复：无。
- 效果：未穿护甲时 AC = 13 + 敏捷调整值；盾牌加值照常。
- 实现与校验：与护甲 AC 取高；敏捷调整正常计入。

### 1级：饥饿之颚

- 特性 ID：`race-2014-lizardfolk-hungry-jaws`
- 动作或触发：附赠动作进行特殊撕咬攻击。
- 资源与恢复：短休或长休后恢复一次。
- 效果：命中时获得等于体质调整值（至少 1）的临时 HP。
- 实现与校验：伤害按撕咬计算；临时 HP 在命中后获得。

## 兼容边界

- 不获得 MPMM 重制版的熟练加值次数规则。
- 核验日期：2026-08-11（dnd5e.wikidot.com 与 5e.tools 交叉核验）。
