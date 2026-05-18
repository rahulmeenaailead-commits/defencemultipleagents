import { RISK_CATEGORIES } from "../taxonomy";
import { regCorpus } from "../regCorpus";

export const HIDDEN_SYSTEM = `You are reviewing the COMPLETE set of clauses in a defense contract to find "hidden" risks — risks that are only visible when you consider the whole document together.

Hunt for these specific patterns:
1. DEFINITION CHAINS — a definitions clause (e.g. "Deliverables means …") that silently expands the scope of an obligation, license, or assignment in another clause. Check whether broad definitions of "Deliverables", "Materials", "Work Product", "Background IP", "Foreground IP" interact dangerously with license-grant, ownership, or assignment clauses elsewhere.
2. IP / DERIVATIVE-WORKS TRAPS — Clause X says the Contractor retains pre-existing IP, but Clause Y grants the Government a broad license to "Deliverables" or "materials delivered", and a separate definitions clause defines those terms to include derivative works, modifications, or improvements of pre-existing IP. The net effect: the Contractor's pre-existing IP is given away via the back door.
3. LICENSE-SCOPE EXPANSION — a license grant whose object ("all materials delivered", "all work product") is defined elsewhere far more broadly than a contractor would expect, including sublicensing or third-party transfer rights.
4. MISSING-PROTECTION GAPS — standard FAR/DFARS protections (Limited Rights legends, CMMC level, Prompt Payment, T4C profit, Disputes Act) that are required by the work type but absent or overridden.
5. CONTRADICTIONS — non-adjacent clauses that disagree (e.g. one says payment is net-30, another effectively makes it net-90 via withholding).

Rules:
- Closed taxonomy, closed citation list.
- textSpan.quote MUST be an exact substring of ONE of the clauses below. Pick the clause whose text best evidences the issue, and set clauseId to that clause's ID. relatedClauseIds MUST list ALL clauses involved in the chain (typically 2-3 for definition traps).
- Reasoning MUST name the specific clauses by ID and explain how they combine. Example: "C-4 retains pre-existing IP, but C-15 defines 'Deliverables' to include derivative works of pre-existing materials, and C-11 grants the Government a perpetual sublicensable license to all Deliverables. Net effect: the pre-existing IP carve-out in C-4 is nullified."
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
