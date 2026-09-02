# 守望之誓 Oath of the Watchers

## 基本信息

- 子职 ID：`paladin-oath-of-the-watchers`
- 所属职业：[`paladin` 圣武士](paladin.md)
- 规则集：`5e-2014`
- 原版选择等级：3级；用于2024基础职业须通过兼容审核
- 内容来源：Tasha's Cauldron of Everything
- 内容边界：商业规则，仅记录元数据、特性名称、原创摘要与兼容提示
- 官方详情：[Tasha's Cauldron of Everything](https://www.dndbeyond.com/sources/dnd/tcoe)
- 最后核验：2026-07-27

## 玩法定位

专门抵御异界生物与心灵侵害，以守望灵光提高全队先攻，并用斥责和终极形态惩罚跨位面威胁。

## 快速索引

| 2024兼容等级 | 原版等级 | 特性 | 资源摘要 |
|---:|---:|---|---|
| 3 | 3 | 誓言法术（Oath Spells） | 自动常备 |
| 3 | 3 | 守望引导神力（Watcher's Will and Abjure the Extraplanar） | 消耗引导神力 |
| 7 | 7 | 哨卫灵光（Aura of the Sentinel） | 无次数限制 |
| 15 | 15 | 警戒呵斥（Vigilant Rebuke） | 受反应限制 |
| 20 | 20 | 尘世壁垒（Mortal Bulwark） | 长休一次 |

## 特性详解

### 3级：誓言法术 Oath Spells

- 特性 ID：`paladin-oath-of-the-watchers-oath-spells`
- 动作或触发：被动；随等级解锁
- 资源与恢复：自动常备

获得侦测、驱逐、反制和位面防护主题额外法术。

实现与校验：

- 按等级解锁；不占普通准备数量。

### 3级：守望引导神力 Watcher's Will and Abjure the Extraplanar

- 特性 ID：`paladin-oath-of-the-watchers-watchers-channel-divinity`
- 动作或触发：动作；使用引导神力
- 资源与恢复：消耗引导神力

选择让多名盟友强化心智豁免，或驱逐附近异怪、天界、元素、妖精与邪魔。

实现与校验：

- 两个选项共用资源；正确过滤生物类型；驱逐逐目标豁免。

### 7级：哨卫灵光 Aura of the Sentinel

- 特性 ID：`paladin-oath-of-the-watchers-aura-of-the-sentinel`
- 动作或触发：被动；自己与灵光内盟友掷先攻
- 资源与恢复：无次数限制

先攻检定加入熟练加值，提高团队开场速度。

实现与校验：

- 掷先攻时校验范围；同名灵光不叠加；范围随等级扩大。

### 15级：警戒呵斥 Vigilant Rebuke

- 特性 ID：`paladin-oath-of-the-watchers-vigilant-rebuke`
- 动作或触发：反应；附近生物成功通过智力、感知或魅力豁免
- 资源与恢复：受反应限制

对迫使该豁免的生物造成力场伤害。

实现与校验：

- 校验成功豁免、来源生物与距离；每个事件最多触发一次反应。

### 20级：尘世壁垒 Mortal Bulwark

- 特性 ID：`paladin-oath-of-the-watchers-mortal-bulwark`
- 动作或触发：奖励动作；变身
- 资源与恢复：长休一次

获得对异界生物的强化攻击、真实视觉，并有机会把命中的异界目标驱逐回原位面。

实现与校验：

- 记录持续；过滤目标类型；驱逐豁免、位面归属和回返条件分别处理。

## 兼容与校验

- 战役必须允许该来源，圣武士达到3级，且子职选择位尚未占用；破誓者还必须获得DM明确许可。
- 规则数据保留 `5e-2014`；誓言法术、引导神力、灵光、法术位和变身次数分开记录。
- 2014子职用于2024职业时不得隐式采用同名新版数值；新旧替代能力不得叠加。
- 规则数据与自动化测试尚未实现。
