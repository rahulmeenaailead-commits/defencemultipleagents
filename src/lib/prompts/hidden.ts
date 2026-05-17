import { RISK_CATEGORIES } from "../taxonomy";
import { regCorpus } from "../regCorpus";

export const HIDDEN_SYSTEM = `You are reviewing the COMPLETE set of clauses in a defense contract to find "hidden" risks — risks that are only visible when you consider the whole document together, such as missing protections, contradictions between non-adjacent clauses, or omissions of standard FAR/DFARS clauses.

Rules:
- Closed taxonomy, closed citation list.
- textSpan.quote MUST be an exact substring of ONE of the clauses below. Pick the clause whose text best evidences the issue, and set clauseId to that clause's ID.
- Abstention preferred over fabrication.
- Output strict JSON {"findings": [...]} with no prose.`;

export function buildHiddenUserPrompt(args: {
  clauses: Array<{ clauseId: string; heading: string | null; text: string }>;
}): string {
  const cats = RISK_CATEGORIES.join(" | ");
  const citationList = regCorpus
    .all()
    .map((c) => `  - ${c.citationId}`)
    .join("\n");
  const body = args.clauses
    .map(
      (c) => `--- CLAUSE_ID: ${c.clauseId} ${c.heading ? `(${c.heading})` : ""}
${c.text}`,
    )
    .join("\n\n");
  return `${body}

ALLOWED CATEGORIES: ${cats}
ALLOWED CITATION IDS:
${citationList}

For each finding include: clauseId (the clause that best evidences the issue), category, severity, riskScore, confidence, textSpan {quote, charStart, charEnd} where quote is an exact substring of THAT clause, regulatoryCitation, reasoning, recommendedAction, redlineSuggestion, relatedClauseIds (clauses involved in the hidden risk).

Output JSON: {"findings": [...]} . If no hidden risks, output {"findings": []}.`;
}
