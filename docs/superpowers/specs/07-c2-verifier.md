{\rtf1\ansi\ansicpg1252\cocoartf2868
\cocoatextscaling0\cocoaplatform0{\fonttbl\f0\fnil\fcharset0 .AppleSystemUIFontMonospaced-Regular;}
{\colortbl;\red255\green255\blue255;}
{\*\expandedcolortbl;;}
\paperw11900\paperh16840\margl1440\margr1440\vieww11520\viewh8400\viewkind0
\deftab560
\pard\pardeftab560\slleading20\pardirnatural\partightenfactor0

\f0\fs24 \cf0 ### `spec/07-c2-verifier.md`\
```markdown\
# Component C2 \'97 Verifier\
\
## Role\
Second pass of the pipeline. Fact-checks Extractor's draft findings mechanically and semantically.\
\
## Two Phases Per Draft\
\
### Phase 1: Mechanical (deterministic, no LLM, runs first)\
\
| Check | Failure \uc0\u8594  |\
|---|---|\
| Every `text_spans[].quote` is an exact substring of clause text | REJECT |\
| Every `regulatory_citations[].section` is present in retrieved snippet set | REJECT |\
| Every `regulatory_citations[].version_hash` matches retrieved snippet hash | REJECT |\
| Schema-shape and enum-value checks | REJECT |\
\
### Phase 2: Semantic (LLM, only if mechanical passes)\
\
- Different system prompt; smaller/cheaper model permitted (e.g., Sonnet 4.6 when Extractor is Opus 4.7)\
- Asks: does reasoning follow from cited spans and reg? Does `category_id` match what spans actually say?\
- Returns `\{verdict: "pass"|"fail", failure_reason: string|null\}`\
\
## Output\
- `VERIFIED` \uc0\u8594  C8 Findings store\
- `REJECTED` \uc0\u8594  C10 Human review queue (with rejection reason)\
- **No fix-and-retry loop** \'97 rejected drafts are never auto-corrected\
```\
}