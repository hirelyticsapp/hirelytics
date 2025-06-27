'use server';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';

import { IUser } from '@/db';
import User from '@/db/schema/user';
import { env } from '@/env';
import { auth } from '@/lib/auth/server';
import { createS3Client } from '@/lib/s3-client';

export async function updateProfile(profileData: Partial<IUser>) {
  try {
    const { user } = await auth();
    if (!user) {
      throw new Error('User not authenticated');
    }
    const { name } = profileData;
    console.log('Updating profile for user:', user._id, 'with data:', profileData);
    await User.updateOne({ _id: user._id }, { name });
  } catch (error) {
    console.error('Error updating profile:', error);
    throw error;
  }
}

export async function uploadProfileImage(file: File) {
  try {
    const { user } = await auth();
    if (!user) {
      throw new Error('User not authenticated');
    }

    const s3Client = createS3Client();
    const bucketName = env.AWS_S3_BUCKET_NAME;
    const fileExtension = file.name.split('.').pop();
    const fileName = `users/profile/${uuidv4()}.${fileExtension}`;
    const chunkSize = 5 * 1024 * 1024; // 5 MB
    const fileBuffer = new Uint8Array(await file.arrayBuffer());

    for (let start = 0; start < fileBuffer.length; start += chunkSize) {
      const chunk = fileBuffer.slice(start, start + chunkSize);
      const uploadParams = {
        Bucket: bucketName,
        Key: fileName,
        Body: chunk,
        ContentType: file.type,
      };
      await s3Client.send(new PutObjectCommand(uploadParams));
    }

    await User.updateOne({ _id: user._id }, { image: fileName });
    return fileName;
  } catch (error) {
    console.error('Error uploading profile image:', error);
    throw error;
  }
}
