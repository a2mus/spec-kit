---
description: "Review a diff for over-engineering: find what to delete, simplify, or replace with stdlib/native"
---

# Ponytail Review

Review diffs for unnecessary complexity. One line per finding: location, what
to cut, what replaces it. The diff's best outcome is getting shorter.

Adapted from [Ponytail](https://github.com/DietrichGebert/ponytail) (MIT).

## User Input

```text
$ARGUMENTS
```

You **MUST** consider the user input before proceeding (if not empty).

## Intensity

Check `.specify/extensions/ponytail/ponytail-config.yml` for the `intensity` setting.
Default: **full**.

- **lite** — Build what's asked, name the lazier alternative in one line. User picks.
- **full** — The ladder enforced. Stdlib and native first. Shortest diff, shortest explanation.
- **ultra** — YAGNI extremist. Deletion before addition. Challenge the requirement itself.

## The Ladder (reference for review)

When reviewing code, check against this priority order. Anything that could
have used a higher rung is a finding:

1. **Does this need to exist at all?** → YAGNI finding
2. **Stdlib does it?** → stdlib finding
3. **Native platform feature covers it?** → native finding
4. **Already-installed dependency solves it?** → dep finding
5. **Can it be one line?** → shrink finding
6. **Only then:** the minimum code that works → no finding

## Review Scope

This review hunts **over-engineering and complexity only**. It does NOT review for:
- Correctness bugs → route to a normal review pass
- Security holes → route to `speckit.security-scan`
- Performance → route to a profiling pass

A single smoke test or `assert`-based self-check is the ponytail minimum, not
bloat. **Never flag it for deletion.**

## Format

Output one line per finding:

`L<line>: <tag> <what>. <replacement>.`

For multi-file diffs: `<file>:L<line>: <tag> <what>. <replacement>.`

### Tags

- `delete:` — Dead code, unused flexibility, speculative feature. Replacement: nothing.
- `stdlib:` — Hand-rolled thing the standard library ships. Name the function.
- `native:` — Dependency or code doing what the platform already does. Name the feature.
- `yagni:` — Abstraction with one implementation, config nobody sets, layer with one caller.
- `shrink:` — Same logic, fewer lines. Show the shorter form.

## Examples

❌ "This EmailValidator class might be more complex than necessary, have you considered whether all these validation rules are needed at this stage?"

✅ `L12-38: stdlib: 27-line validator class. "@" in email, 1 line, real validation is the confirmation mail.`

✅ `L4: native: moment.js imported for one format call. Intl.DateTimeFormat, 0 deps.`

✅ `repo.py:L88: yagni: AbstractRepository with one implementation. Inline it until a second one exists.`

✅ `L52-71: delete: retry wrapper around an idempotent local call. Nothing replaces it.`

✅ `L30-44: shrink: manual loop builds dict. dict(zip(keys, values)), 1 line.`

## Scoring

End with the only metric that matters:

```
net: -<N> lines possible.
```

If there is nothing to cut, say:

```
Lean already. Ship.
```

## When NOT to Flag

Never flag for deletion:
- Input validation at trust boundaries (API endpoints, user input, file parsing)
- Error handling that prevents data loss
- Security measures (auth, authz, sanitization, secrets handling)
- Accessibility basics
- Anything explicitly requested by the user
- Self-checks (assert-based demos, test files) — these are the ponytail minimum

## Execution

1. Read the diff (or the files changed in the most recent implementation).
2. For each changed file, scan for over-engineering patterns:
   - Single-implementation interfaces / abstract bases
   - Factories with one product
   - Wrapper layers that only delegate
   - Hand-rolled stdlib equivalents
   - Speculative flexibility (plugin systems with no plugins, strategy patterns with one strategy)
   - Dead config and flags
   - Files exporting one thing that could live next to its caller
3. Output findings in the format above, one line per finding.
4. End with the net score.
5. Do NOT apply fixes — only list findings.
