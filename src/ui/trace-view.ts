/**
 * Trace View Component
 * Main rendering logic for trace entries and details modal
 */

import { html, nothing } from "lit";
import type {
  TraceEntry,
  TraceSummary,
  TraceStage,
  TraceToolDef,
} from "./types.js";

export interface TraceProps {
  loading: boolean;
  error: string | null;
  file: string | null;
  summaries: TraceSummary[];
  page: number;
  pageSize: number;
  totalPages: number;
  totalLines: number;
  detailEntry: TraceEntry | null;
  detailLoading: boolean;
  onRefresh: () => void;
  onPageChange: (page: number) => void;
  onViewDetail: (summary: TraceSummary) => void;
  onCloseDetail: () => void;
}

/** Open image lightbox */
function openImageLightbox(dataUrl: string, mimeType: string) {
  const existing = document.getElementById("trace-image-lightbox");
  if (existing) {
    existing.remove();
  }

  const overlay = document.createElement("div");
  overlay.id = "trace-image-lightbox";
  overlay.className = "trace-lightbox-overlay";
  overlay.innerHTML = `
    <div class="trace-lightbox-content">
      <div class="trace-lightbox-header">
        <span class="trace-lightbox-label">Image (${mimeType})</span>
        <button class="trace-lightbox-close" title="Close">✕</button>
      </div>
      <div class="trace-lightbox-body">
        <img class="trace-lightbox-image" src="${dataUrl}" alt="Full size image" />
      </div>
    </div>
  `;

  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) {
      overlay.remove();
    }
  });

  const closeBtn = overlay.querySelector(".trace-lightbox-close");
  closeBtn?.addEventListener("click", () => overlay.remove());

  const handleKeydown = (e: KeyboardEvent) => {
    if (e.key === "Escape") {
      overlay.remove();
      document.removeEventListener("keydown", handleKeydown);
    }
  };
  document.addEventListener("keydown", handleKeydown);

  document.body.appendChild(overlay);
}

function formatTime(value?: string | null) {
  if (!value) {
    return "";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toLocaleString();
}

function stageBadgeClass(stage?: TraceStage): string {
  if (!stage) {
    return "";
  }
  if (stage.startsWith("session:")) {
    return "info";
  }
  if (stage.startsWith("prompt:")) {
    return "warn";
  }
  if (stage.startsWith("stream:")) {
    return "success";
  }
  return "";
}

function isBase64Image(str: string): boolean {
  if (str.length < 100) {
    return false;
  }
  return /^\/9j\/|^iVBOR|^R0lGOD|^UklGR|^Qk1Q/i.test(str);
}

function truncateBase64(str: string, maxLen = 50): string {
  if (str.length <= maxLen) {
    return str;
  }
  return `${str.slice(0, maxLen)}...`;
}

function renderTextContent(content: string) {
  const lines = content.split("\n");
  return html`${lines.map((line, i) =>
    i < lines.length - 1 ? html`${line}<br />` : html`${line}`,
  )}`;
}

function renderMessageContent(content: unknown): ReturnType<typeof html> {
  if (content == null) {
    return html`<span class="muted">null</span>`;
  }

  if (typeof content === "string") {
    if (isBase64Image(content)) {
      return html`<span class="trace-base64">${truncateBase64(content)}</span>`;
    }
    return html`<span class="trace-text-content">${renderTextContent(content)}</span>`;
  }

  if (Array.isArray(content)) {
    return html`
      <div class="trace-array">
        ${content.map(
          (item, idx) => html`
            <div class="trace-array-item">
              <span class="trace-array-index">[${idx}]</span>
              ${renderMessageContent(item)}
            </div>
          `,
        )}
      </div>
    `;
  }

  if (typeof content === "object") {
    const obj = content as Record<string, unknown>;

    if (obj.type === "image" && typeof obj.data === "string") {
      const mimeType = (obj.mimeType as string) || "image/jpeg";
      const dataUrl = `data:${mimeType};base64,${obj.data}`;
      return html`
        <div class="trace-image-container">
          <div class="trace-image-label">Image (${mimeType}) - Click to view full size</div>
          <img
            class="trace-image trace-image-clickable"
            src="${dataUrl}"
            alt="Message image"
            loading="lazy"
            @click=${() => openImageLightbox(dataUrl, mimeType)}
          />
        </div>
      `;
    }

    if (obj.type === "text" && typeof obj.text === "string") {
      return html`
        <div class="trace-text-block">
          <span class="trace-content-type">[text]</span>
          <div class="trace-text-content">${renderTextContent(obj.text)}</div>
        </div>
      `;
    }

    if (obj.type === "thinking" && typeof obj.thinking === "string") {
      return html`
        <div class="trace-thinking-block">
          <span class="trace-content-type">[thinking]</span>
          <div class="trace-text-content">${renderTextContent(obj.thinking)}</div>
        </div>
      `;
    }

    if (obj.type === "tool_use") {
      return html`
        <div class="trace-tool-block">
          <span class="trace-content-type">[${obj.type}: ${obj.name || "unknown"}]</span>
          <pre class="trace-tool-args">${JSON.stringify(obj.input, null, 2)}</pre>
        </div>
      `;
    }

    if (obj.type === "toolCall") {
      return html`
        <div class="trace-tool-block">
          <span class="trace-content-type">[${obj.type}: ${obj.name || "unknown"}]</span>
          <pre class="trace-tool-args">${JSON.stringify(obj.arguments, null, 2)}</pre>
        </div>
      `;
    }

    return html`
      <div class="trace-object">
        ${Object.entries(obj).map(([key, value]) => {
          if (key === "data" && typeof value === "string" && isBase64Image(value)) {
            return html`
              <div class="trace-field">
                <span class="trace-key">${key}:</span>
                <span class="trace-base64">${truncateBase64(value)}</span>
              </div>
            `;
          }
          return html`
            <div class="trace-field">
              <span class="trace-key">${key}:</span>
              ${renderMessageContent(value)}
            </div>
          `;
        })}
      </div>
    `;
  }

  const stringValue = JSON.stringify(content);
  return html`<span class="trace-value">${stringValue}</span>`;
}

function toggleExpand(e: Event) {
  const btn = e.target as HTMLElement;
  const container = btn.closest(".trace-expandable-container");
  if (!container) {
    return;
  }

  const content = container.querySelector(".trace-expandable-content") as HTMLElement;
  if (!content) {
    return;
  }

  const isExpanded = container.classList.contains("expanded");
  if (isExpanded) {
    container.classList.remove("expanded");
    btn.textContent = "Show more \u2193";
  } else {
    container.classList.add("expanded");
    btn.textContent = "Show less \u2191";
  }
}

function checkOverflow(container: Element) {
  const content = container.querySelector(".trace-expandable-content") as HTMLElement;
  if (!content) {
    return;
  }
  if (content.scrollHeight > 350) {
    container.classList.add("overflowing");
  } else {
    container.classList.remove("overflowing");
  }
}

export function setupOverflowDetection(root?: Document | DocumentFragment | ShadowRoot | Element) {
  requestAnimationFrame(() => {
    const searchRoot = root || document;
    const containers = searchRoot.querySelectorAll(
      ".trace-expandable-container:not(.overflow-checked)",
    );
    containers.forEach((container) => {
      container.classList.add("overflow-checked");
      checkOverflow(container);
    });
  });
}

function renderToolDef(tool: TraceToolDef) {
  return html`
    <div class="trace-tool-def">
      <div class="trace-tool-def-header">
        <span class="trace-tool-name">${tool.name}</span>
      </div>
      ${tool.description
        ? html`<div class="trace-tool-description">${tool.description}</div>`
        : nothing}
    </div>
  `;
}

function renderMessage(message: unknown, index: number) {
  const msg = message as Record<string, unknown>;
  const role = (msg.role as string) || "unknown";
  const content = msg.content;
  const timestamp = msg.timestamp
    ? formatTime(new Date(msg.timestamp as number).toISOString())
    : null;

  return html`
    <div class="trace-message">
      <div class="trace-message-header">
        <span class="trace-message-role ${role}">${role}</span>
        <span class="trace-message-index">#${index + 1}</span>
        ${timestamp ? html`<span class="trace-message-time mono">${timestamp}</span>` : nothing}
        ${msg.model ? html`<span class="trace-message-model mono">${msg.model}</span>` : nothing}
      </div>
      <div class="trace-message-body trace-expandable-container">
        <div class="trace-expandable-content">${renderMessageContent(content)}</div>
        <button class="trace-expand-btn" @click=${toggleExpand}>Show more ↓</button>
      </div>
    </div>
  `;
}

function downloadEntryAsJson(entry: TraceEntry) {
  const formatted = JSON.stringify(entry, null, 2);
  const blob = new Blob([formatted], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const timestamp = entry.ts ? new Date(entry.ts).toISOString().replace(/[:.]/g, "-") : "unknown";
  const filename = `trace-${entry.stage || "entry"}-${timestamp}.json`;

  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function renderDetailModal(entry: TraceEntry, loading: boolean, onClose: () => void) {
  const systemContent =
    typeof entry.system === "string"
      ? entry.system
      : entry.system != null
        ? JSON.stringify(entry.system, null, 2)
        : null;

  if (!loading) {
    setupOverflowDetection();
  }

  const handleDownload = (e: Event) => {
    e.stopPropagation();
    downloadEntryAsJson(entry);
  };

  return html`
    <div class="trace-modal-overlay" @click=${onClose}>
      <div class="trace-modal" @click=${(e: Event) => e.stopPropagation()}>
        <div class="trace-modal-header">
          <div class="trace-modal-title">
            <div class="trace-modal-title-row">
              <span class="trace-seq-badge mono">#${entry.seq}</span>
              ${entry.sessionKey
                ? html`<span class="trace-session-badge mono" title="${entry.sessionKey}"
                    >${entry.sessionKey}</span
                  >`
                : nothing}
              <span class="trace-stage badge ${stageBadgeClass(entry.stage)}">${entry.stage}</span>
            </div>
            <span class="trace-modal-title-time mono">${formatTime(entry.ts)}</span>
          </div>
          <div class="trace-modal-actions">
            <button
              class="btn btn--small btn--primary"
              @click=${handleDownload}
              title="Download as JSON"
            >
              Download
            </button>
            <button class="btn btn--small" @click=${onClose}>Close</button>
          </div>
        </div>

        <div class="trace-modal-body">
          ${loading
            ? html`<div class="trace-loading">Loading details...</div>`
            : html`
                <!-- Meta info -->
                <div class="trace-meta-section">
                  <div class="trace-meta-row">
                    <div class="trace-meta-item">
                      <span class="trace-meta-label">Seq</span>
                      <span class="mono">#${entry.seq}</span>
                    </div>
                    <div class="trace-meta-item">
                      <span class="trace-meta-label">Time</span>
                      <span class="mono">${formatTime(entry.ts)}</span>
                    </div>
                  </div>
                  <div class="trace-meta-row">
                    ${entry.sessionKey
                      ? html`<div class="trace-meta-item">
                          <span class="trace-meta-label">Session</span>
                          <span class="mono" title="${entry.sessionKey}">${entry.sessionKey}</span>
                        </div>`
                      : nothing}
                    ${entry.runId
                      ? html`<div class="trace-meta-item">
                          <span class="trace-meta-label">Run ID</span>
                          <span class="mono trace-meta-truncate" title="${entry.runId}"
                            >${entry.runId}</span
                          >
                        </div>`
                      : nothing}
                  </div>
                  <div class="trace-meta-row">
                    ${entry.provider
                      ? html`<div class="trace-meta-item">
                          <span class="trace-meta-label">Provider</span>
                          <span class="mono" title="${entry.provider}">${entry.provider}</span>
                        </div>`
                      : nothing}
                    ${entry.modelId
                      ? html`<div class="trace-meta-item">
                          <span class="trace-meta-label">Model</span>
                          <span class="mono" title="${entry.modelId}">${entry.modelId}</span>
                        </div>`
                      : nothing}
                  </div>
                  ${entry.note
                    ? html`<div class="trace-meta-row">
                        <div class="trace-meta-item trace-meta-full">
                          <span class="trace-meta-label">Note</span>
                          <span title="${entry.note}">${entry.note}</span>
                        </div>
                      </div>`
                    : nothing}
                </div>

                <!-- System Prompt -->
                ${systemContent
                  ? html`
                      <div class="trace-flat-section">
                        <h3 class="trace-flat-title">System Prompt</h3>
                        <div class="trace-expandable-container">
                          <pre class="trace-system-content trace-expandable-content">
${systemContent}</pre
                          >
                          <button class="trace-expand-btn" @click=${toggleExpand}>
                            Show more ↓
                          </button>
                        </div>
                      </div>
                    `
                  : nothing}

                <!-- Prompt -->
                ${entry.prompt
                  ? html`
                      <div class="trace-flat-section">
                        <h3 class="trace-flat-title">Prompt</h3>
                        <div class="trace-expandable-container">
                          <pre class="trace-prompt-content trace-expandable-content">
${entry.prompt}</pre
                          >
                          <button class="trace-expand-btn" @click=${toggleExpand}>
                            Show more ↓
                          </button>
                        </div>
                      </div>
                    `
                  : nothing}

                <!-- Messages -->
                ${entry.messages && entry.messages.length > 0
                  ? html`
                      <div class="trace-flat-section">
                        <h3 class="trace-flat-title">
                          Messages
                          <span class="trace-count">(${entry.messages.length})</span>
                        </h3>
                        <div class="trace-messages-list">
                          ${entry.messages.map((msg: unknown, idx: number) =>
                            renderMessage(msg, idx),
                          )}
                        </div>
                      </div>
                    `
                  : nothing}

                <!-- Tools -->
                ${entry.tools && entry.tools.length > 0
                  ? html`
                      <div class="trace-flat-section">
                        <h3 class="trace-flat-title">
                          Tools
                          <span class="trace-count">(${entry.tools.length})</span>
                        </h3>
                        <div class="trace-expandable-container">
                          <div class="trace-tools-list trace-expandable-content">
                            ${entry.tools.map((tool: TraceToolDef) => renderToolDef(tool))}
                          </div>
                          <button class="trace-expand-btn" @click=${toggleExpand}>
                            Show more ↓
                          </button>
                        </div>
                      </div>
                    `
                  : nothing}

                <!-- Error -->
                ${entry.error
                  ? html`
                      <div class="trace-flat-section">
                        <h3 class="trace-flat-title trace-flat-title--danger">Error</h3>
                        <div class="trace-error-content">${entry.error}</div>
                      </div>
                    `
                  : nothing}
              `}
        </div>
      </div>
    </div>
  `;
}

function renderSummaryRow(
  summary: TraceSummary,
  onViewDetail: (s: TraceSummary) => void,
) {
  const preview = summary.systemPreview || summary.promptPreview || "";
  const hasContent =
    summary.hasSystem || summary.hasPrompt || summary.hasMessages || summary.hasTools;

  return html`
    <tr class="trace-row" @click=${() => onViewDetail(summary)}>
      <td class="trace-cell trace-cell-time">
        <div class="trace-cell-stacked">
          <span class="trace-seq mono">#${summary.seq}</span>
          <span class="mono">${formatTime(summary.ts)}</span>
        </div>
      </td>
      <td class="trace-cell trace-cell-session-stage">
        <div class="trace-cell-stacked">
          ${summary.sessionKey
            ? html`<span class="trace-session-key mono" title="${summary.sessionKey}"
                >${summary.sessionKey}</span
              >`
            : nothing}
          <span class="trace-stage badge ${stageBadgeClass(summary.stage)}">${summary.stage}</span>
        </div>
      </td>
      <td class="trace-cell trace-cell-model">
        <div class="trace-cell-stacked">
          ${summary.provider
            ? html`<span class="trace-provider">${summary.provider}</span>`
            : nothing}
          ${summary.modelId
            ? html`<span class="trace-model mono">${summary.modelId}</span>`
            : nothing}
        </div>
      </td>
      <td class="trace-cell trace-cell-messages">
        ${summary.messageCount != null && summary.messageCount > 0
          ? html`<span class="trace-msg-count">${summary.messageCount} msgs</span>`
          : html`<span class="muted">-</span>`}
      </td>
      <td class="trace-cell trace-cell-tools">
        ${summary.toolCount != null && summary.toolCount > 0
          ? html`<span class="trace-tool-count">${summary.toolCount} tools</span>`
          : html`<span class="muted">-</span>`}
      </td>
      <td class="trace-cell trace-cell-preview">
        ${preview
          ? html`<span class="trace-preview-text"
              >${preview.slice(0, 80)}${preview.length > 80 ? "..." : ""}</span
            >`
          : hasContent
            ? html`<span class="muted">[has content]</span>`
            : html`<span class="muted">-</span>`}
      </td>
    </tr>
  `;
}

function renderPagination(
  page: number,
  totalPages: number,
  totalLines: number,
  onPageChange: (p: number) => void,
) {
  if (totalPages <= 1) {
    return html`
      <div class="trace-pagination">
        <span class="trace-pagination-info">${totalLines} entries</span>
      </div>
    `;
  }

  const pages: number[] = [];
  const maxVisible = 7;
  let start = Math.max(1, page - Math.floor(maxVisible / 2));
  const end = Math.min(totalPages, start + maxVisible - 1);
  if (end - start + 1 < maxVisible) {
    start = Math.max(1, end - maxVisible + 1);
  }
  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  return html`
    <div class="trace-pagination">
      <span class="trace-pagination-info">${totalLines} entries</span>
      <div class="trace-pagination-controls">
        <button
          class="btn btn--small"
          ?disabled=${page <= 1}
          @click=${() => onPageChange(1)}
          title="First page"
        >
          First
        </button>
        <button
          class="btn btn--small"
          ?disabled=${page <= 1}
          @click=${() => onPageChange(page - 1)}
          title="Previous page"
        >
          Prev
        </button>
        ${start > 1 ? html`<span class="trace-pagination-ellipsis">...</span>` : nothing}
        ${pages.map(
          (p) => html`
            <button
              class="btn btn--small ${p === page ? "btn--active" : ""}"
              @click=${() => onPageChange(p)}
            >
              ${p}
            </button>
          `,
        )}
        ${end < totalPages ? html`<span class="trace-pagination-ellipsis">...</span>` : nothing}
        <button
          class="btn btn--small"
          ?disabled=${page >= totalPages}
          @click=${() => onPageChange(page + 1)}
          title="Next page"
        >
          Next
        </button>
        <button
          class="btn btn--small"
          ?disabled=${page >= totalPages}
          @click=${() => onPageChange(totalPages)}
          title="Last page"
        >
          Last
        </button>
      </div>
    </div>
  `;
}

export function renderTrace(props: TraceProps) {
  return html`
    <section class="trace-view">
      <div class="card">
        <div class="row" style="justify-content: space-between;">
          <div>
            <div class="card-title">LLM Trace Viewer</div>
            <div class="card-sub">
              View LLM request context and parameters. Click a row to view details.
            </div>
          </div>
          <div class="row" style="gap: 8px;">
            <button class="btn btn--primary" ?disabled=${props.loading} @click=${props.onRefresh}>
              ${props.loading ? "Loading..." : "Refresh"}
            </button>
          </div>
        </div>

        ${props.file
          ? html`<div class="muted" style="margin-top: 10px;">File: ${props.file}</div>`
          : nothing}
        ${props.error
          ? html`<div class="callout danger" style="margin-top: 10px;">${props.error}</div>`
          : nothing}
      </div>

      <!-- Pagination top -->
      ${renderPagination(props.page, props.totalPages, props.totalLines, props.onPageChange)}

      <!-- Table -->
      <div class="trace-table-container card">
        ${props.summaries.length === 0
          ? html`<div class="muted" style="padding: 20px">No trace entries.</div>`
          : html`
              <table class="trace-table">
                <thead>
                  <tr>
                    <th>Seq / Time</th>
                    <th>Session / Stage</th>
                    <th>Model</th>
                    <th>Msgs</th>
                    <th>Tools</th>
                    <th>Preview</th>
                  </tr>
                </thead>
                <tbody>
                  ${props.summaries.map((s) => renderSummaryRow(s, props.onViewDetail))}
                </tbody>
              </table>
            `}
      </div>

      <!-- Pagination bottom -->
      ${renderPagination(props.page, props.totalPages, props.totalLines, props.onPageChange)}

      <!-- Detail Modal -->
      ${props.detailEntry
        ? renderDetailModal(props.detailEntry, props.detailLoading, props.onCloseDetail)
        : nothing}
    </section>
  `;
}
