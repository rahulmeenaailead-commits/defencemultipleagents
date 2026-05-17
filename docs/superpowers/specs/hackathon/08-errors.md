# Error handling

| Failure | Behavior |
|---|---|
| PDF parse fail (image-only, corrupted) | 400 + toast: "Use a text-based PDF or the sample" |
| DeepSeek 5xx / rate limit | 1 retry (200ms, 800ms). Then mark that clause `analysisError`; rest of contract still renders. |
| Invalid LLM JSON | Zod fails → `SCHEMA_INVALID` in `rejectedFindings` (counts toward visible-rejections story) |
| Concurrent uploads | Each job gets its own `jobId` + `conceptCache` entry. No shared state. |
| Vercel timeout (60s Hobby / 300s Pro) | Return partial + `timedOut: true`, never 500 |

No persistence → no resume. Refresh = re-upload.
