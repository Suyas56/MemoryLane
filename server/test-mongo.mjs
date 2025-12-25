import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

const raw = process.env.MONGODB_URI;
function mask(uri) {
  if (!uri) return '<empty>';
  if (uri.length <= 30) return uri.replace(/.(?=.{4})/g, '*');
  return uri.slice(0, 12) + '...' + uri.slice(-12);
}

if (!raw) {
  console.error('MONGODB_URI not set in server/.env');
  process.exit(1);
}

const variants = [];
variants.push(raw);

// If there's no DB name path (i.e., ends with / or ?...), try adding the expected DB name
if (!/\/[^\/?]+(\?|$)/.test(raw)) {
  variants.push(raw.replace(/\/?(\?.*)?$/, '/memorylane$1'));
}

// add common options
variants.push(raw + (raw.includes('?') ? '&' : '?') + 'retryWrites=true&w=majority');
variants.push(raw + (raw.includes('?') ? '&' : '?') + 'authSource=admin');

async function tryConnect(uri) {
  console.log('Trying:', mask(uri));
  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
    console.log('-> Connected!');
    await mongoose.disconnect();
    return true;
  } catch (err) {
    console.error('-> Error:', err.message);
    return false;
  }
}

(async () => {
  for (const v of variants) {
    await tryConnect(v);
  }
  process.exit(0);
})();
