# Anti-hallucination — 5 mechanical guarantees (Goal 1 headline)

Enforced *before* any finding reaches the UI. No LLM in this step.

| # | Guarantee | How |
|---|---|---|
| 1 | Closed taxonomy | Zod enum → invalid category → drop, recorded `SCHEMA_INVALID` |
| 2 | Closed reg list | `regCorpus.has(citationId)` → false → drop, `CITATION_NOT_IN_CORPUS` |
| 3 | Exact-substring evidence | `clauseText.includes(quote)` (no fuzzy) → false → drop, `TEXT_SPAN_NOT_FOUND` |
| 4 | Abstention first-class | Prompt invites `[]` on uncertainty; empty never penalized |
| 5 | Visible rejections | Rejected drafts shown in UI "Rejected (N)" drawer with reason — **the trust card** |

Provenance fields (`promptHash, modelId, extractedAt, passType`) on every persisted finding — audit-trail story.

Full spec's LLM verifier ([../07-c2-verifier.md](../07-c2-verifier.md), RTF) is the post-hackathon upgrade.
