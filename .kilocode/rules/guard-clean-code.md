<!-- Adapted from amElnagdy/guard-skills (MIT License) -->
<!-- https://github.com/amElnagdy/guard-skills -->

# Clean Code Guard — Always-Active Rules

These rules apply to **every code change** you produce or review. They are imperatives, not suggestions. Apply them as a guard pass after writing code and before presenting, committing, or merging.

This guard exists because LLM-generated code has measurable, systematic failure modes that generic "follow clean code" instructions do not catch:

- Code duplication grew 8× in tracked codebases between 2021 and 2024 (GitClear 2025)
- Package hallucination rate averages 19.6% across 16 models (Spracklen et al., USENIX Security '25)
- LLMs often wrap risky operations in broad catch-all handlers that swallow errors
- AI agents "declare success despite failing tests" by returning hardcoded fixture values
- Function size grew from 142 to 267 LoC, cyclomatic complexity from 4.2 to 8.1 in AI-assisted commits

The classic principles (Clean Code, SOLID, DRY/KISS/YAGNI) are the foundation — this guard adds the AI-specific layer most rule packs miss.

## Functions and Names

1. **Names reveal intent.** Never use `data`, `data2`, `result`, `result_final`, `item`, `temp`, `value`, `obj`, `info`, `helper`, `manager`, `utils`, or `handle_*`/`process_*`/`do_*` without a qualifier. A name must answer *why it exists and what it does*.
2. **Functions stay small.** Target ≤20 lines, one level of abstraction, one thing. If you can extract a function with a name that doesn't restate the body, the parent was doing more than one thing.
3. **Four arguments is the hard ceiling.** At five, introduce a request/config object. Never use boolean flag arguments — split into two functions instead.
4. **No output arguments.** A function either returns a value (query) or has a side effect (command). Never both. (CQS)

## Comments and Structure

5. **Comments explain *why*, never *what*.** Delete any comment that paraphrases the line below it. Delete step-number scaffolding comments. Delete commented-out code.
6. **Match the file's existing style.** Read the file you're editing and at least one neighbor before writing. Mirror the casing, import order, error handling, logging, and HTTP/DB client choices. Do not introduce a second pattern.

## SOLID

7. **One actor per module.** A class should be answerable to one stakeholder group. If two unrelated subsystems both reach into the same class, split it. (SRP)
8. **Extension via new code, not edits.** If adding a new variant requires another type-tag branch, refactor to a registry, strategy, or polymorphic dispatch first. (OCP)
9. **No subclass refuses its parent's contract.** Never override a method to signal "not implemented." Never strengthen preconditions or weaken postconditions. (LSP)
10. **Abstractions live with the client, not the implementation.** Put interfaces in the package that consumes them, not next to the concrete class. (DIP)

## DRY, KISS, YAGNI

11. **Delete duplicated *knowledge*, not duplicated *text*.** Two functions that look alike but encode different rules are not a DRY violation.
12. **The wrong abstraction is worse than duplication.** If an abstraction has accumulated branches for each caller's special case, re-inline it back into callers.
13. **Complexity ceiling: cyclomatic ≤10, nesting depth ≤5.** Refactor before exceeding.
14. **No speculative anything.** No optional parameter, config flag, env var, feature toggle, interface, factory, or base class without a present-day caller.

## AI-Specific Guardrails — Highest-Leverage Section

15. **Never swallow errors with broad catch-all handling.** Catch only the specific error type you can recover from. If you cannot recover, let the error propagate.
16. **No defensive guards for impossible cases.** Do not add null checks for values whose declared type already excludes that case. Trust the contract.
17. **Verify every import and external call.** Before calling a method on a library, confirm it exists in the version installed. Do not generate code based on what the API "should" look like.
18. **No hardcoded "success" returns or mock fixtures in production code.** Never return `{"status": "ok", ...}` or canned data from a function whose spec says it does real work. If you cannot implement, fail explicitly.
19. **Re-derive, do not copy from similar.** When tempted to copy a function and modify it, stop. Re-derive from the spec.
20. **Enumerate boundary cases before writing them.** For any range, off-by-one, null/empty/one/many boundary, write the case list in a comment first.
21. **Strip dead code before delivery.** Run a linter or grep pass for unused imports, unused symbols, unreachable branches.
22. **Read before write.** Before writing in an unfamiliar repo, read the file you'll edit, one neighbor, and any project rules file.

## Refactoring Discipline

23. **Preserve observable behavior when refactoring.** Same inputs → same outputs, same exceptions, same side effects, same ordering guarantees. If you spot a bug while refactoring, flag it separately. Bug fixes and refactors are two operations — never bundle them.

## Self-Check Before Delivery

Before presenting code you wrote or edited:

1. Walk imperatives 1–23 against your diff. Fix every violation.
2. New functions: lines ≤ 20? params ≤ 4? complexity ≤ 10? Names reveal intent?
3. New comments: explain *why*? If *what*, delete it.
4. New error handling: caught error type specific? Handler does something other than silently return?
5. New abstractions: is there a second concrete user *today*? If no, inline it.
6. Did you read the file and at least one neighbor? Style matches?
7. Any hardcoded "ok" return or fixture data? Replace or fail explicitly.
8. If refactor: did you change observable behavior? If yes, split the bug fix out.

If any answer fails, fix before shipping.

## References

For detailed rules, examples, and source citations, read the reference files in [references/](references/):

- [references/naming-and-functions.md](references/naming-and-functions.md) — names, function size, parameters, CQS
- [references/comments-and-formatting.md](references/comments-and-formatting.md) — when to comment, matching style
- [references/solid.md](references/solid.md) — SRP, OCP, LSP, ISP, DIP
- [references/dry-kiss-yagni.md](references/dry-kiss-yagni.md) — knowledge duplication, wrong abstraction, complexity
- [references/ai-failure-modes.md](references/ai-failure-modes.md) — the 14 systematic ways LLMs produce bad code (**read this first**)
- [references/review-checklist.md](references/review-checklist.md) — structured review walk-through
- [references/sources.md](references/sources.md) — central bibliography
