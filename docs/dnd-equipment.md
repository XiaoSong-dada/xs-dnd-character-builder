# D&D 5e 装备资料索引

> 本文档是护甲、武器、冒险装备、工具、法器、坐骑货物与魔法物品的选择性加载入口，不属于每次开发任务的立即加载文档。
> 当前已建立 `5e-2014` 装备结构，覆盖《玩家手册》（PHB 2014）装备章节全部普通装备与《地下城主指南》（DMG 2014）魔法物品，均为**原创中文转述**，遵守版权边界（不复制原书正文）。

## 术语与版本边界

| 规则集 | 装备组织方式 | 程序支持状态 |
| --- | --- | --- |
| `5e-2014` | 普通装备（护甲/盾牌/武器/冒险装备/工具/法器/套组/坐骑货物）+ 魔法物品（按英文名 A–Z） | 普通装备已部分登记于 `app/src/rules/data/equipment-2014.ts`（SRD 子集）；全量登记为后续批次 |

- 角色只能使用与自身 `ruleset` 一致的装备条目；2014 与 2024 的同名装备必须使用不同稳定 ID 和独立数据。
- 价格与重量为官方机械数据（`gp`/`sp`/`cp` 与磅），以 2014《玩家手册》装备表为准；魔法物品无固定价格，按稀有度给出参考区间（以 XGtE 附录购买规则为准）并注明"由 DM 定价"。
- 所有介绍均为**原创中文摘要转述**，覆盖用途、效果要点与规则影响；不复制原书正文，不用于自动派生计算之外的版权敏感内容。
- 魔法物品分罕见度等级：常见（common）、非普通（uncommon）、稀有（rare）、非常稀有（very rare）、传说（legendary）、神器（artifact）；诅咒物品单独标注"诅咒"。

## 文档目录与字段约定

```text
docs/dnd-equipment.md                        总入口（本文档）
docs/equipment/5e-2014/armor-and-shields.md  护甲与盾牌（13 条）
docs/equipment/5e-2014/weapons.md            武器（37 条）
docs/equipment/5e-2014/adventuring-gear.md   冒险装备（约 80 条 + 背景专属 24 条）
docs/equipment/5e-2014/tools.md              工具与法器（约 45 条）
docs/equipment/5e-2014/packs-and-mounts.md   套组、坐骑与车辆（约 35 条）
docs/equipment/5e-2014/magic-items/a.md      魔法物品 A
docs/equipment/5e-2014/magic-items/b.md      魔法物品 B
docs/equipment/5e-2014/magic-items/c.md      魔法物品 C
docs/equipment/5e-2014/magic-items/d.md      魔法物品 D
docs/equipment/5e-2014/magic-items/e-f.md    魔法物品 E–F
docs/equipment/5e-2014/magic-items/g-h.md    魔法物品 G–H
docs/equipment/5e-2014/magic-items/i-j.md    魔法物品 I–J
docs/equipment/5e-2014/magic-items/k-l.md    魔法物品 K–L
docs/equipment/5e-2014/magic-items/m-n.md    魔法物品 M–N
docs/equipment/5e-2014/magic-items/o-p.md    魔法物品 O–P（含药水表）
docs/equipment/5e-2014/magic-items/q-r.md    魔法物品 Q–R
docs/equipment/5e-2014/magic-items/s.md      魔法物品 S
docs/equipment/5e-2014/magic-items/t-v.md    魔法物品 T–V
docs/equipment/5e-2014/magic-items/w-z.md    魔法物品 W–Z
docs/equipment/5e-2014/magic-items/artifacts.md 神器（artifact，8 件）
```

每个装备条目至少记录：

- 稳定 ID：本文档按规范 ID（`equipment-2014-<slug>`）登记；现有代码 `app/src/rules/data/equipment-2014.ts` 当前使用裸 ID（如 `padded-armor`、`club`），两者为同一物品，后续数据补全批次决定是否统一迁移 ID（迁移需同步更新 `starting-equipment-2014.ts` 等全部引用）。中文名、英文名、`ruleset`、分类、来源与版权边界照常记录。
- 价格（普通装备为 PHB 表格价；魔法物品为稀有度参考区间）、重量（如有）。
- 是否可装备（`equippable`）、装备位/类别（护甲、盾牌、武器、奇物、戒指、法杖等）。
- 效果摘要（原创转述）与规则影响（AC、伤害、施法、资源等）。
- 登记状态：`implemented`（已进入 `equipment-2014.ts` 并可参与派生）/ `index-only`（已建索引与摘要，未核验，不参与派生）/ `pending`（待登记）。

## 普通装备范围（PHB 2014 装备章节）

- **护甲与盾牌**：轻甲 3 种、中甲 5 种、重甲 4 种、盾牌 1 种；含 AC 公式、力量需求与隐蔽劣势。
- **武器**：简单近战 10、简单远程 4、军用近战 18、军用远程 5；含伤害骰、伤害类型与特性（灵巧、轻、双手、重、投掷、弹药、触及等）。
- **冒险装备**：工具类外的随身物品（容器、光源、绳索、服装、文书、补给、特殊装备如放大镜/望远镜等）。
- **工具与法器**：17 种工匠工具、6 种专用工具包、4 种游戏套具、10 种乐器、圣徽/德鲁伊法器/奥术法器/材料包。
- **套组**：7 个标准起始套组（窃贼、外交官、地城探险、艺人、探索、祭司、学者），展开为具体物品清单。
- **坐骑与车辆**：驴、骡、马、矮马、战马、货车、四轮马车、鞍具，以及 6 种水上船只。

## 魔法物品范围（DMG 2014 第 7 章）

- 按英文名 A–Z 全量收录，含各稀有度等级的护甲、武器、药水、卷轴、法杖、魔杖、戒指、奇物与诅咒物品。
- 神器（artifact）单独成文件：矮人诸王战斧、崇高之书、邪恶之书、维克纳之眼、维克纳之手、龙族宝珠、卡斯之剑、奥库斯魔杖。
- 魔法物品的随机属性表、诅咒表与"每件神器专属效果"不逐表登记，只记效果摘要与来源入口。
- 扩展书补充魔法物品（XGtE 常见魔法物品、TCoE 刺青等）列为 `pending` 批次，见各字母段文件尾注。

## 与代码数据的关系

- 数据实现文件：`app/src/rules/data/equipment-2014.ts`（`equipment2014`，普通装备）、`app/src/rules/data/magic-items-2014.ts`（`magicItems2014`，DMG 魔法物品）、`app/src/rules/data/magic-items-xgte-tcoe-2014.ts`（`magicItemsXgteTcoe2014`，XGtE 常见 + TCoE 刺青）、`app/src/rules/data/magic-items-2024.ts`（`magicItems2024`，2024 新增条目）与 `app/src/types/rules.ts`（`EquipmentRule`）。
- `EquipmentRule` 字段：`id/name/description/classIds/equippable/weaponKind/damageDice/damageType/contents/armorBase/addsDexterityToArmor/armorDexterityCap/armorClassBonus/category/sourceIds`，以及魔法物品字段 `rarity/requiresAttunement/magicBonus`；**暂无价格与重量字段**，本索引收录的价格/重量为后续数据补全与购买/出售功能的前置依据（字段扩展列入 `docs/需求文档/角色卡物品与金币需求.md` R7/R8）。
- **登记状态**：普通装备（PHB 2014 装备章节全量，含冒险装备/工具/坐骑车辆，约 250 条，全部带原创介绍）已进入 `equipment-2014.ts`；魔法物品第一批（DMG 2014 常见 + 非普通全量，约 101 条，含治疗药水四级）在 `magic-items-2014.ts`；第二批（XGtE 常见 47 件 + TCoE 刺青 17 条）在 `magic-items-xgte-tcoe-2014.ts`；2024 批次（Enspelled 系列等已确认新增条目 6 条）在 `magic-items-2024.ts`，经 `rulesRepository.equipment = [...equipment2014, ...magicItems2014, ...magicItemsXgteTcoe2014, ...magicItems2024]` 合并（`app/src/rules/repository.ts`）。
- **待核对**：2024 全量清单（2024 DMG 魔法物品与 2024 PHB 装备的差异校准）需官方文本核对后补全——本地网络无法访问 5e.tools/存档镜像；重叠条目以 2024 规则为准的校准（如容量、数值差异）随核对批次更新。
- 弹窗内置库（"添加物品"）来源即合并后的 `rulesRepository.equipment`，分类 chips 含护甲/盾牌/武器/药水/魔法/工具/杂物；未收录条目由"自定义物品"入口兜底。
- 派生说明：装备栏 AC 计算（`app/src/rules/derive.ts`）目前只识别带 `armorBase` 的护甲；泛型魔法护甲（如"护甲 +1"）装备后按基础 10 计算，附着具体护甲后的 AC 增强属后续派生增强点。
