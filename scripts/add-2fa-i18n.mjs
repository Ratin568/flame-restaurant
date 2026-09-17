// scripts\add-2fa-i18n.mjs
import fs from 'node:fs';

const en = JSON.parse(fs.readFileSync('src/messages/en.json', 'utf8'));

for (const file of fs.readdirSync('src/messages')) {
  if (!file.endsWith('.json') || ['en.json', 'fa.json'].includes(file)) continue;
  const path = `src/messages/${file}`;
  const data = JSON.parse(fs.readFileSync(path, 'utf8'));
  data.auth.errors.tooManyAttempts = en.auth.errors.tooManyAttempts;
  fs.writeFileSync(path, JSON.stringify(data, null, 2) + '\n');
  console.log(`✅ ${file}`);
}