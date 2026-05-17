import { z } from "zod";
import { RiskCategoryEnum, SeverityEnum } from "./taxonomy";

export const TextSpanSchema = z.object({
  quote: z.string().min(1),
  charStart: z.number().int().nonnegative(),
  charEnd: z.number().int().nonnegative(),
});

export const RegulatoryCitationSchema = z
  .object({
    citationId: z.string().min(1),
    citationText: z.string().min(1),
  })
  .nullable();

export const ProvenanceSchema = z.object({
  promptHash: z.string().min(1),
  modelId: z.string().min(1),
  extractedAt: z.string().min(1),
  passType: z.enum(["PER_CLAUSE", "CROSS_REF", "HIDDEN"]),
  relatedClauseIds: z.array(z.string()).default([]),
});

export const RiskFindingSchema = z.object({
  findingId: z.string().min(1),
  clauseId: z.string().min(1),
  category: RiskCategoryEnum,
  severity: SeverityEnum,
  riskScore: z.number().int().min(0).max(100),
  confidence: z.number().min(0).max(1),
  textSpan: TextSpanSchema,
  regulatoryCitation: RegulatoryCitationSchema,
  reasoning: z.string().min(1),
  recommendedAction: z.string().min(1),
  redlineSuggestion: z.string().nullable(),
  provenance: ProvenanceSchema,
});

export type RiskFinding = z.infer<typeof RiskFindingSchema>;

export const RejectionReasonEnum = z.enum([
  "TEXT_SPAN_NOT_FOUND",
  "CITATION_NOT_IN_CORPUS",
  "SCHEMA_INVALID",
]);
export type RejectionReason = z.infer<typeof RejectionReasonEnum>;

export const RejectedFindingSchema = z.object({
  findingId: z.string().min(1),
  clauseId: z.string().min(1),
  category: z.string(),
  reason: RejectionReasonEnum,
  rawDraft: z.unknown(),
});
export type RejectedFinding = z.infer<typeof RejectedFindingSchema>;

export const ClauseSchema = z.object({
  clauseId: z.string(),
  index: z.number().int().nonnegative(),
  heading: z.string().nullable(),
  text: z.string().min(1),
  charStart: z.number().int().nonnegative(),
  charEnd: z.number().int().nonnegative(),
});
export type Clause = z.infer<typeof ClauseSchema>;

export const PipelineErrorSchema = z.object({
  phase: z.enum(["PER_CLAUSE", "CROSS_REF", "HIDDEN", "PRECHECK"]),
  clauseId: z.string().nullable(),
  code: z.enum(["LLM_ERROR", "CLAUSE_TOO_LARGE", "DOC_NOT_SEGMENTED"]),
  message: z.string(),
});
export type PipelineError = z.infer<typeof PipelineErrorSchema>;

export const AnalysisResultSchema = z.object({
  jobId: z.string(),
  documentTitle: z.string(),
  documentChars: z.number().int().nonnegative(),
  clauses: z.array(ClauseSchema),
  verifiedFindings: z.array(RiskFindingSchema),
  rejectedFindings: z.array(RejectedFindingSchema),
  crossRefFindings: z.array(RiskFindingSchema),
  hiddenFindings: z.array(RiskFindingSchema),
  errors: z.array(PipelineErrorSchema).default([]),
  timedOut: z.boolean().default(false),
  providerId: z.string(),
  elapsedMs: z.number().int().nonnegative(),
});
export type AnalysisResult = z.infer<typeof AnalysisResultSchema>;

// Loose schema for parsing raw LLM JSON before verification
export const DraftFindingSchema = z.object({
  category: z.string(),
  severity: z.string(),
  riskScore: z.number(),
  confidence: z.number(),
  textSpan: z.object({
    quote: z.string(),
    charStart: z.number().optional(),
    charEnd: z.number().optional(),
  }),
  regulatoryCitation: z
    .object({
      citationId: z.string(),
      citationText: z.string().optional(),
    })
    .nullable()
    .optional(),
  reasoning: z.string(),
  recommendedAction: z.string(),
  redlineSuggestion: z.string().nullable().optional(),
  relatedClauseIds: z.array(z.string()).optional(),
});
export type DraftFinding = z.infer<typeof DraftFindingSchema>;
