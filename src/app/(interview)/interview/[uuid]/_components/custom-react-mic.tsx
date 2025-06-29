'use client';

import { useCallback, useEffect, useState } from 'react';
import { ReactMic } from 'react-mic';

interface CustomReactMicProps {
  record: boolean;
  deviceId?: string | null;
  className?: string;
  onStop: (recordedBlob: {
    blob: Blob;
    blobURL: string;
    startTime: number;
    stopTime: number;
  }) => void;
  onData: (recordedData: unknown) => void;
  onError: (err: Error) => void;
  strokeColor?: string;
  backgroundColor?: string;
  mimeType?: string;
  visualSetting?: string;
}

export function CustomReactMic({
  record,
  deviceId,
  className,
  onStop,
  onData,
  onError,
  strokeColor = '#09f',
  backgroundColor = '#f0f0f0',
  mimeType = 'audio/webm' as const,
  visualSetting = 'frequencyBars' as const,
}: CustomReactMicProps) {
  const [key, setKey] = useState<number>(0);
  const [audioStream, setAudioStream] = useState<MediaStream | null>(null);

  const initializeAudioStream = useCallback(async () => {
    try {
      // Check if getUserMedia is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error(
          'getUserMedia is not supported in this browser or environment. Please use a modern browser with HTTPS or run on localhost.'
        );
      }

      if (audioStream) {
        // Stop any existing audio tracks
        audioStream.getTracks().forEach((track) => track.stop());
      }

      // Request access to the microphone with specified device if available
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: deviceId ? { deviceId: { exact: deviceId } } : true,
        video: false,
      });

      setAudioStream(stream);

      // Force re-mount of ReactMic component with new device
      setKey((prevKey) => prevKey + 1);
    } catch (err) {
      const error = err as Error;

      // Provide more helpful error messages
      let errorMessage = error.message;
      if (error.name === 'NotFoundError') {
        errorMessage = 'No microphone found. Please ensure a microphone is connected.';
      } else if (error.name === 'NotAllowedError') {
        errorMessage = 'Microphone access denied. Please allow microphone permissions.';
      } else if (error.name === 'NotSupportedError') {
        errorMessage = 'Microphone is not supported in this browser.';
      }

      onError(new Error(errorMessage));
    }
  }, [deviceId, audioStream, onError]);

  // Initialize audio stream when deviceId changes
  useEffect(() => {
    initializeAudioStream();

    // Cleanup when unmounting
    return () => {
      if (audioStream) {
        audioStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [deviceId, initializeAudioStream, audioStream]);

  return (
    <ReactMic
      key={key}
      record={record}
      className={className}
      onStop={onStop}
      onData={onData}
      strokeColor={strokeColor}
      backgroundColor={backgroundColor}
      mimeType={mimeType as 'audio/webm' | 'audio/wav' | undefined}
      visualSetting={visualSetting as 'frequencyBars' | 'sinewave' | undefined}
    />
  );
}
