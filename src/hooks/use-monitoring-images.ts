'use client';

import { useState } from 'react';

import {
  deleteMonitoringImage,
  getMonitoringImages,
  uploadCameraImage,
  uploadScreenImage,
} from '@/actions/job-application';
import { getMonitoringImageSignedUrl, getMonitoringImageSignedUrls } from '@/actions/s3-operation';

export function useMonitoringImages() {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const uploadCamera = async (applicationId: string, imageData: string) => {
    setIsUploading(true);
    setUploadError(null);

    try {
      const result = await uploadCameraImage(applicationId, imageData);
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to upload camera image';
      setUploadError(errorMessage);
      throw error;
    } finally {
      setIsUploading(false);
    }
  };

  const uploadScreen = async (applicationId: string, imageData: string) => {
    setIsUploading(true);
    setUploadError(null);

    try {
      const result = await uploadScreenImage(applicationId, imageData);
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to upload screen image';
      setUploadError(errorMessage);
      throw error;
    } finally {
      setIsUploading(false);
    }
  };

  const getImages = async (applicationId: string) => {
    try {
      const images = await getMonitoringImages(applicationId);
      return images;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to fetch monitoring images';
      setUploadError(errorMessage);
      throw error;
    }
  };

  const getImageUrl = async (s3Key: string) => {
    try {
      const url = await getMonitoringImageSignedUrl(s3Key);
      return url;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate image URL';
      setUploadError(errorMessage);
      throw error;
    }
  };

  const getImageUrls = async (s3Keys: string[]) => {
    try {
      const urls = await getMonitoringImageSignedUrls(s3Keys);
      return urls;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate image URLs';
      setUploadError(errorMessage);
      throw error;
    }
  };

  const deleteImage = async (
    applicationId: string,
    imageType: 'camera' | 'screen',
    s3Key: string
  ) => {
    try {
      const result = await deleteMonitoringImage(applicationId, imageType, s3Key);
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete image';
      setUploadError(errorMessage);
      throw error;
    }
  };

  // Utility function to capture screen from video element or canvas
  const captureScreen = (videoElement: HTMLVideoElement): string => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      throw new Error('Failed to get canvas context');
    }

    canvas.width = videoElement.videoWidth;
    canvas.height = videoElement.videoHeight;

    ctx.drawImage(videoElement, 0, 0);

    return canvas.toDataURL('image/jpeg', 0.8);
  };

  // Utility function to capture camera from video element
  const captureCamera = (videoElement: HTMLVideoElement): string => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      throw new Error('Failed to get canvas context');
    }

    canvas.width = videoElement.videoWidth;
    canvas.height = videoElement.videoHeight;

    ctx.drawImage(videoElement, 0, 0);

    return canvas.toDataURL('image/jpeg', 0.8);
  };

  return {
    uploadCamera,
    uploadScreen,
    getImages,
    getImageUrl,
    getImageUrls,
    deleteImage,
    captureScreen,
    captureCamera,
    isUploading,
    uploadError,
  };
}
