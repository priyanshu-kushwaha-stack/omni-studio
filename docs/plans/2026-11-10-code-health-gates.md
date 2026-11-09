# Code-health gates (2026-11-10)

Goal: the studio and engine code (`core/studio`, `core/engines`; never `core/openmontage`) stays readable and the
test suite stays fast, enforced by gates rather than written rules.

## Decisions

- Ruff 0.17.2 (newest release at least two weeks old), pinned in `pyproject.toml` (dev group), `uv.lock` and
  `core/lock.yaml`. Line length 120, the width the code already uses.
- Format everything now in one mechanical commit (owner's choice, 2026-11-10), listed in `.git-blame-ignore-revs`.
- Lint rules: pyflakes (F), bugbear (B), mccabe (C901) at 12. At 12, 12 files have a function over the limit;
  at the default of 10, 20 do. Existing offenders get per-file ignores, not rewrites.
- The global guardrails block a commit only on the `typecheck` command and never run `lint`; `format` is a
  warn-only auto-fix. So `typecheck` runs `make precommit` (format, then lint), which blocks.
- Size budgets: module 500 lines, function 60 lines, Python only. Offenders are recorded in
  `core/studio/config/size_baseline.yaml`; an entry may only shrink (checked against `origin/main`'s copy), and a
  stale entry (file now smaller) fails with the command that tightens it.
- Test speed: a pytest plugin fails a test whose call phase exceeds 2 s unless marked `slow`
  (`OMNI_TEST_TIME_LIMIT` overrides; 0 turns it off). `studio.testgate` warns when a full run passes 120 s.

## Steps and checks

1. Pin ruff; `ruff --version` from `.venv` says 0.17.2.
2. `make format`; commit alone; add its SHA to `.git-blame-ignore-revs`. Check: `make test` green.
3. Lint config and per-file ignores; `make lint` passes; standard.json wired. Check: a commit with an unused
   import is blocked.
4. `studio.sizes` with tests (TDD), baseline recorded. Check: growing a baselined file fails the check.
5. Speed plugin with tests, `slow` marks on today's slow tests, testgate warning. Check: `make test` green, ~2 min.
6. One line in CLAUDE.md: `/simplify` before a code PR; film sessions use `omni fix` for code needs.
