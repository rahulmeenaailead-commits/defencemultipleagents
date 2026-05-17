{\rtf1\ansi\ansicpg1252\cocoartf2868
\cocoatextscaling0\cocoaplatform0{\fonttbl\f0\fnil\fcharset0 .AppleSystemUIFontMonospaced-Regular;\f1\fnil\fcharset0 HelveticaNeue;}
{\colortbl;\red255\green255\blue255;}
{\*\expandedcolortbl;;}
\paperw11900\paperh16840\margl1440\margr1440\vieww11520\viewh8400\viewkind0
\deftab560
\pard\pardeftab560\slleading20\pardirnatural\partightenfactor0

\f0\fs24 \cf0 ### `impl/16-exit-verification.md`\
```markdown\
# M1 Exit Verification\
\
## Full Test Suite (no API key)\
```bash\
unset ANTHROPIC_API_KEY\
uv run pytest -v --tb=short\
```\
\
### Expected Test Counts\
| Test file | PASS | SKIPPED |\
|---|---|---|\
| test_sanity.py | 1 | 0 |\
| test_risk_finding.py | 10 | 0 |\
| test_base.py | 6 | 0 |\
| test_stub_local.py | 6 | 0 |\
| test_anthropic_provider.py | 6 | 0 |\
| conformance/test_conformance.py | 7 (stub) | 7 (anthropic) |\
| test_db.py | 4 | 0 |\
| test_models.py | 5 | 0 |\
| test_versions.py | 5 | 0 |\
| test_findings.py | 6 | 0 |\
| test_audit.py | 2 | 0 |\
| test_e2e_skeleton.py | 1 | 0 |\
| **TOTAL** | **~59** | **~7** |\
\
## Conformance with API Key\
```bash\
export ANTHROPIC_API_KEY=sk-ant-...\
uv run pytest tests/providers/conformance/ -v\
```\
Expected: 14 PASS (7 stub + 7 anthropic via Haiku 4.5). Cost: few cents.\
\
## M1 Exit Criteria (all met)\
1. \uc0\u9989  Repo scaffolding\
2. \uc0\u9989  ModelProvider protocol defined\
3. \uc0\u9989  StubLocalProvider + AnthropicProvider both pass conformance\
4. \uc0\u9989  SQLite findings store with versioning tables operational\
5. \uc0\u9989  Stub end-to-end produces finding with full audit trail\
6. \uc0\u9989  README documentation\
\
**If both runs green, M1 is complete. Ready for M2.**\
```\
\
---
\f1\fs26 \
}