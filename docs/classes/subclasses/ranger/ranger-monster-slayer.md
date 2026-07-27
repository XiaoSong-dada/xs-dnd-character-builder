# 怪物杀手 Monster Slayer

## 基本信息

- 子职 ID：`ranger-monster-slayer`
- 所属职业：[`ranger` 游侠](ranger.md)
- 规则集：`5e-2014`
- 原版选择等级：3级；用于2024基础职业须通过兼容审核
- 内容来源：Xanathar's Guide to Everything
- 内容边界：商业规则，仅记录元数据、特性名称、原创摘要与兼容提示
- 官方详情：[Xanathar's Guide to Everything](https://www.dndbeyond.com/sources/dnd/xgte)
- 最后核验：2026-07-27

## 玩法定位

识别怪物弱点并锁定单一猎物，以超凡防御、反制施法和豁免反击对抗法师与强大异怪。

## 快速索引

| 2024兼容等级 | 原版等级 | 特性 | 资源摘要 |
|---:|---:|---|---|
| 3 | 3 | 怪物杀手法术（Monster Slayer Magic） | 自动常备 |
| 3 | 3 | 猎手感知（Hunter's Sense） | 感知调整值次/长休，至少一次 |
| 3 | 3 | 杀手猎物（Slayer's Prey） | 一次维持一个目标 |
| 7 | 7 | 超凡防御（Supernatural Defense） | 无固定次数 |
| 11 | 11 | 施法者克星（Magic-User's Nemesis） | 短休或长休一次 |
| 15 | 15 | 杀手反击（Slayer's Counter） | 受反应限制 |

## 特性详解

### 3级：怪物杀手法术 Monster Slayer Magic

- 特性 ID：`ranger-monster-slayer-monster-slayer-magic`
- 动作或触发：被动；随等级解锁
- 资源与恢复：自动常备

获得侦测、保护和束缚怪物主题额外法术。

实现与校验：

- 按等级解锁；不占普通准备数量；绑定5e-2014。

### 3级：猎手感知 Hunter's Sense

- 特性 ID：`ranger-monster-slayer-hunters-sense`
- 动作或触发：动作；观察附近生物
- 资源与恢复：感知调整值次/长休，至少一次

得知目标的伤害免疫、抗性和易伤；部分防侦测效果会阻止。

实现与校验：

- 扣除次数；过滤被保护信息；不展示完整属性块。

### 3级：杀手猎物 Slayer's Prey

- 特性 ID：`ranger-monster-slayer-slayers-prey`
- 动作或触发：奖励动作；指定可见生物
- 资源与恢复：一次维持一个目标

每回合首次以武器命中该目标时追加伤害，持续到休息或重新指定。

实现与校验：

- 保存目标；每回合一次；新目标覆盖旧目标。

### 7级：超凡防御 Supernatural Defense

- 特性 ID：`ranger-monster-slayer-supernatural-defense`
- 动作或触发：杀手猎物迫使自己豁免或尝试擒抱时
- 资源与恢复：无固定次数

在相关豁免或逃脱检定上加入额外猎杀骰。

实现与校验：

- 触发来源必须是当前猎物；一次检定加入一次。

### 11级：施法者克星 Magic-User's Nemesis

- 特性 ID：`ranger-monster-slayer-magic-users-nemesis`
- 动作或触发：反应；附近生物施法或传送时
- 资源与恢复：短休或长休一次

迫使目标进行感知豁免，失败则法术或传送被阻止并浪费相应动作。

实现与校验：

- 校验距离、可见和触发类型；记录豁免及被取消资源。

### 15级：杀手反击 Slayer's Counter

- 特性 ID：`ranger-monster-slayer-slayers-counter`
- 动作或触发：反应；猎物迫使自己进行豁免时
- 资源与恢复：受反应限制

在豁免前对猎物进行一次武器攻击；命中则自动通过该次豁免。

实现与校验：

- 目标必须在武器射程内；攻击命中才改写豁免结果；一次触发一次。

## 兼容与校验

- 战役必须允许该来源，游侠达到3级，且子职选择位尚未占用。
- 规则数据保留 `5e-2014`；额外法术、猎人印记、法术位、伙伴状态与独立次数分开记录。
- 2014子职在2024职业上使用需要DM许可，不得混用同名新版数值或叠加替代能力。
- 规则数据与自动化测试尚未实现。
