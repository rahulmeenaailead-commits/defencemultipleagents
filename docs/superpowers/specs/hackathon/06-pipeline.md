# 3-pass pipeline (Goal 3)

| Pass | What | LLM calls / 20-clause PDF |
|---|---|---|
| 1 Per-clause | Clause + concepts → draft findings → verifier ([05](05-hallucination.md)) | ~20 (\|\|, ≤10) |
| 2 Cross-ref  | Regex finds `see clause N` / `§N.N` / `Section N` → LLM per pair → verifier | ~3–5 |
| 3 Hidden     | 1 batched call: surviving findings → combination-risks referencing existing clauseIds | 1 |

Cross-ref + hidden findings carry `passType` (for UI tabs) and `relatedClauseIds[]` (so proof panel renders multi-clause evidence).

Concept extraction (1 LLM call/clause) runs before Pass 1 and populates `conceptCache[jobId]`. Passes 2 + 3 read concepts from the cache; raw text comes from the in-memory `Clause` map (matches sub-project B contract: cache returns concepts, never raw text).
