import type { AnalysisResult } from "../schema";

/**
 * In-memory job result store. Lives for the lifetime of the server process.
 * Hackathon scope: no persistence, no eviction.
 *
 * Stored on globalThis so the route handler and the page server component
 * share one Map even when Next.js loads this module from separate bundle
 * graphs in dev mode.
 */
const KEY = Symbol.for("dcr.jobsStore.v1");
type Holder = { map: Map<string, AnalysisResult> };
const g = globalThis as unknown as Record<symbol, Holder | undefined>;
if (!g[KEY]) g[KEY] = { map: new Map() };
const jobs = g[KEY]!.map;

export const jobsStore = {
  put(result: AnalysisResult) {
    jobs.set(result.jobId, result);
  },
  get(jobId: string): AnalysisResult | undefined {
    return jobs.get(jobId);
  },
  has(jobId: string): boolean {
    return jobs.has(jobId);
  },
};
