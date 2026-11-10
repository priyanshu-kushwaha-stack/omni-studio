ROOT := $(abspath $(dir $(lastword $(MAKEFILE_LIST))))
OPENMONTAGE := $(ROOT)/core/openmontage
PYTHON := $(ROOT)/.venv/bin/python
# Pinned in core/lock.yaml. A `uv sync` from an older branch drops it from the shared .venv; uvx then runs the same pin.
RUFF := $(or $(wildcard $(ROOT)/.venv/bin/ruff),uvx ruff@0.17.2)
LINT_PATHS := core/studio core/engines

export PYTHONPATH := $(OPENMONTAGE):$(ROOT)/core
export PYTHONDONTWRITEBYTECODE := 1
export HYPERFRAMES_NO_TELEMETRY := 1
export DISABLE_TELEMETRY := 1

.PHONY: test prepush test-serial lint format precommit board new-channel upstream-pull links

# Upstream tests that assert a tool the owner banned is still discovered. They cannot pass
# with the denylist on. core/studio/tests asserts the opposite for every denylisted name.
DESELECT := --deselect core/openmontage/tests/contracts/test_kling_official_avatar.py::test_registry_discovers_kling_lip_sync

# `make test` runs the suites (upstream as three processes) in parallel under the machine-wide `tests` queue and, on
# a clean tree, records the pass so the pre-push hook (`make prepush`, from .claude/standard.json) skips that tree.
# A push that changes only video folders gets `omni check` instead of the suites. See core/studio/testgate.py.
test:
	cd $(ROOT) && $(PYTHON) -m studio.testgate full

prepush:
	cd $(ROOT) && $(PYTHON) -m studio.testgate prepush

# Code health for core/studio and core/engines (never core/openmontage): ruff lint, ruff format, and the size
# budgets (studio.sizes). The global commit hook blocks only on .claude/standard.json's `typecheck` command, so that
# command is `make precommit`: format first, then lint.
LINT_CHECKS := $(RUFF) check $(LINT_PATHS) && $(PYTHON) -m studio.sizes check

lint:
	cd $(ROOT) && $(RUFF) format --check $(LINT_PATHS) && $(LINT_CHECKS)

format:
	cd $(ROOT) && $(RUFF) format $(LINT_PATHS)

# Format first so the size budgets measure formatted code; the format check is then redundant.
precommit: format
	cd $(ROOT) && $(LINT_CHECKS)

# The old one-after-another run, for when a parallel failure needs a clean log.
test-serial:
	cd $(OPENMONTAGE) && $(PYTHON) -m pytest tests/backlot tests/contracts tests/lib tests/pipelines tests/qa tests/styles tests/test_network_guard.py -q -p no:cacheprovider -p studio.pytest_upstream $(DESELECT)
	cd $(ROOT) && $(PYTHON) -m pytest core/studio/tests -q -p no:cacheprovider --import-mode=importlib
	cd $(ROOT) && $(PYTHON) -m pytest core/engines/pou/tests -q -p no:cacheprovider
	@test -d $(ROOT)/core/engines/whatif/node_modules || { echo "core/engines/whatif: run 'pnpm install --frozen-lockfile' there first" >&2; exit 1; }
	cd $(ROOT)/core/engines/whatif && npx vitest run && npx tsc --noEmit

# The playbook links in core/openmontage/styles/custom/ are git-ignored; a fresh clone needs this once.
links:
	$(PYTHON) -m studio.cli link

# One board per channel, on ports from 4761. Port 4750 belongs to the owner's existing Backlot.
board:
	@test -n "$(CHANNEL)" || { echo "usage: make board CHANNEL=<slug>" >&2; exit 2; }
	$(PYTHON) -m studio.cli board $(CHANNEL)

new-channel:
	@test -n "$(SLUG)" || { echo "usage: make new-channel SLUG=<slug>" >&2; exit 2; }
	$(PYTHON) -m studio.cli new-channel $(SLUG)

# Full history, no --squash. After a pull, update core/lock.yaml and re-check core/PATCHES.md.
upstream-pull:
	@test -n "$(SHA)" || { echo "usage: make upstream-pull SHA=<upstream commit>" >&2; exit 2; }
	cd $(ROOT) && git subtree pull --prefix=core/openmontage upstream $(SHA) \
		-m "$$(printf 'chore: pull OpenMontage %s\n\nCo-authored-by: omnigent <noreply@omnigent.ai>' '$(SHA)')"
