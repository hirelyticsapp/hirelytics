import { Camera, CheckCircle, Clock, Mic, Monitor, Play, Users, Video } from 'lucide-react';
import React from 'react';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface InterviewStartScreenProps {
  onStartInterview: () => void;
  onCancel: () => void;
}

/**
 * Interview Start Screen Component
 * Displays welcome message and instructions before starting the interview
 */
const InterviewStartScreen: React.FC<InterviewStartScreenProps> = ({
  onStartInterview,
  onCancel,
}) => {
  return (
    <div className="min-h-screen flex items-center justify-center p-2 bg-background">
      <Card className="max-w-4xl w-full mx-2 p-6 bg-card text-card-foreground border border-border">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
            <Video className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">AI Video Interview</h1>
          <p className="text-base text-muted-foreground">
            Professional interview session with AI assistant
          </p>
        </div>

        {/* Session Info */}
        <div className="grid md:grid-cols-3 gap-3 mb-6">
          <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground bg-muted rounded-lg p-3">
            <Users size={18} className="text-primary" />
            <span>You + AI Interviewer</span>
          </div>
          <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground bg-muted rounded-lg p-3">
            <Clock size={18} className="text-primary" />
            <span>20 minute session</span>
          </div>
          <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground bg-muted rounded-lg p-3">
            <CheckCircle size={18} className="text-green-500" />
            <span>Auto-recorded</span>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 mb-6">
          {/* Interview Features */}
          <div>
            <h2 className="text-lg font-semibold text-foreground mb-3">Interview Features</h2>
            <div className="grid gap-3">
              <div className="flex items-start space-x-3 p-3 bg-accent rounded-lg">
                <Video className="w-6 h-6 text-primary mt-1" />
                <div>
                  <h3 className="font-medium text-foreground">Video Recording</h3>
                  <p className="text-sm text-muted-foreground">
                    Combined audio & video recording for review
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3 p-3 bg-accent rounded-lg">
                <Mic className="w-6 h-6 text-green-600 mt-1" />
                <div>
                  <h3 className="font-medium text-foreground">Live Transcription</h3>
                  <p className="text-sm text-muted-foreground">
                    Real-time speech-to-text conversion
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3 p-3 bg-accent rounded-lg">
                <Monitor className="w-6 h-6 text-purple-600 mt-1" />
                <div>
                  <h3 className="font-medium text-foreground">Screen Sharing</h3>
                  <p className="text-sm text-muted-foreground">Share presentations or portfolios</p>
                </div>
              </div>
              <div className="flex items-start space-x-3 p-3 bg-accent rounded-lg">
                <Camera className="w-6 h-6 text-orange-600 mt-1" />
                <div>
                  <h3 className="font-medium text-foreground">Snapshots</h3>
                  <p className="text-sm text-muted-foreground">
                    Capture important moments during interview
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Pre-Interview Checklist */}
          <div>
            <h2 className="text-lg font-semibold text-foreground mb-3">Before You Start</h2>
            <div className="space-y-2">
              <div className="flex items-center space-x-3 p-2 bg-muted rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="text-foreground">Ensure stable internet connection</span>
              </div>
              <div className="flex items-center space-x-3 p-2 bg-muted rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="text-foreground">Test your camera and microphone</span>
              </div>
              <div className="flex items-center space-x-3 p-2 bg-muted rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="text-foreground">Find a quiet, well-lit environment</span>
              </div>
              <div className="flex items-center space-x-3 p-2 bg-muted rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="text-foreground">
                  Prepare your resume and portfolio (optional)
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Start Button */}
        <div className="flex space-x-4 justify-center pt-4 w-full">
          <Button
            onClick={onCancel}
            variant="outline"
            className="w-full max-w-xs flex items-center justify-center"
          >
            <Camera size={20} className="mr-2" />
            Cancel
          </Button>
          <Button
            onClick={onStartInterview}
            variant="default"
            className="px-8 py-3 text-lg w-full max-w-xs"
          >
            <Play size={20} className="mr-2" />
            Start Interview
          </Button>
        </div>

        <div className="mt-4 text-center">
          <p className="text-xs text-muted-foreground">
            By proceeding, you agree to allow camera and microphone access for the interview
            session.
          </p>
          <p className="text-xs text-muted-foreground/70 mt-1">
            Recording will start automatically and can be downloaded after completion.
          </p>
        </div>
      </Card>
    </div>
  );
};

export default InterviewStartScreen;
