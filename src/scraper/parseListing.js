const BASE_URL = 'https://www.rightmove.co.uk';

function extractImages(property) {
  const rawImages = property.images ?? property.propertyImages?.images ?? [];
  if (!Array.isArray(rawImages)) return [];

  return rawImages
    .filter((img) => img?.srcUrl)
    .map((img, index) => ({
      url: img.srcUrl,
      caption: img.caption ?? null,
      position: index,
    }));
}

export function parseListing(property) {
  const images = extractImages(property);

  return {
    source: 'rightmove',
    sourceListingId: String(property.id ?? property.propertyId),
    bedrooms: property.bedrooms ?? null,
    bathrooms: property.bathrooms ?? null,
    listingDescription: property.summary ?? null,
    address: property.displayAddress ?? null,
    propertyType: property.propertySubType ?? property.propertyTypeFullDescription ?? null,
    askingPrice: property.price?.amount ?? null,
    askingPriceDisplay: property.price?.displayPrices?.[0]?.displayPrice ?? null,
    estateAgent: property.customer?.branchDisplayName ?? property.formattedBranchName ?? null,
    estateAgentPhone: property.customer?.contactTelephone ?? null,
    imageUrls: images.map((img) => img.url),
    images,
    propertyUrl: BASE_URL + property?.propertyUrl,
    latitude: property.location?.latitude ?? null,
    longitude: property.location?.longitude ?? null,
    locationIdentifier: 'REGION^87490',
    searchLocation: 'London',
    firstVisibleDate: property.firstVisibleDate ? new Date(property.firstVisibleDate) : null,
    updateDate: property.updateDate ? new Date(property.updateDate) : null,
    scrapedAt: new Date(),
    lastSeenAt: new Date(),
    raw: property,
  };
}

export function getPropertyId(property) {
  return String(property.id ?? property.propertyId ?? '');
}
