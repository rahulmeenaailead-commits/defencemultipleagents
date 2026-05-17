{\rtf1\ansi\ansicpg1252\cocoartf2868
\cocoatextscaling0\cocoaplatform0{\fonttbl\f0\fnil\fcharset0 .AppleSystemUIFontMonospaced-Regular;\f1\fnil\fcharset0 HelveticaNeue;}
{\colortbl;\red255\green255\blue255;}
{\*\expandedcolortbl;;}
\paperw11900\paperh16840\margl1440\margr1440\vieww11520\viewh8400\viewkind0
\deftab560
\pard\pardeftab560\slleading20\pardirnatural\partightenfactor0

\f0\fs24 \cf0 \
### `spec/05-architecture.md`\
```markdown\
# Architecture\
\
**Single sentence:** A two-pass LLM pipeline (Extractor \uc0\u8594  Verifier) takes one clause at a time, grounds every risk finding in retrieved versioned regulatory text + exact-substring evidence spans, and routes anything it can't ground to a human review queue instead of shipping it to the contractor.\
\
## Why Two-Pass\
\
- Single LLM call achieves ~60-70% accuracy \'97 model invents text spans and reg citations confidently\
- Two passes split work: Extractor proposes findings; Verifier fact-checks them mechanically and semantically\
- Three-pass adds latency without proportional accuracy gain\
- Rule-augmented hybrid is the right answer at production scale but writing 200+ rules upfront is months of unnecessary MVP work\
\
## High-Level Diagram\
\
```\
Clause from Sub-project A\
        \uc0\u9474 \
        \uc0\u9660 \
   C6 Orchestrator\
        \uc0\u9474     loads concepts from B (SQLite)\
        \uc0\u9474     retrieves top-K reg snippets from C3 (versioned, hash-pinned)\
        \uc0\u9474     loads taxonomy (C5) + rule library (C4)\
        \uc0\u9474     assembles Extractor prompt\
        \uc0\u9660 \
   C1 Extractor \uc0\u9472 \u9472 \u9472  via C7 provider.complete() \u9472 \u9472 \u9472 \u9654  Cloud LLM (now) / Local LLM (later)\
        \uc0\u9474 \
        \uc0\u9660    draft risk finding (JSON, schema-conformant)\
        \uc0\u9474 \
   C2 Verifier\
        \uc0\u9500 \u9472 \u9472  mechanical: text_span exact substring of clause?\
        \uc0\u9500 \u9472 \u9472  mechanical: reg_citation in retrieved snippets?\
        \uc0\u9500 \u9472 \u9472  mechanical: version_hash matches retrieved snippet hash?\
        \uc0\u9500 \u9472 \u9472  semantic (LLM, smaller model): reasoning follows? category matches spans?\
        \uc0\u9474 \
        \uc0\u9500 \u9472 \u9472 \u9472 \u9472 \u9472 \u9472 \u9472 \u9472  VERIFIED \u9472 \u9472 \u9472 \u9472 \u9472 \u9472 \u9654  C8 Findings store \u9472 \u9472 \u9654  D, E, F consumers\
        \uc0\u9492 \u9472 \u9472 \u9472 \u9472 \u9472 \u9472 \u9472 \u9472  REJECTED \u9472 \u9472 \u9472 \u9472 \u9472 \u9472 \u9654  C10 Human review queue (NEVER shown to contractor)\
```\
\
## Anti-Hallucination Guarantees (by construction)\
\
1. **Closed taxonomy** \'97 model can't invent categories\
2. **Retrieved reg corpus** \'97 model can't cite reg text it never saw; Verifier checks\
3. **Exact-substring evidence** \'97 model can't paraphrase quotes; Verifier mechanical-checks\
4. **Abstention is first-class** \'97 better to skip than guess; abstentions go to review queue\
5. **Eval harness with release gate** \'97 hallucination rate < 1% per category enforced in CI\
6. **Audit trail** \'97 every finding carries full provenance\
```\
\
---
\f1\fs26 \
}