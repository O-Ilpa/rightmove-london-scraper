const LONDON_BUY_SEARCH_URL =
  "https://www.rightmove.co.uk/api/property-search/listing/search?searchLocation=London&useLocationIdentifier=true&locationIdentifier=REGION%5E87490&radius=40.0&_includeSSTC=on&sortType=2&channel=BUY&transactionType=BUY&displayLocationIdentifier=London-87490.html&index=";

export async function fetchRightmovePage(index) {
  const response = await fetch(`${LONDON_BUY_SEARCH_URL}${index}`);

  if (response.status === 403) {
    const err = new Error("Rightmove returned 403, access blocked");
    err.code = "blocked";
    throw err;
  }

  if (!response.ok) {
    throw new Error(`HTTP ${response.status} ${response.statusText}`);
  }

  return response.json();
}
