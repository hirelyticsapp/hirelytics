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
      <div className="lg:hidden relative bg-black flex-1 min-h-0">
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
            <div className="absolute top-4 right-4 w-24 h-24 rounded-lg overflow-hidden border-2 border-white shadow-lg">
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
                <Button
                  onClick={onStartScreenRecording}
                  className="bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600"
                >
                  Start Screen Recording
                </Button>
              </div>
            ) : (
              <div className="absolute top-1/2 left-4">
                <Button
                  onClick={onStopScreenRecording}
                  className="bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600 animate-pulse"
                >
                  Stop Screen Recording
                </Button>
              </div>
            )}

            {/* Download Screen Recording Button */}
            {screenRecordedChunks.length > 0 && !isScreenRecording && (
              <div className="absolute bottom-1/2 left-4">
                <Button
                  onClick={onDownloadScreenRecording}
                  className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
                >
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
      <div className="hidden lg:flex flex-1 relative bg-black min-h-0">
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
            <div className="absolute bottom-20 right-4 w-64 h-48 rounded-lg overflow-hidden border-2 border-blue-500 dark:border-blue-400 shadow-lg z-10">
              <video
                ref={screenRef}
                autoPlay
                muted
                playsInline
                className="w-full h-full object-contain bg-black"
              />

              {/* Screen share label */}
              <div className="absolute top-2 left-2 bg-blue-600 dark:bg-blue-500 px-2 py-1 rounded text-xs text-white">
                Screen Share
              </div>

              {/* Screen Recording Controls */}
              <div className="absolute bottom-2 left-2 flex space-x-1">
                {!isScreenRecording ? (
                  <Button
                    size="sm"
                    onClick={onStartScreenRecording}
                    className="bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 text-xs"
                  >
                    Record
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    onClick={onStopScreenRecording}
                    className="bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600 text-xs animate-pulse"
                  >
                    Stop
                  </Button>
                )}

                {/* Download button when recording is available */}
                {screenRecordedChunks.length > 0 && !isScreenRecording && (
                  <Button
                    size="sm"
                    onClick={onDownloadScreenRecording}
                    className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-xs"
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
