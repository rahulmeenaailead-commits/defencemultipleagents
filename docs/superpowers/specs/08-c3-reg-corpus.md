{\rtf1\ansi\ansicpg1252\cocoartf2868
\cocoatextscaling0\cocoaplatform0{\fonttbl\f0\fnil\fcharset0 .AppleSystemUIFontMonospaced-Regular;}
{\colortbl;\red255\green255\blue255;}
{\*\expandedcolortbl;;}
\paperw11900\paperh16840\margl1440\margr1440\vieww11520\viewh8400\viewkind0
\deftab560
\pard\pardeftab560\slleading20\pardirnatural\partightenfactor0

\f0\fs24 \cf0 ### `spec/08-c3-reg-corpus.md`\
```markdown\
# Component C3 \'97 Reg Corpus + Retrieval\
\
## Storage\
- Versioned snapshots of:\
  - FAR Part 52 (subset referenced by 15 categories)\
  - DFARS 252\
  - 10 U.S.C. \'a7 4022\
  - DoD OT Guide\
- Each snapshot row: `\{reg_id, section, text, version_date, version_hash (sha256)\}`\
- Snapshots are **immutable**; new version = new row\
\
## Refresh Job\
- **Cadence:** Monthly (SME determines final)\
- **Source:** acquisition.gov + DPC OSD\
- **Process:** scrape \uc0\u8594  diff against prior snapshot \u8594  flag changes for SME review \u8594  promote to "current"\
\
## Retrieval\
- **Method:** Hybrid BM25 + dense embeddings, combined via reciprocal-rank fusion\
- **Returns:** Top 5\'968 snippets per query\
- **Query construction:** clause text + concepts from SQLite \uc0\u8594  single query\
\
## MVP Scope\
- ~3,000\'965,000 sections across four corpora\
\
## Integrity Rule\
- Retrieved snippets disagree on `version_hash` with canonical store \uc0\u8594  hard fail; refuse to run\
- Existing findings are **never auto-invalidated** by reg update \'97 flagged for review instead\
```\
}