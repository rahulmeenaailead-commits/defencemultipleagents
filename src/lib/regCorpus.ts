export type RegCitation = {
  citationId: string;
  citationText: string;
  shortLabel: string;
};

const CITATIONS: RegCitation[] = [
  // FAR — Federal Acquisition Regulation
  { citationId: "FAR 52.227-1", shortLabel: "Authorization and Consent", citationText: "FAR 52.227-1 — Authorization and Consent. The Government authorizes and consents to all use and manufacture of any invention described in and covered by a U.S. patent in the performance of this contract." },
  { citationId: "FAR 52.227-3", shortLabel: "Patent Indemnity", citationText: "FAR 52.227-3 — Patent Indemnity. The Contractor shall indemnify the Government and its officers, agents, and employees against liability for infringement of any U.S. patent." },
  { citationId: "FAR 52.227-14", shortLabel: "Rights in Data — General", citationText: "FAR 52.227-14 — Rights in Data — General. The Government shall have unlimited rights in data first produced in the performance of this contract, unless asserted as limited rights data or restricted computer software." },
  { citationId: "FAR 52.228-7", shortLabel: "Insurance — Liability to Third Persons", citationText: "FAR 52.228-7 — Insurance — Liability to Third Persons. The Contractor shall procure and maintain insurance of the kinds and in the minimum amounts set forth in the contract." },
  { citationId: "FAR 52.232-1", shortLabel: "Payments", citationText: "FAR 52.232-1 — Payments. The Government shall pay the Contractor, upon submission of proper invoices, the prices stipulated in the contract." },
  { citationId: "FAR 52.232-25", shortLabel: "Prompt Payment", citationText: "FAR 52.232-25 — Prompt Payment. The Government will make payment in accordance with the Prompt Payment Act (31 U.S.C. 3903) within 30 days of receipt of a proper invoice." },
  { citationId: "FAR 52.233-1", shortLabel: "Disputes", citationText: "FAR 52.233-1 — Disputes. This contract is subject to 41 U.S.C. chapter 71, Contract Disputes." },
  { citationId: "FAR 52.243-1", shortLabel: "Changes — Fixed-Price", citationText: "FAR 52.243-1 — Changes — Fixed-Price. The Contracting Officer may at any time, by written order, make changes within the general scope of this contract." },
  { citationId: "FAR 52.246-2", shortLabel: "Inspection of Supplies — Fixed-Price", citationText: "FAR 52.246-2 — Inspection of Supplies — Fixed-Price. The Contractor shall provide and maintain an inspection system acceptable to the Government." },
  { citationId: "FAR 52.249-2", shortLabel: "Termination for Convenience — Fixed-Price", citationText: "FAR 52.249-2 — Termination for Convenience of the Government (Fixed-Price). The Government may terminate performance of work under this contract in whole or, from time to time, in part, if the Contracting Officer determines that termination is in the Government's interest." },
  { citationId: "FAR 52.249-8", shortLabel: "Default — Fixed-Price Supply and Service", citationText: "FAR 52.249-8 — Default (Fixed-Price Supply and Service). The Government may, subject to paragraphs (c) and (d) below, by written notice of default to the Contractor, terminate this contract in whole or in part if the Contractor fails to deliver the supplies or to perform the services within the time specified." },
  { citationId: "FAR 52.244-2", shortLabel: "Subcontracts", citationText: "FAR 52.244-2 — Subcontracts. The Contractor shall obtain the Contracting Officer's written consent before placing any subcontract that exceeds the threshold." },

  // DFARS — Defense FAR Supplement
  { citationId: "DFARS 252.204-7012", shortLabel: "Safeguarding Covered Defense Information", citationText: "DFARS 252.204-7012 — Safeguarding Covered Defense Information and Cyber Incident Reporting. The Contractor shall provide adequate security on all covered contractor information systems by implementing the security requirements in NIST SP 800-171." },
  { citationId: "DFARS 252.204-7019", shortLabel: "NIST SP 800-171 Assessment Notice", citationText: "DFARS 252.204-7019 — Notice of NIST SP 800-171 DoD Assessment Requirements. Offerors must have a current (not older than 3 years) NIST SP 800-171 DoD Assessment posted in SPRS." },
  { citationId: "DFARS 252.204-7020", shortLabel: "NIST SP 800-171 DoD Assessment", citationText: "DFARS 252.204-7020 — NIST SP 800-171 DoD Assessment Requirements. The Contractor shall provide access to its facilities and personnel to conduct a Medium or High Assessment." },
  { citationId: "DFARS 252.204-7021", shortLabel: "CMMC Requirements", citationText: "DFARS 252.204-7021 — Cybersecurity Maturity Model Certification (CMMC) Requirements. The Contractor shall maintain the CMMC level identified in the solicitation throughout contract performance." },
  { citationId: "DFARS 252.225-7048", shortLabel: "Export-Controlled Items", citationText: "DFARS 252.225-7048 — Export-Controlled Items. The Contractor shall comply with all applicable laws and regulations regarding export-controlled items, including ITAR and EAR." },
  { citationId: "DFARS 252.227-7013", shortLabel: "Rights in Technical Data — Noncommercial Items", citationText: "DFARS 252.227-7013 — Rights in Technical Data — Noncommercial Items. The Government shall have unlimited rights in technical data developed exclusively with Government funds." },
  { citationId: "DFARS 252.227-7014", shortLabel: "Rights in Noncommercial Computer Software", citationText: "DFARS 252.227-7014 — Rights in Noncommercial Computer Software and Noncommercial Computer Software Documentation. Defines unlimited, government purpose, restricted, and specifically negotiated license rights." },
  { citationId: "DFARS 252.227-7015", shortLabel: "Technical Data — Commercial Items", citationText: "DFARS 252.227-7015 — Technical Data — Commercial Items. The Government shall have specific limited rights in technical data pertaining to commercial items." },
  { citationId: "DFARS 252.246-7000", shortLabel: "Material Inspection and Receiving Report", citationText: "DFARS 252.246-7000 — Material Inspection and Receiving Report. The Contractor shall submit material inspection and receiving reports as required by the Procurement Instrument Identification Number." },

  // ITAR — International Traffic in Arms Regulations (22 CFR 120–130)
  { citationId: "ITAR 22 CFR 120", shortLabel: "ITAR — Purpose and Definitions", citationText: "ITAR 22 CFR Part 120 — Purpose and Definitions. Defines defense article, defense service, technical data, and U.S. person for purposes of ITAR." },
  { citationId: "ITAR 22 CFR 121", shortLabel: "USML — Munitions List", citationText: "ITAR 22 CFR Part 121 — The United States Munitions List. Enumerates the defense articles and defense services controlled under ITAR." },
  { citationId: "ITAR 22 CFR 122", shortLabel: "Registration of Manufacturers/Exporters", citationText: "ITAR 22 CFR Part 122 — Registration of Manufacturers and Exporters. Any person who engages in the business of manufacturing or exporting defense articles is required to register with the Directorate of Defense Trade Controls." },
  { citationId: "ITAR 22 CFR 123", shortLabel: "Licenses for the Export of Defense Articles", citationText: "ITAR 22 CFR Part 123 — Licenses for the Export of Defense Articles. No defense article may be exported without a license or other approval from the Department of State." },
  { citationId: "ITAR 22 CFR 124", shortLabel: "Agreements, Off-Shore Procurement", citationText: "ITAR 22 CFR Part 124 — Agreements, Off-Shore Procurement, and Other Defense Services. Requires Technical Assistance Agreements and Manufacturing License Agreements for the export of defense services." },
  { citationId: "ITAR 22 CFR 125", shortLabel: "Licenses for the Export of Technical Data", citationText: "ITAR 22 CFR Part 125 — Licenses for the Export of Technical Data and Classified Defense Articles. The export of technical data requires prior approval, except as exempted." },
  { citationId: "ITAR 22 CFR 126", shortLabel: "General Policies and Provisions", citationText: "ITAR 22 CFR Part 126 — General Policies and Provisions. Includes prohibited destinations, countries subject to U.S. arms embargoes, and exemptions." },
  { citationId: "ITAR 22 CFR 127", shortLabel: "Violations and Penalties", citationText: "ITAR 22 CFR Part 127 — Violations and Penalties. Civil and criminal penalties for violations of the AECA and ITAR." },
  { citationId: "ITAR 22 CFR 130", shortLabel: "Political Contributions, Fees, Commissions", citationText: "ITAR 22 CFR Part 130 — Political Contributions, Fees, and Commissions. Reporting requirements for certain payments related to defense article sales." },

  // CMMC
  { citationId: "CMMC L2", shortLabel: "CMMC Level 2", citationText: "CMMC Level 2 — Advanced. Requires implementation of all 110 security requirements specified in NIST SP 800-171, with triennial third-party assessment for prioritized acquisitions." },
  { citationId: "CMMC L3", shortLabel: "CMMC Level 3", citationText: "CMMC Level 3 — Expert. Adds a subset of NIST SP 800-172 requirements to CMMC Level 2, assessed by the Government." },

  // NIST
  { citationId: "NIST SP 800-171", shortLabel: "Protecting CUI in Nonfederal Systems", citationText: "NIST SP 800-171 — Protecting Controlled Unclassified Information in Nonfederal Systems and Organizations. 110 security requirements across 14 families." },
  { citationId: "NIST SP 800-172", shortLabel: "Enhanced Requirements for CUI", citationText: "NIST SP 800-172 — Enhanced Security Requirements for Protecting Controlled Unclassified Information. A supplement to SP 800-171 for high-value assets." },
];

const BY_ID = new Map(CITATIONS.map((c) => [c.citationId, c]));

export const regCorpus = {
  has(citationId: string): boolean {
    return BY_ID.has(citationId);
  },
  get(citationId: string): RegCitation | undefined {
    return BY_ID.get(citationId);
  },
  all(): RegCitation[] {
    return [...CITATIONS];
  },
  ids(): string[] {
    return CITATIONS.map((c) => c.citationId);
  },
};
