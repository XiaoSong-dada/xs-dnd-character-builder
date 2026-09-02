# 奥法射手 Arcane Archer

## 基本信息

- 子职 ID：`fighter-arcane-archer`
- 所属职业：[`fighter` 战士](fighter.md)
- 规则集：`5e-2014`
- 原版选择等级：3级；套用2024基础职业时仍在3级取得子职
- 内容来源：Xanathar's Guide to Everything
- 内容边界：商业规则，仅记录元数据、特性名称、原创摘要和兼容提示
- 官方详情：[Xanathar's Guide to Everything](https://www.dndbeyond.com/sources/dnd/xgte)
- 最后核验：2026-07-27

## 玩法定位

用奥法射击为箭矢附加控制、追踪和范围效果，并通过魔法箭、曲射和休息恢复维持远程专精。

## 快速索引

| 2024兼容等级 | 原版等级 | 特性 | 资源摘要 |
|---:|---:|---|---|
| 3 | 3 | 奥法射手学识（Arcane Archer Lore） | 无次数限制 |
| 3 | 3 | 奥法射击（Arcane Shot） | 2次/短休或长休 |
| 7 | 7 | 注魔箭矢（Magic Arrow） | 无次数限制 |
| 7 | 7 | 曲射（Curving Shot） | 受奖励动作限制 |
| 15 | 15 | 有箭无患（Ever-Ready Shot） | 每场战斗按条件 |
| 18 | 18 | 奥法射击强化（Arcane Shot Improvement） | 无次数限制 |

## 特性详解

### 3级：奥法射手学识 Arcane Archer Lore

- 特性 ID：`fighter-arcane-archer-arcane-archer-lore`
- 动作或触发：被动
- 资源与恢复：无次数限制

获得奥秘或自然熟练，并学会魔法伎俩或德鲁伊伎俩之一。

实现与校验：

- 保存技能和戏法选择；重复熟练按规则处理。

### 3级：奥法射击 Arcane Shot

- 特性 ID：`fighter-arcane-archer-arcane-shot`
- 动作或触发：短弓或长弓箭矢命中后
- 资源与恢复：2次/短休或长休

从已学奥法射击选项中选择，为命中附加伤害、控制、追踪或范围效果。

实现与校验：

- 武器类型、命中后窗口、选项和豁免分别校验；一次箭矢一个选项。

### 7级：注魔箭矢 Magic Arrow

- 特性 ID：`fighter-arcane-archer-magic-arrow`
- 动作或触发：使用非魔法短弓或长弓射箭时
- 资源与恢复：无次数限制

箭矢视为魔法攻击，用于克服对非魔法攻击的抗性或免疫。

实现与校验：

- 只添加魔法标签；不改变伤害类型或提供命中加值。

### 7级：曲射 Curving Shot

- 特性 ID：`fighter-arcane-archer-curving-shot`
- 动作或触发：魔法箭未命中后用奖励动作
- 资源与恢复：受奖励动作限制

把同一箭矢重新导向另一名附近目标，并重新进行攻击检定。

实现与校验：

- 新目标必须不同、可见且在范围；不能再次曲射同一箭。

### 15级：有箭无患 Ever-Ready Shot

- 特性 ID：`fighter-arcane-archer-ever-ready-shot`
- 动作或触发：掷先攻且没有奥法射击次数时
- 资源与恢复：每场战斗按条件

恢复一次奥法射击使用。

实现与校验：

- 仅在池为0时触发；不超过正常上限。

### 18级：奥法射击强化 Arcane Shot Improvement

- 特性 ID：`fighter-arcane-archer-arcane-shot-improvement`
- 动作或触发：被动
- 资源与恢复：无次数限制

所有奥法射击选项的额外伤害骰提高。

实现与校验：

- 更新选项伤害公式；控制DC和使用次数不因本特性改变。

## 兼容与校验

- 战役必须允许该来源，战士达到3级，且子职选择位尚未占用。
- 规则数据保留 `5e-2014`；动作如潮、回气、不屈、子职骰池和独立次数分开追踪。
- 2014子职用于2024职业需要DM许可，不得隐式采用同名新版数值或叠加替代能力。
- 规则数据与自动化测试尚未实现。
