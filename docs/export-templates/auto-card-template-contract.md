# 自动计算卡模板契约（2014 / 2024）

> 运行时文件：`app/public/templates/character-sheet-2014.xlsx`、`character-sheet-2024.xlsx`
> 源文件：`docs/export-templates/DND.5E.v4.4.5.xlsx`、`dnd5e2024.v1.3.xlsm`
> 生成脚本：`app/scripts/build-xlsx-templates.mjs`
> 映射数据：`app/scripts/xlsx-mappings/2014.json`、`2024.json`

## 1. 为什么不把模板放进 JS 包

模板合计约 1.8 MiB，且包含大量公式、隐藏表与查询数据。它们放在 `public/templates/`，只在导出时按需 fetch；不参与首屏、构建产物或 Service Worker 预缓存。离线使用需要用户主动在「关于本站 → 离线使用」下载。

## 2. 「字段映射」工作表

两张模板都追加了同名工作表，运行时由 `src/services/export-xlsx.ts` 直接读取其 XML：

| 列 | 内容 |
|---|---|
| A | 字段 Key（与 `buildAutoCardValues` 输出一致） |
| B | 工作表名 |
| C | 目标单元格（必须存在；合并单元格写左上角） |
| D | 说明 |
| E | 字段类型：`input` / `formula-cache` / `value` |
| F | 必需级别：`required` / `conditional` / `optional` |
| I1 | 模板版本（当前 4） |

- `input`：目标必须不是公式；写入文本、数字或布尔值；
- `formula-cache`：目标必须是公式；保留公式并写入缓存值；
- `value`：允许覆盖公式，用于无输入格但必须与页面一致的显示值（如 2014 最大生命值、2024 先攻/速度/最大生命值）；
- `required` 字段缺失会阻断导出；可选字段缺失跳过。

## 3. 修改模板的流程

1. 替换 `docs/export-templates/` 下的源文件；
2. 在 `app/scripts/xlsx-mappings/*.json` 调整 Key → 工作表/单元格；
3. 运行 `node scripts/build-xlsx-templates.mjs` 重新生成两张运行时模板；
4. 运行 `npx vitest run test/services/export-xlsx.test.ts`，确认映射版本、目标格与真实填充；
5. 若新增/删除模板文件，同步 `src/services/character-sheet-templates.ts`、`src/services/offline-assets.ts` 与 `vite.config.ts` 的 `/templates/` 缓存规则。

## 4. 2024 xlsm → xlsx

脚本会移除 `xl/vbaProject.bin`、`xl/activeX/*`、对应关系与 `[Content_Types].xml` 覆盖项，并把 workbook 内容类型改为普通 xlsx。这样既保留公式与版式，又避免宏安全提示和 ExcelJS 读取 `.xlsm` 时的长时间卡顿。

## 5. 已知限制

- 2024 自动卡暂不写入法术列表与法术位总数：该卡的「施法」页依赖 `法术大全` 行号与 VBA 辅助，直接改写名称会带入错误的法术元数据；导出时返回 warning，法术在卡内选择。
- 2014 自动卡的法术列表按名称写入，最多 30 条；模板自身的 `列表` 查询表负责显示环级与效果。
- 未做 Excel/WPS 人工打开验收；自动化只校验 OOXML 结构与写入值。
