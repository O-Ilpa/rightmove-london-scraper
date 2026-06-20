import fs from "node:fs/promises";
import { loadConfig, createLogger } from "./scraper/utils.js";
import { runLondonCrawlCycle } from "./scraper/scrapeLondon.js";

async function main() {
  const config = loadConfig();
  const logger = createLogger();

  await fs.mkdir(config.dataDir, { recursive: true });
  logger.info(`CSV mode -> ${config.csvPath}`);

  const summary = await runLondonCrawlCycle({
    config,
    logger,
    output: "csv",
    csvPath: config.csvPath,
  });

  console.log(`\nStopped: ${summary.stopReason}`);
  console.log(
    `Saved ${summary.listingsSaved} listings across ${summary.pagesScraped} pages`,
  );
}

main().catch((error) => {
  console.error("CSV scraper crashed:", error.message);
  process.exit(1);
});
