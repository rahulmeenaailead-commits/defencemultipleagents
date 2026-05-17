{\rtf1\ansi\ansicpg1252\cocoartf2868
\cocoatextscaling0\cocoaplatform0{\fonttbl\f0\fnil\fcharset0 .AppleSystemUIFontMonospaced-Regular;}
{\colortbl;\red255\green255\blue255;}
{\*\expandedcolortbl;;}
\paperw11900\paperh16840\margl1440\margr1440\vieww11520\viewh8400\viewkind0
\deftab560
\pard\pardeftab560\slleading20\pardirnatural\partightenfactor0

\f0\fs24 \cf0 ### `spec/16-data-flow-traces.md`\
```markdown\
# Data Flow \'97 Representative Traces\
\
## Trace 1: Happy Path (verified finding ships)\
\
```\
1. Clause c_4711: "...grants Government unlimited rights in all technical data..."\
2. C6: SQLite returns concepts; C3 retrieves DFARS 252.227-7013 + 5 others\
3. C1 Extractor \uc0\u8594  draft finding (category=2, rule=IP-DR-UR-01)\
4. C2 Verifier:\
   - Mechanical: span is substring? YES. Reg in retrieved set? YES. Hash matches? YES.\
   - Semantic: reasoning follows? YES. Category matches spans? YES.\
   Verdict: VERIFIED\
5. C8: row inserted with full audit trail\
6. UI shows risk card with highlighted text, reg citation, plain-language action, redline\
```\
\
## Trace 2: Abstention Path\
\
```\
1. Clause c_8821: ambiguous boilerplate\
2. Extractor cannot confidently match required_evidence_patterns\
   Returns \{abstention: true, abstention_reason: "...", confidence: 0.31\}\
3. Verifier skipped (no finding)\
4. Routed to C10. NEVER appears in contractor UI\
5. SME triages\
```\
\
## Trace 3: Verifier Catches Hallucination\
\
```\
1. Clause c_5530: "Contractor shall comply with all applicable cybersecurity requirements."\
2. Extractor invents: text_span quote "compliance with NIST SP 800-171" (NOT in clause)\
3. Verifier mechanical: is the quote an exact substring? NO \uc0\u8594  REJECT\
4. Routed to C10 with rejection reason "invented_or_paraphrased_evidence"\
5. Contractor never sees hallucinated finding\
```\
\
## Trace 4: Multiple Findings from One Clause\
\
```\
1. Clause c_9012 covers IP rights AND indemnification AND termination\
2. Extractor returns 3 draft findings (different category_ids, different spans)\
3. Verifier runs once per draft. Each independently VERIFIED or REJECTED\
4. 2 verified \uc0\u8594  C8; 1 \u8594  C10\
5. UI surfaces 2 risk cards from same clause\
```\
\
## Cross-Cutting Invariants\
\
| Invariant | Enforced by |\
|---|---|\
| No finding ships without \uc0\u8805 1 substring-verified text span | C2 mechanical |\
| No finding ships citing reg text not retrieved this run | C2 mechanical |\
| No finding ships if category anchor reg absent from retrieved set | C2 mechanical |\
| No finding ships if Verifier semantic phase rejects | C2 semantic |\
| Every shipped finding is reproducible from its audit row | C8 versioning |\
| Abstentions are never silently dropped | C10 routing |\
| Same inputs \uc0\u8594  identical finding | C6 idempotency + temp=0 |\
```\
}