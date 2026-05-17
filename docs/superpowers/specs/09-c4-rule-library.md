{\rtf1\ansi\ansicpg1252\cocoartf2868
\cocoatextscaling0\cocoaplatform0{\fonttbl\f0\fnil\fcharset0 .AppleSystemUIFontMonospaced-Regular;}
{\colortbl;\red255\green255\blue255;}
{\*\expandedcolortbl;;}
\paperw11900\paperh16840\margl1440\margr1440\vieww11520\viewh8400\viewkind0
\deftab560
\pard\pardeftab560\slleading20\pardirnatural\partightenfactor0

\f0\fs24 \cf0 ### `spec/09-c4-rule-library.md`\
```markdown\
# Component C4 \'97 Rule Library\
\
## Format\
- **YAML files in repo**, version-controlled, code-reviewed\
- Never user-editable in MVP\
\
## Per-Rule Structure\
```yaml\
- rule_id: IP-DR-UR-01\
  category_id: 2\
  title: "Unlimited Rights granted without time limit"\
  description: "Clause grants government Unlimited Rights in technical data with no time-limited carve-out"\
  required_evidence_patterns:\
    - text_span_must_contain_one_of: ["unlimited rights", "all rights", "fully transferable"]\
    - reg_citation_required: "DFARS 252.227-7013"\
  default_severity: high\
  default_negotiability: hard\
```\
\
## Scale\
- ~75 rules at MVP launch (5 per category)\
- ~200 by post-MVP\
- SME-authored, eval-validated\
\
## Why YAML Not DB\
Rules are code. Changes flow through PR + eval-harness regression run. DB-editable rules drift and cause configuration-driven hallucination.\
```\
}