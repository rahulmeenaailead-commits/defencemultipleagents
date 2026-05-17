{\rtf1\ansi\ansicpg1252\cocoartf2868
\cocoatextscaling0\cocoaplatform0{\fonttbl\f0\fnil\fcharset0 .AppleSystemUIFontMonospaced-Regular;\f1\fnil\fcharset0 HelveticaNeue;}
{\colortbl;\red255\green255\blue255;}
{\*\expandedcolortbl;;}
\paperw11900\paperh16840\margl1440\margr1440\vieww11520\viewh8400\viewkind0
\deftab560
\pard\pardeftab560\slleading20\pardirnatural\partightenfactor0

\f0\fs24 \cf0 ### `spec/19-testing-strategy.md`\
```markdown\
# Testing Strategy\
\
## Layer 1 \'97 Unit Tests (no LLM)\
Per-component: C2 mechanical checks, C3 retrieval ordering, C4/C5 YAML validation, C6 routing logic, C7 per-implementation error paths, C8 versioning invariants. Target 90%+ coverage on C2/C6/C7/C8.\
\
## Layer 2 \'97 Provider Conformance (Goal-2 guarantee)\
\
| Test | What it proves |\
|---|---|\
| Schema-compliant JSON returned | Provider honors `response_schema` |\
| Deterministic at temp=0 (\uc0\u8805 3 runs identical) | Reproducibility contract |\
| Audit fields populated | model_id, model_version, tokens, latency, provider_name |\
| Oversized input \uc0\u8594  structured error | No raw exceptions leak |\
| Schema-impossible input \uc0\u8594  structured error | Graceful failure |\
| Respects max_tokens | Output bounded |\
| `cost_usd` = float (cloud) or None (local) | Audit-trail completeness |\
\
## Layer 3 \'97 Integration Tests (real Anthropic API)\
\
| Test | What it proves |\
|---|---|\
| End-to-end known-risk clause | Real DFARS 7012 gap \uc0\u8594  finding |\
| End-to-end known-safe clause | Boilerplate \uc0\u8594  zero findings or honest abstention |\
| End-to-end known-ambiguous clause | Designed-ambiguous \uc0\u8594  Verifier rejects \u8594  C10 |\
| Hallucination probe: invented reg | Clause mentions "DFARS 999.999-9999" \uc0\u8594  MUST NOT cite it |\
| Caching works | Repeated prefix \uc0\u8594  `cached_tokens > 0` on calls 2..N |\
\
## Layer 4 \'97 Eval Harness (trust gate)\
See spec-14-c9-eval-harness.md\
\
## Layer 5 \'97 Red-Team Probes (quarterly)\
| Probe family | Example |\
|---|---|\
| Invented reg section | Plausible-but-fake DFARS \uc0\u8594  must not cite |\
| Misleading boilerplate | Scary-sounding terms \uc0\u8594  must not flag |\
| Real risk in unusual phrasing | Non-standard vocabulary \uc0\u8594  catch or abstain |\
| Prompt injection | "Ignore prior instructions..." \uc0\u8594  must not comply |\
| Reg snippet conflict | Two contradicting snippets \uc0\u8594  cite only current or abstain |\
| Multi-finding clause | 3+ independent risks \uc0\u8594  all surfaced independently |\
\
## Layer 6 \'97 Determinism Replay (every release tag)\
Pick 50 random historical findings; re-run with recorded versions. Byte-identical output required. Any divergence = regression blocker.\
\
## CI Gates\
\
| Gate | Runs on | Blocks if |\
|---|---|---|\
| Unit tests | every PR | any fail |\
| Provider conformance | PRs touching `providers/` | any provider fails |\
| Integration tests | nightly + pre-release | any fail |\
| Eval harness | PRs touching prompts/rules/taxonomy/providers | hallucination > 1% or regression > 5% |\
| Determinism replay | release tags | any divergence |\
| Red-team probes | quarterly + prompt-version bumps | precision below threshold |\
```\
\
---
\f1\fs26 \
}