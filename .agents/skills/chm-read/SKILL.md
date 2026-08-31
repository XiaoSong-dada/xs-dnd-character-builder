---
name: chm-reading
description: Use when the user provides a CHM help file and wants to read its content, search for information, or perform Q&A.
---

# CHM Reading Skill

## Overview
This skill provides a complete toolset for progressively reading and indexing Microsoft Compiled HTML Help (CHM) files. It allows the AI to extract relevant sections as Markdown, minimizing token usage while maintaining high context precision.

## Core Principle
**Index First, Read Later**: Avoid reading the entire CHM. Instead, build a JSON index and convert chapters to Markdown for targeted retrieval.

## When to Use
- When a user uploads or references a `.chm` file.
- When you need to answer technical questions based on a large CHM manual.
- When you need to provide a table of contents or search functionality for help documentation.

## Implementation Details

The skill is powered by a Node.js toolset located in `scripts/`.

### 1. Environment Setup
If Node.js or dependencies are missing, run the setup script:
```powershell
powershell -ExecutionPolicy Bypass -File scripts/setup.ps1
```

### 2. Standard Workflow

#### Step A: Build Index
Decompile the CHM and generate a JSON index + Markdown chapters.
```bash
node scripts/main.js build "path/to/file.chm"
```
*Note: This generates an `.chm_output/[filename]/` directory containing `index.json` and a `markdown/` folder.*

#### Step B: Explore Table of Contents
View available chapters to understand the document structure.
```bash
node scripts/main.js toc ".chm_output/[filename]/index.json"
```

#### Step C: Targeted Search
Find relevant sections based on keywords.
```bash
node scripts/main.js search ".chm_output/[filename]/index.json" "your query"
```

#### Step D: Read Content (Token Efficiency)
Retrieve the Markdown content of a specific section ID to answer questions.
```bash
node scripts/main.js read ".chm_output/[filename]/index.json" [section_id]
```

## Core Patterns

### Performance Optimization
The tool uses `worker_threads` for parallel processing. It can handle ~200 sections per second. Large files (10k+ sections) take about 1.5 minutes.

### Chinese Character Support
The tool automatically detects and decodes GBK/GB2312/UTF-8 encodings. If you see garbled text, ensure the source HTML files are correctly detected by `jschardet`.

## Common Errors and Prevention
- **Path Garbling**: If the extraction path contains spaces or Chinese characters, be sure to enclose it in quotes.
- **Over-reliance on Outdated Documentation**: CHM files may be several years old, so be sure to verify the version and, if necessary, validate effectiveness through web search.
- **Skipping Index Building**: Unless the file is extremely small, strictly avoid reading the entire extracted directory directly; you must first `build` the index to save tokens.

## Quick Reference Table

| Command | Purpose | Trigger Scenario |
|---------|---------|------------------|
| `build` | Decompile and create index | When first encountering this CHM |
| `toc`   | Show table of contents | Exploring document structure/keyword positioning |
| `search`| Keyword search | Looking for specific technical points |
| `read`  | Get Markdown | Before answering questions, read the main text |

## Script Location
All core scripts are located at: `C:\Users\kingdee\.gemini\antigravity\skills\chm-reading\scripts\`
Example usage:
```bash
node C:\Users\kingdee\.gemini\antigravity\skills\chm-reading\scripts\main.js build "C:\docs\manual.chm"
```
