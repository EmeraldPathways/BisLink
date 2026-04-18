#!/usr/bin/env node

if (process.platform === 'win32') {
  // In synced Windows workspaces, Next's trace file writer can fail on the in-repo build trace path.
  // This shim only adjusts that trace writer during local Windows builds.
  require('./windows-next-trace-workaround.cjs');
}

process.argv = ['node', 'next', 'build', ...process.argv.slice(2)];
require('next/dist/bin/next');
