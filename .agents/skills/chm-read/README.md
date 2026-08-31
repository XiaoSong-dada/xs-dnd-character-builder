# CHM Reading Skill

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/node.js-6DA55F?style=flat&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Skill](https://img.shields.io/badge/Skill-chm--reading-blue)](https://github.com/anomalyco/opencode)

An AI skill for reading and indexing Microsoft Compiled HTML Help (CHM) files with token-efficient processing.

## Table of Contents
- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
- [Core Concepts](#core-concepts)
- [Advanced Usage](#advanced-usage)
- [Requirements](#requirements)
- [License](#license)
- [Support](#support)

## Features

- 📚 **Build searchable index** from CHM files for efficient retrieval
- 🔍 **Targeted search** functionality to find specific content quickly
- 📖 **Table of contents browsing** to understand document structure
- 💡 **Token-optimized reading** - extracts only relevant sections as Markdown
- 🌐 **Hybrid intelligence workflow** - combines CHM documentation with web search and code analysis
- 🈳 **Full Chinese character support** - handles GBK/GB2312/UTF-8 encodings automatically
- ⚡ **High performance** - processes ~200 sections per second using worker threads
- 🛠️ **Extensible design** - modular scripts for easy customization

## Installation

### Prerequisites
- [Node.js](https://nodejs.org/) (v12 or higher)
- 7-Zip (for CHM extraction)

### Setup
1. Place this skill in your OpenCode skills directory:
   ```
   ~/.opencode/skill/chm-reading/
   ```

2. Install dependencies using the setup script:
   ```powershell
   powershell -ExecutionPolicy Bypass -File scripts/setup.ps1
   ```

   This will automatically install 7-Zip if not present.

## Usage

When you have a CHM file, the skill will guide you through this workflow:

### 1. Build Index
Decompile the CHM and generate a searchable index:
```bash
node scripts/main.js build "path/to/file.chm"
```
*Output: Creates `.chm_output/[filename]/` directory with `index.json` and `markdown/` folder*

### 2. Explore Table of Contents
View available chapters to understand document structure:
```bash
node scripts/main.js toc ".chm_output/[filename]/index.json"
```

### 3. Search Content
Find relevant sections using keywords:
```bash
node scripts/main.js search ".chm_output/[filename]/index.json" "your query"
```

### 4. Read Specific Section
Retrieve Markdown content of a section to answer questions:
```bash
node scripts/main.js read ".chm_output/[filename]/index.json" [section_id]
```

## Core Concepts

### Index First, Read Later Principle
Avoid reading entire CHM files. Instead:
1. Build a JSON index of all sections
2. Convert chapters to Markdown for targeted retrieval
3. Only load relevant sections when needed

This approach minimizes token usage while maintaining high context precision.

### Hybrid Intelligence Workflow
As an AI, combine CHM documentation with other sources:
- **Prioritize CHM**: For version-specific API parameters, internal interfaces, or hard-to-find details
- **Combine with web search**: When CHM mentions general concepts needing community examples
- **Cross-reference with code**: When CHM descriptions don't match your source code

## Advanced Usage

### Performance Optimization
The tool uses `worker_threads` for parallel processing. Large files (10k+ sections) take approximately 1.5 minutes to index.

### Character Encoding
Automatic detection and decoding of GBK/GB2312/UTF-8 encodings. If you see garbled text:
1. Verify source HTML encoding detection by `jschardet`
2. Ensure proper font support in your terminal

### Error Prevention
- Always quote paths containing spaces or Chinese characters
- Verify CHM version relevance before relying on documentation
- Never skip index building for files larger than trivial size

## Quick Reference

| Command | Purpose | When to Use |
|---------|---------|-------------|
| `build` | Decompile and create index | First encounter with CHM file |
| `toc` | Show table of contents | Exploring document structure |
| `search` | Find content by keywords | Locating specific technical information |
| `read` | Get section as Markdown | Preparing to answer questions |

## Scripts Location

All core scripts are in `scripts/`:
- `main.js` - Entry point for all operations
- `chm_extractor.js` - Handles CHM decompilation
- `index_builder.js` - Creates searchable index
- `reader.js` - Reads content from index
- `setup.ps1` - PowerShell setup script

## Requirements

- Node.js (v12+)
- 7-Zip (installed via setup script)
- Windows OS (for 7-Zip COM automation)

## License

This skill is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For issues, questions, or contributions:
1. Check the existing documentation
2. Review the skill implementation in `scripts/`
3. Consult the [OpenCode documentation](https://opencode.ai)