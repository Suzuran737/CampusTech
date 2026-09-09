const fs = require('fs');
const path = require('path');

const envFile = path.join(__dirname, '..', 'backend', '.env');

if (!fs.existsSync(envFile)) {
  console.error('Missing backend/.env');
  process.exit(1);
}

const content = fs.readFileSync(envFile, 'utf8');
const match = content.match(/DATABASE_URL\s*=\s*["']?([^\r\n"']+)/);

if (!match) {
  console.error('DATABASE_URL not found in backend/.env');
  process.exit(1);
}

const url = match[1];

if (url.includes('YOUR_PASSWORD')) {
  console.error('Replace YOUR_PASSWORD in backend/.env with your real password.');
  process.exit(1);
}

const passwordMatch = url.match(/^postgresql:\/\/[^:]+:([^@]+)@/);
const dbMatch = url.match(/\/([^/?]+)(?:\?|$)/);

if (!passwordMatch) {
  console.error('Could not parse password from DATABASE_URL');
  process.exit(1);
}

const password = passwordMatch[1];
const database = dbMatch ? dbMatch[1] : 'campustech';

process.stdout.write(`${password}|${database}`);
