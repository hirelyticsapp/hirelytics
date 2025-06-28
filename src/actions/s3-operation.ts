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

export const getMonitoringImageSignedUrl = async (s3Key: string) => {
  // Generate signed URL with 1 hour expiration for monitoring images
  return await signedUrl(s3Key, 3600);
};

export const getMonitoringImageSignedUrls = async (s3Keys: string[]) => {
  // Generate signed URLs for multiple monitoring images
  const urlPromises = s3Keys.map((key) => signedUrl(key, 3600));
  const urls = await Promise.all(urlPromises);

  return s3Keys.reduce(
    (acc, key, index) => {
      acc[key] = urls[index];
      return acc;
    },
    {} as Record<string, string>
  );
};
