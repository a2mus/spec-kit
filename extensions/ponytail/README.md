# Ponytail — Anti-Over-Engineering Extension

Forces the laziest solution that actually works. Channels a senior dev who
has seen every over-engineered codebase: question whether the task needs to
exist (YAGNI), reach for stdlib before custom code, native platform features
before dependencies, one line before fifty.

Adapted from [Ponytail](https://github.com/DietrichGebert/ponytail) by Dietrich Gebert (MIT).

## Overview

Ponytail integrates the anti-over-engineering philosophy into the Spec-Driven
Development workflow at three levels:

1. **Review** — After implementation, review the diff for unnecessary complexity.
2. **Audit** — Scan the entire repo for bloat, dead code, and speculative abstractions.
3. **Debt** — Track deliberate shortcuts marked with `ponytail:` comments so they
   don't silently rot into permanent technical debt.

## The Ladder

Before writing any code, stop at the first rung that holds:

1. **Does this need to exist at all?** → YAGNI, skip it.
2. **Stdlib does it?** → Use it.
3. **Native platform feature covers it?** → Use it.
4. **Already-installed dependency solves it?** → Use it. Never add a new one.
5. **Can it be one line?** → One line.
6. **Only then:** the minimum code that works.

## Commands

| Command | Description | Output |
|---------|-------------|--------|
| `speckit.ponytail.review` | Reviews a diff for over-engineering. One line per finding. | Inline report |
| `speckit.ponytail.audit` | Whole-repo audit for over-engineering. Ranked biggest cut first. | Inline report, optionally `.specify/ponytail-audit.md` |
| `speckit.ponytail.debt` | Harvests `ponytail:` comments into a debt ledger. | Inline report, optionally `PONYTAIL-DEBT.md` |

## Hooks

Ponytail registers two optional hooks in the SDD lifecycle:

| Hook | Event | Behavior |
|------|-------|----------|
| `speckit.ponytail.review` | `after_implement` | Prompts to review the implementation diff for over-engineering. |
| `speckit.ponytail.review` | `after_specify` | Prompts to YAGNI-check the generated spec for speculative features. |

Both hooks are **optional** — the user is prompted before they run. To
auto-run without prompting, set `auto_review: true` in the config.

## Configuration

In `.specify/extensions/ponytail/ponytail-config.yml`:

```yaml
# Intensity level: "lite", "full" (default), or "ultra"
intensity: full

# Auto-run review after implementation (false = prompt user)
auto_review: true
```

### Intensity Levels

| Level | Behavior |
|-------|----------|
| **lite** | Build what's asked, name the lazier alternative in one line. User picks. |
| **full** | The ladder enforced. Stdlib and native first. Shortest diff, shortest explanation. Default. |
| **ultra** | YAGNI extremist. Deletion before addition. Challenge the requirement itself. |

## The `ponytail:` Comment Convention

Deliberate shortcuts are marked with a `ponytail:` comment that names the
ceiling (the known limit) and the upgrade path (when to revisit):

```python
# ponytail: global lock, per-account locks if throughput matters
```

```javascript
// ponytail: O(n²) scan, switch to indexed lookup if list > 1000
```

Run `speckit.ponytail.debt` to collect all markers into a debt ledger.

## When NOT to Be Lazy

Ponytail never simplifies away:
- Input validation at trust boundaries (API endpoints, user input, file parsing)
- Error handling that prevents data loss
- Security measures (auth, authz, sanitization, secrets handling)
- Accessibility basics
- Anything explicitly requested by the user
- Self-checks (assert-based demos, test files) — these are the ponytail minimum

## Installation

```bash
# Install the bundled ponytail extension (no network required)
specify extension add ponytail
```

## Disabling

```bash
# Disable the ponytail extension
specify extension disable ponytail
```

## Measured Impact

The original Ponytail benchmarks (5 everyday tasks, 3 models) showed:
- **80–94%** fewer lines of code
- **47–77%** lower cost
- **3–6×** faster execution
- **100% safe** (validation/security/accessibility never cut)

Source: [Ponytail benchmarks](https://github.com/DietrichGebert/ponytail#benchmarks)

## License

MIT — same as the original Ponytail project.
