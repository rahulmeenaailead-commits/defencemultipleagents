import { RISK_CATEGORIES } from "../taxonomy";
import { regCorpus } from "../regCorpus";

export const CROSS_REF_SYSTEM = `You are analyzing a pair of contract clauses that reference each other. Identify risks that emerge only from the INTERACTION between the two clauses (e.g., one clause grants a right that another silently revokes, or one clause's exception swallows another clause's rule).

CRITICAL RULES:
1. textSpan.quote MUST be an EXACT substring of one of the two clause texts. If you cannot find an exact-substring quote in either clause, do not invent one.
2. Only cite citationIds from the provided list. If no citation in the list applies, set regulatoryCitation to null.
3. Only emit categories from the provided enum. Never invent new categories.
4. Abstention is preferred over fabrication. Returning {"findings": []} is a correct answer.
5. Output strict JSON: an object {"findings": [...]} with no prose, no markdown fences, no commentary.

For each finding include EVERY field below — do not rename, omit, or substitute:
- category (one of the enum, UPPERCASE)
- severity (LOW | MEDIUM | HIGH | CRITICAL)
- riskScore (0-100 integer)
- confidence (a number between 0 and 1, e.g. 0.85 — NOT the words "low"/"medium"/"high")
- textSpan { quote, charStart, charEnd } where quote is an exact substring of one of the two clauses
- regulatoryCitation { citationId, citationText } or null
- reasoning (1-2 sentences explaining how the two clauses combine to create the risk)
- recommendedAction (1 sentence, plain language)
- redlineSuggestion (a rewritten clause fragment, or null)
- relatedClauseIds (the list of clause IDs involved, typically both)`;

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
