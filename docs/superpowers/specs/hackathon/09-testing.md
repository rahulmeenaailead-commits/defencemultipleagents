# Testing

Hackathon-tight. No coverage targets.

- **Unit (vitest):** `schema.ts` round-trips · `verifier.ts` on good/bad fixtures (good span, bad span, good citation, bad citation) · `segment.ts` on sample PDF text · `regCorpus.has(id)` membership.
- **Integration:** one e2e on `POST /api/analyze` against the sample PDF with a **stub `ModelProvider`** returning canned responses. Assert: (a) verified findings have valid spans + citations, (b) intentionally-bad drafts land in `rejectedFindings`.
- **Manual:** live DeepSeek run against the sample PDF before each deploy.

No conformance suite (full spec's [../19-testing-strategy.md](../19-testing-strategy.md), RTF — out of scope for 48h).
