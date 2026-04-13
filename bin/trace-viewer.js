#!/usr/bin/env node

// CLI entry point - calls the compiled TypeScript CLI
import("../dist/cli/index.js").catch((err) => {
  console.error("Failed to load CLI:", err.message);
  console.error("Run 'npm run build' first to compile the TypeScript files.");
  process.exit(1);
});
