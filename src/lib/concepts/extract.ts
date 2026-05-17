import type { Clause } from "../schema";

/**
 * Lightweight regex-driven concept tagger. Cheap, deterministic, runs locally
 * without an LLM call. The result feeds the per-clause prompt as a hint so the
 * model doesn't have to rediscover obvious concepts.
 */
const CONCEPT_PATTERNS: Array<[string, RegExp]> = [
  ["technical-data", /\btechnical data\b|\bcomputer software\b/i],
  ["unlimited-rights", /\bunlimited rights\b/i],
  ["limited-rights", /\blimited rights\b|\brestricted rights\b|\bgovernment purpose rights\b/i],
  ["ITAR", /\bITAR\b|\bInternational Traffic in Arms\b|\b22 CFR\b/i],
  ["EAR", /\bEAR\b|\bExport Administration Regulations\b/i],
  ["CDI", /\bCovered Defense Information\b|\bCDI\b/i],
  ["NIST-800-171", /\bNIST SP 800-171\b|\b800-171\b/i],
  ["CMMC", /\bCMMC\b/i],
  ["T4C", /termination for convenience|FAR 52\.249-2/i],
  ["T4D", /termination for default|FAR 52\.249-8/i],
  ["prompt-pay", /\bPrompt Payment\b|\bnet\s*\d+\s*days\b/i],
  ["withholding", /\bwithhold(?:ing)?\b/i],
  ["liability", /\bliability\b|\bdamages\b/i],
  ["indemnification", /\bindemnif/i],
  ["arbitration", /\barbitration\b/i],
  ["disputes", /\bdisputes?\b|\bCDA\b|\bContract Disputes Act\b/i],
  ["change-order", /\bchange orders?\b|\bequitable adjustment\b/i],
  ["liquidated-damages", /\bliquidated damages\b/i],
  ["subcontract", /\bsubcontract/i],
  ["flow-down", /\bflow[- ]?down\b/i],
];

export function extractConcepts(clause: Clause): string[] {
  const found: string[] = [];
  for (const [name, re] of CONCEPT_PATTERNS) {
    if (re.test(clause.text)) found.push(name);
  }
  return found;
}
