import { MongoClient, Db } from 'mongodb';
import { env } from '../config/env';

let client: MongoClient | null = null;
let database: Db | null = null;

/**
 * Connect the MongoDB client eagerly.
 * Call this during server bootstrap to avoid slow initial API calls.
 */
export const connectMongo = async () => {
  if (client) {
    return client;
  }
  client = new MongoClient(env.mongoUri);
  await client.connect();
  database = client.db(env.mongoDbName);
  console.log('[mongo] Native MongoDB client connected');
  return client;
};

export const getMongoClient = async () => {
  if (client) {
    return client;
  }
  // Fallback: connect lazily if not already connected
  return connectMongo();
};

export const getDatabase = async () => {
  if (database) {
    return database;
  }
  await getMongoClient();
  if (!database) {
    database = client!.db(env.mongoDbName);
  }
  return database;
};

export const disconnectMongo = async () => {
  if (client) {
    await client.close();
    client = null;
    database = null;
  }
};
