import type { Clause } from "../schema";

/** Chunks larger than this are split at paragraph boundaries so the per-clause
 * extractor (60k cap) can still process body text from PDFs with sparse
 * headings. */
const MAX_CLAUSE_CHARS = 55_000;

/**
 * Segments contract text into clauses. Recognizes (any of):
 *   "1. HEADING\n..."             — numbered top-level (UPPERCASE)
 *   "1. Heading Title\n..."       — numbered top-level (Title Case)
 *   "1.2 Heading\n..."            — sub-clauses
 *   "§ 1.2 ..."                   — section-marker
 *   "Section 4.1 Heading"         — explicit "Section N"
 *   "Article IV Heading"          — explicit "Article N"
 *   "Item 1A. Risk Factors"       — SEC-style "Item N"
 *
 * Falls back to whole-document as a single clause if no numbering matches.
 */
const PATTERNS: RegExp[] = [
  // 1. HEADING  or  1.2 Heading
  /^[ \t]*(?:§\s*)?(\d+(?:\.\d+){0,3})\.?[ \t]+([A-Z][A-Za-z0-9 ,/&\-]{2,90})[ \t]*$/gm,
  // Section 4 — Heading  /  Section 4.1 Heading
  /^[ \t]*(Section[ \t]+\d+(?:\.\d+){0,2})[ \t]*[—:.\-][ \t]*([A-Za-z][A-Za-z0-9 ,/&\-]{2,90})[ \t]*$/gm,
  // Article IV. Heading
  /^[ \t]*(Article[ \t]+[IVXLC]+|\bArticle[ \t]+\d+)\.?[ \t]+([A-Za-z][A-Za-z0-9 ,/&\-]{2,90})[ \t]*$/gm,
  // Item 1A. Heading  (SEC 10-K style)
  /^[ \t]*(Item[ \t]+\d+[A-Z]?)\.?[ \t]+([A-Za-z][A-Za-z0-9 ,/&\-]{2,90})[ \t]*$/gm,
];

export function segmentClauses(documentText: string): Clause[] {
  const clauses: Clause[] = [];
  const heads: { number: string; heading: string; index: number; lineEnd: number }[] = [];

  for (const pat of PATTERNS) {
    const re = new RegExp(pat);
    let m: RegExpExecArray | null;
    while ((m = re.exec(documentText)) !== null) {
      heads.push({
        number: m[1].trim(),
        heading: m[2].trim(),
        index: m.index,
        lineEnd: m.index + m[0].length,
      });
    }
  }
  // Dedupe overlapping matches and order by position
  heads.sort((a, b) => a.index - b.index);
  for (let i = heads.length - 1; i > 0; i--) {
    if (heads[i].index === heads[i - 1].index) heads.splice(i, 1);
  }

  if (heads.length === 0) {
    const text = documentText.trim();
    if (text.length === 0) return [];
    return [
      {
        clauseId: "C-1",
        index: 0,
        heading: null,
        text,
        charStart: 0,
        charEnd: text.length,
      },
    ];
  }

  const idCounts = new Map<string, number>();
  for (let i = 0; i < heads.length; i++) {
    const start = heads[i].index;
    const end = i + 1 < heads.length ? heads[i + 1].index : documentText.length;
    const slice = documentText.slice(start, end).trim();
    if (!slice) continue;
    const numKey = heads[i].number.replace(/\s+/g, "_");
    const baseId = `C-${numKey}`;
    const seen = idCounts.get(baseId) ?? 0;
    idCounts.set(baseId, seen + 1);
    const clauseId = seen === 0 ? baseId : `${baseId}#${seen + 1}`;
    clauses.push({
      clauseId,
      index: i,
      heading: heads[i].heading,
      text: slice,
      charStart: start,
      charEnd: start + slice.length,
    });
  }

  return clauses.flatMap(splitOversizedClause);
}

function splitOversizedClause(c: Clause): Clause[] {
  if (c.text.length <= MAX_CLAUSE_CHARS) return [c];
  const out: Clause[] = [];
  let cursor = 0;
  let part = 1;
  const MAX_PARTS = 20;
  while (cursor < c.text.length && part <= MAX_PARTS) {
    let end = Math.min(cursor + MAX_CLAUSE_CHARS, c.text.length);
    if (end < c.text.length) {
      const minBoundary = cursor + Math.floor(MAX_CLAUSE_CHARS / 2);
      const para = c.text.lastIndexOf("\n\n", end);
      if (para > minBoundary) end = para;
      else {
        const line = c.text.lastIndexOf("\n", end);
        if (line > minBoundary) end = line;
      }
    }
    const slice = c.text.slice(cursor, end).trim();
    if (slice.length === 0) {
      cursor = end;
      continue;
    }
    const clauseId = part === 1 ? c.clauseId : `${c.clauseId}/${part}`;
    const heading =
      part === 1
        ? c.heading
        : c.heading
          ? `${c.heading} (cont. ${part})`
          : `(cont. ${part})`;
    out.push({
      clauseId,
      index: c.index,
      heading,
      text: slice,
      charStart: c.charStart + cursor,
      charEnd: c.charStart + end,
    });
    cursor = end;
    part++;
  }
  return out;
}

/**
 * Detect intra-document clause references like "see clause 4", "Clause 8",
 * "§ 4", "§4.2". Returns pairs of (sourceClauseId, targetClauseId) — deduped.
 */
export function findCrossReferences(clauses: Clause[]): Array<[string, string]> {
  const idsByNumber = new Map<string, string>(); // "4" -> "C-4", "4.2" -> "C-4.2"
  for (const c of clauses) {
    const num = c.clauseId.replace(/^C-/, "");
    idsByNumber.set(num, c.clauseId);
  }
  const re = /(?:clause\s+|§\s*|see\s+clause\s+)(\d+(?:\.\d+){0,2})/gi;
  const pairs = new Set<string>();
  for (const c of clauses) {
    const myNum = c.clauseId.replace(/^C-/, "");
    let m: RegExpExecArray | null;
    const r = new RegExp(re);
    while ((m = r.exec(c.text)) !== null) {
      const targetNum = m[1];
      if (targetNum === myNum) continue;
      const targetId = idsByNumber.get(targetNum);
      if (!targetId) continue;
      // canonicalize ordering so (A,B) == (B,A)
      const key =
        c.clauseId < targetId ? `${c.clauseId}||${targetId}` : `${targetId}||${c.clauseId}`;
      pairs.add(key);
    }
  }
  return [...pairs].map((k) => k.split("||") as [string, string]);
}
