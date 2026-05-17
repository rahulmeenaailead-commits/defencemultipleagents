import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";

import { parsePdf } from "@/lib/pdf/parse";
import { segmentClauses } from "@/lib/clauses/segment";
import { getProvider } from "@/lib/providers";
import { runPerClauseExtraction } from "@/lib/pipeline/extractor";
import { runCrossRefPass } from "@/lib/pipeline/cross_ref";
import { runHiddenPass } from "@/lib/pipeline/hidden";
import { jobsStore } from "@/lib/store/jobs";
import { SAMPLE_CONTRACT_TEXT, SAMPLE_DOC_TITLE } from "@/lib/sample";
import type { AnalysisResult } from "@/lib/schema";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const started = Date.now();
  const contentType = req.headers.get("content-type") ?? "";

  let documentText = "";
  let documentTitle = "Uploaded Document";

  try {
    if (contentType.includes("multipart/form-data")) {
      const form = await req.formData();
      const file = form.get("file");
      if (!(file instanceof File)) {
        return NextResponse.json(
          { error: "Missing 'file' field in multipart upload." },
          { status: 400 },
        );
      }
      documentTitle = file.name || documentTitle;
      const buf = Buffer.from(await file.arrayBuffer());
      try {
        const parsed = await parsePdf(buf);
        documentText = parsed.text;
      } catch {
        return NextResponse.json(
          { error: "Could not parse PDF. Try a text-based (not scanned) PDF, or use the sample." },
          { status: 400 },
        );
      }
      if (!documentText || documentText.trim().length < 50) {
        return NextResponse.json(
          { error: "Extracted text is too short. Image-only PDFs are not supported in this demo." },
          { status: 400 },
        );
      }
    } else {
      const body = (await req.json().catch(() => ({}))) as { sample?: boolean; text?: string };
      if (body.sample) {
        documentText = SAMPLE_CONTRACT_TEXT;
        documentTitle = SAMPLE_DOC_TITLE;
      } else if (typeof body.text === "string" && body.text.trim().length > 0) {
        documentText = body.text;
        documentTitle = "Pasted Text";
      } else {
        return NextResponse.json(
          { error: "Send a PDF (multipart) or { sample: true } or { text: '...' }." },
          { status: 400 },
        );
      }
    }
  } catch (e) {
    return NextResponse.json(
      { error: `Request parse error: ${(e as Error).message}` },
      { status: 400 },
    );
  }

  const jobId = randomUUID();
  const clauses = segmentClauses(documentText);
  const provider = getProvider();

  if (clauses.length === 0) {
    return NextResponse.json(
      { error: "Could not segment any clauses from this document." },
      { status: 400 },
    );
  }

  const pass1 = await runPerClauseExtraction({ jobId, provider, clauses, concurrency: 6 });
  const pass2 = await runCrossRefPass({ jobId, provider, clauses, concurrency: 4 });
  const pass3 = await runHiddenPass({ jobId, provider, clauses });

  const errors = [...pass1.errors, ...pass2.errors, ...pass3.errors];
  if (clauses.length === 1 && documentText.length > 20000) {
    errors.unshift({
      phase: "PRECHECK",
      clauseId: null,
      code: "DOC_NOT_SEGMENTED",
      message: `Document is ${documentText.length.toLocaleString()} chars but only 1 clause was detected — the segmenter didn't find numbered headings like "1. SCOPE OF WORK" or "Section 4.1 …". This document may not be a procurement contract, or it uses a heading style the segmenter doesn't recognize.`,
    });
  }

  const result: AnalysisResult = {
    jobId,
    documentTitle,
    documentChars: documentText.length,
    clauses,
    verifiedFindings: pass1.verified,
    rejectedFindings: [...pass1.rejected, ...pass2.rejected, ...pass3.rejected],
    crossRefFindings: pass2.verified,
    hiddenFindings: pass3.verified,
    errors,
    timedOut: false,
    providerId: provider.id,
    elapsedMs: Date.now() - started,
  };

  jobsStore.put(result);
  return NextResponse.json(result);
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const jobId = url.searchParams.get("jobId");
  if (!jobId) {
    return NextResponse.json({ error: "Pass ?jobId=…" }, { status: 400 });
  }
  const result = jobsStore.get(jobId);
  if (!result) {
    return NextResponse.json({ error: "Job not found" }, { status: 404 });
  }
  return NextResponse.json(result);
}
