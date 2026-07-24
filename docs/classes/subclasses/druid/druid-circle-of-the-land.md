# 大地结社 Circle of the Land

## 基本信息

- 子职 ID：`druid-circle-of-the-land`
- 所属职业：[`druid` 德鲁伊](druid.md)
- 规则集：`5e-2024`
- 选择等级：3级
- 内容来源：2024 Free Rules、SRD 5.2.1
- 许可边界：开放规则，可整理到项目实现所需粒度
- 核验状态：特性、等级、资源和地貌法术已核验
- 官方详情：[2024 Free Rules — Druid](https://www.dndbeyond.com/sources/dnd/br-2024/character-classes)

## 子职定位

大地结社每日选择干旱、极地、温带或热带环境，获得对应始终准备法术和元素抗性。它还可消耗荒野变形同时伤害敌人、治疗盟友，恢复法术资源，并创造可移动的自然庇护区域。

## 子职特性

| 等级 | 特性 ID | 中文名 | 英文名 | 玩法摘要 |
|---:|---|---|---|---|
| 3 | `druid-land-circle-spells` | 大地结社法术 | Circle of the Land Spells | 每次长休选择一种地貌，获得该地貌与当前等级对应的始终准备法术 |
| 3 | `druid-land-lands-aid` | 大地援助 | Land’s Aid | 消耗荒野变形，在范围内选择伤害目标并治疗一个目标，骰数随等级提升 |
| 6 | `druid-land-natural-recovery` | 自然恢复 | Natural Recovery | 免费施展一次结社法术，并在短休后恢复受总环阶和最高环阶限制的法术位 |
| 10 | `druid-land-natures-ward` | 自然防护 | Nature’s Ward | 免疫中毒状态，并按当前地貌获得火焰、寒冷、闪电或毒素抗性 |
| 14 | `druid-land-natures-sanctuary` | 自然庇护 | Nature’s Sanctuary | 消耗荒野变形创造可移动区域，为盟友提供半身掩护和当前地貌抗性 |

## 地貌法术与抗性

| 地貌 | 3级始终准备 | 5级 | 7级 | 9级 | 10级抗性 |
|---|---|---|---|---|---|
| 干旱 | Blur、Burning Hands、Fire Bolt | Fireball | Blight | Wall of Stone | 火焰 |
| 极地 | Fog Cloud、Hold Person、Ray of Frost | Sleet Storm | Ice Storm | Cone of Cold | 寒冷 |
| 温带 | Misty Step、Shocking Grasp、Sleep | Lightning Bolt | Freedom of Movement | Tree Stride | 闪电 |
| 热带 | Acid Splash、Ray of Sickness、Web | Stinking Cloud | Polymorph | Insect Plague | 毒素 |

## 选择、资源与校验

- 地貌在每次长休后选择并整体替换；结社法术始终准备，不占普通准备法术数量。
- 大地援助消耗共享荒野变形次数，伤害目标可多选，但治疗目标只能选择一个。
- 自然恢复的免费施法只适用于已准备的1环以上结社法术；短休恢复法术位另有每长休一次限制。
- 自然防护的抗性必须随当前地貌动态切换，中毒免疫不随地貌改变。
- 自然庇护消耗荒野变形，必须跟踪区域位置、持续时间、半身掩护和当前抗性。

## 实现状态

- 规则数据路径：尚未实现。
- 校验重点：长休地貌切换、始终准备法术、共享资源、法术位恢复与移动区域。
- 自动化测试：尚未实现。
- 最后核验日期：2026-07-24。
