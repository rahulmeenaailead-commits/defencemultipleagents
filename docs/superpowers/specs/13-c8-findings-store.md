{\rtf1\ansi\ansicpg1252\cocoartf2868
\cocoatextscaling0\cocoaplatform0{\fonttbl\f0\fnil\fcharset0 .AppleSystemUIFontMonospaced-Regular;}
{\colortbl;\red255\green255\blue255;}
{\*\expandedcolortbl;;}
\paperw11900\paperh16840\margl1440\margr1440\vieww11520\viewh8400\viewkind0
\deftab560
\pard\pardeftab560\slleading20\pardirnatural\partightenfactor0

\f0\fs24 \cf0 ### `spec/13-c8-findings-store.md`\
```markdown\
# Component C8 \'97 Findings Store\
\
## MVP\
- **SQLite** (dev)\
- **Postgres** at production (Sub-project H) \'97 same schema\
\
## Tables\
- `findings` \'97 one row per risk finding or abstention\
- `audit_trail` \'97 1:1 with findings; full provenance\
- `prompt_versions` \'97 versioned prompt definitions\
- `model_versions` \'97 provider + model + version tracking\
- `reg_snapshot_versions` \'97 regulatory corpus snapshots\
\
## Key Design Rules\
\
### Full Reproducibility\
Each finding row carries:\
- `prompt_version_id`\
- `extractor_model_version_id`\
- `verifier_model_version_id`\
- `reg_corpus_version_id`\
\
### Append-Only\
- Findings **never updated in place**\
- Corrections create new row with `supersedes_id` pointing to prior row\
- Original preserved forever (audit invariant)\
\
### Idempotency\
- `idempotency_key` on finding rows\
- Indexed for fast cache lookups\
- Same inputs \uc0\u8594  same result returned from cache\
```\
}