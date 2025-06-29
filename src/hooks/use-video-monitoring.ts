'use client';

import { useCallback, useState } from 'react';

import { uploadCameraVideo, uploadScreenVideo } from '@/actions/job-application';

interface VideoRecordingState {
  isRecording: boolean;
  currentRecorder: ExtendedMediaRecorder | null;
  startTime: number | null;
  chunks: Blob[];
}

interface ExtendedMediaRecorder extends MediaRecorder {
  chunkInterval?: NodeJS.Timeout;
}

export function useVideoMonitoring() {
  const [cameraRecording, setCameraRecording] = useState<VideoRecordingState>({
    isRecording: false,
    currentRecorder: null,
    startTime: null,
    chunks: [],
  });

  const [screenRecording, setScreenRecording] = useState<VideoRecordingState>({
    isRecording: false,
    currentRecorder: null,
    startTime: null,
    chunks: [],
  });

  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Chunk duration in milliseconds (5 minutes)
  const CHUNK_DURATION = 5 * 60 * 1000;

  const startCameraRecording = useCallback(
    async (stream: MediaStream, applicationId: string) => {
      if (cameraRecording.isRecording) return;

      try {
        const mediaRecorder = new MediaRecorder(stream, {
          mimeType: 'video/webm;codecs=vp9',
        });

        const chunks: Blob[] = [];
        const startTime = Date.now();

        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            chunks.push(event.data);
          }
        };

        mediaRecorder.onstop = async () => {
          if (chunks.length > 0) {
            const videoBlob = new Blob(chunks, { type: 'video/webm' });
            const duration = (Date.now() - startTime) / 1000; // Convert to seconds

            setIsUploading(true);
            setUploadError(null);

            try {
              await uploadCameraVideo(applicationId, videoBlob, duration);
              console.log('Camera video chunk uploaded successfully');
            } catch (error) {
              const errorMessage =
                error instanceof Error ? error.message : 'Failed to upload camera video';
              setUploadError(errorMessage);
              console.error('Error uploading camera video:', error);
            } finally {
              setIsUploading(false);
            }
          }
        };

        setCameraRecording({
          isRecording: true,
          currentRecorder: mediaRecorder,
          startTime,
          chunks,
        });

        mediaRecorder.start();

        // Set up automatic chunk creation every 5 minutes
        const chunkInterval = setInterval(() => {
          if (mediaRecorder.state === 'recording') {
            mediaRecorder.stop();
            // Restart recording for the next chunk
            setTimeout(() => {
              if (cameraRecording.isRecording) {
                const newChunks: Blob[] = [];
                const newStartTime = Date.now();

                mediaRecorder.ondataavailable = (event) => {
                  if (event.data.size > 0) {
                    newChunks.push(event.data);
                  }
                };

                setCameraRecording((prev) => ({
                  ...prev,
                  startTime: newStartTime,
                  chunks: newChunks,
                }));

                mediaRecorder.start();
              }
            }, 100);
          }
        }, CHUNK_DURATION);

        // Store the interval reference for cleanup
        (mediaRecorder as ExtendedMediaRecorder).chunkInterval = chunkInterval;
      } catch (error) {
        console.error('Error starting camera recording:', error);
        setUploadError('Failed to start camera recording');
      }
    },
    [cameraRecording.isRecording, CHUNK_DURATION]
  );

  const startScreenRecording = useCallback(
    async (stream: MediaStream, applicationId: string) => {
      if (screenRecording.isRecording) return;

      try {
        const mediaRecorder = new MediaRecorder(stream, {
          mimeType: 'video/webm;codecs=vp9',
        });

        const chunks: Blob[] = [];
        const startTime = Date.now();

        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            chunks.push(event.data);
          }
        };

        mediaRecorder.onstop = async () => {
          if (chunks.length > 0) {
            const videoBlob = new Blob(chunks, { type: 'video/webm' });
            const duration = (Date.now() - startTime) / 1000; // Convert to seconds

            setIsUploading(true);
            setUploadError(null);

            try {
              await uploadScreenVideo(applicationId, videoBlob, duration);
              console.log('Screen video chunk uploaded successfully');
            } catch (error) {
              const errorMessage =
                error instanceof Error ? error.message : 'Failed to upload screen video';
              setUploadError(errorMessage);
              console.error('Error uploading screen video:', error);
            } finally {
              setIsUploading(false);
            }
          }
        };

        setScreenRecording({
          isRecording: true,
          currentRecorder: mediaRecorder,
          startTime,
          chunks,
        });

        mediaRecorder.start();

        // Set up automatic chunk creation every 5 minutes
        const chunkInterval = setInterval(() => {
          if (mediaRecorder.state === 'recording') {
            mediaRecorder.stop();
            // Restart recording for the next chunk
            setTimeout(() => {
              if (screenRecording.isRecording) {
                const newChunks: Blob[] = [];
                const newStartTime = Date.now();

                mediaRecorder.ondataavailable = (event) => {
                  if (event.data.size > 0) {
                    newChunks.push(event.data);
                  }
                };

                setScreenRecording((prev) => ({
                  ...prev,
                  startTime: newStartTime,
                  chunks: newChunks,
                }));

                mediaRecorder.start();
              }
            }, 100);
          }
        }, CHUNK_DURATION);

        // Store the interval reference for cleanup
        (mediaRecorder as ExtendedMediaRecorder).chunkInterval = chunkInterval;
      } catch (error) {
        console.error('Error starting screen recording:', error);
        setUploadError('Failed to start screen recording');
      }
    },
    [screenRecording.isRecording, CHUNK_DURATION]
  );

  const stopCameraRecording = useCallback(() => {
    if (cameraRecording.currentRecorder) {
      cameraRecording.currentRecorder.stop();

      // Clear the chunk interval
      if ((cameraRecording.currentRecorder as ExtendedMediaRecorder).chunkInterval) {
        clearInterval((cameraRecording.currentRecorder as ExtendedMediaRecorder).chunkInterval);
      }

      setCameraRecording({
        isRecording: false,
        currentRecorder: null,
        startTime: null,
        chunks: [],
      });
    }
  }, [cameraRecording.currentRecorder]);

  const stopScreenRecording = useCallback(() => {
    if (screenRecording.currentRecorder) {
      screenRecording.currentRecorder.stop();

      // Clear the chunk interval
      if ((screenRecording.currentRecorder as ExtendedMediaRecorder).chunkInterval) {
        clearInterval((screenRecording.currentRecorder as ExtendedMediaRecorder).chunkInterval);
      }

      setScreenRecording({
        isRecording: false,
        currentRecorder: null,
        startTime: null,
        chunks: [],
      });
    }
  }, [screenRecording.currentRecorder]);

  const stopAllRecordings = useCallback(() => {
    stopCameraRecording();
    stopScreenRecording();
  }, [stopCameraRecording, stopScreenRecording]);

  return {
    // Camera recording
    startCameraRecording,
    stopCameraRecording,
    isCameraRecording: cameraRecording.isRecording,

    // Screen recording
    startScreenRecording,
    stopScreenRecording,
    isScreenRecording: screenRecording.isRecording,

    // General controls
    stopAllRecordings,

    // Upload status
    isUploading,
    uploadError,

    // Recording durations (for UI display)
    cameraRecordingDuration: cameraRecording.startTime
      ? (Date.now() - cameraRecording.startTime) / 1000
      : 0,
    screenRecordingDuration: screenRecording.startTime
      ? (Date.now() - screenRecording.startTime) / 1000
      : 0,
  };
}
