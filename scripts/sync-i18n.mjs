// تمام کلیدهای en.json را در همه فایل‌های زبان sync می‌کند
// ترجمه‌های موجود حفظ می‌شوند؛ فقط کلیدهای گمشده از en پر می‌شوند
import fs from 'node:fs';

const en = JSON.parse(fs.readFileSync('src/messages/en.json', 'utf8'));

function deepMerge(target, source, path = '') {
  let added = 0;
  for (const key of Object.keys(source)) {
    const keyPath = path ? `${path}.${key}` : key;
    if (!(key in target)) {
      target[key] = source[key];
      added++;
      console.log(`   ➕ ${keyPath}`);
    } else if (
      typeof source[key] === 'object' && source[key] !== null && !Array.isArray(source[key]) &&
      typeof target[key] === 'object' && target[key] !== null && !Array.isArray(target[key])
    ) {
      added += deepMerge(target[key], source[key], keyPath);
    }
  }
  return added;
}

for (const file of fs.readdirSync('src/messages')) {
  if (!file.endsWith('.json')) continue;
  const path = `src/messages/${file}`;
  const data = JSON.parse(fs.readFileSync(path, 'utf8'));
  const added = deepMerge(data, en);
  if (added > 0) {
    fs.writeFileSync(path, JSON.stringify(data, null, 2) + '\n');
    console.log(`🔧 ${file}: ${added} کلید از en.json اضافه شد`);
  } else {
    console.log(`✅ ${file}: کامل است`);
  }
}