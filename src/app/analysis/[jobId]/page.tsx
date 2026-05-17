import { notFound } from "next/navigation";
import { jobsStore } from "@/lib/store/jobs";
import { ResultsView } from "@/components/ResultsView";

export const dynamic = "force-dynamic";

export default async function AnalysisPage({
  params,
}: {
  params: Promise<{ jobId: string }>;
}) {
  const { jobId } = await params;
  const result = jobsStore.get(jobId);
  if (!result) notFound();
  return <ResultsView result={result} />;
}
