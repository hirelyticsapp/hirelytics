'use client';
import { Download } from 'lucide-react';
import React, { useCallback, useEffect, useRef, useState } from 'react';

import { Button } from '@/components/ui/button';

// Import custom hooks for managing different aspects of the video call
import { useMediaStream } from '../hooks/use-media-stream';
import { useRecording } from '../hooks/use-recording';
import { useScreenShare } from '../hooks/use-screen-share';
import { useSnapshot } from '../hooks/use-snapshot';
import { useSpeechRecognition } from '../hooks/use-speech-recognition';
import AIVideoFeed from './ai-video-feed';
import ChatTranscript from './chat-transcript';
import DeviceSelector from './device-selector';
// Import UI components
import InterviewStartScreen from './interview-start-screen';
import MediaControls from './media-control';
import TimerDisplay from './timer-display';
import UserVideoFeed from './user-video-feed';

interface ApplicationData {
  id: string;
  uuid: string;
  status: 'pending' | 'reviewed' | 'accepted' | 'rejected';
  preferredLanguage: string;
  candidate: {
    email: string;
    name: string;
  };
  jobDetails: {
    title: string;
    description: string;
    skills: string[];
    benefits?: string;
    requirements?: string;
  };
  sessionInstruction: {
    screenMonitoring: boolean;
    screenMonitoringMode: 'photo' | 'video';
    screenMonitoringInterval?: 30 | 60;
    cameraMonitoring: boolean;
    cameraMonitoringMode: 'photo' | 'video';
    cameraMonitoringInterval?: 30 | 60;
    duration: number; // mandatory field
  };
  instructionsForAi?: {
    instruction: string;
    difficultyLevel: 'easy' | 'normal' | 'hard' | 'expert' | 'advanced';
    questionMode: 'manual' | 'ai-mode';
    totalQuestions: number;
    categoryConfigs: Array<{
      type: string;
      numberOfQuestions: number;
    }>;
    questions: Array<{
      id: string;
      type: string;
      question: string;
      isAIGenerated?: boolean;
    }>;
  };
  jobInfo?: {
    id: string;
    title: string;
    description: string;
    skills: string[];
    benefits?: string;
    requirements?: string;
    location?: string;
    salary?: string;
    type?: string;
    experience?: string;
    organization?: {
      id: string;
      name: string;
      website?: string;
      description?: string;
      industry?: string;
    };
  };
  userInfo?: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
}

interface VideoCallProps {
  applicationData: ApplicationData;
}

/**
 * Main VideoCall Component
 * Orchestrates all video call functionality including:
 * - Media stream management (camera/microphone)
 * - Screen sharing
 * - Recording (camera and screen)
 * - Speech recognition and transcripts
 * - Snapshot capture
 * - Device management
 */
const VideoCall: React.FC<VideoCallProps> = ({ applicationData }) => {
  // Main state for interview flow
  const [isInterviewStarted, setIsInterviewStarted] = useState(false);

  // UI state
  const [showDeviceSelector, setShowDeviceSelector] = useState(false);
  const [showMobileChat, setShowMobileChat] = useState(false);
  const [isUserSpeaking, setIsUserSpeaking] = useState(false);
  const [isAISpeaking, setIsAISpeaking] = useState(false);

  // Video element refs for rendering streams
  const videoRef = useRef<HTMLVideoElement>(null);
  const screenRef = useRef<HTMLVideoElement>(null);

  // Custom hooks for managing different aspects of the video call
  const {
    mediaStream,
    isMuted,
    isCameraOff,
    toggleMute,
    toggleCamera,
    handleDeviceChange,
    stopMediaStream,
  } = useMediaStream(isInterviewStarted);

  const { screenStream, isScreenSharing, toggleScreenShare, stopScreenShare } = useScreenShare();

  const {
    isCameraRecording,
    cameraRecordedChunks,
    startCameraRecording,
    stopCameraRecording,
    downloadCameraRecording,
    isScreenRecording,
    screenRecordedChunks,
    startScreenRecording,
    stopScreenRecording,
    downloadScreenRecording,
    stopAllRecordings,
  } = useRecording();

  const { transcriptMessages, stopRecognition } = useSpeechRecognition(isInterviewStarted, isMuted);

  const { takeSnapshot, canvasRef } = useSnapshot();

  // Update video refs when streams change
  useEffect(() => {
    if (videoRef.current && mediaStream) {
      videoRef.current.srcObject = mediaStream;
      console.log('Video ref updated with media stream');
    }
  }, [mediaStream]);

  useEffect(() => {
    if (screenRef.current && screenStream) {
      screenRef.current.srcObject = screenStream;
      console.log('Screen ref updated with screen stream');
    }
  }, [screenStream]);

  // Simulate speaking detection for demo purposes
  useEffect(() => {
    if (!isInterviewStarted) return;

    const speakingInterval = setInterval(() => {
      // Simulate random user speaking
      if (Math.random() > 0.8) {
        setIsUserSpeaking(true);
        setTimeout(() => setIsUserSpeaking(false), 1000);
      }

      // Simulate random AI speaking
      if (Math.random() > 0.9) {
        setIsAISpeaking(true);
        setTimeout(() => setIsAISpeaking(false), 1500);
      }
    }, 2000);

    return () => clearInterval(speakingInterval);
  }, [isInterviewStarted]);

  // Enhanced monitoring based on session instructions
  useEffect(() => {
    if (!isInterviewStarted || !applicationData.sessionInstruction) return;

    const { sessionInstruction } = applicationData;
    const intervals: NodeJS.Timeout[] = [];

    // Screen monitoring
    if (
      sessionInstruction.screenMonitoring &&
      sessionInstruction.screenMonitoringMode === 'photo'
    ) {
      const interval = sessionInstruction.screenMonitoringInterval || 30;
      const screenMonitoringInterval = setInterval(() => {
        console.log(`Screen monitoring snapshot taken at: ${new Date().toISOString()}`);
        if (screenRef.current) {
          takeSnapshot(screenRef, `screen-monitor-${Date.now()}.jpg`);
        }
      }, interval * 1000);
      intervals.push(screenMonitoringInterval);
    }

    // Camera monitoring
    if (
      sessionInstruction.cameraMonitoring &&
      sessionInstruction.cameraMonitoringMode === 'photo'
    ) {
      const interval = sessionInstruction.cameraMonitoringInterval || 30;
      const cameraMonitoringInterval = setInterval(() => {
        console.log(`Camera monitoring snapshot taken at: ${new Date().toISOString()}`);
        if (videoRef.current) {
          takeSnapshot(videoRef, `camera-monitor-${Date.now()}.jpg`);
        }
      }, interval * 1000);
      intervals.push(cameraMonitoringInterval);
    }

    // Video monitoring (continuous recording)
    if (
      sessionInstruction.cameraMonitoring &&
      sessionInstruction.cameraMonitoringMode === 'video'
    ) {
      console.log('Starting continuous camera recording for monitoring');
      startCameraRecording(mediaStream);
    }

    if (
      sessionInstruction.screenMonitoring &&
      sessionInstruction.screenMonitoringMode === 'video' &&
      screenStream
    ) {
      console.log('Starting continuous screen recording for monitoring');
      startScreenRecording(screenStream);
    }

    return () => {
      intervals.forEach(clearInterval);
    };
  }, [
    isInterviewStarted,
    applicationData,
    mediaStream,
    screenStream,
    takeSnapshot,
    startCameraRecording,
    startScreenRecording,
    videoRef,
    screenRef,
  ]);

  // Legacy monitoring - kept for backward compatibility
  useEffect(() => {
    if (!isInterviewStarted || applicationData.sessionInstruction) return;

    const snapshotInterval = setInterval(() => {
      console.log('Periodic snapshot taken at:', new Date().toISOString());
      // Note: This just logs, doesn't actually take snapshots to avoid downloads
    }, 30000);

    return () => clearInterval(snapshotInterval);
  }, [isInterviewStarted, applicationData.sessionInstruction]);

  // Start interview handler
  const startInterview = useCallback(() => {
    setIsInterviewStarted(true);
    console.log('Interview started');
  }, []);

  // End call handler - cleanup all resources
  const endCall = useCallback(() => {
    // Stop all media streams
    stopMediaStream();
    stopScreenShare();

    // Stop all recordings
    stopAllRecordings();

    // Stop speech recognition
    stopRecognition();

    // Navigate back
    window.history.back();
  }, [stopMediaStream, stopScreenShare, stopAllRecordings, stopRecognition]);

  // Take snapshot handler - captures from current video source
  const handleTakeSnapshot = useCallback(() => {
    const currentVideoRef = isScreenSharing ? screenRef : videoRef;
    takeSnapshot(currentVideoRef);
  }, [isScreenSharing, takeSnapshot]);

  // Recording handlers that pass the appropriate streams
  const handleStartCameraRecording = useCallback(() => {
    startCameraRecording(mediaStream);
  }, [startCameraRecording, mediaStream]);

  const handleStartScreenRecording = useCallback(() => {
    startScreenRecording(screenStream);
  }, [startScreenRecording, screenStream]);

  // Show start screen if interview hasn't started yet
  if (!isInterviewStarted) {
    return (
      <InterviewStartScreen
        onStartInterview={startInterview}
        onCancel={() => window.history.back()}
        applicationData={applicationData}
      />
    );
  }

  return (
    <div className="h-screen bg-background text-foreground flex flex-col overflow-hidden">
      {/* Header with status indicators */}
      <header className="flex items-center justify-between p-4 bg-card border-b border-border flex-shrink-0">
        <div className="flex items-center space-x-3">
          <h1 className="text-lg font-semibold text-foreground">
            {applicationData.jobDetails.title} - Interview
          </h1>

          {/* Monitoring status indicators */}
          {applicationData.sessionInstruction?.screenMonitoring && (
            <span className="px-2 py-1 bg-purple-500 text-white text-xs rounded">
              Screen Monitoring: {applicationData.sessionInstruction.screenMonitoringMode}
            </span>
          )}
          {applicationData.sessionInstruction?.cameraMonitoring && (
            <span className="px-2 py-1 bg-orange-500 text-white text-xs rounded">
              Camera Monitoring: {applicationData.sessionInstruction.cameraMonitoringMode}
            </span>
          )}

          {/* Status indicators */}
          {isScreenSharing && (
            <span className="px-2 py-1 bg-primary text-primary-foreground text-xs rounded animate-pulse">
              Screen Sharing
            </span>
          )}
          {isCameraRecording && (
            <span className="px-2 py-1 bg-destructive text-destructive-foreground text-xs rounded animate-pulse">
              ● Camera Recording
            </span>
          )}
          {isScreenRecording && (
            <span className="px-2 py-1 bg-primary text-primary-foreground text-xs rounded animate-pulse">
              ● Screen Recording
            </span>
          )}
        </div>

        {/* Timer display */}
        <TimerDisplay
          totalQuestions={applicationData.instructionsForAi?.totalQuestions}
          duration={applicationData.sessionInstruction.duration}
        />
      </header>

      {/* Main Content Area - Single unified layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Side - Video Area */}
        <div className="flex-1 relative bg-muted overflow-hidden">
          {/* Main User Camera */}
          <div className="w-full h-full relative flex items-center justify-center">
            {/* 
              Video Layout Hierarchy:
              - User Video: Always full screen/area (base layer)
              - AI Video: Always top-right corner (z-20)
              - Screen Share: Always bottom-right corner when active (z-15)
              - Status Indicators: Top-left corner (z-10)
            */}
            <UserVideoFeed
              videoRef={videoRef}
              isCameraOff={isCameraOff}
              isUserSpeaking={isUserSpeaking}
            />

            {/* Status Indicators */}
            <div className="absolute top-4 left-4 flex flex-col space-y-2 z-10">
              {isMuted && (
                <div className="bg-destructive text-destructive-foreground px-2 py-1 rounded text-xs">
                  Muted
                </div>
              )}
              {isCameraRecording && (
                <div className="bg-destructive text-destructive-foreground px-2 py-1 rounded text-xs animate-pulse">
                  ● Recording
                </div>
              )}
            </div>

            {/* AI Video Feed - Always Top Right Corner of User Video */}
            <div className="absolute top-4 right-4 w-32 h-24 md:w-48 md:h-36 z-20">
              <AIVideoFeed isAISpeaking={isAISpeaking} />
            </div>

            {/* Screen Share - Always Bottom Right Corner of User Video (when active) */}
            {isScreenSharing && screenStream && (
              <div className="absolute bottom-4 right-4 w-48 h-32 md:w-64 md:h-40 rounded-lg overflow-hidden border-2 border-primary shadow-lg z-15">
                <video
                  ref={screenRef}
                  autoPlay
                  muted
                  playsInline
                  className="w-full h-full object-contain bg-muted"
                />

                {/* Screen share label */}
                <div className="absolute top-1 left-1 bg-primary px-2 py-1 rounded text-xs text-primary-foreground">
                  Screen Share
                </div>

                {/* Screen Recording Controls - Compact */}
                <div className="absolute bottom-1 left-1 flex space-x-1">
                  {!isScreenRecording ? (
                    <Button
                      size="sm"
                      onClick={handleStartScreenRecording}
                      variant="default"
                      className="text-xs px-2 py-1 h-6"
                    >
                      Rec
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      onClick={stopScreenRecording}
                      variant="destructive"
                      className="text-xs px-2 py-1 h-6 animate-pulse"
                    >
                      Stop
                    </Button>
                  )}

                  {screenRecordedChunks.length > 0 && !isScreenRecording && (
                    <Button
                      size="sm"
                      onClick={downloadScreenRecording}
                      variant="secondary"
                      className="text-xs px-1 py-1 h-6"
                    >
                      <Download size={10} />
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Side - Chat Transcript (Hidden on mobile, shown on desktop) */}
        <div className="hidden md:flex w-80 lg:w-96 bg-card border-l border-border flex-shrink-0">
          <ChatTranscript messages={transcriptMessages} />
        </div>

        {/* Mobile Chat Overlay (only on mobile when toggled) */}
        {showMobileChat && (
          <div className="md:hidden absolute inset-x-4 bottom-24 bg-card rounded-lg shadow-xl border border-border max-h-80 overflow-hidden z-30">
            <div className="p-3 border-b border-border flex justify-between items-center">
              <h3 className="text-sm font-semibold">Interview Transcript</h3>
              <Button
                size="sm"
                onClick={() => setShowMobileChat(false)}
                variant="ghost"
                className="h-6 w-6 p-0"
              >
                ×
              </Button>
            </div>
            <div className="h-64 overflow-y-auto">
              <ChatTranscript messages={transcriptMessages} />
            </div>
          </div>
        )}
      </div>

      {/* Bottom Controls Panel - Always at bottom, separate from content */}
      <div className="bg-card border-t border-border p-3 md:p-4 flex-shrink-0">
        <div className="flex justify-center items-center space-x-2">
          {/* Mobile Chat Toggle (only on mobile) */}
          <div className="md:hidden">
            <Button
              size="sm"
              onClick={() => setShowMobileChat(!showMobileChat)}
              variant={showMobileChat ? 'default' : 'outline'}
              className="px-3 py-2"
            >
              Chat
            </Button>
          </div>

          {/* Main Media Controls */}
          <MediaControls
            isMuted={isMuted}
            isCameraOff={isCameraOff}
            isRecording={isCameraRecording}
            isScreenSharing={isScreenSharing}
            onToggleMute={toggleMute}
            onToggleCamera={toggleCamera}
            onToggleScreenShare={toggleScreenShare}
            onStartRecording={handleStartCameraRecording}
            onStopRecording={stopCameraRecording}
            onDownloadRecording={downloadCameraRecording}
            onTakeSnapshot={handleTakeSnapshot}
            onEndCall={endCall}
            onShowDeviceSelector={() => setShowDeviceSelector(true)}
            hasRecording={cameraRecordedChunks.length > 0}
          />
        </div>
      </div>

      {/* Device Selector Modal */}
      {showDeviceSelector && (
        <DeviceSelector
          onClose={() => setShowDeviceSelector(false)}
          onDeviceChange={handleDeviceChange}
        />
      )}

      {/* Hidden canvas for snapshot functionality */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Monitoring Information Footer */}
      {(applicationData.sessionInstruction?.screenMonitoring ||
        applicationData.sessionInstruction?.cameraMonitoring) && (
        <div className="px-4 py-2 bg-yellow-50 border-t border-yellow-200 text-xs text-yellow-800 flex items-center justify-center">
          <span className="mr-2">🔒</span>
          <span>
            This session includes monitoring features for security and assessment purposes.
            {applicationData.sessionInstruction?.screenMonitoring &&
              ` Screen: ${applicationData.sessionInstruction.screenMonitoringMode}`}
            {applicationData.sessionInstruction?.cameraMonitoring &&
              ` | Camera: ${applicationData.sessionInstruction.cameraMonitoringMode}`}
          </span>
        </div>
      )}
    </div>
  );
};

export default VideoCall;
