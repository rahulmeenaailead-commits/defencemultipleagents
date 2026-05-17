{\rtf1\ansi\ansicpg1252\cocoartf2868
\cocoatextscaling0\cocoaplatform0{\fonttbl\f0\fnil\fcharset0 .AppleSystemUIFontMonospaced-Regular;}
{\colortbl;\red255\green255\blue255;}
{\*\expandedcolortbl;;}
\paperw11900\paperh16840\margl1440\margr1440\vieww11520\viewh8400\viewkind0
\deftab560
\pard\pardeftab560\slleading20\pardirnatural\partightenfactor0

\f0\fs24 \cf0 ### `impl/14-task13-e2e-skeleton.md`\
```markdown\
# Task 13: End-to-End Skeleton Script + Test\
\
## Files Created\
- `scripts/__init__.py`\
- `scripts/skeleton_e2e.py`\
- `tests/test_e2e_skeleton.py`\
\
## Core Function: `run_skeleton()`\
\
```python\
def run_skeleton(*, Session_factory, provider, clause_id, user_prompt) -> int:\
    # 1. Call provider.complete()\
    # 2. Register prompt + model version rows via VersionRegistry\
    # 3. Insert audit_trail row capturing latency + cost\
    # 4. Insert finding row (abstained or verified)\
    # 5. Commit and return finding row id\
```\
\
## Flow\
```\
StubLocalProvider \uc0\u8594  VersionRegistry \u8594  AuditRepository \u8594  FindingsRepository\
```\
\
## CLI Entry Point\
```bash\
uv run python scripts/skeleton_e2e.py --db-url sqlite:///skeleton.db --clause-id c_demo\
```\
Output: `Inserted finding id=1 into sqlite:///skeleton.db`\
\
## E2E Test\
- Sets up in-memory SQLite\
- Pre-loads StubLocalProvider with canned abstention response\
- Runs run_skeleton()\
- Verifies finding row persisted with clause_id, abstention=true, correct audit linkage\
- Verifies audit_trail row exists with model_version_id and latency\
\
Run: `uv run pytest tests/test_e2e_skeleton.py -v` \uc0\u8594  Expected: 1 PASS\
```\
}