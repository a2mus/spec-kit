# Universal Development Rules

The following rules apply to all Spec Kit projects across any language or framework.

## 1. Coding Style & Immutability (CRITICAL)
- **MANY SMALL FILES > FEW LARGE FILES**: Maintain high cohesion and low coupling.
- **NEVER MUTATE**: ALWAYS create new objects, NEVER mutate existing ones (e.g. return a copy with the change rather than modifying in-place). Immutable data prevents hidden side effects.
- **Fail Fast**: Validate all user input at system boundaries. Never trust external data.
- **Error Handling**: Handle errors explicitly at every level; never silently swallow them.

## 2. Testing Requirements (80%+ Coverage)
- **TDD Workflow is Mandatory**: 
    1. Write a failing test first (RED)
    2. Write minimal implementation (GREEN)
    3. Improve code quality (REFACTOR)
- **Coverage**: Aim for 80% minimum coverage on all code, and 100% on critical business logic.
- **Test Types**: Rely on Unit Tests for logic, Integration Tests for components/API, and E2E tests for user flows.

## 3. Security Guidelines
- **No Secrets in Code**: NEVER hardcode API keys, passwords, or tokens. Use environment variables.
- **Injection Prevention**: Always parameterize SQL queries and escape shell inputs.
- **XSS & CSRF Prevention**: Sanitize all rendered HTML and enforce CSRF tokens.
- **Access Control**: Enforce explicit authentication and authorization on every protected route.

## 4. Code Quality Gate Checklist
Before committing or marking tasks complete, ensure:
- [ ] Code is readable, well-named, and relies on immutable patterns.
- [ ] Functions are small (<50 lines) and files are focused (<800 lines).
- [ ] No deep nesting (>4 levels of indentation).
- [ ] All errors are explicitly handled and logged.
- [ ] All tests are passing and coverage >= 80%.
- [ ] Zero exposed secrets or security vulnerabilities.
