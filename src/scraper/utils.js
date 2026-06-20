import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, '../..');

dotenv.config({ path: path.join(PROJECT_ROOT, '.env') });

export function loadConfig() {
  return {
    mongodbUri: process.env.MONGODB_URI ?? process.env.MONGO_URI,
    maxPagesPerCycle: Number(process.env.MAX_PAGES_PER_CYCLE ?? 0),
    projectRoot: PROJECT_ROOT,
    dataDir: path.join(PROJECT_ROOT, 'data'),
    csvPath: path.join(PROJECT_ROOT, 'data', 'listings.csv'),
  };
}

export function createLogger() {
  return {
    info: (msg) => console.log(msg),
    warn: (msg) => console.warn(msg),
    error: (msg) => console.error(msg),
  };
}

export const CSV_COLUMNS = [
  'sourceListingId',
  'address',
  'askingPrice',
  'askingPriceDisplay',
  'propertyType',
  'bedrooms',
  'bathrooms',
  'estateAgent',
  'estateAgentPhone',
  'propertyUrl',
  'latitude',
  'longitude',
  'firstVisibleDate',
  'updateDate',
  'scrapedAt',
  'lastSeenAt',
];
