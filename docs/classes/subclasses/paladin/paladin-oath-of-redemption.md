# 救赎之誓 Oath of Redemption

## 基本信息

- 子职 ID：`paladin-oath-of-redemption`
- 所属职业：[`paladin` 圣武士](paladin.md)
- 规则集：`5e-2014`
- 原版选择等级：3级；用于2024基础职业须通过兼容审核
- 内容来源：Xanathar's Guide to Everything
- 内容边界：商业规则，仅记录元数据、特性名称、原创摘要与兼容提示
- 官方详情：[Xanathar's Guide to Everything](https://www.dndbeyond.com/sources/dnd/xgte)
- 最后核验：2026-07-27

## 玩法定位

优先以言语和保护化解冲突，通过代受伤害、持续自愈与终极反伤保护不主动伤害的敌人。

## 快速索引

| 2024兼容等级 | 原版等级 | 特性 | 资源摘要 |
|---:|---:|---|---|
| 3 | 3 | 誓言法术（Oath Spells） | 自动常备 |
| 3 | 3 | 救赎引导神力（Emissary of Peace and Rebuke the Violent） | 消耗引导神力 |
| 7 | 7 | 守护者灵光（Aura of the Guardian） | 受反应限制 |
| 15 | 15 | 庇护灵魂（Protective Spirit） | 每回合自动触发 |
| 20 | 20 | 救赎使者（Emissary of Redemption） | 无次数限制 |

## 特性详解

### 3级：誓言法术 Oath Spells

- 特性 ID：`paladin-oath-of-redemption-oath-spells`
- 动作或触发：被动；随等级解锁
- 资源与恢复：自动常备

获得和平、控制、防护和反制暴力主题额外法术。

实现与校验：

- 按等级解锁；不占普通准备数量。

### 3级：救赎引导神力 Emissary of Peace and Rebuke the Violent

- 特性 ID：`paladin-oath-of-redemption-redemption-channel-divinity`
- 动作或触发：进行说服检定前或敌人伤害盟友后用反应
- 资源与恢复：消耗引导神力

选择显著强化一次说服，或迫使暴力敌人因刚造成的伤害承受光耀反噬。

实现与校验：

- 两个选项共用资源；反噬需目标豁免并读取刚结算伤害。

### 7级：守护者灵光 Aura of the Guardian

- 特性 ID：`paladin-oath-of-redemption-aura-of-the-guardian`
- 动作或触发：反应；灵光内盟友受伤
- 资源与恢复：受反应限制

代替盟友承受该次伤害；转移伤害不能再次被减免。

实现与校验：

- 实时校验范围；转移完整伤害；不应用圣武士的抗性或减伤。

### 15级：庇护灵魂 Protective Spirit

- 特性 ID：`paladin-oath-of-redemption-protective-spirit`
- 动作或触发：回合结束且生命低于一半
- 资源与恢复：每回合自动触发

若仍有至少1点生命，则恢复与圣武士等级相关的生命值。

实现与校验：

- 校验生命区间；恢复不超过最大生命的一半阈值或最大值，按原规则处理。

### 20级：救赎使者 Emissary of Redemption

- 特性 ID：`paladin-oath-of-redemption-emissary-of-redemption`
- 动作或触发：被动；面对尚未主动伤害的生物
- 资源与恢复：无次数限制

获得对其伤害的抗性，并把部分伤害反射回去；一旦主动伤害该生物，保护暂时结束。

实现与校验：

- 逐目标记录是否主动伤害；反射和抗性按顺序结算；法术间接伤害也需判断。

## 兼容与校验

- 战役必须允许该来源，圣武士达到3级，且子职选择位尚未占用；破誓者还必须获得DM明确许可。
- 规则数据保留 `5e-2014`；誓言法术、引导神力、灵光、法术位和变身次数分开记录。
- 2014子职用于2024职业时不得隐式采用同名新版数值；新旧替代能力不得叠加。
- 规则数据与自动化测试尚未实现。
