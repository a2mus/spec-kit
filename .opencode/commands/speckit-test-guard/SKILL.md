---
name: test-guard
description: Always-active quality guard rule. Adapted from amElnagdy/guard-skills (MIT).
alwaysApply: true
---

# Test Guard — Always-Active Rules

These rules apply to **every test you write, edit, or review**. They are the quality gate that prevents AI-generated test bloat. Enforce them after the first test-writing pass and before tests are presented, committed, or merged.

These rules exist because coding agents over-generate tests. The common failure modes: mock-heavy unit tests that assert implementation details, near-duplicate test bodies that differ by one value, and tests that re-verify the framework instead of the project's logic. Each looks productive in a diff and costs maintenance forever.

## Adapt to the Project First

1. Check the project's own agent instructions and testing docs. Project-specific testing rules win over these rules when they conflict.
2. Identify the test stack, then read the matching reference for concrete patterns:
   - Python / pytest → [references/pytest.md](references/pytest.md)
   - PHP / PHPUnit / Pest / WordPress → [references/phpunit.md](references/phpunit.md)
   - JavaScript / TypeScript / Jest / Vitest → [references/jest.md](references/jest.md)
3. If the project calls LLM APIs, uses agent frameworks, or wires up observability/telemetry, also read [references/llm-app-testing.md](references/llm-app-testing.md) — it adds three rules specific to LLM applications.
4. Map the project's system boundaries: network calls, databases, filesystem, clock and randomness, third-party SDKs, LLM APIs.

## The Nine Rules

### Rule 1: Test behavior, not implementation
Test what code does from the caller's perspective. Assert return values and observable side effects. Never assert that an internal helper was called with specific arguments — that test breaks on every refactor while catching nothing.

**Violation pattern:** asserting a mock of an internal function was called, where that function is not a system boundary.
**Fix:** assert the return value or the state change the caller observes.

### Rule 2: Every mock must be justified
Mock only at system boundaries: network and HTTP calls, LLM APIs, databases, filesystem I/O, clock and randomness, third-party SDKs. Never mock internal classes or helper functions to isolate a "unit."

When you mock a boundary, assert what the caller *does with the response*, not that the mock received specific arguments.

### Rule 3: One scenario per test, data-driven for variants
If two or more tests share identical setup and differ only in input/output values, merge them into one data-driven test (`@pytest.mark.parametrize`, PHPUnit `#[DataProvider]`, Jest `test.each`).

**When separate tests ARE correct:** different setup, different assertions, different mock configurations, or genuinely different scenarios.

### Rule 4: Every test must justify its existence
Ask: "What bug does this catch that no other test catches?" Delete tests that only catch typos, verify default values of data classes, or test trivial pass-through logic.

**Common unjustified tests:** constructors setting attributes, a function rejecting input the type system already forbids, string formatting of log messages, a constant equaling its literal value.

### Rule 5: Name tests for the scenario
Pattern: `test_<scenario>_<expected_outcome>`. The name should read like a requirement, not echo the function signature.

| Bad | Good |
|-----|------|
| `test_parse_response_missing_field` | `test_malformed_response_falls_back_to_default` |
| `test_get_language_no_class` | `test_element_without_class_returns_empty_language` |
| `test_add_tags_single_string` | `test_single_tag_normalizes_to_list` |

### Rule 6: Production regression tests are sacred
Tests that reproduce a real production bug are always justified. Reference the incident in the name or a comment, and never delete them. They are exempt from Rule 4.

### Rule 7: No tests for framework guarantees
Don't test that the validation library validates, the ORM commits, the router returns 404, or the test framework's fixtures work. Test *your* logic that sits on top of the framework.

**Violation pattern:** a test that would still pass if you deleted all the project's custom code.

### Rule 8: State and value objects are real, never mocked
Never mock a data model, DTO, entity, or state object. Construct a real instance. Mocking state hides field-name typos and validation errors. If constructing the real object is painful, add a builder or factory helper.

### Rule 9: Infrastructure under test gets real infrastructure
When database queries, schema behavior, or persistence logic *is the subject* of the test, run against a real test database with real migrations applied. Mocking the session there tests nothing. Mocking the database is fine when persistence is only a side effect.

## Severity Guide

- **Must fix:** Rules 1, 2, 8 — these hide real bugs or make tests brittle
- **Should fix:** Rules 3, 4, 5, 7 — these cause bloat and maintenance drag
- **Sacred:** Rule 6 — never delete, always allow
- **Worth noting:** Rule 9 — flag it, but don't block small changes on it

## Reporting Format

When flagging violations:

```
**Rule N violation** in `tests/path/file.ext::<test_name>`
- What: <one sentence describing the violation>
- Fix: <one sentence describing what to do instead>
```

## References

- [references/pytest.md](references/pytest.md) — Python/pytest patterns: parametrize, fixtures, mock boundaries
- [references/phpunit.md](references/phpunit.md) — PHP/PHPUnit/Pest patterns, including WordPress and WooCommerce
- [references/jest.md](references/jest.md) — Jest/Vitest patterns: test.each, module mocks, msw, snapshots
- [references/llm-app-testing.md](references/llm-app-testing.md) — three extra rules for LLM applications
