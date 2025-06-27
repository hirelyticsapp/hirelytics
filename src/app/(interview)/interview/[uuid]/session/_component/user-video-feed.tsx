import { CameraOff } from 'lucide-react';
import React from 'react';

import { cn } from '@/lib/utils';

interface UserVideoFeedProps {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  isCameraOff: boolean;
  isUserSpeaking: boolean;
}

const UserVideoFeed: React.FC<UserVideoFeedProps> = ({ videoRef, isCameraOff, isUserSpeaking }) => {
  return (
    <div
      className={cn(
        'relative w-full h-full bg-gray-900 rounded-lg overflow-hidden',
        isUserSpeaking && 'ring-4 ring-blue-500 ring-opacity-75 animate-pulse'
      )}
    >
      {!isCameraOff ? (
        <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-gray-800">
          <div className="text-center">
            <CameraOff size={48} className="text-gray-400 mx-auto mb-2" />
            <p className="text-gray-400">Camera is off</p>
          </div>
        </div>
      )}

      {/* User label */}
      <div className="absolute bottom-4 left-4 bg-black bg-opacity-50 px-2 py-1 rounded">
        <span className="text-white text-sm font-medium">You</span>
      </div>
    </div>
  );
};

export default UserVideoFeed;
