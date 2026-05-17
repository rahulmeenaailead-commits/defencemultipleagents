{\rtf1\ansi\ansicpg1252\cocoartf2868
\cocoatextscaling0\cocoaplatform0{\fonttbl\f0\fnil\fcharset0 .AppleSystemUIFontMonospaced-Regular;\f1\fnil\fcharset0 HelveticaNeue;}
{\colortbl;\red255\green255\blue255;}
{\*\expandedcolortbl;;}
\paperw11900\paperh16840\margl1440\margr1440\vieww11520\viewh8400\viewkind0
\deftab560
\pard\pardeftab560\slleading20\pardirnatural\partightenfactor0

\f0\fs24 \cf0 ### `spec/10-c5-taxonomy-library.md`\
```markdown\
# Component C5 \'97 Taxonomy Library\
\
## Format\
- **YAML**, version-controlled (same pattern as C4 rule library)\
- 15 entries (one per category)\
\
## Per-Entry Structure\
```yaml\
- category_id: 2\
  name: "IP & Technical Data Rights"\
  description: "Risks related to intellectual property ownership, license scope, and data rights"\
  regulatory_anchors:\
    - "DFARS 252.227-7013"\
    - "DFARS 252.227-7014"\
    - "DFARS 252.227-7015"\
  default_severity_floor: high\
  applies_to:\
    - primes\
    - ota\
```\
\
## Change Process\
- PR + eval-harness regression run required for any taxonomy change\
- Adding category 16 requires out-of-band PR + golden-set update + eval regression check\
```
\f1\fs26 \
}