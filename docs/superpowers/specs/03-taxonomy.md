{\rtf1\ansi\ansicpg1252\cocoartf2868
\cocoatextscaling0\cocoaplatform0{\fonttbl\f0\fnil\fcharset0 .AppleSystemUIFontMonospaced-Regular;}
{\colortbl;\red255\green255\blue255;}
{\*\expandedcolortbl;;}
\paperw11900\paperh16840\margl1440\margr1440\vieww11520\viewh8400\viewkind0
\deftab560
\pard\pardeftab560\slleading20\pardirnatural\partightenfactor0

\f0\fs24 \cf0 ### `spec/03-taxonomy.md`\
```markdown\
# The 15-Category Closed Risk Taxonomy\
\
The taxonomy is **closed**: the model can only classify into one of these categories or abstain. Novel categories require an out-of-band PR + golden-set update + eval regression check.\
\
| # | Category | Primary Regulatory Anchor |\
|---|---|---|\
| 1 | Cybersecurity & CMMC compliance | DFARS 252.204-7012 / -7019 / -7020 / -7021; NIST SP 800-171 |\
| 2 | IP & technical data rights | DFARS 252.227-7013 / -7014 / -7015; negotiated terms (OTAs) |\
| 3 | Termination \'97 unilateral govt T4C / T4D | FAR 52.249 series |\
| 4 | Changes, scope creep, equitable adjustment | FAR 52.243 series |\
| 5 | Indemnification & unlimited liability | FAR 52.228; custom-clause review |\
| 6 | Cost / pricing, TINA disclosure, CAS | FAR 15.403, 48 CFR 9903 |\
| 7 | Payment terms, withholdings, progress payments | FAR 52.232; Prompt Payment Act |\
| 8 | Flowdown obligations to subcontractors | DFARS 252.244-7000; OTA consortium rules |\
| 9 | Export controls \'97 ITAR / EAR | 22 CFR 120\'96130; 15 CFR 730\'96774 |\
| 10 | Socioeconomic compliance (BAA, TAA, anti-trafficking, anti-kickback) | FAR 52.222, 52.225 |\
| 11 | SOW ambiguity & undefined acceptance criteria | Pattern-based (no reg anchor) |\
| 12 | Audit & records retention | FAR 52.215-2 |\
| 13 | Schedule, delivery, liquidated damages | FAR 52.211, 52.212-4(f) |\
| 14 | Disputes, forum, sovereign immunity | FAR 52.233; Contract Disputes Act |\
| 15 | OTA-specific: follow-on production, cost share, consortium fees, prototype-vs-production scope | 10 U.S.C. \'a7 4022; DoD OT Guide |\
\
## Design Rule\
\
Category 11 (SOW ambiguity) is the only category with no regulatory anchor. All others require at least one regulatory citation in findings.\
```\
}