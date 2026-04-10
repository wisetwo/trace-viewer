# Trace Viewer

A standalone CLI tool to view **LLM request trace logs** (JSONL format) in a beautiful web UI.

Built for debugging and inspecting the full context that is sent to LLM providers — system prompts, message history, tool definitions, and more.

![Node.js](https://img.shields.io/badge/node-%3E%3D18-brightgreen)
![License](https://img.shields.io/badge/license-MIT-blue)

## Features

- 📄 **Paginated list view** — Browse trace entries with pagination (newest first)
- 🔍 **Detail modal** — View full messages, tools, system prompts, and errors
- 🖼️ **Image support** — Preview base64-encoded images with lightbox
- 🌗 **Dark / Light theme** — Automatic detection + manual toggle
- 💾 **Download** — Export individual trace entries as JSON
- 👀 **Watch mode** — Auto-refresh when the log file changes

## Installation

```bash
# Install globally
npm install -g @aspect-build/trace-viewer

# Or use npx (no install required)
npx @aspect-build/trace-viewer ./path/to/trace.jsonl
```

## Quick Start

```bash
# Point to a JSONL file
trace-viewer ./logs/cache-trace.jsonl

# Point to a directory (auto-finds *.jsonl files)
trace-viewer ./logs/

# Custom port + watch mode
trace-viewer ./logs/trace.jsonl --port 8080 --watch

# Don't auto-open browser
trace-viewer ./logs/trace.jsonl --no-open
```

## CLI Options

| Option                | Description             | Default |
| --------------------- | ----------------------- | ------- |
| `<path>`              | Path to `.jsonl` file or directory (required) | — |
| `-p, --port <number>` | Port to listen on       | `3000`  |
| `--no-open`           | Don't auto-open browser | `false` |
| `-w, --watch`         | Watch file for changes  | `false` |

## JSONL Format

The viewer reads **JSONL** (JSON Lines) files — one JSON object per line. It is designed to be flexible: only `ts` and `seq` are required, all other fields are optional and will be rendered when present.

### Minimal Example

```json
{"ts":"2025-04-10T10:30:00.000Z","seq":1,"stage":"stream:context","provider":"openai","modelId":"gpt-4o","messages":[{"role":"user","content":"Hello"}]}
```

### Full Example (OpenClaw-style trace)

```json
{
  "ts": "2025-04-10T10:30:00.000Z",
  "seq": 42,
  "stage": "stream:context",
  "runId": "run-abc123",
  "sessionId": "sess-xyz",
  "sessionKey": "agent:main:main",
  "provider": "anthropic",
  "modelId": "claude-sonnet-4-20250514",
  "modelApi": "messages",
  "system": "You are a helpful coding assistant...",
  "prompt": null,
  "messages": [
    { "role": "user", "content": "Refactor the auth module" },
    { "role": "assistant", "content": [
      { "type": "text", "text": "I'll help you refactor..." },
      { "type": "toolCall", "name": "readFile", "arguments": { "path": "src/auth.ts" } }
    ]},
    { "role": "toolResult", "content": "export function login()..." }
  ],
  "tools": [
    { "name": "readFile", "description": "Read a file from the workspace" },
    { "name": "writeFile", "description": "Write content to a file" }
  ],
  "messageCount": 3,
  "toolCount": 2,
  "note": "cache hit",
  "error": null
}
```

### Field Reference

The table below describes all fields the viewer understands. **Bold** fields are required; all others are optional.

| Field | Type | Description |
| ----- | ---- | ----------- |
| **`ts`** | `string` | ISO 8601 timestamp. Displayed in the list and detail views. |
| **`seq`** | `number` | Unique sequence number (monotonically increasing). Used to fetch individual entries. |
| `stage` | `string` | Phase / stage label. The viewer colorizes badges by prefix: `session:*` → blue, `prompt:*` → yellow, `stream:*` → green. |
| `runId` | `string` | Unique ID for the current run or invocation. Shown in detail meta. |
| `sessionId` | `string` | Session identifier. Shown in detail meta. |
| `sessionKey` | `string` | Human-readable session key (e.g. `"agent:main:main"`). Shown in both list and detail. |
| `provider` | `string` | LLM provider name (e.g. `"openai"`, `"anthropic"`). Shown as a badge. |
| `modelId` | `string` | Model identifier (e.g. `"gpt-4o"`, `"claude-sonnet-4-20250514"`). |
| `modelApi` | `string \| null` | Model API type (e.g. `"chat"`, `"messages"`). |
| `system` | `string \| object` | System prompt. Rendered as expandable preformatted text. |
| `prompt` | `string` | User prompt text. Rendered as expandable preformatted text. |
| `messages` | `array` | Message history. Each item should have `role` and `content`. Content can be a string or an array of typed blocks (`text`, `image`, `thinking`, `toolCall`). |
| `tools` | `array` | Tool definitions. Each item should have `name` and optionally `description`. |
| `messageCount` | `number` | Pre-computed message count (falls back to `messages.length`). |
| `toolCount` | `number` | Pre-computed tool count (falls back to `tools.length`). |
| `note` | `string` | Free-form note. Shown in detail meta. |
| `error` | `string` | Error message. Rendered in a red callout. |

### Message Content Types

Inside the `messages[].content` array, the viewer recognizes these object shapes:

| `type` | Rendered as |
| ------ | ----------- |
| `"text"` | Preformatted text block (reads `.text` field) |
| `"image"` | Clickable image thumbnail with lightbox (reads `.data` base64 + `.mimeType`) |
| `"thinking"` | Yellow-bordered thinking block (reads `.thinking` field) |
| `"toolCall"` | Blue-bordered tool call block with name and JSON arguments |

If `content` is a plain string, it is rendered as text directly. Base64 image strings are auto-detected and shown as thumbnails.

## Programmatic Usage

You can also use the server programmatically:

```typescript
import { createServer } from "@aspect-build/trace-viewer";

const server = await createServer({
  port: 3000,
  filePath: "./logs/cache-trace.jsonl",
  watch: true,
});

const { url } = await server.start();
console.log(`Viewer running at ${url}`);

// Later...
await server.stop();
```

### Types

The package exports all type definitions for building custom integrations:

```typescript
import type { TraceEntry, TraceSummary, TraceToolDef } from "@aspect-build/trace-viewer/types";
```

## Development

```bash
# Clone the repo
git clone https://github.com/wisetwo/trace-viewer.git
cd trace-viewer

# Install dependencies
npm install

# Start dev server (Vite HMR for UI, proxy to Express backend)
npm run dev

# In another terminal, start the Express backend
npx ts-node --esm src/cli/index.ts ./path/to/your/trace.jsonl

# Build for production
npm run build

# Type check
npm run typecheck
```

### Architecture

```
trace-viewer/
├── bin/                  # CLI entry point (shim)
├── src/
│   ├── cli/              # Commander CLI definition
│   ├── server/           # Express HTTP server + JSONL reader
│   ├── shared/           # Shared TypeScript types
│   └── ui/               # Lit web components (built by Vite)
├── dist/                 # Build output (git-ignored)
├── tsconfig.json         # Base TS config (UI + shared)
├── tsconfig.server.json  # Server-only TS config
└── vite.config.ts        # Vite config (UI build)
```

- **Server** (`src/server/`): Express app with REST API for reading and paginating JSONL entries. Serves the built UI as static files.
- **UI** (`src/ui/`): Single-page app built with [Lit](https://lit.dev/) web components. Features a table view, detail modal, theme system, and image lightbox.
- **CLI** (`src/cli/`): Thin wrapper using [Commander](https://github.com/tj/commander.js) that starts the server and optionally opens the browser.

## License

MIT
