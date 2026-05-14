import mongoose from "mongoose";

const uri = process.env.MONGODB_URI?.trim();

interface MongooseGlobal {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

const globalForMongoose = globalThis as unknown as {
  mongooseCache?: MongooseGlobal;
};

const cache: MongooseGlobal = globalForMongoose.mongooseCache ?? {
  conn: null,
  promise: null,
};
globalForMongoose.mongooseCache = cache;

/**
 * Cached Mongoose connection for serverless (Vercel): avoids exhausting Atlas connections.
 */
export async function connectDb(): Promise<typeof mongoose> {
  if (!uri) {
    throw new Error("Missing MONGODB_URI environment variable.");
  }
  if (cache.conn) {
    return cache.conn;
  }
  if (!cache.promise) {
    cache.promise = mongoose.connect(uri, {
      bufferCommands: false,
    });
  }
  try {
    cache.conn = await cache.promise;
  } catch (err) {
    cache.promise = null;
    throw err;
  }
  return cache.conn;
}
