// This file is for server-side use only, not client-side
import { S3Client } from '@aws-sdk/client-s3';

import { env } from '@/env';

// Create a custom S3 client for Tigris S3 storage (server-side only)
export const createS3Client = () =>
  new S3Client({
    region: env.AWS_REGION!,
    endpoint: env.AWS_ENDPOINT_URL_S3,
    forcePathStyle: true,
    credentials: {
      accessKeyId: env.AWS_ACCESS_KEY_ID,
      secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
    },
  });
