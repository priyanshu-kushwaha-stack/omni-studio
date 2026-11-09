"""jsonschema.validate with the schema check done once per schema (studio file; see core/PATCHES.md).

`jsonschema.validate(instance, schema)` first checks the schema itself against its metaschema, on every call. For
the playbook and artifact schemas that check costs about 50 ms, far more than validating the instance, and a gate
run (`omni approve`, `omni qc`) validates the same few schemas hundreds of times. `validate` here does the same
three steps as `jsonschema.validate` (pick the class with `validator_for`, `check_schema`, raise
`best_match(iter_errors(instance))`), but keeps the checked validator per schema content. A schema is keyed by its
JSON text in its own key order (best_match breaks ties by schema order, so a reordered schema is a different key),
so an edited schema file is a new key and is checked again; an invalid schema is never kept and raises
`SchemaError` on every call, as before.
"""

from __future__ import annotations

import copy
import json
import threading
from typing import Any

import jsonschema
from jsonschema import exceptions
from jsonschema.validators import validator_for

_LOCK = threading.Lock()
_VALIDATORS: dict[str, Any] = {}


def _key(schema: dict) -> str:
    # Key order stays in the key: errors come out in schema order, and best_match breaks ties by that order.
    return json.dumps(schema, separators=(",", ":"))


def _validator(schema: dict) -> Any:
    key = _key(schema)
    with _LOCK:
        found = _VALIDATORS.get(key)
    if found is not None:
        return found
    owned = copy.deepcopy(schema)  # the cached validator never shares a dict the caller might change later
    cls = validator_for(owned)
    cls.check_schema(owned)
    built = cls(owned)
    with _LOCK:
        return _VALIDATORS.setdefault(key, built)


def validate(instance: Any, schema: dict) -> None:
    """Same result as `jsonschema.validate(instance=instance, schema=schema)`; raises the same errors."""
    error = exceptions.best_match(_validator(schema).iter_errors(instance))
    if error is not None:
        raise error


__all__ = ["validate", "jsonschema"]
