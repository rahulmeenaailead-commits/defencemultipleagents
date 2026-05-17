{\rtf1\ansi\ansicpg1252\cocoartf2868
\cocoatextscaling0\cocoaplatform0{\fonttbl\f0\fnil\fcharset0 .AppleSystemUIFontMonospaced-Regular;}
{\colortbl;\red255\green255\blue255;}
{\*\expandedcolortbl;;}
\paperw11900\paperh16840\margl1440\margr1440\vieww11520\viewh8400\viewkind0
\deftab560
\pard\pardeftab560\slleading20\pardirnatural\partightenfactor0

\f0\fs24 \cf0 \
### `impl/08-task7-anthropic-conformance.md`\
```markdown\
# Task 7: AnthropicProvider Passes Conformance Suite (Integration)\
\
## No New Files\
This task verifies that AnthropicProvider passes the conformance suite from Task 5 with real API calls.\
\
## Steps\
\
### 1. Run WITHOUT API key \'97 confirm skips\
```bash\
unset ANTHROPIC_API_KEY\
uv run pytest tests/providers/conformance/ -v\
```\
Expected: 7 PASS (stub_local) + 7 SKIPPED (anthropic) \'97 reason "ANTHROPIC_API_KEY not set"\
\
### 2. Run WITH API key \'97 real API hit\
```bash\
export ANTHROPIC_API_KEY=sk-ant-...\
uv run pytest tests/providers/conformance/ -v\
```\
Expected: 7 PASS (stub_local) + 7 PASS (anthropic via Haiku 4.5)\
\
### Notes\
- Uses Claude Haiku 4.5 (cheapest) for conformance to keep cost minimal\
- If `test_deterministic_at_temp_zero` fails, retry once (Anthropic API is deterministic at temp=0 within same model snapshot)\
- Persistent determinism failure = bug to investigate before proceeding\
- Cost: a few cents total (Haiku is cheap, probe schema is small)\
```\
}