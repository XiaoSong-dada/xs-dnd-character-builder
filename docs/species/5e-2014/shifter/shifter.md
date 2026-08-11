# 兽化人（Shifter）— 5e-2014

[返回种族总索引](../../../dnd-species.md)

## 基础资料

| 字段 | 内容 |
| --- | --- |
| 稳定 ID | `race-2014-shifter` |
| 中文名 | 兽化人 |
| 英文名 | Shifter |
| 规则集 | `5e-2014` |
| 生物类型 | 类人生物 |
| 体型 | 中型 |
| 速度 | 30 尺 |
| 感官 | 60 尺黑暗视觉 |
| 语言 | 通用语（+ 亚种无额外语言） |
| 种族属性提升 | 由子种族决定，必须选择子种族 |
| 来源 | Eberron: Rising from the Last War |
| 版权边界 | 商业规则内容，只记录元数据与原创摘要 |

官方来源：[Eberron: Rising from the Last War](https://www.dndbeyond.com/sources/erftlw/races-shifters)

## 玩法定位与创建选择

兽化人是带野兽血统的类人种族，核心是“兽化”附赠动作：1 分钟内获得临时生命并激活亚种加成，短休/长休恢复。四个子种族决定属性提升与战斗侧重，创建时必须选择其一（参考侏儒的必选子种族结构）。

## 快速索引

| 等级 | 特性 | 特性 ID | 核心效果 |
| --- | --- | --- | --- |
| 1 | 属性提升 | `race-2014-shifter-ability-score-increase` | 由子种族决定（见分支文件） |
| 1 | 黑暗视觉 | `race-2014-shifter-darkvision` | 60 尺黑暗视觉 |
| 1 | 敏锐感官 | `race-2014-shifter-keen-senses` | 察觉技能熟练 |
| 1 | 兽化 | `race-2014-shifter-shifting` | 附赠动作：1 分钟临时 HP = 等级 + 体质调整（至少 1）；短休/长休恢复 |

## 特性详解

### 1级：兽化

- 特性 ID：`race-2014-shifter-shifting`
- 动作或触发：附赠动作。
- 资源与恢复：短休或长休后恢复一次；持续 1 分钟。
- 效果：获得临时 HP = 等级 + 体质调整值（至少 1）；兽化期间子种族特性生效。
- 实现与校验：临时 HP 与子种族附加效果（额外临时 HP、AC、速度、感知等）需分别计算；不能延长或叠加使用次数。

## 子种族

| 子种族 | 详细资料 | 属性提升 | 特性方向 |
| --- | --- | --- | --- |
| 熊皮 Beasthide | [熊皮兽化人](shifter-beasthide.md) | 体质 +2、力量 +1 | 运动熟练；兽化额外 +1d6 临时 HP、AC +1 |
| 长牙 Longtooth | [长牙兽化人](shifter-longtooth.md) | 力量 +2、敏捷 +1 | 威吓熟练；兽化可用附赠动作獠牙攻击 1d6 |
| 疾行 Swiftstride | [疾行兽化人](shifter-swiftstride.md) | 敏捷 +2、魅力 +1 | 特技熟练；兽化速度 +10 尺、反应位移 |
| 野猎 Wildhunt | [野猎兽化人](shifter-wildhunt.md) | 感知 +2 | 求生熟练；标记气味；兽化感知检定优势 |

## 兼容边界

- 未定稿的 UA 攀爬（Cliffwalk）与爪击（Razorclaw）亚种不进入资料。
- 与 2024 兽化人不共享任何特性或数值。
- 核验日期：2026-08-11（dnd5e.wikidot.com 与 5e.tools 交叉核验）。
