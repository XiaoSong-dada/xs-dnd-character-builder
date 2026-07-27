# 神圣之魂 Divine Soul

## 基本信息

- 子职 ID：`sorcerer-divine-soul`
- 所属职业：[`sorcerer` 术士](sorcerer.md)
- 规则集：`5e-2014`
- 选择等级：原版1级；2024兼容时3级
- 来源与边界：Xanathar's Guide to Everything；商业规则，不复制正文
- 官方详情：[Xanathar's Guide to Everything](https://www.dndbeyond.com/sources/dnd/xgte)
- 最后核验：2026-07-27

## 玩法定位

把牧师法术扩展到术士体系，以神圣眷顾修正关键检定，并获得治疗强化、飞翼与复苏。

## 快速索引

| 2024兼容等级 | 原版等级 | 特性 | 资源摘要 |
|---:|---:|---|---|
| 3 | 1 | 神圣魔法（Divine Magic） | 无独立次数 |
| 3 | 1 | 众神眷顾（Favored by the Gods） | 短休或长休一次 |
| 6 | 6 | 强化治疗（Empowered Healing） | 每次消耗1术法点 |
| 14 | 14 | 异界之翼（Otherworldly Wings） | 无次数限制 |
| 18 | 18 | 超凡复苏（Unearthly Recovery） | 长休一次 |

## 特性详解

### 3级（原版1级）：神圣魔法 Divine Magic

- 特性 ID：`sorcerer-divine-soul-divine-magic`
- 动作或触发：被动；选择子职时
- 资源与恢复：无独立次数

选择神圣倾向并获得对应额外法术；学习术士法术时也可从牧师列表选择。

实现与校验：

- 2024兼容时在3级授予；保存倾向与法术来源；仍按术士法术施放。

### 3级（原版1级）：众神眷顾 Favored by the Gods

- 特性 ID：`sorcerer-divine-soul-favored-by-the-gods`
- 动作或触发：攻击检定或豁免失败后、结算前
- 资源与恢复：短休或长休一次

为失败的攻击检定或豁免追加2d4，可能改为成功。

实现与校验：

- 仅限攻击或豁免；看到原结果后决定；扣除资源。

### 6级：强化治疗 Empowered Healing

- 特性 ID：`sorcerer-divine-soul-empowered-healing`
- 动作或触发：附近生物以法术掷治疗骰时
- 资源与恢复：每次消耗1术法点

重掷任意数量的治疗骰一次，并采用新结果。

实现与校验：

- 校验距离与法术治疗来源；同一批骰不得反复重掷。

### 14级：异界之翼 Otherworldly Wings

- 特性 ID：`sorcerer-divine-soul-otherworldly-wings`
- 动作或触发：奖励动作；显现或收起翅膀
- 资源与恢复：无次数限制

显现与神圣倾向相符的翅膀，并在装备允许时获得飞行速度。

实现与校验：

- 记录状态；校验护甲或衣物；结束时移除飞行。

### 18级：超凡复苏 Unearthly Recovery

- 特性 ID：`sorcerer-divine-soul-unearthly-recovery`
- 动作或触发：奖励动作；当前生命不高于一半
- 资源与恢复：长休一次

恢复相当于最大生命值一半的生命值。

实现与校验：

- 先校验阈值；治疗不超过上限；扣除长休资源。

## 兼容与校验

- 战役必须允许该来源，且子职选择位尚未占用。
- 规则数据保留 `5e-2014`；2014子职兼容2024职业时只移动首次授予等级，不自动采用2024同名数值。
- 额外法术、普通法术、术法点、免费施放和独立资源分开记录。
- 新旧同名或替代能力不得叠加；规则数据与自动化测试尚未实现。
