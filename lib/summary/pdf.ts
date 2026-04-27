import type { Material } from "@/lib/types";

export interface PdfSummaryJob {
  materialId: string;
  sourceUrl: string;
  fileUrl?: string;
  status: "queued" | "skipped";
  reason?: string;
}

export function queuePdfSummary(material: Material): PdfSummaryJob {
  if (material.type !== "pdf") {
    return {
      materialId: material.id,
      sourceUrl: material.sourceUrl,
      fileUrl: material.fileUrl,
      status: "skipped",
      reason: "Only PDF materials are supported by the summary pipeline."
    };
  }

  if (!process.env.OPENAI_API_KEY) {
    return {
      materialId: material.id,
      sourceUrl: material.sourceUrl,
      fileUrl: material.fileUrl,
      status: "skipped",
      reason: "OPENAI_API_KEY is not configured."
    };
  }

  // TODO: Add a durable queue and PDF text extraction before calling OpenAI.
  return {
    materialId: material.id,
    sourceUrl: material.sourceUrl,
    fileUrl: material.fileUrl,
    status: "queued"
  };
}
