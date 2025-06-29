'use client';
import { Camera, CheckCircle, Monitor, MonitorPlay, Video } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useCallback, useEffect, useRef, useState } from 'react';

import { updateJobApplicationLanguage, uploadScreenImage } from '@/actions/job-application';
import { Button } from '@/components/ui/button';

// Import custom hooks for managing different aspects of the video call
import { useMediaStream } from '../hooks/use-media-stream';
import { useRecording } from '../hooks/use-recording';
import { useScreenMonitoring } from '../hooks/use-screen-monitoring';
import { useScreenShare } from '../hooks/use-screen-share';
import { useSnapshot } from '../hooks/use-snapshot';
import { useSpeechRecognition } from '../hooks/use-speech-recognition';
import AIVideoFeed from './ai-video-feed';
import ChatTranscript from './chat-transcript';
import DeviceSelector from './device-selector';
import InterviewLanguageSelector from './interview-language-selector';
// Import UI components
import InterviewStartScreen from './interview-start-screen';
import MediaControls from './media-control';
import ThemeToggle from './theme-toggle';
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
  // Next.js router for navigation
  const router = useRouter();

  // Main state for interview flow
  const [isInterviewStarted, setIsInterviewStarted] = useState(false);

  // Language state
  const [currentLanguage, setCurrentLanguage] = useState(applicationData.preferredLanguage);

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

  const {
    screenStream,
    isScreenSharing,
    toggleScreenShare: _toggleScreenShare,
    stopScreenShare,
  } = useScreenShare();

  // Screen monitoring hook for mandatory screen sharing
  const {
    screenStream: monitoringScreenStream,
    isScreenSharing: isMonitoringScreenSharing,
    screenShareError,
    isScreenShareRequired,
    startMandatoryScreenShare,
    stopScreenShare: stopMonitoringScreenShare,
    setScreenShareRequired,
    isScreenShareActive,
    captureScreenSnapshot,
  } = useScreenMonitoring();

  const {
    isCameraRecording,
    cameraRecordedChunks: _cameraRecordedChunks, // Hidden for production
    startCameraRecording,
    stopCameraRecording: _stopCameraRecording, // Hidden for production
    downloadCameraRecording: _downloadCameraRecording, // Hidden for production
    isScreenRecording,
    screenRecordedChunks: _screenRecordedChunks,
    startScreenRecording,
    stopScreenRecording: _stopScreenRecording,
    downloadScreenRecording: _downloadScreenRecording,
    stopAllRecordings,
  } = useRecording();

  const { transcriptMessages, stopRecognition, isAITyping } = useSpeechRecognition(
    isInterviewStarted,
    isMuted
  );

  const {
    takeSnapshot,
    takeMonitoringSnapshot,
    canvasRef,
    isUploading: isUploadingSnapshot,
    uploadError: snapshotUploadError,
  } = useSnapshot();

  // Update video refs when streams change
  useEffect(() => {
    if (videoRef.current && mediaStream) {
      videoRef.current.srcObject = mediaStream;
      console.log('Video ref updated with media stream');
    }
  }, [mediaStream]);

  useEffect(() => {
    if (screenRef.current) {
      // Prioritize monitoring screen stream over regular screen sharing
      const streamToUse = monitoringScreenStream || screenStream;
      if (streamToUse) {
        screenRef.current.srcObject = streamToUse;
        console.log(
          'Screen ref updated with stream:',
          monitoringScreenStream ? 'monitoring' : 'regular'
        );
      }
    }
  }, [screenStream, monitoringScreenStream]);

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
      const screenMonitoringInterval = setInterval(async () => {
        console.log(`Screen monitoring snapshot taken at: ${new Date().toISOString()}`);
        try {
          // Use the monitoring screen stream capture function
          const imageData = await captureScreenSnapshot();
          if (imageData) {
            await uploadScreenImage(applicationData.id, imageData);
            console.log('Screen monitoring image uploaded successfully');
          }
        } catch (error) {
          console.error('Error capturing/uploading screen monitoring image:', error);
        }
      }, interval * 1000);
      intervals.push(screenMonitoringInterval);
    }

    // Camera monitoring - Photo mode
    if (
      sessionInstruction.cameraMonitoring &&
      sessionInstruction.cameraMonitoringMode === 'photo'
    ) {
      const interval = sessionInstruction.cameraMonitoringInterval || 30;
      const cameraMonitoringInterval = setInterval(async () => {
        console.log(`Camera monitoring snapshot taken at: ${new Date().toISOString()}`);
        if (videoRef.current) {
          await takeMonitoringSnapshot(videoRef, applicationData.id, 'camera');
        }
      }, interval * 1000);
      intervals.push(cameraMonitoringInterval);
    }

    // Camera monitoring - Video mode (TODO: Implementation pending)
    if (
      sessionInstruction.cameraMonitoring &&
      sessionInstruction.cameraMonitoringMode === 'video'
    ) {
      // TODO: Implement automatic video recording and upload for camera monitoring
      console.log('Camera video monitoring mode - Implementation pending');
      console.log('This will automatically record and upload video segments to the server');
      // Future implementation:
      // - Start continuous recording in chunks (e.g., 5-minute segments)
      // - Automatically upload each chunk to the server
      // - Handle recording failures and retries
      // - Optimize video compression and quality
    }

    // Screen monitoring - Video mode
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
    takeMonitoringSnapshot,
    captureScreenSnapshot,
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
  const startInterview = useCallback(async () => {
    try {
      // Check if screen monitoring is required
      if (applicationData.sessionInstruction?.screenMonitoring) {
        setScreenShareRequired(true);

        // Start mandatory screen sharing before allowing interview to start
        await startMandatoryScreenShare();
        console.log('Screen monitoring started for interview');
      }

      setIsInterviewStarted(true);
      console.log('Interview started');
    } catch (error) {
      console.error('Failed to start interview:', error);
      // Don't start interview if screen sharing failed
      alert(
        'Screen sharing is required for this interview. Please allow screen sharing to continue.'
      );
    }
  }, [applicationData.sessionInstruction, setScreenShareRequired, startMandatoryScreenShare]);

  // End call handler - cleanup all resources
  const endCall = useCallback(() => {
    // Stop all media streams
    stopMediaStream();
    stopScreenShare();
    stopMonitoringScreenShare(); // Stop monitoring screen share

    // Stop all recordings
    stopAllRecordings();

    // Stop speech recognition
    stopRecognition();

    // Reset screen monitoring requirement
    setScreenShareRequired(false);

    // Navigate back to my applications page
    router.push('/my-applications');
  }, [
    stopMediaStream,
    stopScreenShare,
    stopMonitoringScreenShare,
    stopAllRecordings,
    stopRecognition,
    setScreenShareRequired,
    router,
  ]);

  // Take snapshot handler - captures from current video source (Hidden for production)
  const _handleTakeSnapshot = useCallback(() => {
    const currentVideoRef = isScreenSharing ? screenRef : videoRef;
    takeSnapshot(currentVideoRef);
  }, [isScreenSharing, takeSnapshot]);

  // Recording handlers that pass the appropriate streams (Hidden for production)
  const _handleStartCameraRecording = useCallback(() => {
    startCameraRecording(mediaStream);
  }, [startCameraRecording, mediaStream]);

  const _handleStartScreenRecording = useCallback(() => {
    startScreenRecording(screenStream);
  }, [startScreenRecording, screenStream]);

  // Language update handler
  const handleLanguageChange = useCallback(
    async (languageCode: string) => {
      try {
        await updateJobApplicationLanguage(applicationData.uuid, languageCode);
        setCurrentLanguage(languageCode);

        // Update the applicationData object for consistency
        applicationData.preferredLanguage = languageCode;
      } catch (error) {
        console.error('Failed to update language:', error);
        throw error; // Re-throw to let the component handle the error notification
      }
    },
    [applicationData]
  );

  // Monitor screen sharing during interview for mandatory monitoring
  useEffect(() => {
    if (!isInterviewStarted || !applicationData.sessionInstruction?.screenMonitoring) return;

    // Check if screen share is still active every 5 seconds
    const checkInterval = setInterval(() => {
      if (!isScreenShareActive()) {
        console.error('Screen sharing stopped during interview - pausing interview');
        setIsInterviewStarted(false);
        alert(
          'Screen sharing has stopped. The interview has been paused. Please restart screen sharing to continue.'
        );
      }
    }, 5000);

    return () => clearInterval(checkInterval);
  }, [isInterviewStarted, applicationData.sessionInstruction, isScreenShareActive]);

  // Show start screen if interview hasn't started yet
  if (!isInterviewStarted) {
    return (
      <InterviewStartScreen
        onStartInterview={startInterview}
        onCancel={() => window.history.back()}
        applicationData={applicationData}
        onLanguageChange={handleLanguageChange}
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

          {/* Monitoring status indicators - Short versions with proper icons */}
          {applicationData.sessionInstruction?.screenMonitoring && (
            <span className="px-2 py-1 bg-purple-500 text-white text-xs rounded flex items-center gap-1">
              <Monitor className="w-3 h-3" />
              {applicationData.sessionInstruction.screenMonitoringMode === 'photo' ? (
                <Camera className="w-3 h-3" />
              ) : (
                <Video className="w-3 h-3" />
              )}
            </span>
          )}
          {applicationData.sessionInstruction?.cameraMonitoring && (
            <span className="px-2 py-1 bg-orange-500 text-white text-xs rounded flex items-center gap-1">
              <Camera className="w-3 h-3" />
              {applicationData.sessionInstruction.cameraMonitoringMode === 'photo' ? (
                <Camera className="w-3 h-3" />
              ) : (
                <Video className="w-3 h-3" />
              )}
            </span>
          )}

          {/* Status indicators - Short versions with proper icons */}
          {isScreenSharing && (
            <span className="px-2 py-1 bg-primary text-primary-foreground text-xs rounded animate-pulse flex items-center gap-1">
              <MonitorPlay className="w-3 h-3" />
              <span>Share</span>
            </span>
          )}
          {isCameraRecording && (
            <span className="px-2 py-1 bg-destructive text-destructive-foreground text-xs rounded animate-pulse flex items-center gap-1">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
              <span>Rec</span>
            </span>
          )}
          {isScreenRecording && (
            <span className="px-2 py-1 bg-primary text-primary-foreground text-xs rounded animate-pulse flex items-center gap-1">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
              <span>Screen</span>
            </span>
          )}
        </div>

        {/* Language Selector, Theme Toggle and Timer */}
        <div className="flex items-center space-x-3">
          <InterviewLanguageSelector
            currentLanguage={currentLanguage}
            onLanguageChange={handleLanguageChange}
            disabled={false}
          />

          <ThemeToggle />

          {/* Timer display */}
          <TimerDisplay
            totalQuestions={applicationData.instructionsForAi?.totalQuestions}
            duration={applicationData.sessionInstruction.duration}
          />
        </div>
      </header>

      {/* Main Content Area - Single unified layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Side - Video Area - 60% width */}
        <div className="w-[60%] relative bg-muted overflow-hidden">
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
            {((isScreenSharing && screenStream) ||
              (isMonitoringScreenSharing && monitoringScreenStream)) && (
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
                  {isMonitoringScreenSharing ? 'Screen Monitoring' : 'Screen Share'}
                </div>

                {/* Screen Recording Controls - Compact */}
                {/* <div className="absolute bottom-1 left-1 flex space-x-1">
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
                </div> */}
              </div>
            )}

            {/* Monitoring Status Indicators */}
            {(applicationData.sessionInstruction?.cameraMonitoring ||
              applicationData.sessionInstruction?.screenMonitoring) && (
              <div className="absolute top-4 right-4 flex flex-col space-y-2 z-10">
                {/* Screen monitoring requirement indicator */}
                {applicationData.sessionInstruction?.screenMonitoring &&
                  isScreenShareRequired &&
                  !isMonitoringScreenSharing && (
                    <div className="bg-orange-500 text-white px-2 py-1 rounded text-xs animate-pulse">
                      Screen sharing required for monitoring
                    </div>
                  )}
                {/* Screen monitoring active indicator */}
                {applicationData.sessionInstruction?.screenMonitoring &&
                  isMonitoringScreenSharing && (
                    <div className="bg-green-500 text-white px-2 py-1 rounded text-xs">
                      Screen monitoring active
                    </div>
                  )}
                {/* Screen sharing error */}
                {screenShareError && (
                  <div className="bg-destructive text-destructive-foreground px-2 py-1 rounded text-xs">
                    {screenShareError}
                  </div>
                )}

                {isUploadingSnapshot && (
                  <div className="bg-blue-500 text-white px-2 py-1 rounded text-xs animate-pulse">
                    Uploading monitoring data...
                  </div>
                )}
                {snapshotUploadError && (
                  <div className="bg-destructive text-destructive-foreground px-2 py-1 rounded text-xs">
                    Upload error: {snapshotUploadError}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Side - Chat Transcript - 40% width (Hidden on mobile, shown on desktop) */}
        <div className="hidden md:flex w-[40%] bg-card border-l border-border flex-shrink-0">
          <ChatTranscript messages={transcriptMessages} isAITyping={isAITyping} />
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
              <ChatTranscript messages={transcriptMessages} isAITyping={isAITyping} />
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
            onToggleMute={toggleMute}
            onToggleCamera={toggleCamera}
            onEndCall={endCall}
            onShowDeviceSelector={() => setShowDeviceSelector(true)}
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
          <CheckCircle className="w-4 h-4 mr-2 text-yellow-600" />
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
