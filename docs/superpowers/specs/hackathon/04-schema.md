# Schema (Zod)

```ts
RiskCategory = enum(15)            // closed — model can't invent
Severity     = LOW|MEDIUM|HIGH|CRITICAL

RiskFinding = {
  findingId, clauseId, category, severity,
  riskScore: 0–100, confidence: 0–1,

  textSpan:           {quote, charStart, charEnd},        // ✓ exact-substring (05)
  regulatoryCitation: {citationId, citationText} | null,  // ✓ in regCorpus    (05)
  reasoning, recommendedAction, redlineSuggestion,

  provenance: {promptHash, modelId, extractedAt, passType, relatedClauseIds[]}
}

RejectedFinding = {
  findingId, clauseId, category,
  reason: TEXT_SPAN_NOT_FOUND | CITATION_NOT_IN_CORPUS | SCHEMA_INVALID,
  rawDraft
}

Clause = {clauseId, text, pageNumber, sectionRef, charOffsets}

ConceptRecord = {  // returned by conceptCache — no raw text
  clauseId, pageNumber, sectionRef,
  what, meaning, concepts[], entities[{kind, value}]
}
```
