'use client';
import { useQuery } from '@tanstack/react-query';
import Image from 'next/image';

import { signedUrl } from '@/actions/s3-operation';

import { Spinner } from './ui/spinner';

interface S3ImageProps {
  src: string; // S3 object key
  expiresInSeconds?: number; // Optional expiration time for the signed URL
  alt: string; // Alt text for the image
  width?: number; // Width of the image
  height?: number; // Height of the image
  fill?: boolean; // Optional fill mode for the image
  className?: string; // Optional className for styling
}

const S3SignedImage = ({
  src,
  expiresInSeconds = 3600, // Default to 1 hour if not provided
  alt,
  width,
  height,
  fill = false, // Default to false if not provided
  className,
}: S3ImageProps) => {
  // Generate the signed URL for the S3 object

  const { data, isLoading, error } = useQuery({
    queryKey: ['s3Image', src, expiresInSeconds],
    queryFn: async () => {
      return await signedUrl(src, expiresInSeconds);
    },
    refetchOnWindowFocus: false, // Prevent refetching on window focus
  });

  console.log(data, isLoading, error);

  if (isLoading) {
    return <Spinner />;
  }

  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <span>Error loading image</span>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <span>No image found</span>
      </div>
    );
  }

  return (
    <Image
      src={data}
      alt={alt}
      width={width}
      height={height}
      fill={fill} // Use fill mode if specified
      priority // Ensures the image is loaded quickly
      className={className} // Apply any additional styles
    />
  );
};

export default S3SignedImage;
