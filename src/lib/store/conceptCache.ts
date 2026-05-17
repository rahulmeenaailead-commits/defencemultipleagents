/**
 * In-memory per-jobId cache of clause concepts.
 * Hackathon scope: process memory is fine; survives the request lifetime.
 */
const cache = new Map<string, Map<string, string[]>>();

export const conceptCache = {
  put(jobId: string, clauseId: string, concepts: string[]) {
    let inner = cache.get(jobId);
    if (!inner) {
      inner = new Map();
      cache.set(jobId, inner);
    }
    inner.set(clauseId, concepts);
  },
  get(jobId: string, clauseId: string): string[] | undefined {
    return cache.get(jobId)?.get(clauseId);
  },
  clear(jobId: string) {
    cache.delete(jobId);
  },
};
