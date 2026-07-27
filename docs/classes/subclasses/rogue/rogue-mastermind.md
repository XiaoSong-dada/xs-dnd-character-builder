# 策士 Mastermind

## 基本信息

- 子职 ID：`rogue-mastermind`
- 所属职业：[`rogue` 游荡者](rogue.md)
- 规则集：`5e-2014`
- 选择等级：3级
- 来源与边界：Xanathar's Guide to Everything；商业规则，不复制正文
- 官方详情：[Xanathar's Guide to Everything](https://www.dndbeyond.com/sources/dnd/xgte)
- 最后核验：2026-07-27

## 玩法定位

以语言、伪装与远程协助操控社交和战场，让盟友更容易命中，并逐渐学会读取与误导敌人。

## 快速索引

| 2024兼容等级 | 原版等级 | 特性 | 资源摘要 |
|---:|---:|---|---|
| 3 | 3 | 阴谋大师（Master of Intrigue） | 无次数限制 |
| 3 | 3 | 战术大师（Master of Tactics） | 每回合受奖励动作限制 |
| 9 | 9 | 洞察操控（Insightful Manipulator） | 每个目标按场景使用 |
| 13 | 13 | 误导（Misdirection） | 受反应限制 |
| 17 | 17 | 欺骗灵魂（Soul of Deceit） | 无次数限制 |

## 特性详解

### 3级：阴谋大师 Master of Intrigue

- 特性 ID：`rogue-mastermind-master-of-intrigue`
- 动作或触发：被动；经过观察可模仿口音
- 资源与恢复：无次数限制

获得若干工具、游戏与语言能力，并能在观察后模仿他人的说话模式。

实现与校验：

- 选择项和来源独立保存；模仿需要观察时间，识破由检定或DM裁定。

### 3级：战术大师 Master of Tactics

- 特性 ID：`rogue-mastermind-master-of-tactics`
- 动作或触发：奖励动作；执行协助
- 资源与恢复：每回合受奖励动作限制

可用奖励动作协助，并把协助攻击的有效距离扩展到更远。

实现与校验：

- 记录被协助盟友和目标；校验距离、可感知目标和效果期限。

### 9级：洞察操控 Insightful Manipulator

- 特性 ID：`rogue-mastermind-insightful-manipulator`
- 动作或触发：与生物交谈或观察一段时间后
- 资源与恢复：每个目标按场景使用

了解目标相对自己的若干能力倾向，并可能发现其人格或经历线索。

实现与校验：

- 只给出规则允许的比较信息；不泄露完整属性块；额外信息由DM决定。

### 13级：误导 Misdirection

- 特性 ID：`rogue-mastermind-misdirection`
- 动作或触发：反应；身旁生物提供掩护且攻击将命中自己
- 资源与恢复：受反应限制

把该次攻击改为命中提供掩护的生物。

实现与校验：

- 校验相邻、掩护和攻击类型；新目标承受同一次攻击，不重新掷命中。

### 17级：欺骗灵魂 Soul of Deceit

- 特性 ID：`rogue-mastermind-soul-of-deceit`
- 动作或触发：被动；遭读心或测谎时
- 资源与恢复：无次数限制

思想难以被读取，并能让检测真话的魔法得到误导结果。

实现与校验：

- 拦截指定心灵读取和真话判定效果；不等同于全面心灵免疫。

## 兼容与校验

- 战役必须允许该来源，游荡者达到3级，且子职选择位尚未占用。
- 规则数据保留 `5e-2014`；不得隐式混用另一规则集的同名能力、偷袭或狡诈打击数值。
- 偷袭每回合频率、动作经济、反应、法术位与独立资源必须分开追踪。
- 新旧同名或替代能力不得叠加；规则数据与自动化测试尚未实现。
