import { Download } from 'lucide-react';
import React from 'react';

import { Button } from '@/components/ui/button';

import AIVideoFeed from './ai-video-feed';
import UserVideoFeed from './user-video-feed';

interface VideoAreaProps {
  // Video refs for rendering streams
  videoRef: React.RefObject<HTMLVideoElement | null>;
  screenRef: React.RefObject<HTMLVideoElement | null>;

  // Camera state
  isCameraOff: boolean;
  isUserSpeaking: boolean;

  // AI state
  isAISpeaking: boolean;

  // Screen sharing state
  isScreenSharing: boolean;
  screenStream: MediaStream | null;

  // Recording state
  isScreenRecording: boolean;
  screenRecordedChunks: Blob[];

  // Recording controls
  onStartScreenRecording: () => void;
  onStopScreenRecording: () => void;
  onDownloadScreenRecording: () => void;
}

/**
 * Video Area Component - Handles video display for both mobile and desktop layouts
 * Shows user camera, AI video, and screen sharing with appropriate picture-in-picture positioning
 */
const VideoArea: React.FC<VideoAreaProps> = ({
  videoRef,
  screenRef,
  isCameraOff,
  isUserSpeaking,
  isAISpeaking,
  isScreenSharing,
  screenStream,
  isScreenRecording,
  screenRecordedChunks,
  onStartScreenRecording,
  onStopScreenRecording,
  onDownloadScreenRecording,
}) => {
  return (
    <>
      {/* Mobile Layout */}
      <div className="lg:hidden relative bg-muted flex-1 min-h-0">
        {/* Screen Share View for Mobile */}
        {isScreenSharing && screenStream ? (
          <div className="relative w-full h-full flex items-center justify-center">
            {/* Main screen share video */}
            <video
              ref={screenRef}
              autoPlay
              muted
              playsInline
              className="w-full h-full object-contain"
            />

            {/* User Camera Picture in Picture */}
            <div className="absolute top-4 right-4 w-24 h-24 rounded-lg overflow-hidden border-2 border-border shadow-lg">
              <UserVideoFeed
                videoRef={videoRef}
                isCameraOff={isCameraOff}
                isUserSpeaking={isUserSpeaking}
              />
            </div>

            {/* AI Video Picture in Picture */}
            <div className="absolute top-4 left-4 w-20 h-20">
              <AIVideoFeed isAISpeaking={isAISpeaking} />
            </div>

            {/* Screen Recording Controls */}
            {!isScreenRecording ? (
              <div className="absolute top-1/2 left-4">
                <Button onClick={onStartScreenRecording} variant="default" size="sm">
                  Start Screen Recording
                </Button>
              </div>
            ) : (
              <div className="absolute top-1/2 left-4">
                <Button
                  onClick={onStopScreenRecording}
                  variant="destructive"
                  size="sm"
                  className="animate-pulse"
                >
                  Stop Screen Recording
                </Button>
              </div>
            )}

            {/* Download Screen Recording Button */}
            {screenRecordedChunks.length > 0 && !isScreenRecording && (
              <div className="absolute bottom-1/2 left-4">
                <Button onClick={onDownloadScreenRecording} variant="secondary" size="sm">
                  Download Screen Recording
                </Button>
              </div>
            )}
          </div>
        ) : (
          /* Normal Camera View for Mobile */
          <div className="relative w-full h-full flex items-center justify-center p-4">
            {/* Main user camera */}
            <div className="w-full max-w-xs aspect-square">
              <UserVideoFeed
                videoRef={videoRef}
                isCameraOff={isCameraOff}
                isUserSpeaking={isUserSpeaking}
              />
            </div>

            {/* AI Video Picture in Picture */}
            <div className="absolute top-8 right-8 w-20 h-20">
              <AIVideoFeed isAISpeaking={isAISpeaking} />
            </div>
          </div>
        )}
      </div>

      {/* Desktop Layout */}
      <div className="hidden lg:flex flex-1 relative bg-muted min-h-0">
        {/* Main User Camera - Always visible on desktop */}
        <div className="relative w-full h-full">
          <UserVideoFeed
            videoRef={videoRef}
            isCameraOff={isCameraOff}
            isUserSpeaking={isUserSpeaking}
          />

          {/* AI Video - Always in top right */}
          <div className="absolute top-4 right-4 w-48 h-36 z-10">
            <AIVideoFeed isAISpeaking={isAISpeaking} />
          </div>

          {/* Screen Share - Small window in bottom right when active */}
          {isScreenSharing && screenStream && (
            <div className="absolute bottom-20 right-4 w-64 h-48 rounded-lg overflow-hidden border-2 border-primary shadow-lg z-10">
              <video
                ref={screenRef}
                autoPlay
                muted
                playsInline
                className="w-full h-full object-contain bg-muted"
              />

              {/* Screen share label */}
              <div className="absolute top-2 left-2 bg-primary px-2 py-1 rounded text-xs text-primary-foreground">
                Screen Share
              </div>

              {/* Screen Recording Controls */}
              <div className="absolute bottom-2 left-2 flex space-x-1">
                {!isScreenRecording ? (
                  <Button
                    size="sm"
                    onClick={onStartScreenRecording}
                    variant="default"
                    className="text-xs"
                  >
                    Record
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    onClick={onStopScreenRecording}
                    variant="destructive"
                    className="text-xs animate-pulse"
                  >
                    Stop
                  </Button>
                )}

                {/* Download button when recording is available */}
                {screenRecordedChunks.length > 0 && !isScreenRecording && (
                  <Button
                    size="sm"
                    onClick={onDownloadScreenRecording}
                    variant="secondary"
                    className="text-xs"
                  >
                    <Download size={12} />
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default VideoArea;
