{\rtf1\ansi\ansicpg1252\cocoartf2868
\cocoatextscaling0\cocoaplatform0{\fonttbl\f0\fnil\fcharset0 .AppleSystemUIFontMonospaced-Regular;}
{\colortbl;\red255\green255\blue255;}
{\*\expandedcolortbl;;}
\paperw11900\paperh16840\margl1440\margr1440\vieww11520\viewh8400\viewkind0
\deftab560
\pard\pardeftab560\slleading20\pardirnatural\partightenfactor0

\f0\fs24 \cf0 \
### `spec/02-boundaries.md`\
```markdown\
# Boundaries with Other Sub-projects\
\
| Direction | Sub-project | Contract |\
|---|---|---|\
| In | **A** | Delivers `Clause \{ clause_id, text, page, section_ref, char_offsets \}` |\
| In | **B** | Lookup by `clause_id` returns concepts/entities/meanings (never raw text; raw text loaded from A's output) |\
| Out | **D** | C8 findings store writes findings + clause-reference graph hook D can consume |\
| Out | **E** | C8 emits per-clause risk vectors usable for pairwise scoring |\
| Out | **F** | UI reads from C8: findings, evidence spans (for PDF highlight), actions, abstentions |\
| In | **G** | Swaps `ModelProvider` implementation; no other code changes |\
| In | **H** | C6 becomes queue-backed worker; C8 swaps to Postgres; C3 sharded |\
\
## Key Principle\
\
Raw clause text comes from A's output, never from B's lookup path. B returns only concepts/entities/meanings.\
```\
}