import { useCallback, useRef } from 'react';

/**
 * Custom hook to handle taking snapshots from video streams
 * Can capture from either camera or screen share video
 */
export const useSnapshot = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Take a snapshot from a video element and download it
  const takeSnapshot = useCallback(
    (videoRef: React.RefObject<HTMLVideoElement | null>, filename?: string) => {
      if (videoRef.current && canvasRef.current) {
        const canvas = canvasRef.current;
        const video = videoRef.current;
        const context = canvas.getContext('2d');

        if (context && video.videoWidth && video.videoHeight) {
          // Set canvas dimensions to match video
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;

          // Draw the current video frame to canvas
          context.drawImage(video, 0, 0);

          // Convert canvas to blob and trigger download
          canvas.toBlob((blob) => {
            if (blob) {
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = filename || `interview-snapshot-${new Date().toISOString()}.png`;
              a.click();
              URL.revokeObjectURL(url);
            }
          });

          console.log('Snapshot taken at:', new Date().toISOString());
        } else {
          console.warn('Video not ready for snapshot or no video content');
        }
      } else {
        console.warn('Video ref or canvas ref not available');
      }
    },
    []
  );

  return {
    takeSnapshot,
    canvasRef,
  };
};
