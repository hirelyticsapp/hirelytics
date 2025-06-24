'use server';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

import { env } from '@/env';
import { createS3Client } from '@/lib/s3-client';

export const signedUrl = async (key: string, expiresInSeconds: number) => {
  const bucket = env.AWS_S3_BUCKET_NAME;
  const s3 = createS3Client();
  const { GetObjectCommand } = await import('@aws-sdk/client-s3');

  const command = new GetObjectCommand({
    Bucket: bucket,
    Key: key,
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return await getSignedUrl(s3 as unknown as any, command, { expiresIn: expiresInSeconds });
};
