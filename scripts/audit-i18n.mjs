import fs from 'node:fs';
import path from 'node:path';

const dir = 'src/messages';
const files = fs.readdirSync(dir).filter((file) => file.endsWith('.json')).sort();
const locales = Object.fromEntries(files.map((file) => [path.basename(file, '.json'), JSON.parse(fs.readFileSync(path.join(dir, file), 'utf8'))]));
const referenceLocale = locales.en;
if (!referenceLocale) throw new Error('src/messages/en.json is required as the reference locale');

function flatten(value, prefix = '') {
  const result = new Set();
  for (const [key, child] of Object.entries(value)) {
    const next = prefix ? `${prefix}.${key}` : key;
    if (child && typeof child === 'object' && !Array.isArray(child)) {
      for (const nested of flatten(child, next)) result.add(nested);
    } else result.add(next);
  }
  return result;
}

const expected = flatten(referenceLocale);
let failed = false;
for (const [locale, data] of Object.entries(locales)) {
  const actual = flatten(data);
  const missing = [...expected].filter((key) => !actual.has(key));
  const extra = [...actual].filter((key) => !expected.has(key));
  console.log(`${locale}: ${actual.size} leaf keys; missing=${missing.length}; extra=${extra.length}`);
  if (missing.length || extra.length) {
    failed = true;
    if (missing.length) console.error(`  Missing: ${missing.slice(0, 30).join(', ')}`);
    if (extra.length) console.error(`  Extra: ${extra.slice(0, 30).join(', ')}`);
  }
}
if (failed) process.exitCode = 1;
else console.log(`i18n audit passed for ${files.length} locales (${expected.size} reference keys).`);
