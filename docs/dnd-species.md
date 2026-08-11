# D&D 5e 物种与种族资料索引

> 本文档是物种、种族、血统与子种族的选择性加载入口，不属于每次开发任务的立即加载文档。
> 精灵双版本样例已通过审阅；当前索引覆盖计划内全部 2024 核心物种、2014 核心种族与 2014 扩展种族。

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

## 2014 核心种族（开放内容）

以下种族与子种族以 [2014 Basic Rules：Races](https://www.dndbeyond.com/sources/dnd/basic-rules-2014/races) 与 SRD 5.1 为依据，可整理到规则实现级。

| 种族 | 英文名 | 详细资料 | 子种族 | 状态 |
| --- | --- | --- | --- | --- |
| 矮人 | Dwarf | [2014 矮人](species/5e-2014/dwarf/dwarf.md) | [丘陵矮人](species/5e-2014/dwarf/dwarf-hill.md)、[山地矮人](species/5e-2014/dwarf/dwarf-mountain.md)、[地底矮人](species/5e-2014/dwarf/dwarf-duergar.md)（商业） | 已核验 |
| 精灵 | Elf | [2014 精灵](species/5e-2014/elf/elf.md) | [卓尔](species/5e-2014/elf/elf-drow.md)、[高等精灵](species/5e-2014/elf/elf-high-elf.md)（含日/月精灵叙事分支）、[木精灵](species/5e-2014/elf/elf-wood-elf.md)、[海精灵](species/5e-2014/elf/elf-sea-elf.md)（商业）、[伊拉德林](species/5e-2014/elf/elf-eladrin.md)（商业）、[苍白精灵](species/5e-2014/elf/elf-pallid-elf.md)（商业） | 已核验 |
| 半身人 | Halfling | [2014 半身人](species/5e-2014/halfling/halfling.md) | [轻足半身人](species/5e-2014/halfling/halfling-lightfoot.md)、[强心半身人](species/5e-2014/halfling/halfling-stout.md)、[莲沼半身人](species/5e-2014/halfling/halfling-lotusden.md)（商业） | 已核验 |
| 人类 | Human | [2014 人类](species/5e-2014/human/human.md) | [变体人类](species/5e-2014/human/human-variant.md)（可选规则，需 DM 许可） | 已核验 |
| 龙裔 | Dragonborn | [2014 龙裔](species/5e-2014/dragonborn/dragonborn.md) | 龙族祖先保留在主文件选择表；[费兹本龙裔三型](species/5e-2014/dragonborn/dragonborn-fizban.md)（色龙/宝石/金属，商业可选规则） | 已核验 |
| 侏儒 | Gnome | [2014 侏儒](species/5e-2014/gnome/gnome.md) | [森林侏儒](species/5e-2014/gnome/gnome-forest.md)、[岩石侏儒](species/5e-2014/gnome/gnome-rock.md)、[地底侏儒](species/5e-2014/gnome/gnome-deep-gnome.md)（商业） | 已核验 |
| 半精灵 | Half-Elf | [2014 半精灵](species/5e-2014/half-elf/half-elf.md) | 无核心子种族 | 已核验 |
| 半兽人 | Half-Orc | [2014 半兽人](species/5e-2014/half-orc/half-orc.md) | 无核心子种族 | 已核验 |
| 提夫林 | Tiefling | [2014 提夫林](species/5e-2014/tiefling/tiefling.md) | [九大炼狱血统](species/5e-2014/tiefling/tiefling-legacies.md)（商业可选规则） | 已核验 |

## 2014 扩展种族（商业内容）

以下种族来自商业补充书，只记录稳定 ID、属性提升、原创玩法摘要、选择提示、兼容边界和官方链接，不复制规则正文；未经核验的具体效果不得进入自动计算。

| 种族 | 英文名 | 来源 | 详细资料 | 分支 | 状态 |
| --- | --- | --- | --- | --- | --- |
| 哥布林 | Goblin | VGM | [2014 哥布林](species/5e-2014/goblin/goblin.md) | 无 | 已实现；商业摘要 |
| 大地精 | Hobgoblin | VGM | [2014 大地精](species/5e-2014/hobgoblin/hobgoblin.md) | 无 | 已实现；商业摘要 |
| 熊地精 | Bugbear | VGM | [2014 熊地精](species/5e-2014/bugbear/bugbear.md) | 无 | 已实现；商业摘要 |
| 兽化人 | Shifter | ERftLW | [2014 兽化人](species/5e-2014/shifter/shifter.md) | [熊皮](species/5e-2014/shifter/shifter-beasthide.md)、[长牙](species/5e-2014/shifter/shifter-longtooth.md)、[疾行](species/5e-2014/shifter/shifter-swiftstride.md)、[野猎](species/5e-2014/shifter/shifter-wildhunt.md) | 已实现；商业摘要 |
| 天裔 | Aasimar | VGM | [2014 天裔](species/5e-2014/aasimar/aasimar.md) | [守护者](species/5e-2014/aasimar/aasimar-protector.md)、[惩戒者](species/5e-2014/aasimar/aasimar-scourge.md)、[堕落者](species/5e-2014/aasimar/aasimar-fallen.md) | 已实现；商业摘要 |
| 歌利亚 | Goliath | EEPC/VGM | [2014 歌利亚](species/5e-2014/goliath/goliath.md) | 无 | 已实现；商业摘要 |
| 猫人 | Tabaxi | VGM | [2014 猫人](species/5e-2014/tabaxi/tabaxi.md) | 无 | 已实现；商业摘要 |
| 特里同 | Triton | EEPC/VGM | [2014 特里同](species/5e-2014/triton/triton.md) | 无 | 已实现；商业摘要 |
| 半巨人 | Firbolg | VGM | [2014 半巨人](species/5e-2014/firbolg/firbolg.md) | 无 | 已实现；商业摘要 |
| 兽人 | Orc | VGM | [2014 兽人](species/5e-2014/orc/orc.md) | 无 | 已实现；商业摘要 |
| 鸦人 | Kenku | VGM | [2014 鸦人](species/5e-2014/kenku/kenku.md) | 无 | 已实现；商业摘要 |
| 狗头人 | Kobold | VGM | [2014 狗头人](species/5e-2014/kobold/kobold.md) | 无 | 已实现；商业摘要 |
| 鸟人 | Aarakocra | EEPC/VGM | [2014 鸟人](species/5e-2014/aarakocra/aarakocra.md) | 无 | 已实现；商业摘要 |
| 蜥蜴人 | Lizardfolk | VGM | [2014 蜥蜴人](species/5e-2014/lizardfolk/lizardfolk.md) | 无 | 已实现；商业摘要 |
| 蛇人 | Yuan-ti Pureblood | VGM | [2014 蛇人](species/5e-2014/yuan-ti/yuan-ti.md) | 无 | 已实现；商业摘要 |
| 战俑 | Warforged | ERftLW | [2014 战俑](species/5e-2014/warforged/warforged.md) | 无 | 已实现；商业摘要 |
| 变形怪 | Changeling | ERftLW | [2014 变形怪](species/5e-2014/changeling/changeling.md) | 无 | 已实现；商业摘要 |
| 卡拉司塔 | Kalashtar | ERftLW | [2014 卡拉司塔](species/5e-2014/kalashtar/kalashtar.md) | 无 | 已实现；商业摘要 |
| 龟人 | Tortle | Tortle Package | [2014 龟人](species/5e-2014/tortle/tortle.md) | 无 | 已实现；商业摘要 |
| 吉斯 | Gith | MToF | [2014 吉斯](species/5e-2014/gith/gith.md) | [吉斯洋基人](species/5e-2014/gith/gith-githyanki.md)、[吉斯泽莱人](species/5e-2014/gith/gith-githzerai.md) | 已实现；商业摘要 |
| 米诺陶 | Minotaur | GGR | [2014 米诺陶](species/5e-2014/minotaur/minotaur.md) | 无 | 已实现；商业摘要 |
| 半人马 | Centaur | GGR | [2014 半人马](species/5e-2014/centaur/centaur.md) | 无 | 已实现；商业摘要 |
| 维达肯 | Vedalken | GGR | [2014 维达肯](species/5e-2014/vedalken/vedalken.md) | 无 | 已实现；商业摘要 |
| 洛克斯 | Loxodon | GGR | [2014 洛克斯](species/5e-2014/loxodon/loxodon.md) | 无 | 已实现；商业摘要 |
| 析米克混血 | Simic Hybrid | GGR | [2014 析米克混血](species/5e-2014/simic-hybrid/simic-hybrid.md) | 无 | 已实现；商业摘要 |

## 来源与版权边界

- 2024 的九个开放物种以 [2024 Free Rules：Character Origins](https://www.dndbeyond.com/sources/dnd/br-2024/character-origins) 与 SRD 5.2.1 为依据，可用项目原创表述整理到规则实现级；阿斯莫来自商业版 2024 PHB，只记录摘要。
- 2014 开放内容以 [2014 Basic Rules：Races](https://www.dndbeyond.com/sources/dnd/basic-rules-2014/races) 与 SRD 5.1 为依据，可整理到规则实现级。
- 仅见于商业规则书的内容只记录稳定 ID、等级、特性名称、原创玩法摘要、选择提示、兼容边界和官方链接，不复制规则正文。
- 2014 扩展种族来源索引：
  - **VGM**：Volo's Guide to Monsters（哥布林、大地精、熊地精、天裔、歌利亚、猫人、特里同、半巨人、兽人、鸦人、狗头人、鸟人、蜥蜴人、蛇人）。
  - **EEPC**：Elemental Evil Player's Companion（歌利亚、特里同、鸟人首发，VGM 重印数值相同）。
  - **ERftLW**：Eberron: Rising from the Last War（兽化人、战俑、变形怪、卡拉司塔）。
  - **MToF**：Mordenkainen's Tome of Foes（地底矮人、海精灵、伊拉德林、地底侏儒重印、提夫林血统、吉斯）。
  - **GGR**：Guildmaster's Guide to Ravnica（米诺陶、半人马、维达肯、洛克斯、析米克混血）。
  - **FToD**：Fizban's Treasury of Dragons（龙裔三型：色龙/宝石/金属，2021 年出版、2014 规则兼容）。
  - **Tortle Package**：The Tortle Package（龟人）。
  - **EGtW**：Explorer's Guide to Wildemount（苍白精灵、莲沼半身人）。
- 版本勘误记录（2026-08-11 核验）：天裔三形态官方来源为 VGM 而非 SCAG；5e 2014 无官方“灰精灵”亚种（灰精灵为 3.x/4e 时代亚种，PHB 高精灵文本中的“灰精灵/月精灵”仅是被遗忘国度叙事别称）；Deep Gnome 首发 EEPC，由 MToF 重印（XGtE 仅含同名专长）；ERftLW 重印的哥布林、兽人数值与 VGM 完全相同；Fizban 龙裔无黑暗视觉。

## 选择性加载

1. 任务只涉及通用基础设施、样式、构建或与物种无关的规则时，不加载本文档。
2. 已知规则集和目标物种时，先读取本文档的字段约定，再只读取对应主文件。
3. 只有目标分支明确或需要该分支规则时，才读取对应血统或子种族文件。
4. 禁止一次性把 `docs/species/` 全目录作为普通开发上下文加载。

## 核验记录

- 全量核验日期：2026-07-27（原 38 个文件）；2026-08-11 扩展种族考察、勘误核验与程序登记。
- 当前资料范围：18 个 `5e-2024` 物种/血统文件、19 个 `5e-2014` 核心种族/子种族文件，以及 42 个 `5e-2014` 扩展种族/分支文件（见[种族扩展需求](需求文档/种族扩展需求.md)）；程序已登记 72 条种族记录（19 核心 + 53 扩展）。
- 当前程序已注册 `5e-2014` 核心种族与扩展种族共 72 条（2026-08-11 扩展种族登记完成）；2024 物种资料作为未来独立规则集保留。
- 所有本地链接、稳定 ID、规则集字段、属性提升来源和版权边界应在规则资料变更后重新校验。
