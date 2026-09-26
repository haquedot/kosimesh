import { MongoClient, Db } from 'mongodb';

const uri = process.env.MONGODB_URI || '';
const options = {};

let client: MongoClient | null = null;
let clientPromise: Promise<MongoClient> | null = null;

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

export function isMongoConfigured(): boolean {
  return Boolean(process.env.MONGODB_URI);
}

export async function getMongoClient(): Promise<MongoClient | null> {
  if (!isMongoConfigured()) {
    return null;
  }

  if (process.env.NODE_ENV === 'development') {
    // In development mode, use a global variable so that the value
    // is preserved across module reloads caused by HMR (Hot Module Replacement).
    if (!global._mongoClientPromise) {
      client = new MongoClient(uri, options);
      global._mongoClientPromise = client.connect();
    }
    clientPromise = global._mongoClientPromise;
  } else {
    // In production mode, it's best to not use a global variable.
    if (!clientPromise) {
      client = new MongoClient(uri, options);
      clientPromise = client.connect();
    }
  }

  try {
    return await clientPromise;
  } catch (error) {
    console.warn('[MongoDB] Connection failed, fallback to memory store:', error);
    return null;
  }
}

export async function getDb(): Promise<Db | null> {
  const client = await getMongoClient();
  if (!client) return null;
  const dbName = process.env.MONGODB_DB || 'kosi_mesh';
  return client.db(dbName);
}
