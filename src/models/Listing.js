import mongoose from 'mongoose';

const imageSchema = new mongoose.Schema(
  {
    url: String,
    caption: String,
    position: Number,
  },
  { _id: false },
);

const listingSchema = new mongoose.Schema(
  {
    source: { type: String, required: true, default: 'rightmove' },
    sourceListingId: { type: String, required: true, unique: true },
    propertyUrl: String,
    address: String,
    askingPrice: Number,
    askingPriceDisplay: String,
    propertyType: String,
    bedrooms: Number,
    bathrooms: Number,
    listingDescription: String,
    estateAgent: String,
    estateAgentPhone: String,
    imageUrls: [String],
    images: [imageSchema],
    latitude: Number,
    longitude: Number,
    locationIdentifier: String,
    searchLocation: String,
    firstVisibleDate: Date,
    updateDate: Date,
    scrapedAt: Date,
    lastSeenAt: Date,
    raw: mongoose.Schema.Types.Mixed,
  },
  { collection: 'listings', timestamps: false },
);

export const Listing = mongoose.model('Listing', listingSchema);
