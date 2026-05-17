{\rtf1\ansi\ansicpg1252\cocoartf2868
\cocoatextscaling0\cocoaplatform0{\fonttbl\f0\fnil\fcharset0 .AppleSystemUIFontMonospaced-Regular;\f1\fnil\fcharset0 HelveticaNeue;}
{\colortbl;\red255\green255\blue255;}
{\*\expandedcolortbl;;}
\paperw11900\paperh16840\margl1440\margr1440\vieww11520\viewh8400\viewkind0
\deftab560
\pard\pardeftab560\slleading20\pardirnatural\partightenfactor0

\f0\fs24 \cf0 ### `impl/11-task10-version-registry.md`\
```markdown\
# Task 10: VersionRegistry (Get-or-Create Helpers)\
\
## File Created\
- `src/dcr/store/versions.py`\
- `tests/store/test_versions.py`\
\
## Implementation\
\
```python\
class VersionRegistry:\
    def __init__(self, session: Session):\
        self._s = session\
\
    def get_or_create_prompt_version(self, name: str, version: str, content_hash: str) -> int:\
        # Select existing OR insert + flush \uc0\u8594  return id\
\
    def get_or_create_model_version(self, provider_name: str, model_id: str, model_version: str) -> int:\
        # Select existing OR insert + flush \uc0\u8594  return id\
\
    def get_or_create_reg_snapshot_version(self, corpus_version_hash: str) -> int:\
        # Select existing OR insert + flush \uc0\u8594  return id\
```\
\
## Design\
- Idempotent: returns existing ID if present, creates new row if not\
- Uses `flush()` not `commit()` \'97 callers own transaction boundaries\
- Returns row ID for use as FK in audit_trail\
\
## Tests (5 tests)\
- get_or_create_prompt_version creates new\
- get_or_create_prompt_version returns existing\
- Different versions get different IDs\
- get_or_create_model_version is idempotent\
- get_or_create_reg_snapshot_version is idempotent\
\
Run: `uv run pytest tests/store/test_versions.py -v` \uc0\u8594  Expected: 5 PASS\
```\
\
---
\f1\fs26 \
}