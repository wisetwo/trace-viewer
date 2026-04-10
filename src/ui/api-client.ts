/**
 * API Client for Trace Viewer
 */

import type { TraceEntry, TraceSummary, TraceApiResponse } from "./types.js";

const API_BASE = "/api";

export interface FetchTracesParams {
  page?: number;
  pageSize?: number;
  summaryOnly?: boolean;
}

export interface FetchTracesResult {
  file: string;
  summaries: TraceSummary[];
  totalLines: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface FetchEntryResult {
  entry: TraceEntry;
}

/**
 * Fetch paginated trace summaries
 */
export async function fetchTraces(params: FetchTracesParams = {}): Promise<FetchTracesResult> {
  const searchParams = new URLSearchParams();
  if (params.page) {
    searchParams.set("page", String(params.page));
  }
  if (params.pageSize) {
    searchParams.set("pageSize", String(params.pageSize));
  }
  if (params.summaryOnly !== undefined) {
    searchParams.set("summaryOnly", String(params.summaryOnly));
  }

  const url = `${API_BASE}/trace?${searchParams.toString()}`;
  const response = await fetch(url);

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: response.statusText }));
    throw new Error(error.error || "Failed to fetch traces");
  }

  const data = (await response.json()) as TraceApiResponse;
  return {
    file: data.file,
    summaries: data.summaries || [],
    totalLines: data.totalLines,
    page: data.page,
    pageSize: data.pageSize,
    totalPages: data.totalPages,
  };
}

/**
 * Fetch a single trace entry by seq number
 */
export async function fetchEntryBySeq(seq: number): Promise<TraceEntry> {
  const url = `${API_BASE}/trace?seq=${seq}`;
  const response = await fetch(url);

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: response.statusText }));
    throw new Error(error.error || "Failed to fetch entry");
  }

  const data = (await response.json()) as { entry: TraceEntry };
  return data.entry;
}

/**
 * Health check
 */
export async function healthCheck(): Promise<{ status: string; file: string }> {
  const response = await fetch(`${API_BASE}/health`);
  if (!response.ok) {
    throw new Error("Health check failed");
  }
  return (await response.json()) as { status: string; file: string };
}
