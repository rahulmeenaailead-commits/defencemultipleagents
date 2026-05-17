# 48h timeline + cut-list

| Block | h | Deliverable |
|---|---|---|
| 0 Setup | 0–2 | `pnpm create next-app`, Tailwind, shadcn, Vercel `/healthz`, env vars (`DEEPSEEK_API_KEY`) |
| 1 Backend skeleton | 2–8 | provider, schema, taxonomy, regCorpus, PDF parse, segment, in-memory cache, unit tests |
| 2 Pass 1 | 8–14 | extractor prompt + parallel runner + mechanical verifier + e2e integration test |
| 3 UI screens 1–2 | 14–20 | Landing + staged progress, dark theme polish |
| 4 UI screen 3 | 20–30 | 3-col results + **proof panel** + rejected drawer (**the headline**) |
| 5 Passes 2 + 3 | 30–36 | cross-ref regex + LLM, hidden batched call, UI tabs |
| 6 Polish | 36–44 | animations, empty/error states, sample PDF preloaded, README, copy |
| 7 Buffer | 44–48 | bugs, final deploy, **record backup demo video** |

**Cut order if behind:** drop Pass 3 (hidden) at h32 → drop Pass 2 (cross-ref) at h36. Single-clause demo with proof panel is already a winning demo.

**Never cut:** proof panel, verifier badges, rejected drawer.
