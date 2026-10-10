import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';

const required = [
  'src/features/checkout/pricing.ts',
  'src/features/checkout/pricing-math.ts',
  'src/features/reservations/actions.ts',
  'src/lib/validation/reservation-date-time.ts',
  'src/lib/auth/permissions.ts',
  'src/features/payments/core/complete.ts',
  'src/lib/auth/session.ts',
  'src/lib/email.ts',
  'src/app/api/health/route.ts',
  'src/app/[locale]/loading.tsx',
  'src/app/[locale]/error.tsx',
  'src/app/admin/loading.tsx',
  'src/app/admin/error.tsx',
  'src/lib/seo/url.ts',
  'tests/integration/database-smoke.ts',
  'scripts/http-smoke.mjs',
  'prisma/schema.prisma',
  'docker-compose.yml',
];
let failed = false;
for (const file of required) {
  const exists = fs.existsSync(file);
  console.log(`${exists ? 'PASS' : 'FAIL'} required file: ${file}`);
  if (!exists) failed = true;
}
const envFiles = ['.env', '.env.local', '.env.production'];
let trackedEnvFiles = [];
try {
  trackedEnvFiles = execFileSync('git', ['ls-files', '--', ...envFiles], {
    encoding: 'utf8',
  }).split(/\r?\n/).filter(Boolean);
} catch {
  console.error('FAIL: could not verify tracked environment files with Git');
  failed = true;
}
for (const envFile of envFiles) {
  if (trackedEnvFiles.includes(envFile)) {
    console.error('FAIL: secret-bearing environment file is tracked by Git: ' + envFile);
    failed = true;
  } else {
    console.log('PASS environment file is not tracked by Git: ' + envFile);
  }
}
const migrations = fs.readdirSync('prisma/migrations');
const migration = migrations.find((name) => name === '20261009000000_v14_hardening');
console.log(`${migration ? 'PASS' : 'FAIL'} v14 hardening migration is present`);
if (!migration) failed = true;
// Focused accessibility/security regressions that can be checked without browser tooling.
const textFiles = [];
function walk(dir) {
  for (const entry of fs.readdirSync(dir, {withFileTypes: true})) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (/\.(tsx|ts|css)$/.test(entry.name)) textFiles.push(full);
  }
}
walk('src');
const source = textFiles.map((file) => fs.readFileSync(file, 'utf8')).join('\n');
const checks = [
  ['skip link exists', source.includes('Skip to main content') && source.includes('id=\"main-content\"')],
  ['reduced motion CSS exists', source.includes('prefers-reduced-motion: reduce')],
  ['focus-visible CSS exists', source.includes(':focus-visible')],
  ['JSON-LD uses safe serializer', fs.readFileSync('src/lib/seo/schema.tsx', 'utf8').includes('serializeJsonLd(data)')],
  ['SEO URL tests exist', fs.readFileSync('tests/unit/core-logic.test.mjs', 'utf8').includes('hreflang URLs include each locale')],
  ['private pages are noindex', fs.readFileSync('src/app/[locale]/(shop)/checkout/page.tsx', 'utf8').includes('index:false') && fs.readFileSync('src/app/[locale]/account/layout.tsx', 'utf8').includes('index: false')],
  ['database integration test is wired to CI', fs.readFileSync('.github/workflows/ci.yml', 'utf8').includes('npm run test:integration')],
  ['HTTP smoke test is wired after build', fs.readFileSync('.github/workflows/ci.yml', 'utf8').includes('npm run test:smoke')],
  ['native img elements provide alt text', !/<img\b(?![^>]*\balt\s*=)[^>]*>/is.test(source)],
  ['target blank anchors use noopener', !/<a\b(?=[^>]*\btarget=[\"']_blank[\"'])(?![^>]*\brel=[\"'][^\"']*noopener)[^>]*>/is.test(source)],
];
for (const [label, passed] of checks) {
  console.log(`${passed ? 'PASS' : 'FAIL'} ${label}`);
  if (!passed) failed = true;
}
if (failed) process.exitCode = 1;
else console.log('Static repository checks passed. These checks do not substitute for TypeScript, ESLint, build, database, or browser tests.');
