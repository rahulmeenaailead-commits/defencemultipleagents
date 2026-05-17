{\rtf1\ansi\ansicpg1252\cocoartf2868
\cocoatextscaling0\cocoaplatform0{\fonttbl\f0\fnil\fcharset0 .AppleSystemUIFontMonospaced-Regular;}
{\colortbl;\red255\green255\blue255;}
{\*\expandedcolortbl;;}
\paperw11900\paperh16840\margl1440\margr1440\vieww11520\viewh8400\viewkind0
\deftab560
\pard\pardeftab560\slleading20\pardirnatural\partightenfactor0

\f0\fs24 \cf0 ### `impl/10-task9-orm-models.md`\
```markdown\
# Task 9: ORM Models for Findings, Audit Trail, Version Registries\
\
## Files Created\
- `src/dcr/store/models.py`\
- `tests/store/test_models.py`\
\
## Tables\
\
### `prompt_versions`\
| Column | Type |\
|---|---|\
| id | Integer (PK) |\
| name | String(100) \'97 "extractor" or "verifier" |\
| version | String(50) |\
| content_hash | String(64) |\
| created_at | DateTime(timezone=True) |\
\
Unique constraint: (name, version)\
\
### `model_versions`\
| Column | Type |\
|---|---|\
| id | Integer (PK) |\
| provider_name | String(100) |\
| model_id | String(100) |\
| model_version | String(100) |\
| created_at | DateTime(timezone=True) |\
\
Unique constraint: (provider_name, model_id, model_version)\
\
### `reg_snapshot_versions`\
| Column | Type |\
|---|---|\
| id | Integer (PK) |\
| corpus_version_hash | String(64) UNIQUE |\
| created_at | DateTime(timezone=True) |\
\
### `audit_trail`\
FKs to prompt_versions, model_versions, reg_snapshot_versions. Carries: retrieved_reg_hashes_json, extractor_latency_ms, verifier_latency_ms, extractor_cost_usd, verifier_cost_usd.\
\
### `findings`\
Carries: clause_id, category_id, rule_id, severity, likelihood, negotiability, composite_score, evidence_json, action_json, confidence, abstention, abstention_reason, raw_draft_json, idempotency_key (indexed), supersedes_id (self-FK), audit_id (FK to audit_trail), created_at.\
\
## Tests (5 tests)\
- All expected tables created (5 tables)\
- findings table has all columns\
- audit_trail table has all columns\
- prompt_versions has unique constraint on (name, version)\
- findings has idempotency_key index\
\
Run: `uv run pytest tests/store/test_models.py -v` \uc0\u8594  Expected: 5 PASS\
```\
}