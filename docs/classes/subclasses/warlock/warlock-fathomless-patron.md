# 深海意志宗主 Fathomless Patron

## 基本信息

- 子职 ID：`warlock-fathomless-patron`
- 所属职业：[`warlock` 邪术师](warlock.md)
- 规则集：`5e-2014`
- 原版1级取得宗主；用于2024邪术师时首批特性在3级取得
- 来源与边界：Tasha's Cauldron of Everything；商业规则，仅记录特性结构与原创摘要
- 官方详情：[Tasha's Cauldron of Everything](https://www.dndbeyond.com/sources/dnd/tcoe)
- 最后核验：2026-07-27

## 玩法定位

召唤深海触手进行奖励动作攻击和减速，获得水下能力，并用触手减伤、强化指定法术和进行群体传送。

## 快速索引

| 2024兼容等级 | 原版等级 | 特性 | 资源摘要 |
|---:|---:|---|---|
| 3 | 1 | 扩展法术列表（Expanded Spell List） | 按等级开放 |
| 3 | 1 | 深海触手（Tentacle of the Deeps） | 熟练加值次/长休；持续1分钟 |
| 3 | 1 | 海洋赠礼（Gift of the Sea） | 无次数限制 |
| 6 | 6 | 深海之魂（Oceanic Soul） | 无次数限制 |
| 6 | 6 | 守护触手（Guardian Coil） | 每轮反应一次 |
| 10 | 10 | 攫心触手（Grasping Tentacles） | 一次免费施放/长休，另可用法术位 |
| 14 | 14 | 深海跃迁（Fathomless Plunge） | 短休或长休恢复 |

## 特性详解

### 3级（原版1级）：扩展法术列表 Expanded Spell List

- 特性 ID：`warlock-fathomless-patron-expanded-spell-list`
- 动作或触发：选择邪术师法术时
- 资源与恢复：按等级开放

把水、雷电、控制和召唤主题法术加入可选列表。

实现与校验：

- 按2014已知法术规则，不自动常备；绑定版本。

### 3级（原版1级）：深海触手 Tentacle of the Deeps

- 特性 ID：`warlock-fathomless-patron-tentacle-of-the-deeps`
- 动作或触发：奖励动作召唤或攻击
- 资源与恢复：熟练加值次/长休；持续1分钟

在范围内召唤幽灵触手并立即攻击；之后可用奖励动作移动并再次攻击，命中会降低目标速度。

实现与校验：

- 保存触手位置、持续、次数和奖励动作；一次只能有一个；攻击使用法术攻击数值。

### 3级（原版1级）：海洋赠礼 Gift of the Sea

- 特性 ID：`warlock-fathomless-patron-gift-of-the-sea`
- 动作或触发：被动
- 资源与恢复：无次数限制

获得游泳速度并能够在水下呼吸。

实现与校验：

- 记录速度来源；不等于免疫水压、寒冷或水下战斗惩罚。

### 6级：深海之魂 Oceanic Soul

- 特性 ID：`warlock-fathomless-patron-oceanic-soul`
- 动作或触发：被动
- 资源与恢复：无次数限制

获得寒冷抗性，并能在水下与浸水生物互相理解。

实现与校验：

- 抗性不叠加；水下通讯不自动提供语言知识。

### 6级：守护触手 Guardian Coil

- 特性 ID：`warlock-fathomless-patron-guardian-coil`
- 动作或触发：反应；附近生物受伤时
- 资源与恢复：每轮反应一次

让深海触手为自己或附近目标减伤，减伤骰随等级提高。

实现与校验：

- 触手必须存在且目标在范围；反应在伤害结算时使用；不能减到负数。

### 10级：攫心触手 Grasping Tentacles

- 特性 ID：`warlock-fathomless-patron-grasping-tentacles`
- 动作或触发：施放指定触手法术时
- 资源与恢复：一次免费施放/长休，另可用法术位

常备并强化黑触手类法术，提供临时生命且使伤害更难打断该法术的专注。

实现与校验：

- 绑定2014法术；保存免费施放；专注保护只作用于指定法术。

### 14级：深海跃迁 Fathomless Plunge

- 特性 ID：`warlock-fathomless-patron-fathomless-plunge`
- 动作或触发：动作；选择附近自愿目标
- 资源与恢复：短休或长休恢复

把自己和数个自愿生物传送到已知水域附近。

实现与校验：

- 目标必须自愿且在范围；目的地必须符合水域与熟悉条件；全组一次结算。

## 兼容与校验

- 战役必须允许该来源，邪术师达到子职选择等级，且子职选择位尚未占用。
- 角色数据保留 `5e-2014`；原版1级宗主特性在2024邪术师框架下于3级取得，其余等级保持来源记录。
- 契约魔法槽、普通法术位、免费施放次数和独立资源池必须分开记录。
- 新旧同名或替代能力不得叠加；规则数据与自动化测试尚未实现。
