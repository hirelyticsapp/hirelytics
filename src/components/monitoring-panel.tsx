'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useMonitoringImages } from '@/hooks/use-monitoring-images';

interface MonitoringPanelProps {
  applicationId: string;
  cameraMonitoring: boolean;
  screenMonitoring: boolean;
  cameraInterval?: number; // in seconds
  screenInterval?: number; // in seconds
}

export function MonitoringPanel({
  applicationId,
  cameraMonitoring,
  screenMonitoring,
  cameraInterval = 30,
  screenInterval = 30,
}: MonitoringPanelProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [screenStream, setScreenStream] = useState<MediaStream | null>(null);
  const [isRecording, setIsRecording] = useState(false);

  const { uploadCamera, uploadScreen, captureCamera, captureScreen, isUploading, uploadError } =
    useMonitoringImages();

  // Initialize camera stream
  const initializeCamera = useCallback(async () => {
    if (!cameraMonitoring) return;

    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });

      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
    }
  }, [cameraMonitoring]);

  // Initialize screen sharing
  const initializeScreenShare = useCallback(async () => {
    if (!screenMonitoring) return;

    try {
      const screenMediaStream = await navigator.mediaDevices.getDisplayMedia({
        video: { width: { ideal: 1920 }, height: { ideal: 1080 } },
        audio: false,
      });

      setScreenStream(screenMediaStream);
    } catch (error) {
      console.error('Error accessing screen share:', error);
    }
  }, [screenMonitoring]);

  // Capture and upload camera image
  const captureCameraImage = useCallback(async () => {
    if (!videoRef.current || !stream || !cameraMonitoring) return;

    try {
      const imageData = captureCamera(videoRef.current);
      await uploadCamera(applicationId, imageData);
      console.log('Camera image uploaded successfully');
    } catch (error) {
      console.error('Error uploading camera image:', error);
    }
  }, [applicationId, stream, cameraMonitoring, captureCamera, uploadCamera]);

  // Capture and upload screen image
  const captureScreenImage = useCallback(async () => {
    if (!screenStream || !screenMonitoring) return;

    try {
      const screenVideo = document.createElement('video');
      screenVideo.srcObject = screenStream;
      screenVideo.play();

      await new Promise((resolve) => {
        screenVideo.onloadedmetadata = () => resolve(void 0);
      });

      const imageData = captureScreen(screenVideo);
      await uploadScreen(applicationId, imageData);
      console.log('Screen image uploaded successfully');
    } catch (error) {
      console.error('Error uploading screen image:', error);
    }
  }, [applicationId, screenStream, screenMonitoring, captureScreen, uploadScreen]);

  // Set up intervals for automatic monitoring
  useEffect(() => {
    if (!isRecording) return;

    const intervals: NodeJS.Timeout[] = [];

    if (cameraMonitoring && cameraInterval) {
      const cameraIntervalId = setInterval(captureCameraImage, cameraInterval * 1000);
      intervals.push(cameraIntervalId);
    }

    if (screenMonitoring && screenInterval) {
      const screenIntervalId = setInterval(captureScreenImage, screenInterval * 1000);
      intervals.push(screenIntervalId);
    }

    return () => {
      intervals.forEach(clearInterval);
    };
  }, [
    isRecording,
    cameraMonitoring,
    screenMonitoring,
    cameraInterval,
    screenInterval,
    captureCameraImage,
    captureScreenImage,
  ]);

  // Initialize streams when component mounts
  useEffect(() => {
    initializeCamera();
    initializeScreenShare();

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
      if (screenStream) {
        screenStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [initializeCamera, initializeScreenShare, stream, screenStream]);

  const startMonitoring = () => setIsRecording(true);
  const stopMonitoring = () => setIsRecording(false);

  const manualCapture = async () => {
    if (cameraMonitoring) await captureCameraImage();
    if (screenMonitoring) await captureScreenImage();
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Interview Monitoring</CardTitle>
        <CardDescription>Camera and screen monitoring for interview sessions</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {cameraMonitoring && (
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Camera Feed</h3>
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              className="w-full max-w-md rounded-lg border"
            />
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">
              Status: {isRecording ? 'Recording' : 'Stopped'}
            </p>
            {cameraMonitoring && (
              <p className="text-xs text-muted-foreground">Camera: Every {cameraInterval}s</p>
            )}
            {screenMonitoring && (
              <p className="text-xs text-muted-foreground">Screen: Every {screenInterval}s</p>
            )}
          </div>

          <div className="flex gap-2">
            <Button onClick={startMonitoring} disabled={isRecording || isUploading} size="sm">
              Start Monitoring
            </Button>
            <Button onClick={stopMonitoring} disabled={!isRecording} variant="outline" size="sm">
              Stop Monitoring
            </Button>
            <Button onClick={manualCapture} disabled={isUploading} variant="secondary" size="sm">
              Manual Capture
            </Button>
          </div>
        </div>

        {isUploading && <div className="text-sm text-blue-600">Uploading monitoring data...</div>}
        {uploadError && <div className="text-sm text-red-600">Error: {uploadError}</div>}

        <div className="rounded-lg bg-muted p-3 text-sm">
          <p className="font-medium">Monitoring Settings:</p>
          <ul className="mt-1 space-y-1 text-muted-foreground">
            <li>• Camera Monitoring: {cameraMonitoring ? 'Enabled' : 'Disabled'}</li>
            <li>• Screen Monitoring: {screenMonitoring ? 'Enabled' : 'Disabled'}</li>
            <li>• Images are automatically uploaded to secure storage</li>
            <li>• All monitoring data is encrypted and access-controlled</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
