import fs from "node:fs/promises";
import path from "node:path";
import { Listing } from "../models/Listing.js";
import { createCsvWriter } from "../storage/csvWriter.js";
import { fetchRightmovePage } from "./rightmoveClient.js";
import { parseListing, getPropertyId } from "./parseListing.js";

const CHECKPOINT_FILE = "scraper-state.json";
const DUPLICATE_PAGE_THRESHOLD = 0.9;

async function loadCheckpoint(dataDir) {
  try {
    const raw = await fs.readFile(path.join(dataDir, CHECKPOINT_FILE), "utf8");
    return JSON.parse(raw);
  } catch {
    return { lastIndex: 0, cycleInProgress: false };
  }
}

async function saveCheckpoint(dataDir, state) {
  await fs.mkdir(dataDir, { recursive: true });
  await fs.writeFile(
    path.join(dataDir, CHECKPOINT_FILE),
    JSON.stringify({ ...state, updatedAt: new Date().toISOString() }, null, 2),
  );
}

function getStartIndex(checkpoint) {
  return checkpoint.cycleInProgress && checkpoint.lastIndex > 0
    ? checkpoint.lastIndex
    : 0;
}

async function saveListingMongo(listing) {
  try {
    const result = await Listing.findOneAndUpdate(
      { sourceListingId: listing.sourceListingId },
      { $set: { ...listing, lastSeenAt: new Date() } },
      {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true,
        includeResultMetadata: true,
      },
    );

    return { wasExisting: Boolean(result.lastErrorObject?.updatedExisting) };
  } catch (error) {
    if (error.code !== 11000) throw error;

    await Listing.findOneAndUpdate(
      { sourceListingId: listing.sourceListingId },
      { $set: { ...listing, lastSeenAt: new Date() } },
      { new: true },
    );

    return { wasExisting: true };
  }
}

export async function runLondonCrawlCycle({ config, logger, output, csvPath }) {
  const pageSize = 24;
  const maxPages = config.maxPagesPerCycle;
  const csvMode = output === "csv";

  let csvWriter = null;
  if (csvMode) {
    csvWriter = createCsvWriter(csvPath, logger);
    await csvWriter.init();
  }

  const checkpoint = await loadCheckpoint(config.dataDir);
  let index = getStartIndex(checkpoint);

  if (index > 0) {
    logger.warn(`Resuming from index ${index}`);
  } else {
    logger.info("Starting crawl...");
  }

  await saveCheckpoint(config.dataDir, {
    lastIndex: index,
    cycleInProgress: true,
  });

  let pagesScraped = 0;
  let listingsSaved = 0;
  let listingsInserted = 0;
  let listingsUpdated = 0;
  let stopReason = null;

  const pageSignatures = new Set();
  const seenIds = new Set();

  while (true) {
    if (maxPages > 0 && pagesScraped >= maxPages) {
      stopReason = "max_pages";
      logger.warn(`Stopped: hit page limit (${maxPages})`);
      break;
    }

    let data;
    try {
      data = await fetchRightmovePage(index);
    } catch (error) {
      stopReason = error.code ?? "fetch_error";
      logger.error(`Stopped: ${error.message}`);
      break;
    }

    // No more results, Rightmove returns {"notFound":true}
    if (data.notFound === true) {
      stopReason = "not_found";
      logger.info("Done: no more results");
      break;
    }

    const properties = data?.properties ?? [];
    if (properties.length === 0) {
      stopReason = "empty_page";
      logger.info(`Done: empty page at index ${index}`);
      break;
    }

    const pageIds = properties.map(getPropertyId).filter(Boolean);
    const signature = pageIds.join(",");

    if (pageSignatures.has(signature)) {
      stopReason = "duplicate_page";
      logger.warn("Stopped: duplicate page");
      break;
    }
    pageSignatures.add(signature);

    const dupes = pageIds.filter((id) => seenIds.has(id)).length;
    if (
      pagesScraped > 0 &&
      dupes / pageIds.length >= DUPLICATE_PAGE_THRESHOLD
    ) {
      stopReason = "mostly_duplicates";
      logger.warn("Stopped: mostly duplicate listings");
      break;
    }

    let pageSaved = 0;
    let pageInserted = 0;
    let pageUpdated = 0;
    for (const property of properties) {
      const listing = parseListing(property);
      if (!listing.sourceListingId) continue;

      try {
        if (csvMode) {
          const written = await csvWriter.saveListing(listing);
          if (written) {
            pageSaved++;
            listingsSaved++;
          }
        } else {
          const { wasExisting } = await saveListingMongo(listing);
          if (wasExisting) {
            pageUpdated++;
            listingsUpdated++;
            logger.info(
              `Already scraped ${listing.sourceListingId}; updated data`,
            );
          } else {
            pageInserted++;
            listingsInserted++;
          }
          pageSaved++;
          listingsSaved++;
        }
        seenIds.add(listing.sourceListingId);
      } catch (error) {
        logger.error(
          `Failed to save ${listing.sourceListingId}: ${error.message}`,
        );
      }
    }

    pagesScraped++;
    const pageNum = Math.floor(index / pageSize) + 1;
    if (csvMode) {
      logger.info(
        `Page ${pageNum}: saved ${pageSaved} new listings (${listingsSaved} total)`,
      );
    } else {
      logger.info(
        `Page ${pageNum}: saved ${pageSaved} listings (${pageInserted} new, ${pageUpdated} updated; ${listingsSaved} total)`,
      );
    }

    index += pageSize;
    await saveCheckpoint(config.dataDir, {
      lastIndex: index,
      cycleInProgress: true,
    });
  }

  await saveCheckpoint(config.dataDir, {
    lastIndex: 0,
    cycleInProgress: false,
  });

  logger.info(
    `Cycle finished: ${listingsSaved} listings across ${pagesScraped} pages`,
  );
  if (!csvMode) {
    logger.info(
      `Mongo summary: ${listingsInserted} new, ${listingsUpdated} already scraped and updated`,
    );
  }

  return { stopReason: stopReason ?? "done", pagesScraped, listingsSaved };
}
