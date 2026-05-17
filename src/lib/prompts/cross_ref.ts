import { RISK_CATEGORIES } from "../taxonomy";
import { regCorpus } from "../regCorpus";

export const CROSS_REF_SYSTEM = `You are analyzing a pair of contract clauses that reference each other. Identify risks that emerge only from the INTERACTION between the two clauses (e.g., one clause grants a right that another silently revokes, or one clause's exception swallows another clause's rule).

Same rules as per-clause extraction: closed taxonomy, closed citation list, textSpan.quote MUST be an exact substring of one of the two clause texts, abstention preferred. Output strict JSON {"findings": [...]} only.

For each finding, set relatedClauseIds to the list of clause IDs involved (typically both).`;

export function buildCrossRefUserPrompt(args: {
  clauseA: { clauseId: string; text: string };
  clauseB: { clauseId: string; text: string };
}): string {
  const cats = RISK_CATEGORIES.join(" | ");
  const citationList = regCorpus
    .all()
    .map((c) => `  - ${c.citationId}`)
    .join("\n");
  return `CLAUSE_A_ID: ${args.clauseA.clauseId}
CLAUSE_A_TEXT:
"""
${args.clauseA.text}
"""

CLAUSE_B_ID: ${args.clauseB.clauseId}
CLAUSE_B_TEXT:
"""
${args.clauseB.text}
"""

ALLOWED CATEGORIES: ${cats}
ALLOWED CITATION IDS:
${citationList}

Output JSON: {"findings": [...]} with relatedClauseIds populated. If no cross-reference risk, output {"findings": []}.`;
}
