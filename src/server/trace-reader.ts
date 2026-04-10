/**
 * JSONL Trace File Reader
 * Handles reading, parsing, and paginating cache-trace.jsonl files
 */

import fs from "node:fs/promises";
import path from "node:path";
import type { TraceEntry, TraceSummary, TraceApiResponse } from "../shared/types.js";

const DEFAULT_PAGE_SIZE = 50;
const MAX_PAGE_SIZE = 100;
const PREVIEW_LENGTH = 200;

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/**
 * Parse a single line of JSONL into a TraceEntry
 */
function parseTraceLine(line: string): TraceEntry | null {
  const trimmed = line.trim();
  if (!trimmed) {
    return null;
  }
  try {
    const obj = JSON.parse(trimmed) as TraceEntry;
    if (!obj || typeof obj !== "object") {
      return null;
    }
    return obj;
  } catch {
    return null;
  }
}

/**
 * Create a summary from a full entry (strips large content)
 */
function toSummary(entry: TraceEntry): TraceSummary {
  const systemStr =
    typeof entry.system === "string"
      ? entry.system
      : entry.system != null
        ? JSON.stringify(entry.system)
        : undefined;
  const promptStr = typeof entry.prompt === "string" ? entry.prompt : undefined;
  const toolCount = entry.toolCount ?? entry.tools?.length ?? 0;

  return {
    ts: entry.ts,
    seq: entry.seq,
    stage: entry.stage,
    runId: entry.runId,
    sessionId: entry.sessionId,
    sessionKey: entry.sessionKey,
    provider: entry.provider,
    modelId: entry.modelId,
    modelApi: entry.modelApi,
    messageCount: entry.messageCount ?? entry.messages?.length ?? 0,
    toolCount,
    note: entry.note,
    error: entry.error,
    systemPreview: systemStr?.slice(0, PREVIEW_LENGTH),
    promptPreview: promptStr?.slice(0, PREVIEW_LENGTH),
    hasSystem: systemStr != null && systemStr.length > 0,
    hasPrompt: promptStr != null && promptStr.length > 0,
    hasMessages: (entry.messages?.length ?? 0) > 0,
    hasTools: toolCount > 0,
  };
}

/**
 * Read all lines from file
 */
async function readAllLines(file: string): Promise<string[]> {
  try {
    const content = await fs.readFile(file, "utf8");
    const lines = content.split("\n").filter((l) => l.trim().length > 0);
    return lines;
  } catch {
    return [];
  }
}

/**
 * Resolve trace file path - handles both file and directory paths
 */
export async function resolveTraceFile(inputPath: string): Promise<string> {
  const resolved = path.resolve(inputPath);
  const stat = await fs.stat(resolved).catch(() => null);

  if (!stat) {
    throw new Error(`Path does not exist: ${resolved}`);
  }

  if (stat.isFile()) {
    return resolved;
  }

  if (stat.isDirectory()) {
    // Look for cache-trace.jsonl or any .jsonl file
    const files = await fs.readdir(resolved);
    const jsonlFiles = files.filter((f) => f.endsWith(".jsonl"));

    if (jsonlFiles.includes("cache-trace.jsonl")) {
      return path.join(resolved, "cache-trace.jsonl");
    }

    if (jsonlFiles.length === 1) {
      return path.join(resolved, jsonlFiles[0]);
    }

    if (jsonlFiles.length > 1) {
      throw new Error(
        `Multiple .jsonl files found in directory. Please specify a file:\n${jsonlFiles.map((f) => `  - ${f}`).join("\n")}`,
      );
    }

    throw new Error(`No .jsonl files found in directory: ${resolved}`);
  }

  throw new Error(`Invalid path: ${resolved}`);
}

export interface TraceReaderOptions {
  filePath: string;
}

/**
 * TraceReader class for reading and parsing trace files
 */
export class TraceReader {
  private filePath: string;
  private linesCache: string[] | null = null;
  private lastModified: number = 0;

  constructor(options: TraceReaderOptions) {
    this.filePath = options.filePath;
  }

  /**
   * Get the file path being read
   */
  getFilePath(): string {
    return this.filePath;
  }

  /**
   * Invalidate the cache (for watch mode)
   */
  invalidateCache(): void {
    this.linesCache = null;
    this.lastModified = 0;
  }

  /**
   * Read all lines with caching
   */
  private async getLines(): Promise<string[]> {
    const stat = await fs.stat(this.filePath).catch(() => null);
    if (!stat) {
      return [];
    }

    const mtime = stat.mtimeMs;
    if (this.linesCache && mtime === this.lastModified) {
      return this.linesCache;
    }

    this.linesCache = await readAllLines(this.filePath);
    this.lastModified = mtime;
    return this.linesCache;
  }

  /**
   * Read paginated summaries (newest first)
   */
  async readPaginated(params: {
    page?: number;
    pageSize?: number;
    summaryOnly?: boolean;
  }): Promise<TraceApiResponse> {
    const lines = await this.getLines();
    const totalLines = lines.length;
    const pageSize = clamp(params.pageSize ?? DEFAULT_PAGE_SIZE, 1, MAX_PAGE_SIZE);
    const totalPages = Math.ceil(totalLines / pageSize);
    const page = clamp(params.page ?? 1, 1, Math.max(1, totalPages));

    // Reverse to get newest first, then paginate
    const reversedLines = [...lines].toReversed();
    const startIdx = (page - 1) * pageSize;
    const endIdx = Math.min(startIdx + pageSize, totalLines);
    const pageLines = reversedLines.slice(startIdx, endIdx);

    if (params.summaryOnly !== false) {
      const summaries: TraceSummary[] = [];
      for (const line of pageLines) {
        const entry = parseTraceLine(line);
        if (entry) {
          summaries.push(toSummary(entry));
        }
      }
      return {
        file: this.filePath,
        summaries,
        totalLines,
        page,
        pageSize,
        totalPages,
      };
    }

    const entries: TraceEntry[] = [];
    for (const line of pageLines) {
      const entry = parseTraceLine(line);
      if (entry) {
        entries.push(entry);
      }
    }

    return {
      file: this.filePath,
      entries,
      totalLines,
      page,
      pageSize,
      totalPages,
    };
  }

  /**
   * Get a single entry by seq number
   */
  async getEntryBySeq(seq: number): Promise<TraceEntry | null> {
    const lines = await this.getLines();

    // Search from end (newest) to beginning
    for (let i = lines.length - 1; i >= 0; i--) {
      const entry = parseTraceLine(lines[i]);
      if (entry && entry.seq === seq) {
        return entry;
      }
    }

    return null;
  }
}
