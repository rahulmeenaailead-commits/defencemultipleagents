{\rtf1\ansi\ansicpg1252\cocoartf2868
\cocoatextscaling0\cocoaplatform0{\fonttbl\f0\fnil\fcharset0 .AppleSystemUIFontMonospaced-Regular;\f1\fnil\fcharset0 HelveticaNeue;}
{\colortbl;\red255\green255\blue255;}
{\*\expandedcolortbl;;}
\paperw11900\paperh16840\margl1440\margr1440\vieww11520\viewh8400\viewkind0
\deftab560
\pard\pardeftab560\slleading20\pardirnatural\partightenfactor0

\f0\fs24 \cf0 ## SPEC FILES (from FILE 2 - Design Specification)\
\
### `spec/01-purpose-scope.md`\
```markdown\
# Sub-project C \'97 Per-clause Risk + Explainability Engine\
\
| Field | Value |\
|---|---|\
| **Date** | 2026-05-17 |\
| **Status** | Design approved |\
| **Owner** | Rahul Meena |\
| **Target market** | U.S. defense contractors reviewing OTA agreements (10 U.S.C. \'a7 4022) |\
| **MVP test corpus** | DoD prime contracts (FAR Part 52 + DFARS 252) |\
\
## Purpose\
\
Sub-project C is the **per-clause risk-scoring + explainability engine** for the defense contract review product. Every risk score it produces must be backed by verifiable proof a contractor (and their lawyer) can audit.\
\
## In Scope\
\
- Given one clause's text and metadata, produce zero, one, or more **risk findings** with:\
  - Classification into a closed 15-category taxonomy\
  - Multi-dimensional risk score\
  - Mandatory evidence (exact text spans + regulatory citations)\
  - Plain-language action + redline suggestion\
  - Confidence score\
  - Abstention if grounding cannot be established\
- Two-pass LLM pipeline (Extractor \uc0\u8594  Verifier) with deterministic post-checks\
- Provider-abstraction layer making cloud\uc0\u8594 local LLM swap a config change\
- Versioned regulatory corpus + retrieval\
- Audit trail\
- Eval harness with release gates\
- Human review queue for abstentions\
\
## Explicitly Out of Scope\
\
| Capability | Owner |\
|---|---|\
| PDF parsing, clause segmentation, page/section detection | Sub-project A |\
| Concept/entity extraction + SQLite concept store | Sub-project B |\
| Cross-reference risk (clause X cites clause Y) | Sub-project D |\
| Interdependence risk via pairwise scoring (no QAOA) | Sub-project E |\
| Contractor-facing UI, PDF highlight rendering, dashboard | Sub-project F |\
| Real local-model implementation (vLLM) | Sub-project G |\
| Postgres migration, horizontal worker scaling, multi-tenant | Sub-project H |\
```\
\
---
\f1\fs26 \
}