{\rtf1\ansi\ansicpg1252\cocoartf2868
\cocoatextscaling0\cocoaplatform0{\fonttbl\f0\fnil\fcharset0 .AppleSystemUIFontMonospaced-Regular;\f1\fnil\fcharset0 HelveticaNeue;}
{\colortbl;\red255\green255\blue255;}
{\*\expandedcolortbl;;}
\paperw11900\paperh16840\margl1440\margr1440\vieww11520\viewh8400\viewkind0
\deftab560
\pard\pardeftab560\slleading20\pardirnatural\partightenfactor0

\f0\fs24 \cf0 \
### `spec/14-c9-eval-harness.md`\
```markdown\
# Component C9 \'97 Eval Harness\
\
## CLI\
```bash\
eval run --golden golden_v3.jsonl --provider anthropic \\\
  --extractor-prompt v1.7 --verifier-prompt v1.2\
```\
\
## Outputs\
- Per-category metrics + delta vs previous run + regression sample\
\
## CI Integration\
- Runs on every PR touching prompts, rules, taxonomy, or provider code\
- Blocks merge on regression beyond threshold\
\
## Golden Dataset Schema\
```jsonl\
\{\
  "id": "g_0001",\
  "source": "DoD prime contract sample, sanitized",\
  "clause_text": "...",\
  "expected_findings": [\{\
    "category_id": 2, "rule_id": "IP-DR-UR-01",\
    "expected_text_spans": [\{ "char_start": 24, "char_end": 87 \}],\
    "expected_reg_citations": ["DFARS 252.227-7013(b)(1)"],\
    "expected_severity": "critical",\
    "expected_abstention": false\
  \}],\
  "labeled_by": "sme_kp", "labeled_at": "2026-02-14",\
  "notes": "..."\
\}\
```\
\
## Metrics (per category and aggregate)\
- Precision, Recall\
- Evidence exact-match rate\
- Reg-citation accuracy\
- Abstention rate\
- **Hallucination rate** (the primary metric)\
- Abstention precision (were abstentions actually ambiguous?)\
\
## Cost Cap\
- Golden set \uc0\u8804  400 clauses \u8594  full run < 30 min and < $20 in API cost\
- Nightlies can be larger\
\
## Release Gate\
- Hallucination rate < 1% per category AND overall\
- Falling below blocks merge\
```\
\
---
\f1\fs26 \
}