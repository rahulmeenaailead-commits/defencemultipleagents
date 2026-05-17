{\rtf1\ansi\ansicpg1252\cocoartf2868
\cocoatextscaling0\cocoaplatform0{\fonttbl\f0\fnil\fcharset0 .AppleSystemUIFontMonospaced-Regular;\f1\fnil\fcharset0 HelveticaNeue;}
{\colortbl;\red255\green255\blue255;}
{\*\expandedcolortbl;;}
\paperw11900\paperh16840\margl1440\margr1440\vieww11520\viewh8400\viewkind0
\deftab560
\pard\pardeftab560\slleading20\pardirnatural\partightenfactor0

\f0\fs24 \cf0 ### `impl/06-task5-conformance-suite.md`\
```markdown\
# Task 5: Provider Conformance Test Suite\
\
## Files Created\
- `tests/providers/conformance/__init__.py`\
- `tests/providers/conformance/conftest.py`\
- `tests/providers/conformance/test_conformance.py`\
\
## Purpose\
Parametrized tests run the same conformance checks against every registered provider. This is the Goal-2 guarantee: when LocalProvider is implemented, passing this suite is a merge gate.\
\
## Conftest: Provider Factories\
```python\
_provider_factories = \{\
    "stub_local": _stub_factory,      # Always runs\
    "anthropic": _anthropic_factory,   # Skips without ANTHROPIC_API_KEY\
\}\
```\
\
## Conformance Tests (7 tests)\
| Test | What it proves |\
|---|---|\
| `isinstance(provider, ModelProvider)` | Structural protocol match |\
| Returns `ProviderResponse` | Correct return type |\
| `parsed` is dict | Shape contract |\
| Deterministic at temp=0 (3 runs identical) | Reproducibility |\
| Audit fields populated | model_id, model_version, tokens, latency, provider_name |\
| `cost_usd` is float or None | Cost contract |\
| Respects max_tokens | Output bounded (\uc0\u8804 2000 tokens for probe) |\
\
## Expected Results (before Anthropic implemented)\
- All `[stub_local]` parametrizations: PASS\
- All `[anthropic]` parametrizations: SKIPPED\
\
Run: `uv run pytest tests/providers/conformance/ -v`\
```\
\
---
\f1\fs26 \
}