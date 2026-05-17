{\rtf1\ansi\ansicpg1252\cocoartf2868
\cocoatextscaling0\cocoaplatform0{\fonttbl\f0\fnil\fcharset0 .AppleSystemUIFontMonospaced-Regular;\f1\fnil\fcharset0 HelveticaNeue;}
{\colortbl;\red255\green255\blue255;}
{\*\expandedcolortbl;;}
\paperw11900\paperh16840\margl1440\margr1440\vieww11520\viewh8400\viewkind0
\deftab560
\pard\pardeftab560\slleading20\pardirnatural\partightenfactor0

\f0\fs24 \cf0 ### `impl/13-task12-audit-repo.md`\
```markdown\
# Task 12: AuditRepository (Insert Audit-Trail Row)\
\
## File Created\
- `src/dcr/store/audit.py`\
- `tests/store/test_audit.py`\
\
## Implementation\
\
```python\
class AuditRepository:\
    def __init__(self, session: Session):\
        self._s = session\
\
    def insert(self, *,\
               extractor_prompt_version_id=None,\
               verifier_prompt_version_id=None,\
               extractor_model_version_id=None,\
               verifier_model_version_id=None,\
               reg_corpus_version_id=None,\
               retrieved_reg_hashes_json=None,\
               extractor_latency_ms=None,\
               verifier_latency_ms=None,\
               extractor_cost_usd=None,\
               verifier_cost_usd=None) -> int:\
        # Creates AuditTrail row \uc0\u8594  flush \u8594  return id\
```\
\
## Design\
- All fields optional \'97 orchestrator populates what it has at write time\
- Returns audit_id for passing to FindingsRepository.insert\
- One audit row per `analyze_clause()` invocation\
\
## Tests (2 tests)\
- Insert full audit row with all fields\
- Insert minimum audit row (all None)\
\
Run: `uv run pytest tests/store/test_audit.py -v` \uc0\u8594  Expected: 2 PASS\
```\
\
---
\f1\fs26 \
}