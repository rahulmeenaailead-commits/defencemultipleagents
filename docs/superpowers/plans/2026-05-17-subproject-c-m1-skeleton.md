# Sub-project C — M1 Skeleton Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Stand up the foundational plumbing for Sub-project C so a stubbed end-to-end "produce a fake finding and persist it with full audit trail" flow works, both `StubLocalProvider` and `AnthropicProvider` pass the provider conformance suite, and the SQLite findings store with versioning tables is operational.

**Architecture:** Two-pass LLM pipeline (Extractor → Verifier) per the spec; M1 builds the protocols, schema, storage, and provider implementations only — no prompts, no real LLM calls in the e2e path (yet). The skeleton proves the provider-abstraction interface is real (Goal 2 hinge) and the audit trail is reproducible end-to-end.

**Tech Stack:**
- Python 3.12
- `uv` (package manager + venv)
- Pydantic v2 (schema definition + validation)
- SQLAlchemy 2.0 (ORM; SQLite dev → Postgres-swap path for Sub-project H)
- `anthropic` SDK (cloud provider)
- pytest, pytest-cov, ruff, mypy

**Scope reference:** Spec at `docs/superpowers/specs/2026-05-17-subproject-c-explainability-design.md`. This plan implements **M1 only** (skeleton). M2–M8 each get their own plan.

---

## File Structure (created by this plan)

```
/                                       <-- project root: /Users/rahulmeena/ai product lauch for defense contrcator
├── pyproject.toml                      <-- T1
├── .python-version                     <-- T1
├── README.md                           <-- T14 (updated)
├── src/
│   └── dcr/                            <-- "defense contract reviewer" package
│       ├── __init__.py                 <-- T1
│       ├── schema/
│       │   ├── __init__.py             <-- T2
│       │   └── risk_finding.py         <-- T2  (Pydantic models)
│       ├── providers/
│       │   ├── __init__.py             <-- T3
│       │   ├── base.py                 <-- T3  (Protocol + ProviderResponse + ProviderError)
│       │   ├── stub_local.py           <-- T4
│       │   └── anthropic_provider.py   <-- T6
│       └── store/
│           ├── __init__.py             <-- T8
│           ├── db.py                   <-- T8  (engine, session factory, Base)
│           ├── models.py               <-- T9  (ORM models)
│           ├── versions.py             <-- T10 (VersionRegistry)
│           ├── findings.py             <-- T11 (FindingsRepository)
│           └── audit.py                <-- T12 (AuditRepository)
├── scripts/
│   └── skeleton_e2e.py                 <-- T13
└── tests/
    ├── __init__.py                     <-- T1
    ├── conftest.py                     <-- T1
    ├── test_sanity.py                  <-- T1
    ├── schema/
    │   ├── __init__.py                 <-- T2
    │   └── test_risk_finding.py        <-- T2
    ├── providers/
    │   ├── __init__.py                 <-- T3
    │   ├── conformance/
    │   │   ├── __init__.py             <-- T5
    │   │   ├── conftest.py             <-- T5
    │   │   └── test_conformance.py     <-- T5
    │   ├── test_stub_local.py          <-- T4
    │   └── test_anthropic_provider.py  <-- T6 (mocked) + T7 (integration, skipped w/o key)
    ├── store/
    │   ├── __init__.py                 <-- T8
    │   ├── test_db.py                  <-- T8
    │   ├── test_models.py              <-- T9
    │   ├── test_versions.py            <-- T10
    │   ├── test_findings.py            <-- T11
    │   └── test_audit.py               <-- T12
    └── test_e2e_skeleton.py            <-- T13
```

### Responsibility per file (locking decomposition in now)

| File | Owns | Does NOT own |
|---|---|---|
| `schema/risk_finding.py` | Pydantic models for `Finding`, `AbstainedFinding`, `Evidence`, `TextSpan`, `RegulatoryCitation`, `Action`, enums; JSON-schema export | Storage, LLM interaction |
| `providers/base.py` | `ModelProvider` Protocol, `ProviderResponse` model, `ProviderError` exception | Any provider-specific code |
| `providers/stub_local.py` | Fixture-driven provider for tests + Goal-2 interface proof | Real LLM calls |
| `providers/anthropic_provider.py` | Anthropic SDK wrapping + cost calc + tool-use schema enforcement | Caller logic, retries |
| `store/db.py` | SQLAlchemy engine, session factory, `Base` | Tables (in `models.py`) |
| `store/models.py` | ORM classes only (Finding, AuditTrail, version tables) | Query logic |
| `store/versions.py` | Get-or-create helpers for `PromptVersion`, `ModelVersion`, `RegSnapshotVersion` | Findings |
| `store/findings.py` | Append-only insert; query-by-clause; idempotency-key lookup; supersedes-chain | Audit (lives in `audit.py`) |
| `store/audit.py` | Audit-trail row creation; foreign-key linkage to version registries | Finding rows |
| `scripts/skeleton_e2e.py` | Run the full M1 stub flow as a CLI demonstration | Production logic |

---

## Conventions (apply to every task)

- **Determinism contract:** every provider call in this plan uses `temperature=0.0`. Conformance suite enforces this.
- **Commit message format:** `<type>: <imperative summary>` where `<type>` ∈ `feat | test | refactor | docs | chore`. Co-author line included.
- **Run from project root** for all commands (`/Users/rahulmeena/ai product lauch for defense contrcator`).
- **Quote paths with spaces** in shell commands (the project root has a space).

---

### Task 1: Project initialization + sanity test

**Files:**
- Create: `pyproject.toml`
- Create: `.python-version`
- Create: `src/dcr/__init__.py`
- Create: `tests/__init__.py`
- Create: `tests/conftest.py`
- Create: `tests/test_sanity.py`

- [ ] **Step 1: Write the failing test**

```python
# tests/test_sanity.py
"""Sanity check that the project is installable and importable."""
import dcr


def test_package_imports():
    assert dcr.__version__ == "0.1.0"
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd "/Users/rahulmeena/ai product lauch for defense contrcator"
uv run pytest tests/test_sanity.py -v
```

Expected: FAIL with `ModuleNotFoundError: No module named 'dcr'` (or `pytest` not found if `uv` not initialized yet — that's fine, install it first).

- [ ] **Step 3: Implement (project files)**

Create `.python-version`:

```
3.12
```

Create `pyproject.toml`:

```toml
[project]
name = "dcr"
version = "0.1.0"
description = "Defense Contract Reviewer — per-clause risk + explainability engine (Sub-project C)"
requires-python = ">=3.12"
dependencies = [
    "pydantic>=2.7",
    "sqlalchemy>=2.0",
    "anthropic>=0.40",
]

[project.optional-dependencies]
dev = [
    "pytest>=8.0",
    "pytest-cov>=5.0",
    "ruff>=0.5",
    "mypy>=1.10",
]

[build-system]
requires = ["hatchling"]
build-backend = "hatchling.build"

[tool.hatch.build.targets.wheel]
packages = ["src/dcr"]

[tool.pytest.ini_options]
testpaths = ["tests"]
addopts = "-ra --strict-markers"
markers = [
    "integration: hits real external services (e.g., Anthropic API); skipped by default unless explicitly selected",
]

[tool.ruff]
line-length = 100
target-version = "py312"

[tool.mypy]
python_version = "3.12"
strict = true
files = ["src/dcr"]
```

Create `src/dcr/__init__.py`:

```python
__version__ = "0.1.0"
```

Create `tests/__init__.py` (empty):

```python
```

Create `tests/conftest.py` (empty for now; will fill as fixtures emerge):

```python
"""Shared pytest fixtures."""
```

- [ ] **Step 4: Install and run test to verify it passes**

```bash
cd "/Users/rahulmeena/ai product lauch for defense contrcator"
uv sync --extra dev
uv run pytest tests/test_sanity.py -v
```

Expected: PASS — `tests/test_sanity.py::test_package_imports PASSED`.

- [ ] **Step 5: Commit**

```bash
git add pyproject.toml .python-version src/dcr/__init__.py tests/__init__.py tests/conftest.py tests/test_sanity.py
git commit -m "$(cat <<'EOF'
chore: initialize dcr Python project with pytest sanity test

Sets up the dcr package skeleton (src/dcr layout), pytest configuration,
pyproject.toml with runtime + dev dependencies, and a sanity test that
proves the package is installable and importable.

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
EOF
)"
```

---

### Task 2: Risk-finding schema (Pydantic models)

**Files:**
- Create: `src/dcr/schema/__init__.py`
- Create: `src/dcr/schema/risk_finding.py`
- Create: `tests/schema/__init__.py`
- Create: `tests/schema/test_risk_finding.py`

- [ ] **Step 1: Write the failing tests**

```python
# tests/schema/test_risk_finding.py
"""Tests for the risk-finding Pydantic schema."""
import pytest
from pydantic import ValidationError

from dcr.schema.risk_finding import (
    AbstainedFinding,
    AbstentionReason,
    Action,
    Evidence,
    Finding,
    Likelihood,
    Negotiability,
    RegulatoryCitation,
    Severity,
    TextSpan,
    Urgency,
)


def _valid_finding_payload():
    return {
        "clause_id": "c_4711",
        "category_id": 2,
        "rule_id": "IP-DR-UR-01",
        "severity": "critical",
        "likelihood": "high",
        "negotiability": "hard",
        "composite_score": 94,
        "evidence": {
            "text_spans": [
                {
                    "quote": "unlimited rights",
                    "char_start": 24,
                    "char_end": 40,
                    "page": 47,
                    "section": "H.7(b)",
                }
            ],
            "regulatory_citations": [
                {
                    "reg_id": "DFARS",
                    "section": "252.227-7013(b)(1)",
                    "version_date": "2025-09-15",
                    "version_hash": "sha256:abc123",
                }
            ],
            "reasoning": "Clause grants Unlimited Rights with no time limit.",
        },
        "action": {
            "plain_language": "Negotiate down to Government Purpose Rights.",
            "redline_suggestion": "Replace ... with ...",
            "urgency": "before_signature",
        },
        "confidence": 0.94,
        "abstention": False,
        "abstention_reason": None,
    }


def test_valid_finding_parses():
    f = Finding.model_validate(_valid_finding_payload())
    assert f.clause_id == "c_4711"
    assert f.category_id == 2
    assert f.severity == Severity.CRITICAL
    assert f.evidence.text_spans[0].quote == "unlimited rights"
    assert f.action.urgency == Urgency.BEFORE_SIGNATURE


def test_finding_requires_at_least_one_text_span():
    payload = _valid_finding_payload()
    payload["evidence"]["text_spans"] = []
    with pytest.raises(ValidationError) as exc:
        Finding.model_validate(payload)
    assert "text_spans" in str(exc.value)


def test_category_id_must_be_in_1_to_15():
    payload = _valid_finding_payload()
    payload["category_id"] = 16
    with pytest.raises(ValidationError):
        Finding.model_validate(payload)
    payload["category_id"] = 0
    with pytest.raises(ValidationError):
        Finding.model_validate(payload)


def test_composite_score_must_be_0_to_100():
    payload = _valid_finding_payload()
    payload["composite_score"] = 101
    with pytest.raises(ValidationError):
        Finding.model_validate(payload)
    payload["composite_score"] = -1
    with pytest.raises(ValidationError):
        Finding.model_validate(payload)


def test_confidence_must_be_0_to_1():
    payload = _valid_finding_payload()
    payload["confidence"] = 1.5
    with pytest.raises(ValidationError):
        Finding.model_validate(payload)


def test_severity_is_closed_enum():
    payload = _valid_finding_payload()
    payload["severity"] = "extreme"
    with pytest.raises(ValidationError):
        Finding.model_validate(payload)


def test_abstained_finding_parses():
    payload = {
        "clause_id": "c_8821",
        "abstention": True,
        "abstention_reason": "low_self_confidence",
        "confidence": 0.31,
        "raw_draft": {"some": "draft"},
    }
    af = AbstainedFinding.model_validate(payload)
    assert af.abstention is True
    assert af.abstention_reason == AbstentionReason.LOW_SELF_CONFIDENCE


def test_abstention_reason_is_closed_enum():
    payload = {
        "clause_id": "c_8821",
        "abstention": True,
        "abstention_reason": "made_up_reason",
        "confidence": 0.31,
    }
    with pytest.raises(ValidationError):
        AbstainedFinding.model_validate(payload)


def test_json_schema_export_includes_required_fields():
    schema = Finding.model_json_schema()
    assert "clause_id" in schema["required"]
    assert "evidence" in schema["required"]
    assert "category_id" in schema["required"]


def test_evidence_regulatory_citations_default_empty_list():
    payload = _valid_finding_payload()
    del payload["evidence"]["regulatory_citations"]
    f = Finding.model_validate(payload)
    assert f.evidence.regulatory_citations == []
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
uv run pytest tests/schema/test_risk_finding.py -v
```

Expected: FAIL — `ModuleNotFoundError: No module named 'dcr.schema'`.

- [ ] **Step 3: Implement the schema**

Create `src/dcr/schema/__init__.py`:

```python
```

Create `src/dcr/schema/risk_finding.py`:

```python
"""Risk-finding Pydantic schema — the single payload Sub-project C produces.

Conformance to this schema is mandatory for any value entering the findings
store. The schema is also exported as JSON schema and handed to LLM providers
for constrained decoding.
"""
from __future__ import annotations

from enum import Enum
from typing import Literal

from pydantic import BaseModel, Field, ConfigDict


class Severity(str, Enum):
    LOW = "low"
    MED = "med"
    HIGH = "high"
    CRITICAL = "critical"


class Likelihood(str, Enum):
    LOW = "low"
    MED = "med"
    HIGH = "high"


class Negotiability(str, Enum):
    EASY = "easy"
    HARD = "hard"
    FIXED_BY_STATUTE = "fixed-by-statute"


class Urgency(str, Enum):
    BEFORE_SIGNATURE = "before_signature"
    WITHIN_30_DAYS = "within_30_days"
    AT_NEXT_MOD = "at_next_mod"


class AbstentionReason(str, Enum):
    LOW_SELF_CONFIDENCE = "low_self_confidence"
    MODEL_VOLUNTARY = "model_voluntary"
    SCHEMA_VALIDATION_FAILED = "schema_validation_failed"
    INVENTED_OR_PARAPHRASED_EVIDENCE = "invented_or_paraphrased_evidence"
    MISSING_REQUIRED_REG_CITATION = "missing_required_reg_citation"
    UNGROUNDED_REG_CITATION = "ungrounded_reg_citation"
    REG_VERSION_MISMATCH = "reg_version_mismatch"
    HIGH_SEVERITY_LOW_CONFIDENCE = "high_severity_low_confidence"
    CATEGORY_DISAGREEMENT = "category_disagreement"


class TextSpan(BaseModel):
    model_config = ConfigDict(extra="forbid")
    quote: str
    char_start: int = Field(..., ge=0)
    char_end: int = Field(..., ge=0)
    page: int = Field(..., ge=0)
    section: str


class RegulatoryCitation(BaseModel):
    model_config = ConfigDict(extra="forbid")
    reg_id: str
    section: str
    version_date: str
    version_hash: str


class Evidence(BaseModel):
    model_config = ConfigDict(extra="forbid")
    text_spans: list[TextSpan] = Field(..., min_length=1)
    regulatory_citations: list[RegulatoryCitation] = Field(default_factory=list)
    reasoning: str


class Action(BaseModel):
    model_config = ConfigDict(extra="forbid")
    plain_language: str
    redline_suggestion: str
    urgency: Urgency


class Finding(BaseModel):
    model_config = ConfigDict(extra="forbid")
    clause_id: str
    category_id: int = Field(..., ge=1, le=15)
    rule_id: str
    severity: Severity
    likelihood: Likelihood
    negotiability: Negotiability
    composite_score: int = Field(..., ge=0, le=100)
    evidence: Evidence
    action: Action
    confidence: float = Field(..., ge=0.0, le=1.0)
    abstention: Literal[False] = False
    abstention_reason: None = None


class AbstainedFinding(BaseModel):
    model_config = ConfigDict(extra="forbid")
    clause_id: str
    abstention: Literal[True] = True
    abstention_reason: AbstentionReason
    confidence: float = Field(..., ge=0.0, le=1.0)
    raw_draft: dict | None = None
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
uv run pytest tests/schema/test_risk_finding.py -v
```

Expected: PASS — all 10 tests green.

- [ ] **Step 5: Commit**

```bash
git add src/dcr/schema/ tests/schema/
git commit -m "$(cat <<'EOF'
feat: add risk-finding Pydantic schema with closed enums and mandatory fields

Defines the Finding / AbstainedFinding models with closed-enum severity,
likelihood, negotiability, urgency, and abstention_reason. Enforces ≥1
text_span on Evidence, 1-15 category bounds, 0-100 composite score, and
0-1 confidence. Schema is exported as JSON schema for LLM providers to
use as constrained-decoding input.

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
EOF
)"
```

---

### Task 3: Provider protocol + ProviderResponse + ProviderError

**Files:**
- Create: `src/dcr/providers/__init__.py`
- Create: `src/dcr/providers/base.py`
- Create: `tests/providers/__init__.py`

- [ ] **Step 1: Write the failing test**

(The protocol itself is tested indirectly via T4/T5; this task adds a structural test that any class with the right methods satisfies the protocol at runtime.)

```python
# tests/providers/test_base.py
"""Tests for the ProviderResponse model and ModelProvider protocol shape."""
import pytest
from pydantic import ValidationError

from dcr.providers.base import ModelProvider, ProviderError, ProviderResponse


def test_provider_response_requires_all_audit_fields():
    payload = {
        "parsed": {"key": "value"},
        "raw_text": "{\"key\":\"value\"}",
        "model_id": "test-model",
        "model_version": "v1",
        "input_tokens": 100,
        "output_tokens": 50,
        "cached_tokens": 0,
        "latency_ms": 250,
        "cost_usd": 0.0012,
        "provider_name": "test",
    }
    r = ProviderResponse.model_validate(payload)
    assert r.parsed == {"key": "value"}
    assert r.cost_usd == 0.0012


def test_provider_response_cost_usd_may_be_none():
    payload = {
        "parsed": {},
        "raw_text": "{}",
        "model_id": "stub",
        "model_version": "v0",
        "input_tokens": 0,
        "output_tokens": 0,
        "cached_tokens": 0,
        "latency_ms": 1,
        "cost_usd": None,
        "provider_name": "stub_local",
    }
    r = ProviderResponse.model_validate(payload)
    assert r.cost_usd is None


def test_provider_response_rejects_missing_provider_name():
    payload = {
        "parsed": {},
        "raw_text": "{}",
        "model_id": "x",
        "model_version": "y",
        "input_tokens": 0,
        "output_tokens": 0,
        "cached_tokens": 0,
        "latency_ms": 1,
        "cost_usd": None,
    }
    with pytest.raises(ValidationError):
        ProviderResponse.model_validate(payload)


def test_provider_error_is_exception():
    assert issubclass(ProviderError, Exception)


def test_model_provider_is_protocol():
    class _OK:
        name = "ok"

        def complete(
            self,
            system_prompt,
            user_prompt,
            response_schema,
            max_tokens,
            temperature=0.0,
            cache_prefix_id=None,
        ):
            raise NotImplementedError

    instance = _OK()
    assert isinstance(instance, ModelProvider)


def test_non_conforming_class_is_not_a_provider():
    class _Bad:
        name = "bad"
        # missing complete()

    assert not isinstance(_Bad(), ModelProvider)
```

- [ ] **Step 2: Run test to verify it fails**

```bash
uv run pytest tests/providers/test_base.py -v
```

Expected: FAIL — `ModuleNotFoundError: No module named 'dcr.providers'`.

- [ ] **Step 3: Implement the protocol**

Create `src/dcr/providers/__init__.py`:

```python
```

Create `tests/providers/__init__.py`:

```python
```

Create `src/dcr/providers/base.py`:

```python
"""Model-provider abstraction.

Every LLM call in Sub-project C goes through this interface. Provider-specific
types (anthropic.types, openai.types, etc.) MUST NOT leak out of provider
implementations. This is the Goal-2 hinge: swapping cloud → local is a config
change because callers only see ProviderResponse.
"""
from __future__ import annotations

from typing import Protocol, runtime_checkable

from pydantic import BaseModel, ConfigDict


class ProviderError(Exception):
    """Raised by provider implementations on unrecoverable failures.

    Recoverable failures (rate limits, transient timeouts) are handled
    internally by the provider via retry/backoff and only surface as
    ProviderError after exhaustion.
    """


class ProviderResponse(BaseModel):
    """The single output type every provider returns. Carries enough audit
    data to reconstruct the call later (Sub-project C requires reproducibility
    of every shipped finding)."""

    model_config = ConfigDict(extra="forbid")

    parsed: dict
    raw_text: str
    model_id: str
    model_version: str
    input_tokens: int
    output_tokens: int
    cached_tokens: int = 0
    latency_ms: int
    cost_usd: float | None  # None for local providers
    provider_name: str


@runtime_checkable
class ModelProvider(Protocol):
    """Structural protocol every provider implementation must satisfy.

    `name` distinguishes implementations in audit trails.
    `complete()` performs a single LLM call returning a structured response.
    """

    name: str

    def complete(
        self,
        system_prompt: str,
        user_prompt: str,
        response_schema: dict,
        max_tokens: int,
        temperature: float = 0.0,
        cache_prefix_id: str | None = None,
    ) -> ProviderResponse: ...
```

- [ ] **Step 4: Run test to verify it passes**

```bash
uv run pytest tests/providers/test_base.py -v
```

Expected: PASS — all 6 tests green.

- [ ] **Step 5: Commit**

```bash
git add src/dcr/providers/__init__.py src/dcr/providers/base.py tests/providers/__init__.py tests/providers/test_base.py
git commit -m "$(cat <<'EOF'
feat: add ModelProvider protocol and ProviderResponse model

Defines the single LLM-provider interface every Sub-project C call goes
through. ProviderResponse carries full audit data (model_id, model_version,
tokens, latency, cost). runtime_checkable Protocol allows isinstance checks
in the conformance suite.

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
EOF
)"
```

---

### Task 4: StubLocalProvider

**Files:**
- Create: `src/dcr/providers/stub_local.py`
- Create: `tests/providers/test_stub_local.py`

- [ ] **Step 1: Write the failing tests**

```python
# tests/providers/test_stub_local.py
"""Tests for StubLocalProvider — fixture-driven provider for tests and
Goal-2 interface-proof."""
import json

import pytest

from dcr.providers.base import ProviderError, ProviderResponse
from dcr.providers.stub_local import StubLocalProvider


def test_returns_canned_response_for_known_prompt():
    canned = {"abstention": True, "abstention_reason": "model_voluntary",
              "confidence": 0.1, "clause_id": "x"}
    provider = StubLocalProvider(canned_responses_by_user_prompt={"hello": canned})

    r = provider.complete(
        system_prompt="sys",
        user_prompt="hello",
        response_schema={"type": "object"},
        max_tokens=100,
    )

    assert isinstance(r, ProviderResponse)
    assert r.parsed == canned
    assert r.cost_usd is None
    assert r.provider_name == "stub_local"


def test_unknown_prompt_returns_default_abstention():
    provider = StubLocalProvider()  # no canned responses
    r = provider.complete(
        system_prompt="sys",
        user_prompt="anything",
        response_schema={"type": "object"},
        max_tokens=100,
    )
    assert r.parsed["abstention"] is True
    assert r.parsed["abstention_reason"] == "model_voluntary"


def test_determinism_same_input_same_output():
    provider = StubLocalProvider(
        canned_responses_by_user_prompt={"q": {"abstention": True,
                                                "abstention_reason": "model_voluntary",
                                                "confidence": 0.0,
                                                "clause_id": "x"}}
    )
    a = provider.complete("sys", "q", {"type": "object"}, max_tokens=10)
    b = provider.complete("sys", "q", {"type": "object"}, max_tokens=10)
    assert a.parsed == b.parsed
    assert a.raw_text == b.raw_text


def test_populates_all_audit_fields():
    provider = StubLocalProvider()
    r = provider.complete("sys", "u", {"type": "object"}, max_tokens=10)
    assert r.model_id == "stub-local"
    assert r.model_version == "stub-v1"
    assert r.input_tokens > 0
    assert r.output_tokens >= 0
    assert r.cached_tokens == 0
    assert r.latency_ms >= 0
    assert r.provider_name == "stub_local"


def test_raises_provider_error_when_configured_to():
    """A canned 'error' fixture forces ProviderError — used to test caller
    error handling in higher-layer tests."""
    provider = StubLocalProvider(
        canned_responses_by_user_prompt={"explode": "__RAISE__"}
    )
    with pytest.raises(ProviderError):
        provider.complete("sys", "explode", {"type": "object"}, max_tokens=10)


def test_name_attribute_set():
    assert StubLocalProvider().name == "stub_local"
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
uv run pytest tests/providers/test_stub_local.py -v
```

Expected: FAIL — `ModuleNotFoundError: No module named 'dcr.providers.stub_local'`.

- [ ] **Step 3: Implement StubLocalProvider**

Create `src/dcr/providers/stub_local.py`:

```python
"""Fixture-driven provider used by tests and as the conformance suite's
sentinel implementation. Its existence in production code (not in tests/)
is intentional: it proves the rest of the codebase works without Anthropic.
"""
from __future__ import annotations

import json
import time

from dcr.providers.base import ProviderError, ProviderResponse


class StubLocalProvider:
    """Deterministic provider that returns canned responses keyed by
    user_prompt. Unknown prompts return a default voluntary-abstention
    response so the caller always gets a schema-shaped payload.
    """

    name = "stub_local"

    def __init__(
        self,
        canned_responses_by_user_prompt: dict[str, dict | str] | None = None,
    ):
        # Value can be a dict (returned as `parsed`) or the literal sentinel
        # "__RAISE__" (causes ProviderError — used in error-path tests).
        self._canned = canned_responses_by_user_prompt or {}

    def complete(
        self,
        system_prompt: str,
        user_prompt: str,
        response_schema: dict,
        max_tokens: int,
        temperature: float = 0.0,
        cache_prefix_id: str | None = None,
    ) -> ProviderResponse:
        start = time.perf_counter()

        if user_prompt in self._canned:
            value = self._canned[user_prompt]
            if value == "__RAISE__":
                raise ProviderError("stub_local: forced error for test")
            parsed: dict = value  # type: ignore[assignment]
        else:
            parsed = {
                "abstention": True,
                "abstention_reason": "model_voluntary",
                "confidence": 0.0,
                "clause_id": "unknown",
            }

        latency_ms = max(int((time.perf_counter() - start) * 1000), 0)
        raw_text = json.dumps(parsed, sort_keys=True)

        return ProviderResponse(
            parsed=parsed,
            raw_text=raw_text,
            model_id="stub-local",
            model_version="stub-v1",
            input_tokens=len(system_prompt.split()) + len(user_prompt.split()),
            output_tokens=len(raw_text.split()),
            cached_tokens=0,
            latency_ms=latency_ms,
            cost_usd=None,
            provider_name=self.name,
        )
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
uv run pytest tests/providers/test_stub_local.py -v
```

Expected: PASS — all 6 tests green.

- [ ] **Step 5: Commit**

```bash
git add src/dcr/providers/stub_local.py tests/providers/test_stub_local.py
git commit -m "$(cat <<'EOF'
feat: add StubLocalProvider for deterministic test-time LLM responses

Fixture-driven provider keyed by user_prompt. Unknown prompts default to a
voluntary-abstention payload so the caller always receives a schema-shaped
parsed dict. Supports a "__RAISE__" sentinel for error-path tests. Lives
under src/ (not tests/) so it can also serve as the Goal-2 interface-proof
in the conformance suite.

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
EOF
)"
```

---

### Task 5: Provider conformance test suite (StubLocalProvider as first conforming impl)

**Files:**
- Create: `tests/providers/conformance/__init__.py`
- Create: `tests/providers/conformance/conftest.py`
- Create: `tests/providers/conformance/test_conformance.py`

- [ ] **Step 1: Write the failing tests**

Create `tests/providers/conformance/__init__.py`:

```python
```

Create `tests/providers/conformance/conftest.py`:

```python
"""Conformance suite fixtures. Every ModelProvider implementation must pass
the parametrized tests in test_conformance.py.

To add a new provider implementation:
  1. Add a fixture-id entry to `_provider_factories`.
  2. Implement a no-arg factory function returning the provider instance.
  3. Run: `pytest tests/providers/conformance/ -v`
  4. If integration credentials are required, the factory should `pytest.skip()`
     when they are unavailable.
"""
from __future__ import annotations

import os
from typing import Callable

import pytest

from dcr.providers.base import ModelProvider
from dcr.providers.stub_local import StubLocalProvider


def _stub_factory() -> ModelProvider:
    return StubLocalProvider(
        canned_responses_by_user_prompt={
            "CONFORMANCE_PROBE": {
                "abstention": True,
                "abstention_reason": "model_voluntary",
                "confidence": 0.0,
                "clause_id": "probe",
            }
        }
    )


def _anthropic_factory() -> ModelProvider:
    # Provider implementation lands in Task 6; conformance via Task 7.
    pytest.importorskip("anthropic")
    if not os.environ.get("ANTHROPIC_API_KEY"):
        pytest.skip("ANTHROPIC_API_KEY not set; skipping integration provider")
    from dcr.providers.anthropic_provider import AnthropicProvider
    return AnthropicProvider(model_id="claude-haiku-4-5-20251001")  # cheapest for conformance


_provider_factories: dict[str, Callable[[], ModelProvider]] = {
    "stub_local": _stub_factory,
    "anthropic": _anthropic_factory,
}


@pytest.fixture(params=list(_provider_factories.keys()))
def provider(request) -> ModelProvider:
    return _provider_factories[request.param]()


PROBE_SCHEMA = {
    "type": "object",
    "additionalProperties": False,
    "required": ["abstention", "abstention_reason", "confidence", "clause_id"],
    "properties": {
        "abstention": {"type": "boolean"},
        "abstention_reason": {"type": "string"},
        "confidence": {"type": "number", "minimum": 0.0, "maximum": 1.0},
        "clause_id": {"type": "string"},
    },
}


@pytest.fixture
def probe_schema() -> dict:
    return PROBE_SCHEMA
```

Create `tests/providers/conformance/test_conformance.py`:

```python
"""Provider conformance tests — every ModelProvider implementation must pass.

These tests are the Goal-2 guarantee: when LocalProvider is implemented
later (Sub-project G), passing this suite is a merge gate.
"""
from __future__ import annotations

from dcr.providers.base import ModelProvider, ProviderResponse


def test_isinstance_modelprovider(provider):
    assert isinstance(provider, ModelProvider)


def test_returns_provider_response(provider, probe_schema):
    r = provider.complete(
        system_prompt="You are a conformance probe.",
        user_prompt="CONFORMANCE_PROBE",
        response_schema=probe_schema,
        max_tokens=200,
    )
    assert isinstance(r, ProviderResponse)


def test_parsed_is_dict(provider, probe_schema):
    r = provider.complete(
        "You are a conformance probe.",
        "CONFORMANCE_PROBE",
        probe_schema,
        max_tokens=200,
    )
    assert isinstance(r.parsed, dict)


def test_deterministic_at_temp_zero(provider, probe_schema):
    """Same input + temp=0 must yield identical parsed output across ≥3 runs."""
    results = [
        provider.complete(
            "You are a conformance probe.",
            "CONFORMANCE_PROBE",
            probe_schema,
            max_tokens=200,
            temperature=0.0,
        ).parsed
        for _ in range(3)
    ]
    assert results[0] == results[1] == results[2]


def test_audit_fields_populated(provider, probe_schema):
    r = provider.complete(
        "You are a conformance probe.",
        "CONFORMANCE_PROBE",
        probe_schema,
        max_tokens=200,
    )
    assert r.model_id
    assert r.model_version
    assert r.input_tokens >= 0
    assert r.output_tokens >= 0
    assert r.cached_tokens >= 0
    assert r.latency_ms >= 0
    assert r.provider_name


def test_cost_usd_is_float_or_none(provider, probe_schema):
    r = provider.complete(
        "You are a conformance probe.",
        "CONFORMANCE_PROBE",
        probe_schema,
        max_tokens=200,
    )
    assert r.cost_usd is None or isinstance(r.cost_usd, (int, float))


def test_respects_max_tokens(provider, probe_schema):
    r = provider.complete(
        "You are a conformance probe.",
        "CONFORMANCE_PROBE",
        probe_schema,
        max_tokens=200,
    )
    # Stub may report many small tokens via word-split; allow generous margin.
    assert r.output_tokens <= 2000
```

- [ ] **Step 2: Run tests to verify only Anthropic provider tests fail/skip (Stub provider passes)**

```bash
uv run pytest tests/providers/conformance/ -v
```

Expected:
- All `[stub_local]` parametrizations: PASS.
- All `[anthropic]` parametrizations: SKIPPED with reason "AnthropicProvider not yet implemented" or `ModuleNotFoundError` (Task 6 fills this in).

If `[stub_local]` tests fail, fix the conformance file or `StubLocalProvider` before proceeding.

- [ ] **Step 3: (No new implementation needed.) Stub passes; Anthropic is wired in at T6/T7.**

- [ ] **Step 4: Re-run to confirm green Stub + skipped Anthropic**

```bash
uv run pytest tests/providers/conformance/ -v
```

Expected: 7 PASS for stub_local + 7 SKIPPED for anthropic.

- [ ] **Step 5: Commit**

```bash
git add tests/providers/conformance/
git commit -m "$(cat <<'EOF'
test: add provider conformance suite (StubLocalProvider passing)

Parametrized fixtures run the same conformance tests against every
registered provider. Tests cover: isinstance(ModelProvider), parsed-is-dict,
determinism at temp=0 (3 runs identical), audit fields populated, cost_usd
contract (float or None), max_tokens respect. AnthropicProvider entry
skips until T6 implements it.

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
EOF
)"
```

---

### Task 6: AnthropicProvider (with mocked unit tests)

**Files:**
- Create: `src/dcr/providers/anthropic_provider.py`
- Create: `tests/providers/test_anthropic_provider.py`

- [ ] **Step 1: Write the failing tests**

```python
# tests/providers/test_anthropic_provider.py
"""AnthropicProvider unit tests using a mocked anthropic.Anthropic client.

The conformance suite (tests/providers/conformance/) runs the real-API
integration check when ANTHROPIC_API_KEY is set; these tests do not.
"""
from __future__ import annotations

from unittest.mock import MagicMock, patch

import pytest

from dcr.providers.anthropic_provider import AnthropicProvider, PRICING_PER_MTOK
from dcr.providers.base import ProviderError, ProviderResponse


def _mock_anthropic_response(parsed: dict, input_tokens=120, output_tokens=40,
                              cached_tokens=0, model_id="claude-opus-4-7",
                              message_id="msg_abc"):
    """Build a MagicMock matching anthropic.types.Message shape used here."""
    tool_use_block = MagicMock()
    tool_use_block.type = "tool_use"
    tool_use_block.input = parsed

    msg = MagicMock()
    msg.content = [tool_use_block]
    msg.id = message_id
    msg.model = model_id
    msg.usage = MagicMock(
        input_tokens=input_tokens,
        output_tokens=output_tokens,
        cache_read_input_tokens=cached_tokens,
    )
    return msg


def test_complete_returns_parsed_from_tool_use_block():
    with patch("dcr.providers.anthropic_provider.Anthropic") as MockClient:
        client = MockClient.return_value
        client.messages.create.return_value = _mock_anthropic_response(
            parsed={"clause_id": "c1", "abstention": True,
                    "abstention_reason": "model_voluntary", "confidence": 0.0}
        )
        p = AnthropicProvider(model_id="claude-opus-4-7", api_key="sk-test")
        r = p.complete("sys", "user",
                       response_schema={"type": "object"}, max_tokens=200)

    assert isinstance(r, ProviderResponse)
    assert r.parsed["clause_id"] == "c1"
    assert r.provider_name.startswith("anthropic:")
    assert r.model_id == "claude-opus-4-7"


def test_complete_calls_anthropic_with_tool_use_for_schema_enforcement():
    with patch("dcr.providers.anthropic_provider.Anthropic") as MockClient:
        client = MockClient.return_value
        client.messages.create.return_value = _mock_anthropic_response(parsed={})
        p = AnthropicProvider(model_id="claude-opus-4-7", api_key="sk-test")
        p.complete("sys", "user",
                   response_schema={"type": "object", "properties": {"x": {"type": "string"}}},
                   max_tokens=200)

    call_kwargs = client.messages.create.call_args.kwargs
    assert call_kwargs["model"] == "claude-opus-4-7"
    assert call_kwargs["temperature"] == 0.0  # determinism contract
    assert "tools" in call_kwargs
    assert call_kwargs["tools"][0]["input_schema"] == {
        "type": "object", "properties": {"x": {"type": "string"}}}
    assert call_kwargs["tool_choice"] == {"type": "tool", "name": "submit_finding"}


def test_cost_calculation_for_opus():
    rates = PRICING_PER_MTOK["claude-opus-4-7"]
    with patch("dcr.providers.anthropic_provider.Anthropic") as MockClient:
        client = MockClient.return_value
        client.messages.create.return_value = _mock_anthropic_response(
            parsed={}, input_tokens=1_000_000, output_tokens=1_000_000, cached_tokens=0,
        )
        p = AnthropicProvider(model_id="claude-opus-4-7", api_key="sk-test")
        r = p.complete("sys", "user", response_schema={"type": "object"}, max_tokens=10)

    expected = rates["input"] + rates["output"]
    assert r.cost_usd == pytest.approx(expected, rel=1e-9)


def test_cost_calculation_with_cache_read():
    rates = PRICING_PER_MTOK["claude-opus-4-7"]
    with patch("dcr.providers.anthropic_provider.Anthropic") as MockClient:
        client = MockClient.return_value
        client.messages.create.return_value = _mock_anthropic_response(
            parsed={}, input_tokens=1_000_000, output_tokens=0, cached_tokens=800_000,
        )
        p = AnthropicProvider(model_id="claude-opus-4-7", api_key="sk-test")
        r = p.complete("sys", "user", response_schema={"type": "object"}, max_tokens=10)

    # 800k cached + 200k regular input + 0 output
    expected = 0.8 * rates["cache_read"] + 0.2 * rates["input"]
    assert r.cost_usd == pytest.approx(expected, rel=1e-9)


def test_cost_returns_none_for_unknown_model():
    with patch("dcr.providers.anthropic_provider.Anthropic") as MockClient:
        client = MockClient.return_value
        client.messages.create.return_value = _mock_anthropic_response(parsed={})
        p = AnthropicProvider(model_id="unknown-model-xyz", api_key="sk-test")
        r = p.complete("sys", "user", response_schema={"type": "object"}, max_tokens=10)
    assert r.cost_usd is None


def test_raises_provider_error_when_no_tool_use_block():
    msg = MagicMock()
    msg.content = []  # no tool_use
    msg.id = "msg_x"
    msg.model = "claude-opus-4-7"
    msg.usage = MagicMock(input_tokens=10, output_tokens=0, cache_read_input_tokens=0)

    with patch("dcr.providers.anthropic_provider.Anthropic") as MockClient:
        client = MockClient.return_value
        client.messages.create.return_value = msg
        p = AnthropicProvider(model_id="claude-opus-4-7", api_key="sk-test")
        with pytest.raises(ProviderError):
            p.complete("sys", "user", response_schema={"type": "object"}, max_tokens=10)
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
uv run pytest tests/providers/test_anthropic_provider.py -v
```

Expected: FAIL — `ModuleNotFoundError: No module named 'dcr.providers.anthropic_provider'`.

- [ ] **Step 3: Implement AnthropicProvider**

Create `src/dcr/providers/anthropic_provider.py`:

```python
"""Anthropic implementation of ModelProvider.

Uses tool_use as the structured-output mechanism (most reliable JSON-shape
enforcement currently available from Claude). The schema passed by the
caller becomes the tool's input_schema. tool_choice forces the model to
emit a tool_use block in its response.

Cost calculation uses a per-model rate table; unknown models return None
for cost_usd (contract: providers never invent costs).
"""
from __future__ import annotations

import os
import time

from anthropic import Anthropic

from dcr.providers.base import ProviderError, ProviderResponse

# Prices are USD per 1,000,000 tokens. Verify against current Anthropic
# pricing before each release; deviations affect cost-cap behavior.
PRICING_PER_MTOK: dict[str, dict[str, float]] = {
    "claude-opus-4-7": {"input": 15.00, "output": 75.00, "cache_read": 1.50},
    "claude-sonnet-4-6": {"input": 3.00, "output": 15.00, "cache_read": 0.30},
    "claude-haiku-4-5-20251001": {"input": 1.00, "output": 5.00, "cache_read": 0.10},
}


class AnthropicProvider:
    """Wraps anthropic.Anthropic with the ModelProvider contract."""

    def __init__(self, model_id: str = "claude-opus-4-7", api_key: str | None = None):
        self.model_id = model_id
        self.name = f"anthropic:{model_id}"
        self._client = Anthropic(api_key=api_key or os.environ.get("ANTHROPIC_API_KEY"))

    def complete(
        self,
        system_prompt: str,
        user_prompt: str,
        response_schema: dict,
        max_tokens: int,
        temperature: float = 0.0,
        cache_prefix_id: str | None = None,
    ) -> ProviderResponse:
        start = time.perf_counter()

        tool = {
            "name": "submit_finding",
            "description": "Submit the analysis result conforming to the provided schema.",
            "input_schema": response_schema,
        }

        msg = self._client.messages.create(
            model=self.model_id,
            max_tokens=max_tokens,
            temperature=temperature,
            system=system_prompt,
            tools=[tool],
            tool_choice={"type": "tool", "name": "submit_finding"},
            messages=[{"role": "user", "content": user_prompt}],
        )

        latency_ms = max(int((time.perf_counter() - start) * 1000), 0)

        tool_use_block = next(
            (b for b in msg.content if getattr(b, "type", None) == "tool_use"),
            None,
        )
        if tool_use_block is None:
            raise ProviderError(
                f"AnthropicProvider: no tool_use block in response (msg_id={msg.id})"
            )

        parsed = tool_use_block.input
        if not isinstance(parsed, dict):
            raise ProviderError(
                f"AnthropicProvider: tool_use.input is not a dict (msg_id={msg.id})"
            )

        input_tokens = msg.usage.input_tokens
        output_tokens = msg.usage.output_tokens
        cached_tokens = getattr(msg.usage, "cache_read_input_tokens", 0) or 0

        return ProviderResponse(
            parsed=parsed,
            raw_text=str(parsed),
            model_id=self.model_id,
            model_version=msg.id,
            input_tokens=input_tokens,
            output_tokens=output_tokens,
            cached_tokens=cached_tokens,
            latency_ms=latency_ms,
            cost_usd=self._calculate_cost(input_tokens, output_tokens, cached_tokens),
            provider_name=self.name,
        )

    def _calculate_cost(
        self, input_tokens: int, output_tokens: int, cached_tokens: int
    ) -> float | None:
        rates = PRICING_PER_MTOK.get(self.model_id)
        if rates is None:
            return None
        regular_input = max(input_tokens - cached_tokens, 0)
        return (
            (regular_input / 1_000_000) * rates["input"]
            + (cached_tokens / 1_000_000) * rates["cache_read"]
            + (output_tokens / 1_000_000) * rates["output"]
        )
```

- [ ] **Step 4: Run unit tests to verify they pass**

```bash
uv run pytest tests/providers/test_anthropic_provider.py -v
```

Expected: PASS — all 6 tests green.

- [ ] **Step 5: Commit**

```bash
git add src/dcr/providers/anthropic_provider.py tests/providers/test_anthropic_provider.py
git commit -m "$(cat <<'EOF'
feat: add AnthropicProvider with tool_use schema enforcement and cost calc

Wraps anthropic.Anthropic behind ModelProvider. Uses tool_use with
tool_choice to force structured JSON output conforming to the caller's
schema. Computes USD cost from per-model rate table (Opus 4.7, Sonnet 4.6,
Haiku 4.5); unknown models return None. Raises ProviderError when no
tool_use block is present in the response.

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
EOF
)"
```

---

### Task 7: AnthropicProvider passes the conformance suite (integration)

**Files:**
- Modify: none (the conformance fixture in T5 already wires Anthropic in)

- [ ] **Step 1: Confirm Anthropic factory in conformance/conftest.py is correct**

Re-read `tests/providers/conformance/conftest.py`. Confirm it imports `AnthropicProvider` and skips when `ANTHROPIC_API_KEY` is unset. No code change needed; this task verifies behavior.

- [ ] **Step 2: Run conformance suite WITHOUT key — confirm skips**

```bash
unset ANTHROPIC_API_KEY
uv run pytest tests/providers/conformance/ -v
```

Expected: 7 PASS (stub_local) + 7 SKIPPED (anthropic) with reason "ANTHROPIC_API_KEY not set".

- [ ] **Step 3: Run conformance suite WITH key (real API hit, cheapest model)**

```bash
export ANTHROPIC_API_KEY=sk-ant-...   # set in your shell
uv run pytest tests/providers/conformance/ -v -m "not integration" --tb=short
```

Expected: 7 PASS (stub_local) + 7 PASS (anthropic via Haiku). Cost: a few cents total (Haiku is cheap; the probe schema is small).

If `test_deterministic_at_temp_zero` fails, investigate first whether Haiku at temp=0 is reproducible on the probe (it should be — Anthropic API is deterministic at temp=0 within the same model snapshot). If a transient determinism failure appears, retry once; persistent failure is a bug to investigate before proceeding.

- [ ] **Step 4: Document the integration-run command in README later (T14).**

(No code change in this task.)

- [ ] **Step 5: Commit (empty marker commit acceptable, OR skip if no file changes)**

If no files changed, skip the commit. This task is verification-only. Note in `tests/providers/conformance/conftest.py` may already need adjusting (e.g., model id) — if so, commit that adjustment with:

```bash
git add tests/providers/conformance/conftest.py
git commit -m "$(cat <<'EOF'
test: verify AnthropicProvider passes conformance against Claude Haiku 4.5

Confirms real-API conformance on the cheapest production-grade model
(used only in conformance to keep cost low; Extractor will use Opus 4.7
in production per spec §6 C7).

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
EOF
)"
```

---

### Task 8: SQLAlchemy database setup

**Files:**
- Create: `src/dcr/store/__init__.py`
- Create: `src/dcr/store/db.py`
- Create: `tests/store/__init__.py`
- Create: `tests/store/test_db.py`

- [ ] **Step 1: Write the failing tests**

```python
# tests/store/test_db.py
"""Tests for engine + session factory setup."""
import pytest
from sqlalchemy import text

from dcr.store.db import Base, make_engine, make_session_factory


def test_make_engine_sqlite_memory_works():
    engine = make_engine("sqlite:///:memory:")
    with engine.connect() as conn:
        result = conn.execute(text("SELECT 1")).scalar()
        assert result == 1


def test_session_factory_yields_usable_session():
    engine = make_engine("sqlite:///:memory:")
    Session = make_session_factory(engine)
    with Session() as s:
        result = s.execute(text("SELECT 42")).scalar()
        assert result == 42


def test_base_is_declarativebase_subclass():
    from sqlalchemy.orm import DeclarativeBase
    assert issubclass(Base, DeclarativeBase)


def test_create_all_runs_without_error_on_empty_metadata():
    engine = make_engine("sqlite:///:memory:")
    # No models declared yet (T9); should still be a no-op.
    Base.metadata.create_all(engine)
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
uv run pytest tests/store/test_db.py -v
```

Expected: FAIL — `ModuleNotFoundError: No module named 'dcr.store'`.

- [ ] **Step 3: Implement**

Create `src/dcr/store/__init__.py`:

```python
```

Create `tests/store/__init__.py`:

```python
```

Create `src/dcr/store/db.py`:

```python
"""SQLAlchemy engine + session factory.

SQLite for dev / MVP; Postgres swap in Sub-project H is a connection-string
change. Models live in `models.py`; this module only owns engine/session.
"""
from __future__ import annotations

from sqlalchemy import Engine, create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker


class Base(DeclarativeBase):
    """Single declarative base for all ORM models."""


def make_engine(db_url: str = "sqlite:///dcr.db") -> Engine:
    """Construct the SQLAlchemy Engine. echo=False in production-grade code;
    use SQLALCHEMY_ECHO=1 env var if needed for debugging."""
    import os
    echo = os.environ.get("SQLALCHEMY_ECHO") == "1"
    return create_engine(db_url, echo=echo, future=True)


def make_session_factory(engine: Engine):
    """sessionmaker bound to the given engine. expire_on_commit=False so
    callers can use returned ORM objects after commit without re-querying."""
    return sessionmaker(bind=engine, expire_on_commit=False, future=True)
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
uv run pytest tests/store/test_db.py -v
```

Expected: PASS — all 4 tests green.

- [ ] **Step 5: Commit**

```bash
git add src/dcr/store/__init__.py src/dcr/store/db.py tests/store/__init__.py tests/store/test_db.py
git commit -m "$(cat <<'EOF'
feat: add SQLAlchemy engine, session factory, and declarative Base

SQLite for MVP; engine accepts any SQLAlchemy URL so Postgres swap in
Sub-project H is a config change. expire_on_commit=False allows returning
ORM objects to callers after commits without re-fetching.

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
EOF
)"
```

---

### Task 9: ORM models for findings, audit trail, version registries

**Files:**
- Create: `src/dcr/store/models.py`
- Create: `tests/store/test_models.py`

- [ ] **Step 1: Write the failing tests**

```python
# tests/store/test_models.py
"""Tests that the ORM models declare correctly and create_all builds the
expected tables."""
from sqlalchemy import inspect

from dcr.store.db import Base, make_engine
from dcr.store import models  # noqa: F401 — import for side effect (model registration)


def _engine_with_schema():
    engine = make_engine("sqlite:///:memory:")
    Base.metadata.create_all(engine)
    return engine


def test_all_expected_tables_created():
    engine = _engine_with_schema()
    insp = inspect(engine)
    tables = set(insp.get_table_names())
    assert tables == {
        "prompt_versions",
        "model_versions",
        "reg_snapshot_versions",
        "audit_trail",
        "findings",
    }


def test_findings_table_columns():
    engine = _engine_with_schema()
    insp = inspect(engine)
    cols = {c["name"] for c in insp.get_columns("findings")}
    expected = {
        "id", "clause_id", "category_id", "rule_id",
        "severity", "likelihood", "negotiability", "composite_score",
        "evidence_json", "action_json",
        "confidence", "abstention", "abstention_reason",
        "raw_draft_json", "idempotency_key",
        "supersedes_id", "audit_id", "created_at",
    }
    assert expected.issubset(cols)


def test_audit_trail_table_columns():
    engine = _engine_with_schema()
    insp = inspect(engine)
    cols = {c["name"] for c in insp.get_columns("audit_trail")}
    expected = {
        "id",
        "extractor_prompt_version_id", "verifier_prompt_version_id",
        "extractor_model_version_id", "verifier_model_version_id",
        "reg_corpus_version_id",
        "retrieved_reg_hashes_json",
        "extractor_latency_ms", "verifier_latency_ms",
        "extractor_cost_usd", "verifier_cost_usd",
        "created_at",
    }
    assert expected.issubset(cols)


def test_prompt_versions_unique_constraint():
    engine = _engine_with_schema()
    insp = inspect(engine)
    uniques = insp.get_unique_constraints("prompt_versions")
    # SQLAlchemy may name the constraint; check that (name, version) is unique
    constrained_cols = {tuple(sorted(u["column_names"])) for u in uniques}
    assert ("name", "version") in constrained_cols


def test_findings_has_idempotency_key_index():
    engine = _engine_with_schema()
    insp = inspect(engine)
    indexed = {tuple(i["column_names"]) for i in insp.get_indexes("findings")}
    assert any("idempotency_key" in tup for tup in indexed)
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
uv run pytest tests/store/test_models.py -v
```

Expected: FAIL — `ImportError: cannot import name 'models' from 'dcr.store'`.

- [ ] **Step 3: Implement the models**

Create `src/dcr/store/models.py`:

```python
"""ORM models for Sub-project C's findings store.

All findings, abstentions, and their full audit trail live here. Append-only:
no row is ever updated in place; corrections create a new row with
supersedes_id pointing to the prior row.
"""
from __future__ import annotations

from datetime import datetime, timezone

from sqlalchemy import (
    JSON, Boolean, DateTime, Float, ForeignKey, Integer, String, UniqueConstraint,
)
from sqlalchemy.orm import Mapped, mapped_column

from dcr.store.db import Base


def _utc_now() -> datetime:
    return datetime.now(timezone.utc)


class PromptVersion(Base):
    """Versioned prompt definition. Findings reference the version active
    when they were produced — required for reproducibility."""
    __tablename__ = "prompt_versions"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(100))  # "extractor" | "verifier"
    version: Mapped[str] = mapped_column(String(50))
    content_hash: Mapped[str] = mapped_column(String(64))
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=_utc_now,
    )

    __table_args__ = (UniqueConstraint("name", "version", name="uq_prompt_name_version"),)


class ModelVersion(Base):
    """Versioned model identity. Stores provider + model + provider-specific
    version string (e.g., Anthropic message_id snapshot)."""
    __tablename__ = "model_versions"

    id: Mapped[int] = mapped_column(primary_key=True)
    provider_name: Mapped[str] = mapped_column(String(100))
    model_id: Mapped[str] = mapped_column(String(100))
    model_version: Mapped[str] = mapped_column(String(100))
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=_utc_now,
    )

    __table_args__ = (
        UniqueConstraint("provider_name", "model_id", "model_version",
                         name="uq_model_provider_id_version"),
    )


class RegSnapshotVersion(Base):
    """Pointer to a specific regulatory-corpus snapshot. The hash identifies
    a frozen state of FAR/DFARS/§4022/OT Guide text."""
    __tablename__ = "reg_snapshot_versions"

    id: Mapped[int] = mapped_column(primary_key=True)
    corpus_version_hash: Mapped[str] = mapped_column(String(64), unique=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=_utc_now,
    )


class AuditTrail(Base):
    """One row per analyze_clause invocation. Linked from Finding via audit_id.
    Every column is set by the orchestrator (Sub-project C M4+) at write time."""
    __tablename__ = "audit_trail"

    id: Mapped[int] = mapped_column(primary_key=True)
    extractor_prompt_version_id: Mapped[int | None] = mapped_column(
        ForeignKey("prompt_versions.id"), nullable=True,
    )
    verifier_prompt_version_id: Mapped[int | None] = mapped_column(
        ForeignKey("prompt_versions.id"), nullable=True,
    )
    extractor_model_version_id: Mapped[int | None] = mapped_column(
        ForeignKey("model_versions.id"), nullable=True,
    )
    verifier_model_version_id: Mapped[int | None] = mapped_column(
        ForeignKey("model_versions.id"), nullable=True,
    )
    reg_corpus_version_id: Mapped[int | None] = mapped_column(
        ForeignKey("reg_snapshot_versions.id"), nullable=True,
    )
    retrieved_reg_hashes_json: Mapped[list | None] = mapped_column(JSON, nullable=True)
    extractor_latency_ms: Mapped[int | None] = mapped_column(Integer, nullable=True)
    verifier_latency_ms: Mapped[int | None] = mapped_column(Integer, nullable=True)
    extractor_cost_usd: Mapped[float | None] = mapped_column(Float, nullable=True)
    verifier_cost_usd: Mapped[float | None] = mapped_column(Float, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=_utc_now,
    )


class Finding(Base):
    """A risk finding row. May be a Verified finding (abstention=False) or
    an Abstained finding (abstention=True, evidence and action nullable).
    Append-only; corrections create a new row with supersedes_id set."""
    __tablename__ = "findings"

    id: Mapped[int] = mapped_column(primary_key=True)
    clause_id: Mapped[str] = mapped_column(String(100), index=True)
    category_id: Mapped[int | None] = mapped_column(Integer, nullable=True)
    rule_id: Mapped[str | None] = mapped_column(String(100), nullable=True)
    severity: Mapped[str | None] = mapped_column(String(20), nullable=True)
    likelihood: Mapped[str | None] = mapped_column(String(20), nullable=True)
    negotiability: Mapped[str | None] = mapped_column(String(30), nullable=True)
    composite_score: Mapped[int | None] = mapped_column(Integer, nullable=True)
    evidence_json: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    action_json: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    confidence: Mapped[float] = mapped_column(Float)
    abstention: Mapped[bool] = mapped_column(Boolean, default=False)
    abstention_reason: Mapped[str | None] = mapped_column(String(100), nullable=True)
    raw_draft_json: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    idempotency_key: Mapped[str] = mapped_column(String(64), index=True)
    supersedes_id: Mapped[int | None] = mapped_column(
        ForeignKey("findings.id"), nullable=True,
    )
    audit_id: Mapped[int] = mapped_column(ForeignKey("audit_trail.id"))
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=_utc_now,
    )
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
uv run pytest tests/store/test_models.py -v
```

Expected: PASS — all 5 tests green.

- [ ] **Step 5: Commit**

```bash
git add src/dcr/store/models.py tests/store/test_models.py
git commit -m "$(cat <<'EOF'
feat: add ORM models for findings, audit trail, and version registries

Five tables: findings, audit_trail, prompt_versions, model_versions,
reg_snapshot_versions. Findings table carries audit_id FK and supersedes_id
self-FK for append-only correction chains. Idempotency_key is indexed for
fast cache lookups (orchestrator de-dup in M4+).

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
EOF
)"
```

---

### Task 10: VersionRegistry (get-or-create helpers)

**Files:**
- Create: `src/dcr/store/versions.py`
- Create: `tests/store/test_versions.py`

- [ ] **Step 1: Write the failing tests**

```python
# tests/store/test_versions.py
"""Tests for VersionRegistry get-or-create helpers."""
import pytest

from dcr.store.db import Base, make_engine, make_session_factory
from dcr.store import models  # noqa: F401
from dcr.store.versions import VersionRegistry


@pytest.fixture
def session():
    engine = make_engine("sqlite:///:memory:")
    Base.metadata.create_all(engine)
    Session = make_session_factory(engine)
    with Session() as s:
        yield s


def test_get_or_create_prompt_version_creates_new(session):
    reg = VersionRegistry(session)
    pid = reg.get_or_create_prompt_version("extractor", "v1.0", "hashabc")
    assert pid > 0


def test_get_or_create_prompt_version_returns_existing(session):
    reg = VersionRegistry(session)
    pid1 = reg.get_or_create_prompt_version("extractor", "v1.0", "hashabc")
    pid2 = reg.get_or_create_prompt_version("extractor", "v1.0", "hashabc")
    assert pid1 == pid2


def test_different_versions_get_different_ids(session):
    reg = VersionRegistry(session)
    pid1 = reg.get_or_create_prompt_version("extractor", "v1.0", "h1")
    pid2 = reg.get_or_create_prompt_version("extractor", "v1.1", "h2")
    assert pid1 != pid2


def test_get_or_create_model_version(session):
    reg = VersionRegistry(session)
    mid1 = reg.get_or_create_model_version("anthropic:claude-opus-4-7",
                                           "claude-opus-4-7", "msg_xyz")
    mid2 = reg.get_or_create_model_version("anthropic:claude-opus-4-7",
                                           "claude-opus-4-7", "msg_xyz")
    assert mid1 == mid2


def test_get_or_create_reg_snapshot_version(session):
    reg = VersionRegistry(session)
    rid1 = reg.get_or_create_reg_snapshot_version("sha256:corpus_v1")
    rid2 = reg.get_or_create_reg_snapshot_version("sha256:corpus_v1")
    assert rid1 == rid2
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
uv run pytest tests/store/test_versions.py -v
```

Expected: FAIL — `ModuleNotFoundError: No module named 'dcr.store.versions'`.

- [ ] **Step 3: Implement**

Create `src/dcr/store/versions.py`:

```python
"""Version-registry helpers. Idempotent get-or-create for prompt, model,
and reg-corpus version rows. Used by the orchestrator (M4+) to populate
audit_trail foreign keys.
"""
from __future__ import annotations

from sqlalchemy import select
from sqlalchemy.orm import Session

from dcr.store.models import ModelVersion, PromptVersion, RegSnapshotVersion


class VersionRegistry:
    """Single entry point for resolving (and lazily creating) version-row IDs.

    Callers pass a SQLAlchemy Session; the registry does not own transaction
    boundaries — callers commit when the surrounding work commits.
    """

    def __init__(self, session: Session):
        self._s = session

    def get_or_create_prompt_version(
        self, name: str, version: str, content_hash: str
    ) -> int:
        existing = self._s.scalar(
            select(PromptVersion).where(
                PromptVersion.name == name, PromptVersion.version == version
            )
        )
        if existing:
            return existing.id
        row = PromptVersion(name=name, version=version, content_hash=content_hash)
        self._s.add(row)
        self._s.flush()
        return row.id

    def get_or_create_model_version(
        self, provider_name: str, model_id: str, model_version: str
    ) -> int:
        existing = self._s.scalar(
            select(ModelVersion).where(
                ModelVersion.provider_name == provider_name,
                ModelVersion.model_id == model_id,
                ModelVersion.model_version == model_version,
            )
        )
        if existing:
            return existing.id
        row = ModelVersion(
            provider_name=provider_name,
            model_id=model_id,
            model_version=model_version,
        )
        self._s.add(row)
        self._s.flush()
        return row.id

    def get_or_create_reg_snapshot_version(self, corpus_version_hash: str) -> int:
        existing = self._s.scalar(
            select(RegSnapshotVersion).where(
                RegSnapshotVersion.corpus_version_hash == corpus_version_hash
            )
        )
        if existing:
            return existing.id
        row = RegSnapshotVersion(corpus_version_hash=corpus_version_hash)
        self._s.add(row)
        self._s.flush()
        return row.id
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
uv run pytest tests/store/test_versions.py -v
```

Expected: PASS — all 5 tests green.

- [ ] **Step 5: Commit**

```bash
git add src/dcr/store/versions.py tests/store/test_versions.py
git commit -m "$(cat <<'EOF'
feat: add VersionRegistry with idempotent get-or-create for version IDs

Single helper for resolving prompt / model / reg-snapshot version row IDs.
Returns existing ID if present; inserts and flushes otherwise. Callers
own transaction boundaries.

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
EOF
)"
```

---

### Task 11: FindingsRepository (append-only insert + query)

**Files:**
- Create: `src/dcr/store/findings.py`
- Create: `tests/store/test_findings.py`

- [ ] **Step 1: Write the failing tests**

```python
# tests/store/test_findings.py
"""Tests for FindingsRepository."""
import pytest

from dcr.store.db import Base, make_engine, make_session_factory
from dcr.store import models  # noqa: F401
from dcr.store.findings import FindingsRepository
from dcr.store.models import AuditTrail


def _setup():
    engine = make_engine("sqlite:///:memory:")
    Base.metadata.create_all(engine)
    Session = make_session_factory(engine)
    return Session


@pytest.fixture
def session():
    Session = _setup()
    with Session() as s:
        yield s


def _new_audit(s) -> int:
    a = AuditTrail()
    s.add(a)
    s.flush()
    return a.id


def _verified_payload(audit_id, idem="idem-1", clause="c_1"):
    return dict(
        clause_id=clause,
        category_id=2,
        rule_id="IP-DR-UR-01",
        severity="critical",
        likelihood="high",
        negotiability="hard",
        composite_score=94,
        evidence_json={"text_spans": [], "regulatory_citations": [], "reasoning": "x"},
        action_json={"plain_language": "p", "redline_suggestion": "r", "urgency": "before_signature"},
        confidence=0.94,
        abstention=False,
        abstention_reason=None,
        raw_draft_json=None,
        idempotency_key=idem,
        audit_id=audit_id,
    )


def test_insert_verified_finding(session):
    audit_id = _new_audit(session)
    repo = FindingsRepository(session)
    row_id = repo.insert(**_verified_payload(audit_id))
    assert row_id > 0


def test_insert_abstained_finding(session):
    audit_id = _new_audit(session)
    repo = FindingsRepository(session)
    row_id = repo.insert(
        clause_id="c_8",
        confidence=0.31,
        abstention=True,
        abstention_reason="low_self_confidence",
        raw_draft_json={"some": "draft"},
        idempotency_key="idem-2",
        audit_id=audit_id,
        category_id=None, rule_id=None, severity=None, likelihood=None,
        negotiability=None, composite_score=None, evidence_json=None,
        action_json=None,
    )
    assert row_id > 0


def test_query_by_clause_id_returns_all(session):
    audit_id = _new_audit(session)
    repo = FindingsRepository(session)
    repo.insert(**_verified_payload(audit_id, idem="a", clause="c_X"))
    repo.insert(**_verified_payload(audit_id, idem="b", clause="c_X"))
    repo.insert(**_verified_payload(audit_id, idem="c", clause="c_Y"))
    session.commit()

    rows = repo.query_by_clause_id("c_X")
    assert len(rows) == 2


def test_query_by_idempotency_key(session):
    audit_id = _new_audit(session)
    repo = FindingsRepository(session)
    rid = repo.insert(**_verified_payload(audit_id, idem="unique-key"))
    session.commit()

    found = repo.query_by_idempotency_key("unique-key")
    assert found is not None
    assert found.id == rid


def test_query_by_idempotency_key_missing_returns_none(session):
    repo = FindingsRepository(session)
    assert repo.query_by_idempotency_key("nope") is None


def test_supersede_creates_new_row_with_supersedes_id(session):
    audit_id = _new_audit(session)
    repo = FindingsRepository(session)
    original_id = repo.insert(**_verified_payload(audit_id, idem="orig"))
    session.commit()

    correction_id = repo.insert(
        **{**_verified_payload(audit_id, idem="corr"), "rule_id": "IP-DR-UR-02"},
        supersedes_id=original_id,
    )
    session.commit()

    correction = repo.query_by_idempotency_key("corr")
    assert correction.id == correction_id
    assert correction.supersedes_id == original_id
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
uv run pytest tests/store/test_findings.py -v
```

Expected: FAIL — `ModuleNotFoundError: No module named 'dcr.store.findings'`.

- [ ] **Step 3: Implement**

Create `src/dcr/store/findings.py`:

```python
"""FindingsRepository — append-only insert + query helpers for the
`findings` table.

This repository never updates. Corrections are inserted as new rows with
`supersedes_id` set; the original is preserved forever (audit invariant
from spec §14).
"""
from __future__ import annotations

from sqlalchemy import select
from sqlalchemy.orm import Session

from dcr.store.models import Finding


class FindingsRepository:
    def __init__(self, session: Session):
        self._s = session

    def insert(
        self,
        *,
        clause_id: str,
        confidence: float,
        abstention: bool,
        idempotency_key: str,
        audit_id: int,
        category_id: int | None = None,
        rule_id: str | None = None,
        severity: str | None = None,
        likelihood: str | None = None,
        negotiability: str | None = None,
        composite_score: int | None = None,
        evidence_json: dict | None = None,
        action_json: dict | None = None,
        abstention_reason: str | None = None,
        raw_draft_json: dict | None = None,
        supersedes_id: int | None = None,
    ) -> int:
        row = Finding(
            clause_id=clause_id,
            category_id=category_id,
            rule_id=rule_id,
            severity=severity,
            likelihood=likelihood,
            negotiability=negotiability,
            composite_score=composite_score,
            evidence_json=evidence_json,
            action_json=action_json,
            confidence=confidence,
            abstention=abstention,
            abstention_reason=abstention_reason,
            raw_draft_json=raw_draft_json,
            idempotency_key=idempotency_key,
            supersedes_id=supersedes_id,
            audit_id=audit_id,
        )
        self._s.add(row)
        self._s.flush()
        return row.id

    def query_by_clause_id(self, clause_id: str) -> list[Finding]:
        return list(
            self._s.scalars(
                select(Finding).where(Finding.clause_id == clause_id)
            )
        )

    def query_by_idempotency_key(self, idempotency_key: str) -> Finding | None:
        return self._s.scalar(
            select(Finding).where(Finding.idempotency_key == idempotency_key)
        )
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
uv run pytest tests/store/test_findings.py -v
```

Expected: PASS — all 6 tests green.

- [ ] **Step 5: Commit**

```bash
git add src/dcr/store/findings.py tests/store/test_findings.py
git commit -m "$(cat <<'EOF'
feat: add FindingsRepository with append-only insert and query helpers

Insert accepts all fields (verified or abstained) as kwargs; queries by
clause_id and idempotency_key. supersedes_id supports the append-only
correction chain. Repository does not commit — callers own transactions.

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
EOF
)"
```

---

### Task 12: AuditRepository (insert audit-trail row)

**Files:**
- Create: `src/dcr/store/audit.py`
- Create: `tests/store/test_audit.py`

- [ ] **Step 1: Write the failing tests**

```python
# tests/store/test_audit.py
"""Tests for AuditRepository."""
import pytest

from dcr.store.db import Base, make_engine, make_session_factory
from dcr.store import models  # noqa: F401
from dcr.store.audit import AuditRepository
from dcr.store.models import AuditTrail


@pytest.fixture
def session():
    engine = make_engine("sqlite:///:memory:")
    Base.metadata.create_all(engine)
    Session = make_session_factory(engine)
    with Session() as s:
        yield s


def test_insert_full_audit_row(session):
    repo = AuditRepository(session)
    aid = repo.insert(
        extractor_prompt_version_id=None,
        verifier_prompt_version_id=None,
        extractor_model_version_id=None,
        verifier_model_version_id=None,
        reg_corpus_version_id=None,
        retrieved_reg_hashes_json=["sha256:a", "sha256:b"],
        extractor_latency_ms=1200,
        verifier_latency_ms=350,
        extractor_cost_usd=0.0123,
        verifier_cost_usd=0.0008,
    )
    assert aid > 0
    row = session.get(AuditTrail, aid)
    assert row.extractor_latency_ms == 1200
    assert row.retrieved_reg_hashes_json == ["sha256:a", "sha256:b"]
    assert row.created_at is not None


def test_insert_minimum_audit_row(session):
    repo = AuditRepository(session)
    aid = repo.insert()
    row = session.get(AuditTrail, aid)
    assert row.extractor_latency_ms is None
    assert row.retrieved_reg_hashes_json is None
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
uv run pytest tests/store/test_audit.py -v
```

Expected: FAIL — `ModuleNotFoundError: No module named 'dcr.store.audit'`.

- [ ] **Step 3: Implement**

Create `src/dcr/store/audit.py`:

```python
"""AuditRepository — inserts one audit_trail row per orchestrator invocation.

The orchestrator (M4+) calls this once per analyze_clause call, gets back
an audit_id, then passes that id to FindingsRepository.insert for every
finding produced during the same call.
"""
from __future__ import annotations

from sqlalchemy.orm import Session

from dcr.store.models import AuditTrail


class AuditRepository:
    def __init__(self, session: Session):
        self._s = session

    def insert(
        self,
        *,
        extractor_prompt_version_id: int | None = None,
        verifier_prompt_version_id: int | None = None,
        extractor_model_version_id: int | None = None,
        verifier_model_version_id: int | None = None,
        reg_corpus_version_id: int | None = None,
        retrieved_reg_hashes_json: list | None = None,
        extractor_latency_ms: int | None = None,
        verifier_latency_ms: int | None = None,
        extractor_cost_usd: float | None = None,
        verifier_cost_usd: float | None = None,
    ) -> int:
        row = AuditTrail(
            extractor_prompt_version_id=extractor_prompt_version_id,
            verifier_prompt_version_id=verifier_prompt_version_id,
            extractor_model_version_id=extractor_model_version_id,
            verifier_model_version_id=verifier_model_version_id,
            reg_corpus_version_id=reg_corpus_version_id,
            retrieved_reg_hashes_json=retrieved_reg_hashes_json,
            extractor_latency_ms=extractor_latency_ms,
            verifier_latency_ms=verifier_latency_ms,
            extractor_cost_usd=extractor_cost_usd,
            verifier_cost_usd=verifier_cost_usd,
        )
        self._s.add(row)
        self._s.flush()
        return row.id
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
uv run pytest tests/store/test_audit.py -v
```

Expected: PASS — all 2 tests green.

- [ ] **Step 5: Commit**

```bash
git add src/dcr/store/audit.py tests/store/test_audit.py
git commit -m "$(cat <<'EOF'
feat: add AuditRepository for inserting audit_trail rows

Single insert helper carrying every reproducibility field (prompt/model/reg
version IDs, retrieved snippet hashes, latency, cost). All fields are
optional; the orchestrator populates what it has at write time.

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
EOF
)"
```

---

### Task 13: End-to-end skeleton script + test

**Files:**
- Create: `scripts/skeleton_e2e.py`
- Create: `tests/test_e2e_skeleton.py`

- [ ] **Step 1: Write the failing test**

```python
# tests/test_e2e_skeleton.py
"""End-to-end M1 skeleton test.

Runs the full stub flow: StubLocalProvider returns a canned abstained-finding
payload → VersionRegistry creates version rows → AuditRepository inserts audit
→ FindingsRepository inserts the abstained finding → query verifies the row
is persisted with the correct audit linkage.
"""
import json

from dcr.store.db import Base, make_engine, make_session_factory
from dcr.store import models  # noqa: F401
from dcr.store.audit import AuditRepository
from dcr.store.findings import FindingsRepository
from dcr.store.versions import VersionRegistry
from dcr.providers.stub_local import StubLocalProvider
from scripts.skeleton_e2e import run_skeleton


def test_skeleton_e2e_persists_finding_with_audit():
    engine = make_engine("sqlite:///:memory:")
    Base.metadata.create_all(engine)
    Session = make_session_factory(engine)

    # Pre-load a canned response so the stub returns a known abstained payload.
    canned = {
        "abstention": True,
        "abstention_reason": "model_voluntary",
        "confidence": 0.0,
        "clause_id": "c_M1_demo",
    }
    provider = StubLocalProvider(
        canned_responses_by_user_prompt={"DEMO_CLAUSE": canned}
    )

    finding_id = run_skeleton(
        Session_factory=Session,
        provider=provider,
        clause_id="c_M1_demo",
        user_prompt="DEMO_CLAUSE",
    )

    with Session() as s:
        repo = FindingsRepository(s)
        row = s.get(models.Finding, finding_id)
        assert row is not None
        assert row.clause_id == "c_M1_demo"
        assert row.abstention is True
        assert row.abstention_reason == "model_voluntary"
        assert row.audit_id is not None

        audit = s.get(models.AuditTrail, row.audit_id)
        assert audit is not None
        assert audit.extractor_model_version_id is not None
        assert audit.extractor_latency_ms is not None
```

- [ ] **Step 2: Run test to verify it fails**

```bash
uv run pytest tests/test_e2e_skeleton.py -v
```

Expected: FAIL — `ModuleNotFoundError: No module named 'scripts'`.

- [ ] **Step 3: Implement**

Create `scripts/__init__.py`:

```python
```

Create `scripts/skeleton_e2e.py`:

```python
"""End-to-end skeleton demonstrating the M1 wiring.

Given a Session factory, a ModelProvider, a clause_id, and a user_prompt,
this script:
  1. Calls provider.complete() (a single LLM-shaped call).
  2. Registers prompt + model version rows via VersionRegistry.
  3. Inserts an audit_trail row capturing latency + (stub) cost.
  4. Inserts a finding row (here, abstained — driven by stub canned response).
  5. Commits and returns the finding row id.

This is NOT the production orchestrator (that ships in M4+). It exists so
M1's exit criterion — "stub provider produces a finding end-to-end with
full audit trail" — has a runnable demonstration and an automated test.
"""
from __future__ import annotations

import hashlib

from dcr.providers.base import ModelProvider
from dcr.store.audit import AuditRepository
from dcr.store.findings import FindingsRepository
from dcr.store.versions import VersionRegistry


_SKELETON_SYSTEM_PROMPT = "You are the M1 skeleton stub. Return any payload."
_SKELETON_PROMPT_VERSION = "skeleton-m1-v0"


def _hash(s: str) -> str:
    return hashlib.sha256(s.encode()).hexdigest()


def run_skeleton(
    *,
    Session_factory,
    provider: ModelProvider,
    clause_id: str,
    user_prompt: str,
) -> int:
    """Run the M1 end-to-end stub flow. Returns the inserted finding row id."""
    # 1. Call the provider.
    response = provider.complete(
        system_prompt=_SKELETON_SYSTEM_PROMPT,
        user_prompt=user_prompt,
        response_schema={"type": "object"},
        max_tokens=200,
    )

    parsed = response.parsed
    is_abstention = bool(parsed.get("abstention", False))

    with Session_factory() as s:
        # 2. Register version rows.
        registry = VersionRegistry(s)
        prompt_v_id = registry.get_or_create_prompt_version(
            name="skeleton",
            version=_SKELETON_PROMPT_VERSION,
            content_hash=_hash(_SKELETON_SYSTEM_PROMPT),
        )
        model_v_id = registry.get_or_create_model_version(
            provider_name=response.provider_name,
            model_id=response.model_id,
            model_version=response.model_version,
        )

        # 3. Insert audit row.
        audit_repo = AuditRepository(s)
        audit_id = audit_repo.insert(
            extractor_prompt_version_id=prompt_v_id,
            extractor_model_version_id=model_v_id,
            extractor_latency_ms=response.latency_ms,
            extractor_cost_usd=response.cost_usd,
        )

        # 4. Insert finding row.
        findings_repo = FindingsRepository(s)
        idem_key = _hash(f"{clause_id}|{prompt_v_id}|{model_v_id}|skeleton")
        if is_abstention:
            finding_id = findings_repo.insert(
                clause_id=clause_id,
                confidence=float(parsed.get("confidence", 0.0)),
                abstention=True,
                abstention_reason=str(parsed.get("abstention_reason", "model_voluntary")),
                raw_draft_json=parsed,
                idempotency_key=idem_key,
                audit_id=audit_id,
            )
        else:
            finding_id = findings_repo.insert(
                clause_id=clause_id,
                confidence=float(parsed.get("confidence", 0.0)),
                abstention=False,
                category_id=int(parsed.get("category_id", 1)),
                rule_id=str(parsed.get("rule_id", "skeleton-rule")),
                severity=str(parsed.get("severity", "low")),
                likelihood=str(parsed.get("likelihood", "low")),
                negotiability=str(parsed.get("negotiability", "easy")),
                composite_score=int(parsed.get("composite_score", 0)),
                evidence_json=parsed.get("evidence"),
                action_json=parsed.get("action"),
                idempotency_key=idem_key,
                audit_id=audit_id,
            )

        s.commit()
        return finding_id


if __name__ == "__main__":
    # Convenience CLI demonstration.
    import argparse
    from dcr.store.db import Base, make_engine, make_session_factory
    from dcr.providers.stub_local import StubLocalProvider

    ap = argparse.ArgumentParser()
    ap.add_argument("--db-url", default="sqlite:///skeleton.db")
    ap.add_argument("--clause-id", default="c_demo")
    args = ap.parse_args()

    engine = make_engine(args.db_url)
    Base.metadata.create_all(engine)
    Session = make_session_factory(engine)

    provider = StubLocalProvider()  # default abstention payload
    fid = run_skeleton(
        Session_factory=Session,
        provider=provider,
        clause_id=args.clause_id,
        user_prompt="any-prompt",
    )
    print(f"Inserted finding id={fid} into {args.db_url}")
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
uv run pytest tests/test_e2e_skeleton.py -v
```

Expected: PASS.

Also confirm the CLI runs:

```bash
uv run python scripts/skeleton_e2e.py --db-url sqlite:///tmp_skeleton.db
```

Expected: Prints `Inserted finding id=1 into sqlite:///tmp_skeleton.db`. Then delete the temp DB: `rm -f tmp_skeleton.db`.

- [ ] **Step 5: Commit**

```bash
git add scripts/__init__.py scripts/skeleton_e2e.py tests/test_e2e_skeleton.py
git commit -m "$(cat <<'EOF'
feat: add M1 end-to-end skeleton script and integration test

run_skeleton() wires StubLocalProvider → VersionRegistry → AuditRepository →
FindingsRepository through a complete persistence flow. CLI entry point
allows manual smoke-test runs against a SQLite file. M1 exit criterion
(stub provider produces a finding end-to-end with full audit trail) is now
demonstrably met.

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
EOF
)"
```

---

### Task 14: README + dev setup documentation

**Files:**
- Modify: `README.md` (does not exist yet — create)

- [ ] **Step 1: (No test for this task — documentation only.)**

- [ ] **Step 2: Confirm full test suite is green before writing docs**

```bash
unset ANTHROPIC_API_KEY  # to confirm Anthropic conformance tests SKIP cleanly
uv run pytest -v
```

Expected: every test green or correctly skipped (Anthropic conformance tests skipped, all others pass).

- [ ] **Step 3: Write the README**

Create `README.md`:

````markdown
# Defense Contract Reviewer — Sub-project C (M1 Skeleton)

Per-clause risk + explainability engine for the Defense Contract Reviewer product.
This repository implements **Sub-project C** of the multi-subproject system
(see `docs/superpowers/specs/2026-05-17-subproject-c-explainability-design.md`
for the full design; see `memory/project_overview.md` in the project's
Claude memory for the sub-project decomposition).

**Current state:** M1 (Skeleton). Provider abstraction, risk-finding schema,
SQLite findings store with full audit trail, and an end-to-end stub flow are
operational. M2+ adds the real Extractor, Verifier, taxonomy, rules, reg
corpus, and eval harness.

## Quick start

```bash
# Requires Python 3.12 and uv (https://docs.astral.sh/uv/)
uv sync --extra dev

# Run all tests (Anthropic integration tests skip without API key)
uv run pytest -v

# Run the M1 skeleton end-to-end against a SQLite file
uv run python scripts/skeleton_e2e.py --db-url sqlite:///skeleton.db
```

## Conformance suite (Goal-2 guarantee)

Every `ModelProvider` implementation must pass
`tests/providers/conformance/`. This is the merge gate that ensures the
cloud→local model swap is a config change, not a rewrite.

```bash
# Without ANTHROPIC_API_KEY: StubLocalProvider runs, Anthropic skips
uv run pytest tests/providers/conformance/ -v

# With ANTHROPIC_API_KEY: both providers run (uses Claude Haiku 4.5 to keep cost minimal)
export ANTHROPIC_API_KEY=sk-ant-...
uv run pytest tests/providers/conformance/ -v
```

## Repository layout

```
src/dcr/
  schema/        Risk-finding Pydantic models (the trust-engine payload)
  providers/    ModelProvider protocol + AnthropicProvider + StubLocalProvider
  store/         SQLAlchemy ORM + repositories (findings, audit, versions)
scripts/         CLI entry points (skeleton_e2e.py)
tests/           Unit + conformance + integration tests
docs/            Specs and implementation plans
```

## Architecture

See `docs/superpowers/specs/2026-05-17-subproject-c-explainability-design.md`
for the full design. In one sentence: a two-pass LLM pipeline (Extractor →
Verifier) takes one clause at a time, grounds every risk finding in retrieved
versioned regulatory text + exact-substring evidence spans, and routes
anything it can't ground to a human review queue instead of shipping it to
the contractor.

## Goal-2 commitment

The `LocalProvider` for on-prem DoD deployment is **not yet implemented**.
The conformance test suite — passing today on `StubLocalProvider` and
`AnthropicProvider` — is the architectural insurance that adding it later
will be a config change. See spec §9 for the Goal-2 cutover playbook.
````

- [ ] **Step 4: Read it back to confirm formatting**

```bash
uv run python -c "import pathlib; print(pathlib.Path('README.md').read_text()[:500])"
```

Expected: First 500 chars print cleanly with code blocks intact.

- [ ] **Step 5: Commit**

```bash
git add README.md
git commit -m "$(cat <<'EOF'
docs: add M1 README with quick start, conformance suite, layout, and Goal-2 note

Documents installation, test commands (including ANTHROPIC_API_KEY toggling
for conformance), repository layout, and the Goal-2 commitment that the
conformance suite enforces. Points readers to the design spec for full
architecture.

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
EOF
)"
```

---

## M1 Exit Verification

Run after Task 14:

```bash
# Full unit + integration suite (no real API key)
unset ANTHROPIC_API_KEY
uv run pytest -v --tb=short
```

Expected counts (approximate):
- `tests/test_sanity.py`: 1 PASS
- `tests/schema/`: 10 PASS
- `tests/providers/test_base.py`: 6 PASS
- `tests/providers/test_stub_local.py`: 6 PASS
- `tests/providers/test_anthropic_provider.py`: 6 PASS
- `tests/providers/conformance/`: 7 PASS (stub_local) + 7 SKIPPED (anthropic, key missing)
- `tests/store/test_db.py`: 4 PASS
- `tests/store/test_models.py`: 5 PASS
- `tests/store/test_versions.py`: 5 PASS
- `tests/store/test_findings.py`: 6 PASS
- `tests/store/test_audit.py`: 2 PASS
- `tests/test_e2e_skeleton.py`: 1 PASS

**Total: ~59 PASS, ~7 SKIPPED** (no failures).

Then with key set:

```bash
export ANTHROPIC_API_KEY=sk-ant-...
uv run pytest tests/providers/conformance/ -v
```

Expected: 14 PASS (7 stub + 7 anthropic via Haiku). Spends a few cents on real API.

**If both runs are green, M1 is complete.** Plan for M2 (Taxonomy + Rules + Reg corpus) can be written next.

---

## Self-Review Notes

(Inline pass before handoff; fixed during writing.)

- **Spec coverage of M1 milestone in §11 of the spec:** All five M1 exit-criterion items mapped — repo scaffolding (T1), ModelProvider protocol (T3), StubLocalProvider + AnthropicProvider both passing conformance (T4, T5, T6, T7), SQLite findings store with versioning (T8, T9, T10, T11, T12), stub end-to-end producing a fake finding with audit trail (T13). README (T14) is the engineer-facing doc.
- **Placeholder scan:** No TBD/TODO/"fill in"/"add appropriate error handling" appear in any step. Every code block contains complete code.
- **Type consistency:** `Finding`, `AbstainedFinding`, `Evidence`, `TextSpan`, `RegulatoryCitation`, `Action`, `Urgency`, `AbstentionReason` enum spellings match across T2 schema, T11 FindingsRepository fields, T13 e2e script, and T9 model column names. `ProviderResponse` field set (parsed, raw_text, model_id, model_version, input_tokens, output_tokens, cached_tokens, latency_ms, cost_usd, provider_name) matches across T3, T4, T6, T5 conformance assertions, T13 e2e. `ModelProvider.complete()` signature (system_prompt, user_prompt, response_schema, max_tokens, temperature=0.0, cache_prefix_id=None) is identical across T3, T4, T6.
- **Out-of-scope check:** No tasks implement Extractor prompts (M3), Verifier logic (M4), taxonomy YAML (M2), rules YAML (M2), reg corpus + retrieval (M2), eval harness (M5), review queue (M6), or observability dashboards (M7). M1 is strictly skeleton.
