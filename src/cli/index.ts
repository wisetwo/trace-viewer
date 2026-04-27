#!/usr/bin/env node
/**
 * CLI Entry Point for LLM Trace Viewer
 */

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { Command } from "commander";
import { createServer } from "../server/index.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const pkg = JSON.parse(readFileSync(resolve(__dirname, "../../package.json"), "utf8"));

const program = new Command();

program
  .name("llm-trace-viewer")
  .description("View LLM request trace logs in a web UI")
  .version(pkg.version, "-v, --version", "Show version number")
  .helpOption("-h, --help", "Show help information")
  .showHelpAfterError()
  .argument("<path>", "Path to trace file (.jsonl) or directory")
  .option("-p, --port <number>", "Port to listen on", "3000")
  .option("--no-open", "Do not open browser automatically")
  .option("-w, --watch", "Watch file for changes and auto-refresh")
  .action(async (inputPath: string, options: { port: string; open: boolean; watch: boolean }) => {
    const port = parseInt(options.port, 10);

    if (isNaN(port) || port < 1 || port > 65535) {
      console.error(`Invalid port number: ${options.port}`);
      process.exit(1);
    }

    try {
      const server = await createServer({
        port,
        filePath: inputPath,
        watch: options.watch,
      });

      const { url } = await server.start();

      // Open browser if not disabled
      if (options.open) {
        // Dynamic import for open (ESM)
        const open = (await import("open")).default;
        await open(url);
      }

      // Handle graceful shutdown
      const shutdown = async () => {
        console.log("\n\nShutting down...");
        await server.stop();
        process.exit(0);
      };

      process.on("SIGINT", shutdown);
      process.on("SIGTERM", shutdown);
    } catch (err) {
      console.error(`Error: ${err instanceof Error ? err.message : String(err)}`);
      process.exit(1);
    }
  });

program.parse();
