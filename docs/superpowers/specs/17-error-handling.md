{\rtf1\ansi\ansicpg1252\cocoartf2868
\cocoatextscaling0\cocoaplatform0{\fonttbl\f0\fnil\fcharset0 .AppleSystemUIFontMonospaced-Regular;\f1\fnil\fcharset0 HelveticaNeue;}
{\colortbl;\red255\green255\blue255;}
{\*\expandedcolortbl;;}
\paperw11900\paperh16840\margl1440\margr1440\vieww11520\viewh8400\viewkind0
\deftab560
\pard\pardeftab560\slleading20\pardirnatural\partightenfactor0

\f0\fs24 \cf0 ### `spec/17-error-handling.md`\
```markdown\
# Error Handling & Abstention Thresholds\
\
## Abstention Triggers\
\
| # | Trigger | Caught by | `abstention_reason` |\
|---|---|---|---|\
| 1 | Extractor self-reports confidence < 0.70 | C1 | `low_self_confidence` |\
| 2 | Extractor voluntarily abstains | C1 | model-supplied |\
| 3 | Extractor JSON fails schema twice | C1 retry | `schema_validation_failed` |\
| 4 | `text_spans` empty or non-substring | C2 mechanical | `invented_or_paraphrased_evidence` |\
| 5 | Required `regulatory_citations` missing | C2 mechanical | `missing_required_reg_citation` |\
| 6 | Cited reg section not in retrieved snippets | C2 mechanical | `ungrounded_reg_citation` |\
| 7 | Reg `version_hash` mismatch | C2 mechanical | `reg_version_mismatch` |\
| 8 | `composite_score \uc0\u8805  80` AND `confidence < 0.85` | C2 mechanical | `high_severity_low_confidence` |\
| 9 | Verifier semantic phase fails | C2 semantic | verifier-supplied |\
| 10 | Extractor & Verifier disagree on `category_id` | C2 semantic | `category_disagreement` |\
\
Thresholds (`0.70`, `0.85`) are config-driven; changes governed by release-gate.\
\
## Provider / Network Failures\
\
| Failure | Behavior |\
|---|---|\
| HTTP 429 / 500 / timeout | Exponential backoff, max 3 attempts; then defer to retry queue |\
| Malformed response | Counted as schema failure \uc0\u8594  C1 retry path |\
| Provider unavailable > 5 min | Circuit breaker opens; orchestrator stops enqueuing; alert fires |\
| Local provider OOM / crash | Same circuit breaker. Failover to cloud only if `allow_cloud_failover=true` (defense customers default `false`) |\
\
## Cost Runaway Protection\
\
- Per-contract budget cap (config; value set during M7)\
- Cap reached \uc0\u8594  stop, alert, require human resume\
- Per-clause retry cap = 1 \uc0\u8594  worst case 2 Extractor + 1 Verifier per clause\
- Eval-harness cost cap separate ($20/run default)\
\
## Observability Alerts\
\
| Signal | Threshold |\
|---|---|\
| Abstention rate per category sustained 1h | > 25% \uc0\u8594  SME triage |\
| Verifier-reject rate (vs Extractor-self-abstain) | > 15% \uc0\u8594  prompt drift |\
| Per-clause cost p95 | > 2\'d7 rolling 7-day median |\
| End-to-end p95 latency | > 30s per clause |\
| Reg version mismatch errors | > 0 \uc0\u8594  page operator |\
| Circuit breaker open | immediate page |\
```\
\
---
\f1\fs26 \
}