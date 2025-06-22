import { MongoClient } from 'mongodb';

import { env } from '@/env';

const client = new MongoClient(env.DATABASE_URL);

export const dbClient = client.db();
