# PDF 模板瘦身需求

> 状态：已实施（v0.4.1）  
> 目标资产：`app/public/templates/character-sheet-zh-plus.pdf`（运行时模板，1,307,698 字节，约 1.25MiB）  
> 源文件底稿：`docs/export-templates/DND_5E_2014_国内5E术语版角色卡_最终版.pdf`（46,112,941 字节，只读基线）  
> 适用规则集：D&D 5e 2014  
> 本文只定义 PDF 模板瘦身，不改导出代码逻辑、不改 XLSX/JSON 导出、不改规则计算。

## 1. 背景与问题

### 1.1 现象

- 本地（dev server）导出 PDF 很快；线上每次点击导出 PDF 等待约 1 分钟；导出 Excel 无此问题。
- 已在线上浏览器 DevTools 核实：`/templates/` 响应头无 `Cache-Control`；耗时全部落在 `character-sheet-zh-plus.pdf` 模板下载上。
- 已确认下载链路：导出时 `buildCharacterSheetPdf()` 每次 `fetch` 模板（46MB）+ 字体（2MB），模板大小是慢的唯一主因；Excel 模板仅 51KB，因此导出 Excel 快。

### 1.2 根因

运行时模板 `character-sheet-zh-plus.pdf` 约 46MB，内嵌 13 个 `FontFile2` + 5 个 `FontFile3` 完整 CJK 字体（Microsoft JhengHei、Noto Sans CJK、Adobe Ming Std 等）。浏览器每次导出都要从服务器全量下载 46MB，受线上服务器出网带宽限制（约 3～10Mbps 时需 40 秒～2 分钟），本地回环网络掩盖了该问题。

## 2. 目标

1. 运行时 PDF 模板体积从 46MB 降到 5MB 以内（实测约 1.25MiB，接近 1MB 理想值）；
2. 模板页面静态内容（表头、标签、装饰文字，含中文）在常见 PDF 阅读器和打印中显示与瘦身前一致，不得出现乱码、方框字；
3. 导出行为完全不变：三页 AcroForm 字段名、字段类型、坐标、多行属性、复选框开启值、页序均不得改变；
4. 线上导出等待时间从约 1 分钟降到秒级；
5. 附带收益：瘦身模板内嵌字体会被导出流程引用，导出成品 PDF 体积应从 40MB+ 显著下降（目标 ≤ 5MB，以实测为准）；
6. 不修改任何导出业务代码（`src/services/export-pdf.ts`、hooks、测试夹具逻辑等），只替换静态模板资产；如需代码配合，单独评估。

## 3. 已核验现状

### 3.1 模板构成

- `character-sheet-zh-plus.pdf`：约 46MB，3 页，AcroForm 表单；
- 内嵌字体：13 个 `FontFile2` + 5 个 `FontFile3`，包含微软雅黑（Microsoft JhengHei）、Noto Sans CJK、Adobe Ming Std、Scala Sans、Interstate 等；
- 模板中的表单字段外观与页面静态文本均引用这些内嵌字体。

### 3.2 导出链路对模板字体的依赖

- `fillPdfTemplate()` 会 `embedFont(noto-sans-sc-subset.ttf, 2MB)`，并经 `form.updateFieldAppearances(font)` 用该子集字体重写**所有表单字段**的外观流；
- 因此**表单字段外观不依赖模板内嵌字体**，模板内嵌字体只服务于**页面静态文本**；
- `flatten()` 后表单字段被拍平，旧字体对象若不再被任何内容引用，pdf-lib `save()` 不做孤儿对象回收，模板内嵌字体仍会原样保留在导出成品中（需实测确认，这正是成品 40MB+ 的预期来源）。

### 3.3 直接删除字体不可行

页面静态文本（含中文标签）仍引用内嵌字体，直接删除字体对象会导致静态中文在阅读器中回退为默认字体、出现乱码或方框字。**必须采用子集化/压缩而非删除**。

### 3.4 现有回归保护

- `app/test/services/export-pdf.test.ts`：模板三页结构、必需字段、中文排版、宝物换行、战士/法师样例填充、扁平化、字段类型识别、容量警告；
- `app/test/features/character-export/golden-export.test.ts`：黄金样例（戏法、法术位、准备标记、关键内容）；
- `inspectPdfSpellTemplate()` 可对比瘦身前后法术页字段映射（slotSuffixes、capacities、unassignedFieldNames）。

## 4. 方案

### 4.1 已采用：保留 GID 的字体子集化 + 对象流压缩

使用 `app/scripts/optimize-pdf-template.py`，固定依赖见 `app/scripts/requirements-pdf-template.txt`。模板的三个大型 Type0 字体采用 `Identity-H` 编码，脚本从页面内容流收集实际使用的双字节 GID，以 fonttools 的 `retain_gids` 模式生成子集，再由 pikepdf 替换字体流并压缩对象。该方式不重写页面内容、字段树、Widget、宽度或 ToUnicode 映射。

实测三个字体分别由 16,467,712 / 17,032,596 / 16,467,712 字节缩减为 776,788 / 775,896 / 770,564 字节；最终运行时模板为 1,307,698 字节。三页 120 DPI PNG 与原始底稿逐像素一致。

代表性成品实测：战士 2,779,284 字节，法师 2,779,607 字节，均无导出诊断并低于 5MiB 门槛。

复现命令（在 `app` 目录安装脚本依赖后执行）：

```powershell
python -m pip install -r scripts/requirements-pdf-template.txt
python scripts/optimize-pdf-template.py ../docs/export-templates/DND_5E_2014_国内5E术语版角色卡_最终版.pdf public/templates/character-sheet-zh-plus.pdf
```

### 4.2 原候选与回退原则

用 PDF 工具对模板做一次离线瘦身，保留静态文本实际用到的字形，丢弃未用字形与未引用对象：

1. 工具候选（按优先级验证）：
   - **Ghostscript**：`gs -o out.pdf -sDEVICE=pdfwrite -dSubsetFonts=true -dCompressFonts=true -dDetectDuplicateImages=true in.pdf`。最快，自动子集化并压缩；**必须验证其输出对 AcroForm 字段名、坐标、类型、多行属性、复选框开启值无破坏**（现有测试可覆盖）；
   - **fonttools + pikepdf**：若 Ghostscript 破坏表单结构则用此方案，逐字体子集化并回填 `FontFile`，对象结构保留最完整，工作量较大；
   - qpdf：仅做对象清理/压缩的辅助手段，不能单独完成子集化。
2. 验证工具输出后再锁定方案，禁止未经测试直接替换资产。

### 4.3 不采用

- 直接删除全部内嵌字体（破坏静态中文显示，见 3.3）；
- 重建模板（无可编辑源文件，成本高且偏离"只瘦身"目标）；
- 改导出代码绕开模板（超出本需求范围，另立需求评估）。

## 5. 范围

### 5.1 本期范围

- 生成瘦身后的运行时模板，替换 `app/public/templates/character-sheet-zh-plus.pdf`；
- 用现有自动化测试 + 字段映射对比验证瘦身模板兼容性；
- 记录瘦身工具、参数与前后体积对比到本文档/CHANGELOG。

### 5.2 非目标

- 不修改 `src/services/export-pdf.ts`、`export-xlsx.ts` 及任何业务代码；
- 不修改 XLSX、JSON 导出；
- 不修改 nginx 缓存策略（瘦身后模板降至百 KB 级，每次下载已无感；`/templates/` 缓存头作为可选后续项，见 §9）；
- 不改规则计算、不改字段映射版本号（模板字段结构未变，`CHARACTER_SHEET_PDF_MAPPING_VERSION = 6` 保持不变）；
- 不改动 `docs/export-templates/` 下的源文件底稿。

## 6. 功能需求

### R1 模板瘦身

1. 瘦身后模板 ≤ 5MB（实测 1,307,698 字节）；
2. 页数仍为 3，页面尺寸、页序、静态版式与瘦身前一致；
3. 静态文本（含中文）显示正常，无乱码、方框字、缺字；
4. AcroForm 字段集合不变：字段名（含尾随空格、重复名）、类型（文本/复选框）、坐标、多行属性、复选框开启值均与瘦身前一致；
5. 模板无 XFA 或 XFA 可被现有 `form.hasXFA()/deleteXFA()` 正常处理。

### R2 导出行为不回归

1. 用瘦身模板执行 `fillPdfTemplate()` 全链路：战士、法师黄金样例输出与瘦身前一致（字段值、复选框、页序、扁平化）；
2. `inspectPdfSpellTemplate()` 输出（slotSuffixes、capacities、unassignedFieldNames）与瘦身前一致；
3. 导出诊断集合不新增 error/warning；
4. 导出成品 PDF 仍为 3 页、可被 pdf-lib 重新加载。

### R3 产物体积

1. 导出成品 PDF 体积显著下降（46MB 级 → 目标 ≤ 5MB，以实测为准）；
2. 记录瘦身前/后模板与成品体积对比数据。

## 7. 测试与验收

### 7.1 自动化验收

1. 替换模板后 `pnpm test`（含 `export-pdf.test.ts`、`golden-export.test.ts`）全部通过；
2. 类型检查通过；`pnpm build` 通过，且 `dist/templates/character-sheet-zh-plus.pdf` 为瘦身文件（≤ 1MB）；
3. 字段映射对比脚本/测试确认字段集合无变化；
4. 现有 XLSX、JSON 导出测试不回归。

### 7.2 人工验收（由用户完成）

1. 瘦身模板直接打开：静态中文与英文版式无缺字、无方框；
2. 分别导出 4 级战士、3 级法师样例：三页卡面字段无错位，中文无乱码，复选框正确；
3. 线上部署后点击导出 PDF，等待时间从约 1 分钟降到秒级（DevTools Network 确认模板 Transfer Size 为百 KB 级）；
4. 导出成品 PDF 在 Chrome/Edge 内置阅读器与一个独立 PDF 阅读器中打开、打印预览正常。

## 8. 发布门槛

1. §7.1 自动化验收全部通过；
2. 用户完成 §7.2 人工验收；
3. 瘦身工具与参数、体积对比已记录；
4. 同步更新 `docs/rules.md` 第 11、125 行中 PDF 模板描述（如注明模板已瘦身、内嵌字体子集化），并更新 `CHANGELOG.md` 与 `app/package.json` 版本号（遵循 AGENTS.md 修改流程第 8 条，如版本记录有变更）。

## 9. 可选后续项（本期不实施）

- nginx 为 `/templates/` 配置 `Cache-Control`（模板文件名带版本指纹时可用 `immutable` 长缓存），进一步避免重复下载；
- 若后续模板体积重新变大，再评估 Service Worker 预取或构建期模板内联。

## 10. 已确认结论

1. 使用 fonttools + pikepdf 原位子集化；Ghostscript 不直接处理 AcroForm 模板；
2. 覆盖现有运行时文件名，导出代码与映射版本不变；
3. 以 ≤ 5MB 为发布硬门槛，≤ 1MB 为理想值；当前实测约 1.25MiB；
4. 静态字体仅保留模板当前实际使用的字形，模板未覆盖字符不属本需求范围。
