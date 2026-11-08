ROOT := $(abspath $(dir $(lastword $(MAKEFILE_LIST))))
OPENMONTAGE := $(ROOT)/core/openmontage
PYTHON := $(ROOT)/.venv/bin/python

export PYTHONPATH := $(OPENMONTAGE):$(ROOT)/core
export PYTHONDONTWRITEBYTECODE := 1
export HYPERFRAMES_NO_TELEMETRY := 1
export DISABLE_TELEMETRY := 1

.PHONY: test board new-channel upstream-pull links

# Upstream tests that assert a tool the owner banned is still discovered. They cannot pass
# with the denylist on. core/studio/tests asserts the opposite for every denylisted name.
DESELECT := --deselect core/openmontage/tests/contracts/test_kling_official_avatar.py::test_registry_discovers_kling_lip_sync

test:
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
