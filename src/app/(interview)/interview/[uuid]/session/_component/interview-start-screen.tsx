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
    // <div className="h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-white flex items-center justify-center p-2">
    //   <Card className="max-w-2xl mx-auto p-8 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
    //     <div className="text-center space-y-6">
    //       {/* Header Icon */}
    //       <div className="w-20 h-20 mx-auto bg-blue-600 dark:bg-blue-500 rounded-full flex items-center justify-center">
    //         <Camera size={32} className="text-white" />
    //       </div>

    //       {/* Title */}
    //       <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
    //         Video Interview Session
    //       </h1>

    //       {/* Welcome Message */}
    //       <div className="space-y-4 text-gray-600 dark:text-gray-300">
    //         <p className="text-lg">Welcome to your video interview session!</p>

    //         {/* Instructions List */}
    //         <div className="text-left space-y-3">
    //           <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-3">
    //             Before we begin:
    //           </h3>
    //           <ul className="space-y-2 text-sm">
    //             <li className="flex items-start space-x-2">
    //               <span className="w-2 h-2 bg-blue-500 dark:bg-blue-400 rounded-full mt-2 flex-shrink-0"></span>
    //               <span>Ensure you&apos;re in a quiet, well-lit environment</span>
    //             </li>
    //             <li className="flex items-start space-x-2">
    //               <span className="w-2 h-2 bg-blue-500 dark:bg-blue-400 rounded-full mt-2 flex-shrink-0"></span>
    //               <span>Check your camera and microphone are working properly</span>
    //             </li>
    //             <li className="flex items-start space-x-2">
    //               <span className="w-2 h-2 bg-blue-500 dark:bg-blue-400 rounded-full mt-2 flex-shrink-0"></span>
    //               <span>Have your resume and relevant documents ready</span>
    //             </li>
    //             <li className="flex items-start space-x-2">
    //               <span className="w-2 h-2 bg-blue-500 dark:bg-blue-400 rounded-full mt-2 flex-shrink-0"></span>
    //               <span>The session will be recorded for evaluation purposes</span>
    //             </li>
    //             <li className="flex items-start space-x-2">
    //               <span className="w-2 h-2 bg-blue-500 dark:bg-blue-400 rounded-full mt-2 flex-shrink-0"></span>
    //               <span>You can use screen sharing to present your work if needed</span>
    //             </li>
    //             <li className="flex items-start space-x-2">
    //               <span className="w-2 h-2 bg-blue-500 dark:bg-blue-400 rounded-full mt-2 flex-shrink-0"></span>
    //               <span>Take your time to think before answering questions</span>
    //             </li>
    //           </ul>
    //         </div>

    //         {/* Duration Info */}
    //         <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-700">
    //           <p className="text-blue-700 dark:text-blue-200 text-sm">
    //             <strong>Duration:</strong> This interview session is scheduled for 20 minutes.
    //             Please be concise but thorough in your responses.
    //           </p>
    //         </div>
    //       </div>

    //       {/* Action Buttons */}
    // <div className="flex space-x-4 justify-center pt-4">
    //   <Button
    //     onClick={onCancel}
    //     variant="outline"
    //     className="border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
    //   >
    //     Cancel
    //   </Button>
    //   <Button
    //     onClick={onStartInterview}
    //     className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white px-8 py-3 text-lg"
    //   >
    //     <Play size={20} className="mr-2" />
    //     Start Interview
    //   </Button>
    // </div>
    //     </div>
    //   </Card>
    // </div>

    <div className="min-h-screen flex items-center justify-center p-2 bg-gray-50 dark:bg-gray-900">
      <Card className="max-w-4xl w-full mx-2 p-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-blue-600 dark:bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Video className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">
            AI Video Interview
          </h1>
          <p className="text-base text-gray-600 dark:text-gray-300">
            Professional interview session with AI assistant
          </p>
        </div>

        {/* Session Info */}
        <div className="grid md:grid-cols-3 gap-3 mb-6">
          <div className="flex items-center justify-center space-x-2 text-sm text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
            <Users size={18} className="text-blue-500 dark:text-blue-400" />
            <span>You + AI Interviewer</span>
          </div>
          <div className="flex items-center justify-center space-x-2 text-sm text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
            <Clock size={18} className="text-blue-500 dark:text-blue-400" />
            <span>20 minute session</span>
          </div>
          <div className="flex items-center justify-center space-x-2 text-sm text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
            <CheckCircle size={18} className="text-green-500 dark:text-green-400" />
            <span>Auto-recorded</span>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 mb-6">
          {/* Interview Features */}
          <div>
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-3">
              Interview Features
            </h2>
            <div className="grid gap-3">
              <div className="flex items-start space-x-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <Video className="w-6 h-6 text-blue-600 dark:text-blue-400 mt-1" />
                <div>
                  <h3 className="font-medium text-gray-800 dark:text-gray-100">Video Recording</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Combined audio & video recording for review
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <Mic className="w-6 h-6 text-green-600 dark:text-green-400 mt-1" />
                <div>
                  <h3 className="font-medium text-gray-800 dark:text-gray-100">
                    Live Transcription
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Real-time speech-to-text conversion
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <Monitor className="w-6 h-6 text-purple-600 dark:text-purple-400 mt-1" />
                <div>
                  <h3 className="font-medium text-gray-800 dark:text-gray-100">Screen Sharing</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Share presentations or portfolios
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                <Camera className="w-6 h-6 text-orange-600 dark:text-orange-400 mt-1" />
                <div>
                  <h3 className="font-medium text-gray-800 dark:text-gray-100">Snapshots</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Capture important moments during interview
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Pre-Interview Checklist */}
          <div>
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-3">
              Before You Start
            </h2>
            <div className="space-y-2">
              <div className="flex items-center space-x-3 p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-500 dark:text-green-400" />
                <span className="text-gray-700 dark:text-gray-200">
                  Ensure stable internet connection
                </span>
              </div>
              <div className="flex items-center space-x-3 p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-500 dark:text-green-400" />
                <span className="text-gray-700 dark:text-gray-200">
                  Test your camera and microphone
                </span>
              </div>
              <div className="flex items-center space-x-3 p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-500 dark:text-green-400" />
                <span className="text-gray-700 dark:text-gray-200">
                  Find a quiet, well-lit environment
                </span>
              </div>
              <div className="flex items-center space-x-3 p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-500 dark:text-green-400" />
                <span className="text-gray-700 dark:text-gray-200">
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
            className="border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 w-full max-w-xs flex items-center justify-center"
          >
            <Camera size={20} className="mr-2" />
            Cancel
          </Button>
          <Button
            onClick={onStartInterview}
            className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white px-8 py-3 text-lg w-full max-w-xs"
          >
            <Play size={20} className="mr-2" />
            Start Interview
          </Button>
        </div>

        <div className="mt-4 text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            By proceeding, you agree to allow camera and microphone access for the interview
            session.
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
            Recording will start automatically and can be downloaded after completion.
          </p>
        </div>
      </Card>
    </div>
  );
};

export default InterviewStartScreen;
