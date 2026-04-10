/**
 * UI Types - Mirror of shared types for frontend
 *
 * These are kept as a separate copy so the UI bundle (built by Vite)
 * does not need Node-side module resolution at build time.
 */

export type TraceStage = string & {};

export interface TraceToolDef {
  name: string;
  description?: string;
  [key: string]: unknown;
}

export interface TraceEntry {
  ts: string;
  seq: number;
  stage?: TraceStage;
  runId?: string;
  sessionId?: string;
  sessionKey?: string;
  provider?: string;
  modelId?: string;
  modelApi?: string | null;
  workspaceDir?: string;
  system?: unknown;
  systemDigest?: string;
  prompt?: string;
  options?: Record<string, unknown>;
  model?: Record<string, unknown>;
  tools?: TraceToolDef[];
  toolCount?: number;
  messages?: unknown[];
  messageCount?: number;
  messageRoles?: Array<string | undefined>;
  messageFingerprints?: string[];
  messagesDigest?: string;
  note?: string;
  error?: string;
  [key: string]: unknown;
}

export interface TraceSummary {
  ts: string;
  seq: number;
  stage?: TraceStage;
  runId?: string;
  sessionId?: string;
  sessionKey?: string;
  provider?: string;
  modelId?: string;
  modelApi?: string | null;
  messageCount?: number;
  toolCount?: number;
  note?: string;
  error?: string;
  systemPreview?: string;
  promptPreview?: string;
  hasSystem?: boolean;
  hasPrompt?: boolean;
  hasMessages?: boolean;
  hasTools?: boolean;
}

export interface TraceApiResponse {
  file: string;
  summaries?: TraceSummary[];
  entries?: TraceEntry[];
  entry?: TraceEntry;
  totalLines: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// ─── Backwards-compatible aliases ────────────────────────────────────────────
/** @deprecated Use `TraceStage` */
export type CacheTraceStage = TraceStage;
/** @deprecated Use `TraceToolDef` */
export type CacheTraceToolDef = TraceToolDef;
/** @deprecated Use `TraceEntry` */
export type CacheTraceEntry = TraceEntry;
/** @deprecated Use `TraceSummary` */
export type CacheTraceSummary = TraceSummary;
