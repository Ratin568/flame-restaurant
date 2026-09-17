import fs from 'node:fs';

const en = JSON.parse(fs.readFileSync('src/messages/en.json', 'utf8'));

for (const file of fs.readdirSync('src/messages')) {
  if (!file.endsWith('.json') || ['en.json', 'fa.json'].includes(file)) continue;
  const path = `src/messages/${file}`;
  const data = JSON.parse(fs.readFileSync(path, 'utf8'));
  data.reviews = en.reviews;
  fs.writeFileSync(path, JSON.stringify(data, null, 2) + '\n');
  console.log(`✅ ${file}`);
}