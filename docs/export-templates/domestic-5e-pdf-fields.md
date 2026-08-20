# 国内 5E 术语版角色卡 PDF 字段契约

> 模板：`DND_5E_2014_国内5E术语版角色卡_最终版.pdf`  
> PDF：1.7，3 页，Letter（612 × 792 pt）  
> 适配版本：PDF mapping v5  
> 填充方式：AcroForm 字段填充、Noto Sans SC 更新外观、导出前扁平化

## 1. 字段匹配规则

- 业务映射使用字段名，不使用字段在 PDF 中的对象编号或出现顺序。
- 查找时仅对首尾空格、连续空格和英文大小写做归一化；原始字段名仍记录在映射中。
- 必需字段缺失或类型错误时阻断导出。
- 第二页/第三页不同发行版本可能存在空格差异，适配器使用候选字段名兼容。
- 模板沿用官方表单的无语义 `Spells <编号>` 字段，编号不直接表示法术环级；法术名称按表单坐标和各环 `SlotsTotal` 字段的版面锚点分组，同列中位于锚点下方的行归入对应环级，第一列一环锚点上方的行归入戏法。
- 法术准备复选框通过同页、同一水平行且位于法术名称左侧的最近复选框匹配，避免依赖无语义的 `Check Box <序号>`。

## 2. 第一页固定字段

### 身份与战斗

| 模型字段 | PDF 字段 |
|---|---|
| `identity.characterName` | `CharacterName` |
| `identity.classLevel` | `ClassLevel` |
| `identity.backgroundName` | `Background` |
| `identity.raceName` | `Race ` |
| `identity.alignment` | `Alignment` |
| `identity.experience` | `XP` |
| `combat.proficiencyBonus` | `ProfBonus` |
| `combat.armorClass` | `AC` |
| `combat.initiative` | `Initiative` |
| `combat.speed` | `Speed` |
| `combat.hitPointMaximum` | `HPMax` |
| `combat.hitPointCurrent` | `HPCurrent` |
| `combat.hitPointTemporary` | `HPTemp` |
| 等级与生命骰摘要 | `HDTotal`、`HD` |
| `combat.passivePerception` | `Passive` |

`PlayerName`、`Inspiration`、死亡豁免、个性、理想、羁绊和缺点当前无独立模型来源，保持空白。

### 属性、豁免和熟练

| 属性 | 属性值 | 调整值 | 豁免值 | 豁免熟练复选框 |
|---|---|---|---|---|
| 力量 | `STR` | `STRmod` | `ST Strength` | `Check Box 11` |
| 敏捷 | `DEX` | `DEXmod ` | `ST Dexterity` | `Check Box 18` |
| 体质 | `CON` | `CONmod` | `ST Constitution` | `Check Box 19` |
| 智力 | `INT` | `INTmod` | `ST Intelligence` | `Check Box 20` |
| 感知 | `WIS` | `WISmod` | `ST Wisdom` | `Check Box 21` |
| 魅力 | `CHA` | `CHamod` | `ST Charisma` | `Check Box 22` |

18 项技能值使用模板既有英文内部字段名；对应熟练复选框为 `Check Box 23`～`Check Box 40`，按杂技、驯兽、奥秘、运动、欺瞒、历史、洞悉、威吓、调查、医药、自然、察觉、表演、游说、宗教、巧手、隐匿、生存的模板顺序建立稳定映射。专精与熟练均勾选，差异由最终技能值体现。

### 攻击、物品和特性

- 三组固定攻击：`Wpn Name` / `Wpn1 AtkBonus` / `Wpn1 Damage`，以及编号 2、3 字段。
- 第四项及更多攻击：`AttacksSpellcasting`。
- 钱币：`CP`、`SP`、`EP`、`GP`、`PP`。
- 语言与熟练：`ProficienciesLang`。
- 物品：`Equipment`。
- 主要特性：`Features and Traits`。

## 3. 人物资料页

使用以下候选字段名：

- 角色名：`CharacterName 2`、`Character Name 2`、`CharacterName2`；
- 背景故事：`Character Backstory`、`Backstory`、`CharacterBackstory`；
- 额外特性：`Additional Features & Traits`、`Additional Features and Traits`、`AdditionalFeaturesTraits`。

外貌、年龄、身高、体重、盟友组织、徽记和宝藏等字段保持空白。

## 4. 法术页

### 页眉

| 模型字段 | 候选 PDF 字段 |
|---|---|
| 施法职业 | `Spellcasting Class 2`、`Spellcasting Class`、`SpellcastingClass` |
| 施法关键属性 | `SpellcastingAbility 2`、`Spellcasting Ability 2`、`SpellcastingAbility` |
| 法术豁免 DC | `SpellSaveDC 2`、`Spell Save DC 2`、`SpellSaveDC` |
| 法术攻击加值 | `SpellAtkBonus 2`、`Spell Attack Bonus 2`、`SpellAtkBonus` |

### 法术与法术位

- 戏法与 1～9 环名称字段均可能使用 `Spells <编号>`；禁止把编号首位直接解释为环级。
- 法术位总数候选字段：`SlotsTotal <环级>`、`Slots Total <环级>`、`SpellSlotsTotal <环级>`，同时作为各环名称区域的版面锚点。
- 同列法术名称字段按纵坐标从上到下排序；第一列一环锚点上方的名称字段属于戏法，其余字段归入同列上方最近的法术位锚点。
- 当前模型没有已消耗法术位，剩余法术位字段保持空白。
- 已准备法术勾选名称字段左侧最近的同页复选框；已知但未准备的法术不勾选。

## 5. 容量与诊断

- 固定攻击栏：3 项；额外攻击写入多行区。
- 物品、熟练、主要特性、额外特性和背景故事使用字符容量保护。
- 超出容量时返回 `content-truncated` warning。
- 必需字段缺失返回 `missing-template-field` error。
- 字段类型不符返回 `invalid-template-target` error。
- 导出存在 error 时不生成替换后的下载文件。
