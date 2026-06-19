---
description: "Harvest every ponytail: comment into a debt ledger so deferred shortcuts get tracked"
---

# Ponytail Debt

Harvest every `ponytail:` comment in the codebase into a debt ledger, so
deliberate shortcuts and deferrals get tracked instead of rotting into
"later means never". One-shot report, changes nothing.

Adapted from [Ponytail](https://github.com/DietrichGebert/ponytail) (MIT).

## User Input

```text
$ARGUMENTS
```

You **MUST** consider the user input before proceeding (if not empty).

## The Convention

Every deliberate ponytail shortcut is marked with a `ponytail:` comment naming
its ceiling and upgrade path:

```python
# ponytail: global lock, per-account locks if throughput matters
```

```javascript
// ponytail: O(n²) scan, switch to indexed lookup if list > 1000
```

```python
# ponytail: hardcoded timeout, make configurable when 2nd caller needs different value
```

## Scan

Grep the repo for comment markers, skipping `node_modules`, `.git`,
`__pycache__`, `.venv`, `venv`, `dist`, `build`, `.specify`:

```bash
grep -rnE '(#|//) ?ponytail:' . \
  --exclude-dir=node_modules \
  --exclude-dir=.git \
  --exclude-dir=__pycache__ \
  --exclude-dir=.venv \
  --exclude-dir=venv \
  --exclude-dir=dist \
  --exclude-dir=build \
  --exclude-dir=.specify
```

Each hit is one ledger row. The comment prefix keeps prose that merely mentions
the convention out of the ledger.

## Output

One row per marker, grouped by file:

```
<file>:<line>, <what was simplified>. ceiling: <the limit named>. upgrade: <the trigger to revisit>.
```

### Rot Detection

Flag any `ponytail:` comment that names no upgrade path or trigger with
`⚠ no-trigger`. Those are the ones that silently rot.

### Blame (optional)

Want an owner per row? Run `git blame`:
```bash
git blame -L<line>,<line> <file> --porcelain | head -5
```

## End Format

```
<N> markers, <M> with no trigger.
```

Nothing found:

```
No ponytail: debt. Clean ledger.
```

## Execution

1. Run the grep command above across the project.
2. For each hit, extract: file, line number, what was simplified, the ceiling, and the upgrade trigger.
3. Group by file, output one row per marker.
4. Flag markers with no upgrade path as `⚠ no-trigger`.
5. End with the summary count.
6. Do NOT modify any files — report only.
7. If the user asks to persist it, write the ledger to `PONYTAIL-DEBT.md` at the repo root.
