import {spawn} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {setTimeout as delay} from 'node:timers/promises';

const port = Number(process.env.FLAME_SMOKE_PORT || 3100);
const base = `http://127.0.0.1:${port}`;
const nextBin = fileURLToPath(new URL('../node_modules/next/dist/bin/next', import.meta.url));
const server = spawn(process.execPath, [nextBin, 'start', '--hostname', '127.0.0.1', '--port', String(port)], {
  stdio: 'inherit',
  env: {...process.env, PORT: String(port)},
});

async function waitUntilReady() {
  const deadline = Date.now() + 60_000;
  while (Date.now() < deadline) {
    if (server.exitCode !== null) throw new Error(`Next server exited with code ${server.exitCode}`);
    try {
      const response = await fetch(`${base}/api/health`, {signal: AbortSignal.timeout(1500)});
      if (response.status === 200 || response.status === 503) return;
    } catch {}
    await delay(500);
  }
  throw new Error('Next server did not become ready within 60 seconds');
}

async function assertRoute(path, predicate = () => true) {
  const response = await fetch(`${base}${path}`, {redirect: 'follow', signal: AbortSignal.timeout(15_000)});
  const body = await response.text();
  if (!predicate(response, body)) throw new Error(`${path} failed smoke check (HTTP ${response.status})`);
  console.log(`PASS ${path}: HTTP ${response.status}`);
}

try {
  await waitUntilReady();
  await assertRoute('/', (r) => r.status === 200);
  await assertRoute('/fa', (r) => r.status === 200);
  await assertRoute('/robots.txt', (r, body) => r.status === 200 && body.includes('/admin') && body.includes('sitemap.xml'));
  await assertRoute('/sitemap.xml', (r, body) => r.status === 200 && body.includes('urlset') && body.includes('xhtml:link'));
  await assertRoute('/llms.txt', (r, body) => r.status === 200 && body.includes('# Flame') && !body.includes('500,000+'));
  await assertRoute('/fa/checkout', (r, body) => r.status === 200 && /name="robots"[^>]*noindex|name="robots"[^>]*noarchive/i.test(body));
  const health = await fetch(`${base}/api/health`, {signal: AbortSignal.timeout(5000)});
  if (health.status !== 200) throw new Error(`Health endpoint returned ${health.status}`);
  const healthBody = await health.json();
  if (healthBody.status !== 'ok' || healthBody.checks?.database !== 'up') throw new Error('Health endpoint did not report database up');
  console.log('PASS /api/health: database up');
} catch (error) {
  console.error('HTTP smoke test failed:', error);
  process.exitCode = 1;
} finally {
  server.kill('SIGTERM');
  await Promise.race([new Promise((resolve) => server.once('exit', resolve)), delay(5000)]);
  if (server.exitCode === null) server.kill('SIGKILL');
}
