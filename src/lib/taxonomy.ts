import { z } from "zod";

export const RISK_CATEGORIES = [
  "IP_RIGHTS",
  "DATA_RIGHTS",
  "EXPORT_CONTROL",
  "CYBERSECURITY",
  "TERMINATION",
  "PAYMENT_TERMS",
  "INDEMNIFICATION",
  "LIABILITY_CAP",
  "WARRANTY",
  "DELIVERY_SCHEDULE",
  "CHANGE_ORDERS",
  "DISPUTE_RESOLUTION",
  "COMPLIANCE_FAR",
  "COMPLIANCE_DFARS",
  "SUBCONTRACTING",
] as const;

export type RiskCategory = (typeof RISK_CATEGORIES)[number];
export const RiskCategoryEnum = z.enum(RISK_CATEGORIES);

export const CATEGORY_LABELS: Record<RiskCategory, string> = {
  IP_RIGHTS: "IP Rights",
  DATA_RIGHTS: "Data Rights",
  EXPORT_CONTROL: "Export Control",
  CYBERSECURITY: "Cybersecurity",
  TERMINATION: "Termination",
  PAYMENT_TERMS: "Payment Terms",
  INDEMNIFICATION: "Indemnification",
  LIABILITY_CAP: "Liability Cap",
  WARRANTY: "Warranty",
  DELIVERY_SCHEDULE: "Delivery Schedule",
  CHANGE_ORDERS: "Change Orders",
  DISPUTE_RESOLUTION: "Dispute Resolution",
  COMPLIANCE_FAR: "FAR Compliance",
  COMPLIANCE_DFARS: "DFARS Compliance",
  SUBCONTRACTING: "Subcontracting",
};

export const SEVERITIES = ["LOW", "MEDIUM", "HIGH", "CRITICAL"] as const;
export type Severity = (typeof SEVERITIES)[number];
export const SeverityEnum = z.enum(SEVERITIES);
