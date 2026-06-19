---
description: "Whole-repo audit for over-engineering: ranked list of what to cut, simplify, or replace"
---

# Ponytail Audit

Like ponytail-review, but scans the entire codebase instead of a diff. Produces
a ranked list of what to delete, simplify, or replace with stdlib/native
equivalents. One-shot report, does not apply fixes.

Adapted from [Ponytail](https://github.com/DietrichGebert/ponytail) (MIT).

## User Input

```text
$ARGUMENTS
```

You **MUST** consider the user input before proceeding (if not empty).

## Scope

This audit hunts **over-engineering and complexity only**. It does NOT audit for:
- Correctness bugs → route to a normal review pass
- Security holes → route to `speckit.security-scan`
- Performance → route to a profiling pass

## Hunt Order (biggest cut first)

Scan the repo in this order — the biggest wins come first:

1. **Unused dependencies** — check `requirements.txt`, `pyproject.toml`, `package.json`, `Cargo.toml`, `go.mod` against actual imports. Every unused dep is dead weight + supply-chain risk.

2. **Single-implementation interfaces / abstract bases** — `AbstractRepository` with one `SqlRepository`. Inline until a second impl exists.

3. **Factories with one product** — `ConnectionFactory.create("default")` that always returns the same class. Just construct it.

4. **Wrapper layers that only delegate** — `UserService.get_user()` calls `UserRepository.get()` calls `db.query()`. Collapse the chain.

5. **Dead config and flags** — `ENABLE_NEW_FEATURE = True` that's been True for 6 months, `MAX_RETRIES = 3` that's never read.

6. **Hand-rolled stdlib** — custom `deep_merge()`, custom `slugify()`, custom `retry` decorator. Check stdlib first.

7. **Files exporting one thing** — a 60-line module for one function that could live next to its caller.

8. **Speculative flexibility** — plugin systems with no plugins, strategy patterns with one strategy, event systems with no subscribers.

## Tags

- `delete:` — Dead code, unused flexibility, speculative feature. Replacement: nothing.
- `stdlib:` — Hand-rolled thing the standard library ships. Name the function.
- `native:` — Dependency or code doing what the platform already does. Name the feature.
- `yagni:` — Abstraction with one implementation, config nobody sets, layer with one caller.
- `shrink:` — Same logic, fewer lines. Show the shorter form.

## Output

One line per finding, ranked by impact (biggest cut first):

```
<tag> <what to cut>. <replacement>. [path]
```

End with:

```
net: -<N> lines, -<M> deps possible.
```

Nothing to cut:

```
Lean already. Ship.
```

## Execution

1. Scan the project tree, skipping: `node_modules`, `.git`, `__pycache__`, `.venv`, `venv`, `dist`, `build`, `.specify`, `.next`, `target`.
2. For each file, check against the hunt order above.
3. Rank findings: biggest line-count reduction first, then dependency reduction.
4. Output one line per finding with the tag, what to cut, replacement, and path.
5. End with the net score.
6. Do NOT apply fixes — only list findings.
7. Optionally write the report to `.specify/ponytail-audit.md` if the user asks to persist it.
