/**
 * Shared types for Trace Viewer
 *
 * These types define the expected structure of JSONL trace entries.
 * They are intentionally loose (most fields optional) so the viewer
 * can work with any LLM tracing system that produces JSONL logs,
 * not just a specific framework.
 */

/**
 * Stage identifier for a trace entry.
 *
 * Common conventions:
 * - `session:*`  – session-level events (e.g. loaded, sanitized)
 * - `prompt:*`   – prompt processing events (e.g. before, after)
 * - `stream:*`   – streaming / completion events (e.g. context, chunk)
 *
 * Any string is accepted; the viewer uses prefix matching for badge colors.
 */
export type TraceStage = string & {};

/**
 * Tool definition attached to a trace entry.
 */
export interface TraceToolDef {
  /** Tool name (unique identifier) */
  name: string;
  /** Human-readable description */
  description?: string;
  /** JSON Schema for the tool's input parameters */
  parameters?: Record<string, unknown>;
  /** Additional properties are preserved */
  [key: string]: unknown;
}

/**
 * Full trace entry from a JSONL log file.
 *
 * Only `ts` and `seq` are strictly required for the viewer to function.
 * All other fields are optional and will be rendered when present.
 */
export interface TraceEntry {
  /** ISO 8601 timestamp */
  ts: string;
  /** Monotonically increasing sequence number (unique within the file) */
  seq: number;
  /** Stage / phase label */
  stage?: TraceStage;
  /** Unique ID for the current run / invocation */
  runId?: string;
  /** Session identifier */
  sessionId?: string;
  /** Session key (more descriptive, e.g. "agent:main:main") */
  sessionKey?: string;
  /** LLM provider name (e.g. "openai", "anthropic") */
  provider?: string;
  /** Model identifier (e.g. "gpt-4", "claude-3-opus") */
  modelId?: string;
  /** Model API type */
  modelApi?: string | null;
  /** Working directory context */
  workspaceDir?: string;
  /** System prompt (string or structured object) */
  system?: unknown;
  /** Digest / hash of the system prompt */
  systemDigest?: string;
  /** User prompt text */
  prompt?: string;
  /** Additional options passed to the model */
  options?: Record<string, unknown>;
  /** Model configuration */
  model?: Record<string, unknown>;
  /** Tool definitions available in this context */
  tools?: TraceToolDef[];
  /** Number of tools (may be pre-computed) */
  toolCount?: number;
  /** Message history */
  messages?: unknown[];
  /** Number of messages (may be pre-computed) */
  messageCount?: number;
  /** Roles of each message in order */
  messageRoles?: Array<string | undefined>;
  /** Fingerprints for each message */
  messageFingerprints?: string[];
  /** Digest / hash of the messages array */
  messagesDigest?: string;
  /** Free-form note */
  note?: string;
  /** Error message if this entry represents a failure */
  error?: string;

  /** Catch-all for extra fields the viewer doesn't render but preserves */
  [key: string]: unknown;
}

/**
 * Summary entry for the list view (large content fields stripped out).
 */
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
  /** Truncated preview of the system prompt */
  systemPreview?: string;
  /** Truncated preview of the user prompt */
  promptPreview?: string;
  hasSystem?: boolean;
  hasPrompt?: boolean;
  hasMessages?: boolean;
  hasTools?: boolean;
}

/**
 * API response for GET /api/trace
 */
export interface TraceApiResponse {
  /** Path to the JSONL file being served */
  file: string;
  /** Summaries (when listing) */
  summaries?: TraceSummary[];
  /** Full entries (when summaryOnly=false) */
  entries?: TraceEntry[];
  totalLines: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/**
 * API request parameters for GET /api/trace
 */
export interface TraceApiParams {
  page?: number;
  pageSize?: number;
  summaryOnly?: boolean;
  /** Retrieve a single full entry by seq number */
  seq?: number;
}

// ─── Backwards-compatible aliases ────────────────────────────────────────────
// These aliases let existing code that uses the old "CacheTrace*" names
// continue to work without changes.

/** @deprecated Use `TraceStage` instead */
export type CacheTraceStage = TraceStage;
/** @deprecated Use `TraceToolDef` instead */
export type CacheTraceToolDef = TraceToolDef;
/** @deprecated Use `TraceEntry` instead */
export type CacheTraceEntry = TraceEntry;
/** @deprecated Use `TraceSummary` instead */
export type CacheTraceSummary = TraceSummary;
