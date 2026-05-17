# Architecture

Single Next.js 15 App Router TS app on Vercel. No separate backend.

```
src/
├── app/api/analyze/route.ts          # POST PDF → full result (~10s)
├── app/page.tsx, analysis/[jobId]/page.tsx
├── lib/
│   ├── providers/{base,deepseek}.ts  # ModelProvider abstraction (binding)
│   ├── pdf/parse.ts                  # pdf-parse
│   ├── clauses/segment.ts
│   ├── concepts/extract.ts
│   ├── pipeline/{extractor,verifier,cross_ref,hidden}.ts
│   ├── store/conceptCache.ts         # in-memory per-jobId Map
│   ├── taxonomy.ts                   # 15-cat enum
│   ├── regCorpus.ts                  # ~50 FAR/DFARS citations
│   ├── schema.ts                     # Zod (see 04)
│   └── prompts/
└── components/{UploadDropzone,ProgressStages,ClauseList,ClauseDetail,ProofPanel,RejectedDrawer}.tsx
```

**Stack:** Next.js 15 · TS strict · Tailwind v4 · shadcn/ui · framer-motion · Zod · `openai` SDK→`api.deepseek.com` · `pdf-parse` · `p-limit` · vitest.
