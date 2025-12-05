const fs = require('fs');
const path = require('path');

function filePath(name) {
  const dir = path.join(__dirname, '..', 'data');
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  return path.join(dir, name + '.json');
}

function read(name) {
  const p = filePath(name);
  try {
    const raw = fs.readFileSync(p, 'utf8');
    return JSON.parse(raw);
  } catch (e) {
    return [];
  }
}

function write(name, data) {
  const p = filePath(name);
  fs.writeFileSync(p, JSON.stringify(data, null, 2), 'utf8');
}

module.exports = { read, write };
