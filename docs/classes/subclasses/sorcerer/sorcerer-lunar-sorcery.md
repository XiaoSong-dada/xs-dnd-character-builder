# 月之术法 Lunar Sorcery

## 基本信息

- 子职 ID：`sorcerer-lunar-sorcery`
- 所属职业：[`sorcerer` 术士](sorcerer.md)
- 规则集：`5e-2014`
- 选择等级：原版1级；2024兼容时3级
- 来源与边界：Dragonlance: Shadow of the Dragon Queen；商业规则，不复制正文
- 官方详情：[Dragonlance: Shadow of the Dragon Queen](https://www.dndbeyond.com/sources/dnd/sotdq)
- 最后核验：2026-07-27

## 玩法定位

在满月、新月与弦月间切换，以额外法术、术法点折扣和不同增益调整施法路线。

## 快速索引

| 2024兼容等级 | 原版等级 | 特性 | 资源摘要 |
|---:|---:|---|---|
| 3 | 1 | 月火（Moon Fire） | 无独立次数 |
| 3 | 1 | 月相化身（Lunar Embodiment） | 每次长休确定初始月相 |
| 6 | 6 | 月相恩惠（Lunar Boons） | 每回合一次减免 |
| 6 | 6 | 月相盈缺（Waxing and Waning） | 消耗1术法点 |
| 14 | 14 | 月相强化（Lunar Empowerment） | 无独立次数 |
| 18 | 18 | 月之奇观（Lunar Phenomenon） | 每种月相长休一次 |

## 特性详解

### 3级（原版1级）：月火 Moon Fire

- 特性 ID：`sorcerer-lunar-sorcery-moon-fire`
- 动作或触发：施放圣火戏法时
- 资源与恢复：无独立次数

强化圣火，使其按限制同时影响相邻的第二个目标。

实现与校验：

- 校验两目标距离及各自豁免；伤害分别结算。

### 3级（原版1级）：月相化身 Lunar Embodiment

- 特性 ID：`sorcerer-lunar-sorcery-lunar-embodiment`
- 动作或触发：长休后选择当前月相
- 资源与恢复：每次长休确定初始月相

三种月相各提供额外法术；当前月相决定可免费施放的低环法术。

实现与校验：

- 保存月相和免费施放状态；额外法术不占普通数量。

### 6级：月相恩惠 Lunar Boons

- 特性 ID：`sorcerer-lunar-sorcery-lunar-boons`
- 动作或触发：为当前月相关联学派使用超魔法时
- 资源与恢复：每回合一次减免

降低该次超魔法所需术法点。

实现与校验：

- 校验月相、法术学派和每回合限制；费用不低于规则下限。

### 6级：月相盈缺 Waxing and Waning

- 特性 ID：`sorcerer-lunar-sorcery-waxing-and-waning`
- 动作或触发：奖励动作；切换月相
- 资源与恢复：消耗1术法点

在三种月相间切换，改变后续法术和增益。

实现与校验：

- 扣点并替换当前月相；切换不重置免费施法。

### 14级：月相强化 Lunar Empowerment

- 特性 ID：`sorcerer-lunar-sorcery-lunar-empowerment`
- 动作或触发：被动；按当前月相生效
- 资源与恢复：无独立次数

每种月相提供不同防御或检定增益。

实现与校验：

- 切换后移除旧增益并应用新值；不得同时保留多个月相效果。

### 18级：月之奇观 Lunar Phenomenon

- 特性 ID：`sorcerer-lunar-sorcery-lunar-phenomenon`
- 动作或触发：奖励动作；发动当前月相现象
- 资源与恢复：每种月相长休一次

按月相产生治疗与光辉、黑暗与伤害，或传送与控制效果。

实现与校验：

- 三个效果分别追踪；校验范围、目标、豁免与空位；切换不刷新。

## 兼容与校验

- 战役必须允许该来源，且子职选择位尚未占用。
- 规则数据保留 `5e-2014`；2014子职兼容2024职业时只移动首次授予等级，不自动采用2024同名数值。
- 额外法术、普通法术、术法点、免费施放和独立资源分开记录。
- 新旧同名或替代能力不得叠加；规则数据与自动化测试尚未实现。
