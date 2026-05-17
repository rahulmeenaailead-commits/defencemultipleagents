import type { ModelProvider, CompletionRequest, CompletionResponse } from "./base";

/**
 * Deterministic stub. Reads the user prompt, finds the clause text inside the
 * triple-quote block, and emits a small set of plausible findings whose
 * textSpan.quote is guaranteed to be an exact substring (so the mechanical
 * verifier passes).
 *
 * This lets the entire UI work end-to-end without a real LLM key.
 */
export class StubProvider implements ModelProvider {
  readonly id = "stub";
  readonly modelId = "stub-deterministic-v1";

  async complete(req: CompletionRequest): Promise<CompletionResponse> {
    const userMsg = req.messages.find((m) => m.role === "user")?.content ?? "";

    // Hidden pass: prompt contains multiple "--- CLAUSE_ID:" markers
    if (userMsg.includes("--- CLAUSE_ID:")) {
      return { text: this.stubHiddenFindings(userMsg), modelId: this.modelId };
    }
    // Cross-ref pass
    if (userMsg.includes("CLAUSE_A_ID:") && userMsg.includes("CLAUSE_B_ID:")) {
      return { text: this.stubCrossRefFindings(userMsg), modelId: this.modelId };
    }
    // Per-clause pass
    return { text: this.stubPerClauseFindings(userMsg), modelId: this.modelId };
  }

  private extractBetweenTripleQuotes(s: string): string | null {
    const m = s.match(/"""\s*([\s\S]*?)\s*"""/);
    return m ? m[1] : null;
  }

  private extractClauseId(s: string): string {
    const m = s.match(/CLAUSE_ID:\s*([^\s\n]+)/);
    return m ? m[1] : "C-?";
  }

  private firstSubstring(haystack: string, candidates: string[]): string | null {
    for (const c of candidates) {
      if (haystack.includes(c)) return c;
    }
    return null;
  }

  private stubPerClauseFindings(userMsg: string): string {
    const clauseId = this.extractClauseId(userMsg);
    const text = this.extractBetweenTripleQuotes(userMsg) ?? "";
    const findings: unknown[] = [];

    const probes: Array<{
      patterns: string[];
      build: (quote: string) => unknown;
    }> = [
      {
        patterns: ["unlimited rights in all technical data", "Government shall acquire unlimited rights"],
        build: (quote) => ({
          category: "DATA_RIGHTS",
          severity: "HIGH",
          riskScore: 82,
          confidence: 0.9,
          textSpan: { quote, charStart: text.indexOf(quote), charEnd: text.indexOf(quote) + quote.length },
          regulatoryCitation: {
            citationId: "DFARS 252.227-7013",
            citationText: "DFARS 252.227-7013 — Rights in Technical Data — Noncommercial Items.",
          },
          reasoning:
            "Granting the Government 'unlimited rights' in ALL technical data and software, including data developed at private expense, conflicts with the standard DFARS 252.227-7013 framework that preserves limited rights for privately funded data.",
          recommendedAction:
            "Negotiate to preserve 'limited rights' or 'government purpose rights' for technical data developed at private expense, per DFARS 252.227-7013.",
          redlineSuggestion:
            "The Government shall acquire unlimited rights in technical data and computer software first produced exclusively with Government funds in the performance of this contract. Technical data developed at private expense shall be marked with limited rights legends in accordance with DFARS 252.227-7013.",
        }),
      },
      {
        patterns: ["may transfer technical data to foreign subcontractors", "without prior approval from the Directorate of Defense Trade Controls"],
        build: (quote) => ({
          category: "EXPORT_CONTROL",
          severity: "CRITICAL",
          riskScore: 96,
          confidence: 0.95,
          textSpan: { quote, charStart: text.indexOf(quote), charEnd: text.indexOf(quote) + quote.length },
          regulatoryCitation: {
            citationId: "ITAR 22 CFR 123",
            citationText: "ITAR 22 CFR Part 123 — Licenses for the Export of Defense Articles.",
          },
          reasoning:
            "Transferring ITAR-controlled technical data to foreign persons or subcontractors without a license from DDTC is a criminal violation of the Arms Export Control Act. 'Notify within 30 days' does not substitute for a prior license.",
          recommendedAction:
            "Remove this carve-out. Require an approved DSP-5 license or applicable ITAR exemption BEFORE any export of technical data to foreign subcontractors.",
          redlineSuggestion:
            "The Contractor shall not transfer ITAR-controlled technical data to any foreign person or foreign subcontractor without prior written authorization from the Directorate of Defense Trade Controls in accordance with 22 CFR Part 123.",
        }),
      },
      {
        patterns: ["not required to flow down these requirements", "if such flow-down would be commercially impracticable"],
        build: (quote) => ({
          category: "CYBERSECURITY",
          severity: "HIGH",
          riskScore: 85,
          confidence: 0.92,
          textSpan: { quote, charStart: text.indexOf(quote), charEnd: text.indexOf(quote) + quote.length },
          regulatoryCitation: {
            citationId: "DFARS 252.204-7012",
            citationText: "DFARS 252.204-7012 — Safeguarding Covered Defense Information and Cyber Incident Reporting.",
          },
          reasoning:
            "DFARS 252.204-7012 requires flow-down to subcontractors handling Covered Defense Information. 'Commercial impracticability' is not a recognized exception; this exposes CDI in the supply chain.",
          recommendedAction:
            "Strike the carve-out. Require flow-down of DFARS 252.204-7012 and NIST SP 800-171 obligations to all subcontractors processing CDI.",
          redlineSuggestion:
            "Subcontractors handling Covered Defense Information shall be subject to the full flow-down of the requirements of DFARS 252.204-7012, including implementation of NIST SP 800-171.",
        }),
      },
      {
        patterns: ["excluding any anticipated profit, settlement expenses, or unabsorbed overhead"],
        build: (quote) => ({
          category: "TERMINATION",
          severity: "HIGH",
          riskScore: 78,
          confidence: 0.88,
          textSpan: { quote, charStart: text.indexOf(quote), charEnd: text.indexOf(quote) + quote.length },
          regulatoryCitation: {
            citationId: "FAR 52.249-2",
            citationText: "FAR 52.249-2 — Termination for Convenience of the Government (Fixed-Price).",
          },
          reasoning:
            "FAR 52.249-2 entitles the Contractor to settlement expenses and a reasonable profit on completed work upon T4C. Carving these out is a material deviation from the FAR-prescribed recovery framework.",
          recommendedAction:
            "Restore the standard FAR 52.249-2 termination-for-convenience settlement framework, including profit on work performed and settlement expenses.",
          redlineSuggestion:
            "In the event of termination for convenience, the Contractor's recovery shall be determined in accordance with FAR 52.249-2, including a reasonable profit on work performed and reasonable settlement expenses.",
        }),
      },
      {
        patterns: ["net ninety (90) days", "withhold up to twenty-five percent (25%)"],
        build: (quote) => ({
          category: "PAYMENT_TERMS",
          severity: "MEDIUM",
          riskScore: 62,
          confidence: 0.85,
          textSpan: { quote, charStart: text.indexOf(quote), charEnd: text.indexOf(quote) + quote.length },
          regulatoryCitation: {
            citationId: "FAR 52.232-25",
            citationText: "FAR 52.232-25 — Prompt Payment.",
          },
          reasoning:
            "Net-90 payment with a 25% withholding and no interest on amounts withheld conflicts with the Prompt Payment Act's 30-day standard and the interest-on-late-payments requirement.",
          recommendedAction:
            "Reduce net terms to 30 days consistent with the Prompt Payment Act, cap withholdings at 10%, and require interest on amounts withheld beyond acceptance.",
          redlineSuggestion:
            "Payment shall be made within thirty (30) days of Government acceptance in accordance with FAR 52.232-25. The Government may withhold up to ten percent (10%) pending final acceptance, with interest accruing as required by the Prompt Payment Act.",
        }),
      },
      {
        patterns: ["aggregate liability under this contract shall be unlimited"],
        build: (quote) => ({
          category: "LIABILITY_CAP",
          severity: "CRITICAL",
          riskScore: 94,
          confidence: 0.93,
          textSpan: { quote, charStart: text.indexOf(quote), charEnd: text.indexOf(quote) + quote.length },
          regulatoryCitation: null,
          reasoning:
            "Unlimited liability — including consequential, incidental, and punitive damages — is commercially unreasonable and uninsurable in most cases for defense-services work.",
          recommendedAction:
            "Cap aggregate liability at the contract value (or a negotiated multiple thereof) and exclude consequential, incidental, and punitive damages.",
          redlineSuggestion:
            "The Contractor's aggregate liability under this contract shall not exceed the total contract value. In no event shall the Contractor be liable for consequential, incidental, or punitive damages.",
        }),
      },
      {
        patterns: ["regardless of whether such claims arise from the sole negligence or willful misconduct of the Government"],
        build: (quote) => ({
          category: "INDEMNIFICATION",
          severity: "CRITICAL",
          riskScore: 92,
          confidence: 0.94,
          textSpan: { quote, charStart: text.indexOf(quote), charEnd: text.indexOf(quote) + quote.length },
          regulatoryCitation: null,
          reasoning:
            "Indemnifying the Government for its own sole negligence or willful misconduct is unenforceable in many jurisdictions and a one-sided allocation of risk inconsistent with FAR principles.",
          recommendedAction:
            "Carve out Government sole negligence and willful misconduct from the indemnification obligation.",
          redlineSuggestion:
            "The Contractor's indemnification obligations shall not extend to claims arising from the sole negligence or willful misconduct of the Government, its officers, agents, or employees.",
        }),
      },
      {
        patterns: ["within fifteen (15) days of receipt of the change order or are deemed waived"],
        build: (quote) => ({
          category: "CHANGE_ORDERS",
          severity: "MEDIUM",
          riskScore: 55,
          confidence: 0.8,
          textSpan: { quote, charStart: text.indexOf(quote), charEnd: text.indexOf(quote) + quote.length },
          regulatoryCitation: {
            citationId: "FAR 52.243-1",
            citationText: "FAR 52.243-1 — Changes — Fixed-Price.",
          },
          reasoning:
            "A 15-day waiver window for equitable adjustment is materially shorter than the 30-day FAR norm and risks waiving legitimate cost claims arising from constructive changes.",
          recommendedAction:
            "Extend the equitable adjustment notice window to the FAR-standard 30 days.",
          redlineSuggestion:
            "Equitable adjustment requests by the Contractor shall be submitted within thirty (30) days of receipt of the change order in accordance with FAR 52.243-1.",
        }),
      },
      {
        patterns: ["binding arbitration administered by a private arbitration body", "Contract Disputes Act and FAR 52.233-1 shall not apply"],
        build: (quote) => ({
          category: "DISPUTE_RESOLUTION",
          severity: "HIGH",
          riskScore: 80,
          confidence: 0.9,
          textSpan: { quote, charStart: text.indexOf(quote), charEnd: text.indexOf(quote) + quote.length },
          regulatoryCitation: {
            citationId: "FAR 52.233-1",
            citationText: "FAR 52.233-1 — Disputes.",
          },
          reasoning:
            "Disputes arising under a federal procurement contract must follow the Contract Disputes Act (41 U.S.C. ch. 71). Mandatory private arbitration is generally unenforceable against the Government.",
          recommendedAction:
            "Replace the arbitration clause with the standard FAR 52.233-1 Disputes clause governed by the Contract Disputes Act.",
          redlineSuggestion:
            "All disputes arising under or relating to this contract shall be resolved in accordance with FAR 52.233-1 and the Contract Disputes Act of 1978, as amended.",
        }),
      },
      {
        patterns: ["liquidated damages of one percent (1%) of the contract value per calendar day, uncapped"],
        build: (quote) => ({
          category: "DELIVERY_SCHEDULE",
          severity: "HIGH",
          riskScore: 79,
          confidence: 0.87,
          textSpan: { quote, charStart: text.indexOf(quote), charEnd: text.indexOf(quote) + quote.length },
          regulatoryCitation: null,
          reasoning:
            "Uncapped liquidated damages at 1% of contract value per day will quickly exceed any reasonable estimate of actual damages and may be unenforceable as a penalty.",
          recommendedAction:
            "Cap aggregate liquidated damages (typically 10% of the contract value) and tie the daily rate to a reasonable forecast of actual damages.",
          redlineSuggestion:
            "Liquidated damages shall not exceed an aggregate of ten percent (10%) of the contract value, calculated at a daily rate reasonably approximating actual damages.",
        }),
      },
      {
        patterns: ["may enter into subcontracts of any value without prior written consent of the Contracting Officer"],
        build: (quote) => ({
          category: "SUBCONTRACTING",
          severity: "MEDIUM",
          riskScore: 58,
          confidence: 0.83,
          textSpan: { quote, charStart: text.indexOf(quote), charEnd: text.indexOf(quote) + quote.length },
          regulatoryCitation: {
            citationId: "FAR 52.244-2",
            citationText: "FAR 52.244-2 — Subcontracts.",
          },
          reasoning:
            "FAR 52.244-2 requires prior written consent for subcontracts exceeding specified thresholds, regardless of an approved purchasing system, when the contract or program requires it.",
          recommendedAction:
            "Require prior written consent for subcontracts above the FAR 52.244-2 threshold and for any subcontract involving Covered Defense Information.",
          redlineSuggestion:
            "The Contractor shall obtain prior written consent of the Contracting Officer for any subcontract exceeding the threshold prescribed by FAR 52.244-2 or involving Covered Defense Information.",
        }),
      },
      {
        patterns: ["The Contractor waives any assertion of limited rights or restricted rights markings"],
        build: (quote) => ({
          category: "IP_RIGHTS",
          severity: "HIGH",
          riskScore: 81,
          confidence: 0.89,
          textSpan: { quote, charStart: text.indexOf(quote), charEnd: text.indexOf(quote) + quote.length },
          regulatoryCitation: {
            citationId: "DFARS 252.227-7013",
            citationText: "DFARS 252.227-7013 — Rights in Technical Data — Noncommercial Items.",
          },
          reasoning:
            "Waiver of the right to mark privately developed data with limited rights legends forfeits a key statutory protection under DFARS 252.227-7013 and is highly unfavorable to the Contractor.",
          recommendedAction:
            "Preserve the Contractor's right to mark privately developed technical data and software with the appropriate restrictive legends under DFARS 252.227-7013/-7014.",
          redlineSuggestion:
            "The Contractor reserves the right to mark technical data and computer software developed at private expense with limited rights, restricted rights, or government purpose rights legends in accordance with DFARS 252.227-7013 and 252.227-7014.",
        }),
      },
    ];

    for (const p of probes) {
      const quote = this.firstSubstring(text, p.patterns);
      if (quote) findings.push(p.build(quote));
    }

    // Emit one intentionally-rejected draft for clauses that don't match,
    // so the "Rejected (N)" drawer has content to show the verifier working.
    if (findings.length === 0 && text.length > 20 && /^C-(0|1)/.test(clauseId)) {
      findings.push({
        category: "IP_RIGHTS",
        severity: "MEDIUM",
        riskScore: 50,
        confidence: 0.4,
        textSpan: { quote: "this exact phrase is not in the clause and the verifier will reject it" },
        regulatoryCitation: { citationId: "FAR 52.227-1", citationText: "..." },
        reasoning: "Synthetic rejected draft to demonstrate the mechanical verifier.",
        recommendedAction: "(this draft will be rejected by the verifier — span not found in clause)",
        redlineSuggestion: null,
      });
    }

    return JSON.stringify({ findings });
  }

  private stubCrossRefFindings(userMsg: string): string {
    const blocks = userMsg.split(/CLAUSE_[AB]_TEXT:/);
    const aIdMatch = userMsg.match(/CLAUSE_A_ID:\s*([^\s\n]+)/);
    const bIdMatch = userMsg.match(/CLAUSE_B_ID:\s*([^\s\n]+)/);
    const aId = aIdMatch?.[1] ?? "C-A";
    const bId = bIdMatch?.[1] ?? "C-B";
    const aText = blocks[1] ? this.extractBetweenTripleQuotes(blocks[1]) ?? "" : "";
    const bText = blocks[2] ? this.extractBetweenTripleQuotes(blocks[2]) ?? "" : "";

    const findings: unknown[] = [];
    const flowDownQuote = "Flow-down of cybersecurity requirements to subcontractors handling Covered Defense Information is at the Contractor's discretion";
    if (bText.includes(flowDownQuote) || aText.includes(flowDownQuote)) {
      const which = bText.includes(flowDownQuote) ? { id: bId, text: bText } : { id: aId, text: aText };
      findings.push({
        category: "CYBERSECURITY",
        severity: "HIGH",
        riskScore: 84,
        confidence: 0.9,
        textSpan: {
          quote: flowDownQuote,
          charStart: which.text.indexOf(flowDownQuote),
          charEnd: which.text.indexOf(flowDownQuote) + flowDownQuote.length,
        },
        regulatoryCitation: {
          citationId: "DFARS 252.204-7012",
          citationText: "DFARS 252.204-7012 — Safeguarding Covered Defense Information.",
        },
        reasoning:
          "Cross-clause: Clause 4 sets up a flow-down carve-out for 'commercial impracticability', and Clause 10 then makes flow-down discretionary. Together, they nullify the DFARS 252.204-7012 supply-chain protection.",
        recommendedAction:
          "Eliminate the discretion in the subcontracting clause and require unconditional flow-down of DFARS 252.204-7012 / NIST SP 800-171.",
        redlineSuggestion: null,
        relatedClauseIds: [aId, bId],
      });
    }
    return JSON.stringify({ findings });
  }

  private stubHiddenFindings(userMsg: string): string {
    // Pick the first clause text as a "carrier" for the hidden finding span.
    const clauseBlocks = userMsg.split(/--- CLAUSE_ID:\s*/).slice(1);
    if (clauseBlocks.length === 0) return JSON.stringify({ findings: [] });
    const findings: unknown[] = [];

    // Look for a clause where we can pin the hidden finding
    for (const block of clauseBlocks) {
      const idMatch = block.match(/^(\S+)/);
      const id = idMatch?.[1] ?? "C-?";
      const carrier = "The Contractor shall comply with the International Traffic in Arms Regulations";
      if (block.includes(carrier)) {
        findings.push({
          clauseId: id,
          category: "COMPLIANCE_DFARS",
          severity: "MEDIUM",
          riskScore: 60,
          confidence: 0.75,
          textSpan: { quote: carrier, charStart: 0, charEnd: carrier.length },
          regulatoryCitation: {
            citationId: "DFARS 252.204-7021",
            citationText: "DFARS 252.204-7021 — CMMC Requirements.",
          },
          reasoning:
            "Hidden risk: the document references DFARS 252.204-7012 but does not specify the required CMMC level. For defense work involving CDI, the contract should explicitly identify the applicable CMMC level (typically L2).",
          recommendedAction:
            "Add an explicit CMMC level requirement (e.g., CMMC Level 2) and the SPRS posting requirement consistent with DFARS 252.204-7019/-7021.",
          redlineSuggestion:
            "Add new clause: 'The Contractor shall maintain CMMC Level 2 certification throughout contract performance, and shall comply with DFARS 252.204-7019, -7020, and -7021.'",
          relatedClauseIds: [id],
        });
        break;
      }
    }
    return JSON.stringify({ findings });
  }
}
