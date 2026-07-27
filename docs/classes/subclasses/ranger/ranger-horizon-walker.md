# 地平线行者 Horizon Walker

## 基本信息

- 子职 ID：`ranger-horizon-walker`
- 所属职业：[`ranger` 游侠](ranger.md)
- 规则集：`5e-2014`
- 原版选择等级：3级；用于2024基础职业须通过兼容审核
- 内容来源：Xanathar's Guide to Everything
- 内容边界：商业规则，仅记录元数据、特性名称、原创摘要与兼容提示
- 官方详情：[Xanathar's Guide to Everything](https://www.dndbeyond.com/sources/dnd/xgte)
- 最后核验：2026-07-27

## 玩法定位

侦测位面裂隙并把武器伤害转为力场，以短暂虚化和连续传送穿梭于多个敌人之间。

## 快速索引

| 2024兼容等级 | 原版等级 | 特性 | 资源摘要 |
|---:|---:|---|---|
| 3 | 3 | 地平线行者法术（Horizon Walker Magic） | 自动常备 |
| 3 | 3 | 侦测传送门（Detect Portal） | 短休或长休一次 |
| 3 | 3 | 位面战士（Planar Warrior） | 每回合一次 |
| 7 | 7 | 虚化步（Ethereal Step） | 短休或长休一次 |
| 11 | 11 | 遥远打击（Distant Strike） | 无独立次数 |
| 15 | 15 | 幽灵防御（Spectral Defense） | 受反应限制 |

## 特性详解

### 3级：地平线行者法术 Horizon Walker Magic

- 特性 ID：`ranger-horizon-walker-horizon-walker-magic`
- 动作或触发：被动；随等级解锁
- 资源与恢复：自动常备

获得传送、位面与机动主题额外法术。

实现与校验：

- 按等级解锁；不占普通准备数量；绑定5e-2014。

### 3级：侦测传送门 Detect Portal

- 特性 ID：`ranger-horizon-walker-detect-portal`
- 动作或触发：动作；感知附近位面传送门
- 资源与恢复：短休或长休一次

得知一定范围内最近位面传送门的大致方向和距离。

实现与校验：

- 只检测通往其他位面的传送门；距离、遮蔽和DM秘密信息按来源处理。

### 3级：位面战士 Planar Warrior

- 特性 ID：`ranger-horizon-walker-planar-warrior`
- 动作或触发：奖励动作；指定附近可见生物
- 资源与恢复：每回合一次

本回合首次以武器命中目标时，把攻击伤害转为力场并追加伤害。

实现与校验：

- 保存目标至回合结束；只强化首次命中；转换整次攻击的伤害类型。

### 7级：虚化步 Ethereal Step

- 特性 ID：`ranger-horizon-walker-ethereal-step`
- 动作或触发：奖励动作
- 资源与恢复：短休或长休一次

短暂进入以太位面，能穿越现实障碍，回合结束时返回。

实现与校验：

- 记录位面状态；返回点被占用或在实体内时按规则处理。

### 11级：遥远打击 Distant Strike

- 特性 ID：`ranger-horizon-walker-distant-strike`
- 动作或触发：攻击动作中每次攻击前
- 资源与恢复：无独立次数

每次攻击前传送短距；若攻击多个不同生物，可进行额外一次攻击。

实现与校验：

- 每次终点需可见且未占用；追踪本动作不同目标；额外攻击最多一次。

### 15级：幽灵防御 Spectral Defense

- 特性 ID：`ranger-horizon-walker-spectral-defense`
- 动作或触发：反应；受到一次攻击伤害时
- 资源与恢复：受反应限制

获得针对该次攻击全部伤害的抗性。

实现与校验：

- 触发需来自攻击；抗性只持续本次伤害；与已有抗性不重复降低。

## 兼容与校验

- 战役必须允许该来源，游侠达到3级，且子职选择位尚未占用。
- 规则数据保留 `5e-2014`；额外法术、猎人印记、法术位、伙伴状态与独立次数分开记录。
- 2014子职在2024职业上使用需要DM许可，不得混用同名新版数值或叠加替代能力。
- 规则数据与自动化测试尚未实现。
