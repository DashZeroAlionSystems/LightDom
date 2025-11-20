import { spawn } from 'child_process';
import { cp, mkdir, rm, stat } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const DIST_DIR = path.join(ROOT_DIR, 'dist');

const COPY_TARGETS = [
  'api',
  'api-mining-routes.js',
  'api-server-express.js',
  'crawler',
  'services',
  'utils',
  'minimal-api-server-local.js',
  'minimal-api-server-proxy.js',
  'scripts/start-crawler-service.js',
  'scripts/run-ocr-worker.js',
  'scripts/test-loop.js',
  'scripts/start-deepseek-service.js',
];

async function pathExists(target) {
  try {
    await stat(target);
    return true;
  } catch (error) {
    if (error.code === 'ENOENT') {
      return false;
    }
    throw error;
  }
}

async function copyTarget(relativePath) {
  const source = path.join(ROOT_DIR, relativePath);
  if (!(await pathExists(source))) {
    return;
  }

  const destination = path.join(DIST_DIR, relativePath);
  await mkdir(path.dirname(destination), { recursive: true });
  await cp(source, destination, { recursive: true });
}

async function runTypeScriptBuild() {
  const npxCmd = process.platform === 'win32' ? 'npx.cmd' : 'npx';

  await new Promise((resolve, reject) => {
    const child = spawn(npxCmd, ['tsc', '-p', 'tsconfig.server.json'], {
      cwd: ROOT_DIR,
      stdio: 'inherit',
      shell: process.platform === 'win32',
    });

    child.on('exit', code => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`tsc exited with code ${code}`));
      }
    });

    child.on('error', reject);
  });
}

async function build() {
  await rm(DIST_DIR, { recursive: true, force: true });
  await mkdir(DIST_DIR, { recursive: true });

  for (const target of COPY_TARGETS) {
    await copyTarget(target);
  }

  await runTypeScriptBuild();

  console.log('Server build completed to', DIST_DIR);
}

build().catch(error => {
  console.error('Server build failed:', error);
  process.exit(1);
});
