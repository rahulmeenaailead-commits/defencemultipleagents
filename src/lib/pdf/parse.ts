// Import via the internal path to avoid pdf-parse's package-root debug code
// that reads a test PDF off disk (fails under Next.js bundler).
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore -- pdf-parse types don't expose this path
import pdfParse from "pdf-parse/lib/pdf-parse.js";

export type ParsedPdf = {
  text: string;
  numPages: number;
};

export async function parsePdf(buf: Buffer): Promise<ParsedPdf> {
  const data = await pdfParse(buf);
  return { text: dewrapHyphens(data.text), numPages: data.numpages };
}

function dewrapHyphens(text: string): string {
  return text.replace(/(\w)-\s*\n\s*(\w)/g, "$1$2");
}
