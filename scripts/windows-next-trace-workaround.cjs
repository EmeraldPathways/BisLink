const fs = require('fs');
const os = require('os');
const path = require('path');

// Redirect only Next's local build trace file to temp storage on Windows synced workspaces.
// The rest of the build output stays in the normal repo paths.
const tempTraceDir = path.join(os.tmpdir(), 'bislink-next-trace');
const tempTracePath = path.join(tempTraceDir, 'trace');

fs.mkdirSync(tempTraceDir, { recursive: true });

try {
  fs.unlinkSync(tempTracePath);
} catch (error) {
  if (error && error.code !== 'ENOENT') {
    throw error;
  }
}

function shouldRedirect(target) {
  return (
    typeof target === 'string' &&
    path.basename(target) === 'trace' &&
    target.startsWith(process.cwd())
  );
}

function resolveTarget(target) {
  return shouldRedirect(target) ? tempTracePath : target;
}

const originalCreateWriteStream = fs.createWriteStream.bind(fs);
const originalCreateReadStream = fs.createReadStream.bind(fs);
const originalUnlinkSync = fs.unlinkSync.bind(fs);
const originalStatSync = fs.statSync.bind(fs);
const originalExistsSync = fs.existsSync.bind(fs);
const originalReadFileSync = fs.readFileSync.bind(fs);

fs.createWriteStream = (target, ...args) => originalCreateWriteStream(resolveTarget(target), ...args);
fs.createReadStream = (target, ...args) => originalCreateReadStream(resolveTarget(target), ...args);
fs.unlinkSync = (target, ...args) => originalUnlinkSync(resolveTarget(target), ...args);
fs.statSync = (target, ...args) => originalStatSync(resolveTarget(target), ...args);
fs.existsSync = (target, ...args) => originalExistsSync(resolveTarget(target), ...args);
fs.readFileSync = (target, ...args) => originalReadFileSync(resolveTarget(target), ...args);
