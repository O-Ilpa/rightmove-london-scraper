# Rightmove London Scraper

Scrapes London BUY listings from Rightmove into MongoDB or CSV.

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

Example output:

```text
Page 42: saved 25 listings (20 new, 5 updated; 1050 total)
Done: no more results
Cycle finished: 1050 listings across 42 pages

Stopped: not_found
Saved 1050 listings across 42 pages
```

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

## Fresh Start

Delete `data/listings.csv` and `data/scraper-state.json` to reset CSV/checkpoint output.

## Note On Coverage

A single Rightmove search is capped by Rightmove pagination. Use query sharding if you need full London coverage.
