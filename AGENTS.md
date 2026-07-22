# 工作区入口约定

本文件适用于整个 `dnd-character-builder` 项目。

## 强制技能调用

- 在理解或澄清需求、设计方案、阅读或修改代码、诊断缺陷、编写测试、审查代码或更新项目文档之前，必须首先完整读取并使用 [`.agents/skills/programming-understanding/SKILL.md`](.agents/skills/programming-understanding/SKILL.md)。
- `programming-understanding` 必须自动触发，不需要用户显式点名。
- 如果任务还匹配其他专项技能，应同时遵循专项技能；由 `programming-understanding` 负责明确目标、范围、实施步骤和验证标准。
- 纯聊天且不涉及项目需求、代码、规则、文档或实现决策时，可以不调用该技能。

## 详细项目约定

完成强制技能调用后，继续读取并遵守 [`.agents/AGENTS.md`](.agents/AGENTS.md)，其中包含项目目标、规则边界、技术栈、目录、移动端、测试、版权和 Git 约定。
