import fs from "node:fs/promises";
import { connectDb, disconnectDb, isDbConnected } from "./db.js";
import { Listing } from "./models/Listing.js";
import { loadConfig, createLogger } from "./scraper/utils.js";
import { runLondonCrawlCycle } from "./scraper/scrapeLondon.js";

async function main() {
  const config = loadConfig();
  const logger = createLogger();

  await fs.mkdir(config.dataDir, { recursive: true });

  if (!config.mongodbUri) {
    console.error(
      "MONGODB_URI is not set. Use npm run scrape:csv for CSV output.",
    );
    process.exit(1);
  }

  await connectDb(config.mongodbUri, logger);
  await Listing.init();

  const summary = await runLondonCrawlCycle({
    config,
    logger,
    output: "mongo",
  });

  if (isDbConnected()) await disconnectDb(logger);

  console.log(`\nStopped: ${summary.stopReason}`);
  console.log(
    `Saved ${summary.listingsSaved} listings across ${summary.pagesScraped} pages`,
  );
}

main().catch((error) => {
  console.error("Scraper crashed:", error.message);
  process.exit(1);
});
