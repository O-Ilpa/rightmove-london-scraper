import fs from "node:fs/promises";
import path from "node:path";
import { parse } from "csv-parse/sync";
import { stringify } from "csv-stringify/sync";
import { CSV_COLUMNS } from "../scraper/utils.js";

function cleanValue(value) {
  if (value === null || value === undefined) return "";
  const text = value instanceof Date ? value.toISOString() : String(value);
  return text.replace(/\s*[\r\n]+\s*/g, " ").trim();
}

function listingToRecord(listing) {
  return Object.fromEntries(
    CSV_COLUMNS.map((col) => [col, cleanValue(listing[col])]),
  );
}

export function createCsvWriter(csvPath, logger) {
  const existingIds = new Set();
  let hasHeader = false;

  async function init() {
    await fs.mkdir(path.dirname(csvPath), { recursive: true });

    try {
      const content = await fs.readFile(csvPath, "utf8");
      hasHeader = content.trim().length > 0;

      if (hasHeader) {
        const records = parse(content, {
          columns: true,
          skip_empty_lines: true,
        });

        for (const record of records) {
          if (record.sourceListingId) existingIds.add(record.sourceListingId);
        }
      }

      logger.info(`CSV file: ${csvPath} (${existingIds.size} listings)`);
    } catch (error) {
      if (error.code === "ENOENT") {
        logger.info(`CSV file: ${csvPath} (new)`);
      } else {
        throw error;
      }
    }
  }

  async function saveListing(listing) {
    const id = listing.sourceListingId;
    if (existingIds.has(id)) return false;

    const csv = stringify([listingToRecord(listing)], {
      header: !hasHeader,
      columns: CSV_COLUMNS,
    });

    await fs.appendFile(csvPath, csv, "utf8");

    existingIds.add(id);
    hasHeader = true;
    return true;
  }

  return { init, saveListing };
}
