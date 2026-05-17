{\rtf1\ansi\ansicpg1252\cocoartf2868
\cocoatextscaling0\cocoaplatform0{\fonttbl\f0\fnil\fcharset0 .AppleSystemUIFontMonospaced-Regular;\f1\fnil\fcharset0 Menlo-Regular;}
{\colortbl;\red255\green255\blue255;}
{\*\expandedcolortbl;;}
\paperw11900\paperh16840\margl1440\margr1440\vieww11520\viewh8400\viewkind0
\deftab560
\pard\pardeftab560\slleading20\pardirnatural\partightenfactor0

\f0\fs24 \cf0 ## IMPLEMENTATION PLAN FILES (from FILE 1 \'97 M1 Skeleton)\
\
### `impl/01-overview-conventions.md`\
```markdown\
# Sub-project C \'97 M1 Skeleton Implementation Plan\
\
**Goal:** Stand up foundational plumbing so a stubbed end-to-end flow works.\
\
## Architecture\
Two-pass LLM pipeline (Extractor \uc0\u8594  Verifier); M1 builds protocols, schema, storage, and provider implementations only \'97 no prompts, no real LLM calls in the e2e path yet.\
\
## Tech Stack\
- Python 3.12\
- `uv` (package manager + venv)\
- Pydantic v2 (schema definition + validation)\
- SQLAlchemy 2.0 (ORM; SQLite dev \uc0\u8594  Postgres-swap path for Sub-project H)\
- `anthropic` SDK (cloud provider)\
- pytest, pytest-cov, ruff, mypy\
\
## Conventions (apply to every task)\
- **Determinism contract:** every provider call uses `temperature=0.0`\
- **Commit format:** `<type>: <imperative summary>` where `<type>` 
\f1 \uc0\u8712 
\f0  `feat | test | refactor | docs | chore`\
- **Run from project root:** `/Users/rahulmeena/ai product lauch for defense contrcator`\
- **Quote paths with spaces** in shell commands\
\
## File Structure (created by this plan)\
```\
/\
\uc0\u9500 \u9472 \u9472  pyproject.toml\
\uc0\u9500 \u9472 \u9472  .python-version\
\uc0\u9500 \u9472 \u9472  README.md\
\uc0\u9500 \u9472 \u9472  src/dcr/\
\uc0\u9474    \u9500 \u9472 \u9472  __init__.py\
\uc0\u9474    \u9500 \u9472 \u9472  schema/\
\uc0\u9474    \u9474    \u9500 \u9472 \u9472  __init__.py\
\uc0\u9474    \u9474    \u9492 \u9472 \u9472  risk_finding.py\
\uc0\u9474    \u9500 \u9472 \u9472  providers/\
\uc0\u9474    \u9474    \u9500 \u9472 \u9472  __init__.py\
\uc0\u9474    \u9474    \u9500 \u9472 \u9472  base.py\
\uc0\u9474    \u9474    \u9500 \u9472 \u9472  stub_local.py\
\uc0\u9474    \u9474    \u9492 \u9472 \u9472  anthropic_provider.py\
\uc0\u9474    \u9492 \u9472 \u9472  store/\
\uc0\u9474        \u9500 \u9472 \u9472  __init__.py\
\uc0\u9474        \u9500 \u9472 \u9472  db.py\
\uc0\u9474        \u9500 \u9472 \u9472  models.py\
\uc0\u9474        \u9500 \u9472 \u9472  versions.py\
\uc0\u9474        \u9500 \u9472 \u9472  findings.py\
\uc0\u9474        \u9492 \u9472 \u9472  audit.py\
\uc0\u9500 \u9472 \u9472  scripts/\
\uc0\u9474    \u9492 \u9472 \u9472  skeleton_e2e.py\
\uc0\u9492 \u9472 \u9472  tests/\
    \uc0\u9500 \u9472 \u9472  __init__.py\
    \uc0\u9500 \u9472 \u9472  conftest.py\
    \uc0\u9500 \u9472 \u9472  test_sanity.py\
    \uc0\u9500 \u9472 \u9472  schema/\
    \uc0\u9474    \u9492 \u9472 \u9472  test_risk_finding.py\
    \uc0\u9500 \u9472 \u9472  providers/\
    \uc0\u9474    \u9500 \u9472 \u9472  test_base.py\
    \uc0\u9474    \u9500 \u9472 \u9472  test_stub_local.py\
    \uc0\u9474    \u9500 \u9472 \u9472  test_anthropic_provider.py\
    \uc0\u9474    \u9492 \u9472 \u9472  conformance/\
    \uc0\u9474        \u9500 \u9472 \u9472  __init__.py\
    \uc0\u9474        \u9500 \u9472 \u9472  conftest.py\
    \uc0\u9474        \u9492 \u9472 \u9472  test_conformance.py\
    \uc0\u9500 \u9472 \u9472  store/\
    \uc0\u9474    \u9500 \u9472 \u9472  test_db.py\
    \uc0\u9474    \u9500 \u9472 \u9472  test_models.py\
    \uc0\u9474    \u9500 \u9472 \u9472  test_versions.py\
    \uc0\u9474    \u9500 \u9472 \u9472  test_findings.py\
    \uc0\u9474    \u9492 \u9472 \u9472  test_audit.py\
    \uc0\u9492 \u9472 \u9472  test_e2e_skeleton.py\
```\
```\
}