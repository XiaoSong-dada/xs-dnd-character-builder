# D&D 5e 物种与种族资料索引

> 本文档是物种、种族、血统与子种族的选择性加载入口，不属于每次开发任务的立即加载文档。
> 精灵双版本样例已通过审阅；当前索引覆盖计划内全部 2024 核心物种与 2014 核心种族。

## 术语与版本边界

| 规则集 | 项目术语 | 属性提升来源 | 分支称呼 | 程序支持状态 |
| --- | --- | --- | --- | --- |
| `5e-2024` | 物种（Species） | 出身（Background），物种不提供属性提升 | 血统、传承或祖先选择 | 未来独立规则集资料 |
| `5e-2014` | 种族（Race） | 基础种族和部分子种族 | 子种族（Subrace） | 独立参考层，不自动进入 2024 车卡流程 |

- 两套规则的物种、种族、分支和特性 ID 必须完全独立；同名能力也不得隐式复用数值。
- 角色只能绑定一个明确的 `ruleset`。跨版本采用内容必须由 DM 明确许可，并建立显式映射，不能叠加两个版本的同名能力。
- 2024 的语言由角色创建规则的其他步骤决定，不把 2014 种族语言直接移植到 2024 物种。

## 文档字段约定

每个物种或种族主文件至少记录：

- 稳定 ID、中文名、英文名、`ruleset`、来源与版权边界。
- 生物类型、体型、速度、感官、语言和属性提升来源。
- 创建角色时的必选项、互斥项、派生值与玩法定位。
- “快速索引 + 特性详解”，包含获得等级、特性 ID、动作或触发、资源恢复、效果和实现校验。
- 分支入口、继承关系，以及 2014/2024 兼容边界。

分支文件只记录相对父项新增或替换的内容，并必须链接回父文件。ID 使用版本前缀，例如：

```text
species-2024-elf
species-2024-elf-drow-lineage
race-2014-elf
race-2014-elf-drow
```

## 2024 核心物种

| 物种 | 英文名 | 详细资料 | 分支 | 状态 |
| --- | --- | --- | --- | --- |
| 阿斯莫 | Aasimar | [2024 阿斯莫](species/5e-2024/aasimar/aasimar.md) | 天界启示三形态保留在主文件选择表 | 已核验；商业摘要 |
| 龙裔 | Dragonborn | [2024 龙裔](species/5e-2024/dragonborn/dragonborn.md) | 龙族祖先保留在主文件选择表 | 已核验 |
| 矮人 | Dwarf | [2024 矮人](species/5e-2024/dwarf/dwarf.md) | 无机械血统分支 | 已核验 |
| 精灵 | Elf | [2024 精灵](species/5e-2024/elf/elf.md) | [卓尔](species/5e-2024/elf/elf-drow-lineage.md)、[高等精灵](species/5e-2024/elf/elf-high-elf-lineage.md)、[木精灵](species/5e-2024/elf/elf-wood-elf-lineage.md) | 已核验 |
| 侏儒 | Gnome | [2024 侏儒](species/5e-2024/gnome/gnome.md) | [森林侏儒](species/5e-2024/gnome/gnome-forest-lineage.md)、[岩石侏儒](species/5e-2024/gnome/gnome-rock-lineage.md) | 已核验 |
| 歌利亚 | Goliath | [2024 歌利亚](species/5e-2024/goliath/goliath.md) | 六种巨人祖先保留在主文件选择表 | 已核验 |
| 半身人 | Halfling | [2024 半身人](species/5e-2024/halfling/halfling.md) | 无机械血统分支 | 已核验 |
| 人类 | Human | [2024 人类](species/5e-2024/human/human.md) | 无独立血统文件 | 已核验 |
| 兽人 | Orc | [2024 兽人](species/5e-2024/orc/orc.md) | 无独立血统文件 | 已核验 |
| 提夫林 | Tiefling | [2024 提夫林](species/5e-2024/tiefling/tiefling.md) | [深渊](species/5e-2024/tiefling/tiefling-abyssal-legacy.md)、[冥界](species/5e-2024/tiefling/tiefling-chthonic-legacy.md)、[炼狱](species/5e-2024/tiefling/tiefling-infernal-legacy.md) | 已核验 |

## 2014 核心种族

| 种族 | 英文名 | 详细资料 | 子种族 | 状态 |
| --- | --- | --- | --- | --- |
| 矮人 | Dwarf | [2014 矮人](species/5e-2014/dwarf/dwarf.md) | [丘陵矮人](species/5e-2014/dwarf/dwarf-hill.md)、[山地矮人](species/5e-2014/dwarf/dwarf-mountain.md) | 已核验 |
| 精灵 | Elf | [2014 精灵](species/5e-2014/elf/elf.md) | [卓尔](species/5e-2014/elf/elf-drow.md)、[高等精灵](species/5e-2014/elf/elf-high-elf.md)（含日/月精灵叙事分支）、[木精灵](species/5e-2014/elf/elf-wood-elf.md) | 已核验 |
| 半身人 | Halfling | [2014 半身人](species/5e-2014/halfling/halfling.md) | [轻足半身人](species/5e-2014/halfling/halfling-lightfoot.md)、[强心半身人](species/5e-2014/halfling/halfling-stout.md) | 已核验 |
| 人类 | Human | [2014 人类](species/5e-2014/human/human.md) | [变体人类](species/5e-2014/human/human-variant.md)（可选规则，需 DM 许可） | 已核验 |
| 龙裔 | Dragonborn | [2014 龙裔](species/5e-2014/dragonborn/dragonborn.md) | 龙族祖先保留在主文件选择表 | 已核验 |
| 侏儒 | Gnome | [2014 侏儒](species/5e-2014/gnome/gnome.md) | [森林侏儒](species/5e-2014/gnome/gnome-forest.md)、[岩石侏儒](species/5e-2014/gnome/gnome-rock.md) | 已核验 |
| 半精灵 | Half-Elf | [2014 半精灵](species/5e-2014/half-elf/half-elf.md) | 无核心子种族 | 已核验 |
| 半兽人 | Half-Orc | [2014 半兽人](species/5e-2014/half-orc/half-orc.md) | 无核心子种族 | 已核验 |
| 提夫林 | Tiefling | [2014 提夫林](species/5e-2014/tiefling/tiefling.md) | 无核心子种族 | 已核验 |

## 来源与版权边界

- 2024 的九个开放物种以 [2024 Free Rules：Character Origins](https://www.dndbeyond.com/sources/dnd/br-2024/character-origins) 与 SRD 5.2.1 为依据，可用项目原创表述整理到规则实现级；阿斯莫来自商业版 2024 PHB，只记录摘要。
- 2014 开放内容以 [2014 Basic Rules：Races](https://www.dndbeyond.com/sources/dnd/basic-rules-2014/races) 与 SRD 5.1 为依据，可整理到规则实现级。
- 仅见于商业规则书的内容只记录稳定 ID、等级、特性名称、原创玩法摘要、选择提示、兼容边界和官方链接，不复制规则正文。
- 商业规则入口：[2024 Player’s Handbook 物种介绍](https://www.dndbeyond.com/posts/1783-the-10-species-in-the-2024-players-handbook)、[2014 Player’s Handbook](https://www.dndbeyond.com/sources/dnd/phb-2014)。

## 选择性加载

1. 任务只涉及通用基础设施、样式、构建或与物种无关的规则时，不加载本文档。
2. 已知规则集和目标物种时，先读取本文档的字段约定，再只读取对应主文件。
3. 只有目标分支明确或需要该分支规则时，才读取对应血统或子种族文件。
4. 禁止一次性把 `docs/species/` 全目录作为普通开发上下文加载。

## 核验记录

- 全量核验日期：2026-07-27。
- 当前资料范围：18 个 `5e-2024` 物种/血统文件、19 个 `5e-2014` 种族/子种族文件，以及本总索引，共 38 个 Markdown 文件。
- 当前程序只注册 `5e-2014` 种族与子种族；2024 物种资料作为未来独立规则集保留。
- 所有本地链接、稳定 ID、规则集字段、属性提升来源和版权边界应在规则资料变更后重新校验。
