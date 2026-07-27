# 征服之誓 Oath of Conquest

## 基本信息

- 子职 ID：`paladin-oath-of-conquest`
- 所属职业：[`paladin` 圣武士](paladin.md)
- 规则集：`5e-2014`
- 原版选择等级：3级；用于2024基础职业须通过兼容审核
- 内容来源：Xanathar's Guide to Everything
- 内容边界：商业规则，仅记录元数据、特性名称、原创摘要与兼容提示
- 官方详情：[Xanathar's Guide to Everything](https://www.dndbeyond.com/sources/dnd/xgte)
- 最后核验：2026-07-27

## 玩法定位

以恐慌、压制与征服灵光把敌人困在身边，用反伤和终极形态瓦解被恐惧目标。

## 快速索引

| 2024兼容等级 | 原版等级 | 特性 | 资源摘要 |
|---:|---:|---|---|
| 3 | 3 | 誓言法术（Oath Spells） | 自动常备 |
| 3 | 3 | 征服引导神力（Conquering Presence and Guided Strike） | 每次消耗引导神力 |
| 7 | 7 | 征服灵光（Aura of Conquest） | 无次数限制 |
| 15 | 15 | 蔑视斥责（Scornful Rebuke） | 无次数限制 |
| 20 | 20 | 无敌征服者（Invincible Conqueror） | 长休一次 |

## 特性详解

### 3级：誓言法术 Oath Spells

- 特性 ID：`paladin-oath-of-conquest-oath-spells`
- 动作或触发：被动；随等级解锁
- 资源与恢复：自动常备

获得命令、恐惧、控制和支配主题额外法术。

实现与校验：

- 按等级解锁；不占普通准备数量；绑定5e-2014。

### 3级：征服引导神力 Conquering Presence and Guided Strike

- 特性 ID：`paladin-oath-of-conquest-conquest-channel-divinity`
- 动作或触发：动作或攻击后使用引导神力
- 资源与恢复：每次消耗引导神力

选择释放征服威仪使范围敌人恐慌，或为一次攻击检定提供显著命中修正。

实现与校验：

- 两个选项共用资源；威仪逐目标豁免；命中修正在结果结算前使用。

### 7级：征服灵光 Aura of Conquest

- 特性 ID：`paladin-oath-of-conquest-aura-of-conquest`
- 动作或触发：被动；恐慌敌人在灵光内
- 资源与恢复：无次数限制

令受自己恐慌的敌人速度降为0，并在其回合开始承受心灵伤害。

实现与校验：

- 必须同时满足恐慌来源与灵光范围；伤害按圣武士等级派生；范围升级。

### 15级：蔑视斥责 Scornful Rebuke

- 特性 ID：`paladin-oath-of-conquest-scornful-rebuke`
- 动作或触发：生物以攻击命中自己时
- 资源与恢复：无次数限制

攻击者承受等于魅力调整值的心灵伤害。

实现与校验：

- 必须是攻击命中；每次命中分别触发；魅力负值按规则下限处理。

### 20级：无敌征服者 Invincible Conqueror

- 特性 ID：`paladin-oath-of-conquest-invincible-conqueror`
- 动作或触发：动作；变身
- 资源与恢复：长休一次

获得伤害抗性、额外攻击和扩大的重击范围，持续一段时间。

实现与校验：

- 记录持续；额外攻击只应用于攻击动作；重击阈值和抗性按来源结算。

## 兼容与校验

- 战役必须允许该来源，圣武士达到3级，且子职选择位尚未占用；破誓者还必须获得DM明确许可。
- 规则数据保留 `5e-2014`；誓言法术、引导神力、灵光、法术位和变身次数分开记录。
- 2014子职用于2024职业时不得隐式采用同名新版数值；新旧替代能力不得叠加。
- 规则数据与自动化测试尚未实现。
