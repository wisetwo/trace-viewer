/**
 * CSS Styles for Trace Viewer
 */

export const traceStyles = `
  /* CSS Variables - Light Theme */
  :host {
    --bg: #f8fafc;
    --bg-surface: #ffffff;
    --bg-secondary: #f1f5f9;
    --bg-tertiary: #e2e8f0;
    --bg-code: #f1f5f9;
    --text: #1e293b;
    --text-secondary: #475569;
    --text-muted: #94a3b8;
    --border-color: #e2e8f0;
    --border-light: #f1f5f9;
    --accent: #3b82f6;
    --accent-hover: #2563eb;
    --accent-light: #eff6ff;
    --accent-foreground: #ffffff;
    --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
    --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.07), 0 2px 4px -2px rgba(0, 0, 0, 0.05);
    --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -4px rgba(0, 0, 0, 0.04);
    --shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.06);
    --radius: 10px;
    --radius-sm: 6px;
    --radius-lg: 14px;
    --color-info: #3b82f6;
    --color-info-bg: #eff6ff;
    --color-info-border: #bfdbfe;
    --color-warn: #f59e0b;
    --color-warn-bg: #fffbeb;
    --color-warn-border: #fde68a;
    --color-success: #10b981;
    --color-success-bg: #ecfdf5;
    --color-success-border: #a7f3d0;
    --color-danger: #ef4444;
    --color-danger-bg: #fef2f2;
    --color-danger-border: #fecaca;
    --color-purple: #8b5cf6;
    --color-purple-bg: #f5f3ff;
    --color-purple-border: #ddd6fe;
  }

  :host([data-theme="dark"]),
  :host-context([data-theme="dark"]) {
    --bg: #0f172a;
    --bg-surface: #1e293b;
    --bg-secondary: #334155;
    --bg-tertiary: #475569;
    --bg-code: #1e293b;
    --text: #f1f5f9;
    --text-secondary: #cbd5e1;
    --text-muted: #64748b;
    --border-color: #334155;
    --border-light: #1e293b;
    --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.3);
    --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.4), 0 2px 4px -2px rgba(0, 0, 0, 0.3);
    --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.4), 0 4px 6px -4px rgba(0, 0, 0, 0.3);
    --shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.4);
    --color-info-bg: rgba(59, 130, 246, 0.15);
    --color-info-border: rgba(59, 130, 246, 0.3);
    --color-info: #60a5fa;
    --color-warn-bg: rgba(245, 158, 11, 0.15);
    --color-warn-border: rgba(245, 158, 11, 0.3);
    --color-warn: #fbbf24;
    --color-success-bg: rgba(16, 185, 129, 0.15);
    --color-success-border: rgba(16, 185, 129, 0.3);
    --color-success: #34d399;
    --color-danger-bg: rgba(239, 68, 68, 0.15);
    --color-danger-border: rgba(239, 68, 68, 0.3);
    --color-danger: #f87171;
    --color-purple: #a78bfa;
    --color-purple-bg: rgba(139, 92, 246, 0.15);
    --color-purple-border: rgba(139, 92, 246, 0.3);
    --accent-light: rgba(59, 130, 246, 0.15);
  }

  * {
    box-sizing: border-box;
  }

  .container {
    max-width: 1400px;
    margin: 0 auto;
    padding: 24px;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
    background: var(--bg);
    color: var(--text);
    line-height: 1.6;
    min-height: 100vh;
  }

  /* Card */
  .card {
    background: var(--bg-surface);
    border: 1px solid var(--border-color);
    border-radius: var(--radius);
    padding: 20px;
    box-shadow: var(--shadow-sm);
    transition: box-shadow 0.2s;
  }

  .card-title {
    font-size: 1.15em;
    font-weight: 600;
    margin-bottom: 4px;
    color: var(--text);
  }

  .card-sub {
    font-size: 0.88em;
    color: var(--text-muted);
  }

  /* Buttons */
  .btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    padding: 8px 16px;
    font-size: 0.875em;
    font-weight: 500;
    border: 1px solid var(--border-color);
    border-radius: var(--radius-sm);
    background: var(--bg-surface);
    color: var(--text);
    cursor: pointer;
    transition: all 0.15s ease;
    white-space: nowrap;
    line-height: 1.4;
  }

  .btn:hover:not(:disabled) {
    background: var(--bg-secondary);
    border-color: var(--text-muted);
    box-shadow: var(--shadow-sm);
  }

  .btn:active:not(:disabled) {
    transform: translateY(1px);
  }

  .btn:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }

  .btn--small {
    padding: 5px 12px;
    font-size: 0.8em;
    border-radius: 5px;
  }

  .btn--primary {
    background: var(--accent);
    color: var(--accent-foreground);
    border-color: var(--accent);
  }

  .btn--primary:hover:not(:disabled) {
    background: var(--accent-hover);
    border-color: var(--accent-hover);
    box-shadow: 0 2px 8px rgba(59, 130, 246, 0.35);
  }

  .btn--ghost {
    background: transparent;
    border-color: transparent;
    color: var(--text-secondary);
  }

  .btn--ghost:hover:not(:disabled) {
    background: var(--bg-secondary);
    border-color: transparent;
  }

  /* Layout */
  .row {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  /* Badge */
  .badge {
    display: inline-flex;
    align-items: center;
    padding: 2px 10px;
    font-size: 0.75em;
    font-weight: 600;
    border-radius: 20px;
    letter-spacing: 0.02em;
    line-height: 1.6;
  }

  /* Utility */
  .mono {
    font-family: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Monaco, Consolas, monospace;
  }

  .muted {
    color: var(--text-muted);
  }

  /* Callout */
  .callout {
    padding: 12px 16px;
    border-radius: var(--radius-sm);
    background: var(--bg-secondary);
    border-left: 4px solid var(--text-muted);
  }

  .callout.danger {
    background: var(--color-danger-bg);
    color: var(--color-danger);
    border-left-color: var(--color-danger);
  }

  /* Header */
  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
    padding-bottom: 16px;
    border-bottom: 1px solid var(--border-color);
  }

  .header-title {
    font-size: 1.5em;
    font-weight: 700;
    background: linear-gradient(135deg, var(--accent) 0%, var(--color-purple) 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .header-actions {
    display: flex;
    gap: 8px;
    align-items: center;
  }

  /* Trace View Styles */
  .trace-view {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  /* Table styles */
  .trace-table-container {
    overflow-x: auto;
    padding: 0;
  }

  .trace-table {
    width: 100%;
    border-collapse: separate;
    border-spacing: 0;
    font-size: 0.88em;
  }

  .trace-table th,
  .trace-table td {
    padding: 12px 14px;
    text-align: left;
    border-bottom: 1px solid var(--border-color);
    vertical-align: middle;
  }

  .trace-table th {
    background: var(--bg-secondary);
    font-weight: 600;
    font-size: 0.8em;
    color: var(--text-muted);
    letter-spacing: 0.04em;
    position: sticky;
    top: 0;
    z-index: 1;
  }

  .trace-table th:first-child {
    border-radius: var(--radius-sm) 0 0 0;
  }

  .trace-table th:last-child {
    border-radius: 0 var(--radius-sm) 0 0;
  }

  .trace-row {
    cursor: pointer;
    transition: background 0.12s, box-shadow 0.12s;
  }

  .trace-row:hover {
    background: var(--accent-light);
  }

  .trace-row:active {
    background: var(--bg-secondary);
  }

  .trace-cell-time {
    white-space: nowrap;
    font-size: 0.85em;
    color: var(--text-muted);
  }

  .trace-cell-session-stage {
    white-space: nowrap;
    max-width: 200px;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .trace-cell-stacked {
    display: flex;
    flex-direction: column;
    gap: 4px;
    align-items: flex-start;
  }

  .trace-session-key {
    font-size: 0.78em;
    color: var(--text-muted);
    line-height: 1.2;
    display: block;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    max-width: 100%;
  }

  .trace-cell-model .trace-cell-stacked {
    gap: 3px;
  }

  .trace-cell-messages {
    white-space: nowrap;
  }

  .trace-cell-preview {
    max-width: 300px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    color: var(--text-muted);
    font-size: 0.85em;
  }

  .trace-cell-action {
    text-align: right;
  }

  .trace-provider {
    font-size: 0.78em;
    background: var(--bg-tertiary);
    border-radius: 4px;
    color: var(--text-secondary);
    padding: 1px 6px;
  }

  .trace-model {
    font-size: 0.85em;
    color: var(--text-secondary);
  }

  .trace-msg-count,
  .trace-tool-count {
    font-size: 0.85em;
    color: var(--text-secondary);
  }

  .trace-cell-tools {
    white-space: nowrap;
  }

  /* Stage badges */
  .trace-stage {
    font-size: 0.73em;
    padding: 2px 10px;
    border-radius: 20px;
    font-weight: 600;
    letter-spacing: 0.02em;
    background: var(--bg-secondary);
    color: var(--text-secondary);
  }

  .trace-session-badge {
    font-size: 0.73em;
    padding: 2px 10px;
    border-radius: 20px;
    background: var(--bg-secondary);
    color: var(--text-secondary);
    max-width: 300px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    display: inline-block;
  }

  .trace-seq-badge {
    font-size: 0.73em;
    padding: 2px 8px;
    border-radius: 20px;
    background: var(--bg-secondary);
    color: var(--text-muted);
    white-space: nowrap;
  }

  .trace-seq {
    font-size: 0.82em;
    color: var(--text-muted);
  }

  .trace-stage.info {
    background: var(--color-info-bg);
    color: var(--color-info);
    border: 1px solid var(--color-info-border);
  }

  .trace-stage.warn {
    background: var(--color-warn-bg);
    color: var(--color-warn);
    border: 1px solid var(--color-warn-border);
  }

  .trace-stage.success {
    background: var(--color-success-bg);
    color: var(--color-success);
    border: 1px solid var(--color-success-border);
  }

  /* Pagination */
  .trace-pagination {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 4px;
  }

  .trace-pagination-info {
    font-size: 0.85em;
    color: var(--text-muted);
    font-weight: 500;
  }

  .trace-pagination-controls {
    display: flex;
    gap: 4px;
    align-items: center;
  }

  .trace-pagination-ellipsis {
    padding: 0 8px;
    color: var(--text-muted);
  }

  .btn--active,
  .btn--active:hover {
    border-color: var(--accent);
    background: var(--accent);
    color: var(--accent-foreground);
    box-shadow: 0 2px 6px rgba(59, 130, 246, 0.3);
  }

  .btn--active:hover {
    background: var(--accent-hover);
    border-color: var(--accent-hover);
  }

  /* Modal styles */
  .trace-modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(4px);
    -webkit-backdrop-filter: blur(4px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: 16px;
    animation: modal-fadein 0.2s ease;
  }

  @keyframes modal-fadein {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  .trace-modal {
    background: var(--bg-surface);
    border: 1px solid var(--border-color);
    border-radius: var(--radius-lg);
    max-width: 1100px;
    width: 100%;
    max-height: 92vh;
    display: flex;
    flex-direction: column;
    box-shadow: var(--shadow-xl);
    animation: modal-slidein 0.25s ease;
  }

  @keyframes modal-slidein {
    from {
      opacity: 0;
      transform: translateY(12px) scale(0.98);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }

  .trace-modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 20px;
    border-bottom: 1px solid var(--border-color);
    background: var(--bg-secondary);
    border-radius: var(--radius-lg) var(--radius-lg) 0 0;
    flex-shrink: 0;
  }

  .trace-modal-title {
    display: flex;
    flex-direction: column;
    gap: 4px;
    min-width: 0;
    overflow: hidden;
  }

  .trace-modal-title-row {
    display: flex;
    gap: 8px;
    align-items: center;
    flex-wrap: wrap;
  }

  .trace-modal-title-time {
    font-size: 0.82em;
    color: var(--text-muted);
    padding-left: 8px;
  }

  .trace-modal-actions {
    display: flex;
    gap: 8px;
    align-items: center;
  }

  .trace-modal-body {
    padding: 20px;
    overflow-y: auto;
    flex: 1;
  }

  .trace-loading {
    padding: 48px;
    text-align: center;
    color: var(--text-muted);
    font-size: 0.95em;
  }

  /* Meta section */
  .trace-meta-section {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-bottom: 20px;
    padding: 14px 16px;
    background: var(--bg-secondary);
    border-radius: var(--radius);
    border: 1px solid var(--border-color);
  }

  .trace-meta-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px 20px;
  }

  .trace-meta-item {
    display: flex;
    gap: 8px;
    align-items: baseline;
    min-width: 0;
    overflow: hidden;
  }

  .trace-meta-full {
    grid-column: 1 / -1;
  }

  .trace-meta-truncate {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .trace-meta-item > span:not(.trace-meta-label) {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    min-width: 0;
    font-size: 0.88em;
  }

  .trace-meta-label {
    font-size: 0.78em;
    color: var(--text-muted);
    flex-shrink: 0;
    min-width: 60px;
    font-weight: 600;
    letter-spacing: 0.04em;
  }

  /* Content sections - flat style */
  .trace-flat-section {
    margin-bottom: 20px;
  }

  .trace-flat-title {
    font-size: 0.92em;
    font-weight: 600;
    color: var(--text);
    margin: 0 0 10px 0;
    padding-bottom: 6px;
    border-bottom: 2px solid var(--border-color);
    display: flex;
    gap: 8px;
    align-items: center;
  }

  .trace-flat-title--danger {
    color: var(--color-danger);
    border-bottom-color: var(--color-danger);
  }

  .trace-count {
    font-weight: normal;
    color: var(--text-muted);
    font-size: 0.9em;
  }

  /* Expandable content */
  .trace-expandable-container {
    position: relative;
  }

  .trace-expandable-content {
    max-height: 350px;
    overflow-y: auto;
  }

  .trace-expandable-container.expanded .trace-expandable-content {
    max-height: none;
  }

  .trace-expand-btn {
    display: none;
    margin-top: 8px;
    padding: 2px 0;
    font-size: 0.8em;
    font-weight: 500;
    background: none;
    border: none;
    border-radius: 0;
    color: var(--accent);
    cursor: pointer;
    transition: color 0.15s;
    text-decoration: underline;
    text-underline-offset: 2px;
  }

  .trace-expandable-container.overflowing .trace-expand-btn {
    display: inline-flex;
    align-items: center;
    gap: 4px;
  }

  .trace-expand-btn:hover {
    color: var(--accent-hover);
    background: none;
  }

  .trace-system-content,
  .trace-prompt-content {
    margin: 0;
    font-size: 0.85em;
    white-space: pre-wrap;
    word-break: break-word;
    background: var(--bg-secondary);
    padding: 14px;
    border-radius: var(--radius-sm);
    border: 1px solid var(--border-color);
    line-height: 1.6;
  }

  .trace-error-content {
    padding: 12px;
    color: var(--color-danger);
    background: var(--color-danger-bg);
    border-radius: var(--radius-sm);
    border: 1px solid var(--color-danger-border);
  }

  /* Messages list */
  .trace-messages-list {
    display: flex;
    flex-direction: column;
    gap: 0;
  }

  .trace-message {
    padding: 0;
    border-bottom: 1px solid var(--border-color);
  }

  .trace-message:last-child {
    border-bottom: none;
  }

  .trace-message-header {
    display: flex;
    gap: 10px;
    align-items: center;
    padding: 8px 0;
    font-size: 0.85em;
  }

  .trace-message-body {
    padding: 0 0 12px 0;
  }

  .trace-message-role {
    font-size: 0.72em;
    padding: 2px 8px;
    border-radius: 3px;
    font-weight: 700;
    letter-spacing: 0.04em;
    line-height: 1.4;
  }

  .trace-message-role.user {
    background: var(--color-info-bg);
    color: var(--color-info);
    border: 1px solid var(--color-info-border);
  }

  .trace-message-role.assistant {
    background: var(--color-purple-bg);
    color: var(--color-purple);
    border: 1px solid var(--color-purple-border);
  }

  .trace-message-role.toolResult {
    background: var(--color-warn-bg);
    color: var(--color-warn);
    border: 1px solid var(--color-warn-border);
  }

  .trace-message-role.system {
    background: var(--color-success-bg);
    color: var(--color-success);
    border: 1px solid var(--color-success-border);
  }

  .trace-message-index {
    color: var(--text-muted);
    font-size: 0.88em;
    font-weight: 500;
  }

  .trace-message-time,
  .trace-message-model {
    color: var(--text-muted);
    font-size: 0.85em;
  }

  /* Content rendering */
  .trace-text-content {
    white-space: pre-wrap;
    word-break: break-word;
    font-size: 0.92em;
    line-height: 1.6;
  }

  .trace-content-type {
    font-size: 0.78em;
    color: var(--text-muted);
    margin-bottom: 6px;
    display: inline-block;
    font-weight: 600;
    letter-spacing: 0.03em;
  }

  .trace-text-block,
  .trace-thinking-block,
  .trace-tool-block {
    margin: 8px 0;
    padding: 12px;
    background: var(--bg-secondary);
    border-radius: var(--radius-sm);
    border: 1px solid var(--border-color);
  }

  .trace-thinking-block {
    border-left: 3px solid var(--color-warn);
    background: var(--color-warn-bg);
  }

  .trace-tool-block {
    border-left: 3px solid var(--color-info);
    background: var(--color-info-bg);
  }

  .trace-tool-args {
    margin: 10px 0 0 0;
    padding: 10px;
    background: var(--bg-code);
    border-radius: var(--radius-sm);
    font-size: 0.85em;
    overflow-x: auto;
    max-height: 200px;
    border: 1px solid var(--border-color);
  }

  /* Tools list in detail modal */
  .trace-tools-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .trace-tool-def {
    padding: 12px 14px;
    background: var(--bg-secondary);
    border-radius: var(--radius-sm);
    border: 1px solid var(--border-color);
    border-left: 3px solid var(--color-info);
    transition: box-shadow 0.15s;
  }

  .trace-tool-def:hover {
    box-shadow: var(--shadow-sm);
  }

  .trace-tool-def-header {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .trace-tool-name {
    font-family: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Monaco, Consolas, monospace;
    font-size: 0.88em;
    font-weight: 600;
    color: var(--color-info);
  }

  .trace-tool-description {
    margin-top: 6px;
    font-size: 0.85em;
    color: var(--text-muted);
    line-height: 1.5;
    white-space: pre-wrap;
    word-break: break-word;
  }

  .trace-image-container {
    margin: 8px 0;
  }

  .trace-image-label {
    font-size: 0.8em;
    color: var(--text-muted);
    margin-bottom: 6px;
  }

  .trace-image {
    max-width: 100%;
    max-height: 300px;
    border-radius: var(--radius-sm);
    border: 1px solid var(--border-color);
  }

  .trace-image-clickable {
    cursor: pointer;
    transition: opacity 0.2s, transform 0.2s, box-shadow 0.2s;
  }

  .trace-image-clickable:hover {
    opacity: 0.9;
    transform: scale(1.01);
    box-shadow: var(--shadow-md);
  }

  /* Image Lightbox styles */
  .trace-lightbox-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.85);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 2000;
    padding: 20px;
    animation: modal-fadein 0.2s ease;
  }

  .trace-lightbox-content {
    display: flex;
    flex-direction: column;
    max-width: 95vw;
    max-height: 95vh;
    background: var(--bg-surface);
    border-radius: var(--radius-lg);
    overflow: hidden;
    box-shadow: var(--shadow-xl);
  }

  .trace-lightbox-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 16px;
    background: var(--bg-secondary);
    border-bottom: 1px solid var(--border-color);
  }

  .trace-lightbox-label {
    font-size: 0.9em;
    color: var(--text-muted);
  }

  .trace-lightbox-close {
    padding: 6px 14px;
    font-size: 0.88em;
    background: var(--bg-surface);
    border: 1px solid var(--border-color);
    border-radius: var(--radius-sm);
    cursor: pointer;
    color: var(--text);
    transition: all 0.15s;
    font-weight: 500;
  }

  .trace-lightbox-close:hover {
    background: var(--color-danger-bg);
    color: var(--color-danger);
    border-color: var(--color-danger-border);
  }

  .trace-lightbox-body {
    overflow: auto;
    padding: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--bg);
  }

  .trace-lightbox-image {
    max-width: 90vw;
    max-height: 85vh;
    object-fit: contain;
    border-radius: var(--radius-sm);
  }

  .trace-base64 {
    font-family: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Monaco, Consolas, monospace;
    font-size: 0.85em;
    color: var(--text-muted);
    background: var(--bg-secondary);
    padding: 2px 8px;
    border-radius: 4px;
    border: 1px solid var(--border-color);
  }

  .trace-array {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .trace-array-item {
    padding-left: 16px;
    border-left: 2px solid var(--border-color);
  }

  .trace-array-index {
    font-size: 0.8em;
    color: var(--text-muted);
    margin-right: 8px;
    font-weight: 600;
  }

  .trace-object {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .trace-field {
    display: flex;
    gap: 8px;
    align-items: flex-start;
  }

  .trace-key {
    font-weight: 600;
    color: var(--text-secondary);
    flex-shrink: 0;
  }

  .trace-value {
    word-break: break-word;
  }

  /* Scrollbar styling */
  ::-webkit-scrollbar {
    width: 6px;
    height: 6px;
  }

  ::-webkit-scrollbar-track {
    background: transparent;
  }

  ::-webkit-scrollbar-thumb {
    background: var(--text-muted);
    border-radius: 3px;
    opacity: 0.5;
  }

  ::-webkit-scrollbar-thumb:hover {
    background: var(--text-secondary);
  }

`;
