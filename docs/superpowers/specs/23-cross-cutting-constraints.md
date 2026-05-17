{\rtf1\ansi\ansicpg1252\cocoartf2868
\cocoatextscaling0\cocoaplatform0{\fonttbl\f0\fnil\fcharset0 .AppleSystemUIFontMonospaced-Regular;}
{\colortbl;\red255\green255\blue255;}
{\*\expandedcolortbl;;}
\paperw11900\paperh16840\margl1440\margr1440\vieww11520\viewh8400\viewkind0
\deftab560
\pard\pardeftab560\slleading20\pardirnatural\partightenfactor0

\f0\fs24 \cf0 ### `spec/23-cross-cutting-constraints.md`\
```markdown\
# Cross-Cutting Constraints (Binding on All Implementation)\
\
- **Hallucination minimization is binding.** Any change that lowers the release-gate metric blocks merge. No exceptions.\
- **Provider abstraction is binding.** No `anthropic.*` import or type outside `providers/`. CI lint enforces.\
- **Determinism is binding.** Temperature 0; same inputs \uc0\u8594  same outputs; determinism replay tests verify.\
- **Audit-trail completeness is binding.** Every finding row reproducible from its IDs (prompt, model, reg, retrieved hashes). Missing audit = unshippable.\
- **SQLite concept store (Sub-project B) returns concepts/entities, not raw clause text.** When C needs raw text, it comes from A's output, not from B's lookup path.\
```\
}