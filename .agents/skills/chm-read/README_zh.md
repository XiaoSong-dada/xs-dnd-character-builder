# CHM 阅读技能

[![许可证: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/node.js-6DA55F?style=flat&logo=node.js&logoColor=white)](https://nodejs.org/)
[![技能](https://img.shields.io/badge/Skill-chm--reading-blue)](https://github.com/anomalyco/opencode)

一个用于以令牌高效方式读取和索引 Microsoft Compiled HTML Help (CHM) 文件的 AI 技能。

## 目录
- [功能](#功能)
- [安装](#安装)
- [使用方法](#使用方法)
- [核心概念](#核心概念)
- [高级使用](#高级使用)
- [要求](#要求)
- [许可证](#许可证)
- [支持](#支持)

## 功能

- 📚 **从 CHM 文件构建可搜索索引** 以实现高效检索
- 🔍 **定向搜索** 功能快速查找特定内容
- 📖 **目录浏览** 了解文档结构
- 💡 **令牌优化读取** - 仅提取相关部分为 Markdown 格式
- 🌐 **混合情报工作流** - 将 CHM 文档与网络搜索和代码分析相结合
- 🈳 **完整中文字符支持** - 自动处理 GBK/GB2312/UTF-8 编码
- ⚡ **高性能** - 使用工作线程每秒处理约 200 个部分
- 🛠️ **可扩展设计** - 模块化脚本便于自定义

## 安装

### 前置条件
- [Node.js](https://nodejs.org/) (v12 或更高版本)
- 7-Zip（用于 CHM 提取）

### 安装步骤
1. 将此技能放置在您的 OpenCode 技能目录中：
   ```
   ~/.opencode/skill/chm-reading/
   ```

2. 使用设置脚本安装依赖：
   ```powershell
   powershell -ExecutionPolicy Bypass -File scripts/setup.ps1
   ```

   此脚本将在未安装 7-Zip 时自动安装它。

## 使用方法

当您拥有 CHM 文件时，该技能将引导您完成以下工作流程：

### 1. 构建索引
反编译 CHM 并生成可搜索索引：
```bash
node scripts/main.js build "path/to/file.chm"
```
*输出：创建 `.chm_output/[filename]/` 目录，包含 `index.json` 和 `markdown/` 文件夹*

### 2. 浏览目录
查看可用章节以了解文档结构：
```bash
node scripts/main.js toc ".chm_output/[filename]/index.json"
```

### 3. 搜索内容
使用关键词查找相关章节：
```bash
node scripts/main.js search ".chm_output/[filename]/index.json" "您的查询"
```

### 4. 读取特定章节
检索章节的 Markdown 内容以回答问题：
```bash
node scripts/main.js read ".chm_output/[filename]/index.json" [section_id]
```

## 核心概念

### 先建索引后读取原则
避免读取整个 CHM 文件。而是：
1. 构建所有章节的 JSON 索引
2. 将章节转换为 Markdown 以实现有针对性的检索
3. 仅在需要时加载相关章节

这种方法在最小化令牌使用的同时保持高上下文精度。

### 混合情报工作流
作为 AI，将 CHM 文档与其他来源相结合：
- **优先使用 CHM**：针对特定版本的 API 参数、内部接口或难以找到的详细信息
- **结合网络搜索**：当 CHM 提及需要社区示例的一般概念时
- **交叉参考代码**：当 CHM 描述与您的源代码不匹配时

## 高级使用

### 性能优化
该工具使用 `worker_threads` 进行并行处理。大型文件（10k+ 章节）大约需要 1.5 分钟完成索引。

### 字符编码
自动检测和解码 GBK/GB2312/UTF-8 编码。如果出现乱码：
1. 验证 `jschardet` 对源 HTML 编码的检测
2. 确保终端具有适当的字体支持

### 错误预防
- 始终对包含空格或中文的路径使用引号
- 在依赖文档之前验证 CHM 版本的相关性
- 对于大于微小尺寸的文件，永不跳过索引构建

## 快速参考

| 命令 | 目的 | 何时使用 |
|------|------|----------|
| `build` | 反编译并创建索引 | 首次遇到 CHM 文件时 |
| `toc` | 显示目录 | 探索文档结构 |
| `search` | 按关键词查找内容 | 定位特定技术信息 |
| `read` | 获取章节的 Markdown | 准备回答问题前读取正文 |

## 脚本位置

所有核心脚本位于 `scripts/` 目录：
- `main.js` - 所有操作的入口点
- `chm_extractor.js` - 处理 CHM 反编译
- `index_builder.js` - 创建可搜索索引
- `reader.js` - 从索引读取内容
- `setup.ps1` - PowerShell 安装脚本

## 要求

- Node.js (v12+)
- 7-Zip（通过安装脚本安装）
- Windows 操作系统（用于 7-Zip COM 自动化）

## 许可证

此技能根据 MIT 许可证授权 - 请参阅 [LICENSE](LICENSE) 文件了解详情。

## 支持

如有问题、疑问或贡献：
1. 查看现有文档
2. 查看 `scripts/` 中的技能实现
3. 参考 [OpenCode 文档](https://opencode.ai)