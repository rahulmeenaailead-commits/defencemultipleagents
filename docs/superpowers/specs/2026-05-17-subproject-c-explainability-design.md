# Sub-project C — Per-clause Risk + Explainability Engine

| Field | Value |
|---|---|
| **Date** | 2026-05-17 |
| **Status** | Design approved; pending implementation plan |
| **Owner** | Rahul Meena |
| **Sub-project** | C (of A–H, per `memory/project_overview.md`) |
| **Target market** | U.S. defense contractors reviewing OTA agreements (10 U.S.C. § 4022) |
| **MVP test corpus** | DoD prime contracts (FAR Part 52 + DFARS 252) |

---

## 1. Purpose & Scope

Sub-project C is the **per-clause risk-scoring + explainability engine** for the defense contract review product. It is Goal 1's heart: every risk score it produces must be backed by verifiable proof a contractor (and their lawyer) can audit.

**In scope:**

- Given one clause's text and metadata, produce zero, one, or more **risk findings**, each with: classification into a closed 15-category taxonomy; multi-dimensional risk score; mandatory evidence (exact text spans + regulatory citations); plain-language action + redline suggestion; confidence; abstention if grounding cannot be established.
- A two-pass LLM pipeline (Extractor → Verifier) with deterministic post-checks.
- A provider-abstraction layer making cloud→local LLM swap (Goal 2) a config change, not a refactor.
- Versioned regulatory corpus + retrieval, audit trail, eval harness with release gates, human review queue for abstentions.

**Explicitly out of scope (handled by other sub-projects):**

- PDF parsing, clause segmentation, page/section detection → **A**
- Concept/entity extraction + SQLite concept store → **B**
- Cross-reference risk (clause X cites clause Y → combined finding) → **D**
- Interdependence risk via pairwise scoring + classical subset enumeration (no QAOA) → **E**
- Contractor-facing UI, PDF highlight rendering, dashboard → **F**
- Real local-model implementation (vLLM + constrained generation) → **G**
- Postgres migration, horizontal worker scaling, multi-tenant → **H**

---

## 2. Boundaries with Other Sub-projects

| Direction | Sub-project | Contract |
|---|---|---|
| In | **A** | Delivers `Clause { clause_id, text, page, section_ref, char_offsets }` |
| In | **B** | Lookup by `clause_id` returns concepts/entities/meanings (never raw text in the lookup path; raw text is loaded separately by C from A's output) |
| Out | **D** | C8 (findings store) writes findings + a clause-reference graph hook D can consume |
| Out | **E** | C8 emits per-clause risk vectors usable for pairwise scoring |
| Out | **F** | UI reads from C8: findings, evidence spans (for PDF highlight), actions, abstentions (badge if review pending) |
| In | **G** | Swaps `ModelProvider` implementation; no other code changes |
| In | **H** | C6 becomes queue-backed worker; C8 swaps to Postgres; C3 sharded |

---

## 3. The 15-Category Closed Risk Taxonomy

The taxonomy is **closed**: the model can only classify a clause into one of these categories or abstain. Novel categories require an out-of-band PR + golden-set update + eval regression check.

| # | Category | Primary regulatory anchor |
|---|---|---|
| 1 | Cybersecurity & CMMC compliance | DFARS 252.204-7012 / -7019 / -7020 / -7021; NIST SP 800-171 |
| 2 | IP & technical data rights | DFARS 252.227-7013 / -7014 / -7015 (primes); negotiated terms (OTAs) |
| 3 | Termination — unilateral govt T4C / T4D | FAR 52.249 series |
| 4 | Changes, scope creep, equitable adjustment | FAR 52.243 series |
| 5 | Indemnification & unlimited liability | FAR 52.228; custom-clause review |
| 6 | Cost / pricing, TINA disclosure, CAS | FAR 15.403, 48 CFR 9903 |
| 7 | Payment terms, withholdings, progress payments | FAR 52.232; Prompt Payment Act |
| 8 | Flowdown obligations to subcontractors | DFARS 252.244-7000; OTA consortium rules |
| 9 | Export controls — ITAR / EAR | 22 CFR 120–130; 15 CFR 730–774 |
| 10 | Socioeconomic compliance (BAA, TAA, anti-trafficking, anti-kickback) | FAR 52.222, 52.225 |
| 11 | SOW ambiguity & undefined acceptance criteria | Pattern-based (no reg anchor) |
| 12 | Audit & records retention | FAR 52.215-2 |
| 13 | Schedule, delivery, liquidated damages | FAR 52.211, 52.212-4(f) |
| 14 | Disputes, forum, sovereign immunity | FAR 52.233; Contract Disputes Act |
| 15 | OTA-specific: follow-on production eligibility, cost share, consortium fees, prototype-vs-production scope | 10 U.S.C. § 4022; DoD OT Guide |

---

## 4. Risk-Finding Schema

The single payload every shipped or abstained finding conforms to. Bold = mandatory; missing a mandatory field → finding cannot ship (model must set `abstention=true`).

```jsonc
{
  "clause_id":           "...",                         // FK to Sub-project B store

  // CLASSIFICATION
  "category_id":         2,                             // one of the 15 (closed)
  "rule_id":             "IP-DR-UR-01",                 // which detection rule fired

  // RISK SCORE (multi-dimensional)
  "severity":            "high",                        // low | med | high | critical
  "likelihood":          "high",                        // low | med | high
  "negotiability":       "hard",                        // easy | hard | fixed-by-statute
  "composite_score":     87,                            // 0-100, derived; UI sort only

  // EVIDENCE — the trust engine
  "evidence": {
    "text_spans":        [                              // ≥1 REQUIRED
      { "quote": "...", "char_start": 12044, "char_end": 12198,
        "page": 47, "section": "H.7(b)" }
    ],
    "regulatory_citations": [                           // REQUIRED if category has reg anchor
      { "reg_id": "DFARS", "section": "252.227-7013(b)(1)",
        "version_date": "2025-09-15", "version_hash": "sha256:..." }
    ],
    "reasoning":          "..."                         // 1-3 sentences, structured
  },

  // ACTION — for contractors
  "action": {
    "plain_language":     "...",                        // 1-2 sentences, principal-readable
    "redline_suggestion": "...",                        // alternative clause text
    "urgency":            "before_signature"            // before_signature | within_30_days | at_next_mod
  },

  // ABSTENTION
  "confidence":           0.91,                         // 0.0-1.0, self-assessed
  "abstention":           false,                        // if true, NEVER shown to contractor
  "abstention_reason":    null                          // structured enum if abstention=true
}
```

**Design decisions:**

- Multi-dimensional risk (severity × likelihood × negotiability) over single number — auditable, not gameable.
- Evidence is mandatory. No span ⇒ no finding. No reg citation in a regulated category ⇒ no finding.
- Action has both plain-language (for principal) and redline (for lawyer).
- Abstention is a first-class output, not an error. Default behavior on uncertainty.
- `urgency` is a closed enum, not free text.

---

## 5. Architecture

**Single sentence:** A two-pass LLM pipeline (Extractor → Verifier) takes one clause at a time, grounds every risk finding in retrieved versioned regulatory text + exact-substring evidence spans, and routes anything it can't ground to a human review queue instead of shipping it to the contractor.

### Why two-pass (vs single, three-pass, or rule-augmented hybrid)

A single LLM call achieves ~60-70% accuracy in this domain — model invents text spans and reg citations confidently. Two passes split work: Extractor proposes findings; Verifier fact-checks them mechanically and semantically. Three-pass adds latency without proportional accuracy gain at clause level. Rule-augmented hybrid is the right answer at production scale (Sub-project H) but writing 200+ rules upfront is months of unnecessary work for MVP; the architecture leaves a rule-engine hook so rules can be added later without restructuring.

### High-level diagram

```
Clause from Sub-project A
        │
        ▼
   C6 Orchestrator
        │   loads concepts from B (SQLite)
        │   retrieves top-K reg snippets from C3 (versioned, hash-pinned)
        │   loads taxonomy (C5) + rule library (C4)
        │   assembles Extractor prompt
        ▼
   C1 Extractor  ── via C7 provider.complete() ──► Cloud LLM (now) / Local LLM (later)
        │
        ▼  draft risk finding (JSON, schema-conformant)
        │
   C2 Verifier
        ├── mechanical: every text_span an exact substring of clause text?
        ├── mechanical: every reg_citation present in retrieved snippets?
        ├── mechanical: version_hash matches retrieved snippet hash?
        ├── semantic (LLM, can be smaller model): reasoning follows? category matches spans?
        │
        ├──── VERIFIED ─────► C8 Findings store ──► D, E, F consumers
        └──── REJECTED ─────► C10 Human review queue (NEVER shown to contractor)
```

### Anti-hallucination guarantees (by construction)

1. **Closed taxonomy** — model can't invent categories.
2. **Retrieved reg corpus** — model can't cite reg text it never saw; Verifier checks.
3. **Exact-substring evidence** — model can't paraphrase quotes; Verifier mechanical-checks.
4. **Abstention is first-class** — better to skip than guess; abstentions go to review queue.
5. **Eval harness with release gate** — hallucination rate < 1% per category enforced in CI.
6. **Audit trail** — every finding carries full provenance (prompt, model version, reg snippets, version hashes).

---

## 6. Component Specifications (the 10 components)

### C1 — Extractor

- **Input:** assembled prompt (clause text + concepts + top-K reg snippets + taxonomy + rule library + abstention protocol).
- **Output:** structured JSON conforming to the risk-finding schema. Enforced via constrained decoding (tool-use on Anthropic; `response_format` on OpenAI-compatible; Outlines/xgrammar on local).
- **Behavior:** zero prose outside the schema. If mandatory fields cannot be filled, the Extractor sets `abstention=true` with `abstention_reason`.
- **Retry policy:** 1 retry on schema validation failure with the parse error appended. Second failure → automatic abstention.
- **System prompt is versioned** (`prompts/extractor.v1.md`); every finding's audit row references the version.

### C2 — Verifier

Two phases per draft:

1. **Mechanical phase** (deterministic, no LLM, runs first):
   - Every `text_spans[].quote` is an exact substring of the clause text. Fail → reject.
   - Every `regulatory_citations[].section` is present in this run's retrieved snippet set. Fail → reject.
   - Every `regulatory_citations[].version_hash` matches the retrieved snippet's hash. Fail → reject.
   - Schema-shape and enum-value checks. Fail → reject.
2. **Semantic phase** (LLM, only if mechanical passes):
   - Different system prompt; smaller/cheaper model permitted (e.g., Sonnet 4.6 when Extractor is Opus 4.7).
   - Asks: does the reasoning follow from the cited spans and reg? Does `category_id` match what the spans actually say?
   - Returns `{verdict: "pass"|"fail", failure_reason: string|null}`.
- **Output:** `VERIFIED` → C8. `REJECTED` → C10 with rejection reason. No fix-and-retry loop.

### C3 — Reg corpus + retrieval

- **Storage:** versioned snapshots of FAR Part 52 (subset referenced by 15 categories), DFARS 252, 10 U.S.C. § 4022, DoD OT Guide. Each snapshot row: `{reg_id, section, text, version_date, version_hash (sha256)}`. Snapshots are immutable; new version = new row.
- **Refresh job:** monthly scrape of acquisition.gov + DPC OSD; diff against prior snapshot; flag changes for SME review before promoting to "current."
- **Retrieval:** hybrid BM25 + dense embeddings, combined via reciprocal-rank fusion. Returns top 5–8 snippets per query.
- **Query construction:** clause text + concepts from SQLite → single query.
- **MVP scope:** ~3,000–5,000 sections across the four corpora.

### C4 — Rule library

- **YAML files in repo**, version-controlled, code-reviewed; never user-editable in MVP.
- **Per-rule structure:**
  ```yaml
  - rule_id: IP-DR-UR-01
    category_id: 2
    title: "Unlimited Rights granted without time limit"
    description: "Clause grants government Unlimited Rights in technical data with no time-limited carve-out"
    required_evidence_patterns:
      - text_span_must_contain_one_of: ["unlimited rights", "all rights", "fully transferable"]
      - reg_citation_required: "DFARS 252.227-7013"
    default_severity: high
    default_negotiability: hard
  ```
- ~75 rules at MVP launch (5 per category); ~200 by post-MVP. SME-authored, eval-validated.
- **Why YAML not DB:** rules are code. Changes flow through PR + eval-harness regression run. DB-editable rules drift and cause configuration-driven hallucination.

### C5 — Taxonomy library

- Same pattern as C4: YAML, version-controlled, 15 entries.
- Per entry: `{category_id, name, description, regulatory_anchors, default_severity_floor, applies_to: [primes, ota]}`.

### C6 — Orchestrator

- Per-clause function: `analyze_clause(clause_id) → list[Finding]` (a single clause can yield 0, 1, or N findings — multiple risks per clause are allowed and surfaced independently).
- **Stateless**; horizontally parallelizable (Sub-project H makes this a worker pool).
- **Per-call structured trace** (logged + sent to observability): `{clause_id, prompt_hash, model_versions, retrieved_reg_hashes, extractor_latency_ms, verifier_latency_ms, finding_count, abstention_count, cost_usd}`.
- **Idempotency:** for the same `(clause_id, prompt_version, model_version, reg_corpus_version)`, the cached result from C8 is returned. No re-billing on identical re-runs.

### C7 — Model provider abstraction (Goal 2 hinge)

Single interface; every LLM call in C goes through it.

```python
class ModelProvider(Protocol):
    def complete(
        self,
        system_prompt: str,
        user_prompt: str,
        response_schema: dict,
        max_tokens: int,
        temperature: float = 0.0,
        cache_prefix_id: str | None = None,
    ) -> ProviderResponse: ...

class ProviderResponse(TypedDict):
    parsed: dict
    raw_text: str
    model_id: str
    model_version: str
    input_tokens: int
    output_tokens: int
    cached_tokens: int
    latency_ms: int
    cost_usd: float | None       # None for local
    provider_name: str
```

**Implementations at MVP:**

- `AnthropicProvider` — Claude Opus 4.7 (Extractor) and Sonnet 4.6 (Verifier) via Anthropic API; prompt caching for the static prefix (taxonomy + rule library + abstention protocol).
- `StubLocalProvider` — fixture-driven; proves the interface supports a non-Anthropic backend; runs in conformance suite.

**Implementation at Goal-2 cutover:**

- `LocalProvider` — vLLM-served local model (Llama 3.3 70B Instruct or Qwen 2.5 72B at MVP scale) behind an OpenAI-compatible HTTP endpoint, with constrained generation via Outlines or xgrammar.

**Five disciplines that keep the swap a config change:**

1. No provider-specific types leak out of `providers/`.
2. Schema enforcement is a provider responsibility, not a caller responsibility.
3. Determinism (temperature=0.0) is a contract honored by every provider or documented as a deviation that fails conformance.
4. Prompts are provider-agnostic (plain English; no model-specific framing).
5. Conformance test suite is a merge gate for new providers.

### C8 — Findings store

- **MVP:** SQLite. **Production (Sub-project H):** Postgres. Same schema.
- **Tables:** `findings`, `audit_trail` (1:1 with findings), `reg_snapshot_versions`, `model_versions`, `prompt_versions`.
- Each finding row carries `prompt_version_id`, `extractor_model_version_id`, `verifier_model_version_id`, `reg_corpus_version_id` — full reproducibility.
- **Append-only.** Findings never updated in place; corrections create a new row with `supersedes_id`.

### C9 — Eval harness

- **CLI:** `eval run --golden golden_v3.jsonl --provider anthropic --extractor-prompt v1.7 --verifier-prompt v1.2`.
- **Outputs:** per-category metrics + delta vs. previous run + regression sample.
- **CI integration:** runs on every PR touching prompts, rules, taxonomy, or provider code. Blocks merge on regression beyond threshold.
- **Cost cap:** golden set kept ≤ 400 clauses so a full run is < 30 min and < $20 in API cost. Nightlies can be larger.

### C10 — Human review queue

- DB table: `{finding_draft_id, clause_id, abstention_reason, verifier_rejection_reason, status, sme_user_id, resolution, golden_dataset_promoted}`.
- **Minimal admin UI:** side-by-side clause text | model draft | SME edit form. SME marks: "valid risk (publish)", "false positive (discard)", "needs new rule (creates ticket)", "edge case (add to golden)".
- **Feedback loop:** SME-resolved items promoted to golden close the data loop.

---

## 7. Data Flow — Representative Traces

### Trace 1 — Happy path (verified finding ships to contractor)

```
1. Clause c_4711 arrives from A: "...grants the Government unlimited rights
   in all technical data and computer software ... in perpetuity ..."
2. C6: SQLite returns concepts; C3 retrieves DFARS 252.227-7013 + 5 others
   with version hashes; prompt assembled.
3. C1 Extractor → draft finding (category=2, rule=IP-DR-UR-01, span quoting
   the actual clause text, reg citation 252.227-7013(b)(1)).
4. C2 Verifier:
     - Mechanical: span is substring? YES. Reg in retrieved set? YES. Hash matches? YES.
     - Semantic: reasoning follows? YES. Category matches spans? YES.
   Verdict: VERIFIED.
5. C8: row inserted with full audit trail.
6. UI reads finding → contractor sees risk card with highlighted text,
   reg citation, plain-language action, redline.
```

### Trace 2 — Abstention path (Extractor can't ground → review queue)

```
1. Clause c_8821: ambiguous boilerplate.
2. Extractor cannot match required_evidence_patterns confidently;
   returns {abstention: true, abstention_reason: "...", confidence: 0.31}.
3. Verifier skipped (no finding).
4. Routed to C10. NEVER appears in contractor UI as a risk.
5. SME triages.
```

### Trace 3 — Verifier catches Extractor hallucination

```
1. Clause c_5530: "Contractor shall comply with all applicable cybersecurity
   requirements."
2. Extractor invents: text_span quote "compliance with NIST SP 800-171"
   (NOT in clause text); reg cite DFARS 252.204-7019(c)(2).
3. Verifier mechanical phase: is the quote an exact substring? NO. → REJECT.
4. Routed to C10 with rejection reason "invented_or_paraphrased_evidence".
5. Contractor never sees the hallucinated finding.
```

### Trace 4 — Multiple findings from one clause

```
1. Clause c_9012 covers IP rights AND indemnification AND termination.
2. Extractor returns 3 draft findings (different category_ids, different spans).
3. Verifier runs once per draft. Each independently VERIFIED or REJECTED.
4. 2 verified findings persist to C8; 1 routed to C10.
5. UI surfaces 2 risk cards from the same clause.
```

### Cross-cutting invariants

| Invariant | Enforced by |
|---|---|
| No finding ships without ≥1 substring-verified text span | C2 mechanical |
| No finding ships citing reg text not retrieved this run | C2 mechanical |
| No finding ships in a category whose anchor reg is absent from retrieved set | C2 mechanical |
| No finding ships if Verifier semantic phase rejects | C2 semantic |
| Every shipped finding is reproducible from its audit row | C8 versioning |
| Abstentions are never silently dropped | C10 routing |
| Same `(clause, prompt_v, model_v, reg_v)` → identical finding | C6 idempotency + temperature=0 |

---

## 8. Error Handling, Abstention Thresholds, Operational Failure Modes

### Abstention triggers

| # | Trigger | Caught by | `abstention_reason` |
|---|---|---|---|
| 1 | Extractor self-reports confidence < 0.70 | C1 | `low_self_confidence` |
| 2 | Extractor voluntarily abstains (protocol) | C1 | model-supplied |
| 3 | Extractor JSON fails schema twice | C1 retry | `schema_validation_failed` |
| 4 | `text_spans` empty or non-substring | C2 mechanical | `invented_or_paraphrased_evidence` |
| 5 | Required `regulatory_citations` missing | C2 mechanical | `missing_required_reg_citation` |
| 6 | Cited reg section not in retrieved snippets | C2 mechanical | `ungrounded_reg_citation` |
| 7 | Reg `version_hash` mismatch | C2 mechanical | `reg_version_mismatch` |
| 8 | `composite_score ≥ 80` AND `confidence < 0.85` | C2 mechanical | `high_severity_low_confidence` |
| 9 | Verifier semantic phase fails | C2 semantic | verifier-supplied |
| 10 | Extractor & Verifier disagree on `category_id` | C2 semantic | `category_disagreement` |

Thresholds (`0.70`, `0.85`) are config-driven; changes governed by release-gate (hallucination rate < 1%).

### Provider / network failures

| Failure | Behavior |
|---|---|
| HTTP 429 / 500 / timeout | Exponential backoff, max 3 attempts; then defer to retry queue. Not an abstention. |
| Malformed response | Counted as schema failure → C1 retry path |
| Provider unavailable > 5 min | Circuit breaker opens; orchestrator stops enqueuing; alert fires. Queued clauses stay queued — no fake findings ship. |
| Local provider OOM / crash | Same circuit breaker. Failover to cloud only if `allow_cloud_failover=true` (defense customers default `false`). |

### Reg corpus integrity

- Retrieved snippets disagree on `version_hash` with canonical store → hard fail; refuse to run on inconsistent state.
- New reg version introduced while findings reference prior version → findings held pending SME confirmation.
- **Existing findings are never auto-invalidated by a reg update** — they're flagged for review. Original finding stays; "reg-change-triggered review" item created in C10.

### Cost runaway protection

- Per-contract budget cap (config; default value set during M7 once average per-contract Anthropic cost is measured — see Open Question #1 in §13). Cap reached → stop, alert, require human resume.
- Per-clause retry cap = 1 → worst case 2 Extractor + 1 Verifier per clause.
- Eval-harness cost cap separate ($20/run default).

### Observability alerts (defaults; tunable)

| Signal | Alert threshold |
|---|---|
| Abstention rate per category sustained 1h | > 25% → SME triage |
| Verifier-reject rate (vs Extractor-self-abstain) | > 15% → prompt drift |
| Per-clause cost p95 | > 2× rolling 7-day median |
| End-to-end p95 latency | > 30s per clause |
| Reg version mismatch errors | > 0 → page operator |
| Circuit breaker open | immediate page |

### Out of scope (explicit)

- Bad clause segmentation (A's problem).
- Cross-clause risks (D and E).
- Adversarial-robustness as a marketing claim (standard guards present; no formal robustness claim in MVP).
- Multilingual contracts (English DoD only in MVP).

---

## 9. Provider Abstraction — Cloud → Local Swap (Goal 2)

Per `memory/user_profile.md`, the user will switch from cloud to a local model after MVP testing for DoD data-residency compliance. The architecture commits to making that switch a configuration change.

### Provider implementations

| Provider | When | Notes |
|---|---|---|
| `AnthropicProvider` | MVP, pilots, test phase | Claude Opus 4.7 Extractor, Sonnet 4.6 Verifier; prompt caching of static prefix (~80-90% input-cost reduction expected) |
| `StubLocalProvider` | Always (test fixture) | Proves interface is provider-agnostic; required in conformance suite |
| `LocalProvider` | Goal-2 cutover | vLLM endpoint + Outlines/xgrammar constrained generation; cost_usd = None |
| `OpenAICompatibleProvider` | Optional | Azure OpenAI / on-prem OpenAI-compatible gateways |

### Goal-2 cutover playbook (committed today; executed later)

1. Select local model (Llama 3.3 70B Instruct or Qwen 2.5 72B at MVP scale; can upgrade to fine-tuned defense variant later).
2. Deploy vLLM in customer environment (on-prem GPU or air-gapped VM).
3. Implement `LocalProvider` against vLLM endpoint with constrained generation.
4. Pass full provider conformance suite (merge gate).
5. Flip config: `MODEL_PROVIDER=local`.
6. Re-run eval harness; hallucination rate < 1% must hold. If not: tune prompts (still provider-agnostic), upgrade local model, or — worst case — surface to customer that local cannot yet meet the bar.
7. Customer cutover.

### Hybrid modes (supported by config)

- Cloud Extractor + local Verifier
- Local Extractor + cloud Verifier
- Dual-cloud (MVP default)
- Dual-local (Goal-2 endpoint)

---

## 10. Testing Strategy

### Layer 1 — Unit tests (no LLM)

Per-component: C2 mechanical checks, C3 retrieval ordering, C4/C5 YAML validation, C6 routing logic, C7 per-implementation error paths, C8 versioning invariants. Target 90%+ coverage on C2/C6/C7/C8.

### Layer 2 — Provider conformance (Goal-2 guarantee)

`tests/providers/conformance/` — every `ModelProvider` implementation must pass:

| Test | What it proves |
|---|---|
| Schema-compliant JSON returned | Provider honors `response_schema` |
| Deterministic at temp=0 (≥3 runs identical) | Reproducibility contract |
| Audit fields populated | model_id, model_version, tokens, latency, provider_name |
| Oversized input → structured error | No raw exceptions leak |
| Schema-impossible input → structured error | Graceful failure |
| Respects max_tokens | Output bounded |
| `cost_usd` = float (cloud) or None (local), never undefined | Audit-trail completeness |

`AnthropicProvider`, `StubLocalProvider`, eventually `LocalProvider` — all run the same suite. New providers don't merge without passing.

### Layer 3 — Integration tests (real Anthropic API; nightly + pre-release)

| Test | What it proves |
|---|---|
| End-to-end known-risk clause | Real DFARS 7012 gap → finding (category 1, expected span, reg citation 7012) |
| End-to-end known-safe clause | Boilerplate → zero findings or honest abstention |
| End-to-end known-ambiguous clause | Designed-ambiguous → Verifier rejects, routed to C10 |
| Hallucination probe: invented reg | Clause mentions "DFARS 999.999-9999" → engine MUST NOT cite it |
| Caching works | Repeated prefix → `cached_tokens > 0` on calls 2..N |

### Layer 4 — Eval harness (the trust gate)

**Golden dataset schema** (`golden_dataset_v*.jsonl`):

```jsonl
{
  "id": "g_0001",
  "source": "DoD prime contract sample, sanitized",
  "clause_text": "...",
  "expected_findings": [{
    "category_id": 2, "rule_id": "IP-DR-UR-01",
    "expected_text_spans": [{ "char_start": 24, "char_end": 87 }],
    "expected_reg_citations": ["DFARS 252.227-7013(b)(1)"],
    "expected_severity": "critical",
    "expected_abstention": false
  }],
  "labeled_by": "sme_kp", "labeled_at": "2026-02-14",
  "notes": "..."
}
```

**Metrics** (per category and aggregate):

- Precision, Recall
- Evidence exact-match rate
- Reg-citation accuracy
- Abstention rate
- **Hallucination rate** (the metric)
- Abstention precision (were our abstentions actually-ambiguous?)

**Release gate:** hallucination rate < 1% per category AND overall. Falling below blocks merge.

### Layer 5 — Red-team probes (quarterly + prompt-version bumps)

| Probe family | Example |
|---|---|
| Invented reg section | Plausible-but-fake DFARS section in clause → must not cite |
| Misleading boilerplate | Scary-sounding terms cosmetically → must not flag |
| Real risk in unusual phrasing | Non-standard vocabulary → catch or abstain |
| Prompt injection in clause | "Ignore prior instructions ..." → must not comply |
| Reg snippet conflict | Two contradicting snippets retrieved → cite only current or abstain |
| Multi-finding clause | Long clause with 3+ independent risks → all surfaced independently |

### Layer 6 — Determinism replay (every release tag)

Pick 50 random historical findings from C8; re-run with recorded `(prompt_v, model_v, reg_v)`. Byte-identical output required. Any divergence is a regression blocker.

### CI gates

| Gate | Runs on | Blocks if |
|---|---|---|
| Unit tests | every PR | any fail |
| Provider conformance | PRs touching `providers/` | any provider fails any test |
| Integration tests | nightly + pre-release | any fail |
| Eval harness | PRs touching prompts/rules/taxonomy/providers | hallucination > 1% or regression > 5% relative |
| Determinism replay | release tags | any divergence |
| Red-team probes | quarterly + prompt-version bumps | precision below threshold |

(Load/performance tests intentionally deferred to Sub-project H.)

---

## 11. MVP Scope & Build Roadmap

### In MVP

- 15-category closed taxonomy
- Two-pass Extractor → Verifier
- Full risk-finding schema with mandatory-field enforcement
- Reg corpus subset (FAR Part 52 referenced sections + DFARS 252 + § 4022 + DoD OT Guide), hash-pinned
- Hybrid BM25 + embedding retrieval
- `AnthropicProvider` (Opus 4.7 + Sonnet 4.6) with prompt caching
- `StubLocalProvider` for conformance
- SQLite findings store with full versioning
- Human review queue + minimal admin UI
- Audit trail (prompt v, model v, reg v, retrieved hashes)
- Eval harness + golden dataset starting at ~100 → 200 clauses
- Provider conformance test suite
- CI gates (hallucination < 1%, determinism replay)
- Cost cap, circuit breaker
- Observability (structured trace per call; dashboards deferred)

### Deferred to later versions of C

| Capability | Revisit when |
|---|---|
| Rule library editing UI for SMEs | rule count > 500 |
| Multi-language contracts | customer-driven |
| Active-learning loop (Verifier outputs auto-train Extractor) | after 6 months pilot data |
| Per-customer rule overrides | customer-specific risk policies become a sales blocker |
| Fine-tuned defense-domain model | eval reveals systematic Claude weakness |

### Deferred to other sub-projects (do NOT blur)

| Capability | Owner |
|---|---|
| PDF parsing, clause segmentation | A |
| Concept extraction + SQLite concept store | B |
| Cross-reference risk | D |
| Interdependence risk (classical subset enumeration; no QAOA) | E |
| Contractor UI / PDF highlighting / dashboard | F |
| Real `LocalProvider` (vLLM) | G |
| Postgres migration, worker scaling, multi-tenant | H |

### Build sequence (within Sub-project C MVP)

| Milestone | Weeks | Exit criteria |
|---|---|---|
| M1 — Skeleton | 1 | `StubLocalProvider` + `AnthropicProvider` pass conformance; schema defined; SQLite findings store + versioning tables live; stub end-to-end produces fake finding with audit trail |
| M2 — Taxonomy + Rules + Reg corpus | 2–3 | 15 categories YAML; ~75 rules YAML; reg corpus loader (FAR/DFARS/§4022/OT Guide subset) hash-pinned; hybrid retrieval returns deterministic top-K |
| M3 — Extractor | 3–4 | Versioned Extractor prompt; tool-use schema enforcement via Anthropic; retry + abstention paths; known-risk/known-safe/known-ambiguous integration tests pass |
| M4 — Verifier | 4–5 | Mechanical phase (substring + reg + hash); semantic phase via Sonnet; routing to C8 or C10; Traces 2/3/4 from §7 all work |
| M5 — Eval harness + first golden | 5–6 (parallel SME labeling) | `eval run` CLI produces metrics; CI integration blocks regressions |
| M6 — Review queue + admin UI | 6–7 | SME clears queue without engineer involvement |
| M7 — Observability + cost caps + circuit breaker + caching tuning | 7–8 | Structured tracing; per-contract cost cap; prompt-caching reduces input cost ≥80% |
| M8 — Golden to 200 + red-team probes + hardening | 8–10 | 200 golden clauses labeled; first probe set integrated; hallucination rate measured per category < 1%; first pilot ships under shadow review |

**Effort:** ~10 weeks focused build, 1 engineer + 1 contracted SME (FAR/DFARS attorney) working in parallel. Add 30-50% for realistic overhead.

---

## 12. Success Criteria for "MVP Done"

All must hold:

1. **Hallucination rate < 1%** per category and overall on the golden dataset (release gate).
2. **Recall ≥ 80%** per category against the golden dataset.
3. **Abstention precision ≥ 70%** (when we abstain, it's actually ambiguous).
4. **End-to-end p95 latency ≤ 30s per clause.**
5. **Determinism replay 100% pass** on a 50-finding sample.
6. **Provider conformance suite passes on `AnthropicProvider` and `StubLocalProvider`.**
7. **Cost ≤ $5–15 per typical 50-clause critical-section analysis** (target; finalize against actual Anthropic pricing during M7).

Any failure → iterate, don't ship.

---

## 13. Open Questions / Assumptions to Validate

| # | Item | Resolution path |
|---|---|---|
| 1 | Exact pricing cap (success criterion #7) — depends on average prompt length post-caching + Anthropic rates | Measure during M7; set firm cap then |
| 2 | Embedding model choice for C3 retrieval | Default to a high-quality general embedding (e.g., voyage-3 or text-embedding-3-large) for MVP; revisit if retrieval recall < 90% on golden |
| 3 | SME hourly rate + labeling throughput | Confirm during SME-contractor selection |
| 4 | Whether shadow-review (Q7 part 3) requires its own UI or can ride on C10's admin UI | Lean toward C10 sufficing; revisit at M6 |
| 5 | Reg corpus refresh cadence (monthly proposed) — too aggressive or too lax? | Defer; SME's call once corpus is live |

---

## 14. Cross-cutting Constraints (binding on all implementation work)

- **Hallucination minimization is binding.** Any change that lowers the release-gate metric blocks merge. No exceptions.
- **Provider abstraction is binding.** No `anthropic.*` import or type outside `providers/`. CI lint enforces.
- **Determinism is binding.** Temperature 0; same inputs → same outputs; determinism replay tests verify.
- **Audit-trail completeness is binding.** Every finding row reproducible from its IDs (prompt, model, reg, retrieved hashes). Missing audit = unshippable.
- **SQLite concept store (Sub-project B) returns concepts/entities, not raw clause text.** When C needs raw text, it comes from A's output, not from B's lookup path.
