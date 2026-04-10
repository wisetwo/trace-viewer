/**
 * Main Application Component
 * Manages state and renders the trace view
 */

import { LitElement, html, css, unsafeCSS } from "lit";
import { customElement, state } from "lit/decorators.js";
import { fetchTraces, fetchEntryBySeq } from "./api-client.js";
import { traceStyles } from "./styles.js";
import { renderTrace, setupOverflowDetection } from "./trace-view.js";
import type { TraceEntry, TraceSummary } from "./types.js";

@customElement("trace-app")
export class TraceApp extends LitElement {
  static styles = css`
    ${unsafeCSS(traceStyles)}
    :host {
      display: block;
    }
  `;

  @state() private loading = false;
  @state() private error: string | null = null;
  @state() private file: string | null = null;
  @state() private summaries: TraceSummary[] = [];
  @state() private page = 1;
  @state() private pageSize = 50;
  @state() private totalPages = 0;
  @state() private totalLines = 0;
  @state() private detailEntry: TraceEntry | null = null;
  @state() private detailLoading = false;
  @state() private theme: "light" | "dark" = "light";

  connectedCallback() {
    super.connectedCallback();
    this.initTheme();
    void this.loadTraces();
  }

  private initTheme() {
    // Check system preference
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    // Check stored preference
    const stored = localStorage.getItem("trace-viewer-theme");
    this.theme = (stored as "light" | "dark") || (prefersDark ? "dark" : "light");
    this.applyTheme();

    // Listen for system theme changes
    window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", (e) => {
      if (!localStorage.getItem("trace-viewer-theme")) {
        this.theme = e.matches ? "dark" : "light";
        this.applyTheme();
      }
    });
  }

  private applyTheme() {
    document.documentElement.setAttribute("data-theme", this.theme);
    this.setAttribute("data-theme", this.theme);
  }

  private toggleTheme() {
    this.theme = this.theme === "light" ? "dark" : "light";
    localStorage.setItem("trace-viewer-theme", this.theme);
    this.applyTheme();
  }

  private async loadTraces() {
    this.loading = true;
    this.error = null;

    try {
      const result = await fetchTraces({
        page: this.page,
        pageSize: this.pageSize,
        summaryOnly: true,
      });

      this.file = result.file;
      this.summaries = result.summaries;
      this.totalLines = result.totalLines;
      this.totalPages = result.totalPages;
      this.page = result.page;
    } catch (err) {
      this.error = err instanceof Error ? err.message : String(err);
    } finally {
      this.loading = false;
    }
  }

  private handleRefresh() {
    void this.loadTraces();
  }

  private handlePageChange(newPage: number) {
    this.page = newPage;
    void this.loadTraces();
  }

  private async handleViewDetail(summary: TraceSummary) {
    this.detailLoading = true;
    this.detailEntry = summary as unknown as TraceEntry;

    try {
      const entry = await fetchEntryBySeq(summary.seq);
      this.detailEntry = entry;
    } catch (err) {
      console.error("Failed to load detail:", err);
      // Keep the summary as fallback
    } finally {
      this.detailLoading = false;
      // Trigger overflow detection after modal renders
      void this.updateComplete.then(() => setupOverflowDetection(this.renderRoot));
    }
  }

  private handleCloseDetail() {
    this.detailEntry = null;
    this.detailLoading = false;
  }

  render() {
    return html`
      <div class="container">
        <div class="header">
          <div class="header-title">LLM Trace Viewer</div>
          <div class="header-actions">
            <button class="btn btn--small" @click=${() => this.toggleTheme()}>
              ${this.theme === "light" ? "Dark" : "Light"}
            </button>
          </div>
        </div>

        ${renderTrace({
          loading: this.loading,
          error: this.error,
          file: this.file,
          summaries: this.summaries,
          page: this.page,
          pageSize: this.pageSize,
          totalPages: this.totalPages,
          totalLines: this.totalLines,
          detailEntry: this.detailEntry,
          detailLoading: this.detailLoading,
          onRefresh: () => this.handleRefresh(),
          onPageChange: (p) => this.handlePageChange(p),
          onViewDetail: (s) => this.handleViewDetail(s),
          onCloseDetail: () => this.handleCloseDetail(),
        })}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "trace-app": TraceApp;
  }
}
