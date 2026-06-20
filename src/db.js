import mongoose from 'mongoose';

export async function connectDb(uri, logger) {
  await mongoose.connect(uri);
  logger.info('connected to MongoDB');
}

export async function disconnectDb(logger) {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
    logger.info('disconnected from MongoDB');
  }
}

export function isDbConnected() {
  return mongoose.connection.readyState === 1;
}
