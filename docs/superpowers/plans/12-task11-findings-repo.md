{\rtf1\ansi\ansicpg1252\cocoartf2868
\cocoatextscaling0\cocoaplatform0{\fonttbl\f0\fnil\fcharset0 .AppleSystemUIFontMonospaced-Regular;}
{\colortbl;\red255\green255\blue255;}
{\*\expandedcolortbl;;}
\paperw11900\paperh16840\margl1440\margr1440\vieww11520\viewh8400\viewkind0
\deftab560
\pard\pardeftab560\slleading20\pardirnatural\partightenfactor0

\f0\fs24 \cf0 ### `impl/12-task11-findings-repo.md`\
```markdown\
# Task 11: FindingsRepository (Append-Only Insert + Query)\
\
## File Created\
- `src/dcr/store/findings.py`\
- `tests/store/test_findings.py`\
\
## Implementation\
\
```python\
class FindingsRepository:\
    def __init__(self, session: Session):\
        self._s = session\
\
    def insert(self, *, clause_id, confidence, abstention, idempotency_key, audit_id,\
               category_id=None, rule_id=None, severity=None, likelihood=None,\
               negotiability=None, composite_score=None, evidence_json=None,\
               action_json=None, abstention_reason=None, raw_draft_json=None,\
               supersedes_id=None) -> int:\
        # Creates Finding row \uc0\u8594  flush \u8594  return id\
\
    def query_by_clause_id(self, clause_id: str) -> list[Finding]:\
        # Returns all findings for a clause\
\
    def query_by_idempotency_key(self, idempotency_key: str) -> Finding | None:\
        # Returns single finding or None\
```\
\
## Design Rules\
- **Append-only:** never updates rows\
- **Corrections via `supersedes_id`:** new row points to original\
- **Does NOT commit** \'97 callers own transaction boundaries\
- **Idempotency key:** indexed for fast cache lookups\
\
## Tests (6 tests)\
- Insert verified finding\
- Insert abstained finding\
- query_by_clause_id returns all matching\
- query_by_idempotency_key finds match\
- query_by_idempotency_key returns None for missing\
- supersede creates new row with supersedes_id\
\
Run: `uv run pytest tests/store/test_findings.py -v` \uc0\u8594  Expected: 6 PASS\
```\
}