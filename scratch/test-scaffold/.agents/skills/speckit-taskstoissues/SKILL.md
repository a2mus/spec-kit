---
name: speckit-taskstoissues
description: Convert tasks from tasks.md into GitHub issues. Use after task breakdown
  to track work items in GitHub project management.
compatibility: Requires spec-kit project structure with .specify/ directory
metadata:
  author: github-spec-kit
  source: templates/commands/taskstoissues.md
---

# Speckit Taskstoissues Skill

> [!IMPORTANT]
> **Leverage Project Skills**: Before performing any task, scan the project's available skills (typically in `.agent/skills/` or equivalent agent-specific skill directories). If a skill exists that is relevant to the work at hand, read its `SKILL.md` and follow its instructions to complete the task. Only fall back to your own general knowledge when no applicable skill is available or when the task is straightforward enough that a skill lookup would be unnecessary.


## User Input

```text
$ARGUMENTS
```

You **MUST** consider the user input before proceeding (if not empty).

## Outline

1. Run `.specify.specify/scripts/powershell/check-prerequisites.ps1 -Json -RequireTasks -IncludeTasks` from repo root and parse FEATURE_DIR and AVAILABLE_DOCS list. All paths must be absolute. For single quotes in args like "I'm Groot", use escape syntax: e.g 'I'\''m Groot' (or double-quote if possible: "I'm Groot").
1. From the executed script, extract the path to **tasks**.
1. Get the Git remote by running:

```bash
git config --get remote.origin.url
```

> [!CAUTION]
> ONLY PROCEED TO NEXT STEPS IF THE REMOTE IS A GITHUB URL

1. For each task in the list, use the GitHub MCP server to create a new issue in the repository that is representative of the Git remote.

> [!CAUTION]
> UNDER NO CIRCUMSTANCES EVER CREATE ISSUES IN REPOSITORIES THAT DO NOT MATCH THE REMOTE URL
