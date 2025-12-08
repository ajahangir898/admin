import { MongoClient, Db } from 'mongodb';
import { env } from '../config/env.js';

let client: MongoClient | null = null;
let database: Db | null = null;

export const getMongoClient = async () => {
  if (client) {
    return client;
  }
  client = new MongoClient(env.mongoUri);
  await client.connect();
  return client;
};

export const getDatabase = async () => {
  if (database) {
    return database;
  }
  const mongoClient = await getMongoClient();
  database = mongoClient.db(env.mongoDbName);
  return database;
};

export const disconnectMongo = async () => {
  if (client) {
    await client.close();
    client = null;
    database = null;
  }
};
