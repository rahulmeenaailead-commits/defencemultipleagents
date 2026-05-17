# Data flow — `POST /api/analyze`

```
multipart PDF
  → parsePDF → segmentClauses → extractConcepts (||, ≤10)
  → PASS 1 extractor (||, ≤10) → mechanical verifier (see 05)
  → PASS 2 cross_ref (regex pairs → LLM per pair → verifier)
  → PASS 3 hidden    (1 batched LLM call over surviving findings)
  → { jobId, clauses, verifiedFindings, rejectedFindings,
      crossRefFindings, hiddenFindings, timings }
```

Target wall-clock: **~10s** for a 20-clause PDF (DeepSeek-chat, `p-limit=10`).
