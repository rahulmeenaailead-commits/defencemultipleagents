import { RISK_CATEGORIES } from "../taxonomy";
import { regCorpus } from "../regCorpus";

export const EXTRACTOR_SYSTEM = `You are a defense-contracting compliance analyst. You read a single contract clause and identify risks that fall under a CLOSED taxonomy of categories and a CLOSED list of regulatory citations.

CRITICAL RULES:
1. Only emit findings whose textSpan.quote is an EXACT substring of the clause text. If you cannot find an exact-substring quote, do not invent one.
2. Only cite citationIds from the provided list. If no citation in the list applies, set regulatoryCitation to null.
3. Only emit categories from the provided enum. Never invent new categories.
4. Abstention is preferred over fabrication. Returning [] is a correct answer.
5. Output strict JSON: an object {"findings": [...]} with no prose, no markdown fences, no commentary.

For each finding include: category (one of the enum), severity (LOW|MEDIUM|HIGH|CRITICAL), riskScore (0-100 integer), confidence (0-1 float), textSpan {quote, charStart, charEnd} where quote is an exact substring of the clause, regulatoryCitation {citationId, citationText} or null, reasoning (1-2 sentences why this is a risk), recommendedAction (1 sentence, plain language), redlineSuggestion (a rewritten clause fragment, or null).`;

export function buildExtractorUserPrompt(args: {
  clauseId: string;
  clauseHeading: string | null;
  clauseText: string;
  concepts: string[];
}): string {
  const cats = RISK_CATEGORIES.join(" | ");
  const citationList = regCorpus
    .all()
    .map((c) => `  - ${c.citationId} (${c.shortLabel})`)
    .join("\n");
  return `CLAUSE_ID: ${args.clauseId}
HEADING: ${args.clauseHeading ?? "(none)"}
CONCEPTS_DETECTED: ${args.concepts.length ? args.concepts.join(", ") : "(none)"}

ALLOWED CATEGORIES (closed):
${cats}

ALLOWED REGULATORY CITATIONS (closed list — only cite from these, or use null):
${citationList}

CLAUSE TEXT:
"""
${args.clauseText}
"""

Output JSON: {"findings": [...]} . If no risks, output {"findings": []}.`;
}
