# Rightmove London Scraper

Scrapes London property listings from Rightmove into MongoDB or CSV.

## Setup

```bash
npm install
cp .env.example .env   # add your MONGODB_URI for MongoDB mode
```

## Run

```bash
npm start              # scrape to MongoDB, then exit
npm run scrape:csv     # scrape to data/listings.csv, then exit
```

Exits when Rightmove returns `{"notFound": true}`.

Example csv output:

|sourceListingId|address                                   |askingPrice|askingPriceDisplay|propertyType|bedrooms|bathrooms|estateAgent                          |estateAgentPhone|propertyUrl                                                             |latitude |longitude|firstVisibleDate        |updateDate              |scrapedAt               |lastSeenAt              |
|---------------|------------------------------------------|-----------|------------------|------------|--------|---------|-------------------------------------|----------------|------------------------------------------------------------------------|---------|---------|------------------------|------------------------|------------------------|------------------------|
|89777412       |Danehurst Street, London, SW6             |775000     |£775,000          |Flat        |2       |1        |Aspire, Fulham Central               |020 3834 8288   |https://www.rightmove.co.uk/properties/89777412#/?channel=RES_BUY       |51.477778|-0.212672|2026-06-16T16:37:47.000Z|2026-06-19T02:52:11.000Z|2026-06-20T13:14:50.401Z|2026-06-20T13:14:50.401Z|
|148711631      |One Hyde Park, Knightsbridge, London, SW1X|60000000   |£60,000,000       |Apartment   |5       |5        |Global 1, London                     |020 3910 8302   |https://www.rightmove.co.uk/properties/148711631#/?channel=RES_BUY      |51.501871|-0.161945|2024-07-05T16:02:39.000Z|2025-10-23T13:00:13.000Z|2026-06-20T13:14:50.406Z|2026-06-20T13:14:50.406Z|
|757097812420945|Vincent House, 5 Pembridge Square, London |50000000   |POA               |Land        |0       |         |Savills, Margaret Street- Development|020 3909 7811   |https://www.rightmove.co.uk/properties/757097812420945#/?channel=COM_BUY|51.511137|-0.196361|2026-06-10T10:14:09.000Z|2026-06-20T06:40:30.000Z|2026-06-20T13:14:50.408Z|2026-06-20T13:14:50.408Z|


## Docs

- [PRODUCTION.md](./PRODUCTION.md): scaling, monitoring, price tracking, alerting

## How it works

```text
index.js           -> MongoDB runner
csv.js             -> CSV runner
scrapeLondon.js    -> pagination loop, checkpoint, stop on notFound
rightmoveClient.js -> fetch API
parseListing.js    -> map Rightmove JSON to listing object
models/Listing.js  -> MongoDB schema
```

## Sample record

```json
{
  "sourceListingId": "88940811",
  "address": "Tilley Road, Feltham",
  "askingPriceDisplay": "GBP 265,000",
  "propertyType": "Flat",
  "bedrooms": 2,
  "estateAgent": "Barnard Marcus, Feltham",
  "estateAgentPhone": "020 3915 5904"
}
```
