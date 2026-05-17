{\rtf1\ansi\ansicpg1252\cocoartf2868
\cocoatextscaling0\cocoaplatform0{\fonttbl\f0\fnil\fcharset0 .AppleSystemUIFontMonospaced-Regular;\f1\fnil\fcharset0 HelveticaNeue;}
{\colortbl;\red255\green255\blue255;}
{\*\expandedcolortbl;;}
\paperw11900\paperh16840\margl1440\margr1440\vieww11520\viewh8400\viewkind0
\deftab560
\pard\pardeftab560\slleading20\pardirnatural\partightenfactor0

\f0\fs24 \cf0 \
### `spec/20-mvp-roadmap.md`\
```markdown\
# MVP Scope & Build Roadmap\
\
## In MVP\
- 15-category closed taxonomy\
- Two-pass Extractor \uc0\u8594  Verifier\
- Full risk-finding schema with mandatory-field enforcement\
- Reg corpus subset (FAR + DFARS + \'a7 4022 + DoD OT Guide), hash-pinned\
- Hybrid BM25 + embedding retrieval\
- `AnthropicProvider` (Opus 4.7 + Sonnet 4.6) with prompt caching\
- `StubLocalProvider` for conformance\
- SQLite findings store with full versioning\
- Human review queue + minimal admin UI\
- Audit trail (prompt v, model v, reg v, retrieved hashes)\
- Eval harness + golden dataset (~100 \uc0\u8594  200 clauses)\
- Provider conformance test suite\
- CI gates (hallucination < 1%, determinism replay)\
- Cost cap, circuit breaker\
- Observability (structured trace per call)\
\
## Deferred to Later Versions of C\
| Capability | Revisit when |\
|---|---|\
| Rule library editing UI for SMEs | rule count > 500 |\
| Multi-language contracts | customer-driven |\
| Active-learning loop | after 6 months pilot data |\
| Per-customer rule overrides | becomes sales blocker |\
| Fine-tuned defense-domain model | eval reveals systematic Claude weakness |\
\
## Deferred to Other Sub-projects\
| Capability | Owner |\
|---|---|\
| PDF parsing, clause segmentation | A |\
| Concept extraction + SQLite concept store | B |\
| Cross-reference risk | D |\
| Interdependence risk | E |\
| Contractor UI / PDF highlighting | F |\
| Real `LocalProvider` (vLLM) | G |\
| Postgres migration, worker scaling | H |\
\
## Build Sequence (M1\'96M8)\
| Milestone | Weeks | Exit criteria |\
|---|---|---|\
| M1 \'97 Skeleton | 1 | Stub + Anthropic pass conformance; schema defined; SQLite store live |\
| M2 \'97 Taxonomy + Rules + Reg corpus | 2\'963 | 15 categories; ~75 rules; reg loader hash-pinned |\
| M3 \'97 Extractor | 3\'964 | Versioned prompt; tool-use enforcement; integration tests pass |\
| M4 \'97 Verifier | 4\'965 | Mechanical + semantic phases; routing to C8/C10 |\
| M5 \'97 Eval harness + golden | 5\'966 | CLI produces metrics; CI blocks regressions |\
| M6 \'97 Review queue + admin UI | 6\'967 | SME clears queue without engineer |\
| M7 \'97 Observability + cost caps + caching | 7\'968 | Structured tracing; per-contract cost cap |\
| M8 \'97 Golden to 200 + red-team + hardening | 8\'9610 | Hallucination < 1%; first pilot ships under shadow review |\
\
**Effort:** ~10 weeks focused build, 1 engineer + 1 contracted SME.\
```\
\
---
\f1\fs26 \
}