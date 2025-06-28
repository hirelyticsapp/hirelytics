import { Camera, CheckCircle, Clock, Mic, Monitor, Play, Users, Video } from 'lucide-react';
import React from 'react';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface ApplicationData {
  candidate: {
    name: string;
  };
  jobDetails: {
    title: string;
    description: string;
    skills: string[];
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
    instruction?: string;
    totalQuestions: number;
    difficultyLevel: 'easy' | 'normal' | 'hard' | 'expert' | 'advanced';
    questionMode?: 'manual' | 'ai-mode';
  };
}

interface InterviewStartScreenProps {
  onStartInterview: () => void;
  onCancel: () => void;
  applicationData: ApplicationData;
}

/**
 * Interview Start Screen Component
 * Displays welcome message and instructions before starting the interview
 */
const InterviewStartScreen: React.FC<InterviewStartScreenProps> = ({
  onStartInterview,
  onCancel,
  applicationData,
}) => {
  const totalQuestions = applicationData.instructionsForAi?.totalQuestions || 10;
  // Use duration from session instruction (mandatory field)
  const estimatedDuration = applicationData.sessionInstruction.duration;
  const difficultyLevel = applicationData.instructionsForAi?.difficultyLevel || 'normal';

  return (
    <div className="h-screen flex items-center justify-center p-4 bg-background overflow-hidden">
      <Card className="max-w-5xl w-full h-fit max-h-[95vh] overflow-y-auto p-6 bg-card text-card-foreground border border-border">
        <div className="text-center mb-4">
          <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mx-auto mb-3">
            <Video className="w-6 h-6 text-primary-foreground" />
          </div>
          <h1 className="text-xl font-bold text-foreground mb-1">
            {applicationData.jobDetails.title} - AI Interview
          </h1>
          <p className="text-sm text-muted-foreground">Welcome {applicationData.candidate.name}</p>
        </div>

        {/* Session Info */}
        <div className="grid md:grid-cols-3 gap-2 mb-4">
          <div className="flex items-center justify-center space-x-2 text-xs text-muted-foreground bg-muted rounded-lg p-2">
            <Users size={16} className="text-primary" />
            <span>You + AI Interviewer</span>
          </div>
          <div className="flex items-center justify-center space-x-2 text-xs text-muted-foreground bg-muted rounded-lg p-2">
            <Clock size={16} className="text-primary" />
            <span>{estimatedDuration} minute session</span>
          </div>
          <div className="flex items-center justify-center space-x-2 text-xs text-muted-foreground bg-muted rounded-lg p-2">
            <CheckCircle size={16} className="text-green-500" />
            <span>
              {totalQuestions} Questions •{' '}
              {difficultyLevel.charAt(0).toUpperCase() + difficultyLevel.slice(1)}
            </span>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-4 mb-4">
          {/* Interview Session Details */}
          <div>
            <h2 className="text-base font-semibold text-foreground mb-2">Session Information</h2>
            <div className="space-y-2">
              {/* Duration and Questions */}
              <div className="p-3 bg-muted rounded-lg">
                <h3 className="text-sm font-medium text-foreground mb-2">Interview Details</h3>
                <div className="text-xs text-muted-foreground space-y-1">
                  <p>• Duration: {estimatedDuration} minutes</p>
                  <p>• Total questions: {totalQuestions}</p>
                  <p>
                    • Difficulty:{' '}
                    {difficultyLevel.charAt(0).toUpperCase() + difficultyLevel.slice(1)}
                  </p>
                  {applicationData.instructionsForAi?.questionMode && (
                    <p>
                      • Question mode:{' '}
                      {applicationData.instructionsForAi.questionMode === 'ai-mode'
                        ? 'AI Generated'
                        : 'Manual'}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Active Features */}
          <div>
            <h2 className="text-base font-semibold text-foreground mb-2">Active Features</h2>
            <div className="grid gap-2">
              {/* Core Features - Always enabled */}
              <div className="flex items-start space-x-2 p-2 bg-accent rounded-lg">
                <Video className="w-5 h-5 text-primary mt-0.5" />
                <div>
                  <h3 className="text-sm font-medium text-foreground">Video Recording</h3>
                  <p className="text-xs text-muted-foreground">Audio & video recording active</p>
                </div>
              </div>

              <div className="flex items-start space-x-2 p-2 bg-accent rounded-lg">
                <Mic className="w-5 h-5 text-green-600 mt-0.5" />
                <div>
                  <h3 className="text-sm font-medium text-foreground">Live Transcription</h3>
                  <p className="text-xs text-muted-foreground">Real-time speech-to-text</p>
                </div>
              </div>

              {/* Optional Features - Only show if enabled */}
              {applicationData.sessionInstruction.screenMonitoring === true && (
                <div className="flex items-start space-x-2 p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <Monitor className="w-5 h-5 text-yellow-600 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-medium text-yellow-800">Screen Monitoring</h3>
                    <p className="text-xs text-yellow-700">
                      {applicationData.sessionInstruction.screenMonitoringMode === 'video'
                        ? 'Continuous screen recording'
                        : `Screen snapshots every ${applicationData.sessionInstruction.screenMonitoringInterval || 30}s`}
                    </p>
                  </div>
                </div>
              )}

              {applicationData.sessionInstruction.cameraMonitoring === true && (
                <div className="flex items-start space-x-2 p-2 bg-orange-50 border border-orange-200 rounded-lg">
                  <Camera className="w-5 h-5 text-orange-600 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-medium text-orange-800">Camera Monitoring</h3>
                    <p className="text-xs text-orange-700">
                      {applicationData.sessionInstruction.cameraMonitoringMode === 'video'
                        ? 'Continuous camera recording'
                        : `Camera snapshots every ${applicationData.sessionInstruction.cameraMonitoringInterval || 30}s`}
                    </p>
                  </div>
                </div>
              )}

              {/* Show a message if no monitoring features are enabled */}
              {!applicationData.sessionInstruction.screenMonitoring &&
                !applicationData.sessionInstruction.cameraMonitoring && (
                  <div className="flex items-start space-x-2 p-2 bg-blue-50 border border-blue-200 rounded-lg">
                    <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                      <h3 className="text-sm font-medium text-blue-800">Privacy Mode</h3>
                      <p className="text-xs text-blue-700">No additional monitoring enabled</p>
                    </div>
                  </div>
                )}
            </div>
          </div>
        </div>

        {/* Ready to Start Section */}
        <div className="text-center mb-4">
          <h3 className="text-base font-semibold text-foreground mb-2">Ready to Begin?</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 max-w-2xl mx-auto">
            <div className="flex items-center space-x-1 p-2 bg-green-50 border border-green-200 rounded-lg">
              <CheckCircle className="w-3 h-3 text-green-600" />
              <span className="text-green-800 text-xs">Camera Ready</span>
            </div>
            <div className="flex items-center space-x-1 p-2 bg-green-50 border border-green-200 rounded-lg">
              <CheckCircle className="w-3 h-3 text-green-600" />
              <span className="text-green-800 text-xs">Audio Ready</span>
            </div>
            <div className="flex items-center space-x-1 p-2 bg-green-50 border border-green-200 rounded-lg">
              <CheckCircle className="w-3 h-3 text-green-600" />
              <span className="text-green-800 text-xs">Internet Stable</span>
            </div>
            <div className="flex items-center space-x-1 p-2 bg-green-50 border border-green-200 rounded-lg">
              <CheckCircle className="w-3 h-3 text-green-600" />
              <span className="text-green-800 text-xs">Environment Quiet</span>
            </div>
          </div>
        </div>

        {/* Start Buttons */}
        <div className="flex space-x-3 justify-center mb-4">
          <Button onClick={onCancel} variant="outline" className="min-w-28">
            Cancel
          </Button>
          <Button onClick={onStartInterview} className="min-w-28">
            <Play size={16} className="mr-2" />
            Start Interview
          </Button>
        </div>

        {/* Footer Information */}
        <div className="text-center">
          <p className="text-xs text-muted-foreground">
            Camera and microphone access will be required for this interview session.
          </p>
          {(applicationData.sessionInstruction.screenMonitoring ||
            applicationData.sessionInstruction.cameraMonitoring) && (
            <p className="text-xs text-yellow-700 mt-2 bg-yellow-50 border border-yellow-200 rounded px-3 py-1">
              🔒 This session includes monitoring features for security and assessment purposes.
            </p>
          )}
        </div>
      </Card>
    </div>
  );
};

export default InterviewStartScreen;
