ROOT := $(abspath $(dir $(lastword $(MAKEFILE_LIST))))
OPENMONTAGE := $(ROOT)/core/openmontage
PYTHON := $(ROOT)/.venv/bin/python
BACKLOT_PORT ?= 4760

export PYTHONPATH := $(OPENMONTAGE):$(ROOT)/core
export PYTHONDONTWRITEBYTECODE := 1
export HYPERFRAMES_NO_TELEMETRY := 1
export DISABLE_TELEMETRY := 1

.PHONY: test board new-channel upstream-pull

test:
	cd $(OPENMONTAGE) && $(PYTHON) -m pytest tests/backlot tests/contracts tests/lib tests/pipelines tests/qa tests/styles tests/test_network_guard.py -q -p no:cacheprovider
	cd $(ROOT) && $(PYTHON) -m pytest core/studio/tests -q -p no:cacheprovider --import-mode=importlib

# Port 4750 belongs to the owner's existing Backlot.
board:
	cd $(OPENMONTAGE) && BACKLOT_PORT=$(BACKLOT_PORT) $(PYTHON) -m backlot open $(PROJECT)

new-channel:
	@echo "new-channel: the channel layer is Phase 2 and does not exist yet." >&2
	@exit 1

# Full history, no --squash. After a pull, update core/lock.yaml and re-check core/PATCHES.md.
upstream-pull:
	@test -n "$(SHA)" || { echo "usage: make upstream-pull SHA=<upstream commit>" >&2; exit 2; }
	cd $(ROOT) && git subtree pull --prefix=core/openmontage upstream $(SHA) \
		-m "$$(printf 'chore: pull OpenMontage %s\n\nCo-authored-by: omnigent <noreply@omnigent.ai>' '$(SHA)')"
