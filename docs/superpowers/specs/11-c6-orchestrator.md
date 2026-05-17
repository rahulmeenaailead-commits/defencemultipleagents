{\rtf1\ansi\ansicpg1252\cocoartf2868
\cocoatextscaling0\cocoaplatform0{\fonttbl\f0\fnil\fcharset0 .AppleSystemUIFontMonospaced-Regular;\f1\fnil\fcharset0 HelveticaNeue;}
{\colortbl;\red255\green255\blue255;}
{\*\expandedcolortbl;;}
\paperw11900\paperh16840\margl1440\margr1440\vieww11520\viewh8400\viewkind0
\deftab560
\pard\pardeftab560\slleading20\pardirnatural\partightenfactor0

\f0\fs24 \cf0 ### `spec/11-c6-orchestrator.md`\
```markdown\
# Component C6 \'97 Orchestrator\
\
## Core Function\
```python\
analyze_clause(clause_id) \uc0\u8594  list[Finding]\
```\
A single clause can yield 0, 1, or N findings \'97 multiple risks per clause are surfaced independently.\
\
## Behavior\
- **Stateless** \'97 horizontally parallelizable (Sub-project H makes this a worker pool)\
- Loads concepts from B (SQLite)\
- Retrieves top-K reg snippets from C3\
- Loads taxonomy (C5) + rule library (C4)\
- Assembles Extractor prompt\
- Calls Extractor (C1) \uc0\u8594  Verifier (C2)\
- Routes results to C8 or C10\
\
## Per-Call Structured Trace\
```\
\{clause_id, prompt_hash, model_versions, retrieved_reg_hashes,\
 extractor_latency_ms, verifier_latency_ms, finding_count,\
 abstention_count, cost_usd\}\
```\
\
## Idempotency\
For the same `(clause_id, prompt_version, model_version, reg_corpus_version)`, cached result from C8 is returned. No re-billing on identical re-runs.\
```
\f1\fs26 \
}