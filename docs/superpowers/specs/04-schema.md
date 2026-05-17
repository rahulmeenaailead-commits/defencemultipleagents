{\rtf1\ansi\ansicpg1252\cocoartf2868
\cocoatextscaling0\cocoaplatform0{\fonttbl\f0\fnil\fcharset0 .AppleSystemUIFontMonospaced-Regular;\f1\fnil\fcharset0 Menlo-Regular;}
{\colortbl;\red255\green255\blue255;}
{\*\expandedcolortbl;;}
\paperw11900\paperh16840\margl1440\margr1440\vieww11520\viewh8400\viewkind0
\deftab560
\pard\pardeftab560\slleading20\pardirnatural\partightenfactor0

\f0\fs24 \cf0 ### `spec/04-schema.md`\
```markdown\
# Risk-Finding Schema\
\
The single payload every shipped or abstained finding conforms to. **Bold = mandatory**; missing a mandatory field \uc0\u8594  finding cannot ship (model must set `abstention=true`).\
\
```jsonc\
\{\
  "clause_id":           "...",           // FK to Sub-project B store\
\
  // CLASSIFICATION\
  "category_id":         2,               // 1-15 (closed)\
  "rule_id":             "IP-DR-UR-01",   // which detection rule fired\
\
  // RISK SCORE (multi-dimensional)\
  "severity":            "high",          // low | med | high | critical\
  "likelihood":          "high",          // low | med | high\
  "negotiability":       "hard",          // easy | hard | fixed-by-statute\
  "composite_score":     87,              // 0-100, derived; UI sort only\
\
  // EVIDENCE \'97 the trust engine\
  "evidence": \{\
    "text_spans": [\
      \{ "quote": "...", "char_start": 12044, "char_end": 12198,\
        "page": 47, "section": "H.7(b)" \}\
    ],                                     // \uc0\u8805 1 REQUIRED\
    "regulatory_citations": [\
      \{ "reg_id": "DFARS", "section": "252.227-7013(b)(1)",\
        "version_date": "2025-09-15", "version_hash": "sha256:..." \}\
    ],                                     // REQUIRED if category has reg anchor\
    "reasoning":          "..."            // 1-3 sentences, structured\
  \},\
\
  // ACTION \'97 for contractors\
  "action": \{\
    "plain_language":     "...",           // 1-2 sentences, principal-readable\
    "redline_suggestion": "...",           // alternative clause text\
    "urgency":            "before_signature"\
  \},\
\
  // ABSTENTION\
  "confidence":           0.91,            // 0.0-1.0, self-assessed\
  "abstention":           false,\
  "abstention_reason":    null             // structured enum if abstention=true\
\}\
```\
\
## Design Decisions\
\
1. **Multi-dimensional risk** (severity \'d7 likelihood \'d7 negotiability) over single number \'97 auditable, not gameable\
2. **Evidence is mandatory.** No span 
\f1 \uc0\u8658 
\f0  no finding. No reg citation in regulated category 
\f1 \uc0\u8658 
\f0  no finding\
3. **Action has both plain-language** (for principal) and redline (for lawyer)\
4. **Abstention is first-class output**, not an error. Default behavior on uncertainty\
5. **`urgency` is closed enum**, not free text: `before_signature` | `within_30_days` | `at_next_mod`\
```\
}