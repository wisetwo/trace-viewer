/**
 * Express HTTP Server
 * Provides REST API for trace data and serves static UI files
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { Socket } from "node:net";
import express, { type Express, type Request, type Response } from "express";
import { TraceReader, resolveTraceFile } from "./trace-reader.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export interface ServerOptions {
  port: number;
  filePath: string;
  watch?: boolean;
}

export interface ServerInstance {
  app: Express;
  start: () => Promise<{ url: string }>;
  stop: () => Promise<void>;
}

/**
 * Create and configure the Express server
 */
export async function createServer(options: ServerOptions): Promise<ServerInstance> {
  const { port, filePath, watch = false } = options;

  // Resolve the trace file path
  const resolvedPath = await resolveTraceFile(filePath);
  const reader = new TraceReader({ filePath: resolvedPath });

  // Setup file watcher if enabled
  let watcher: fs.FSWatcher | null = null;
  if (watch) {
    watcher = fs.watch(resolvedPath, () => {
      reader.invalidateCache();
    });
  }

  const app = express();

  // Parse JSON body
  app.use(express.json());

  // API routes
  app.get("/api/trace", async (req: Request, res: Response) => {
    try {
      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      const pageSize = req.query.pageSize ? parseInt(req.query.pageSize as string, 10) : 50;
      const summaryOnly = req.query.summaryOnly !== "false";
      const seq = req.query.seq ? parseInt(req.query.seq as string, 10) : undefined;

      // If seq is provided, return single entry
      if (seq !== undefined) {
        const entry = await reader.getEntryBySeq(seq);
        if (entry) {
          res.json({ entry });
        } else {
          res.status(404).json({ error: `Entry with seq ${seq} not found` });
        }
        return;
      }

      // Otherwise return paginated list
      const result = await reader.readPaginated({ page, pageSize, summaryOnly });
      res.json(result);
    } catch (err) {
      console.error("Error reading trace:", err);
      res.status(500).json({ error: String(err) });
    }
  });

  // Health check
  app.get("/api/health", (_req: Request, res: Response) => {
    res.json({ status: "ok", file: reader.getFilePath() });
  });

  // Serve static UI files
  const uiDir = path.resolve(__dirname, "../ui");
  if (fs.existsSync(uiDir)) {
    app.use(express.static(uiDir));

    // SPA fallback - serve index.html for any non-API routes
    app.get("*", (req: Request, res: Response) => {
      if (!req.path.startsWith("/api/")) {
        res.sendFile(path.join(uiDir, "index.html"));
      } else {
        res.status(404).json({ error: "Not found" });
      }
    });
  } else {
    // Development mode - provide a simple message
    app.get("/", (_req: Request, res: Response) => {
      res.send(`
        <html>
          <head><title>Trace Viewer - Dev Mode</title></head>
          <body>
            <h1>LLM Trace Viewer</h1>
            <p>UI not built. Run <code>npm run build:ui</code> first.</p>
            <p>Or run <code>npm run dev</code> for development with Vite.</p>
            <h2>API Endpoints</h2>
            <ul>
              <li><a href="/api/health">/api/health</a> - Health check</li>
              <li><a href="/api/trace">/api/trace</a> - Get trace entries</li>
              <li><a href="/api/trace?page=1&pageSize=10">/api/trace?page=1&pageSize=10</a> - Paginated</li>
              <li><a href="/api/trace?seq=1">/api/trace?seq=1</a> - Single entry by seq</li>
            </ul>
            <p>Trace file: <code>${reader.getFilePath()}</code></p>
          </body>
        </html>
      `);
    });
  }

  let server: ReturnType<typeof app.listen> | null = null;
  const sockets = new Set<Socket>();

  const trackServerConnections = (nextServer: ReturnType<typeof app.listen>) => {
    nextServer.on("connection", (socket) => {
      sockets.add(socket);
      socket.once("close", () => {
        sockets.delete(socket);
      });
    });
  };

  const destroyTrackedSockets = () => {
    for (const socket of sockets) {
      socket.destroy();
    }
    sockets.clear();
  };

  return {
    app,
    start: () =>
      new Promise((resolve, reject) => {
        let currentPort = port;

        const startListening = () => {
          try {
            const nextServer = app.listen(currentPort);
            server = nextServer;
            trackServerConnections(nextServer);

            const cleanup = () => {
              nextServer.off("listening", handleListening);
              nextServer.off("error", handleError);
            };

            const handleListening = () => {
              cleanup();
              const url = `http://localhost:${currentPort}`;
              console.log(`\n  🔍 LLM Trace Viewer`);
              console.log(`  ───────────────────────────────`);
              console.log(`  📁 File:   ${reader.getFilePath()}`);
              console.log(`  🌐 URL:    ${url}`);
              if (watch) {
                console.log(`  👀 Watch:  enabled`);
              }
              console.log(`  ───────────────────────────────\n`);
              resolve({ url });
            };

            const handleError = (err: NodeJS.ErrnoException) => {
              cleanup();

              if (err.code === "EADDRINUSE") {
                if (currentPort >= 65535) {
                  reject(new Error(`No available port found starting from ${port}`));
                  return;
                }

                const occupiedPort = currentPort;
                currentPort += 1;
                console.warn(`Port ${occupiedPort} is already in use, trying ${currentPort}...`);
                startListening();
                return;
              }

              reject(err);
            };

            nextServer.once("listening", handleListening);
            nextServer.once("error", handleError);
          } catch (err) {
            reject(err);
          }
        };

        startListening();
      }),
    stop: () =>
      new Promise((resolve) => {
        if (watcher) {
          watcher.close();
          watcher = null;
        }

        if (!server) {
          destroyTrackedSockets();
          resolve();
          return;
        }

        const currentServer = server;
        server = null;
        let finished = false;

        const finish = () => {
          if (finished) {
            return;
          }
          finished = true;
          clearTimeout(forceCloseTimer);
          resolve();
        };

        const forceCloseTimer = setTimeout(() => {
          if (typeof currentServer.closeAllConnections === "function") {
            currentServer.closeAllConnections();
          }
          destroyTrackedSockets();
          finish();
        }, 500);
        forceCloseTimer.unref();

        currentServer.close(() => {
          destroyTrackedSockets();
          finish();
        });

        if (typeof currentServer.closeIdleConnections === "function") {
          currentServer.closeIdleConnections();
        }
        if (typeof currentServer.closeAllConnections === "function") {
          currentServer.closeAllConnections();
        }
        destroyTrackedSockets();
      }),
  };
}
