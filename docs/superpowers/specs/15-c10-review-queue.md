{\rtf1\ansi\ansicpg1252\cocoartf2868
\cocoatextscaling0\cocoaplatform0{\fonttbl\f0\fnil\fcharset0 .AppleSystemUIFontMonospaced-Regular;\f1\fnil\fcharset0 HelveticaNeue;}
{\colortbl;\red255\green255\blue255;}
{\*\expandedcolortbl;;}
\paperw11900\paperh16840\margl1440\margr1440\vieww11520\viewh8400\viewkind0
\deftab560
\pard\pardeftab560\slleading20\pardirnatural\partightenfactor0

\f0\fs24 \cf0 ### `spec/15-c10-review-queue.md`\
```markdown\
# Component C10 \'97 Human Review Queue\
\
## Table Schema\
```\
\{finding_draft_id, clause_id, abstention_reason, verifier_rejection_reason,\
 status, sme_user_id, resolution, golden_dataset_promoted\}\
```\
\
## Minimal Admin UI\
Side-by-side view:\
- Clause text | Model draft | SME edit form\
\
## SME Actions\
| Action | Result |\
|---|---|\
| "Valid risk (publish)" | Finding shipped to C8 |\
| "False positive (discard)" | Draft discarded |\
| "Needs new rule (creates ticket)" | Ticket opened for rule library update |\
| "Edge case (add to golden)" | Promoted to golden dataset |\
\
## Feedback Loop\
SME-resolved items promoted to golden close the data loop \'97 model improves over time via expanded golden set.\
\
## Critical Rule\
Abstentions and rejected drafts **NEVER appear in contractor UI as risks**. They stay in the review queue until SME triages.\
```\
\
---
\f1\fs26 \
}