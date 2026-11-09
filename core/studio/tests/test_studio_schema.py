"""lib/studio_schema.py (patch 10): jsonschema.validate with the schema check done once per schema, same errors."""

from __future__ import annotations

import json

import jsonschema
import pytest

from lib import studio_schema
from schemas.artifacts import list_schemas, load_schema
from styles import playbook_loader

SCHEMA = {
    "$schema": "https://json-schema.org/draft/2020-12/schema",
    "type": "object",
    "required": ["name", "size"],
    "properties": {
        "name": {"type": "string"},
        "size": {"type": "integer", "minimum": 1},
        "tags": {"type": "array", "items": {"enum": ["a", "b"]}},
    },
    "additionalProperties": False,
}

BAD = [
    {"name": "x"},
    {"name": 3, "size": 0},
    {"name": "x", "size": 2, "tags": ["c"]},
    {"name": "x", "size": 2, "extra": True},
    [],
]


def _error(fn, instance, schema):
    with pytest.raises(jsonschema.ValidationError) as err:
        fn(instance, schema)
    e = err.value
    return e.message, list(e.absolute_path), list(e.absolute_schema_path), e.validator


@pytest.mark.parametrize("instance", BAD)
def test_the_same_error_as_jsonschema_validate(instance):
    expected = _error(lambda i, s: jsonschema.validate(instance=i, schema=s), instance, SCHEMA)
    assert _error(studio_schema.validate, instance, SCHEMA) == expected
    assert _error(studio_schema.validate, instance, SCHEMA) == expected  # and again, from the cache


def test_a_valid_instance_passes():
    studio_schema.validate({"name": "x", "size": 1, "tags": ["a"]}, SCHEMA)


def test_an_invalid_schema_raises_every_time_and_is_never_kept():
    bad = {"type": "object", "properties": {"n": {"type": "no-such-type"}}}
    for _ in range(2):
        with pytest.raises(jsonschema.SchemaError):
            studio_schema.validate({}, bad)
    assert studio_schema._key(bad) not in studio_schema._VALIDATORS


def test_an_edited_schema_is_a_new_schema():
    loose = dict(SCHEMA, required=["name"])
    studio_schema.validate({"name": "x"}, loose)
    with pytest.raises(jsonschema.ValidationError, match="'size' is a required property"):
        studio_schema.validate({"name": "x"}, SCHEMA)


def test_changing_the_callers_dict_later_does_not_change_the_kept_validator():
    schema = json.loads(json.dumps(SCHEMA))
    studio_schema.validate({"name": "x", "size": 1}, schema)
    schema["required"].append("tags")
    studio_schema.validate({"name": "x", "size": 1}, SCHEMA)


def test_every_artifact_schema_and_the_playbook_schema_check_like_jsonschema():
    for name in list_schemas():
        schema = load_schema(name)
        expected = (
            _error(lambda i, s: jsonschema.validate(instance=i, schema=s), {"__nope__": 1}, schema)
            if _raises(schema)
            else None
        )
        got = _error(studio_schema.validate, {"__nope__": 1}, schema) if expected else None
        assert got == expected, name
    playbook_schema = playbook_loader._load_playbook_schema()
    assert _error(studio_schema.validate, {}, playbook_schema) == _error(
        lambda i, s: jsonschema.validate(instance=i, schema=s), {}, playbook_schema
    )


def _raises(schema) -> bool:
    try:
        jsonschema.validate(instance={"__nope__": 1}, schema=schema)
    except jsonschema.ValidationError:
        return True
    return False


def test_the_patched_callers_use_it():
    import inspect

    from lib import checkpoint

    assert "studio_schema.validate(" in inspect.getsource(playbook_loader.validate_playbook)
    assert "jsonschema.validate(" not in inspect.getsource(checkpoint)
