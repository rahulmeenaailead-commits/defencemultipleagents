{\rtf1\ansi\ansicpg1252\cocoartf2868
\cocoatextscaling0\cocoaplatform0{\fonttbl\f0\fnil\fcharset0 .AppleSystemUIFontMonospaced-Regular;\f1\fnil\fcharset0 HelveticaNeue;}
{\colortbl;\red255\green255\blue255;}
{\*\expandedcolortbl;;}
\paperw11900\paperh16840\margl1440\margr1440\vieww11520\viewh8400\viewkind0
\deftab560
\pard\pardeftab560\slleading20\pardirnatural\partightenfactor0

\f0\fs24 \cf0 ### `impl/15-task14-readme.md`\
```markdown\
# Task 14: README + Dev Setup Documentation\
\
## File Created/Modified\
- `README.md` (create)\
\
## Contents\
- Project description: Defense Contract Reviewer \'97 Sub-project C (M1 Skeleton)\
- Quick start with `uv sync --extra dev` and `uv run pytest -v`\
- Conformance suite instructions (with/without ANTHROPIC_API_KEY)\
- Repository layout overview\
- Architecture summary (two-pass LLM pipeline)\
- Goal-2 commitment: conformance suite is insurance for cloud\uc0\u8594 local swap\
- Points to design spec for full architecture\
\
## Pre-Commit Check\
```bash\
unset ANTHROPIC_API_KEY\
uv run pytest -v\
```\
Expected: all tests green or correctly skipped\
```\
\
---
\f1\fs26 \
}