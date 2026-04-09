---
name: speckit-code-review
description: Comprehensive security and quality review of uncommitted changes.
compatibility: Requires spec-kit project structure with .specify/ directory
metadata:
  author: github-spec-kit
  source: templates/commands/code-review.md
---

# Speckit Code-Review Skill

> [!IMPORTANT]
> **Leverage Project Skills**: Before performing any task, scan the project's available skills (typically in `.agent/skills/` or equivalent agent-specific skill directories). If a skill exists that is relevant to the work at hand, read its `SKILL.md` and follow its instructions to complete the task. Only fall back to your own general knowledge when no applicable skill is available or when the task is straightforward enough that a skill lookup would be unnecessary.


# Code Review

Comprehensive security and quality review of uncommitted changes:

1. Look at the the diffs or uncommitted changes.

2. For each changed file, check for:

**Security Issues (CRITICAL):**
- Hardcoded credentials, API keys, tokens
- SQL injection vulnerabilities
- XSS vulnerabilities  
- Missing input validation
- Insecure dependencies
- Path traversal risks

**Code Quality (HIGH):**
- Functions > 50 lines
- Files > 800 lines
- Nesting depth > 4 levels
- Missing error handling
- console.log statements
- TODO/FIXME comments
- Missing JSDoc for public APIs

**Best Practices (MEDIUM):**
- Mutation patterns (use immutable instead)
- Emoji usage in code/comments
- Missing tests for new code
- Accessibility issues (a11y)

3. Generate a Markdown report with:
   - Severity: CRITICAL, HIGH, MEDIUM, LOW
   - File location and line numbers
   - Issue description
   - Suggested fix

4. Fix CRITICAL or HIGH issues found immediately.
Never approve code with security vulnerabilities!
